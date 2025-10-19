/**
 * Social Share功能
 * 支持分享到Facebook, Twitter, LinkedIn, WhatsApp
 * @version 1.0.0
 */

class SocialShare {
    constructor() {
        this.shareButtons = null;
        this.currentUrl = window.location.href;
        this.shareTitle = document.title || 'Sound Healing Space';
        this.shareText = 'Check out this amazing sound healing platform with 213+ healing audio tracks!';
        this.init();
    }

    init() {
        this.createShareButtons();
        this.attachEventListeners();
        console.log('✅ Social Share initialized');
    }

    createShareButtons() {
        // Check if share buttons container already exists
        if (document.getElementById('socialShareButtons')) {
            return;
        }

        // Create share buttons container
        const shareContainer = document.createElement('div');
        shareContainer.id = 'socialShareButtons';
        shareContainer.className = 'social-share-container';
        shareContainer.innerHTML = `
            <button class="social-share-toggle" aria-label="Share" data-i18n-title="share.title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
            </button>

            <div class="social-share-menu" role="menu" aria-label="Share options">
                <button class="social-share-btn facebook" data-platform="facebook" aria-label="Share on Facebook" data-i18n="share.facebook">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span data-i18n="share.facebook">Facebook</span>
                </button>

                <button class="social-share-btn twitter" data-platform="twitter" aria-label="Share on Twitter" data-i18n="share.twitter">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span data-i18n="share.twitter">Twitter</span>
                </button>

                <button class="social-share-btn linkedin" data-platform="linkedin" aria-label="Share on LinkedIn" data-i18n="share.linkedin">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077B5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span data-i18n="share.linkedin">LinkedIn</span>
                </button>

                <button class="social-share-btn whatsapp" data-platform="whatsapp" aria-label="Share on WhatsApp" data-i18n="share.whatsapp">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.713 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span data-i18n="share.whatsapp">WhatsApp</span>
                </button>

                <button class="social-share-btn email" data-platform="email" aria-label="Share via Email" data-i18n="share.email">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span data-i18n="share.email">Email</span>
                </button>

                <button class="social-share-btn copylink" data-platform="copy" aria-label="Copy link" data-i18n="share.copyLink">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <span data-i18n="share.copyLink">Copy Link</span>
                </button>
            </div>
        `;

        // Add CSS styles
        this.addStyles();

        // Append to header or create a fixed position button
        const header = document.querySelector('.header__actions');
        if (header) {
            header.appendChild(shareContainer);
        } else {
            document.body.appendChild(shareContainer);
        }

        this.shareButtons = shareContainer;
    }

    attachEventListeners() {
        // Toggle share menu
        const toggleBtn = document.querySelector('.social-share-toggle');
        const shareMenu = document.querySelector('.social-share-menu');

        if (toggleBtn && shareMenu) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                shareMenu.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.social-share-container')) {
                    shareMenu.classList.remove('active');
                }
            });
        }

        // Share buttons
        const shareButtons = document.querySelectorAll('.social-share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.dataset.platform;
                this.share(platform);
                shareMenu?.classList.remove('active');
            });
        });
    }

    share(platform) {
        const url = encodeURIComponent(this.currentUrl);
        const title = encodeURIComponent(this.shareTitle);
        const text = encodeURIComponent(this.shareText);

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                window.open(shareUrl, '_blank');
                break;

            case 'email':
                shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
                window.location.href = shareUrl;
                break;

            case 'copy':
                this.copyToClipboard(this.currentUrl);
                break;

            default:
                console.warn('Unknown platform:', platform);
        }

        // Track share event
        if (window.gtag) {
            window.gtag('event', 'share', {
                method: platform,
                content_type: 'website',
                item_id: this.currentUrl
            });
        }

        if (window.trackShare) {
            window.trackShare(platform);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification(window.i18n?.getTranslation('share.linkCopied') || 'Link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showNotification(window.i18n?.getTranslation('share.linkCopied') || 'Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
            document.body.removeChild(textArea);
        }
    }

    showNotification(message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, 'success');
            return;
        }

        // Create simple notification
        const notification = document.createElement('div');
        notification.className = 'share-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .social-share-container {
                position: relative;
                display: inline-block;
            }

            .social-share-toggle {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .social-share-toggle:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }

            .social-share-menu {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                padding: 8px;
                min-width: 200px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1000;
            }

            .social-share-menu.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .social-share-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                font-size: 14px;
                color: #333;
            }

            .social-share-btn:hover {
                background: rgba(0,0,0,0.05);
            }

            .social-share-btn svg {
                flex-shrink: 0;
            }

            .share-notification {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: #4CAF50;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10001;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .share-notification.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .social-share-menu {
                    right: auto;
                    left: 50%;
                    transform: translateX(-50%) translateY(-10px);
                }

                .social-share-menu.active {
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.socialShare = new SocialShare();
    });
} else {
    window.socialShare = new SocialShare();
}

// Export for global access
window.SocialShare = SocialShare;
