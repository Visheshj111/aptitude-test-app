document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://aptitude-app-server-backend.onrender.com';
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const sections = ['Verbal Ability', 'Quantitative Aptitude', 'Logical Reasoning'];
    let currentSectionIndex = 0;
    let allQuestions = {};
    let userAnswers = {};
    let timerInterval;

    const questionContainer = document.getElementById('question-container');
    const sectionTabsContainer = document.getElementById('section-tabs');
    const submitBtn = document.getElementById('submit-btn');
    const timerEl = document.getElementById('timer');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelSubmitBtn = document.getElementById('cancel-submit');
    const confirmSubmitBtn = document.getElementById('confirm-submit');

    function startTimer(duration) {
        let timer = duration, minutes, seconds;
        timerInterval = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            timerEl.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(timerInterval);
                alert('Time is up!');
                submitTest();
            }
        }, 1000);
    }
    
    async function fetchQuestions(section) {
        try {
            questionContainer.innerHTML = '<p class="text-center text-gray-500">Loading questions...</p>';
            const res = await fetch(`${API_BASE_URL}/questions/${encodeURIComponent(section)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                 if(res.status === 401) window.location.href = 'index.html';
                 throw new Error(`Failed to fetch questions for ${section}`);
            }
            const questions = await res.json();
            allQuestions[section] = questions;
            return questions;

        } catch (error) {
            console.error(error);
            questionContainer.innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
            return [];
        }
    }

    function renderQuestions(section) {
        const questions = allQuestions[section];
        if (!questions || questions.length === 0) {
            questionContainer.innerHTML = `<p class="text-center">No questions available for this section.</p>`;
            return;
        }

        let questionsHtml = '';
        questions.forEach((q, index) => {
            questionsHtml += `
                <div class="question my-6 p-4 border rounded-lg">
                    <p class="font-semibold mb-3">${index + 1}. ${q.questionText}</p>
                    <div class="options space-y-2">
                        ${q.options.map((option, i) => `
                            <div>
                                <input type="radio" id="q${q._id}_opt${i}" name="q_${q._id}" value="${option}" class="mr-2" ${userAnswers[q._id] === option ? 'checked' : ''}>
                                <label for="q${q._id}_opt${i}">${option}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        questionContainer.innerHTML = questionsHtml;

        document.querySelectorAll('.options input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const questionId = e.target.name.split('_')[1];
                userAnswers[questionId] = e.target.value;
            });
        });
    }

    function renderSectionTabs() {
        sectionTabsContainer.innerHTML = sections.map((section, index) => `
            <button class="section-tab py-2 px-4 font-semibold rounded-t-lg ${index === currentSectionIndex ? 'active' : ''}" data-index="${index}">
                ${section}
            </button>
        `).join('');

        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                const newIndex = parseInt(e.target.dataset.index);
                if (newIndex === currentSectionIndex) return;

                currentSectionIndex = newIndex;
                const section = sections[currentSectionIndex];
                
                document.querySelector('.section-tab.active').classList.remove('active');
                e.target.classList.add('active');

                if (!allQuestions[section]) {
                    await fetchQuestions(section);
                }
                renderQuestions(section);
            });
        });
    }

    async function submitTest() {
        clearInterval(timerInterval);
        try {
            const res = await fetch(`${API_BASE_URL}/results/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers: userAnswers })
            });

            if (!res.ok) {
                throw new Error('Failed to submit the test');
            }
            window.location.href = 'result.html';

        } catch (error) {
            console.error(error);
            alert('An error occurred while submitting. Please try again.');
        } finally {
            confirmModal.classList.add('hidden');
        }
    }
    
    submitBtn.addEventListener('click', () => {
        confirmModal.classList.remove('hidden');
    });

    cancelSubmitBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });
    
    confirmSubmitBtn.addEventListener('click', submitTest);

    async function initializeTest() {
        renderSectionTabs();
        const initialSection = sections[currentSectionIndex];
        await fetchQuestions(initialSection);
        renderQuestions(initialSection);
        startTimer(60 * 10); // 10 minutes timer
    }

    initializeTest();
});

