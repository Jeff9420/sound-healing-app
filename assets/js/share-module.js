// ========== 分享功能模块 ==========
class ShareModule {
    constructor() {
        this.shareModal = null;
        this.shareBtn = null;
        this.shareModalClose = null;
        this.currentTrack = null;
        this.currentCategory = null;
        this.init();
    }

    init() {
    // 获取DOM元素
        this.shareModal = document.getElementById('shareModal');
        this.shareBtn = document.getElementById('shareBtn');
        this.shareModalClose = document.getElementById('shareModalClose');

        // 绑定事件
        this.bindEvents();

        // 监听音频播放状态
        this.listenToAudioEvents();
    }

    bindEvents() {
    // 分享按钮点击事件
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.openShareModal());
        }

        // 关闭分享弹窗
        if (this.shareModalClose) {
            this.shareModalClose.addEventListener('click', () => this.closeShareModal());
        }

        // 点击弹窗外部关闭
        if (this.shareModal) {
            this.shareModal.addEventListener('click', (e) => {
                if (e.target === this.shareModal) {
                    this.closeShareModal();
                }
            });
        }

        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.shareModal.style.display !== 'none') {
                this.closeShareModal();
            }
        });

        // 分享平台按钮事件
        this.bindSharePlatformEvents();
    }

    bindSharePlatformEvents() {
        const shareButtons = document.querySelectorAll('.share-link-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                this.handleShare(platform);
            });
        });
    }

    listenToAudioEvents() {
    // 监听音频播放状态变化
        document.addEventListener('audioTrackChanged', (e) => {
            this.currentTrack = e.detail.track;
            this.currentCategory = e.detail.category;
            this.updateSharePreview();
        });

        // 监听语言变化
        document.addEventListener('languageChanged', () => {
            this.updateShareText();
        });
    }

    openShareModal() {
        if (this.shareModal) {
            this.shareModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // 更新分享预览
            this.updateSharePreview();

            // 聚焦管理
            this.shareModal.focus();

            // 触发动画
            setTimeout(() => {
                this.shareModal.classList.add('show');
            }, 10);
        }
    }

    closeShareModal() {
        if (this.shareModal) {
            this.shareModal.classList.remove('show');
            document.body.style.overflow = '';

            setTimeout(() => {
                this.shareModal.style.display = 'none';
            }, 300);
        }
    }

    updateSharePreview() {
        const titleEl = document.getElementById('sharePreviewTitle');
        const descEl = document.getElementById('sharePreviewDesc');

        if (titleEl && descEl) {
            if (this.currentTrack) {
                titleEl.textContent = `${this.currentTrack} - 声音疗愈空间`;
                descEl.textContent = `正在聆听：${this.currentCategory || '疗愈音乐'}`;
            } else {
                titleEl.textContent = '声音疗愈空间';
                descEl.textContent = '让心灵回归宁静';
            }
        }
    }

    updateShareText() {
    // 根据当前语言更新分享文本
        const isEnglish = document.documentElement.lang === 'en';

        const shareTitle = document.getElementById('shareTitle');
        if (shareTitle) {
            shareTitle.textContent = isEnglish ? 'Share Sound Healing' : '分享声音疗愈';
        }

        const shareTip = document.querySelector('.share-tip span');
        if (shareTip) {
            shareTip.textContent = isEnglish ?
                'Share with friends and enjoy the power of sound healing together' :
                '分享给朋友，一起享受声音疗愈的力量';
        }
    }

    handleShare(platform) {
        const url = 'https://soundflows.app';
        const title = this.currentTrack ?
            `${this.currentTrack} - 声音疗愈空间` :
            '声音疗愈空间 - 让心灵回归宁静';
        const desc = this.currentCategory ?
            `正在聆听：${this.currentCategory} | 213+疗愈音频免费在线播放` :
            '专业音频疗愈平台，包含213+疗愈音频，帮助您放松、冥想、找到内心平静';

        switch (platform) {
        case 'wechat':
            this.shareToWechat(url, title);
            break;
        case 'weibo':
            this.shareToWeibo(url, title, desc);
            break;
        case 'qq':
            this.shareToQQ(url, title, desc);
            break;
        case 'douyin':
            this.shareToDouyin(url, title);
            break;
        case 'xiaohongshu':
            this.shareToXiaohongshu(url, title, desc);
            break;
        case 'link':
            this.copyLink(url);
            break;
        default:
            console.warn('Unsupported share platform:', platform);
        }
    }

    shareToWechat(url, title) {
    // 显示二维码
        this.showQRCode(url, title);
    }

    shareToWeibo(url, title, desc) {
        const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title + ' - ' + desc)}`;
        this.openWindow(shareUrl, 600, 500);
    }

    shareToQQ(url, title, desc) {
        const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(desc)}`;
        this.openWindow(shareUrl, 600, 500);
    }

    shareToDouyin(url, title) {
    // 抖音分享需要通过移动端APP
        this.showToast('请在抖音APP中分享此链接');
        this.copyLink(url);
    }

    shareToXiaohongshu(url, title, desc) {
    // 小红书分享
        this.showToast('请在小红书APP中分享此链接');
        this.copyLink(url);
    }

    copyLink(url) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('链接已复制到剪贴板');
            }).catch(() => {
                this.fallbackCopyLink(url);
            });
        } else {
            this.fallbackCopyLink(url);
        }
    }

    fallbackCopyLink(url) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showToast('链接已复制到剪贴板');
        } catch (err) {
            this.showToast('复制失败，请手动复制链接');
        }

        document.body.removeChild(textArea);
    }

    showQRCode(url, title) {
    // 创建二维码容器
        const qrContainer = document.createElement('div');
        qrContainer.className = 'share-qrcode';
        qrContainer.innerHTML = `
      <button class="close-qrcode">×</button>
      <div style="text-align: center; margin-bottom: 10px; color: #333; font-size: 14px;">
        ${title}
      </div>
      <div id="qrcode"></div>
    `;

        document.body.appendChild(qrContainer);

        // 关闭按钮事件
        const closeBtn = qrContainer.querySelector('.close-qrcode');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(qrContainer);
        });

        // 生成二维码
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById('qrcode'), {
                text: url,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // 如果没有QRCode库，显示提示
            document.getElementById('qrcode').innerHTML = `
        <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border: 1px solid #ddd;">
          <div style="text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
            <div style="font-size: 12px;">请使用微信扫一扫</div>
          </div>
        </div>
      `;
        }
    }

    openWindow(url, width, height) {
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    }

    showToast(message) {
    // 移除已存在的toast
        const existingToast = document.querySelector('.share-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 页面加载完成后初始化分享模块
document.addEventListener('DOMContentLoaded', () => {
    window.shareModule = new ShareModule();
});

// 导出到全局作用域
window.ShareModule = ShareModule;