document.addEventListener('DOMContentLoaded', () => {
    // Start the test as soon as the page loads
    fetchQuestions();

    // Attach event listeners to buttons
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('submit-btn').addEventListener('click', confirmSubmission);
});

// Global variables to hold test state
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;

function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
            alert('Time is up! Submitting your test automatically.');
            submitTest();
        }
    }, 1000);
}

async function fetchQuestions() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('question-container').innerHTML = '<p class="text-center text-gray-500">Loading your personalized test...</p>';

    try {
        // NOTE: Use your local server for testing, and your live Render URL for deployment.
        const apiBaseUrl = 'http://localhost:5000'; 
        // const apiBaseUrl = 'https://aptitude-app-server-backend.onrender.com';

        const res = await fetch(`${apiBaseUrl}/api/questions/test`, {
            method: 'GET',
            headers: { 'x-auth-token': token },
        });

        if (!res.ok) throw new Error('Failed to load test questions.');
        
        questions = await res.json();
        if (questions.length === 0) {
             document.getElementById('question-container').innerHTML = '<p class="text-center text-red-500">Could not load questions. The question bank might be empty.</p>';
             document.getElementById('next-btn').style.display = 'none';
             document.getElementById('submit-btn').style.display = 'none';
             return;
        }
        
        const tenMinutes = 60 * 10;
        const timerDisplay = document.getElementById('timer');
        startTimer(tenMinutes, timerDisplay);
        displayQuestion();

    } catch (err) {
        console.error(err);
        document.getElementById('question-container').innerHTML = `<p class="text-center text-red-500">${err.message}</p>`;
    }
}

function displayQuestion() {
    const questionContainer = document.getElementById('question-container');
    const question = questions[currentQuestionIndex];
    
    if (!question) return;

    let optionsHtml = '';
    question.options.forEach((option, index) => {
        const optionId = `option-${index}`;
        // Check if this option was previously selected
        const isChecked = userAnswers[question._id] === option ? 'checked' : '';
        optionsHtml += `
            <label for="${optionId}" class="block p-3 my-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                <input type="radio" id="${optionId}" name="option" value="${option}" class="mr-3" ${isChecked}>
                ${option}
            </label>
        `;
    });

    questionContainer.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 text-gray-800">${currentQuestionIndex + 1}. ${question.questionText.replace(/\n/g, '<br>')}</h2>
        <div class="options-container">${optionsHtml}</div>
    `;

    document.getElementById('progress-bar').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    document.getElementById('submit-btn').style.display = 'none'; // Hide submit until the last question
    document.getElementById('next-btn').style.display = 'inline-block';
}

function saveAnswer() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        userAnswers[questions[currentQuestionIndex]._id] = selectedOption.value;
    }
}

function nextQuestion() {
    saveAnswer();

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        document.getElementById('next-btn').style.display = 'none'; // Hide next button
        document.getElementById('submit-btn').style.display = 'inline-block'; // Show submit button
        alert('You have reached the last question. Click Submit to finish the test.');
    }
}

function confirmSubmission() {
    if (confirm('Are you sure you want to submit your test?')) {
        submitTest();
    }
}

async function submitTest() {
    clearInterval(timerInterval); // Stop the timer
    saveAnswer(); // Save the answer to the final question

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Redirecting to login.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const apiBaseUrl = 'http://localhost:5000'; 
        // const apiBaseUrl = 'https://aptitude-app-server-backend.onrender.com';

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

        window.location.href = 'result.html';

    } catch (err) {
        console.error(err);
        alert(`An error occurred: ${err.message}`);
    }
}

