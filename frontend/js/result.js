document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    // Add functionality to the logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear the user's token from the browser's storage
            localStorage.removeItem('token');
            // Redirect the user back to the login page
            window.location.href = 'index.html';
        });
    }
});