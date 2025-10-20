/**
 * Accessibility Validator and Testing System
 * Performs automated accessibility checks and provides detailed reporting
 *
 * @version 1.0.0
 * @date 2025-10-20
 */

class AccessibilityValidator {
    constructor() {
        this.tests = [];
        this.results = [];
        this.wcagLevel = 'AA'; // WCAG 2.1 AA compliance level
        this.setupTests();
    }

    /**
     * Initialize all accessibility tests
     */
    setupTests() {
        this.tests = [
            this.testARIALabels.bind(this),
            this.testKeyboardNavigation.bind(this),
            this.testFocusManagement.bind(this),
            this.testColorContrast.bind(this),
            this.testHeadingHierarchy.bind(this),
            this.testImageAlternatives.bind(this),
            this.testFormLabels.bind(this),
            this.testLiveRegions.bind(this),
            this.testLanguageAttributes.bind(this),
            this.testTabOrder.bind(this),
            this.testLinkContext.bind(this),
            this.testTableAccessibility.bind(this),
            this.testFrameTitles.bind(this),
            this.testSkipLinks.bind(this),
            this.testErrorHandling.bind(this)
        ];
    }

    /**
     * Run all accessibility tests
     */
    async runAllTests() {
        console.log('🔍 Starting Accessibility Validation...');
        this.results = [];

        for (const test of this.tests) {
            try {
                const result = await test();
                this.results.push(result);
            } catch (error) {
                console.error(`Test failed: ${error.message}`);
                this.results.push({
                    name: test.name || 'Unknown Test',
                    status: 'error',
                    message: error.message,
                    details: []
                });
            }
        }

        return this.generateReport();
    }

    /**
     * Test ARIA labels and attributes
     */
    testARIALabels() {
        const issues = [];
        const elements = document.querySelectorAll('button, [role="button"], input, select, textarea');

        elements.forEach(element => {
            // Check for missing aria-label or accessible name
            const hasLabel = element.hasAttribute('aria-label') ||
                           element.hasAttribute('aria-labelledby') ||
                           element.textContent.trim() ||
                           element.getAttribute('title') ||
                           element.getAttribute('alt') ||
                           element.labels?.length > 0;

            if (!hasLabel && element.offsetWidth > 0 && element.offsetHeight > 0) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: 'Missing accessible name',
                    recommendation: 'Add aria-label, aria-labelledby, or visible text'
                });
            }

            // Check for correct ARIA roles
            if (element.hasAttribute('role')) {
                const role = element.getAttribute('role');
                const validRoles = ['button', 'link', 'navigation', 'main', 'banner', 'contentinfo', 'search', 'complementary', 'form', 'dialog', 'alert', 'status', 'tab', 'tabpanel', 'tablist', 'grid', 'list', 'listitem', 'group', 'region'];
                if (!validRoles.includes(role)) {
                    issues.push({
                        element: element.outerHTML.substring(0, 100),
                        issue: `Invalid ARIA role: ${role}`,
                        recommendation: 'Use a valid ARIA role from the specification'
                    });
                }
            }
        });

        return {
            name: 'ARIA Labels and Roles',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} ARIA issues found`,
            details: issues
        };
    }

    /**
     * Test keyboard navigation
     */
    testKeyboardNavigation() {
        const issues = [];
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
        );

        // Check for tabindex values
        focusableElements.forEach(element => {
            const tabindex = element.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) > 0) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: `Positive tabindex value: ${tabindex}`,
                    recommendation: 'Use tabindex="0" or remove tabindex attribute'
                });
            }

            // Check for disabled interactive elements
            if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
                if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                    // This is actually good - disabled elements should be visible but not focusable
                }
            }
        });

        // Check for focus management in modals
        const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
        modals.forEach(modal => {
            const focusableInModal = modal.querySelectorAll(
                'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableInModal.length === 0) {
                issues.push({
                    element: modal.outerHTML.substring(0, 100),
                    issue: 'Modal has no focusable elements',
                    recommendation: 'Ensure modal has at least one focusable element'
                });
            }
        });

        return {
            name: 'Keyboard Navigation',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} keyboard navigation issues found`,
            details: issues
        };
    }

    /**
     * Test focus management
     */
    testFocusManagement() {
        const issues = [];

        // Check for visible focus indicators
        const styleElement = document.createElement('style');
        styleElement.textContent = 'body.keyboard-mode *:focus{outline:5px solid red !important;}';
        document.head.appendChild(styleElement);

        // Check if focus styles are present
        const computedStyle = window.getComputedStyle(document.body);
        if (!computedStyle.getPropertyValue('--focus-outline')) {
            issues.push({
                element: 'CSS Styles',
                issue: 'Missing focus indicators',
                recommendation: 'Add visible focus styles for keyboard navigation'
            });
        }

        document.head.removeChild(styleElement);

        // Check for skip links
        const skipLinks = document.querySelectorAll('.skip-link, [href="#main"], [href="#content"]');
        if (skipLinks.length === 0) {
            issues.push({
                element: 'Skip Links',
                issue: 'No skip links found',
                recommendation: 'Add skip links for keyboard users'
            });
        }

        return {
            name: 'Focus Management',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} focus management issues found`,
            details: issues
        };
    }

    /**
     * Test color contrast (basic check)
     */
    testColorContrast() {
        const issues = [];

        // This is a simplified contrast test - real testing requires actual color values
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');

        textElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;

            // Check for transparent or missing background
            if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                // This might be okay if there's a background element
            }

            // Check for low contrast (basic heuristic)
            if (color === backgroundColor) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: 'Text and background have same color',
                    recommendation: 'Ensure sufficient color contrast (4.5:1 for normal text)'
                });
            }
        });

        return {
            name: 'Color Contrast',
            status: issues.length === 0 ? 'pass' : 'warning',
            message: `${issues.length} potential contrast issues found`,
            details: issues,
            note: 'Manual testing recommended for accurate contrast ratios'
        };
    }

    /**
     * Test heading hierarchy
     */
    testHeadingHierarchy() {
        const issues = [];
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        if (headings.length === 0) {
            issues.push({
                element: 'Page Structure',
                issue: 'No headings found',
                recommendation: 'Use headings to create a logical document structure'
            });
        }

        let previousLevel = 0;
        headings.forEach((heading, index) => {
            const currentLevel = parseInt(heading.tagName.substring(1));

            // Check for multiple h1s
            if (heading.tagName === 'H1' && index > 0) {
                issues.push({
                    element: heading.outerHTML,
                    issue: 'Multiple h1 elements found',
                    recommendation: 'Use only one h1 per page'
                });
            }

            // Check for skipped heading levels
            if (previousLevel > 0 && currentLevel > previousLevel + 1) {
                issues.push({
                    element: heading.outerHTML,
                    issue: `Skipped heading level: H${previousLevel} to H${currentLevel}`,
                    recommendation: 'Maintain hierarchical heading structure'
                });
            }

            previousLevel = currentLevel;
        });

        return {
            name: 'Heading Hierarchy',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} heading structure issues found`,
            details: issues
        };
    }

    /**
     * Test image alternatives
     */
    testImageAlternatives() {
        const issues = [];
        const images = document.querySelectorAll('img');

        images.forEach(image => {
            // Check for alt text
            if (!image.hasAttribute('alt')) {
                issues.push({
                    element: image.outerHTML.substring(0, 100),
                    issue: 'Missing alt attribute',
                    recommendation: 'Add alt text describing the image content'
                });
            } else {
                const alt = image.getAttribute('alt');
                // Check for decorative images
                if (alt === '' && image.getAttribute('role') !== 'presentation') {
                    // This might be intentional for decorative images
                } else if (alt.length > 125) {
                    issues.push({
                        element: image.outerHTML.substring(0, 100),
                        issue: 'Alt text too long (>125 characters)',
                        recommendation: 'Keep alt text concise and descriptive'
                    });
                }
            }

            // Check for meaningful file names
            const src = image.src;
            if (src.includes('placeholder') || src.includes('image') || src.includes('img')) {
                // This might indicate a missing meaningful alt text
            }
        });

        return {
            name: 'Image Alternatives',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} image accessibility issues found`,
            details: issues
        };
    }

    /**
     * Test form labels
     */
    testFormLabels() {
        const issues = [];
        const formElements = document.querySelectorAll('input, select, textarea');

        formElements.forEach(element => {
            // Skip hidden inputs
            if (element.type === 'hidden') return;

            const hasLabel = element.hasAttribute('aria-label') ||
                           element.hasAttribute('aria-labelledby') ||
                           element.labels?.length > 0 ||
                           element.getAttribute('title');

            if (!hasLabel) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: 'Missing form label',
                    recommendation: 'Add label, aria-label, or aria-labelledby'
                });
            }

            // Check for required field indicators
            if (element.hasAttribute('required') || element.getAttribute('aria-required') === 'true') {
                // This is good, just noting it's properly marked
            }
        });

        return {
            name: 'Form Labels',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} form label issues found`,
            details: issues
        };
    }

    /**
     * Test live regions
     */
    testLiveRegions() {
        const issues = [];
        const liveRegions = document.querySelectorAll('[aria-live]');

        // Check for live regions on dynamic content
        const dynamicElements = document.querySelectorAll('.notification, .alert, .status, [data-live]');
        dynamicElements.forEach(element => {
            if (!element.hasAttribute('aria-live')) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: 'Dynamic content missing aria-live',
                    recommendation: 'Add aria-live="polite" or aria-live="assertive"'
                });
            }
        });

        return {
            name: 'Live Regions',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} live region issues found`,
            details: issues
        };
    }

    /**
     * Test language attributes
     */
    testLanguageAttributes() {
        const issues = [];

        // Check main language
        if (!document.documentElement.hasAttribute('lang')) {
            issues.push({
                element: '<html>',
                issue: 'Missing lang attribute',
                recommendation: 'Add lang attribute to specify page language'
            });
        }

        // Check for language changes
        const langElements = document.querySelectorAll('[lang]:not(html)');
        langElements.forEach(element => {
            const lang = element.getAttribute('lang');
            if (!lang || lang.length < 2) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: 'Invalid or empty lang attribute',
                    recommendation: 'Use proper language codes (e.g., "en", "zh-CN")'
                });
            }
        });

        return {
            name: 'Language Attributes',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} language attribute issues found`,
            details: issues
        };
    }

    /**
     * Test tab order
     */
    testTabOrder() {
        const issues = [];
        const focusableElements = Array.from(
            document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        );

        // Check for tabindex order
        focusableElements.forEach((element, index) => {
            const tabindex = element.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) > 0) {
                issues.push({
                    element: element.outerHTML.substring(0, 100),
                    issue: `Element with tabindex="${tabindex}" may disrupt tab order`,
                    recommendation: 'Use tabindex="0" or remove tabindex for natural tab order'
                });
            }
        });

        return {
            name: 'Tab Order',
            status: issues.length === 0 ? 'pass' : 'warning',
            message: `${issues.length} tab order issues found`,
            details: issues
        };
    }

    /**
     * Test link context
     */
    testLinkContext() {
        const issues = [];
        const links = document.querySelectorAll('a[href]');

        links.forEach(link => {
            const text = link.textContent.trim();

            // Check for empty links
            if (text.length === 0 && !link.hasAttribute('aria-label')) {
                issues.push({
                    element: link.outerHTML,
                    issue: 'Link with no descriptive text',
                    recommendation: 'Add text or aria-label to describe link destination'
                });
            }

            // Check for vague link text
            const vagueTexts = ['click here', 'here', 'link', 'read more', 'more'];
            if (vagueTexts.includes(text.toLowerCase())) {
                issues.push({
                    element: link.outerHTML,
                    issue: 'Vague link text',
                    recommendation: 'Use descriptive text that makes sense out of context'
                });
            }

            // Check if link opens in new window
            if (link.getAttribute('target') === '_blank' && !link.hasAttribute('aria-label')) {
                issues.push({
                    element: link.outerHTML,
                    issue: 'New window link missing indication',
                    recommendation: 'Add aria-label or screen reader text indicating new window'
                });
            }
        });

        return {
            name: 'Link Context',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} link context issues found`,
            details: issues
        };
    }

    /**
     * Test table accessibility
     */
    testTableAccessibility() {
        const issues = [];
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
            // Check for captions
            if (!table.querySelector('caption') && !table.hasAttribute('aria-label')) {
                issues.push({
                    element: table.outerHTML.substring(0, 100),
                    issue: 'Table missing caption or aria-label',
                    recommendation: 'Add caption or aria-label to describe table purpose'
                });
            }

            // Check for headers
            if (!table.querySelector('th') && !table.querySelector('[scope]')) {
                issues.push({
                    element: table.outerHTML.substring(0, 100),
                    issue: 'Table missing headers',
                    recommendation: 'Use th elements or scope attributes for table headers'
                });
            }
        });

        return {
            name: 'Table Accessibility',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} table accessibility issues found`,
            details: issues
        };
    }

    /**
     * Test frame titles
     */
    testFrameTitles() {
        const issues = [];
        const frames = document.querySelectorAll('iframe, frame');

        frames.forEach(frame => {
            if (!frame.hasAttribute('title') && !frame.hasAttribute('aria-label')) {
                issues.push({
                    element: frame.outerHTML.substring(0, 100),
                    issue: 'Frame missing title attribute',
                    recommendation: 'Add descriptive title attribute'
                });
            }
        });

        return {
            name: 'Frame Titles',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} frame title issues found`,
            details: issues
        };
    }

    /**
     * Test skip links
     */
    testSkipLinks() {
        const issues = [];
        const skipLinks = document.querySelectorAll('.skip-link, a[href*="skip"], a[href*="main"], a[href*="content"]');

        if (skipLinks.length === 0) {
            issues.push({
                element: 'Skip Links',
                issue: 'No skip links found',
                recommendation: 'Add skip links for keyboard navigation to main content'
            });
        }

        skipLinks.forEach(link => {
            const target = link.getAttribute('href');
            if (target && target.startsWith('#')) {
                const targetElement = document.querySelector(target);
                if (!targetElement) {
                    issues.push({
                        element: link.outerHTML,
                        issue: `Skip link target "${target}" not found`,
                        recommendation: 'Ensure skip link targets exist on the page'
                    });
                }
            }
        });

        return {
            name: 'Skip Links',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: `${issues.length} skip link issues found`,
            details: issues
        };
    }

    /**
     * Test error handling
     */
    testErrorHandling() {
        const issues = [];
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            // Check for error identification
            const errorElements = form.querySelectorAll('[role="alert"], [aria-invalid="true"], .error, .validation-error');

            // Check for form validation
            const requiredFields = form.querySelectorAll('[required], [aria-required="true"]');
            if (requiredFields.length > 0 && errorElements.length === 0) {
                issues.push({
                    element: form.outerHTML.substring(0, 100),
                    issue: 'Form may lack error handling',
                    recommendation: 'Add error identification and announcement for form validation'
                });
            }
        });

        return {
            name: 'Error Handling',
            status: issues.length === 0 ? 'pass' : 'warning',
            message: `${issues.length} error handling issues found`,
            details: issues
        };
    }

    /**
     * Generate comprehensive accessibility report
     */
    generateReport() {
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warning').length;
        const errors = this.results.filter(r => r.status === 'error').length;

        const report = {
            timestamp: new Date().toISOString(),
            wcagLevel: this.wcagLevel,
            summary: {
                total: this.results.length,
                passed,
                failed,
                warnings,
                errors,
                score: Math.round((passed / this.results.length) * 100)
            },
            results: this.results,
            recommendations: this.generateRecommendations()
        };

        console.log('📊 Accessibility Report Generated:', report);
        return report;
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        this.results.forEach(result => {
            if (result.status === 'fail' || result.status === 'warning') {
                result.details.forEach(detail => {
                    recommendations.push({
                        priority: result.status === 'fail' ? 'high' : 'medium',
                        issue: detail.issue,
                        recommendation: detail.recommendation,
                        element: detail.element
                    });
                });
            }
        });

        // Remove duplicates
        const uniqueRecommendations = recommendations.filter((rec, index, arr) =>
            arr.findIndex(r => r.issue === rec.issue && r.recommendation === rec.recommendation) === index
        );

        return uniqueRecommendations;
    }

    /**
     * Display report in console
     */
    displayReport(report) {
        console.group('🔍 Accessibility Validation Report');
        console.log(`WCAG ${report.wcagLevel} Compliance Score: ${report.summary.score}%`);
        console.log(`Passed: ${report.summary.passed}/${report.summary.total}`);
        console.log(`Failed: ${report.summary.failed}`);
        console.log(`Warnings: ${report.summary.warnings}`);
        console.log(`Errors: ${report.summary.errors}`);

        if (report.recommendations.length > 0) {
            console.group('📋 Recommendations');
            report.recommendations.forEach(rec => {
                console.log(`${rec.priority.toUpperCase()}: ${rec.issue}`);
                console.log(`   Solution: ${rec.recommendation}`);
            });
            console.groupEnd();
        }

        console.groupEnd();
    }

    /**
     * Export report to JSON
     */
    exportReport(report) {
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Initialize validator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityValidator = new AccessibilityValidator();

    // Add global function to run tests
    window.runAccessibilityTests = async () => {
        const report = await window.accessibilityValidator.runAllTests();
        window.accessibilityValidator.displayReport(report);
        return report;
    };

    // Add global function to export report
    window.exportAccessibilityReport = (report) => {
        window.accessibilityValidator.exportReport(report);
    };

    console.log('🔧 Accessibility Validator initialized. Use runAccessibilityTests() to start testing.');
});