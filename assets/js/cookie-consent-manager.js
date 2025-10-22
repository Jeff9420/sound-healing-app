/**
 * Cookie Consent Manager (GDPR/CCPA Compliant)
 *
 * Features:
 * - GDPR compliant cookie consent management
 * - CCPA compliant privacy rights
 * - Granular cookie categories
 * - Cookie preference persistence
 * - Auto-blocking of non-essential cookies
 * - Privacy policy integration
 */

(function() {
    'use strict';

    // Cookie categories
    const CATEGORIES = {
        necessary: {
            id: 'necessary',
            name: {
                'zh-CN': '必要Cookie',
                'en-US': 'Necessary Cookies',
                'ja-JP': '必須Cookie',
                'ko-KR': '필수 쿠키',
                'es-ES': 'Cookies Necesarias'
            },
            description: {
                'zh-CN': '这些Cookie对于网站的基本功能是必需的，无法被禁用。',
                'en-US': 'These cookies are essential for the website to function properly.',
                'ja-JP': 'これらのCookieはウェブサイトの基本機能に不可欠です。',
                'ko-KR': '이 쿠키들은 웹사이트의 기본 기능에 필수적입니다.',
                'es-ES': 'Estas cookies son esenciales para el funcionamiento del sitio web.'
            },
            required: true,
            cookies: [
                'cookie_consent',
                'language',
                'theme',
                'audio_preferences'
            ]
        },
        analytics: {
            id: 'analytics',
            name: {
                'zh-CN': '分析Cookie',
                'en-US': 'Analytics Cookies',
                'ja-JP': '分析Cookie',
                'ko-KR': '분석 쿠키',
                'es-ES': 'Cookies de Análisis'
            },
            description: {
                'zh-CN': '帮助我们了解访客如何使用网站，以便我们改善体验。',
                'en-US': 'Help us understand how visitors interact with our website.',
                'ja-JP': '訪問者がどのようにサイトを使用しているかを理解するのに役立ちます。',
                'ko-KR': '방문자가 웹사이트와 상호작용하는 방식을 이해하는 데 도움이 됩니다.',
                'es-ES': 'Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.'
            },
            required: false,
            cookies: [
                '_ga',
                '_gid',
                '_gat',
                'fbp',
                'fbc'
            ]
        },
        marketing: {
            id: 'marketing',
            name: {
                'zh-CN': '营销Cookie',
                'en-US': 'Marketing Cookies',
                'ja-JP': 'マーケティングCookie',
                'ko-KR': '마케팅 쿠키',
                'es-ES': 'Cookies de Marketing'
            },
            description: {
                'zh-CN': '用于展示相关广告和营销活动。',
                'en-US': 'Used to deliver personalized advertisements.',
                'ja-JP': 'パーソナライズされた広告を配信するために使用されます。',
                'ko-KR': '개인화된 광고를 전달하는 데 사용됩니다.',
                'es-ES': 'Se utilizan para mostrar anuncios personalizados.'
            },
            required: false,
            cookies: [
                'fr',
                'tr',
                'IDE',
                'ads/ga-audiences'
            ]
        },
        functional: {
            id: 'functional',
            name: {
                'zh-CN': '功能Cookie',
                'en-US': 'Functional Cookies',
                'ja-JP': '機能Cookie',
                'ko-KR': '기능 쿠키',
                'es-ES': 'Cookies Funcionales'
            },
            description: {
                'zh-CN': '提供增强功能和个性化体验。',
                'en-US': 'Enable enhanced functionality and personalization.',
                'ja-JP': '拡張機能とパーソナライゼーションを有効にします。',
                'ko-KR': '향상된 기능과 개인화를 활성화합니다.',
                'es-ES': 'Habilitan funcionalidades mejoradas y personalización.'
            },
            required: false,
            cookies: [
                'user_preferences',
                'audio_history',
                'playlist_settings',
                'session_state'
            ]
        }
    };

    // Default consent state
    const DEFAULT_CONSENT = {
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
    };

    // Manager class
    class CookieConsentManager {
        constructor(config = {}) {
            this.config = {
                cookieName: 'cookie_consent',
                consentDuration: 365, // days
                privacyPolicyUrl: '/privacy-policy',
                ccpaPrivacyUrl: '/privacy-policy#ccpa',
                autoShow: true,
                language: 'zh-CN',
                ...config
            };

            this.consent = this.loadConsent();
            this.hasInteracted = this.getCookie('cookie_consent_interacted') === 'true';
            this.language = this.config.language || this.detectLanguage();

            // Initialize if needed
            if (!this.hasInteracted && this.config.autoShow) {
                this.init();
            } else {
                this.applyConsent();
            }
        }

        detectLanguage() {
            const browserLang = navigator.language || 'en-US';
            const supportedLangs = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES'];

            for (const lang of supportedLangs) {
                if (browserLang.startsWith(lang.split('-')[0])) {
                    return lang;
                }
            }
            return 'en-US';
        }

        init() {
            this.createConsentUI();
            this.showConsentBanner();
        }

        createConsentUI() {
            // Create consent banner
            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.className = 'cookie-consent-banner';
            banner.innerHTML = this.getBannerHTML();

            // Create preferences modal
            const modal = document.createElement('div');
            modal.id = 'cookie-preferences-modal';
            modal.className = 'cookie-preferences-modal';
            modal.innerHTML = this.getModalHTML();

            // Add CSS styles
            this.addStyles();

            // Append to body
            document.body.appendChild(banner);
            document.body.appendChild(modal);

            // Bind events
            this.bindEvents();
        }

        getBannerHTML() {
            const t = this.getTranslation();
            return `
                <div class="cookie-banner-content">
                    <div class="cookie-banner-text">
                        <h3>${t.bannerTitle}</h3>
                        <p>${t.bannerText}</p>
                        <a href="${this.config.privacyPolicyUrl}" class="cookie-link">${t.privacyLink}</a>
                    </div>
                    <div class="cookie-banner-actions">
                        <button type="button" class="cookie-btn cookie-btn-accept-all" data-action="accept-all">
                            ${t.acceptAll}
                        </button>
                        <button type="button" class="cookie-btn cookie-btn-necessary" data-action="accept-necessary">
                            ${t.acceptNecessary}
                        </button>
                        <button type="button" class="cookie-btn cookie-btn-preferences" data-action="preferences">
                            ${t.preferences}
                        </button>
                    </div>
                </div>
            `;
        }

        getModalHTML() {
            const t = this.getTranslation();
            let categoriesHTML = '';

            for (const [key, category] of Object.entries(CATEGORIES)) {
                const checked = this.consent[key] ? 'checked' : '';
                const disabled = category.required ? 'disabled' : '';

                categoriesHTML += `
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-switch">
                                <input type="checkbox"
                                    id="cookie-${key}"
                                    data-category="${key}"
                                    ${checked}
                                    ${disabled}>
                                <span class="cookie-slider"></span>
                            </label>
                            <div class="cookie-category-info">
                                <h4>${category.name[this.language]}</h4>
                                <p>${category.description[this.language]}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="cookie-modal-overlay"></div>
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h3>${t.modalTitle}</h3>
                        <button type="button" class="cookie-modal-close">&times;</button>
                    </div>
                    <div class="cookie-modal-body">
                        <p>${t.modalText}</p>
                        <div class="cookie-categories">
                            ${categoriesHTML}
                        </div>
                    </div>
                    <div class="cookie-modal-footer">
                        <button type="button" class="cookie-btn cookie-btn-save" data-action="save">
                            ${t.savePreferences}
                        </button>
                    </div>
                </div>
            `;
        }

        getTranslation() {
            const translations = {
                'zh-CN': {
                    bannerTitle: 'Cookie使用说明',
                    bannerText: '我们使用Cookie来改善您的浏览体验、分析网站流量和个性化内容。您可以选择接受所有Cookie或管理您的偏好。',
                    privacyLink: '隐私政策',
                    acceptAll: '接受全部',
                    acceptNecessary: '仅接受必要',
                    preferences: '管理偏好',
                    modalTitle: 'Cookie偏好设置',
                    modalText: '请选择您允许的Cookie类别。必要Cookie始终启用，因为它们是网站基本功能所必需的。',
                    savePreferences: '保存偏好'
                },
                'en-US': {
                    bannerTitle: 'Cookie Notice',
                    bannerText: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to accept all cookies or manage your preferences.',
                    privacyLink: 'Privacy Policy',
                    acceptAll: 'Accept All',
                    acceptNecessary: 'Necessary Only',
                    preferences: 'Manage Preferences',
                    modalTitle: 'Cookie Preferences',
                    modalText: 'Please select the cookie categories you wish to allow. Necessary cookies are always enabled as they are essential for the website to function.',
                    savePreferences: 'Save Preferences'
                }
            };

            return translations[this.language] || translations['en-US'];
        }

        addStyles() {
            const styles = `
                .cookie-consent-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.95);
                    color: white;
                    padding: 20px;
                    z-index: 10000;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .cookie-consent-banner.show {
                    transform: translateY(0);
                }

                .cookie-banner-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .cookie-banner-text h3 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                }

                .cookie-banner-text p {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .cookie-link {
                    color: #4299e1;
                    text-decoration: none;
                    font-size: 14px;
                }

                .cookie-link:hover {
                    text-decoration: underline;
                }

                .cookie-banner-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .cookie-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s;
                }

                .cookie-btn-accept-all {
                    background: #4299e1;
                    color: white;
                }

                .cookie-btn-accept-all:hover {
                    background: #3182ce;
                }

                .cookie-btn-necessary {
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                }

                .cookie-btn-necessary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .cookie-btn-preferences {
                    background: transparent;
                    color: white;
                    text-decoration: underline;
                }

                .cookie-preferences-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: none;
                }

                .cookie-preferences-modal.show {
                    display: block;
                }

                .cookie-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                }

                .cookie-modal-content {
                    position: relative;
                    background: white;
                    color: #333;
                    max-width: 600px;
                    margin: 50px auto;
                    padding: 0;
                    border-radius: 10px;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .cookie-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .cookie-modal-header h3 {
                    margin: 0;
                    font-size: 20px;
                }

                .cookie-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #718096;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cookie-modal-body {
                    padding: 20px;
                }

                .cookie-categories {
                    margin-top: 20px;
                }

                .cookie-category {
                    margin-bottom: 20px;
                }

                .cookie-category-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                }

                .cookie-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .cookie-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .cookie-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e0;
                    transition: 0.3s;
                    border-radius: 24px;
                }

                .cookie-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }

                input:checked + .cookie-slider {
                    background-color: #4299e1;
                }

                input:checked + .cookie-slider:before {
                    transform: translateX(26px);
                }

                input:disabled + .cookie-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .cookie-category-info h4 {
                    margin: 0 0 5px 0;
                    font-size: 16px;
                }

                .cookie-category-info p {
                    margin: 0;
                    font-size: 14px;
                    color: #718096;
                    line-height: 1.5;
                }

                .cookie-modal-footer {
                    padding: 20px;
                    border-top: 1px solid #e2e8f0;
                    text-align: right;
                }

                .cookie-btn-save {
                    background: #4299e1;
                    color: white;
                }

                .cookie-btn-save:hover {
                    background: #3182ce;
                }

                @media (max-width: 768px) {
                    .cookie-banner-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .cookie-banner-actions {
                        justify-content: center;
                    }

                    .cookie-modal-content {
                        margin: 20px;
                        max-height: 90vh;
                    }

                    .cookie-category-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        bindEvents() {
            // Banner buttons
            document.querySelector('[data-action="accept-all"]').addEventListener('click', () => {
                this.acceptAll();
            });

            document.querySelector('[data-action="accept-necessary"]').addEventListener('click', () => {
                this.acceptNecessary();
            });

            document.querySelector('[data-action="preferences"]').addEventListener('click', () => {
                this.showPreferences();
            });

            // Modal events
            document.querySelector('.cookie-modal-close').addEventListener('click', () => {
                this.hidePreferences();
            });

            document.querySelector('.cookie-modal-overlay').addEventListener('click', () => {
                this.hidePreferences();
            });

            document.querySelector('[data-action="save"]').addEventListener('click', () => {
                this.savePreferences();
            });

            // Prevent modal close on content click
            document.querySelector('.cookie-modal-content').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        showConsentBanner() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.add('show');
            }
        }

        hideConsentBanner() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.remove('show');
            }
        }

        showPreferences() {
            const modal = document.getElementById('cookie-preferences-modal');
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }

        hidePreferences() {
            const modal = document.getElementById('cookie-preferences-modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        acceptAll() {
            const newConsent = {};
            for (const key of Object.keys(CATEGORIES)) {
                newConsent[key] = true;
            }
            this.updateConsent(newConsent);
            this.hideConsentBanner();
        }

        acceptNecessary() {
            const newConsent = {};
            for (const [key, category] of Object.entries(CATEGORIES)) {
                newConsent[key] = category.required;
            }
            this.updateConsent(newConsent);
            this.hideConsentBanner();
        }

        savePreferences() {
            const newConsent = {};
            for (const key of Object.keys(CATEGORIES)) {
                const checkbox = document.getElementById(`cookie-${key}`);
                newConsent[key] = checkbox ? checkbox.checked : CATEGORIES[key].required;
            }
            this.updateConsent(newConsent);
            this.hidePreferences();
            this.hideConsentBanner();
        }

        updateConsent(consent) {
            this.consent = consent;
            this.saveConsent();
            this.setCookie('cookie_consent_interacted', 'true', this.config.consentDuration);
            this.hasInteracted = true;
            this.applyConsent();
            this.fireConsentEvent();
        }

        applyConsent() {
            // Apply consent to actual cookies and scripts
            if (this.consent.analytics) {
                this.enableAnalytics();
            } else {
                this.disableAnalytics();
            }

            if (this.consent.marketing) {
                this.enableMarketing();
            } else {
                this.disableMarketing();
            }

            if (this.consent.functional) {
                this.enableFunctional();
            } else {
                this.disableFunctional();
            }

            // Always enable necessary
            this.enableNecessary();
        }

        enableAnalytics() {
            // Enable Google Analytics, Facebook Pixel, etc.
            console.log('[Cookie Consent] Analytics enabled');
            window.dataLayer = window.dataLayer || [];

            // Load GA if not already loaded
            if (!window.ga) {
                this.loadScript('https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID');
                window.gtag = function() { dataLayer.push(arguments); };
                window.gtag('js', new Date());
                window.gtag('config', 'GA_MEASUREMENT_ID');
            }
        }

        disableAnalytics() {
            console.log('[Cookie Consent] Analytics disabled');
            // Remove analytics cookies
            for (const cookie of CATEGORIES.analytics.cookies) {
                this.deleteCookie(cookie);
            }
        }

        enableMarketing() {
            console.log('[Cookie Consent] Marketing enabled');
            // Enable marketing cookies and scripts
        }

        disableMarketing() {
            console.log('[Cookie Consent] Marketing disabled');
            // Remove marketing cookies
            for (const cookie of CATEGORIES.marketing.cookies) {
                this.deleteCookie(cookie);
            }
        }

        enableFunctional() {
            console.log('[Cookie Consent] Functional enabled');
            // Enable functional cookies
        }

        disableFunctional() {
            console.log('[Cookie Consent] Functional disabled');
            // Remove functional cookies
            for (const cookie of CATEGORIES.functional.cookies) {
                this.deleteCookie(cookie);
            }
        }

        enableNecessary() {
            console.log('[Cookie Consent] Necessary cookies enabled');
            // Always enable necessary cookies
        }

        loadScript(src) {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            document.head.appendChild(script);
        }

        fireConsentEvent() {
            const event = new CustomEvent('cookieConsentUpdate', {
                detail: { consent: this.consent }
            });
            document.dispatchEvent(event);
        }

        saveConsent() {
            const consentJSON = JSON.stringify(this.consent);
            this.setCookie(this.config.cookieName, consentJSON, this.config.consentDuration);
        }

        loadConsent() {
            const consentJSON = this.getCookie(this.config.cookieName);
            if (consentJSON) {
                try {
                    return { ...DEFAULT_CONSENT, ...JSON.parse(consentJSON) };
                } catch (e) {
                    console.error('[Cookie Consent] Failed to parse consent JSON:', e);
                }
            }
            return { ...DEFAULT_CONSENT };
        }

        setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
        }

        getCookie(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

        deleteCookie(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
        }

        // Public methods
        hasConsent(category) {
            return this.consent[category] === true;
        }

        updateConsentForCategory(category, granted) {
            if (CATEGORIES[category]) {
                this.consent[category] = granted;
                this.saveConsent();
                this.applyConsent();
                this.fireConsentEvent();
            }
        }

        showConsentManager() {
            this.showPreferences();
        }

        // CCPA methods
        doNotSell() {
            // CCPA "Do Not Sell My Personal Information" implementation
            this.setCookie('ccpa_do_not_sell', 'true', 365);
            this.disableMarketing();
            this.disableAnalytics();
        }

        withdrawConsent() {
            // Allow users to withdraw all consent
            for (const key of Object.keys(CATEGORIES)) {
                if (!CATEGORIES[key].required) {
                    this.consent[key] = false;
                }
            }
            this.saveConsent();
            this.applyConsent();
            this.fireConsentEvent();
        }

        requestDataDeletion() {
            // Handle data deletion requests
            window.location.href = '/data-deletion-request';
        }
    }

    // Auto-initialize
    let cookieManager = null;

    function init(config = {}) {
        if (!cookieManager) {
            cookieManager = new CookieConsentManager(config);
        }
        return cookieManager;
    }

    // Export to global scope
    window.CookieConsentManager = CookieConsentManager;
    window.cookieConsent = {
        init,
        manager: () => cookieManager,
        hasConsent: (category) => cookieManager ? cookieManager.hasConsent(category) : false,
        showManager: () => cookieManager ? cookieManager.showConsentManager() : null,
        doNotSell: () => cookieManager ? cookieManager.doNotSell() : null,
        withdrawConsent: () => cookieManager ? cookieManager.withdrawConsent() : null
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();