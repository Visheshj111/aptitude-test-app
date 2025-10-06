document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    // Determine API base URL based on environment
    const apiBaseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://aptitude-app-server-backend.onrender.com';

    // Valid college email domains
    const validEmailDomains = ['@iccs.ac.in', '@iimp.edu.in'];

    // Function to validate college email
    function isValidCollegeEmail(email) {
        return validEmailDomains.some(domain => email.toLowerCase().endsWith(domain));
    }

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

    // Handle Registration
    if (registerForm) {
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.dataset.originalText = submitButton.textContent;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            // Validate college email domain
            if (!isValidCollegeEmail(email)) {
                showMessage(registerMessage, 'Please use a valid college email address ending with @iccs.ac.in or @iimp.edu.in');
                return;
            }
            
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
                    window.location.href = 'instructions.html';
                }, 1000);

            } catch (err) {
                showMessage(registerMessage, err.message);
                setButtonLoading(submitButton, false);
            }
        });
    }
});