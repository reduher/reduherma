/**
 * ===================================
 * BESORAH YESHUA MINISTRY - NAVIGATION SYSTEM
 * Complete JavaScript for Header Nav & Breadcrumbs
 * ===================================
 */

// ===================================
// CONFIGURATION
// ===================================

const NAV_CONFIG = {
    scrollThreshold: 50,
    hideOnScrollDown: false, // Set to true if you want auto-hide nav
    breadcrumbEnabled: true,
    
    // Page titles mapping for breadcrumbs
    pageTitles: {
        'index.html': 'Home',
        'about.html': 'About Us',
        'events.html': 'Events',
        'partnership.html': 'Partnership',
        'contact.html': 'Contact',
        'donate.html': 'Donate',
        // Add more pages as needed
    },
    
    // Parent pages for hierarchical breadcrumbs
    pageHierarchy: {
        'events.html': ['index.html'],
        'partnership.html': ['index.html'],
        'donate.html': ['index.html'],
        'about.html': ['index.html'],
        'contact.html': ['index.html'],
        // Example: 'event-details.html': ['index.html', 'events.html']
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
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

/**
 * Get current page filename
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
}

/**
 * Check if current page is homepage
 */
function isHomePage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '';
}

/**
 * Get page title from config or filename
 */
function getPageTitle(filename) {
    if (NAV_CONFIG.pageTitles[filename]) {
        return NAV_CONFIG.pageTitles[filename];
    }
    
    // Convert filename to title (e.g., 'about-us.html' -> 'About Us')
    return filename
        .replace('.html', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ===================================
// HEADER NAVIGATION
// ===================================

class HeaderNavigation {
    constructor() {
        this.header = document.querySelector('header');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.lastScroll = 0;
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        // Initialize scroll handling
        this.handleScroll();
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));
        
        // Initialize hamburger menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.hamburger.contains(e.target)) {
                this.toggleMenu();
            }
        });
        
        // Set active page
        this.setActivePage();
        
        // Mark header as loaded (removes will-change)
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.header.classList.add('loaded');
            }, 300);
        });
        
        // Handle escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.toggleMenu();
            }
        });
    }
    
    /**
     * Handle scroll effects
     */
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for styling
        if (currentScroll > NAV_CONFIG.scrollThreshold) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
        
        // Optional: Hide/show header on scroll
        if (NAV_CONFIG.hideOnScrollDown) {
            if (currentScroll > this.lastScroll && currentScroll > 100) {
                // Scrolling down
                this.header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.header.style.transform = 'translateY(0)';
            }
        }
        
        this.lastScroll = currentScroll;
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
            this.hamburger.setAttribute('aria-expanded', 'true');
        } else {
            document.body.style.overflow = '';
            this.hamburger.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Set active page in navigation
     */
    setActivePage() {
        const currentPage = getCurrentPage();
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === 'index.html' && href === '/') ||
                (currentPage === '' && href === '/')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
}

// ===================================
// BREADCRUMB NAVIGATION
// ===================================

class BreadcrumbNavigation {
    constructor() {
        this.wrapper = null;
        this.init();
    }
    
    init() {
        if (!NAV_CONFIG.breadcrumbEnabled) return;
        
        // Don't show breadcrumb on homepage
        if (isHomePage()) {
            document.body.classList.add('home-page');
            return;
        }
        
        this.createBreadcrumb();
    }
    
    /**
     * Create breadcrumb navigation
     */
    createBreadcrumb() {
        const currentPage = getCurrentPage();
        const breadcrumbItems = this.buildBreadcrumbPath(currentPage);
        
        // Create breadcrumb wrapper
        this.wrapper = document.createElement('nav');
        this.wrapper.className = 'breadcrumb-wrapper';
        this.wrapper.setAttribute('aria-label', 'Breadcrumb');
        
        // Create container
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        // Create breadcrumb list
        const breadcrumbList = document.createElement('ol');
        breadcrumbList.className = 'breadcrumb';
        breadcrumbList.setAttribute('itemscope', '');
        breadcrumbList.setAttribute('itemtype', 'https://schema.org/BreadcrumbList');
        
        // Build breadcrumb items
        breadcrumbItems.forEach((item, index) => {
            const listItem = this.createBreadcrumbItem(item, index, breadcrumbItems.length);
            breadcrumbList.appendChild(listItem);
        });
        
        container.appendChild(breadcrumbList);
        this.wrapper.appendChild(container);
        
        // Insert after header
        const header = document.querySelector('header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(this.wrapper, header.nextSibling);
        }
        
        // Animate in
        setTimeout(() => {
            this.wrapper.style.opacity = '1';
        }, 100);
    }
    
    /**
     * Build breadcrumb path based on page hierarchy
     */
    buildBreadcrumbPath(currentPage) {
        const path = [];
        
        // Always start with home
        path.push({
            title: 'Home',
            url: 'index.html',
            isHome: true
        });
        
        // Add parent pages if they exist
        if (NAV_CONFIG.pageHierarchy[currentPage]) {
            NAV_CONFIG.pageHierarchy[currentPage].forEach(parentPage => {
                if (parentPage !== 'index.html') { // Skip home, already added
                    path.push({
                        title: getPageTitle(parentPage),
                        url: parentPage,
                        isHome: false
                    });
                }
            });
        }
        
        // Add current page
        path.push({
            title: getPageTitle(currentPage),
            url: currentPage,
            isHome: false,
            isCurrent: true
        });
        
        return path;
    }
    
    /**
     * Create individual breadcrumb item
     */
    createBreadcrumbItem(item, index, totalItems) {
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';
        listItem.setAttribute('itemprop', 'itemListElement');
        listItem.setAttribute('itemscope', '');
        listItem.setAttribute('itemtype', 'https://schema.org/ListItem');
        
        // Create link or text
        if (item.isCurrent) {
            // Current page - no link
            const span = document.createElement('span');
            span.textContent = item.title;
            span.setAttribute('itemprop', 'name');
            span.setAttribute('aria-current', 'page');
            listItem.appendChild(span);
        } else {
            // Link to page
            const link = document.createElement('a');
            link.href = item.url;
            link.setAttribute('itemprop', 'item');
            
            if (item.isHome) {
                // Home icon
                const icon = document.createElement('i');
                icon.className = 'fas fa-home breadcrumb-home';
                link.appendChild(icon);
                
                const span = document.createElement('span');
                span.className = 'sr-only';
                span.textContent = item.title;
                link.appendChild(span);
            } else {
                const span = document.createElement('span');
                span.setAttribute('itemprop', 'name');
                span.textContent = item.title;
                link.appendChild(span);
            }
            
            listItem.appendChild(link);
        }
        
        // Add position for schema.org
        const positionMeta = document.createElement('meta');
        positionMeta.setAttribute('itemprop', 'position');
        positionMeta.content = (index + 1).toString();
        listItem.appendChild(positionMeta);
        
        // Add separator (except for last item)
        if (index < totalItems - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            separator.setAttribute('aria-hidden', 'true');
            listItem.appendChild(separator);
        }
        
        return listItem;
    }
}

// ===================================
// SCROLL TO TOP BUTTON (BONUS)
// ===================================

class ScrollToTop {
    constructor() {
        this.button = this.createButton();
        this.init();
    }
    
    createButton() {
        const btn = document.createElement('button');
        btn.id = 'scrollTopBtn';
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.style.display = 'none';
        document.body.appendChild(btn);
        return btn;
    }
    
    init() {
        window.addEventListener('scroll', debounce(() => {
            if (window.pageYOffset > 300) {
                this.button.style.display = 'flex';
            } else {
                this.button.style.display = 'none';
            }
        }, 100));
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new HeaderNavigation();
    
    // Initialize breadcrumb
    new BreadcrumbNavigation();
    
    // Initialize scroll to top button
    new ScrollToTop();
    
    console.log('✅ Besorah Yeshua Ministry - Navigation System Initialized');
});

// ===================================
// EXPORT FOR MODULE USE (OPTIONAL)
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HeaderNavigation,
        BreadcrumbNavigation,
        ScrollToTop,
        NAV_CONFIG
    };
}