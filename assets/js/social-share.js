/**
 * Social Share功能 - 增强版
 * 支持分享到国内外主流社交平台
 * 包括微信、微博、QQ、朋友圈等中文平台
 * @version 2.0.0
 */

class SocialShare {
    constructor() {
        this.shareButtons = null;
        this.currentUrl = window.location.href;
        this.shareTitle = document.title || 'SoundFlows 声音疗愈空间';
        this.shareText = '探索 SoundFlows 的 213+ 疗愈音频，包含雨声、颂钵、冥想音乐等，助您放松身心，改善睡眠。';
        this.shareImage = 'https://soundflows.app/assets/images/og-image.jpg';
        this.isWeChat = this.detectWeChat();
        this.init();
    }

    init() {
        this.createShareButtons();
        this.attachEventListeners();
        console.log('✅ Enhanced Social Share initialized with WeChat support');
    }

    detectWeChat() {
        return /micromessenger/i.test(navigator.userAgent);
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
                <!-- 国际平台 -->
                <div class="share-group" data-i18n="share.international">
                    <button class="social-share-btn facebook" data-platform="facebook" aria-label="Share on Facebook">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span data-i18n="share.facebook">Facebook</span>
                    </button>

                    <button class="social-share-btn twitter" data-platform="twitter" aria-label="Share on Twitter">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span data-i18n="share.twitter">Twitter</span>
                    </button>

                    <button class="social-share-btn linkedin" data-platform="linkedin" aria-label="Share on LinkedIn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077B5">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span data-i18n="share.linkedin">LinkedIn</span>
                    </button>

                    <button class="social-share-btn whatsapp" data-platform="whatsapp" aria-label="Share on WhatsApp">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.304-1.654a11.882 11.882 0 005.713 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span data-i18n="share.whatsapp">WhatsApp</span>
                    </button>

                    <button class="social-share-btn telegram" data-platform="telegram" aria-label="Share on Telegram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0088cc">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        <span data-i18n="share.telegram">Telegram</span>
                    </button>
                </div>

                <!-- 中文平台 -->
                <div class="share-group" data-i18n="share.chinese">
                    <button class="social-share-btn wechat" data-platform="wechat" aria-label="Share on WeChat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#07C160">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                        </svg>
                        <span data-i18n="share.wechat">微信</span>
                    </button>

                    <button class="social-share-btn weibo" data-platform="weibo" aria-label="Share on Weibo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#E6162D">
                            <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443z"/>
                            <path d="M6.89 18.172c-.307-.245-.5-.625-.528-1.058-.056-.923.672-1.688 1.635-1.744.965-.056 1.785.618 1.84 1.544.056.923-.672 1.688-1.632 1.746-.48.028-.92-.13-1.236-.398l-.726.652c.547.493 1.278.768 2.05.726 1.484-.086 2.62-1.377 2.532-2.89-.086-1.511-1.353-2.682-2.832-2.594-1.48.088-2.614 1.38-2.528 2.893.039.675.329 1.279.785 1.724l.726-.652z"/>
                            <path d="M15.028 17.47c.034.09.013.19-.058.26l-.698.625c-.07.062-.174.073-.257.028-.733-.382-1.375-.904-1.889-1.545-.03-.038-.026-.095.008-.13l.585-.59c.036-.037.09-.04.13-.007.335.284.716.515 1.13.688.094.04.16.118.182.215l.023.267z"/>
                            <path d="M19.394 9.116c-.818-.124-2.277-.127-3.622-.06-1.33.068-1.732.067-2.543.067-.822 0-1.864.093-2.426.093-2.113 0-4.928-1.069-4.928-3.005C6.075 4.275 9.21 2.5 13.5 2.5c3.526 0 6.425 1.386 6.425 3.75 0 .98-.436 1.77-1.168 2.358-.265.212-.592.373-.962.475l.001-.001z"/>
                            <path d="M8.012 5.813c0-.724.59-1.313 1.314-1.313s1.313.589 1.313 1.313c0 .724-.59 1.313-1.313 1.313s-1.314-.589-1.314-1.313zm8.714 0c0-.724.59-1.313 1.314-1.313s1.313.589 1.313 1.313c0 .724-.59 1.313-1.313 1.313s-1.314-.589-1.314-1.313z"/>
                        </svg>
                        <span data-i18n="share.weibo">微博</span>
                    </button>

                    <button class="social-share-btn qq" data-platform="qq" aria-label="Share on QQ">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#12B7F5">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        <span data-i18n="share.qq">QQ</span>
                    </button>

                    <button class="social-share-btn qzone" data-platform="qzone" aria-label="Share on QZone">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FDBA33">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span data-i18n="share.qzone">QQ空间</span>
                    </button>

                    <button class="social-share-btn douban" data-platform="douban" aria-label="Share on Douban">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#007722">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                        </svg>
                        <span data-i18n="share.douban">豆瓣</span>
                    </button>
                </div>

                <!-- 通用选项 -->
                <div class="share-group" data-i18n="share.universal">
                    <button class="social-share-btn email" data-platform="email" aria-label="Share via Email">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <span data-i18n="share.email">邮件分享</span>
                    </button>

                    <button class="social-share-btn copylink" data-platform="copy" aria-label="Copy link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        <span data-i18n="share.copyLink">复制链接</span>
                    </button>
                </div>
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
        const pic = encodeURIComponent(this.shareImage);

        let shareUrl = '';

        switch (platform) {
            // 国际平台
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

            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                window.open(shareUrl, '_blank');
                break;

            // 中文平台
            case 'wechat':
                this.showWeChatShare();
                break;

            case 'weibo':
                shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${pic}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'qq':
                shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${text}&pics=${pic}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'qzone':
                shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${title}&summary=${text}&pics=${pic}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            case 'douban':
                shareUrl = `https://www.douban.com/share/service?href=${url}&name=${title}&text=${text}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;

            // 通用选项
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

    showWeChatShare() {
        // Create WeChat QR code modal
        const modal = document.createElement('div');
        modal.className = 'wechat-share-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <h3 data-i18n="share.wechatTitle">分享到微信</h3>
                <p data-i18n="share.wechatInstructions">使用微信扫描二维码分享</p>
                <div class="qr-code">
                    <div id="wechatQR"></div>
                </div>
                <p class="wechat-tip" data-i18n="share.wechatTip">或点击右上角"..."分享给好友</p>
                <button class="close-btn" onclick="this.closest('.wechat-share-modal').remove()" data-i18n="share.close">关闭</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Generate QR code
        this.generateQRCode(this.currentUrl, 'wechatQR');

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    generateQRCode(text, elementId) {
        const qrContainer = document.getElementById(elementId);
        if (!qrContainer) return;

        // Use QRCode.js library if available, otherwise use simple text
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback: Use online QR code API
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
            img.alt = 'QR Code';
            img.style.width = '200px';
            img.style.height = '200px';
            qrContainer.appendChild(img);
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
                padding: 12px;
                min-width: 280px;
                max-width: 350px;
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

            .share-group {
                margin-bottom: 12px;
            }

            .share-group:last-child {
                margin-bottom: 0;
            }

            .share-group[data-i18n] {
                font-size: 12px;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                padding-left: 4px;
            }

            .social-share-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 10px 14px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                font-size: 14px;
                color: #333;
                margin-bottom: 4px;
            }

            .social-share-btn:last-child {
                margin-bottom: 0;
            }

            .social-share-btn:hover {
                background: rgba(0,0,0,0.05);
            }

            .social-share-btn.wechat:hover {
                background: rgba(7, 193, 96, 0.1);
            }

            .social-share-btn.weibo:hover {
                background: rgba(230, 22, 45, 0.1);
            }

            .social-share-btn.qq:hover {
                background: rgba(18, 183, 245, 0.1);
            }

            .social-share-btn.qzone:hover {
                background: rgba(253, 186, 51, 0.1);
            }

            .social-share-btn.douban:hover {
                background: rgba(0, 119, 34, 0.1);
            }

            .social-share-btn svg {
                flex-shrink: 0;
            }

            .social-share-btn span {
                flex-grow: 1;
                text-align: left;
            }

            /* WeChat QR Code Modal */
            .wechat-share-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .wechat-share-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .wechat-share-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
            }

            .wechat-share-modal .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                min-width: 320px;
            }

            .wechat-share-modal h3 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 20px;
            }

            .wechat-share-modal p {
                margin: 0 0 20px 0;
                color: #666;
                font-size: 14px;
            }

            .wechat-share-modal .qr-code {
                margin: 20px 0;
                padding: 20px;
                background: #f5f5f5;
                border-radius: 8px;
                display: inline-block;
            }

            .wechat-share-modal .wechat-tip {
                font-size: 13px;
                color: #999;
                margin-bottom: 20px;
            }

            .wechat-share-modal .close-btn {
                background: #07C160;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s ease;
            }

            .wechat-share-modal .close-btn:hover {
                background: #06a850;
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

            /* Floating share button (if not in header) */
            .floating-share-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 999;
            }

            .floating-share-container .social-share-toggle {
                background: #6666ff;
                color: white;
                border-radius: 50%;
                width: 56px;
                height: 56px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(102, 102, 255, 0.3);
            }

            .floating-share-container .social-share-toggle:hover {
                background: #5555ee;
                transform: scale(1.1);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .social-share-menu {
                    right: auto;
                    left: 50%;
                    transform: translateX(-50%) translateY(-10px);
                    min-width: 250px;
                }

                .social-share-menu.active {
                    transform: translateX(-50%) translateY(0);
                }

                .social-share-btn {
                    padding: 12px 10px;
                    font-size: 13px;
                }

                .social-share-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .wechat-share-modal .modal-content {
                    min-width: 280px;
                    padding: 20px;
                    margin: 20px;
                }

                .floating-share-container {
                    bottom: 20px;
                    right: 20px;
                }

                .floating-share-container .social-share-toggle {
                    width: 48px;
                    height: 48px;
                }
            }

            /* Dark theme support */
            .dark-theme .social-share-menu {
                background: #2d2d2d;
                color: white;
            }

            .dark-theme .social-share-btn {
                color: white;
            }

            .dark-theme .social-share-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Create floating share button (alternative to header placement)
    createFloatingButton() {
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-share-container social-share-container';
        floatingContainer.innerHTML = `
            <button class="social-share-toggle" aria-label="Share" data-i18n-title="share.title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
            </button>
        `;

        document.body.appendChild(floatingContainer);
        this.shareButtons = floatingContainer;
        this.attachEventListeners();
    }

    // Update share content dynamically
    updateShareContent(title, text, url) {
        this.shareTitle = title || this.shareTitle;
        this.shareText = text || this.shareText;
        this.currentUrl = url || window.location.href;
    }

    // Public methods
    showShareMenu() {
        const shareMenu = document.querySelector('.social-share-menu');
        if (shareMenu) {
            shareMenu.classList.add('active');
        }
    }

    hideShareMenu() {
        const shareMenu = document.querySelector('.social-share-menu');
        if (shareMenu) {
            shareMenu.classList.remove('active');
        }
    }

    // Make component globally accessible
    show() {
        if (!this.shareButtons) {
            this.createShareButtons();
        }
    }

    reset() {
        // Remove existing share buttons
        if (this.shareButtons && this.shareButtons.parentNode) {
            this.shareButtons.parentNode.removeChild(this.shareButtons);
        }
        this.shareButtons = null;
        this.init();
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
