document.addEventListener('DOMContentLoaded', async () => {
    // Check if user has already completed the test
    const hasCompletedTest = localStorage.getItem('testCompleted');
    if (hasCompletedTest === 'true') {
        alert('You have already completed the test. You cannot retake it.');
        window.location.replace('result.html');
        return;
    }

    // Check with backend if user has already submitted
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const apiBaseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5000' 
                : 'https://aptitude-app-server-backend.onrender.com';
            
            const checkRes = await fetch(`${apiBaseUrl}/api/results/check-completion`, {
                method: 'GET',
                headers: {
                    'x-auth-token': token
                }
            });
            
            if (checkRes.ok) {
                const data = await checkRes.json();
                if (data.hasCompleted) {
                    localStorage.setItem('testCompleted', 'true');
                    alert('You have already completed the test. You cannot retake it.');
                    window.location.replace('result.html');
                    return;
                }
            }
        } catch (err) {
            console.error('Error checking test completion:', err);
        }
    }

    // Check if test was already in progress (page reload detection)
    const testInProgress = sessionStorage.getItem('testInProgress');
    if (testInProgress === 'true') {
        // Test was in progress and page was reloaded - auto-submit what was answered
        console.log('Page reloaded during test - auto-submitting current answers');
        
        // Get any answers that were saved
        const savedAnswers = JSON.parse(sessionStorage.getItem('currentAnswers') || '{}');
        
        // Auto-submit with current answers
        autoSubmitOnReload(savedAnswers);
        return;
    }

    // Set flag to indicate test is starting
    sessionStorage.setItem('testInProgress', 'true');
    sessionStorage.setItem('currentAnswers', '{}');
    
    // Start the test as soon as the page loads
    fetchQuestions();

    // Attach event listeners to buttons
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', previousQuestion);
    document.getElementById('submit-btn').addEventListener('click', showSubmitModal);
    
    // Add beforeunload warning to prevent accidental navigation
    window.addEventListener('beforeunload', (e) => {
        // Allow navigation if we're intentionally submitting
        if (allowNavigation) {
            return undefined;
        }
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
        return 'Are you sure you want to leave? Your test progress will be lost.';
    });

    // Anti-cheat measures
    initializeAntiCheat();
});

// Global variables to hold test state
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let markedForReview = []; // Track questions marked for review
let visitedQuestions = []; // Track which questions have been visited
let timerInterval;
const INITIAL_TEST_DURATION = 3600; // 1 hour in seconds
let timeRemaining = INITIAL_TEST_DURATION;
let allowNavigation = false; // Flag to allow navigation during submission

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        // Add warning states for timer
        if (timer <= 60) {
            display.classList.add('timer-danger');
        } else if (timer <= 180) {
            display.classList.add('timer-warning');
        }

        if (--timer < 0) {
            clearInterval(timerInterval);
            showTimeUpModal();
        }

        timeRemaining = timer;
    }, 1000);
}

// Create question indicators
function createQuestionIndicators() {
    const container = document.getElementById('question-indicators');
    if (!container) return;
    
    container.innerHTML = '';
    questions.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = 'question-indicator unanswered';
        indicator.textContent = index + 1;
        indicator.onclick = () => jumpToQuestion(index);
        container.appendChild(indicator);
    });
    updateQuestionIndicators();
}

// Update question indicators
function updateQuestionIndicators() {
    const indicators = document.querySelectorAll('.question-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('current', 'answered', 'unanswered');
        
        if (index === currentQuestionIndex) {
            indicator.classList.add('current');
        } else if (userAnswers[questions[index]._id]) {
            indicator.classList.add('answered');
        } else {
            indicator.classList.add('unanswered');
        }
    });
}

// Jump to specific question
function jumpToQuestion(index) {
    saveAnswer();
    
    // Mark current question as visited before jumping
    if (!visitedQuestions.includes(currentQuestionIndex)) {
        visitedQuestions.push(currentQuestionIndex);
    }
    
    currentQuestionIndex = index;
    displayQuestion();
    updateNavigationButtons();
    updateQuestionIndicators();
    updateQuestionNavigator(); // Update colors after jumping
}

async function fetchQuestions() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('question-container').innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="loading-spinner"></div>
        </div>
    `;

    try {
        const apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : 'https://aptitude-app-server-backend.onrender.com';

        const res = await fetch(`${apiBaseUrl}/api/questions/test`, {
            method: 'GET',
            headers: { 'x-auth-token': token },
        });

        if (!res.ok) throw new Error('Failed to load test questions.');
        
        questions = await res.json();
        if (questions.length === 0) {
            document.getElementById('question-container').innerHTML = '<p class="text-center text-red-500">Could not load questions. The question bank might be empty.</p>';
            document.getElementById('next-btn').style.display = 'none';
            document.getElementById('prev-btn').style.display = 'none';
            document.getElementById('submit-btn').style.display = 'none';
            return;
        }
        
        const timerDisplay = document.getElementById('timer');
        startTimer(timeRemaining, timerDisplay); // 1 hour
        displayQuestion();
        createQuestionIndicators();
        createQuestionStatusGrid(); // Create right sidebar question grid
        updateNavigationButtons();
        updateProgressText();

    } catch (err) {
        console.error(err);
        document.getElementById('question-container').innerHTML = `<p class="text-center text-red-500">${err.message}</p>`;
    }
}

function displayQuestion() {
    const questionContainer = document.getElementById('question-container');
    const question = questions[currentQuestionIndex];
    
    if (!question) return;

    // Add fade transition
    questionContainer.style.opacity = '0';
    
    setTimeout(() => {
        let optionsHtml = '';
        question.options.forEach((option, index) => {
            const optionId = `option-${index}`;
            const isChecked = userAnswers[question._id] === option ? 'checked' : '';
            const isSelected = userAnswers[question._id] === option ? 'selected' : '';
            
            optionsHtml += `
                <label for="${optionId}" class="option-label ${isSelected}">
                    <input type="radio" id="${optionId}" name="option" value="${option}" class="custom-radio" ${isChecked}>
                    <span class="ml-3">${option}</span>
                </label>
            `;
        });

        questionContainer.innerHTML = `
            <div class="question-meta">
                <span class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</span>
                <span class="question-type-badge">Multiple Choice</span>
            </div>
            <h2 class="question-text">${question.questionText}</h2>
            <div class="options-container space-y-3">${optionsHtml}</div>
        `;

        questionContainer.style.opacity = '1';

        // Add click handlers to option labels
        document.querySelectorAll('.option-label').forEach(label => {
            label.addEventListener('click', function() {
                document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }, 200);

    // Mark current question as visited when displayed
    if (!visitedQuestions.includes(currentQuestionIndex)) {
        visitedQuestions.push(currentQuestionIndex);
    }
    
    updateProgressBar();
    updateProgressText();
    updateQuestionIndicators();
    updateQuestionNavigator(); // Update navigator colors
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateProgressText() {
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        const answered = Object.keys(userAnswers).length;
        progressText.textContent = `${answered} of ${questions.length} completed`;
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // Previous button
    if (currentQuestionIndex === 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    // Next/Submit buttons
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

function saveAnswer() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        userAnswers[questions[currentQuestionIndex]._id] = selectedOption.value;
        // Save answers to sessionStorage for reload protection
        sessionStorage.setItem('currentAnswers', JSON.stringify(userAnswers));
        updateProgressText();
        updateQuestionNavigator(); // Update navigator in real-time
    }
}

function nextQuestion() {
    saveAnswer();
    
    // Mark current question as visited
    if (!visitedQuestions.includes(currentQuestionIndex)) {
        visitedQuestions.push(currentQuestionIndex);
    }

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateNavigationButtons();
        updateQuestionNavigator(); // Update colors when moving to next question
    }
}

function previousQuestion() {
    saveAnswer();
    
    // Mark current question as visited
    if (!visitedQuestions.includes(currentQuestionIndex)) {
        visitedQuestions.push(currentQuestionIndex);
    }
    
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateNavigationButtons();
        updateQuestionNavigator(); // Update colors when moving to previous question
    }
}

// Modal functions
function showSubmitModal() {
    saveAnswer();
    const modal = document.getElementById('submit-modal');
    const modalContent = document.getElementById('modal-content');
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 50);
}

function closeSubmitModal() {
    const modal = document.getElementById('submit-modal');
    const modalContent = document.getElementById('modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

function confirmSubmit() {
    submitTest();
}

function showTimeUpModal() {
    // Clear test session flag - time expired
    sessionStorage.removeItem('testInProgress');
    
    alert('Time is up! Submitting your test automatically.');
    submitTest();
}

// Add these functions to window for onclick handlers
window.closeSubmitModal = closeSubmitModal;
window.confirmSubmit = confirmSubmit;

async function submitTest() {
    clearInterval(timerInterval);
    saveAnswer();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Redirecting to login.');
        window.location.href = 'index.html';
        return;
    }

    // Show loading state
    const modal = document.getElementById('submit-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md mx-4">
                <div class="text-center">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p class="text-lg text-gray-600">Submitting your test...</p>
                </div>
            </div>
        `;
    }

    try {
        const apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : 'https://aptitude-app-server-backend.onrender.com';

        const res = await fetch(`${apiBaseUrl}/api/results/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ answers: userAnswers }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.msg || 'Failed to submit the test.');
        }

        // Get the result data from the response
        const resultData = await res.json();

        // Store test completion data for result page
        const timeTaken = INITIAL_TEST_DURATION - timeRemaining;
        localStorage.setItem('testResult', JSON.stringify({
            score: resultData.score || 0,
            totalQuestions: resultData.totalQuestions || questions.length,
            percentage: (resultData.percentage || 0).toFixed(2),
            timeTaken: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`,
            questionsAnswered: Object.keys(userAnswers).length,
            autoSubmitted: false
        }));

        // Clear test session flag - test completed successfully
        sessionStorage.removeItem('testInProgress');
        sessionStorage.removeItem('currentAnswers');
        
        // Mark test as completed to prevent retaking
        localStorage.setItem('testCompleted', 'true');
        
        // Allow navigation without confirmation dialog
        allowNavigation = true;
        
        // Use replace instead of href to prevent back navigation
        window.location.replace('result.html');

    } catch (err) {
        console.error(err);
        alert(`An error occurred: ${err.message}`);
        closeSubmitModal();
    }
}

// Auto-submit function when page is reloaded
async function autoSubmitOnReload(savedAnswers) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Redirecting to login.');
        sessionStorage.removeItem('testInProgress');
        sessionStorage.removeItem('currentAnswers');
        window.location.href = 'index.html';
        return;
    }

    // Show loading message
    document.body.innerHTML = `
        <div class="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Auto-Submitting Test</h2>
                <p class="text-gray-600">Page was reloaded. Submitting your answers...</p>
            </div>
        </div>
    `;

    try {
        const apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000' 
            : 'https://aptitude-app-server-backend.onrender.com';

        const res = await fetch(`${apiBaseUrl}/api/results/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ answers: savedAnswers }),
        });

        if (!res.ok) {
            throw new Error('Failed to submit the test.');
        }

        const resultData = await res.json();

        // Store result data
        localStorage.setItem('testResult', JSON.stringify({
            score: resultData.score || 0,
            totalQuestions: resultData.totalQuestions || 50,
            percentage: (resultData.percentage || 0).toFixed(2),
            timeTaken: 'N/A (Auto-submitted)',
            questionsAnswered: Object.keys(savedAnswers).length,
            autoSubmitted: true
        }));

        // Clear session flags
        sessionStorage.removeItem('testInProgress');
        sessionStorage.removeItem('currentAnswers');
        
        // Mark test as completed to prevent retaking
        localStorage.setItem('testCompleted', 'true');
        
        // Allow navigation without confirmation dialog
        allowNavigation = true;
        
        // Use replace to prevent back navigation to test page
        window.location.replace('result.html');

    } catch (err) {
        console.error('Auto-submit error:', err);
        alert('Failed to auto-submit test. Redirecting to login.');
        sessionStorage.removeItem('testInProgress');
        sessionStorage.removeItem('currentAnswers');
        
        // Allow navigation without confirmation dialog
        allowNavigation = true;
        window.location.href = 'index.html';
    }
}

// Create question status grid in right sidebar
function createQuestionStatusGrid() {
    const container = document.getElementById('question-status-grid');
    if (!container) return;
    
    container.innerHTML = '';
    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'w-8 h-8 rounded flex items-center justify-center text-gray-700 font-semibold text-xs transition-all duration-200 hover:scale-110 bg-white border-2 border-gray-300';
        btn.textContent = index + 1;
        btn.onclick = () => jumpToQuestion(index);
        btn.id = `status-q-${index}`;
        container.appendChild(btn);
    });
}

// Update question navigator
function updateQuestionNavigator() {
    questions.forEach((question, index) => {
        const statusBtn = document.getElementById(`status-q-${index}`);
        
        // Update status button colors on right sidebar
        if (statusBtn) {
            // Remove all color classes
            statusBtn.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-300', 'bg-white', 'text-white', 'text-gray-800', 'text-gray-700', 'border-2', 'border-gray-300');
            
            // Apply color based on status - priority: marked > answered > visited but not answered > not visited
            if (markedForReview.includes(index)) {
                statusBtn.classList.add('bg-yellow-300', 'text-gray-800');
            } else if (userAnswers[question._id]) {
                statusBtn.classList.add('bg-green-500', 'text-white');
            } else if (visitedQuestions.includes(index)) {
                // Visited but not answered
                statusBtn.classList.add('bg-red-500', 'text-white');
            } else {
                // Not visited yet - white
                statusBtn.classList.add('bg-white', 'border-2', 'border-gray-300', 'text-gray-700');
            }
        }
    });
}

// Add these utility functions
function markForReview() {
    const index = markedForReview.indexOf(currentQuestionIndex);
    
    if (index > -1) {
        // Already marked, remove it
        markedForReview.splice(index, 1);
    } else {
        // Not marked, add it
        markedForReview.push(currentQuestionIndex);
    }
    
    // Update the navigator to reflect the change
    updateQuestionNavigator();
}

function clearAnswer() {
    const questionId = questions[currentQuestionIndex]._id;
    delete userAnswers[questionId];
    
    // Also remove from marked for review if it was marked
    const markedIndex = markedForReview.indexOf(currentQuestionIndex);
    if (markedIndex > -1) {
        markedForReview.splice(markedIndex, 1);
    }
    
    // Clear radio selection
    document.querySelectorAll('input[name="option"]').forEach(radio => {
        radio.checked = false;
    });
    document.querySelectorAll('.option-label').forEach(label => {
        label.classList.remove('selected');
    });
    
    updateQuestionNavigator();
    updateProgressText();
}

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('aside:first-of-type');
    sidebar.classList.toggle('active');
}

// Anti-cheat system
let tabSwitchCount = 0;
let cheatingDetected = false;

function initializeAntiCheat() {
    // Detect tab/window switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showCheatingWarning('Right-click is disabled during the test.');
        return false;
    });
    
    // Disable certain keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (developer tools)
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
            (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
            (e.ctrlKey && e.shiftKey && e.keyCode === 67) // Ctrl+Shift+C
        ) {
            e.preventDefault();
            showCheatingWarning('Developer tools are disabled during the test.');
            tabSwitchCount++;
            if (tabSwitchCount >= 2) {
                triggerAntiCheatSubmit('Multiple attempts to open developer tools detected.');
            }
            return false;
        }
    });
    
    // Detect if developer tools are open
    let devtoolsOpen = false;
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                triggerAntiCheatSubmit('Developer tools detected.');
            }
        }
    }, 1000);
}

function handleVisibilityChange() {
    if (document.hidden && !cheatingDetected) {
        tabSwitchCount++;
        
        if (tabSwitchCount === 1) {
            showCheatingWarning('Warning: Tab switching detected. Your test will be auto-submitted if you switch again.');
        } else if (tabSwitchCount >= 2) {
            triggerAntiCheatSubmit('Multiple tab switches detected.');
        }
    }
}

function handleWindowBlur() {
    if (!cheatingDetected && !document.hidden) {
        tabSwitchCount++;
        
        if (tabSwitchCount === 1) {
            showCheatingWarning('Warning: Window switching detected. Your test will be auto-submitted if you switch again.');
        } else if (tabSwitchCount >= 2) {
            triggerAntiCheatSubmit('Multiple window switches detected.');
        }
    }
}

function showCheatingWarning(message) {
    // Create warning toast
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
        z-index: 10000;
        font-weight: 600;
        font-size: 14px;
        max-width: 400px;
        text-align: center;
        animation: slideDown 0.3s ease-out;
    `;
    warning.textContent = message;
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => warning.remove(), 300);
    }, 4000);
}

function triggerAntiCheatSubmit(reason) {
    if (cheatingDetected) return; // Prevent multiple triggers
    cheatingDetected = true;
    
    console.log('Anti-cheat triggered:', reason);
    
    // Clear anti-cheat listeners to prevent multiple triggers
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    
    // Show full-screen warning
    document.body.innerHTML = `
        <div class="fixed inset-0 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4 border-2 border-red-300">
                <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Test Auto-Submitted</h2>
                <p class="text-gray-600 mb-4">${reason}</p>
                <p class="text-sm text-red-600 font-semibold">Your test has been automatically submitted due to suspicious activity.</p>
                <div class="loading-spinner mx-auto mt-6"></div>
            </div>
        </div>
    `;
    
    // Save current answer and submit
    saveAnswer();
    
    // Allow navigation without confirmation dialog
    allowNavigation = true;
    
    // Auto-submit the test
    setTimeout(() => {
        const savedAnswers = JSON.parse(sessionStorage.getItem('currentAnswers') || '{}');
        autoSubmitOnReload(savedAnswers);
    }, 2000);
}