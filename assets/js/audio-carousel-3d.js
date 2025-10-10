// 3D音频房间轮播管理器 - 基于carrossel-3d.html的六边形轮播
class AudioRoomCarousel3D {
    constructor() {
        this.currentAngle = 0;
        this.currentIndex = 0;
        this.totalRooms = 6; // 6个房间（六边形）
        this.autoRotateActive = false;
        this.autoRotateInterval = null;
        this.currentPlayingAudio = null;

        this.carousel = null;
        this.indicators = [];

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.carousel = document.getElementById('carrossel');
        this.indicatorsContainer = document.getElementById('indicadores');

        if (!this.carousel) {
            console.error('3D轮播容器未找到');
            return;
        }
    }

    bindEvents() {
        // 控制按钮事件
        this.prevBtn?.addEventListener('click', () => this.previousCategory());
        this.nextBtn?.addEventListener('click', () => this.nextCategory());
        this.autoBtn?.addEventListener('click', () => this.toggleAutoRotate());

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousCategory();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextCategory();
            } else if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoRotate();
            } else if (e.key === 'Escape') {
                this.stopAutoRotate();
            }
        });

        // 鼠标拖拽支持
        this.setupMouseDragControls();

        // 触摸支持
        this.setupTouchControls();
    }

    setupRotationVariables() {
        // 为每个卡片设置CSS自定义属性，用于悬停效果
        this.updateRotationVariables();
    }

    updateRotationVariables() {
        const cards = this.carouselInner?.querySelectorAll('.ecosystem-card');
        if (!cards) {
            return;
        }

        cards.forEach((card, index) => {
            const rotation = index * 40; // 9边形，每个间隔40度
            card.style.setProperty('--rotation', `${rotation}deg`);
        });
    }

    // 创建轮播卡片 - 兼容现有音频配置
    createCarouselCards() {
        if (!this.carouselInner || typeof AUDIO_CONFIG === 'undefined') {
            console.warn('轮播容器或音频配置未就绪');
            return;
        }

        // 清空容器
        this.carouselInner.innerHTML = '';

        // 定义生态系统映射（保持与原应用一致）
        const ecosystemData = {
            'Animal sounds': {
                icon: '🦅',
                name: '森林栖息地',
                type: '鸟类与动物声',
                description: '深入森林栖息地，感受自然的治愈力量'
            },
            'Chakra': {
                icon: '🌈',
                name: '能量场域',
                type: '脉轮音疗',
                description: '深入能量场域，感受自然的治愈力量'
            },
            'Fire': {
                icon: '🔥',
                name: '温暖壁炉',
                type: '火焰与温暖',
                description: '深入温暖壁炉，感受自然的治愈力量'
            },
            'hypnosis': {
                icon: '🌙',
                name: '梦境花园',
                type: '催眠引导',
                description: '深入梦境花园，感受自然的治愈力量'
            },
            'meditation': {
                icon: '🧘‍♀️',
                name: '禅境山谷',
                type: '冥想音乐',
                description: '深入禅境山谷，感受自然的治愈力量'
            },
            'Rain': {
                icon: '☔',
                name: '雨林圣地',
                type: '雨声净化',
                description: '深入雨林圣地，感受自然的治愈力量'
            },
            'running water': {
                icon: '💧',
                name: '溪流秘境',
                type: '流水音律',
                description: '深入溪流秘境，感受自然的治愈力量'
            },
            'Singing bowl sound': {
                icon: '🎵',
                name: '颂钵圣殿',
                type: '音疗颂钵',
                description: '深入颂钵圣殿，感受自然的治愈力量'
            },
            'Subconscious Therapy': {
                icon: '🌌',
                name: '潜识星域',
                type: '潜意识疗愈',
                description: '深入潜识星域，感受自然的治愈力量'
            }
        };

        // 创建卡片
        Object.entries(ecosystemData).forEach(([categoryKey, data], index) => {
            if (!AUDIO_CONFIG.categories[categoryKey]) {
                return;
            }

            const count = AUDIO_CONFIG.categories[categoryKey].files?.length || 0;

            const card = document.createElement('div');
            card.className = 'ecosystem-card';
            card.dataset.category = categoryKey;
            card.dataset.index = index;

            card.innerHTML = `
                <span class="species-count">${count}种</span>
                <div class="ecosystem-header">
                    <span class="ecosystem-icon" role="img" aria-label="${data.type}">${data.icon}</span>
                    <div class="ecosystem-info">
                        <h3 class="ecosystem-name">${data.name}</h3>
                        <p class="habitat-type">${data.type}</p>
                    </div>
                </div>
                <p class="ecosystem-desc">${data.description}</p>
            `;

            // 添加无障碍属性
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `打开${data.name}音频播放列表，包含${count}个音频文件`);

            // 绑定点击事件（保持原有功能）
            const handleActivation = (event) => {
                event.preventDefault();
                event.stopPropagation();

                // 视觉反馈
                card.style.transform = `rotateY(${index * 40}deg) translateZ(380px) scale(0.95)`;
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);

                // 调用原有的播放列表打开功能
                if (typeof forceOpenPlaylist === 'function') {
                    forceOpenPlaylist(categoryKey, data.name);
                } else {
                    console.warn('播放列表功能未找到，尝试备用方法');
                    this.openPlaylistFallback(categoryKey, data.name);
                }
            };

            card.addEventListener('click', handleActivation);

            // 键盘导航支持
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    handleActivation(event);
                }
            });

            this.carouselInner.appendChild(card);
        });

        // 更新旋转变量
        this.updateRotationVariables();

        // 创建指示器
        this.createIndicators();

        console.log('✅ 3D轮播卡片创建完成');
    }

    // 备用播放列表打开方法
    openPlaylistFallback(categoryKey, ecosystemName) {
        const playlistSection = document.getElementById('playlistSection');
        const mainContainer = document.querySelector('main.forest-path');

        if (playlistSection && mainContainer) {
            // 隐藏主容器，显示播放列表
            mainContainer.style.display = 'none';
            playlistSection.style.display = 'block';

            // 设置标题
            const titleElement = document.getElementById('playlistTitle');
            if (titleElement) {
                titleElement.textContent = ecosystemName;
            }

            console.log(`打开播放列表: ${ecosystemName}`);
        }
    }

    // 创建指示器
    createIndicators() {
        if (!this.indicatorsContainer) {
            return;
        }

        this.indicatorsContainer.innerHTML = '';
        this.indicators = [];

        for (let i = 0; i < this.totalCategories; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            indicator.dataset.index = i;

            if (i === this.currentIndex) {
                indicator.classList.add('active');
            }

            indicator.addEventListener('click', () => this.goToCategory(i));

            this.indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }

    // 轮播控制方法
    nextCategory() {
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex + 1) % this.totalCategories;
        this.currentAngle -= 40; // 每次旋转40度
        this.updateCarousel();
        this.updateIndicators();
    }

    previousCategory() {
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex - 1 + this.totalCategories) % this.totalCategories;
        this.currentAngle += 40;
        this.updateCarousel();
        this.updateIndicators();
    }

    goToCategory(index) {
        this.stopAutoRotate();
        const difference = index - this.currentIndex;
        this.currentAngle -= difference * 40;
        this.currentIndex = index;
        this.updateCarousel();
        this.updateIndicators();
    }

    updateCarousel() {
        if (this.carouselInner) {
            this.carouselInner.style.transform = `rotateY(${this.currentAngle}deg)`;
        }
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    // 自动旋转功能
    toggleAutoRotate() {
        if (this.autoRotateActive) {
            this.stopAutoRotate();
        } else {
            this.startAutoRotate();
        }
    }

    startAutoRotate() {
        this.autoRotateActive = true;
        this.autoBtn?.classList.add('active');

        // 使用CSS动画进行平滑自动旋转
        if (this.carouselInner) {
            this.carouselInner.classList.add('auto-rotate');
        }

        // 定期更新当前索引（用于指示器）
        this.autoRotateInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.totalCategories;
            this.updateIndicators();
        }, 2000); // 每2秒更新一次指示器
    }

    stopAutoRotate() {
        this.autoRotateActive = false;
        this.autoBtn?.classList.remove('active');

        if (this.carouselInner) {
            this.carouselInner.classList.remove('auto-rotate');
        }

        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    // 鼠标拖拽控制
    setupMouseDragControls() {
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let lastAngle = this.currentAngle;

        const handleMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            lastAngle = this.currentAngle;
            this.stopAutoRotate();
            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) {
                return;
            }

            currentX = e.clientX;
            const deltaX = currentX - startX;
            const deltaAngle = deltaX * 0.3; // 调整敏感度

            this.currentAngle = lastAngle + deltaAngle;
            this.updateCarousel();
        };

        const handleMouseUp = () => {
            if (!isDragging) {
                return;
            }

            isDragging = false;
            const deltaX = currentX - startX;
            const threshold = 50;

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.previousCategory();
                } else {
                    this.nextCategory();
                }
            } else {
                // 回到最近的位置
                this.currentAngle = lastAngle;
                this.updateCarousel();
            }
        };

        this.carousel?.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // 触摸控制
    setupTouchControls() {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.stopAutoRotate();
        };

        const handleTouchEnd = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const deltaX = touchEndX - touchStartX;

            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousCategory();
                } else {
                    this.nextCategory();
                }
            }
        };

        this.carousel?.addEventListener('touchstart', handleTouchStart);
        this.carousel?.addEventListener('touchend', handleTouchEnd);
    }

    // 销毁方法
    destroy() {
        this.stopAutoRotate();

        // 移除事件监听器
        this.prevBtn?.removeEventListener('click', this.previousCategory);
        this.nextBtn?.removeEventListener('click', this.nextCategory);
        this.autoBtn?.removeEventListener('click', this.toggleAutoRotate);
    }
}

// 全局轮播实例
window.audioCarousel3D = null;

// 初始化3D轮播的函数
function initializeAudioCarousel3D() {
    if (typeof AUDIO_CONFIG === 'undefined') {
        console.warn('音频配置未加载，延迟初始化3D轮播');
        setTimeout(initializeAudioCarousel3D, 500);
        return;
    }

    try {
        window.audioCarousel3D = new AudioCarousel3D();
        window.audioCarousel3D.createCarouselCards();
        console.log('✅ 3D音频轮播初始化完成');
    } catch (error) {
        console.error('3D轮播初始化失败:', error);
    }
}

// 替换原有的卡片创建函数
function forceCreateEcosystemCards3D() {
    if (window.audioCarousel3D) {
        window.audioCarousel3D.createCarouselCards();
    } else {
        initializeAudioCarousel3D();
    }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeAudioCarousel3D, 1000);
    });
} else {
    setTimeout(initializeAudioCarousel3D, 1000);
}

// 导出到全局作用域供其他脚本使用
window.AudioCarousel3D = AudioCarousel3D;
window.initializeAudioCarousel3D = initializeAudioCarousel3D;
window.forceCreateEcosystemCards3D = forceCreateEcosystemCards3D;