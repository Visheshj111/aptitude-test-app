document.addEventListener('DOMContentLoaded', () => {
    // Start the test as soon as the page loads
    fetchQuestions();

    // Attach event listeners to buttons
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', previousQuestion);
    document.getElementById('submit-btn').addEventListener('click', showSubmitModal);
});

// Global variables to hold test state
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;
let timeRemaining = 600; // 10 minutes in seconds

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
    currentQuestionIndex = index;
    displayQuestion();
    updateNavigationButtons();
    updateQuestionIndicators();
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
        startTimer(600, timerDisplay); // 10 minutes
        displayQuestion();
        createQuestionIndicators();
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

    updateProgressBar();
    updateProgressText();
    updateQuestionIndicators();
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
        updateProgressText();
    }
}

function nextQuestion() {
    saveAnswer();

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        updateNavigationButtons();
    }
}

function previousQuestion() {
    saveAnswer();
    
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        updateNavigationButtons();
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

        // Store test completion data for result page
        const timeTaken = 600 - timeRemaining;
        localStorage.setItem('testData', JSON.stringify({
            timeTaken: `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`,
            questionsAnswered: `${Object.keys(userAnswers).length}/${questions.length}`
        }));

        window.location.href = 'result.html';

    } catch (err) {
        console.error(err);
        alert(`An error occurred: ${err.message}`);
        closeSubmitModal();
    }
}

// Create question navigator in sidebar
function createQuestionNavigator() {
    const container = document.getElementById('question-navigator');
    if (!container) return;
    
    container.innerHTML = '';
    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'question-nav-btn unanswered';
        btn.textContent = index + 1;
        btn.onclick = () => jumpToQuestion(index);
        btn.id = `nav-q-${index}`;
        container.appendChild(btn);
    });
    updateQuestionNavigator();
}

// Update question navigator
function updateQuestionNavigator() {
    questions.forEach((question, index) => {
        const btn = document.getElementById(`nav-q-${index}`);
        if (!btn) return;
        
        btn.classList.remove('current', 'answered', 'unanswered', 'marked');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
            document.getElementById('current-q-number').textContent = index + 1;
        } else if (userAnswers[question._id]) {
            btn.classList.add('answered');
        } else {
            btn.classList.add('unanswered');
        }
    });
    
    // Update counts
    const answered = Object.keys(userAnswers).length;
    document.getElementById('answered-count').textContent = answered;
    document.getElementById('unanswered-count').textContent = questions.length - answered;
}

// Add these utility functions
function markForReview() {
    const btn = document.getElementById(`nav-q-${currentQuestionIndex}`);
    btn.classList.add('marked');
    // You can store this in a separate array if needed
}

function clearAnswer() {
    const questionId = questions[currentQuestionIndex]._id;
    delete userAnswers[questionId];
    
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