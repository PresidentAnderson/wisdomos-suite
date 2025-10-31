// Dashboard JavaScript

// Dashboard data structure
let dashboardData = {
    dailyPractices: {},
    journalEntries: [],
    goals: [],
    commitments: [],
    achievements: [],
    streaks: {
        current: 0,
        longest: 0,
        lastUpdate: null
    }
};

// Wisdom quotes collection
const wisdomQuotes = [
    "Fulfillment is not a destination, but a way of traveling.",
    "Your authentic self is your greatest contribution to the world.",
    "The quality of your life is determined by the quality of your conversations.",
    "What you resist persists; what you embrace transforms.",
    "Your word is your wand - use it to create the life you desire.",
    "The future belongs to those who understand that transformation is an ongoing process.",
    "True power comes from taking responsibility for your entire life experience.",
    "In every moment, you have the choice to be who you really are.",
    "Love is not something you fall into; it's something you choose to embody.",
    "Wisdom is not about knowing more; it's about being more.",
    "The gap between where you are and where you want to be is called practice.",
    "Transformation happens in the space between stimulus and response.",
    "Your circumstances don't define you; your response to them does.",
    "Commitment is the bridge between vision and reality.",
    "The present moment is the only place where miracles can happen.",
    "Authenticity is the daily practice of letting go of who you think you're supposed to be.",
    "Gratitude transforms what we have into enough.",
    "The way you do anything is the way you do everything.",
    "Peace comes from accepting what is while working toward what could be.",
    "Your life is your message to the world. Make sure it's inspiring."
];

// Sample achievements data
const sampleAchievements = [
    {
        id: 'first-module',
        title: 'First Module Complete',
        description: 'Completed your first Wisdom Evolution module',
        badge: 'bronze',
        icon: '🎯',
        earned: false
    },
    {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintained daily practices for 7 consecutive days',
        badge: 'silver',
        icon: '🔥',
        earned: false
    },
    {
        id: 'life-chronicler',
        title: 'Life Chronicler',
        description: 'Added 10 entries to your autobiography',
        badge: 'bronze',
        icon: '📚',
        earned: false
    },
    {
        id: 'wisdom-seeker',
        title: 'Wisdom Seeker',
        description: 'Completed all 4 Wisdom Evolution modules',
        badge: 'gold',
        icon: '🧠',
        earned: false
    },
    {
        id: 'consistent-journaler',
        title: 'Consistent Journaler',
        description: 'Wrote in your journal for 30 consecutive days',
        badge: 'gold',
        icon: '✍️',
        earned: false
    }
];

// Load dashboard data
function loadDashboardData() {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
        dashboardData = { ...dashboardData, ...JSON.parse(saved) };
    }
    
    // Initialize achievements if not present
    if (!dashboardData.achievements || dashboardData.achievements.length === 0) {
        dashboardData.achievements = sampleAchievements;
    }
    
    updateDashboard();
}

// Save dashboard data
function saveDashboardData() {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

// Update entire dashboard
function updateDashboard() {
    updateDate();
    updateDailyQuote();
    updateStats();
    updateDailyPractices();
    updateRecentActivities();
    updateGoalsOverview();
    updateStreak();
    checkAchievements();
}

// Update current date
function updateDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('current-date').textContent = dateStr;
}

// Update daily wisdom quote
function updateDailyQuote() {
    const today = new Date().toDateString();
    const savedQuoteDate = localStorage.getItem('dailyQuoteDate');
    const savedQuote = localStorage.getItem('dailyQuote');
    
    if (savedQuoteDate === today && savedQuote) {
        document.getElementById('daily-quote').textContent = savedQuote;
    } else {
        getNewQuote();
    }
}

// Get new wisdom quote
function getNewQuote() {
    const randomIndex = Math.floor(Math.random() * wisdomQuotes.length);
    const quote = wisdomQuotes[randomIndex];
    
    document.getElementById('daily-quote').textContent = quote;
    
    const today = new Date().toDateString();
    localStorage.setItem('dailyQuoteDate', today);
    localStorage.setItem('dailyQuote', quote);
}

// Update statistics
function updateStats() {
    // Course progress
    const courseData = localStorage.getItem('wisdomCourseData');
    let courseProgress = 0;
    if (courseData) {
        const course = JSON.parse(courseData);
        const completedModules = Object.values(course.modules || {}).filter(m => m.completed).length;
        courseProgress = (completedModules / 4) * 100;
    }
    document.getElementById('course-progress-stat').textContent = Math.round(courseProgress) + '%';
    
    // Autobiography entries
    const autobiographyData = localStorage.getItem('autobiographyData');
    let entryCount = 0;
    if (autobiographyData) {
        const autobiography = JSON.parse(autobiographyData);
        entryCount = (autobiography.entries || []).length;
    }
    document.getElementById('autobiography-count').textContent = entryCount;
    
    // Practice streak
    document.getElementById('practice-streak').textContent = dashboardData.streaks.current;
    document.getElementById('streak-count').textContent = dashboardData.streaks.current;
    
    // Achievements count
    const earnedAchievements = dashboardData.achievements.filter(a => a.earned).length;
    document.getElementById('achievements-count').textContent = earnedAchievements;
}

// Update daily practices
function updateDailyPractices() {
    const today = new Date().toDateString();
    const todayPractices = dashboardData.dailyPractices[today] || {};
    
    // Update checkboxes
    document.querySelectorAll('#daily-practices input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = todayPractices[checkbox.id] || false;
        
        checkbox.addEventListener('change', function() {
            if (!dashboardData.dailyPractices[today]) {
                dashboardData.dailyPractices[today] = {};
            }
            dashboardData.dailyPractices[today][this.id] = this.checked;
            saveDashboardData();
            updateDailyProgress();
            updateStreak();
        });
    });
    
    updateDailyProgress();
}

// Update daily progress
function updateDailyProgress() {
    const today = new Date().toDateString();
    const todayPractices = dashboardData.dailyPractices[today] || {};
    const completed = Object.values(todayPractices).filter(Boolean).length;
    const total = 6; // Total number of practices
    
    const percentage = (completed / total) * 100;
    document.getElementById('daily-progress').style.width = percentage + '%';
    document.getElementById('daily-progress-text').textContent = `${completed}/${total}`;
}

// Update streak
function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const todayPractices = dashboardData.dailyPractices[today] || {};
    const todayCompleted = Object.values(todayPractices).filter(Boolean).length;
    
    // If today is complete (at least 4 out of 6 practices)
    if (todayCompleted >= 4) {
        if (dashboardData.streaks.lastUpdate !== today) {
            const yesterdayPractices = dashboardData.dailyPractices[yesterday] || {};
            const yesterdayCompleted = Object.values(yesterdayPractices).filter(Boolean).length;
            
            if (yesterdayCompleted >= 4 || dashboardData.streaks.current === 0) {
                dashboardData.streaks.current++;
            } else {
                dashboardData.streaks.current = 1;
            }
            
            if (dashboardData.streaks.current > dashboardData.streaks.longest) {
                dashboardData.streaks.longest = dashboardData.streaks.current;
            }
            
            dashboardData.streaks.lastUpdate = today;
            saveDashboardData();
        }
    }
    
    // Update display
    document.getElementById('practice-streak').textContent = dashboardData.streaks.current;
    document.getElementById('streak-count').textContent = dashboardData.streaks.current;
}

// Update recent activities
function updateRecentActivities() {
    // Recent journal entries
    const recentJournals = dashboardData.journalEntries.slice(-3).reverse();
    const journalsContainer = document.getElementById('recent-journals');
    
    if (recentJournals.length === 0) {
        journalsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No journal entries yet. Start your reflection practice!</p>';
    } else {
        journalsContainer.innerHTML = recentJournals.map(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            return `
                <div class="border-l-4 border-purple-300 pl-3">
                    <div class="text-sm text-gray-500 dark:text-gray-400">${date}</div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${entry.reflection.substring(0, 100)}${entry.reflection.length > 100 ? '...' : ''}</p>
                </div>
            `;
        }).join('');
    }
    
    // Recent achievements
    const recentAchievements = dashboardData.achievements.filter(a => a.earned).slice(-3);
    const achievementsContainer = document.getElementById('recent-achievements');
    
    if (recentAchievements.length === 0) {
        achievementsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No achievements yet. Keep practicing to unlock badges!</p>';
    } else {
        achievementsContainer.innerHTML = recentAchievements.map(achievement => `
            <div class="flex items-center space-x-3">
                <span class="text-2xl">${achievement.icon}</span>
                <div>
                    <h4 class="font-semibold text-sm">${achievement.title}</h4>
                    <p class="text-xs text-gray-600 dark:text-gray-400">${achievement.description}</p>
                </div>
                <span class="badge ${achievement.badge} ml-auto">${achievement.badge}</span>
            </div>
        `).join('');
    }
}

// Update goals overview
function updateGoalsOverview() {
    const goalsContainer = document.getElementById('goals-overview');
    const activeGoals = dashboardData.goals.filter(g => g.status === 'active').slice(0, 3);
    
    if (activeGoals.length === 0) {
        goalsContainer.innerHTML = `
            <div class="card text-center col-span-full">
                <h3 class="font-semibold mb-2">No Active Goals</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Set your first goal to start tracking your progress</p>
                <button onclick="openGoals()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Goal</button>
            </div>
        `;
    } else {
        goalsContainer.innerHTML = activeGoals.map(goal => {
            const progress = (goal.completed || 0) / (goal.total || 1) * 100;
            return `
                <div class="card">
                    <h3 class="font-semibold mb-2">${goal.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${goal.description}</p>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-purple-600 h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            Due: ${new Date(goal.dueDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Check and award achievements
function checkAchievements() {
    let newAchievements = false;
    
    // Check course progress achievement
    const courseData = localStorage.getItem('wisdomCourseData');
    if (courseData) {
        const course = JSON.parse(courseData);
        const completedModules = Object.values(course.modules || {}).filter(m => m.completed).length;
        
        // First module achievement
        if (completedModules >= 1) {
            const achievement = dashboardData.achievements.find(a => a.id === 'first-module');
            if (achievement && !achievement.earned) {
                achievement.earned = true;
                newAchievements = true;
                showAchievementNotification(achievement);
            }
        }
        
        // All modules achievement
        if (completedModules >= 4) {
            const achievement = dashboardData.achievements.find(a => a.id === 'wisdom-seeker');
            if (achievement && !achievement.earned) {
                achievement.earned = true;
                newAchievements = true;
                showAchievementNotification(achievement);
            }
        }
    }
    
    // Check streak achievements
    if (dashboardData.streaks.current >= 7) {
        const achievement = dashboardData.achievements.find(a => a.id === 'week-streak');
        if (achievement && !achievement.earned) {
            achievement.earned = true;
            newAchievements = true;
            showAchievementNotification(achievement);
        }
    }
    
    // Check autobiography achievements
    const autobiographyData = localStorage.getItem('autobiographyData');
    if (autobiographyData) {
        const autobiography = JSON.parse(autobiographyData);
        const entryCount = (autobiography.entries || []).length;
        
        if (entryCount >= 10) {
            const achievement = dashboardData.achievements.find(a => a.id === 'life-chronicler');
            if (achievement && !achievement.earned) {
                achievement.earned = true;
                newAchievements = true;
                showAchievementNotification(achievement);
            }
        }
    }
    
    // Check journal achievements
    if (dashboardData.journalEntries.length >= 30) {
        const achievement = dashboardData.achievements.find(a => a.id === 'consistent-journaler');
        if (achievement && !achievement.earned) {
            achievement.earned = true;
            newAchievements = true;
            showAchievementNotification(achievement);
        }
    }
    
    if (newAchievements) {
        saveDashboardData();
        setTimeout(updateStats, 1000);
    }
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white max-w-sm';
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <span class="text-3xl">${achievement.icon}</span>
            <div>
                <h4 class="font-bold">Achievement Unlocked!</h4>
                <h5 class="font-semibold">${achievement.title}</h5>
                <p class="text-sm opacity-90">${achievement.description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Journal functions
function openJournal() {
    const today = new Date().toDateString();
    const todayEntry = dashboardData.journalEntries.find(e => e.date === today);
    
    if (todayEntry) {
        document.getElementById('journal-entry').value = todayEntry.reflection || '';
        document.getElementById('gratitude-entry').value = todayEntry.gratitude || '';
        document.getElementById('intention-entry').value = todayEntry.intention || '';
    } else {
        document.getElementById('journal-entry').value = '';
        document.getElementById('gratitude-entry').value = '';
        document.getElementById('intention-entry').value = '';
    }
    
    document.getElementById('journal-modal').classList.remove('hidden');
    document.getElementById('journal-modal').classList.add('flex');
}

function closeJournal() {
    document.getElementById('journal-modal').classList.add('hidden');
    document.getElementById('journal-modal').classList.remove('flex');
}

function saveJournalEntry() {
    const today = new Date().toDateString();
    const reflection = document.getElementById('journal-entry').value;
    const gratitude = document.getElementById('gratitude-entry').value;
    const intention = document.getElementById('intention-entry').value;
    
    if (!reflection.trim()) {
        alert('Please write a reflection before saving.');
        return;
    }
    
    const existingEntryIndex = dashboardData.journalEntries.findIndex(e => e.date === today);
    const entry = {
        date: today,
        reflection,
        gratitude,
        intention,
        timestamp: new Date().toISOString()
    };
    
    if (existingEntryIndex >= 0) {
        dashboardData.journalEntries[existingEntryIndex] = entry;
    } else {
        dashboardData.journalEntries.push(entry);
    }
    
    saveDashboardData();
    closeJournal();
    updateRecentActivities();
    showNotification('Journal entry saved successfully!', 'success');
}

// Goals functions
function openGoals() {
    renderGoalsModal();
    document.getElementById('goals-modal').classList.remove('hidden');
    document.getElementById('goals-modal').classList.add('flex');
}

function closeGoals() {
    document.getElementById('goals-modal').classList.add('hidden');
    document.getElementById('goals-modal').classList.remove('flex');
}

function renderGoalsModal() {
    // Render current goals
    const currentGoalsContainer = document.getElementById('current-goals');
    const activeGoals = dashboardData.goals.filter(g => g.status === 'active');
    
    if (activeGoals.length === 0) {
        currentGoalsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No active goals yet.</p>';
    } else {
        currentGoalsContainer.innerHTML = activeGoals.map(goal => {
            const progress = (goal.completed || 0) / (goal.total || 1) * 100;
            return `
                <div class="border rounded-lg p-3 dark:border-gray-600">
                    <h5 class="font-semibold mb-1">${goal.title}</h5>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${goal.description}</p>
                    <div class="space-y-1">
                        <div class="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1">
                            <div class="bg-green-600 h-1 rounded-full" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Render current commitments
    const currentCommitmentsContainer = document.getElementById('current-commitments');
    const activeCommitments = dashboardData.commitments.filter(c => c.status === 'active');
    
    if (activeCommitments.length === 0) {
        currentCommitmentsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">No active commitments yet.</p>';
    } else {
        currentCommitmentsContainer.innerHTML = activeCommitments.map(commitment => `
            <div class="border rounded-lg p-3 dark:border-gray-600">
                <h5 class="font-semibold mb-1">${commitment.title}</h5>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${commitment.description}</p>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    Created: ${new Date(commitment.created).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }
}

function addNewGoal() {
    const title = prompt('Goal title:');
    if (!title) return;
    
    const description = prompt('Goal description:');
    if (!description) return;
    
    const dueDate = prompt('Due date (YYYY-MM-DD):');
    if (!dueDate) return;
    
    const goal = {
        id: 'goal-' + Date.now(),
        title,
        description,
        dueDate,
        status: 'active',
        completed: 0,
        total: 1,
        created: new Date().toISOString()
    };
    
    dashboardData.goals.push(goal);
    saveDashboardData();
    renderGoalsModal();
    updateGoalsOverview();
    showNotification('Goal added successfully!', 'success');
}

function addNewCommitment() {
    const title = prompt('Commitment title:');
    if (!title) return;
    
    const description = prompt('Commitment description:');
    if (!description) return;
    
    const commitment = {
        id: 'commitment-' + Date.now(),
        title,
        description,
        status: 'active',
        created: new Date().toISOString()
    };
    
    dashboardData.commitments.push(commitment);
    saveDashboardData();
    renderGoalsModal();
    showNotification('Commitment added successfully!', 'success');
}

function showAllAchievements() {
    const earnedAchievements = dashboardData.achievements.filter(a => a.earned);
    const unearnedAchievements = dashboardData.achievements.filter(a => !a.earned);
    
    let message = 'EARNED ACHIEVEMENTS:\n\n';
    earnedAchievements.forEach(a => {
        message += `${a.icon} ${a.title} (${a.badge})\n${a.description}\n\n`;
    });
    
    message += '\nUNLOCKABLE ACHIEVEMENTS:\n\n';
    unearnedAchievements.forEach(a => {
        message += `${a.icon} ${a.title} (${a.badge})\n${a.description}\n\n`;
    });
    
    alert(message);
}

// Notification system (shared with other pages)
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

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    // Check achievements every minute
    setInterval(checkAchievements, 60000);
});