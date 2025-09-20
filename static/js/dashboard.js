// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    loadUserData();
    setupNavigationListeners();
    setupChatFunctionality();
    loadInternships();
    loadCommunicationScenarios();
});

function initializeDashboard() {
    // Setup sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.dataset.section + '-section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function loadUserData() {
    // Simulate loading user data
    // In real app, this would fetch from server
    const userData = {
        name: 'Player',
        level: 3,
        currentXP: 245,
        nextLevelXP: 300,
        role: 'Student Adventurer'
    };
    
    updateUserInterface(userData);
}

function updateUserInterface(userData) {
    // Update user level display
    const userLevelElements = document.querySelectorAll('#userLevel');
    userLevelElements.forEach(el => el.textContent = userData.level);
    
    // Update XP progress
    const xpProgress = (userData.currentXP / userData.nextLevelXP) * 100;
    const xpBar = document.getElementById('xpProgress');
    if (xpBar) {
        xpBar.style.width = `${xpProgress}%`;
    }
    
    const currentXPElement = document.getElementById('currentXP');
    const nextLevelXPElement = document.getElementById('nextLevelXP');
    if (currentXPElement) currentXPElement.textContent = userData.currentXP;
    if (nextLevelXPElement) nextLevelXPElement.textContent = userData.nextLevelXP;
    
    // Update profile info
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    if (profileName) profileName.textContent = userData.name;
    if (profileRole) profileRole.textContent = userData.role;
}

function setupNavigationListeners() {
    // Quick action buttons
    const quickActionButtons = document.querySelectorAll('[onclick]');
    quickActionButtons.forEach(button => {
        const onclickValue = button.getAttribute('onclick');
        button.removeAttribute('onclick');
        
        if (onclickValue.includes('startNewQuest')) {
            button.addEventListener('click', startNewQuest);
        } else if (onclickValue.includes('openAIChat')) {
            button.addEventListener('click', openAIChat);
        } else if (onclickValue.includes('logout')) {
            button.addEventListener('click', logout);
        }
    });
}

function setupChatFunctionality() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    // Add typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (result.response) {
            addMessageToChat(result.response, 'ai');
            
            // If there are recommendations, display them
            if (result.recommendations) {
                displayInternshipRecommendations(result.recommendations);
            }
        } else {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
        }
    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.remove();
        addMessageToChat('Network error. Please check your connection and try again.', 'ai');
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <p>AI is thinking...</p>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

async function loadInternships() {
    const internshipsGrid = document.getElementById('internshipsGrid');
    if (!internshipsGrid) return;
    
    // Sample internships data (in real app, this would come from server)
    const internships = [
        {
            id: 1,
            title: "Software Engineering Intern",
            company: "TechCorp",
            location: "San Francisco, CA",
            description: "Work on full-stack web development projects using Python, JavaScript, and React",
            match_score: 85,
            stipend: "$2500/month",
            duration: "3 months",
            required_skills: ["Python", "JavaScript", "React", "Git"]
        },
        {
            id: 2,
            title: "Data Science Intern",
            company: "DataFlow Analytics",
            location: "New York, NY",
            description: "Analyze large datasets and build machine learning models for business insights",
            match_score: 78,
            stipend: "$3000/month",
            duration: "4 months",
            required_skills: ["Python", "Machine Learning", "SQL", "Statistics"]
        },
        {
            id: 3,
            title: "UX Design Intern",
            company: "DesignStudio",
            location: "Austin, TX",
            description: "Create user-centered designs and conduct usability testing",
            match_score: 65,
            stipend: "$2200/month",
            duration: "4 months",
            required_skills: ["Design Thinking", "Figma", "User Research", "Prototyping"]
        }
    ];
    
    internshipsGrid.innerHTML = internships.map(internship => `
        <div class="internship-card" data-match="${internship.match_score}">
            <div class="card-header">
                <div class="internship-header">
                    <h3>${internship.title}</h3>
                    <div class="match-score ${getMatchScoreClass(internship.match_score)}">
                        ${internship.match_score}% Match
                    </div>
                </div>
                <div class="company-info">
                    <span class="company">${internship.company}</span>
                    <span class="location">📍 ${internship.location}</span>
                </div>
            </div>
            <div class="card-content">
                <p class="description">${internship.description}</p>
                <div class="internship-details">
                    <div class="detail-item">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${internship.duration}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Stipend:</span>
                        <span class="detail-value">${internship.stipend}</span>
                    </div>
                </div>
                <div class="skills-required">
                    <h4>Required Skills:</h4>
                    <div class="skills-list">
                        ${internship.required_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-small" onclick="applyToInternship(${internship.id})">
                    Apply Now
                </button>
                <button class="btn btn-outline btn-small" onclick="saveInternship(${internship.id})">
                    Save for Later
                </button>
            </div>
        </div>
    `).join('');
    
    // Add CSS for internship cards if not already present
    if (!document.querySelector('#internship-styles')) {
        const styles = document.createElement('style');
        styles.id = 'internship-styles';
        styles.textContent = `
            .internships-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }
            .internship-card {
                background: var(--bg-card);
                border: 1px solid rgba(0, 255, 136, 0.2);
                border-radius: var(--border-radius);
                overflow: hidden;
                transition: var(--transition);
            }
            .internship-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--neon-shadow);
            }
            .internship-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.5rem;
            }
            .internship-header h3 {
                color: var(--accent-primary);
                margin: 0;
                font-size: 1.2rem;
            }
            .match-score {
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: bold;
            }
            .match-high { background: rgba(0, 255, 136, 0.2); color: var(--accent-primary); }
            .match-medium { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
            .match-low { background: rgba(255, 27, 107, 0.2); color: var(--accent-pink); }
            .company-info {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            .company {
                color: var(--text-primary);
                font-weight: 500;
            }
            .location {
                color: var(--text-muted);
                font-size: 0.9rem;
            }
            .description {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .internship-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            .detail-label {
                color: var(--text-muted);
                font-size: 0.9rem;
            }
            .detail-value {
                color: var(--text-primary);
                font-weight: 500;
            }
            .skills-required h4 {
                color: var(--text-primary);
                font-size: 1rem;
                margin-bottom: 0.75rem;
            }
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .skill-tag {
                background: rgba(0, 234, 255, 0.1);
                color: var(--accent-secondary);
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                border: 1px solid rgba(0, 234, 255, 0.2);
            }
            .card-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(styles);
    }
}

async function loadCommunicationScenarios() {
    const scenariosGrid = document.getElementById('scenariosGrid');
    if (!scenariosGrid) return;
    
    try {
        const response = await fetch('/api/communication/scenarios');
        const result = await response.json();
        
        if (result.success && result.scenarios) {
            displayCommunicationScenarios(result.scenarios);
        }
    } catch (error) {
        console.error('Error loading scenarios:', error);
        // Fallback to sample data
        const sampleScenarios = [
            {
                id: 'job_interview',
                title: 'Job Interview Practice',
                description: 'Practice common interview questions and get feedback on your responses',
                difficulty: 'intermediate',
                xp_reward: 25
            },
            {
                id: 'networking_event',
                title: 'Networking Event Simulation',
                description: 'Practice introducing yourself and making professional connections',
                difficulty: 'beginner',
                xp_reward: 15
            },
            {
                id: 'salary_negotiation',
                title: 'Salary Negotiation',
                description: 'Learn how to negotiate salary and benefits effectively',
                difficulty: 'advanced',
                xp_reward: 35
            }
        ];
        displayCommunicationScenarios(sampleScenarios);
    }
}

function displayCommunicationScenarios(scenarios) {
    const scenariosGrid = document.getElementById('scenariosGrid');
    if (!scenariosGrid) return;
    
    scenariosGrid.innerHTML = scenarios.map(scenario => `
        <div class="training-card" data-difficulty="${scenario.difficulty}">
            <div class="card-header">
                <h3>${scenario.title}</h3>
                <div class="difficulty-badge difficulty-${scenario.difficulty}">
                    ${scenario.difficulty}
                </div>
            </div>
            <div class="card-content">
                <p>${scenario.description}</p>
                <div class="scenario-rewards">
                    <span class="xp-reward">+${scenario.xp_reward} XP</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-full" onclick="startScenario('${scenario.id}')">
                    Start Training
                </button>
            </div>
        </div>
    `).join('');
    
    // Add CSS for training cards if not already present
    if (!document.querySelector('#training-styles')) {
        const styles = document.createElement('style');
        styles.id = 'training-styles';
        styles.textContent = `
            .training-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }
            .training-card {
                background: var(--bg-card);
                border: 1px solid rgba(168, 85, 247, 0.2);
                border-radius: var(--border-radius);
                overflow: hidden;
                transition: var(--transition);
            }
            .training-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
            }
            .difficulty-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: bold;
                text-transform: capitalize;
            }
            .difficulty-beginner { background: rgba(0, 255, 136, 0.2); color: var(--accent-primary); }
            .difficulty-intermediate { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
            .difficulty-advanced { background: rgba(255, 27, 107, 0.2); color: var(--accent-pink); }
            .scenario-rewards {
                margin-top: 1rem;
                padding: 0.75rem;
                background: rgba(168, 85, 247, 0.1);
                border-radius: var(--border-radius-small);
                text-align: center;
            }
            .xp-reward {
                color: var(--accent-purple);
                font-weight: bold;
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(styles);
    }
}

function getMatchScoreClass(score) {
    if (score >= 80) return 'match-high';
    if (score >= 60) return 'match-medium';
    return 'match-low';
}

// Action functions
function startNewQuest() {
    // Switch to internships section
    const navItem = document.querySelector('[data-section="internships"]');
    if (navItem) {
        navItem.click();
    }
    showNotification('Quest board opened! Find your perfect internship 🎯', 'success');
}

function openAIChat() {
    // Switch to AI coach section
    const navItem = document.querySelector('[data-section="ai-coach"]');
    if (navItem) {
        navItem.click();
    }
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.focus();
    }
}

function logout() {
    if (confirm('Are you sure you want to exit the game?')) {
        window.location.href = '/';
    }
}

async function applyToInternship(internshipId) {
    showNotification('Application submitted! 🚀 Check your email for next steps.', 'success');
    // In real app, this would submit application to server
}

function saveInternship(internshipId) {
    showNotification('Internship saved to your favorites! ⭐', 'success');
    // In real app, this would save to user's favorites
}

async function startScenario(scenarioId) {
    try {
        const response = await fetch('/api/communication/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                scenario_type: scenarioId,
                user_name: 'Player' 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showTrainingModal(result);
        } else {
            showNotification('Failed to start training scenario', 'error');
        }
    } catch (error) {
        console.error('Error starting scenario:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function showTrainingModal(scenarioData) {
    // Create and show training modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="pixel-font">${scenarioData.scenario.title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="scenario-intro">
                    <p>${scenarioData.introduction}</p>
                </div>
                <div class="scenario-response">
                    <textarea id="scenarioResponse" class="form-textarea" placeholder="Type your response here..."></textarea>
                </div>
                <div class="scenario-actions">
                    <button class="btn btn-primary" onclick="submitScenarioResponse()">Submit Response</button>
                    <button class="btn btn-outline" onclick="closeTrainingModal()">End Training</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store scenario data globally for use in response submission
    window.currentScenario = scenarioData;
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.remove();
        delete window.currentScenario;
    });
}

async function submitScenarioResponse() {
    const responseTextarea = document.getElementById('scenarioResponse');
    const userResponse = responseTextarea.value.trim();
    
    if (!userResponse) {
        showNotification('Please enter your response', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/communication/respond', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_response: userResponse })
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.scenario_complete) {
                showLevelUpAnimation(result.xp_earned);
                closeTrainingModal();
                showNotification(`Training complete! +${result.xp_earned} XP earned! 🏆`, 'success');
            } else {
                // Update modal with feedback and next prompt
                updateTrainingModal(result.coach_response);
            }
        } else {
            showNotification('Error processing response', 'error');
        }
    } catch (error) {
        console.error('Error submitting response:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function updateTrainingModal(coachResponse) {
    const scenarioIntro = document.querySelector('.scenario-intro');
    if (scenarioIntro) {
        scenarioIntro.innerHTML = `<p>${coachResponse}</p>`;
    }
    
    // Clear the response textarea
    const responseTextarea = document.getElementById('scenarioResponse');
    if (responseTextarea) {
        responseTextarea.value = '';
    }
}

function closeTrainingModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    delete window.currentScenario;
}

function showLevelUpAnimation(xpEarned) {
    const levelUpDiv = document.createElement('div');
    levelUpDiv.className = 'level-up-animation';
    levelUpDiv.innerHTML = `
        <div class="level-up-content">
            <h2 class="pixel-font">TRAINING COMPLETE!</h2>
            <div class="level-up-details">
                <span class="xp-gained">+${xpEarned} XP</span>
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

// Notification function (reused from landing.js)
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