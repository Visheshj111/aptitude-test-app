document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    
    // Display test statistics if available
    const testData = localStorage.getItem('testData');
    if (testData) {
        const data = JSON.parse(testData);
        const timeTakenEl = document.getElementById('time-taken');
        const questionsAnsweredEl = document.getElementById('questions-answered');
        
        if (timeTakenEl) timeTakenEl.textContent = data.timeTaken;
        if (questionsAnsweredEl) questionsAnsweredEl.textContent = data.questionsAnswered;
        
        // Clear the data after displaying
        localStorage.removeItem('testData');
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