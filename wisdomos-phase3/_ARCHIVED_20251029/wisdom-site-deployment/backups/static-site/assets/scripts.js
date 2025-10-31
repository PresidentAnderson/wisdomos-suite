// Light Theme Only - No Dark Mode

// Language Switcher
const languageSwitcher = document.getElementById('language-switcher');
const translations = {
    en: {
        'hero-title': 'Wisdom Course Integration',
        'hero-subtitle': 'Transforming insights into lived experience',
        'hero-quote': '"Fulfillment is authored through clarity, conversation, and commitment."',
        'btn-explore': 'Explore Tools',
        'btn-tracker': 'View Tracker',
        'purpose-title': 'Purpose',
        'purpose-text': 'This project documents my full participation in the Wisdom Unlimited Course, integrating its tools with my real commitments in work, love, finance, and community. It serves as both a personal transformation archive and a practical operating system for my life.',
        'quick-links': 'Quick Access',
        'nav-home': 'Home',
        'nav-tools': 'Tools',
        'nav-life-areas': 'Life Areas',
        'nav-tracker': 'Tracker',
        'nav-relationships': 'Relationships',
        'nav-legacy': 'Legacy',
        'incident-form-title': 'Report New Incident',
        'date-label': 'Date',
        'type-label': 'Type',
        'description-label': 'Description',
        'submit-btn': 'Submit'
    },
    fr: {
        'hero-title': 'Intégration du Cours de Sagesse',
        'hero-subtitle': 'Transformer les idées en expérience vécue',
        'hero-quote': '"L\'épanouissement s\'écrit à travers la clarté, la conversation et l\'engagement."',
        'btn-explore': 'Explorer les Outils',
        'btn-tracker': 'Voir le Suivi',
        'purpose-title': 'Objectif',
        'purpose-text': 'Ce projet documente ma participation complète au Cours de Sagesse Illimitée, intégrant ses outils avec mes engagements réels dans le travail, l\'amour, les finances et la communauté. Il sert à la fois d\'archive de transformation personnelle et de système d\'exploitation pratique pour ma vie.',
        'quick-links': 'Accès Rapide',
        'nav-home': 'Accueil',
        'nav-tools': 'Outils',
        'nav-life-areas': 'Domaines de Vie',
        'nav-tracker': 'Suivi',
        'nav-relationships': 'Relations',
        'nav-legacy': 'Héritage',
        'incident-form-title': 'Signaler un Nouvel Incident',
        'date-label': 'Date',
        'type-label': 'Type',
        'description-label': 'Description',
        'submit-btn': 'Soumettre'
    },
    ar: {
        'hero-title': 'دمج دورة الحكمة',
        'hero-subtitle': 'تحويل الأفكار إلى تجربة معاشة',
        'hero-quote': '"الإنجاز يُكتب من خلال الوضوح والمحادثة والالتزام"',
        'btn-explore': 'استكشف الأدوات',
        'btn-tracker': 'عرض المتتبع',
        'purpose-title': 'الهدف',
        'purpose-text': 'يوثق هذا المشروع مشاركتي الكاملة في دورة الحكمة اللامحدودة، ودمج أدواتها مع التزاماتي الحقيقية في العمل والحب والمال والمجتمع. إنه بمثابة أرشيف للتحول الشخصي ونظام تشغيل عملي لحياتي.',
        'quick-links': 'وصول سريع',
        'nav-home': 'الرئيسية',
        'nav-tools': 'الأدوات',
        'nav-life-areas': 'مجالات الحياة',
        'nav-tracker': 'المتتبع',
        'nav-relationships': 'العلاقات',
        'nav-legacy': 'الإرث',
        'incident-form-title': 'الإبلاغ عن حادثة جديدة',
        'date-label': 'التاريخ',
        'type-label': 'النوع',
        'description-label': 'الوصف',
        'submit-btn': 'إرسال'
    }
};

// Load saved language preference
const savedLanguage = localStorage.getItem('language') || 'en';
if (languageSwitcher) {
    languageSwitcher.value = savedLanguage;
}
updateLanguage(savedLanguage);

// Language switcher event
if (languageSwitcher) {
    languageSwitcher.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('language', lang);
        updateLanguage(lang);
    });
}

// Update language function
function updateLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const navKeys = ['nav-home', 'nav-tools', 'nav-life-areas', 'nav-tracker', 'nav-relationships', 'nav-legacy'];
    navLinks.forEach((link, index) => {
        if (translations[lang] && translations[lang][navKeys[index]]) {
            link.textContent = translations[lang][navKeys[index]];
        }
    });
}

// Load incidents for tracker page
async function loadIncidents() {
    if (!document.getElementById('incidents-table')) return;
    
    try {
        const response = await fetch('data/incidents.json');
        const incidents = await response.json();
        const lang = localStorage.getItem('language') || 'en';
        
        const tableBody = document.getElementById('incidents-table');
        tableBody.innerHTML = incidents.map(incident => `
            <tr class="border-b border-gray-200">
                <td class="py-3 px-4">${incident.date}</td>
                <td class="py-3 px-4">${incident.type[lang]}</td>
                <td class="py-3 px-4">${incident.description[lang]}</td>
                <td class="py-3 px-4">
                    <span class="status-${incident.status}"></span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading incidents:', error);
    }
}

// Load incidents on page load
document.addEventListener('DOMContentLoaded', loadIncidents);

// Enhanced Navigation System
class NavigationController {
    constructor() {
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.dropdownContainers = document.querySelectorAll('.dropdown-container');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupAnimations();
        this.setupKeyboardNavigation();
        this.syncLanguageSwitchers();
    }

    setupMobileMenu() {
        if (this.mobileMenuButton && this.mobileMenu) {
            this.mobileMenuButton.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.mobileMenuButton.contains(e.target) && 
                    !this.mobileMenu.contains(e.target) &&
                    this.mobileMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const isActive = this.mobileMenu.classList.contains('active');
        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenuButton.classList.add('active');
        this.mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate menu items
        this.animateMenuItems();
    }

    closeMobileMenu() {
        this.mobileMenuButton.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    animateMenuItems() {
        const menuItems = this.mobileMenu.querySelectorAll('.mobile-nav-item, .mobile-nav-subitem');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    setupDropdowns() {
        this.dropdownContainers.forEach(container => {
            const trigger = container.querySelector('.dropdown-trigger');
            const menu = container.querySelector('.dropdown-menu');

            if (trigger && menu) {
                // Mouse events
                let hoverTimeout;

                container.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    this.showDropdown(menu);
                });

                container.addEventListener('mouseleave', () => {
                    hoverTimeout = setTimeout(() => {
                        this.hideDropdown(menu);
                    }, 150);
                });

                // Focus events for accessibility
                trigger.addEventListener('focus', () => {
                    this.showDropdown(menu);
                });

                trigger.addEventListener('blur', (e) => {
                    if (!container.contains(e.relatedTarget)) {
                        setTimeout(() => this.hideDropdown(menu), 150);
                    }
                });

                // Click events for mobile
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.innerWidth < 768) {
                        const isVisible = menu.classList.contains('opacity-100');
                        if (isVisible) {
                            this.hideDropdown(menu);
                        } else {
                            this.showDropdown(menu);
                        }
                    }
                });
            }
        });
    }

    showDropdown(menu) {
        menu.classList.add('animate-fade-in-scale');
        menu.classList.remove('opacity-0', 'invisible', 'translate-y-2');
        menu.classList.add('opacity-100', 'visible', 'translate-y-0');
    }

    hideDropdown(menu) {
        menu.classList.remove('animate-fade-in-scale');
        menu.classList.add('opacity-0', 'invisible', 'translate-y-2');
        menu.classList.remove('opacity-100', 'visible', 'translate-y-0');
    }

    setupAnimations() {
        // Page transition animation
        const pageContent = document.body;
        pageContent.classList.add('page-transition');
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                pageContent.classList.add('loaded');
            }, 100);
        });

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.card, .module-card, .timeline-item').forEach(el => {
            observer.observe(el);
        });
    }

    setupKeyboardNavigation() {
        // Tab navigation for dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const activeElement = document.activeElement;
        const dropdownContainer = activeElement.closest('.dropdown-container');
        
        if (dropdownContainer) {
            const menu = dropdownContainer.querySelector('.dropdown-menu');
            const menuItems = menu.querySelectorAll('.dropdown-item');
            
            if (menu.classList.contains('opacity-100')) {
                // If we're tabbing out of the dropdown, close it
                setTimeout(() => {
                    if (!dropdownContainer.contains(document.activeElement)) {
                        this.hideDropdown(menu);
                    }
                }, 0);
            }
        }
    }


    syncLanguageSwitchers() {
        const mobileLanguageSwitcher = document.getElementById('mobile-language-switcher');
        const languageSwitcher = document.getElementById('language-switcher');

        if (mobileLanguageSwitcher && languageSwitcher) {
            // Sync initial values
            mobileLanguageSwitcher.value = languageSwitcher.value;

            // Sync changes
            mobileLanguageSwitcher.addEventListener('change', (e) => {
                languageSwitcher.value = e.target.value;
                languageSwitcher.dispatchEvent(new Event('change'));
            });

            languageSwitcher.addEventListener('change', (e) => {
                mobileLanguageSwitcher.value = e.target.value;
            });
        }
    }
}

// Interactive Elements Enhancement
class InteractiveElements {
    constructor() {
        this.setupButtonAnimations();
        this.setupCardInteractions();
        this.setupScrollEffects();
    }

    setupButtonAnimations() {
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px) scale(1.02)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });

            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(0) scale(0.98)';
            });

            btn.addEventListener('mouseup', () => {
                btn.style.transform = 'translateY(-2px) scale(1.02)';
            });
        });
    }

    setupCardInteractions() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupScrollEffects() {
        let ticking = false;

        function updateScrollEffects() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax effect for hero sections
            const heroSections = document.querySelectorAll('.hero, section[class*="gradient"]');
            heroSections.forEach(section => {
                section.style.transform = `translateY(${rate}px)`;
            });

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.setupLazyLoading();
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalResources() {
        const criticalPages = ['dashboard.html', 'wisdom-evolution.html'];
        criticalPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavigationController();
    new InteractiveElements();
    new PerformanceOptimizer();
    
    // Show loading complete
    console.log('🧠 WisdomOS Navigation System Loaded');
});