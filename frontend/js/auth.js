document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    // Determine API base URL based on environment
    const apiBaseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://aptitude-app-server-backend.onrender.com';

    // Smooth form transitions
    function switchForms(hideContainer, showContainer) {
        hideContainer.style.opacity = '0';
        hideContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            hideContainer.classList.add('hidden');
            showContainer.classList.remove('hidden');
            showContainer.style.opacity = '0';
            showContainer.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                showContainer.style.opacity = '1';
                showContainer.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    // Switch to Register form
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms(loginContainer, registerContainer);
    });

    // Switch to Login form
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms(registerContainer, loginContainer);
    });

    // Enhanced button loading state
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
            `;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
        }
    }

    // Enhanced message display
    function showMessage(element, message, isError = true) {
        element.textContent = message;
        element.style.opacity = '1';
        element.className = `mt-4 text-center font-medium transition-opacity duration-300 ${isError ? 'text-red-500' : 'text-green-500'}`;
        
        if (!isError) {
            setTimeout(() => {
                element.style.opacity = '0';
            }, 3000);
        }
    }

    // Handle Login
    if (loginForm) {
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.dataset.originalText = submitButton.textContent;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            setButtonLoading(submitButton, true);
            loginMessage.style.opacity = '0';

            try {
                const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Login failed');

                localStorage.setItem('token', data.token);
                showMessage(loginMessage, 'Login successful! Redirecting...', false);
                
                setTimeout(() => {
                    window.location.href = 'test.html';
                }, 1000);

            } catch (err) {
                showMessage(loginMessage, err.message);
                setButtonLoading(submitButton, false);
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.dataset.originalText = submitButton.textContent;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            // Basic validation
            if (password.length < 6) {
                showMessage(registerMessage, 'Password must be at least 6 characters');
                return;
            }

            setButtonLoading(submitButton, true);
            registerMessage.style.opacity = '0';

            try {
                const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Registration failed');

                localStorage.setItem('token', data.token);
                showMessage(registerMessage, 'Registration successful! Redirecting...', false);
                
                setTimeout(() => {
                    window.location.href = 'test.html';
                }, 1000);

            } catch (err) {
                showMessage(registerMessage, err.message);
                setButtonLoading(submitButton, false);
            }
        });
    }

    // Initialize form containers with proper opacity
    loginContainer.style.transition = 'all 0.3s ease-out';
    registerContainer.style.transition = 'all 0.3s ease-out';
});