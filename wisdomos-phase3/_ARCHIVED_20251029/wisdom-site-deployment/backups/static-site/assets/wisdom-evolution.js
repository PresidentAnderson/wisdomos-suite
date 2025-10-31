// Wisdom Evolution Course JavaScript

// Course Progress Tracking
let courseData = {
    modules: {
        1: { completed: false, exercises: 0, practices: [] },
        2: { completed: false, exercises: 0, practices: [] },
        3: { completed: false, exercises: 0, practices: [] },
        4: { completed: false, exercises: 0, practices: [] }
    },
    exercises: {},
    startDate: null,
    lastAccessed: null
};

// Load saved course data
function loadCourseData() {
    const saved = localStorage.getItem('wisdomCourseData');
    if (saved) {
        courseData = { ...courseData, ...JSON.parse(saved) };
    } else {
        courseData.startDate = new Date().toISOString();
    }
    courseData.lastAccessed = new Date().toISOString();
    updateDisplay();
}

// Save course data
function saveCourseData() {
    localStorage.setItem('wisdomCourseData', JSON.stringify(courseData));
}

// Update all displays
function updateDisplay() {
    updateCourseProgress();
    updateModuleStatuses();
    updateModuleProgress();
    loadExerciseResponses();
    loadPracticeStates();
}

// Update overall course progress
function updateCourseProgress() {
    const completedModules = Object.values(courseData.modules).filter(m => m.completed).length;
    const progress = (completedModules / 4) * 100;
    
    const progressBar = document.getElementById('course-progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    // Show completion message if all modules done
    if (completedModules === 4) {
        document.getElementById('course-complete').classList.remove('hidden');
    }
}

// Update module status indicators
function updateModuleStatuses() {
    for (let i = 1; i <= 4; i++) {
        const statusElement = document.getElementById(`module-${i}-status`);
        const moduleCard = document.querySelector(`[data-module="${i}"]`);
        
        if (statusElement && moduleCard) {
            if (courseData.modules[i].completed) {
                statusElement.textContent = 'Completed';
                statusElement.className = 'module-status completed';
                moduleCard.classList.add('completed');
            } else if (courseData.modules[i].exercises > 0) {
                statusElement.textContent = 'In Progress';
                statusElement.className = 'module-status in-progress';
                moduleCard.classList.add('in-progress');
            } else {
                statusElement.textContent = 'Not Started';
                statusElement.className = 'module-status not-started';
            }
        }
    }
}

// Update individual module progress
function updateModuleProgress() {
    for (let i = 1; i <= 4; i++) {
        const exerciseElement = document.getElementById(`module-${i}-exercises`);
        const progressBar = document.getElementById(`module-${i}-progress`);
        
        if (exerciseElement) {
            exerciseElement.textContent = `${courseData.modules[i].exercises}/3`;
        }
        
        if (progressBar) {
            const progress = (courseData.modules[i].exercises / 3) * 100;
            progressBar.style.width = progress + '%';
        }
    }
}

// Module card click handlers
document.addEventListener('DOMContentLoaded', function() {
    loadCourseData();
    
    // Add click handlers to module cards
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const moduleNum = this.dataset.module;
            showModule(moduleNum);
        });
    });
    
    // Add exercise save handlers
    document.querySelectorAll('textarea[id^="exercise-"]').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const exerciseId = this.id.replace('exercise-', '');
            courseData.exercises[exerciseId] = this.value;
            saveCourseData();
        });
    });
    
    // Add practice check handlers
    document.querySelectorAll('input[id^="practice-"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const practiceId = this.id;
            const moduleNum = practiceId.split('-')[1];
            
            if (!courseData.modules[moduleNum].practices) {
                courseData.modules[moduleNum].practices = [];
            }
            
            if (this.checked) {
                if (!courseData.modules[moduleNum].practices.includes(practiceId)) {
                    courseData.modules[moduleNum].practices.push(practiceId);
                }
            } else {
                courseData.modules[moduleNum].practices = courseData.modules[moduleNum].practices.filter(p => p !== practiceId);
            }
            
            saveCourseData();
        });
    });
});

// Show specific module
function showModule(moduleNum) {
    // Hide all modules
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected module
    const moduleContent = document.getElementById(`module-${moduleNum}`);
    if (moduleContent) {
        moduleContent.classList.remove('hidden');
        moduleContent.scrollIntoView({ behavior: 'smooth' });
    }
}

// Save exercise response
function saveExercise(exerciseId) {
    const textarea1 = document.getElementById(`exercise-${exerciseId}`);
    const textarea2 = document.getElementById(`exercise-${exerciseId.replace('-1', '-2')}`);
    
    if (textarea1 && textarea1.value.trim()) {
        courseData.exercises[exerciseId] = textarea1.value;
        
        if (textarea2 && textarea2.value.trim()) {
            courseData.exercises[exerciseId.replace('-1', '-2')] = textarea2.value;
        }
        
        // Increment exercise count for the module
        const moduleNum = exerciseId.split('-')[0];
        if (courseData.modules[moduleNum].exercises < 3) {
            courseData.modules[moduleNum].exercises++;
        }
        
        saveCourseData();
        updateDisplay();
        
        // Show success message
        showNotification('Exercise response saved successfully!', 'success');
    } else {
        showNotification('Please complete the exercise before saving.', 'error');
    }
}

// Complete module
function completeModule(moduleNum) {
    if (courseData.modules[moduleNum].exercises >= 3) {
        courseData.modules[moduleNum].completed = true;
        saveCourseData();
        updateDisplay();
        showNotification(`Module ${moduleNum} completed! Congratulations!`, 'success');
        
        // Unlock next module or show completion
        if (moduleNum < 4) {
            setTimeout(() => {
                showModule(moduleNum + 1);
            }, 2000);
        }
    } else {
        showNotification('Please complete all exercises before marking the module as complete.', 'error');
    }
}

// Load saved exercise responses
function loadExerciseResponses() {
    Object.keys(courseData.exercises).forEach(exerciseId => {
        const textarea = document.getElementById(`exercise-${exerciseId}`);
        if (textarea) {
            textarea.value = courseData.exercises[exerciseId];
        }
    });
}

// Load practice states
function loadPracticeStates() {
    Object.keys(courseData.modules).forEach(moduleNum => {
        const practices = courseData.modules[moduleNum].practices || [];
        practices.forEach(practiceId => {
            const checkbox = document.getElementById(practiceId);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    });
}

// Export progress
function exportProgress() {
    const dataStr = JSON.stringify(courseData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wisdom-course-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Progress exported successfully!', 'success');
}

// Restart course
function restartCourse() {
    if (confirm('Are you sure you want to restart the course? All progress will be lost.')) {
        localStorage.removeItem('wisdomCourseData');
        location.reload();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Daily wisdom quotes
const dailyQuotes = [
    "Fulfillment is not a destination, but a way of traveling.",
    "Your authentic self is your greatest contribution to the world.",
    "The quality of your life is determined by the quality of your conversations.",
    "What you resist persists; what you embrace transforms.",
    "Your word is your wand - use it to create the life you desire.",
    "The future belongs to those who understand that transformation is an ongoing process.",
    "True power comes from taking responsibility for your entire life experience."
];

// Show daily quote
function showDailyQuote() {
    const today = new Date().toDateString();
    const lastQuoteDate = localStorage.getItem('lastQuoteDate');
    
    if (lastQuoteDate !== today) {
        const quoteIndex = new Date().getDay();
        const quote = dailyQuotes[quoteIndex];
        
        showNotification(`Daily Wisdom: ${quote}`, 'info');
        localStorage.setItem('lastQuoteDate', today);
    }
}

// Show daily quote on page load
setTimeout(showDailyQuote, 2000);