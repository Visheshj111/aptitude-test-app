document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    // Switch to Register form
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.classList.add('hidden');
        registerContainer.classList.remove('hidden');
    });

    // Switch to Login form
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            loginMessage.textContent = '';

            try {
                // --- THIS IS WHERE THE LOCAL SERVER ADDRESS GOES ---
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Login failed');

                localStorage.setItem('token', data.token);
                window.location.href = 'test.html';

            } catch (err) {
                loginMessage.textContent = err.message;
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            registerMessage.textContent = '';

            try {
                // --- AND IT GOES HERE AS WELL ---
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.msg || 'Registration failed');

                localStorage.setItem('token', data.token);
                window.location.href = 'test.html';

            } catch (err) {
                registerMessage.textContent = err.message;
            }
        });
    }
});

