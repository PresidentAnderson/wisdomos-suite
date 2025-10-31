// Module-specific JavaScript

// Get current module number from URL
function getCurrentModuleNumber() {
    const path = window.location.pathname;
    const match = path.match(/module(\d+)\.html/);
    return match ? parseInt(match[1]) : null;
}

// Load module progress
function loadModuleProgress() {
    const saved = localStorage.getItem('wisdomCourseProgress');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        modules: {
            1: { completed: false, progress: 0 },
            2: { completed: false, progress: 0 },
            3: { completed: false, progress: 0 },
            4: { completed: false, progress: 0 },
            5: { completed: false, progress: 0 },
            6: { completed: false, progress: 0 }
        }
    };
}

// Save module progress
function saveModuleProgress(progress) {
    localStorage.setItem('wisdomCourseProgress', JSON.stringify(progress));
}

// Mark module as complete
function completeModule(moduleNumber) {
    const progress = loadModuleProgress();
    progress.modules[moduleNumber].completed = true;
    progress.modules[moduleNumber].progress = 100;
    saveModuleProgress(progress);
    
    // Show completion message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27ae60;
        color: white;
        padding: 2rem 3rem;
        border-radius: 10px;
        font-size: 1.2rem;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: fadeIn 0.5s ease;
    `;
    message.innerHTML = `
        <h3 style="margin-bottom: 1rem;">🎉 Module Completed!</h3>
        <p>Congratulations on completing Module ${moduleNumber}</p>
    `;
    document.body.appendChild(message);
    
    // Update button
    const completeBtn = document.querySelector('.complete-btn');
    if (completeBtn) {
        completeBtn.textContent = 'Module Completed ✓';
        completeBtn.style.background = '#229954';
        completeBtn.disabled = true;
    }
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 500);
    }, 3000);
}

// Calculate wisdom score from inventory
function calculateWisdomScore() {
    const inputs = document.querySelectorAll('.wisdom-inventory input');
    let total = 0;
    let count = 0;
    
    inputs.forEach(input => {
        if (input.value) {
            total += parseInt(input.value);
            count++;
        }
    });
    
    if (count === 0) {
        alert('Please fill in all the ratings first.');
        return;
    }
    
    const average = Math.round(total / count);
    const maxScore = count * 10;
    const percentage = Math.round((total / maxScore) * 100);
    
    // Create result display
    const resultDiv = document.createElement('div');
    resultDiv.className = 'wisdom-score-result';
    resultDiv.style.cssText = `
        margin-top: 1rem;
        padding: 1rem;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border-radius: 5px;
    `;
    
    let feedback = '';
    if (percentage >= 80) {
        feedback = 'Excellent! You have strong wisdom foundations.';
    } else if (percentage >= 60) {
        feedback = 'Good progress! Keep developing these areas.';
    } else if (percentage >= 40) {
        feedback = 'You\'re on the right path. Focus on consistent practice.';
    } else {
        feedback = 'This course will help you develop these important skills.';
    }
    
    resultDiv.innerHTML = `
        <h4>Your Wisdom Score: ${total}/${maxScore} (${percentage}%)</h4>
        <p>Average Rating: ${average}/10</p>
        <p>${feedback}</p>
    `;
    
    // Remove any existing result
    const existingResult = document.querySelector('.wisdom-score-result');
    if (existingResult) {
        existingResult.remove();
    }
    
    // Add new result
    document.querySelector('.wisdom-inventory').appendChild(resultDiv);
    
    // Save the score
    const stats = JSON.parse(localStorage.getItem('wisdomCourseStats') || '{}');
    stats.latestWisdomScore = {
        total,
        maxScore,
        percentage,
        date: new Date().toISOString()
    };
    localStorage.setItem('wisdomCourseStats', JSON.stringify(stats));
}

// Track lesson progress
function trackLessonProgress() {
    const moduleNumber = getCurrentModuleNumber();
    if (!moduleNumber) return;
    
    const lessons = document.querySelectorAll('.lesson');
    const totalLessons = lessons.length;
    let viewedLessons = 0;
    
    // Create intersection observer to track viewed lessons
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.dataset.viewed = 'true';
                updateLessonProgress();
            }
        });
    }, { threshold: 0.5 });
    
    lessons.forEach(lesson => {
        observer.observe(lesson);
    });
    
    function updateLessonProgress() {
        viewedLessons = document.querySelectorAll('.lesson[data-viewed="true"]').length;
        const progressPercentage = Math.round((viewedLessons / totalLessons) * 100);
        
        const progress = loadModuleProgress();
        progress.modules[moduleNumber].progress = Math.max(
            progress.modules[moduleNumber].progress,
            progressPercentage
        );
        saveModuleProgress(progress);
        
        // Update progress indicator if exists
        updateProgressIndicator(progressPercentage);
    }
}

// Update progress indicator
function updateProgressIndicator(percentage) {
    let indicator = document.querySelector('.module-progress-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'module-progress-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 100;
            min-width: 150px;
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.innerHTML = `
        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Module Progress</div>
        <div style="background: #ddd; height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #3498db, #2980b9); height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
        </div>
        <div style="text-align: center; margin-top: 0.5rem; font-weight: bold; color: #2c3e50;">${percentage}%</div>
    `;
}

// Save reflection answers
function saveReflection(lessonId) {
    const textarea = document.querySelector(`#${lessonId} textarea`);
    if (!textarea) return;
    
    textarea.addEventListener('blur', () => {
        const reflections = JSON.parse(localStorage.getItem('wisdomReflections') || '{}');
        const moduleNumber = getCurrentModuleNumber();
        
        if (!reflections[moduleNumber]) {
            reflections[moduleNumber] = {};
        }
        
        reflections[moduleNumber][lessonId] = {
            text: textarea.value,
            date: new Date().toISOString()
        };
        
        localStorage.setItem('wisdomReflections', JSON.stringify(reflections));
        
        // Show saved indicator
        showSavedIndicator(textarea);
    });
    
    // Load saved reflection
    const reflections = JSON.parse(localStorage.getItem('wisdomReflections') || '{}');
    const moduleNumber = getCurrentModuleNumber();
    if (reflections[moduleNumber] && reflections[moduleNumber][lessonId]) {
        textarea.value = reflections[moduleNumber][lessonId].text;
    }
}

// Show saved indicator
function showSavedIndicator(element) {
    const indicator = document.createElement('span');
    indicator.textContent = '✓ Saved';
    indicator.style.cssText = `
        color: #27ae60;
        font-size: 0.9rem;
        margin-left: 1rem;
        animation: fadeIn 0.3s ease;
    `;
    
    element.parentNode.appendChild(indicator);
    
    setTimeout(() => {
        indicator.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }, 2000);
}

// Add note-taking functionality
function initializeNotes() {
    const moduleNumber = getCurrentModuleNumber();
    if (!moduleNumber) return;
    
    // Create notes button
    const notesBtn = document.createElement('button');
    notesBtn.textContent = '📝 Notes';
    notesBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    notesBtn.addEventListener('click', toggleNotes);
    document.body.appendChild(notesBtn);
    
    // Create notes panel
    const notesPanel = document.createElement('div');
    notesPanel.className = 'notes-panel';
    notesPanel.style.cssText = `
        position: fixed;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100vh;
        background: white;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 999;
        display: flex;
        flex-direction: column;
    `;
    
    notesPanel.innerHTML = `
        <div style="padding: 1rem; background: #2c3e50; color: white;">
            <h3 style="margin: 0;">Module ${moduleNumber} Notes</h3>
            <button onclick="toggleNotes()" style="position: absolute; right: 1rem; top: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
        </div>
        <textarea id="moduleNotes" style="flex: 1; padding: 1rem; border: none; resize: none; font-family: inherit;" placeholder="Type your notes here..."></textarea>
        <div style="padding: 1rem; background: #f5f5f5;">
            <button onclick="saveNotes()" style="background: #27ae60; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Save Notes</button>
        </div>
    `;
    
    document.body.appendChild(notesPanel);
    
    // Load saved notes
    const savedNotes = localStorage.getItem(`wisdomNotes_module${moduleNumber}`);
    if (savedNotes) {
        document.getElementById('moduleNotes').value = savedNotes;
    }
}

// Toggle notes panel
function toggleNotes() {
    const panel = document.querySelector('.notes-panel');
    const isOpen = panel.style.right === '0px';
    panel.style.right = isOpen ? '-400px' : '0px';
}

// Save notes
function saveNotes() {
    const moduleNumber = getCurrentModuleNumber();
    const notes = document.getElementById('moduleNotes').value;
    localStorage.setItem(`wisdomNotes_module${moduleNumber}`, notes);
    
    // Show saved message
    const message = document.createElement('div');
    message.textContent = 'Notes saved!';
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        animation: fadeIn 0.3s ease;
        z-index: 10000;
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
    
    .lesson[data-viewed="true"] {
        border-left: 4px solid #27ae60;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    trackLessonProgress();
    initializeNotes();
    
    // Initialize reflection saving for all lessons
    document.querySelectorAll('.lesson').forEach(lesson => {
        if (lesson.id) {
            saveReflection(lesson.id);
        }
    });
    
    // Check if module is already completed
    const moduleNumber = getCurrentModuleNumber();
    if (moduleNumber) {
        const progress = loadModuleProgress();
        if (progress.modules[moduleNumber].completed) {
            const completeBtn = document.querySelector('.complete-btn');
            if (completeBtn) {
                completeBtn.textContent = 'Module Completed ✓';
                completeBtn.style.background = '#229954';
                completeBtn.disabled = true;
            }
        }
    }
    
    console.log(`📚 Module ${moduleNumber} loaded`);
});

// Make functions available globally
window.completeModule = completeModule;
window.calculateWisdomScore = calculateWisdomScore;
window.toggleNotes = toggleNotes;
window.saveNotes = saveNotes;