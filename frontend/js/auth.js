const API_URL = 'http://localhost:5000/api/auth'; // Backend server URL

const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        
        if (res.ok) {
            messageDiv.textContent = 'Registration successful! Redirecting...';
            messageDiv.className = 'text-green-500';
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => window.location.href = 'test.html', 1500);
        } else {
            messageDiv.textContent = data.message || 'Registration failed.';
             messageDiv.className = 'text-red-500';
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.className = 'text-red-500';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (res.ok) {
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'text-green-500';
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => window.location.href = 'test.html', 1500);
        } else {
            messageDiv.textContent = data.message || 'Login failed.';
            messageDiv.className = 'text-red-500';
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.className = 'text-red-500';
    }
});

