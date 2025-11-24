// ===================================
// BESORAH YESHUA MINISTRY - MAIN JAVASCRIPT
// Complete Reorganized & Optimized Version
// Version: 4.0 - Production Ready
// ===================================

'use strict';

// ===================================
// GLOBAL STATE & CONFIGURATION
// ===================================
const BesorahYeshua = {
    // Application State
    isMobile: window.innerWidth <= 968,
    isMenuOpen: false,
    scrollPosition: 0,
    init: false,
    
    // Configuration
    config: {
        breakpoints: {
            mobile: 768,
            tablet: 968,
            desktop: 1200
        },
        animation: {
            duration: 300,
            scrollOffset: 80
        },
        storage: {
            prefix: 'besorah_'
        }
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================
class Utils {
    // Performance optimization
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validation
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Formatting
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // DOM helpers
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Storage
    static supportsLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// ===================================
// ERROR HANDLER
// ===================================
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }
    
    init() {
        window.addEventListener('error', (e) => this.handleError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleError(e));
    }
    
    handleError(error) {
        const errorData = {
            message: error.message || error.reason,
            stack: error.error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.errors.push(errorData);
        console.error('Error logged:', errorData);
        
        // Show user-friendly message in production
        if (!window.location.hostname.includes('localhost')) {
            this.showErrorToUser();
        }
    }
    
    showErrorToUser() {
        if (document.querySelector('.error-notification')) return;
        
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div style="position: fixed; top: 90px; right: 20px; background: #dc2626; 
                 color: white; padding: 1rem 1.5rem; border-radius: 8px; 
                 box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; max-width: 300px; 
                 animation: slideInRight 0.3s ease;">
                <strong>⚠️ Something went wrong</strong>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Please refresh the page and try again.</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// ===================================
// LOGO HANDLER
// ===================================
class LogoLoader {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleLogos();
            this.preloadLogo();
        });
    }
    
    handleLogos() {
        const logos = document.querySelectorAll('.logo, .footer-logo');
        
        logos.forEach(logo => {
            logo.addEventListener('error', () => this.createFallback(logo));
            
            if (!logo.src || logo.src.includes('undefined')) {
                logo.src = '/images/logo.png';
            }
            
            if (logo.complete && logo.naturalHeight === 0) {
                this.createFallback(logo);
            }
        });
    }
    
    createFallback(imgElement) {
        console.warn('Logo failed to load:', imgElement.src);
        
        const isFooter = imgElement.classList.contains('footer-logo');
        const size = isFooter ? 80 : 50;
        const fontSize = isFooter ? 2 : 1.2;
        
        const fallback = document.createElement('div');
        fallback.className = imgElement.className + ' logo-fallback';
        fallback.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(135deg, #205782, #2d6fa0);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${fontSize}rem;
            box-shadow: 0 4px 15px rgba(242, 132, 47, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        fallback.textContent = 'BY';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', 'Besorah Yeshua Logo');
        
        imgElement.parentNode.replaceChild(fallback, imgElement);
    }
    
    preloadLogo() {
        const preloadImg = new Image();
        const paths = ['/images/logo.png', './images/logo.png', '../images/logo.png'];
        
        const tryLoad = (index) => {
            if (index >= paths.length) return;
            
            preloadImg.src = paths[index];
            preloadImg.onerror = () => tryLoad(index + 1);
            preloadImg.onload = () => {
                console.log('Logo preloaded from:', paths[index]);
            };
        };
        
        tryLoad(0);
    }
}

// ===================================
// NAVIGATION SYSTEM
// ===================================
class Navigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        
        if (this.hamburger && this.navMenu) {
            this.init();
        }
    }
    
    init() {
        this.hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 968) {
                    this.close();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.hamburger.contains(e.target) && 
                !this.navMenu.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.hamburger.focus();
            }
        });
        
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 968 && this.isOpen) {
                this.close();
            }
            BesorahYeshua.isMobile = window.innerWidth <= 968;
        }, 250));

        this.updateARIA();
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        this.isOpen = true;
        BesorahYeshua.isMenuOpen = true;
        
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        this.updateARIA();
        
        // Prevent body scroll
        BesorahYeshua.scrollPosition = window.pageYOffset;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${BesorahYeshua.scrollPosition}px`;
        document.body.style.width = '100%';
        
        const firstLink = this.navMenu.querySelector('.nav-link');
        if (firstLink) setTimeout(() => firstLink.focus(), 100);
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        BesorahYeshua.isMenuOpen = false;
        
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.updateARIA();
        
        // Restore scroll
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
        window.scrollTo(0, BesorahYeshua.scrollPosition);
    }
    
    updateARIA() {
        this.hamburger.setAttribute('aria-expanded', this.isOpen.toString());
        this.navMenu.setAttribute('aria-hidden', (!this.isOpen).toString());
    }
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScroll = 0;
        
        if (this.header) {
            this.init();
        }
    }
    
    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            this.lastScroll = currentScroll;
        }, 100));
    }
}

// ===================================
// SCROLL TO TOP
// ===================================
class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollTopBtn');
        if (this.button) {
            this.init();
        }
    }
    
    init() {
        window.addEventListener('scroll', Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                this.show();
            } else {
                this.hide();
            }
        }, 200));
        
        this.button.addEventListener('click', () => this.scrollToTop());
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }
    
    show() {
        this.button.style.display = 'flex';
        setTimeout(() => this.button.style.opacity = '1', 10);
    }
    
    hide() {
        this.button.style.opacity = '0';
        setTimeout(() => {
            if (window.pageYOffset <= 300) {
                this.button.style.display = 'none';
            }
        }, 300);
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ===================================
// FORM VALIDATOR
// ===================================
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showFirstError();
            }
        });
        
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }
    
    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';
        
        // Required check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (type === 'email' && value) {
            if (!Utils.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (Ethiopian format)
        if (type === 'tel' && value) {
            const phoneRegex = /^(\+251|0)?[9][0-9]{8}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid Ethiopian phone number';
            }
        }
        
        this.updateFieldUI(field, isValid, errorMessage);
        return isValid;
    }
    
    updateFieldUI(field, isValid, errorMessage) {
        const errorElement = field.nextElementSibling;
        
        if (isValid) {
            field.classList.remove('error');
            field.setAttribute('aria-invalid', 'false');
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        } else {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        }
    }
    
    showFirstError() {
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// ===================================
// FORM AUTO-SAVE
// ===================================
class FormAutoSave {
    constructor(formId, storageKey) {
        this.form = document.getElementById(formId);
        this.storageKey = storageKey || `form_draft_${formId}`;
        
        if (this.form && Utils.supportsLocalStorage()) {
            this.init();
        }
    }
    
    init() {
        this.loadDraft();
        
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', Utils.debounce(() => {
                this.saveDraft();
            }, 1000));
        });
        
        this.form.addEventListener('submit', () => {
            this.clearDraft();
        });
    }
    
    saveDraft() {
        const formData = new FormData(this.form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key !== 'website' && key !== 'password') {
                data[key] = value;
            }
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    
    loadDraft() {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    const input = this.form.querySelector(`[name="${key}"]`);
                    if (input && !input.value) {
                        input.value = data[key];
                    }
                });
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        }
    }
    
    clearDraft() {
        localStorage.removeItem(this.storageKey);
    }
}

// ===================================
// ANIMATION CONTROLLER
// ===================================
class AnimationController {
    static initScrollAnimations() {
        const elements = document.querySelectorAll(
            '.mission-card, .event-card, .partnership-card, ' +
            '.benefit-card, .impact-card, .testimonial-card, ' +
            '.zone-card, .area-card'
        );
        
        if (elements.length === 0) return;
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        
                        setTimeout(() => {
                            entry.target.style.transition = 'all 0.6s ease';
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            elements.forEach(el => observer.observe(el));
        }
    }

    static initCounters() {
        const counters = document.querySelectorAll('.stat-number, .impact-number, .number');
        
        if (counters.length === 0) return;
        
        const animateCounter = (counter) => {
            const text = counter.textContent;
            const target = parseInt(text.replace(/[^0-9]/g, ''));
            const hasPlus = text.includes('+');
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const update = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                }
            };
            
            update();
        };
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            counters.forEach(counter => observer.observe(counter));
        }
    }
}

// ===================================
// PAGE COMPONENTS
// ===================================
class PageComponents {
    // Active page detection
    static setActivePage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (href === page || 
                (page === '' && href === 'index.html') ||
                (page === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Smooth scrolling
    static initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                    setTimeout(() => target.removeAttribute('tabindex'), 1000);
                }
            });
        });
    }

    // Event filters
    static initEventFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventCards = document.querySelectorAll('.event-card');
        
        if (filterButtons.length === 0 || eventCards.length === 0) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                eventCards.forEach((card, index) => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.setAttribute('aria-hidden', 'false');
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        card.setAttribute('aria-hidden', 'true');
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // Donation form
    static initDonationForm() {
        const amountButtons = document.querySelectorAll('.amount-btn');
        const customInput = document.querySelector('.custom-amount-input');
        const customField = document.getElementById('customAmount');
        const displayAmount = document.getElementById('displayAmount');
        
        if (amountButtons.length === 0) return;
        
        amountButtons.forEach(button => {
            button.addEventListener('click', function() {
                const amount = this.getAttribute('data-amount');
                
                amountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                if (amount === 'custom') {
                    if (customInput) {
                        customInput.style.display = 'block';
                        customField?.focus();
                    }
                    PageComponents.updateDisplay(customField?.value || 100);
                } else {
                    if (customInput) customInput.style.display = 'none';
                    PageComponents.updateDisplay(amount);
                }
            });
        });
        
        if (customField) {
            customField.addEventListener('input', function() {
                const value = parseFloat(this.value) || 0;
                if (value > 0) {
                    PageComponents.updateDisplay(value);
                }
            });
        }
    }

    static updateDisplay(amount) {
        const displayAmount = document.getElementById('displayAmount');
        if (displayAmount) {
            displayAmount.textContent = Utils.formatCurrency(amount);
        }
    }
}

// ===================================
// ACCESSIBILITY FEATURES
// ===================================
class Accessibility {
    static initSkipLink() {
        const skipLink = document.querySelector('.skip-to-content');
        if (!skipLink) return;
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const main = document.querySelector('main') || 
                         document.querySelector('#main-content') ||
                         document.querySelector('.hero');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus({ preventScroll: false });
                main.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    static announcePageChange(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        announcement.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        `;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================
class Performance {
    static initVideoOptimization() {
        const video = document.querySelector('.hero-video');
        
        if (!video) return;
        
        if (window.innerWidth < 768) {
            video.pause();
            video.style.display = 'none';
        }
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                video.pause();
            } else if (window.innerWidth >= 768) {
                video.play().catch(e => console.log('Video autoplay blocked'));
            }
        });
    }

    static initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }

    static preventLayoutShifts() {
        document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
        });
    }
}

// ===================================
// OFFLINE & SERVICE WORKER
// ===================================
class OfflineManager {
    static init() {
        window.addEventListener('online', () => {
            console.log('Connection restored');
            const notification = document.getElementById('offlineNotification');
            if (notification) notification.remove();
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            if (!document.getElementById('offlineNotification')) {
                const notice = document.createElement('div');
                notice.id = 'offlineNotification';
                notice.innerHTML = `
                    <div style="position: fixed; bottom: 20px; left: 20px; background: #f59e0b; 
                         color: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                         z-index: 9999; max-width: 300px;">
                        <strong>⚠️ You're offline</strong>
                        <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Some features may not work.</p>
                    </div>
                `;
                document.body.appendChild(notice);
            }
        });

    }
}

// ===================================
// PRAYER MODAL SYSTEM
// ===================================
class PrayerModal {
    static openModal(type) {
        const modal = document.getElementById('prayerModal');
        const prayerTypeInput = document.getElementById('prayerType');
        
        if (modal && prayerTypeInput) {
            prayerTypeInput.value = type;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            const focusableElements = modal.querySelectorAll('button, input, textarea, select, a[href]');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    static closeModal() {
        const modal = document.getElementById('prayerModal');
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            const prayerForm = document.getElementById('prayerForm');
            if (prayerForm) {
                prayerForm.reset();
                const errors = prayerForm.querySelectorAll('.field-error');
                errors.forEach(error => error.remove());
            }
        }
    }

    static init() {
        const prayerModal = document.getElementById('prayerModal');
        if (!prayerModal) return;
        
        prayerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                PrayerModal.closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && prayerModal.classList.contains('active')) {
                PrayerModal.closeModal();
            }
        });
        
        // Swipe to close for mobile
        let touchStartY = 0;
        let touchStartX = 0;
        
        prayerModal.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        prayerModal.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const diffY = touchStartY - touchEndY;
            const diffX = Math.abs(touchStartX - touchEndX);
            
            if (diffY < -100 && diffX < 50) {
                PrayerModal.closeModal();
            }
        }, { passive: true });
    }
}

// ===================================
// INITIALIZATION CONTROLLER
// ===================================
class AppInitializer {
    static init() {
        console.log('Besorah Yeshua Ministry - Initializing...');
        
        try {
            // Core systems
            new ErrorHandler();
            new LogoLoader();
            
            // Navigation & UI
            new Navigation();
            new HeaderScroll();
            new ScrollToTop();
            
            // Page setup
            PageComponents.setActivePage();
            PageComponents.initSmoothScroll();
            Accessibility.initSkipLink();
            
            // Animations
            AnimationController.initScrollAnimations();
            AnimationController.initCounters();
            
            // Performance
            Performance.initVideoOptimization();
            Performance.initLazyLoading();
            Performance.preventLayoutShifts();
            
            // Page-specific components
            PageComponents.initEventFilters();
            PageComponents.initDonationForm();
            PrayerModal.init();
            
            // Offline & service worker
            OfflineManager.init();
            
            // Form validators
            const formIds = ['contactForm', 'prayerForm', 'registrationForm', 'newsletterForm'];
            formIds.forEach(id => new FormValidator(id));
            
            // Form auto-save
            if (document.getElementById('contactForm')) {
                new FormAutoSave('contactForm');
            }
            
            // Final setup
            this.hidePageLoader();
            this.updateCopyrightYear();
            BesorahYeshua.init = true;
            
            console.log('✅ Initialization complete');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    static hidePageLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }, 300);
        }
        document.body.classList.add('loaded');
    }

    static updateCopyrightYear() {
        const year = new Date().getFullYear();
        const yearElements = document.querySelectorAll('#year, .copyright-year');
        yearElements.forEach(el => el.textContent = year);
    }
}





// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add touch feedback to all interactive elements
    const touchElements = document.querySelectorAll('.nav-link, .btn-donate, .hamburger, .nav-logo a');
    
    touchElements.forEach(element => {
        // Touch start
        element.addEventListener('touchstart', function(e) {
            this.classList.add('touched');
            
            // Create ripple effect for nav links
            if (this.classList.contains('nav-link')) {
                const ripple = document.createElement('span');
                ripple.classList.add('touch-ripple');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.touches[0].clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.touches[0].clientY - rect.top - size/2) + 'px';
                this.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    if (ripple.parentNode === this) {
                        this.removeChild(ripple);
                    }
                }, 600);
            }
        }, { passive: true });
        
        // Touch end
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touched');
            }, 150);
        }, { passive: true });
        
        // Prevent sticky hover states on touch devices
        element.addEventListener('touchcancel', function() {
            this.classList.remove('touched');
        }, { passive: true });
    });
});








// ===================================
// GLOBAL EXPORTS & INITIALIZATION
// ===================================
window.BesorahYeshua = BesorahYeshua;
window.openModal = PrayerModal.openModal;
window.closeModal = PrayerModal.closeModal;

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
        }, 0);
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', AppInitializer.init);

// ===================================
// ADD REQUIRED CSS ANIMATIONS
// ===================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('🙏 Besorah Yeshua Ministry - Main.js loaded successfully');