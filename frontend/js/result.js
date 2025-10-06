document.addEventListener('DOMContentLoaded', () => {
    // Clear test session flag - user reached results page successfully
    sessionStorage.removeItem('testInProgress');
    
    const logoutBtn = document.getElementById('logout-btn');
    
    // Display test results if available
    const testResult = localStorage.getItem('testResult');
    if (testResult) {
        const data = JSON.parse(testResult);
        
        // Display score
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = `${data.score}/${data.totalQuestions}`;
        
        // Display percentage
        const percentageEl = document.getElementById('percentage-display');
        if (percentageEl) percentageEl.textContent = `${data.percentage}%`;
        
        // Display time taken
        const timeTakenEl = document.getElementById('time-taken');
        if (timeTakenEl) timeTakenEl.textContent = data.timeTaken;
        
        // Display questions answered
        const questionsAnsweredEl = document.getElementById('questions-answered');
        if (questionsAnsweredEl) questionsAnsweredEl.textContent = `${data.questionsAnswered}/${data.totalQuestions}`;
        
        // Show auto-submit notice if applicable
        if (data.autoSubmitted) {
            const noticeEl = document.getElementById('auto-submit-notice');
            if (noticeEl) noticeEl.style.display = 'block';
        }
        
        // Clear the data after displaying
        localStorage.removeItem('testResult');
    }

    // Enhanced logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Add loading state
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Logging out...
            `;
            
            // Clear storage and redirect
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('testData');
                localStorage.removeItem('testResult');
                window.location.href = 'index.html';
            }, 500);
        });
    }

    // Add confetti effect on page load
    const confettiElements = document.querySelectorAll('.confetti');
    confettiElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.5}s`;
    });
});