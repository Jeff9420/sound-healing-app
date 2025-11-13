/**
 * Responsive Header JavaScript
 * Handles hamburger menu, language selector, and sticky header behavior
 *
 * Features:
 * - Hamburger menu toggle (mobile)
 * - Language selector dropdown
 * - Sticky header on scroll
 * - Smooth scroll to sections
 * - Close menu on outside click
 * - Close menu on ESC key
 * - Accessibility support
 */

class ResponsiveHeader {
    constructor() {
        this.header = document.getElementById('mainHeader');
        this.hamburger = document.getElementById('navHamburger');
        this.menu = document.getElementById('navMenu');
        this.overlay = document.getElementById('navOverlay');
        this.languageToggle = document.getElementById('navLanguageToggle');
        this.languageDropdown = document.getElementById('navLanguageDropdown');
        this.languageOptions = document.querySelectorAll('.nav-language__option');

        this.isMenuOpen = false;
        this.isLanguageOpen = false;
        this.lastScrollY = window.scrollY;

        this.init();
    }

    init() {
        this.setupHamburgerMenu();
        this.setupLanguageSelector();
        this.setupStickyHeader();
        this.setupSmoothScroll();
        this.setupKeyboardNavigation();
    }

    /**
     * Hamburger Menu
     */
    setupHamburgerMenu() {
        // Toggle menu on hamburger click
        this.hamburger?.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close menu on overlay click
        this.overlay?.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close menu on navigation link click (mobile)
        const navLinks = document.querySelectorAll('.nav-links__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    this.closeMenu();
                }
            });
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.hamburger?.setAttribute('aria-expanded', 'true');
        this.menu?.classList.add('nav-menu--open');
        this.overlay?.classList.add('nav-overlay--visible');

        // Prevent body scroll on mobile
        document.body.style.overflow = 'hidden';

        console.log('📱 Mobile menu opened');
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.hamburger?.setAttribute('aria-expanded', 'false');
        this.menu?.classList.remove('nav-menu--open');
        this.overlay?.classList.remove('nav-overlay--visible');

        // Restore body scroll
        document.body.style.overflow = '';

        console.log('📱 Mobile menu closed');
    }

    /**
     * Language Selector
     */
    setupLanguageSelector() {
        // Toggle dropdown
        this.languageToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLanguageDropdown();
        });

        // Select language
        this.languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectLanguage(option);
            });
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-language')) {
                this.closeLanguageDropdown();
            }
        });
    }

    toggleLanguageDropdown() {
        this.isLanguageOpen = !this.isLanguageOpen;

        if (this.isLanguageOpen) {
            this.openLanguageDropdown();
        } else {
            this.closeLanguageDropdown();
        }
    }

    openLanguageDropdown() {
        this.isLanguageOpen = true;
        this.languageToggle?.setAttribute('aria-expanded', 'true');
        this.languageDropdown?.setAttribute('aria-hidden', 'false');
    }

    closeLanguageDropdown() {
        this.isLanguageOpen = false;
        this.languageToggle?.setAttribute('aria-expanded', 'false');
        this.languageDropdown?.setAttribute('aria-hidden', 'true');
    }

    selectLanguage(option) {
        const lang = option.dataset.lang;
        const url = option.dataset.url;

        // Update selected state
        this.languageOptions.forEach(opt => {
            opt.setAttribute('aria-selected', 'false');
        });
        option.setAttribute('aria-selected', 'true');

        // Update toggle label
        const label = this.languageToggle?.querySelector('[data-role="language-label"]');
        if (label) {
            label.textContent = option.querySelector('span:last-child').textContent.slice(0, 2).toUpperCase();
        }

        // Close dropdown
        this.closeLanguageDropdown();

        console.log(`🌐 Language selected: ${lang}`);

        // Navigate to language version if URL provided
        if (url && url !== window.location.pathname) {
            window.location.href = url;
        }

        // Trigger custom event for i18n system
        const event = new CustomEvent('languageChanged', {
            detail: { lang }
        });
        document.dispatchEvent(event);
    }

    /**
     * Sticky Header on Scroll
     */
    setupStickyHeader() {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Add/remove sticky class based on scroll position
            if (currentScrollY > 100) {
                this.header?.classList.add('header--scrolled');
            } else {
                this.header?.classList.remove('header--scrolled');
            }

            this.lastScrollY = currentScrollY;
        }, { passive: true });
    }

    /**
     * Smooth Scroll to Sections
     */
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Skip if href is just "#"
                if (href === '#' || href === '#!') {
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    // Close mobile menu if open
                    this.closeMenu();

                    // Smooth scroll to target
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL hash
                    history.pushState(null, null, href);
                }
            });
        });
    }

    /**
     * Keyboard Navigation
     */
    setupKeyboardNavigation() {
        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMenuOpen) {
                    this.closeMenu();
                }
                if (this.isLanguageOpen) {
                    this.closeLanguageDropdown();
                }
            }
        });

        // Tab trap in mobile menu when open
        this.menu?.addEventListener('keydown', (e) => {
            if (!this.isMenuOpen || window.innerWidth >= 768) {
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = this.menu.querySelectorAll(
                    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.responsiveHeader = new ResponsiveHeader();
        console.log('✅ Responsive Header initialized');
    });
} else {
    window.responsiveHeader = new ResponsiveHeader();
    console.log('✅ Responsive Header initialized');
}
