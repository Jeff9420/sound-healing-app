// 防止重复声明
if (typeof PlaylistUI === 'undefined') {

class PlaylistUI {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentCategory = null;
        this.currentTrackId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderCategories();
    }

    initializeElements() {
        // 主要元素
        this.categoriesContainer = document.getElementById('categoriesContainer');
        this.playlistSection = document.getElementById('playlistSection');
        this.backToCategories = document.getElementById('backToCategories');
        this.playlistTitle = document.getElementById('playlistTitle');
        this.trackList = document.getElementById('trackList');
        
        // 播放控制元素
        this.currentTrackName = document.getElementById('currentTrackName');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.currentTrackVolume = document.getElementById('currentTrackVolume');
        this.currentVolumeDisplay = document.getElementById('currentVolumeDisplay');
        
        // 进度条元素
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
    }

    bindEvents() {
        // 返回分类按钮
        this.backToCategories?.addEventListener('click', () => {
            this.showCategories();
        });

        // 播放控制按钮
        this.playPauseBtn?.addEventListener('click', () => {
            this.toggleCurrentTrack();
        });

        this.prevBtn?.addEventListener('click', () => {
            this.audioManager.previousTrack();
        });

        this.nextBtn?.addEventListener('click', () => {
            this.audioManager.nextTrack();
        });

        this.shuffleBtn?.addEventListener('click', () => {
            this.toggleShuffle();
        });

        this.repeatBtn?.addEventListener('click', () => {
            this.toggleRepeat();
        });

        // 音量控制
        this.currentTrackVolume?.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.currentVolumeDisplay.textContent = Math.round(volume * 100) + '%';
            
            if (this.currentTrackId) {
                this.audioManager.setTrackVolume(this.currentTrackId, volume);
            }
        });

        // 进度条控制
        this.progressBar?.addEventListener('input', (e) => {
            const position = parseFloat(e.target.value);
            this.audioManager.seekTo(position);
        });

        this.progressBar?.addEventListener('change', (e) => {
            const position = parseFloat(e.target.value);
            this.audioManager.seekTo(position);
        });

        // 监听音频管理器事件
        this.audioManager.eventBus.addEventListener('trackPlay', (e) => {
            this.onTrackPlay(e.detail);
        });

        this.audioManager.eventBus.addEventListener('trackPause', (e) => {
            this.onTrackPause(e.detail);
        });

        this.audioManager.eventBus.addEventListener('trackEnded', (e) => {
            this.onTrackEnded(e.detail);
        });

        this.audioManager.eventBus.addEventListener('progressUpdate', (e) => {
            this.onProgressUpdate(e.detail);
        });
    }

    renderCategories() {
        if (!this.categoriesContainer) return;

        const categories = this.audioManager.getCategories();
        this.categoriesContainer.innerHTML = '';

        Object.entries(categories).forEach(([categoryKey, category]) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <h3 class="category-name">${category.name}</h3>
                </div>
                <p class="category-description">${category.description}</p>
                <div class="category-info">
                    <span class="track-count">${category.files.length} 首音频</span>
                    <button class="play-category-btn" data-category="${categoryKey}">播放全部</button>
                </div>
            `;

            // 添加点击事件
            categoryCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('play-category-btn')) {
                    this.showPlaylist(categoryKey, category);
                }
            });

            // 播放全部按钮事件
            const playBtn = categoryCard.querySelector('.play-category-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playCategory(categoryKey);
            });

            this.categoriesContainer.appendChild(categoryCard);
        });
    }

    showPlaylist(categoryKey, category) {
        this.currentCategory = categoryKey;
        
        // 隐藏分类，显示播放列表
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) categoriesSection.style.display = 'none';
        if (this.playlistSection) this.playlistSection.style.display = 'block';

        // 设置标题
        if (this.playlistTitle) {
            this.playlistTitle.textContent = `${category.name} (${category.files.length}首)`;
        }

        // 渲染播放列表
        this.renderTrackList(categoryKey, category.files);
    }

    showCategories() {
        // 显示分类，隐藏播放列表
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) categoriesSection.style.display = 'block';
        if (this.playlistSection) this.playlistSection.style.display = 'none';

        this.currentCategory = null;
    }

    renderTrackList(categoryKey, files) {
        if (!this.trackList) return;

        this.trackList.innerHTML = '';

        files.forEach((fileName, index) => {
            const trackId = this.audioManager.generateTrackId(categoryKey, fileName);
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.setAttribute('data-track-id', trackId);
            
            // 检查文件格式支持
            const fileExtension = fileName.split('.').pop().toLowerCase();
            const isSupported = this.audioManager.supportedFormats[fileExtension];
            const formatWarning = !isSupported ? ` <span class="format-warning" title="此浏览器不支持${fileExtension.toUpperCase()}格式">⚠️</span>` : '';
            
            // 简化文件名显示
            const displayName = this.formatTrackName(fileName);
            
            trackItem.innerHTML = `
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <div class="track-name">${displayName}${formatWarning}</div>
                    <div class="track-file">${fileName}</div>
                </div>
                <div class="track-controls">
                    <button class="track-play-btn" data-track-id="${trackId}" data-category="${categoryKey}" data-file="${fileName}" 
                            ${!isSupported ? 'disabled title="格式不支持"' : ''}>
                        <span class="play-icon">${!isSupported ? '⚠️' : '▶️'}</span>
                    </button>
                    <div class="track-volume">
                        <input type="range" class="track-volume-slider" min="0" max="1" step="0.01" value="0.5" 
                               data-track-id="${trackId}" ${!isSupported ? 'disabled' : ''}>
                    </div>
                </div>
            `;

            // 如果格式不支持，添加视觉提示
            if (!isSupported) {
                trackItem.classList.add('unsupported-format');
            }

            // 播放按钮事件
            const playBtn = trackItem.querySelector('.track-play-btn');
            playBtn.addEventListener('click', () => {
                if (isSupported) {
                    this.playTrack(trackId, categoryKey, fileName);
                } else {
                    this.showError(`此浏览器不支持 ${fileExtension.toUpperCase()} 格式，无法播放 ${fileName}`);
                }
            });

            // 音量滑块事件
            const volumeSlider = trackItem.querySelector('.track-volume-slider');
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                this.audioManager.setTrackVolume(trackId, volume);
            });

            this.trackList.appendChild(trackItem);
        });
    }

    formatTrackName(fileName) {
        // 移除文件扩展名
        let name = fileName.replace(/\.(mp3|wma|wav|flac)$/i, '');
        
        // 移除数字前缀
        name = name.replace(/^\d+\./, '');
        
        // 移除一些常见的前缀
        name = name.replace(/^(催眠音乐|催眠专用|放松轻音乐)/, '');
        
        // 截断过长的名称
        if (name.length > 40) {
            name = name.substring(0, 37) + '...';
        }
        
        return name.trim() || fileName;
    }

    async playTrack(trackId, categoryKey, fileName) {
        try {
            // 如果当前在播放列表页面，启用播放列表模式以支持自动下一首
            if (this.currentCategory === categoryKey) {
                const category = this.audioManager.getCategories()[categoryKey];
                if (category) {
                    const startIndex = category.files.findIndex(file => 
                        this.audioManager.generateTrackId(categoryKey, file) === trackId
                    );
                    if (startIndex >= 0) {
                        await this.audioManager.playPlaylist(categoryKey, startIndex);
                        this.currentTrackId = trackId;
                        return;
                    }
                }
            }
            
            // 常规单曲播放（保持原有逻辑）
            await this.audioManager.playTrack(trackId, categoryKey, fileName);
            this.currentTrackId = trackId;
        } catch (error) {
            console.error('播放失败:', error);
            this.showError('播放失败: ' + error.message);
        }
    }

    async playCategory(categoryKey) {
        try {
            await this.audioManager.playPlaylist(categoryKey);
        } catch (error) {
            console.error('播放失败:', error);
            this.showError('播放失败: ' + error.message);
        }
    }

    async toggleCurrentTrack() {
        if (!this.currentTrackId) return;

        const instance = this.audioManager.getTrackInstance(this.currentTrackId);
        if (!instance) return;

        try {
            await this.audioManager.toggleTrack(
                this.currentTrackId, 
                instance.categoryName, 
                instance.fileName
            );
        } catch (error) {
            console.error('切换播放状态失败:', error);
        }
    }

    toggleShuffle() {
        const enabled = !this.audioManager.shuffleMode;
        this.audioManager.setShuffleMode(enabled);
        
        if (this.shuffleBtn) {
            this.shuffleBtn.classList.toggle('active', enabled);
        }
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.audioManager.repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        
        this.audioManager.setRepeatMode(nextMode);
        
        if (this.repeatBtn) {
            this.repeatBtn.classList.remove('repeat-none', 'repeat-one', 'repeat-all');
            this.repeatBtn.classList.add(`repeat-${nextMode}`);
            
            // 更新按钮文本
            const icons = { 'none': '🔁', 'one': '🔂', 'all': '🔁' };
            this.repeatBtn.textContent = icons[nextMode];
        }
    }

    onTrackPlay(detail) {
        if (typeof detail === 'string') {
            // 简单字符串格式
            this.currentTrackId = detail;
        } else {
            // 对象格式
            this.currentTrackId = detail.trackId;
            
            if (this.currentTrackName && detail.fileName) {
                this.currentTrackName.textContent = this.formatTrackName(detail.fileName);
            }
        }

        // 更新播放按钮状态
        this.updatePlayButton(true);
        this.updateTrackItemStates();
    }

    onTrackPause(detail) {
        // 更新播放按钮状态
        this.updatePlayButton(false);
        this.updateTrackItemStates();
    }

    onTrackEnded(detail) {
        // 更新播放按钮状态
        this.updatePlayButton(false);
        this.updateTrackItemStates();
    }

    onProgressUpdate(detail) {
        const { currentTime, duration, progress } = detail;
        
        // 更新进度条
        if (this.progressBar) {
            this.progressBar.value = progress;
        }
        
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        
        // 更新时间显示
        if (this.currentTime) {
            this.currentTime.textContent = this.formatTime(currentTime);
        }
        
        if (this.totalTime) {
            this.totalTime.textContent = this.formatTime(duration);
        }
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || isNaN(seconds)) {
            return '00:00';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updatePlayButton(isPlaying) {
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
        }
    }

    updateTrackItemStates() {
        const trackItems = this.trackList?.querySelectorAll('.track-item');
        if (!trackItems) return;

        trackItems.forEach(item => {
            const trackId = item.getAttribute('data-track-id');
            const playBtn = item.querySelector('.track-play-btn .play-icon');
            
            if (trackId === this.currentTrackId) {
                const instance = this.audioManager.getTrackInstance(trackId);
                const isPlaying = instance && instance.isPlaying;
                
                item.classList.toggle('playing', isPlaying);
                if (playBtn) {
                    playBtn.textContent = isPlaying ? '⏸️' : '▶️';
                }
            } else {
                item.classList.remove('playing');
                if (playBtn) {
                    playBtn.textContent = '▶️';
                }
            }
        });
    }

    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        // 3秒后移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

} // 结束 PlaylistUI 类定义检查