// Simple JavaScript for Wisdom Course

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const html = document.documentElement;

// Check for saved dark mode preference
const darkMode = localStorage.getItem('darkMode');
if (darkMode === 'true') {
    html.classList.add('dark');
}

// Toggle dark mode
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('darkMode', html.classList.contains('dark'));
    });
}

// Simple mobile menu toggle (if needed)
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Language Switcher (if present)
const languageSwitcher = document.getElementById('language-switcher');
if (languageSwitcher) {
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSwitcher.value = savedLanguage;
    
    languageSwitcher.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('language', lang);
        // Update page content based on language if needed
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Simple page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Load incidents for tracker page (if needed)
async function loadIncidents() {
    if (!document.getElementById('incidents-table')) return;
    
    try {
        const response = await fetch('data/incidents.json');
        const incidents = await response.json();
        const tableBody = document.getElementById('incidents-table');
        
        tableBody.innerHTML = incidents.map(incident => `
            <tr class="border-b">
                <td class="py-3 px-4">${incident.date}</td>
                <td class="py-3 px-4">${incident.type}</td>
                <td class="py-3 px-4">${incident.description}</td>
                <td class="py-3 px-4">
                    <span class="status-${incident.status}"></span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading incidents:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadIncidents();
    console.log('Wisdom Course initialized');
});