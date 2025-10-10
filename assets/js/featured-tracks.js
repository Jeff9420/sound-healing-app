// ========== 精选音频快速播放模块 ==========
class FeaturedTracks {
    constructor() {
        this.featuredButtons = null;
        this.currentPlaying = null;
        this.featuredTracks = [
            {
                category: 'meditation',
                track: '冥想放松 瑜伽舒缓音乐',
                displayName: '深度冥想',
                mood: '😌'
            },
            {
                category: 'Rain',
                track: '身临情景的雨声',
                displayName: '雨声入眠',
                mood: '🌧️'
            },
            {
                category: 'Singing bowl sound',
                track: '01-Healing Bowls - Instrumental - Jane Winther',
                displayName: '颂钵疗愈',
                mood: '🥁'
            }
        ];
        this.init();
    }

    init() {
    // 获取所有精选音频按钮
        this.featuredButtons = document.querySelectorAll('.featured-track-btn');

        // 绑定点击事件
        this.bindEvents();

        // 监听音频播放状态
        this.listenToAudioEvents();

        // 监听语言变化
        document.addEventListener('languageChanged', () => {
            this.updateText();
        });
    }

    bindEvents() {
        this.featuredButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                const track = e.currentTarget.dataset.track;
                this.playFeaturedTrack(category, track, e.currentTarget);
            });
        });
    }

    listenToAudioEvents() {
    // 监听音频播放状态变化
        document.addEventListener('audioTrackChanged', (e) => {
            const { track, category } = e.detail;
            this.updatePlayingState(track, category);
        });

        // 监听播放/暂停状态
        document.addEventListener('audioPlaybackStateChanged', (e) => {
            const { isPlaying } = e.detail;
            if (!isPlaying) {
                this.clearAllPlayingStates();
            }
        });

        // 监听分类变化
        document.addEventListener('categoryChanged', (e) => {
            const { category } = e.detail;
            this.updateButtonStates(category);
        });
    }

    async playFeaturedTrack(category, trackName, buttonElement) {
        try {
            // 显示加载状态
            buttonElement.classList.add('loading');

            // 确保主应用已加载
            if (window.app && window.app.selectCategory) {
                // 选择分类
                await window.app.selectCategory(category);

                // 等待分类加载完成
                await this.waitForPlaylist();

                // 查找并播放指定曲目
                const trackIndex = this.findTrackIndex(trackName);
                if (trackIndex !== -1) {
                    // 播放曲目
                    if (window.app.playTrack) {
                        window.app.playTrack(trackIndex);

                        // 更新UI状态
                        this.setPlayingState(buttonElement);

                        // 显示播放提示
                        this.showPlayToast(trackName);
                    }
                } else {
                    console.warn('Track not found:', trackName);
                    this.showErrorToast('音频文件未找到');
                }
            } else {
                console.error('Main app not available');
                this.showErrorToast('应用未完全加载');
            }
        } catch (error) {
            console.error('Error playing featured track:', error);
            this.showErrorToast('播放失败，请重试');
        } finally {
            // 移除加载状态
            buttonElement.classList.remove('loading');
        }
    }

    waitForPlaylist() {
        return new Promise((resolve) => {
            const checkPlaylist = () => {
                if (window.currentPlaylist && window.currentPlaylist.length > 0) {
                    resolve();
                } else {
                    setTimeout(checkPlaylist, 100);
                }
            };
            checkPlaylist();
        });
    }

    findTrackIndex(trackName) {
        if (!window.currentPlaylist) {
            return -1;
        }

        // 模糊匹配查找
        const targetName = trackName.toLowerCase();
        for (let i = 0; i < window.currentPlaylist.length; i++) {
            const currentTrack = window.currentPlaylist[i].toLowerCase();
            if (currentTrack.includes(targetName.split(' ')[0]) ||
          targetName.includes(currentTrack.split(' ')[0])) {
                return i;
            }
        }

        // 如果找不到精确匹配，返回第一个
        return 0;
    }

    setPlayingState(buttonElement) {
    // 清除所有播放状态
        this.clearAllPlayingStates();

        // 设置当前播放状态
        buttonElement.classList.add('playing');
        this.currentPlaying = buttonElement;
    }

    clearAllPlayingStates() {
        this.featuredButtons.forEach(btn => {
            btn.classList.remove('playing');
        });
        this.currentPlaying = null;
    }

    updatePlayingState(track, category) {
        if (!this.currentPlaying) {
            return;
        }

        const btnCategory = this.currentPlaying.dataset.category;
        const btnTrack = this.currentPlaying.dataset.track;

        // 检查是否是当前播放的精选音频
        if (btnCategory === category ||
        btnTrack.toLowerCase().includes(track.toLowerCase()) ||
        track.toLowerCase().includes(btnTrack.toLowerCase())) {
            this.setPlayingState(this.currentPlaying);
        } else {
            this.clearAllPlayingStates();
        }
    }

    updateButtonStates(currentCategory) {
    // 根据当前分类更新按钮状态
        this.featuredButtons.forEach(btn => {
            const btnCategory = btn.dataset.category;
            if (btnCategory === currentCategory) {
                btn.style.borderColor = 'rgba(232,184,109,0.6)';
            } else {
                btn.style.borderColor = 'rgba(255,215,160,0.2)';
            }
        });
    }

    showPlayToast(trackName) {
    // 移除已存在的toast
        const existingToast = document.querySelector('.featured-play-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'featured-play-toast';
        toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">🎵</span>
        <span class="toast-text">正在播放：${this.getDisplayName(trackName)}</span>
      </div>
    `;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => toast.classList.add('show'), 10);

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

    showErrorToast(message) {
    // 移除已存在的toast
        const existingToast = document.querySelector('.featured-error-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'featured-error-toast';
        toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-text">${message}</span>
      </div>
    `;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => toast.classList.add('show'), 10);

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

    getDisplayName(trackName) {
        const featured = this.featuredTracks.find(f => f.track === trackName);
        return featured ? featured.displayName : trackName;
    }

    updateText() {
    // 根据语言更新文本
        const isEnglish = document.documentElement.lang === 'en';

        // 更新标题
        const titleEl = document.querySelector('.featured-title');
        if (titleEl) {
            titleEl.textContent = isEnglish ? 'Featured' : '精选推荐';
        }

        // 更新副标题
        const subtitleEl = document.querySelector('.featured-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = isEnglish ?
                'One-click play, quickly enter healing state' :
                '一键播放，快速进入疗愈状态';
        }
    }

    // 公共方法：刷新精选音频列表
    refresh() {
    // 可以在这里添加动态加载精选音频的逻辑
        console.log('Featured tracks refreshed');
    }

    // 公共方法：获取精选音频列表
    getFeaturedTracks() {
        return this.featuredTracks;
    }
}

// 添加Toast样式
const style = document.createElement('style');
style.textContent = `
.featured-play-toast,
.featured-error-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: rgba(45,35,65,.95);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid rgba(232,184,109,0.4);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 10001;
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.featured-play-toast.show,
.featured-error-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.featured-error-toast {
  border-color: rgba(255,102,102,0.4);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-icon {
  font-size: 16px;
}

.toast-text {
  font-weight: 500;
}
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.featuredTracks = new FeaturedTracks();

    // 触发精选音频模块加载完成事件
    document.dispatchEvent(new CustomEvent('featuredTracksLoaded'));
});

// 导出到全局作用域
window.FeaturedTracks = FeaturedTracks;