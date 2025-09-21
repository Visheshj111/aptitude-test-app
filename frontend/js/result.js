document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    const resultContainer = document.getElementById('result-container');
    const logoutBtn = document.getElementById('logout-btn');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    async function fetchResult() {
        try {
            const res = await fetch(`${API_BASE_URL}/results`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
             if (!res.ok) {
                 if(res.status === 401) window.location.href = 'index.html';
                 throw new Error('Failed to fetch result.');
            }

            const result = await res.json();
            displayResult(result);

        } catch (error) {
            resultContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        }
    }

    function displayResult(result) {
        const percentage = result.percentage.toFixed(2);
        let feedback = '';
        let colorClass = '';

        if (percentage >= 75) {
            feedback = "Excellent Performance!";
            colorClass = "text-green-600";
        } else if (percentage >= 50) {
            feedback = "Good Job, Room for Improvement.";
            colorClass = "text-yellow-600";
        } else {
            feedback = "Needs Improvement. Keep Practicing!";
            colorClass = "text-red-600";
        }

        resultContainer.innerHTML = `
            <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <p class="text-lg text-gray-700">Your Score</p>
                <p class="text-5xl font-bold text-indigo-600 my-2">${result.score} / ${result.totalQuestions}</p>
                <p class="text-xl font-semibold ${colorClass}">${percentage}%</p>
            </div>
            <p class="text-xl font-medium mt-6 ${colorClass}">${feedback}</p>
        `;
    }
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    fetchResult();
});

