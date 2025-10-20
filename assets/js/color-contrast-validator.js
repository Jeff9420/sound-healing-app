/**
 * Color Contrast Validator for WCAG AA Compliance
 * Tests and validates color contrast ratios throughout the application
 */

class ColorContrastValidator {
    constructor() {
        this.testResults = [];
        this.failedElements = [];
        this.warnings = [];

        // WCAG AA contrast ratios
        this.contrastRatios = {
            AA: {
                normal: 4.5,      // 18pt+ or 14pt+ bold
                large: 3.0        // 18pt+ or 14pt+
            },
            AAA: {
                normal: 7.0,
                large: 4.5
            }
        };

        this.init();
    }

    init() {
        console.log('🎨 Color Contrast Validator initialized');

        // Run validation after page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runValidation());
        } else {
            this.runValidation();
        }

        // Add keyboard shortcut for manual validation (Ctrl+Shift+C)
        this.setupKeyboardShortcut();
    }

    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.runValidation();
                this.showResults();
            }
        });
    }

    calculateContrast(rgb1, rgb2) {
        // Calculate relative luminance
        const luminance1 = this.getRelativeLuminance(rgb1);
        const luminance2 = this.getRelativeLuminance(rgb2);

        // Calculate contrast ratio
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    getRelativeLuminance(rgb) {
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    getComputedColor(element, property = 'color') {
        const styles = window.getComputedStyle(element);
        const value = styles[property];

        // Handle rgb, rgba, hex colors
        if (value.startsWith('rgb')) {
            const matches = value.match(/\d+/g);
            return matches ? matches.slice(0, 3).map(Number) : [0, 0, 0];
        } else if (value.startsWith('#')) {
            return this.hexToRgb(value);
        }

        return [0, 0, 0]; // Default to black for safety
    }

    runValidation() {
        console.log('🔍 Running color contrast validation...');

        // Clear previous results
        this.testResults = [];
        this.failedElements = [];
        this.warnings = [];

        // Define critical elements to test
        const testSelectors = [
            // Text elements
            { selector: 'body', name: 'Body text' },
            { selector: '.header__title', name: 'Header title' },
            { selector: '.header__tagline', name: 'Header tagline' },
            { selector: '.category-name', name: 'Category name' },
            { selector: '.category-desc', name: 'Category description' },
            { selector: '.track-title', name: 'Track title' },
            { selector: '.track-category', name: 'Track category' },
            { selector: '.hero-intro__headline', name: 'Hero headline' },
            { selector: '.hero-intro__description', name: 'Hero description' },
            { selector: '.feature-card h4', name: 'Feature card title' },
            { selector: '.feature-card p', name: 'Feature card description' },
            { selector: '.form-group label', name: 'Form label' },
            { selector: '.auth-tab', name: 'Auth tab' },

            // Interactive elements
            { selector: 'button', name: 'Button text' },
            { selector: '.control-btn', name: 'Control button' },
            { selector: '.header-icon-btn', name: 'Header icon button' },
            { selector: '.category-card', name: 'Category card' },
            { selector: '.track-item', name: 'Track item' },
            { selector: '.modal-content', name: 'Modal content' },

            // Links
            { selector: 'a', name: 'Link text' },

            // Form elements
            { selector: 'input', name: 'Input text' },
            { selector: 'select', name: 'Select text' },
            { selector: 'textarea', name: 'Textarea text' }
        ];

        // Test each selector
        testSelectors.forEach(test => {
            this.testElements(test.selector, test.name);
        });

        // Log summary
        this.logSummary();
    }

    testElements(selector, name) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            const result = this.testElement(element, name);
            if (result) {
                this.testResults.push(result);

                if (!result.passesAA) {
                    this.failedElements.push(element);
                    this.highlightIssue(element);
                }

                if (result.warning) {
                    this.warnings.push(result);
                }
            }
        });
    }

    testElement(element, name) {
        try {
            const textColor = this.getComputedColor(element, 'color');
            const bgColor = this.getComputedColor(element, 'background-color');

            // Skip if colors are transparent or invalid
            if (!textColor || !bgColor) {
                return null;
            }

            const contrastRatio = this.calculateContrast(textColor, bgColor);
            const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
            const fontWeight = window.getComputedStyle(element).fontWeight;

            // Determine if text is "large" (18pt+ or 14pt+ bold)
            const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

            // WCAG AA compliance
            const requiredRatio = isLargeText ?
                this.contrastRatios.AA.large :
                this.contrastRatios.AA.normal;

            const passesAA = contrastRatio >= requiredRatio;
            const passesAAA = contrastRatio >= (isLargeText ?
                this.contrastRatios.AAA.large :
                this.contrastRatios.AAA.normal);

            return {
                element: element,
                elementName: name,
                contrastRatio: Math.round(contrastRatio * 100) / 100,
                requiredRatio: requiredRatio,
                passesAA: passesAA,
                passesAAA: passesAAA,
                isLargeText: isLargeText,
                fontSize: fontSize,
                fontWeight: fontWeight,
                textColor: `rgb(${textColor.join(', ')})`,
                backgroundColor: `rgb(${bgColor.join(', ')})`,
                warning: passesAA && !passesAAA ? 'AAA not met' : null,
                failed: !passesAA
            };
        } catch (error) {
            console.warn(`Error testing element ${name}:`, error);
            return null;
        }
    }

    highlightIssue(element) {
        // Add red border to failing elements
        element.style.outline = '3px solid #ff0000';
        element.style.outlineOffset = '2px';
        element.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    }

    clearHighlights() {
        this.failedElements.forEach(element => {
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.style.boxShadow = '';
        });
        this.failedElements = [];
    }

    logSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passesAA).length;
        const failed = total - passed;
        const aaaCompliant = this.testResults.filter(r => r.passesAAA).length;

        console.log('\n🎨 Color Contrast Validation Summary:');
        console.log('=====================================');
        console.log(`Total tests: ${total}`);
        console.log(`✅ Passed WCAG AA: ${passed} (${Math.round(passed/total*100)}%)`);
        console.log(`❌ Failed WCAG AA: ${failed} (${Math.round(failed/total*100)}%)`);
        console.log(`⭐ AAA Compliant: ${aaaCompliant} (${Math.round(aaaCompliant/total*100)}%)`);

        if (failed > 0) {
            console.log('\n❌ Failed Elements:');
            this.testResults.filter(r => !r.passesAA).forEach(result => {
                console.log(`- ${result.elementName}: ${result.contrastRatio}:1 (required: ${result.requiredRatio}:1)`);
                console.log(`  Text: ${result.textColor} | BG: ${result.backgroundColor}`);
                console.log(`  Size: ${result.fontSize}px | Weight: ${result.fontWeight}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ Warnings (AA but not AAA):');
            this.warnings.forEach(warning => {
                console.log(`- ${warning.elementName}: ${warning.contrastRatio}:1 (AAA requires: ${warning.requiredRatio}:1)`);
            });
        }

        console.log('\nPress Ctrl+Shift+C to view detailed results');
    }

    showResults() {
        // Create or update results overlay
        let overlay = document.getElementById('contrast-validator-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'contrast-validator-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10001;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            `;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Close';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #ff4444;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
            `;

            closeBtn.onclick = () => this.hideResults();
            overlay.appendChild(closeBtn);
            document.body.appendChild(overlay);
        }

        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passesAA).length;
        const failed = total - passed;

        let html = `
            <h2>🎨 Color Contrast Validation Results</h2>
            <div style="margin-bottom: 15px; padding: 10px; background: ${failed > 0 ? '#ff4444' : '#44ff44'}; border-radius: 5px;">
                <strong>WCAG AA Compliance:</strong> ${passed}/${total} (${Math.round(passed/total*100)}%)
            </div>
        `;

        if (failed > 0) {
            html += `
                <h3 style="color: #ff6666;">❌ Failed Elements (${failed})</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #333;">
                            <th style="padding: 5px; text-align: left;">Element</th>
                            <th style="padding: 5px; text-align: left;">Ratio</th>
                            <th style="padding: 5px; text-align: left;">Required</th>
                            <th style="padding: 5px; text-align: left;">Colors</th>
                        </tr>
            `;

            this.testResults.filter(r => !r.passesAA).forEach(result => {
                html += `
                    <tr style="border-bottom: 1px solid #555;">
                        <td style="padding: 5px;">${result.elementName}</td>
                        <td style="padding: 5px; color: #ff6666;">${result.contrastRatio}:1</td>
                        <td style="padding: 5px;">${result.requiredRatio}:1</td>
                        <td style="padding: 5px; font-size: 10px;">
                            <span style="color: ${result.textColor}">████</span> on
                            <span style="color: ${result.backgroundColor}">████</span>
                        </td>
                    </tr>
                `;
            });

            html += '</table></div>';
        }

        overlay.innerHTML = html + `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #555;">
                <button onclick="window.colorContrastValidator.clearHighlights()" style="
                    background: #6666ff;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Clear Highlights</button>
                <button onclick="window.colorContrastValidator.generateReport()" style="
                    background: #44ff44;
                    color: black;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Generate Report</button>
            </div>
        `;
    }

    hideResults() {
        const overlay = document.getElementById('contrast-validator-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            wcagLevel: 'AA',
            totalTests: this.testResults.length,
            passed: this.testResults.filter(r => r.passesAA).length,
            failed: this.testResults.filter(r => !r.passesAA).length,
            results: this.testResults
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-contrast-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Public API
    validateElement(element) {
        const result = this.testElement(element, element.className || element.tagName);
        if (result && !result.passesAA) {
            this.highlightIssue(element);
        }
        return result;
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.colorContrastValidator = new ColorContrastValidator();
});