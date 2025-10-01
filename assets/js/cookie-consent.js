// ========== Cookie Consent Banner ==========
// GDPR compliant cookie consent management for SoundFlows

class CookieConsent {
  constructor() {
    this.banner = null;
    this.preferences = null;
    this.consentGiven = false;
    this.init();
  }

  init() {
    // Check if user has already given consent
    const existingConsent = this.getConsent();

    if (!existingConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        this.createBanner();
      }, 1000);
    } else {
      this.consentGiven = true;
      this.applyConsent(existingConsent);
    }
  }

  getConsent() {
    const consent = localStorage.getItem('cookieConsent');
    return consent ? JSON.parse(consent) : null;
  }

  setConsent(consentType) {
    const consent = {
      type: consentType,
      date: new Date().toISOString(),
      version: '1.0'
    };

    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    this.consentGiven = true;
    this.applyConsent(consent);

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('cookieConsentGiven', {
      detail: consent
    }));
  }

  applyConsent(consent) {
    switch (consent.type) {
      case 'accepted':
        this.enableAnalytics();
        break;
      case 'necessary':
        this.disableAnalytics();
        break;
      case 'denied':
        this.disableAll();
        break;
    }
  }

  enableAnalytics() {
    // Load analytics scripts
    if (window.__ANALYTICS_CONFIG) {
      // Reload analytics if already initialized
      if (window.soundFlowsAnalytics) {
        window.soundFlowsAnalytics.loadAnalytics();
      }
    }
  }

  disableAnalytics() {
    // Remove analytics cookies
    this.removeCookies('_ga');
    this.removeCookies('_gid');
    this.removeCookies('_gat');
    this.removeCookies('_cl');
  }

  disableAll() {
    this.disableAnalytics();
    // Remove other non-essential cookies
    this.removeCookies('theme');
    this.removeCookies('language');
  }

  removeCookies(pattern) {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.trim().split('=')[0];
      if (cookieName.includes(pattern)) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }

  createBanner() {
    // Create banner container
    this.banner = document.createElement('div');
    this.banner.id = 'cookieConsentBanner';
    this.banner.innerHTML = `
      <div class="cookie-banner">
        <div class="cookie-content">
          <h3>🍪 Cookie Preferences</h3>
          <p>We use cookies to enhance your experience and analyze our traffic.
          By clicking "Accept All", you consent to our use of cookies.</p>

          <div class="cookie-options">
            <label class="cookie-option">
              <input type="radio" name="cookieConsent" value="accepted" checked>
              <span>Accept All</span>
              <small>Enables analytics for better experience</small>
            </label>

            <label class="cookie-option">
              <input type="radio" name="cookieConsent" value="necessary">
              <span>Necessary Only</span>
              <small>Essential cookies only</small>
            </label>

            <label class="cookie-option">
              <input type="radio" name="cookieConsent" value="denied">
              <span>Deny All</span>
              <small>No cookies except essentials</small>
            </label>
          </div>

          <div class="cookie-actions">
            <button id="cookiePreferences" class="btn-secondary">Preferences</button>
            <button id="cookieAccept" class="btn-primary">Accept Selected</button>
          </div>

          <a href="#" id="privacyPolicyLink" class="privacy-link">Privacy Policy</a>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Add to page
    document.body.appendChild(this.banner);

    // Bind events
    this.bindEvents();

    // Show with animation
    setTimeout(() => {
      this.banner.classList.add('show');
    }, 100);
  }

  bindEvents() {
    // Accept button
    const acceptBtn = this.banner.querySelector('#cookieAccept');
    acceptBtn.addEventListener('click', () => {
      const selected = this.banner.querySelector('input[name="cookieConsent"]:checked');
      this.setConsent(selected.value);
      this.hideBanner();
    });

    // Preferences button
    const prefBtn = this.banner.querySelector('#cookiePreferences');
    prefBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPreferences();
    });

    // Privacy policy link
    const privacyLink = this.banner.querySelector('#privacyPolicyLink');
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      // TODO: Open privacy policy modal or page
      console.log('Privacy policy clicked');
    });
  }

  showPreferences() {
    // Create preferences modal
    const modal = document.createElement('div');
    modal.className = 'cookie-preferences-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Cookie Preferences</h3>

          <div class="preference-category">
            <h4>Analytics Cookies</h4>
            <p>Help us understand how you use our website to improve your experience.</p>
            <label class="switch">
              <input type="checkbox" id="analyticsToggle" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="preference-category">
            <h4>Personalization</h4>
            <p>Remember your theme and language preferences.</p>
            <label class="switch">
              <input type="checkbox" id="personalizationToggle" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div class="modal-actions">
            <button id="savePreferences" class="btn-primary">Save Preferences</button>
            <button id="closePreferences" class="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind modal events
    modal.querySelector('#savePreferences').addEventListener('click', () => {
      const analytics = modal.querySelector('#analyticsToggle').checked;
      const personalization = modal.querySelector('#personalizationToggle').checked;

      let consentType = 'necessary';
      if (analytics && personalization) consentType = 'accepted';
      else if (analytics) consentType = 'necessary';

      this.setConsent(consentType);
      this.hideBanner();
      modal.remove();
    });

    modal.querySelector('#closePreferences').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        modal.remove();
      }
    });
  }

  hideBanner() {
    this.banner.classList.remove('show');
    setTimeout(() => {
      if (this.banner && this.banner.parentNode) {
        this.banner.parentNode.removeChild(this.banner);
      }
    }, 500);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #cookieConsentBanner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(45, 35, 65, 0.98);
        backdrop-filter: blur(10px);
        color: white;
        padding: 0;
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        border-top: 1px solid rgba(232, 184, 109, 0.3);
      }

      #cookieConsentBanner.show {
        transform: translateY(0);
      }

      .cookie-banner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 30px 20px;
      }

      .cookie-content h3 {
        margin: 0 0 15px 0;
        font-size: 20px;
        font-weight: 600;
      }

      .cookie-content p {
        margin: 0 0 20px 0;
        font-size: 14px;
        line-height: 1.6;
        opacity: 0.9;
      }

      .cookie-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
      }

      .cookie-option {
        cursor: pointer;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .cookie-option:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(232, 184, 109, 0.4);
      }

      .cookie-option input[type="radio"] {
        margin-right: 10px;
      }

      .cookie-option span {
        font-weight: 500;
        display: block;
        margin-bottom: 5px;
      }

      .cookie-option small {
        font-size: 12px;
        opacity: 0.7;
        display: block;
        line-height: 1.4;
      }

      .cookie-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-bottom: 20px;
      }

      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: #e8b86d;
        color: #2d2341;
      }

      .btn-primary:hover {
        background: #d4a65c;
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .privacy-link {
        color: #e8b86d;
        text-decoration: none;
        font-size: 13px;
        opacity: 0.8;
        transition: opacity 0.3s ease;
      }

      .privacy-link:hover {
        opacity: 1;
      }

      /* Preferences Modal */
      .cookie-preferences-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
      }

      .modal-overlay {
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
      }

      .modal-content {
        background: #2d2341;
        color: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-content h3 {
        margin: 0 0 25px 0;
        font-size: 24px;
      }

      .preference-category {
        margin-bottom: 25px;
        padding-bottom: 25px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .preference-category:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .preference-category h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }

      .preference-category p {
        margin: 0 0 15px 0;
        font-size: 14px;
        opacity: 0.8;
      }

      /* Toggle Switch */
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.2);
        transition: .4s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #e8b86d;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .modal-actions {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-top: 30px;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .cookie-banner {
          padding: 20px 15px;
        }

        .cookie-options {
          grid-template-columns: 1fr;
        }

        .cookie-actions {
          flex-direction: column;
        }

        .modal-content {
          padding: 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Public methods
  reset() {
    localStorage.removeItem('cookieConsent');
    this.consentGiven = false;
    if (this.banner && this.banner.parentNode) {
      this.banner.parentNode.removeChild(this.banner);
    }
    this.init();
  }

  show() {
    if (!this.consentGiven) {
      this.createBanner();
    }
  }
}

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsent = new CookieConsent();
});

// Export for global access
window.CookieConsent = CookieConsent;