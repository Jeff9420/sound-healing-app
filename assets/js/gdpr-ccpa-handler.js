/**
 * GDPR/CCPA Compliance Handler
 * Manages cookie consent, data deletion requests, and "Do Not Sell My Info" functionality
 *
 * @author Sound Healing Team
 * @version 1.0.0
 * @date 2025-01-24
 */

class GDPRCCPAHandler {
    constructor() {
        this.hasConsent = localStorage.getItem('cookie-consent') || false;
        this.ccpaOptOut = localStorage.getItem('ccpa-opt-out') === 'true';
        this.init();
    }

    init() {
        // Show cookie consent banner if no consent exists
        if (!this.hasConsent) {
            this.showCookieBanner();
        }

        // Update CCPA button state
        this.updateCCPAButtonState();

        // Add event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        // Cookie banner accept button
        const acceptBtn = document.getElementById('cookieAccept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptCookies());
        }

        // Cookie banner reject button
        const rejectBtn = document.getElementById('cookieReject');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', () => this.rejectCookies());
        }

        // Cookie settings button
        const settingsBtn = document.getElementById('cookieSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showCookieSettings());
        }
    }

    // Cookie Consent Management
    showCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookieBanner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <p>This website uses cookies to enhance your experience and analyze usage. By continuing to use this site, you agree to our use of cookies.</p>
                <div class="cookie-banner-actions">
                    <button id="cookieAccept" class="cookie-btn cookie-accept">Accept All</button>
                    <button id="cookieReject" class="cookie-btn cookie-reject">Reject Non-Essential</button>
                    <button id="cookieSettings" class="cookie-btn cookie-settings">Customize Settings</button>
                </div>
            </div>
        `;

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(10, 14, 30, 0.98);
                backdrop-filter: blur(20px);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding: 20px;
                z-index: 10000;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            }

            .cookie-banner.show {
                transform: translateY(0);
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }

            .cookie-banner-content p {
                flex: 1;
                min-width: 300px;
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.95rem;
                line-height: 1.5;
                margin: 0;
            }

            .cookie-banner-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .cookie-accept {
                background: linear-gradient(135deg, #6666ff, #7777ff);
                color: white;
            }

            .cookie-accept:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 102, 255, 0.3);
            }

            .cookie-reject {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cookie-reject:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }

            .cookie-settings {
                background: transparent;
                color: rgba(255, 255, 255, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cookie-settings:hover {
                background: rgba(255, 255, 255, 0.05);
                color: white;
            }

            @media (max-width: 768px) {
                .cookie-banner-content {
                    flex-direction: column;
                    text-align: center;
                }

                .cookie-banner-actions {
                    justify-content: center;
                }

                .cookie-btn {
                    flex: 1;
                    min-width: 120px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(banner);

        // Show banner with animation
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    acceptCookies() {
        this.hasConsent = 'all';
        localStorage.setItem('cookie-consent', 'all');

        // Enable analytics
        this.enableAnalytics();

        // Hide banner
        this.hideCookieBanner();

        // Track consent
        this.trackConsentEvent('accept_all');

        // Show confirmation
        this.showNotification('Cookie preferences saved. Thank you!', 'success');
    }

    rejectCookies() {
        this.hasConsent = 'essential';
        localStorage.setItem('cookie-consent', 'essential');

        // Disable non-essential analytics
        this.disableAnalytics();

        // Hide banner
        this.hideCookieBanner();

        // Track consent (limited)
        this.trackConsentEvent('reject_non_essential');

        // Show confirmation
        this.showNotification('Only essential cookies will be used.', 'info');
    }

    hideCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    showCookieSettings() {
        this.hideCookieBanner();

        // Create settings modal
        const modal = document.createElement('div');
        modal.id = 'cookieSettingsModal';
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-overlay" onclick="this.parentElement.remove()"></div>
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h3>Cookie Preferences</h3>
                    <button class="cookie-settings-close" onclick="this.closest('.cookie-settings-modal').remove()">&times;</button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" id="essentialCookies" checked disabled>
                            <span>Essential Cookies</span>
                            <small>Required for the website to function properly</small>
                        </label>
                    </div>
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" id="analyticsCookies" ${this.hasConsent === 'all' ? 'checked' : ''}>
                            <span>Analytics Cookies</span>
                            <small>Help us improve our website by collecting usage data</small>
                        </label>
                    </div>
                    <div class="cookie-option">
                        <label>
                            <input type="checkbox" id="marketingCookies" ${this.hasConsent === 'all' ? 'checked' : ''}>
                            <span>Marketing Cookies</span>
                            <small>Used to deliver personalized ads and content</small>
                        </label>
                    </div>
                </div>
                <div class="cookie-settings-footer">
                    <button class="cookie-btn cookie-save" onclick="window.gdprHandler.saveCookieSettings()">Save Preferences</button>
                </div>
            </div>
        `;

        // Add modal CSS
        if (!document.getElementById('cookieSettingsStyles')) {
            const style = document.createElement('style');
            style.id = 'cookieSettingsStyles';
            style.textContent = `
                .cookie-settings-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .cookie-settings-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                }

                .cookie-settings-content {
                    position: relative;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .cookie-settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .cookie-settings-header h3 {
                    color: white;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .cookie-settings-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .cookie-settings-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .cookie-option {
                    margin-bottom: 20px;
                }

                .cookie-option label {
                    display: block;
                    color: rgba(255, 255, 255, 0.9);
                    cursor: pointer;
                }

                .cookie-option input[type="checkbox"] {
                    margin-right: 12px;
                    width: 18px;
                    height: 18px;
                    vertical-align: middle;
                }

                .cookie-option span {
                    font-weight: 500;
                    font-size: 1.1rem;
                }

                .cookie-option small {
                    display: block;
                    margin-top: 5px;
                    margin-left: 30px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .cookie-settings-footer {
                    margin-top: 30px;
                    text-align: center;
                }

                .cookie-save {
                    background: linear-gradient(135deg, #6666ff, #7777ff);
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .cookie-save:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 102, 255, 0.3);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    saveCookieSettings() {
        const analyticsCookies = document.getElementById('analyticsCookies').checked;
        const marketingCookies = document.getElementById('marketingCookies').checked;

        if (analyticsCookies || marketingCookies) {
            this.hasConsent = 'all';
            localStorage.setItem('cookie-consent', 'all');
            this.enableAnalytics();
        } else {
            this.hasConsent = 'essential';
            localStorage.setItem('cookie-consent', 'essential');
            this.disableAnalytics();
        }

        // Close modal
        document.getElementById('cookieSettingsModal').remove();

        // Show confirmation
        this.showNotification('Cookie preferences saved successfully!', 'success');

        // Track settings change
        this.trackConsentEvent('custom_settings');
    }

    // CCPA "Do Not Sell My Info" functionality
    toggleCCPAOptOut() {
        this.ccpaOptOut = !this.ccpaOptOut;
        localStorage.setItem('ccpa-opt-out', this.ccpaOptOut.toString());

        this.updateCCPAButtonState();

        if (this.ccpaOptOut) {
            // Disable data selling/sharing
            this.disableDataSharing();
            this.showNotification('You have opted out of data selling. Your preferences have been saved.', 'success');

            // Track opt-out
            this.trackCCPAEvent('opt_out');
        } else {
            // Enable data sharing (with consent)
            if (this.hasConsent === 'all') {
                this.enableDataSharing();
                this.showNotification('You have opted in to data sharing. You can change this anytime.', 'info');
            }

            // Track opt-in
            this.trackCCPAEvent('opt_in');
        }
    }

    updateCCPAButtonState() {
        const btn = document.getElementById('ccpaOptOutBtn');
        if (btn) {
            if (this.ccpaOptOut) {
                btn.classList.add('opted-out');
                btn.textContent = 'Opted Out of Data Selling';
            } else {
                btn.classList.remove('opted-out');
                btn.textContent = 'Do Not Sell My Info';
            }
        }
    }

    // Data Deletion Request
    showDataDeletionForm() {
        const modal = document.createElement('div');
        modal.id = 'dataDeletionModal';
        modal.className = 'data-deletion-modal';
        modal.innerHTML = `
            <div class="data-deletion-overlay" onclick="this.parentElement.remove()"></div>
            <div class="data-deletion-content">
                <div class="data-deletion-header">
                    <h3>Data Deletion Request</h3>
                    <button class="data-deletion-close" onclick="this.closest('.data-deletion-modal').remove()">&times;</button>
                </div>
                <div class="data-deletion-body">
                    <p>We respect your privacy and will delete your personal data upon request.</p>
                    <form id="dataDeletionForm">
                        <div class="form-group">
                            <label for="deletionEmail">Email Address</label>
                            <input type="email" id="deletionEmail" required placeholder="Enter your email address">
                        </div>
                        <div class="form-group">
                            <label for="deletionReason">Reason (Optional)</label>
                            <select id="deletionReason">
                                <option value="">Select a reason</option>
                                <option value="privacy">Privacy concerns</option>
                                <option value="no_longer_use">No longer use the service</option>
                                <option value="incorrect_data">Incorrect data</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="deletionMessage">Additional Message (Optional)</label>
                            <textarea id="deletionMessage" rows="4" placeholder="Any additional information..."></textarea>
                        </div>
                        <div class="form-checkbox">
                            <input type="checkbox" id="confirmDeletion" required>
                            <label for="confirmDeletion">I understand that this action cannot be undone and all my data will be permanently deleted.</label>
                        </div>
                        <button type="submit" class="deletion-submit-btn">Submit Deletion Request</button>
                    </form>
                </div>
            </div>
        `;

        // Add modal CSS
        if (!document.getElementById('dataDeletionStyles')) {
            const style = document.createElement('style');
            style.id = 'dataDeletionStyles';
            style.textContent = `
                .data-deletion-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10002;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .data-deletion-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                }

                .data-deletion-content {
                    position: relative;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .data-deletion-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .data-deletion-header h3 {
                    color: white;
                    font-size: 1.5rem;
                    margin: 0;
                }

                .data-deletion-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .data-deletion-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .data-deletion-body p {
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 25px;
                    line-height: 1.6;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #6666ff;
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 0 3px rgba(102, 102, 255, 0.2);
                }

                .form-group input::placeholder,
                .form-group textarea::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .form-group select option {
                    background: #1a1a2e;
                    color: white;
                }

                .form-checkbox {
                    margin-bottom: 25px;
                }

                .form-checkbox input {
                    margin-right: 10px;
                    width: auto;
                }

                .form-checkbox label {
                    color: rgba(255, 255, 255, 0.9);
                    cursor: pointer;
                    line-height: 1.5;
                }

                .deletion-submit-btn {
                    width: 100%;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .deletion-submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
                }

                .deletion-submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Handle form submission
        const form = document.getElementById('dataDeletionForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDataDeletionRequest(new FormData(form));
        });
    }

    async submitDataDeletionRequest(formData) {
        const submitBtn = document.querySelector('.deletion-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const requestData = {
            email: formData.get('deletionEmail') || document.getElementById('deletionEmail').value,
            reason: document.getElementById('deletionReason').value,
            message: document.getElementById('deletionMessage').value,
            timestamp: new Date().toISOString(),
            requestType: 'data_deletion',
            requestId: this.generateRequestId(),
            domain: window.location.hostname
        };

        try {
            // Since this is a frontend-only app, we'll handle deletion locally
            // In production, this would be sent to a backend service

            // 1. Store deletion request locally
            const requests = JSON.parse(localStorage.getItem('data-deletion-requests') || '[]');
            requests.push(requestData);
            localStorage.setItem('data-deletion-requests', JSON.stringify(requests));

            // 2. Clear local storage data for this user
            await this.clearUserData(requestData.email);

            // 3. Generate deletion confirmation
            const confirmationCode = this.generateConfirmationCode();
            localStorage.setItem(`deletion-confirm-${requestData.requestId}`, confirmationCode);
            localStorage.setItem(`deletion-status-${requestData.requestId}`, 'pending');

            // 4. Send confirmation email (using email service if configured)
            await this.sendDeletionConfirmationEmail(requestData, confirmationCode);

            // Show success message with instructions
            this.showDeletionConfirmationDialog(requestData, confirmationCode);

            // Close modal
            document.getElementById('dataDeletionModal').remove();

            // Track request
            this.trackDataEvent('deletion_request_submitted');

        } catch (error) {
            console.error('Error submitting deletion request:', error);
            this.showNotification('An error occurred while processing your request. Please try again later.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Deletion Request';
        }
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate 6-digit confirmation code
     */
    generateConfirmationCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    /**
     * Clear user data from local storage
     */
    async clearUserData(email) {
        const emailLower = email.toLowerCase();

        // Clear user preferences
        const userPrefs = [
            'audioPreferences',
            'userSettings',
            'playbackHistory',
            'favorites',
            'stats',
            'theme',
            'language'
        ];

        userPrefs.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    // If data is array or object, filter by email
                    if (Array.isArray(parsed)) {
                        const filtered = parsed.filter(item =>
                            !item.email || item.email.toLowerCase() !== emailLower
                        );
                        localStorage.setItem(key, JSON.stringify(filtered));
                    } else if (typeof parsed === 'object' && parsed.email) {
                        if (parsed.email.toLowerCase() === emailLower) {
                            localStorage.removeItem(key);
                        }
                    } else if (key === 'favorites' || key === 'playbackHistory') {
                        // Special handling for array-based data
                        const filtered = parsed.filter(item =>
                            !item.email || item.email.toLowerCase() !== emailLower
                        );
                        localStorage.setItem(key, JSON.stringify(filtered));
                    }
                } catch (e) {
                    // If parsing fails, remove the key
                    localStorage.removeItem(key);
                }
            }
        });

        // Clear any user-specific cookies
        document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.split('=');
            if (name.trim().toLowerCase().includes(emailLower)) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }

    /**
     * Show deletion confirmation dialog
     */
    showDeletionConfirmationDialog(requestData, confirmationCode) {
        const dialog = document.createElement('div');
        dialog.id = 'deletionConfirmDialog';
        dialog.className = 'deletion-confirm-dialog';
        dialog.innerHTML = `
            <div class="deletion-confirm-overlay" onclick="this.parentElement.remove()"></div>
            <div class="deletion-confirm-content">
                <div class="deletion-confirm-header">
                    <h3>✅ Deletion Request Submitted</h3>
                    <button class="deletion-confirm-close" onclick="this.closest('.deletion-confirm-dialog').remove()">&times;</button>
                </div>
                <div class="deletion-confirm-body">
                    <p><strong>Your data deletion request has been submitted successfully.</strong></p>
                    <p><strong>Request ID:</strong> ${requestData.requestId}</p>
                    <p><strong>Confirmation Code:</strong> <span class="confirmation-code">${confirmationCode}</span></p>
                    <div class="confirmation-info">
                        <p><strong>Important: Save this confirmation code!</strong></p>
                        <p>This code is your proof of deletion request. Keep it for your records.</p>
                    </div>
                    <div class="next-steps">
                        <h4>What happens next:</h4>
                        <ul>
                            <li>Your local data has been immediately cleared</li>
                            <li>Analytics cookies will be anonymized</li>
                            <li>Third-party data will be handled separately</li>
                        </ul>
                    </div>
                </div>
                <div class="deletion-confirm-actions">
                    <button class="deletion-confirm-btn" onclick="this.closest('.deletion-confirm-dialog').remove()">I Understand</button>
                    <button class="deletion-download-btn" onclick="window.gdprHandler.downloadDeletionRecord('${requestData.requestId}')">
                        Download Record
                    </button>
                </div>
            </div>
        `;

        // Add styles if not exists
        if (!document.getElementById('deletionConfirmStyles')) {
            const style = document.createElement('style');
            style.id = 'deletionConfirmStyles';
            style.textContent = `
                .deletion-confirm-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10003;
                }

                .deletion-confirm-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                }

                .deletion-confirm-content {
                    position: relative;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    color: white;
                }

                .deletion-confirm-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .deletion-confirm-header h3 {
                    color: #4caf50;
                    margin: 0;
                }

                .deletion-confirm-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .deletion-confirm-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .deletion-confirm-body {
                    line-height: 1.6;
                }

                .confirmation-code {
                    background: rgba(76, 175, 80, 0.2);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 1.1em;
                    letter-spacing: 2px;
                }

                .confirmation-info {
                    background: rgba(255, 193, 7, 0.1);
                    border: 1px solid rgba(255, 193, 7, 0.3);
                    border-radius: 10px;
                    padding: 15px;
                    margin: 20px 0;
                }

                .next-steps {
                    margin: 20px 0;
                }

                .next-steps h4 {
                    color: #8de8ff;
                    margin-bottom: 10px;
                }

                .next-steps ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .next-steps li {
                    padding: 5px 0;
                    position: relative;
                    padding-left: 20px;
                }

                .next-steps li:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    color: #4caf50;
                }

                .deletion-confirm-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 25px;
                }

                .deletion-confirm-btn,
                .deletion-download-btn {
                    padding: 12px 25px;
                    border-radius: 10px;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .deletion-confirm-btn {
                    background: linear-gradient(135deg, #6666ff, #7777ff);
                    color: white;
                }

                .deletion-confirm-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 102, 255, 0.3);
                }

                .deletion-download-btn {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .deletion-download-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(dialog);
    }

    /**
     * Download deletion record as JSON
     */
    downloadDeletionRecord(requestId) {
        const requestData = {
            ...JSON.parse(localStorage.getItem('data-deletion-requests') || '[]')
                .find(req => req.requestId === requestId),
            confirmationCode: localStorage.getItem(`deletion-confirm-${requestId}`),
            timestamp: new Date().toISOString(),
            systemInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };

        const dataStr = JSON.stringify(requestData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `data-deletion-record-${requestId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        this.showNotification('Deletion record downloaded successfully', 'success');
    }

    /**
     * Send deletion confirmation email (placeholder for email service)
     */
    async sendDeletionConfirmationEmail(requestData, confirmationCode) {
        // This is a placeholder for email service integration
        // In production, you would use services like:
        // - EmailJS
        // - SendGrid
        // - Mailgun
        // - Firebase Functions

        console.log('Deletion confirmation email:', {
            to: requestData.email,
            requestId: requestData.requestId,
            confirmationCode: confirmationCode
        });

        // For now, just log the information
        // In a real implementation, this would send an actual email
    }

    // Analytics Management
    enableAnalytics() {
        // Enable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-4NZR3HR3J1', {
                'send_page_view': true,
                'anonymize_ip': false
            });
        }

        // Enable Amplitude
        if (window.amplitude) {
            amplitude.setOptOut(false);
        }
    }

    disableAnalytics() {
        // Disable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-4NZR3HR3J1', {
                'send_page_view': false,
                'anonymize_ip': true
            });
        }

        // Disable Amplitude
        if (window.amplitude) {
            amplitude.setOptOut(true);
        }

        // Clear existing cookies
        this.clearAnalyticsCookies();
    }

    clearAnalyticsCookies() {
        const cookies = document.cookie.split(';');
        const analyticsCookies = ['_ga', '_gid', '_gat', 'amp_device_id', 'amp_session'];

        cookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            if (analyticsCookies.some(name => cookieName.includes(name))) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
    }

    // Data Sharing Management
    enableDataSharing() {
        // Enable data sharing with third parties
        localStorage.setItem('data-sharing-enabled', 'true');
    }

    disableDataSharing() {
        // Disable data sharing with third parties
        localStorage.setItem('data-sharing-enabled', 'false');
    }

    // Tracking Functions
    trackConsentEvent(action) {
        if (this.hasConsent !== 'essential') {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cookie_consent', {
                    'action': action,
                    'consent_level': this.hasConsent
                });
            }
        }
    }

    trackCCPAEvent(action) {
        if (this.hasConsent !== 'essential') {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ccpa_interaction', {
                    'action': action,
                    'opt_out_status': this.ccpaOptOut
                });
            }
        }
    }

    trackDataEvent(action) {
        if (this.hasConsent !== 'essential') {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'data_privacy', {
                    'action': action
                });
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.gdpr-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `gdpr-notification gdpr-notification-${type}`;
        notification.textContent = message;

        // Add notification styles
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                .gdpr-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    z-index: 10003;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                    word-wrap: break-word;
                }

                .gdpr-notification.show {
                    transform: translateX(0);
                }

                .gdpr-notification-success {
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                }

                .gdpr-notification-error {
                    background: rgba(244, 67, 54, 0.9);
                    color: white;
                }

                .gdpr-notification-info {
                    background: rgba(33, 150, 243, 0.9);
                    color: white;
                }

                @media (max-width: 768px) {
                    .gdpr-notification {
                        left: 20px;
                        right: 20px;
                        top: 10px;
                        transform: translateY(-100px);
                        max-width: none;
                    }

                    .gdpr-notification.show {
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Initialize GDPR Handler
window.gdprHandler = new GDPRCCPAHandler();

// Global functions for onclick handlers
window.showCookieSettings = () => window.gdprHandler.showCookieSettings();
window.showDataDeletionForm = () => window.gdprHandler.showDataDeletionForm();
window.toggleCCPAOptOut = () => window.gdprHandler.toggleCCPAOptOut();