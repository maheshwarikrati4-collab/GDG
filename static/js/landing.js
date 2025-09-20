// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 2000);

    // Modal functionality
    const loginModal = document.getElementById('loginModal');
    const profileModal = document.getElementById('profileModal');
    const loginBtn = document.getElementById('loginBtn');
    const startQuestBtn = document.getElementById('startQuestBtn');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    // Open login modal
    function openLoginModal() {
        loginModal.style.display = 'flex';
        loginModal.classList.add('active');
    }
    
    // Close modal
    function closeModal(modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    
    // Event listeners
    loginBtn.addEventListener('click', openLoginModal);
    startQuestBtn.addEventListener('click', openLoginModal);
    
    modalCloses.forEach(close => {
        close.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        
        if (!email || !role) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, role })
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeModal(loginModal);
                profileModal.style.display = 'flex';
                profileModal.classList.add('active');
                showNotification('Welcome to MENTORA! 🎮', 'success');
            } else {
                showNotification(result.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(profileForm);
        const profileData = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/submit-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showLevelUpAnimation(1, 25);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 3000);
            } else {
                showNotification('Profile setup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Profile submission error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    });
    
    // Floating animation for cards
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        const delay = parseFloat(card.dataset.floatDelay) || 0;
        card.style.animationDelay = `${delay}s`;
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
});

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-card);
                border: 1px solid var(--accent-primary);
                border-radius: var(--border-radius-small);
                padding: 1rem 1.5rem;
                box-shadow: var(--neon-shadow);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 300px;
            }
            .notification-success {
                border-color: var(--accent-primary);
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            }
            .notification-error {
                border-color: var(--accent-pink);
                box-shadow: 0 0 20px rgba(255, 27, 107, 0.3);
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .notification-message {
                color: var(--text-primary);
                flex: 1;
            }
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover {
                color: var(--accent-primary);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function showLevelUpAnimation(level, xp) {
    const levelUpDiv = document.createElement('div');
    levelUpDiv.className = 'level-up-animation';
    levelUpDiv.innerHTML = `
        <div class="level-up-content">
            <h2 class="pixel-font">LEVEL UP!</h2>
            <div class="level-up-details">
                <span class="new-level">Level ${level}</span>
                <span class="xp-gained">+${xp} XP</span>
            </div>
            <div class="level-up-particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(levelUpDiv);
    
    // Remove after animation
    setTimeout(() => {
        levelUpDiv.remove();
    }, 3000);
}

// Add fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);