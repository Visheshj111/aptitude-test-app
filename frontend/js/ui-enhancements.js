// UI Enhancement Functions

// Smooth page transitions
function initPageTransitions() {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('animate-fadeIn');
    });
}

// Enhanced form validation with visual feedback
function enhanceFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.validity.valid) {
                input.classList.remove('border-red-500');
                input.classList.add('border-green-500');
            } else {
                input.classList.remove('border-green-500');
                input.classList.add('border-red-500');
            }
        });
        
        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500') || input.classList.contains('border-green-500')) {
                input.classList.remove('border-red-500', 'border-green-500');
            }
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Loading states
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Processing...
    `;
    
    return () => {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Tooltip functionality
function initTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    
    elements.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
            
            setTimeout(() => tooltip.classList.add('show'), 10);
        });
        
        el.addEventListener('mouseleave', () => {
            document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
        });
    });
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    enhanceFormValidation();
    addRippleEffect();
    initTooltips();
});