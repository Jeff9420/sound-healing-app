/**
 * GDPR/CCPA Compliance Component
 * 提供用户数据权限管理
 * @version 1.0.0
 */

class GDPRCompliance {
    constructor() {
        this.complianceModal = null;
        this.userData = this.loadUserData();
        this.init();
    }

    init() {
        this.createComplianceButton();
        console.log('✅ GDPR/CCPA Compliance initialized');
    }

    loadUserData() {
        // Collect all user data from localStorage
        const userData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sound_healing_')) {
                userData[key] = localStorage.getItem(key);
            }
        }
        return userData;
    }

    createComplianceButton() {
        // Add GDPR compliance link to footer
        const footerContent = `
            <div class="gdpr-compliance-footer">
                <button id="gdprComplianceBtn" class="gdpr-link" data-i18n="compliance.dataRights">
                    Data Rights Request
                </button>
            </div>
        `;

        // Try to add to existing footer or create new one
        let footer = document.querySelector('footer');
        if (!footer) {
            footer = document.createElement('footer');
            footer.className = 'app-footer';
            document.body.appendChild(footer);
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = footerContent;
        footer.appendChild(tempDiv.firstElementChild);

        // Add event listener
        const btn = document.getElementById('gdprComplianceBtn');
        if (btn) {
            btn.addEventListener('click', () => this.showComplianceModal());
        }
    }

    showComplianceModal() {
        if (this.complianceModal) {
            this.complianceModal.remove();
        }

        this.complianceModal = document.createElement('div');
        this.complianceModal.className = 'gdpr-modal';
        this.complianceModal.innerHTML = `
            <div class="gdpr-modal-overlay">
                <div class="gdpr-modal-content">
                    <button class="gdpr-close-btn" aria-label="Close">&times;</button>

                    <h2 data-i18n="compliance.dataRights">Your Data Rights</h2>
                    <p>Under GDPR and CCPA, you have the following rights:</p>

                    <div class="gdpr-rights-list">
                        <div class="gdpr-right-item">
                            <h3>Right to Access</h3>
                            <p>You can request a copy of your personal data we store.</p>
                            <button class="gdpr-action-btn" data-action="export" data-i18n="compliance.exportData">
                                Export My Data
                            </button>
                        </div>

                        <div class="gdpr-right-item">
                            <h3>Right to Erasure</h3>
                            <p>You can request deletion of your personal data.</p>
                            <button class="gdpr-action-btn danger" data-action="delete" data-i18n="compliance.deleteData">
                                Delete My Data
                            </button>
                        </div>

                        <div class="gdpr-right-item">
                            <h3>Right to Opt-Out</h3>
                            <p>You can opt-out of data collection and analytics.</p>
                            <button class="gdpr-action-btn" data-action="optout" data-i18n="compliance.optOut">
                                Opt Out
                            </button>
                        </div>

                        <div class="gdpr-right-item">
                            <h3>Cookie Preferences</h3>
                            <p>Manage your cookie preferences anytime.</p>
                            <button class="gdpr-action-btn" data-action="cookies">
                                Manage Cookies
                            </button>
                        </div>
                    </div>

                    <div class="gdpr-info">
                        <p><strong>Data We Collect:</strong></p>
                        <ul>
                            <li>Language preferences</li>
                            <li>Audio playback history (stored locally)</li>
                            <li>Theme and UI preferences</li>
                            <li>Anonymous usage analytics (if consented)</li>
                        </ul>
                        <p>All data is stored locally on your device. We do not sell your data to third parties.</p>
                        <p>For more information, read our <a href="/privacy-policy.html" target="_blank">Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.complianceModal);
        this.addModalStyles();
        this.attachModalListeners();

        // Apply i18n if available
        if (window.i18n) {
            window.i18n.updateDOM();
        }

        // Show modal
        setTimeout(() => {
            this.complianceModal.classList.add('show');
        }, 50);
    }

    attachModalListeners() {
        const closeBtn = this.complianceModal.querySelector('.gdpr-close-btn');
        const overlay = this.complianceModal.querySelector('.gdpr-modal-overlay');
        const actionBtns = this.complianceModal.querySelectorAll('.gdpr-action-btn');

        closeBtn?.addEventListener('click', () => this.hideModal());
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideModal();
            }
        });

        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });
    }

    handleAction(action) {
        switch (action) {
            case 'export':
                this.exportUserData();
                break;
            case 'delete':
                this.deleteUserData();
                break;
            case 'optout':
                this.optOutAnalytics();
                break;
            case 'cookies':
                this.manageCookies();
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    exportUserData() {
        this.userData = this.loadUserData();

        const dataToExport = {
            exportDate: new Date().toISOString(),
            userData: this.userData,
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            }
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `soundflows_data_export_${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);

        this.showNotification('✅ Your data has been exported successfully');
    }

    deleteUserData() {
        if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
            return;
        }

        // Delete all sound healing related data
        const keysToDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sound_healing_')) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => localStorage.removeItem(key));

        // Clear cookies
        if (window.cookieConsent) {
            window.cookieConsent.disableAll();
        }

        this.showNotification('✅ Your data has been deleted successfully');
        this.hideModal();

        // Reload page after brief delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    optOutAnalytics() {
        // Disable Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }

        // Set opt-out flag
        localStorage.setItem('sound_healing_analytics_optout', 'true');

        // Update cookie consent
        if (window.cookieConsent) {
            window.cookieConsent.setConsent('necessary');
        }

        this.showNotification('✅ You have opted out of analytics tracking');
    }

    manageCookies() {
        if (window.cookieConsent) {
            this.hideModal();
            window.cookieConsent.show();
        } else {
            this.showNotification('⚠️ Cookie consent manager not available');
        }
    }

    hideModal() {
        if (this.complianceModal) {
            this.complianceModal.classList.remove('show');
            setTimeout(() => {
                this.complianceModal?.remove();
                this.complianceModal = null;
            }, 300);
        }
    }

    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message, 'success');
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'gdpr-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addModalStyles() {
        if (document.getElementById('gdprComplianceStyles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'gdprComplianceStyles';
        style.textContent = `
            .gdpr-compliance-footer {
                padding: 20px;
                text-align: center;
                background: rgba(0, 0, 0, 0.02);
                margin-top: 40px;
            }

            .gdpr-link {
                background: none;
                border: none;
                color: #6666ff;
                text-decoration: underline;
                cursor: pointer;
                font-size: 14px;
                padding: 8px 16px;
            }

            .gdpr-link:hover {
                color: #4444dd;
            }

            .gdpr-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10001;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .gdpr-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .gdpr-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                overflow-y: auto;
            }

            .gdpr-modal-content {
                background: white;
                border-radius: 16px;
                padding: 40px;
                max-width: 700px;
                width: 100%;
                position: relative;
                max-height: 90vh;
                overflow-y: auto;
            }

            .gdpr-close-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 32px;
                color: #666;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 32px;
                height: 32px;
            }

            .gdpr-close-btn:hover {
                color: #333;
            }

            .gdpr-modal-content h2 {
                margin: 0 0 10px 0;
                color: #2c3e50;
            }

            .gdpr-modal-content > p {
                color: #666;
                margin-bottom: 30px;
            }

            .gdpr-rights-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .gdpr-right-item {
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                transition: all 0.3s ease;
            }

            .gdpr-right-item:hover {
                border-color: #6666ff;
                box-shadow: 0 4px 12px rgba(102, 102, 255, 0.1);
            }

            .gdpr-right-item h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #2c3e50;
            }

            .gdpr-right-item p {
                margin: 0 0 15px 0;
                font-size: 14px;
                color: #666;
            }

            .gdpr-action-btn {
                width: 100%;
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                background: #6666ff;
                color: white;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .gdpr-action-btn:hover {
                background: #5555ee;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 102, 255, 0.3);
            }

            .gdpr-action-btn.danger {
                background: #ff4444;
            }

            .gdpr-action-btn.danger:hover {
                background: #dd2222;
            }

            .gdpr-info {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
            }

            .gdpr-info p {
                margin: 10px 0;
                font-size: 14px;
                color: #666;
            }

            .gdpr-info strong {
                color: #2c3e50;
            }

            .gdpr-info ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            .gdpr-info li {
                font-size: 14px;
                color: #666;
                margin: 5px 0;
            }

            .gdpr-info a {
                color: #6666ff;
                text-decoration: none;
            }

            .gdpr-info a:hover {
                text-decoration: underline;
            }

            .gdpr-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #4CAF50;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10002;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .gdpr-notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            @media (max-width: 768px) {
                .gdpr-modal-content {
                    padding: 30px 20px;
                }

                .gdpr-rights-list {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gdprCompliance = new GDPRCompliance();
    });
} else {
    window.gdprCompliance = new GDPRCompliance();
}

// Export for global access
window.GDPRCompliance = GDPRCompliance;
