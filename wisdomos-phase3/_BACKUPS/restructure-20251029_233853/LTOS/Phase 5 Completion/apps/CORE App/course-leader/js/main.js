// Main JavaScript for Wisdom Course

// Initialize progress tracking
let courseProgress = {
    modules: {
        1: { completed: false, progress: 0 },
        2: { completed: false, progress: 0 },
        3: { completed: false, progress: 0 },
        4: { completed: false, progress: 0 },
        5: { completed: false, progress: 0 },
        6: { completed: false, progress: 0 }
    },
    lastAccessed: new Date().toISOString()
};

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('wisdomCourseProgress');
    if (saved) {
        courseProgress = JSON.parse(saved);
        updateProgressDisplay();
    }
}

// Save progress to localStorage
function saveProgress() {
    courseProgress.lastAccessed = new Date().toISOString();
    localStorage.setItem('wisdomCourseProgress', JSON.stringify(courseProgress));
}

// Update progress display
function updateProgressDisplay() {
    const completedModules = Object.values(courseProgress.modules).filter(m => m.completed).length;
    const totalModules = Object.keys(courseProgress.modules).length;
    const percentage = Math.round((completedModules / totalModules) * 100);
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
        if (percentage > 0) {
            progressFill.textContent = percentage + '%';
        }
    }
    
    if (progressText) {
        progressText.textContent = `${percentage}% Complete (${completedModules}/${totalModules} modules)`;
    }
    
    // Update module cards to show completion status
    document.querySelectorAll('.module-card').forEach(card => {
        const moduleNum = parseInt(card.dataset.module);
        if (courseProgress.modules[moduleNum] && courseProgress.modules[moduleNum].completed) {
            card.classList.add('completed');
            const button = card.querySelector('button');
            if (button) {
                button.textContent = 'Review Module ✓';
                button.style.background = '#27ae60';
            }
        }
    });
}

// Load specific module
function loadModule(moduleNumber) {
    // Save current module as being accessed
    courseProgress.modules[moduleNumber].progress = Math.max(
        courseProgress.modules[moduleNumber].progress, 
        10
    );
    saveProgress();
    
    // Navigate to module page
    window.location.href = `modules/module${moduleNumber}.html`;
}

// Smooth scroll to modules section
function scrollToModules() {
    document.getElementById('modules').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Initialize quote rotation
const wisdomQuotes = [
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" }
];

// Display random wisdom quote
function displayRandomQuote() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && Math.random() > 0.5) { // 50% chance to show a quote
        const quote = wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
        const quoteElement = document.createElement('div');
        quoteElement.className = 'wisdom-quote';
        quoteElement.style.cssText = `
            margin-top: 2rem;
            padding: 1rem;
            border-left: 3px solid white;
            font-style: italic;
            opacity: 0.9;
        `;
        quoteElement.innerHTML = `
            <p>"${quote.text}"</p>
            <p style="text-align: right; margin-top: 0.5rem; font-size: 0.9rem;">— ${quote.author}</p>
        `;
        heroContent.appendChild(quoteElement);
    }
}

// Add interactive hover effects
function addInteractiveEffects() {
    // Add pulse effect to CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s';
        });
        ctaButton.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    }
    
    // Add hover sound effect capability (optional)
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

// Track time spent on page
let pageStartTime = Date.now();
function trackTimeSpent() {
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
        const stats = JSON.parse(localStorage.getItem('wisdomCourseStats') || '{}');
        stats.totalTimeSpent = (stats.totalTimeSpent || 0) + timeSpent;
        stats.lastVisit = new Date().toISOString();
        localStorage.setItem('wisdomCourseStats', JSON.stringify(stats));
    });
}

// Initialize theme toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('wisdomCourseTheme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Toggle dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('wisdomCourseTheme', isDark ? 'dark' : 'light');
}

// Add keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + H: Go home
        if (e.altKey && e.key === 'h') {
            window.location.href = '/index.html';
        }
        // Alt + M: Go to modules
        if (e.altKey && e.key === 'm') {
            scrollToModules();
        }
        // Alt + P: View progress
        if (e.altKey && e.key === 'p') {
            document.getElementById('progress').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Initialize animations on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe module cards
    document.querySelectorAll('.module-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .module-card.completed {
        border: 2px solid #27ae60;
        background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(39, 174, 96, 0.1));
    }
    
    .dark-theme {
        --primary-color: #1a252f;
        --secondary-color: #2980b9;
        --text-color: #ecf0f1;
        --light-bg: #2c3e50;
        --white: #34495e;
    }
    
    .dark-theme body {
        background-color: #1a252f;
        color: #ecf0f1;
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    displayRandomQuote();
    addInteractiveEffects();
    trackTimeSpent();
    initializeTheme();
    initKeyboardShortcuts();
    initScrollAnimations();
    
    // Log course access
    console.log('🎓 Welcome to the Wisdom Course!');
    console.log('💡 Keyboard shortcuts: Alt+H (Home), Alt+M (Modules), Alt+P (Progress)');
});

// Export functions for use in module pages
window.wisdomCourse = {
    loadModule,
    scrollToModules,
    toggleTheme,
    courseProgress,
    saveProgress
};