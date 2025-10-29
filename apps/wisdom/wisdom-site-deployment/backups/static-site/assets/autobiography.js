// Autobiography JavaScript

// Data structure for autobiography entries
let autobiographyData = {
    entries: [],
    contributions: []
};

// Sample timeline data
const sampleEntries = [
    {
        id: 'entry-1',
        date: '1990-01-01',
        type: 'milestone',
        title: 'Born into Learning',
        description: 'Beginning of the journey in a family that valued education and personal growth.',
        wisdom: 'Every person is born with infinite potential waiting to be discovered.',
        impact: 'transformational'
    },
    {
        id: 'entry-2',
        date: '2010-06-15',
        type: 'professional',
        title: 'First Leadership Role',
        description: 'Stepped into first management position, learning the difference between managing and leading.',
        wisdom: 'True leadership is about serving others and helping them grow, not controlling them.',
        impact: 'high'
    },
    {
        id: 'entry-3',
        date: '2015-03-20',
        type: 'spiritual',
        title: 'Meditation Practice Begins',
        description: 'Started daily meditation practice after experiencing burnout and seeking deeper meaning.',
        wisdom: 'The present moment is the only place where life actually happens.',
        impact: 'transformational'
    },
    {
        id: 'entry-4',
        date: '2018-11-10',
        type: 'relationship',
        title: 'Learning Vulnerability',
        description: 'A significant relationship taught me the importance of emotional honesty and vulnerability.',
        wisdom: 'Vulnerability is not weakness; it is the birthplace of courage, creativity, and change.',
        impact: 'high'
    },
    {
        id: 'entry-5',
        date: '2020-04-01',
        type: 'professional',
        title: 'PVT Hostel System Launch',
        description: 'Launched comprehensive hostel management platform, combining technology with hospitality.',
        wisdom: 'Technology should serve humanity, not the other way around.',
        impact: 'high'
    },
    {
        id: 'entry-6',
        date: '2022-08-15',
        type: 'wisdom',
        title: 'Landmark Wisdom Course',
        description: 'Participated in Landmark Education programs, transforming understanding of fulfillment and possibility.',
        wisdom: 'Fulfillment comes from being authentic to who you are, not from achieving what you want.',
        impact: 'transformational'
    }
];

// Sample milestones data
const milestones = [
    {
        title: 'First Business Success',
        date: '2012',
        description: 'Successfully launched and scaled first tech venture',
        type: 'professional',
        impact: 'high'
    },
    {
        title: 'Marriage & Partnership',
        date: '2016',
        description: 'Found life partner and learned the art of conscious relationship',
        type: 'relationship',
        impact: 'transformational'
    },
    {
        title: 'Spiritual Awakening',
        date: '2018',
        description: 'Deep spiritual experience that shifted entire worldview',
        type: 'spiritual',
        impact: 'transformational'
    },
    {
        title: 'Health Transformation',
        date: '2019',
        description: 'Overcame chronic health issues through holistic approach',
        type: 'health',
        impact: 'high'
    },
    {
        title: 'Financial Freedom',
        date: '2021',
        description: 'Achieved financial independence and shifted to abundance mindset',
        type: 'financial',
        impact: 'high'
    },
    {
        title: 'Wisdom Integration',
        date: '2023',
        description: 'Created system for integrating wisdom teachings into daily life',
        type: 'wisdom',
        impact: 'transformational'
    }
];

// Sample contributions data
const sampleContributions = [
    {
        id: 'contrib-1',
        title: 'PVT Hostel Management System',
        description: 'Comprehensive hospitality management platform serving hostels across multiple locations, streamlining operations and enhancing guest experiences.',
        image: 'https://via.placeholder.com/300x200/9333ea/ffffff?text=PVT+Hostel',
        tags: ['Technology', 'Hospitality', 'System Design']
    },
    {
        id: 'contrib-2',
        title: 'Personal Wisdom Integration Platform',
        description: 'Interactive platform for personal development, combining Landmark Education methodology with practical life application and progress tracking.',
        image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Wisdom+Course',
        tags: ['Personal Development', 'Education', 'Transformation']
    },
    {
        id: 'contrib-3',
        title: 'Legal Infrastructure AI',
        description: 'AI-powered legal document analysis and case management system, making legal services more accessible and efficient.',
        image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Legal+AI',
        tags: ['AI/ML', 'Legal Tech', 'Justice']
    }
];

// Load autobiography data
function loadAutobiographyData() {
    const saved = localStorage.getItem('autobiographyData');
    if (saved) {
        autobiographyData = JSON.parse(saved);
    } else {
        // Initialize with sample data
        autobiographyData.entries = sampleEntries;
        autobiographyData.contributions = sampleContributions;
        saveAutobiographyData();
    }
    renderCurrentView();
}

// Save autobiography data
function saveAutobiographyData() {
    localStorage.setItem('autobiographyData', JSON.stringify(autobiographyData));
}

// Current view management
let currentView = 'timeline';

function showView(view) {
    currentView = view;
    
    // Hide all views
    document.querySelectorAll('#timeline-view, #themes-view, #milestones-view, #add-entry-view').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected view
    document.getElementById(`${view}-view`).classList.remove('hidden');
    
    // Update button states
    document.querySelectorAll('button[id$="-btn"]').forEach(btn => {
        btn.classList.remove('bg-white', 'bg-opacity-100', 'text-purple-600');
        btn.classList.add('bg-white', 'bg-opacity-20');
    });
    
    const activeBtn = document.getElementById(`${view}-btn`) || document.getElementById('add-btn');
    if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'bg-opacity-20');
        activeBtn.classList.add('bg-white', 'bg-opacity-100', 'text-purple-600');
    }
    
    renderCurrentView();
}

// Render current view
function renderCurrentView() {
    switch(currentView) {
        case 'timeline':
            renderTimeline();
            break;
        case 'milestones':
            renderMilestones();
            break;
        case 'themes':
            // Themes view is static HTML
            break;
        case 'add-entry':
            // Form is static HTML
            break;
    }
    renderContributions();
}

// Render timeline
function renderTimeline() {
    const timeline = document.getElementById('life-timeline');
    if (!timeline) return;
    
    const sortedEntries = [...autobiographyData.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = sortedEntries.map((entry, index) => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const typeIcons = {
            milestone: '🎯',
            relationship: '❤️',
            professional: '💼',
            spiritual: '🧘',
            health: '🌱',
            financial: '💰',
            creative: '🎨',
            wisdom: '💡',
            challenge: '⚡',
            celebration: '🎉'
        };
        
        const impactColors = {
            low: 'bg-blue-600',
            medium: 'bg-yellow-600',
            high: 'bg-orange-600',
            transformational: 'bg-red-600'
        };
        
        return `
            <div class="timeline-item">
                <div class="timeline-dot ${impactColors[entry.impact] || 'bg-purple-600'}">
                    ${typeIcons[entry.type] || '📅'}
                </div>
                <div class="timeline-content">
                    <div class="timeline-date">${formattedDate}</div>
                    <h3 class="timeline-title">${entry.title}</h3>
                    <p class="timeline-description mb-3">${entry.description}</p>
                    ${entry.wisdom ? `
                        <div class="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
                            <h4 class="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Key Wisdom:</h4>
                            <p class="text-sm text-purple-600 dark:text-purple-400 italic">"${entry.wisdom}"</p>
                        </div>
                    ` : ''}
                    <div class="mt-3 flex items-center justify-between">
                        <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full capitalize">${entry.type}</span>
                        <span class="text-xs px-2 py-1 ${impactColors[entry.impact]} text-white rounded-full capitalize">${entry.impact} Impact</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render milestones
function renderMilestones() {
    const grid = document.getElementById('milestones-grid');
    if (!grid) return;
    
    grid.innerHTML = milestones.map(milestone => {
        const typeIcons = {
            milestone: '🎯',
            relationship: '❤️',
            professional: '💼',
            spiritual: '🧘',
            health: '🌱',
            financial: '💰',
            creative: '🎨',
            wisdom: '💡',
            challenge: '⚡',
            celebration: '🎉'
        };
        
        const impactBadges = {
            low: 'badge bronze',
            medium: 'badge silver', 
            high: 'badge gold',
            transformational: 'badge bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
        };
        
        return `
            <div class="card">
                <div class="text-3xl mb-4 text-center">${typeIcons[milestone.type] || '📅'}</div>
                <h3 class="text-xl font-bold mb-2">${milestone.title}</h3>
                <div class="text-sm text-purple-600 dark:text-purple-400 mb-3">${milestone.date}</div>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${milestone.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full capitalize">${milestone.type}</span>
                    <span class="${impactBadges[milestone.impact]}">${milestone.impact}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render contributions
function renderContributions() {
    const grid = document.getElementById('contributions-grid');
    if (!grid) return;
    
    const contributionItems = autobiographyData.contributions.map(contrib => `
        <div class="contribution-item">
            <img src="${contrib.image || 'https://via.placeholder.com/300x200/9333ea/ffffff?text=' + encodeURIComponent(contrib.title)}" alt="${contrib.title}" class="contribution-image">
            <div class="contribution-content">
                <h3 class="contribution-title">${contrib.title}</h3>
                <p class="contribution-description">${contrib.description}</p>
                <div class="contribution-tags">
                    ${contrib.tags.map(tag => `<span class="contribution-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    const addButton = `
        <div class="contribution-item border-2 border-dashed border-purple-300 dark:border-purple-600 flex items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors" onclick="showAddContribution()">
            <div class="text-center">
                <div class="text-4xl text-purple-400 mb-2">+</div>
                <p class="text-purple-600 dark:text-purple-400 font-medium">Add New Contribution</p>
            </div>
        </div>
    `;
    
    grid.innerHTML = contributionItems + addButton;
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    loadAutobiographyData();
    
    const form = document.getElementById('autobiography-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addEntry();
        });
    }
    
    const contributionForm = document.getElementById('contribution-form');
    if (contributionForm) {
        contributionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addContribution();
        });
    }
});

// Add new entry
function addEntry() {
    const form = document.getElementById('autobiography-form');
    const formData = new FormData(form);
    
    const entry = {
        id: 'entry-' + Date.now(),
        date: document.getElementById('entry-date').value,
        type: document.getElementById('entry-type').value,
        title: document.getElementById('entry-title').value,
        description: document.getElementById('entry-description').value,
        wisdom: document.getElementById('entry-wisdom').value,
        impact: document.getElementById('entry-impact').value
    };
    
    autobiographyData.entries.push(entry);
    saveAutobiographyData();
    
    // Clear form
    form.reset();
    
    // Show success and switch to timeline
    showNotification('Entry added successfully!', 'success');
    showView('timeline');
}

// Clear form
function clearForm() {
    document.getElementById('autobiography-form').reset();
}

// Show add contribution modal
function showAddContribution() {
    document.getElementById('contribution-modal').classList.remove('hidden');
    document.getElementById('contribution-modal').classList.add('flex');
}

// Hide add contribution modal
function hideAddContribution() {
    document.getElementById('contribution-modal').classList.add('hidden');
    document.getElementById('contribution-modal').classList.remove('flex');
    document.getElementById('contribution-form').reset();
}

// Add new contribution
function addContribution() {
    const title = document.getElementById('contrib-title').value;
    const description = document.getElementById('contrib-description').value;
    const image = document.getElementById('contrib-image').value;
    const tags = document.getElementById('contrib-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const contribution = {
        id: 'contrib-' + Date.now(),
        title,
        description,
        image: image || `https://via.placeholder.com/300x200/9333ea/ffffff?text=${encodeURIComponent(title)}`,
        tags
    };
    
    autobiographyData.contributions.push(contribution);
    saveAutobiographyData();
    
    hideAddContribution();
    renderContributions();
    showNotification('Contribution added successfully!', 'success');
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

// Export autobiography data
function exportAutobiography() {
    const dataStr = JSON.stringify(autobiographyData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autobiography-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Autobiography exported successfully!', 'success');
}