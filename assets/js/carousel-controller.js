/**
 * 3D轮播图控制器
 * 集成到声音疗愈应用中的3D旋转轮播组件
 */
class CarouselController {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentIndex = 0;
        this.autoRotateSpeed = 2000; // 自动旋转间隔时间（毫秒）
        this.autoRotateTimer = null;
        this.isAutoRotating = true;
        this.categories = [];
        this.rotationY = 0;
        this.isInteracting = false;

        this.setupEventListeners();
        this.initializeCarousel();
    }

    /**
     * 初始化轮播图
     */
    initializeCarousel() {
        if (!this.audioManager || !this.audioManager.categories) {
            console.warn('AudioManager数据尚未加载，延迟初始化轮播图');
            setTimeout(() => this.initializeCarousel(), 500);
            return;
        }

        this.loadCategories();
        this.createCarouselHTML();
        this.updateCarouselDisplay();
        this.startAutoRotation();

        console.log('✅ 3D轮播图初始化完成');
    }

    /**
     * 从AudioManager加载分类数据
     */
    loadCategories() {
        const audioCategories = this.audioManager.categories || {};
        this.categories = Object.keys(audioCategories).map(key => ({
            key: key,
            name: audioCategories[key].name || key,
            icon: this.getCategoryIcon(key),
            count: audioCategories[key].tracks?.length || 0,
            gradient: this.getCategoryGradient(key)
        }));

        console.log('轮播图分类数据加载:', this.categories.length + ' 个分类');
    }

    /**
     * 获取分类图标
     */
    getCategoryIcon(categoryKey) {
        const iconMap = {
            'animal-sounds': '🦅',
            'chakra': '🧘‍♀️',
            'fire-sounds': '🔥',
            'hypnosis': '🌙',
            'meditation': '🕉️',
            'rain-sounds': '🌧️',
            'running-water': '💧',
            'singing-bowls': '🎵',
            'subconscious-therapy': '✨'
        };
        return iconMap[categoryKey] || '🎶';
    }

    /**
     * 获取分类渐变色
     */
    getCategoryGradient(categoryKey) {
        const gradientMap = {
            'animal-sounds': 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            'chakra': 'linear-gradient(135deg, #9C27B0, #6A1B9A)',
            'fire-sounds': 'linear-gradient(135deg, #FF5722, #D84315)',
            'hypnosis': 'linear-gradient(135deg, #673AB7, #4527A0)',
            'meditation': 'linear-gradient(135deg, #00BCD4, #0097A7)',
            'rain-sounds': 'linear-gradient(135deg, #2196F3, #1565C0)',
            'running-water': 'linear-gradient(135deg, #03A9F4, #0277BD)',
            'singing-bowls': 'linear-gradient(135deg, #FF9800, #F57C00)',
            'subconscious-therapy': 'linear-gradient(135deg, #E91E63, #C2185B)'
        };
        return gradientMap[categoryKey] || 'linear-gradient(135deg, #607D8B, #455A64)';
    }

    /**
     * 创建轮播图HTML结构
     */
    createCarouselHTML() {
        const carouselContainer = document.getElementById('categoriesContainer');
        if (!carouselContainer) {
            console.error('找不到categoriesContainer容器');
            return;
        }

        // 清空现有内容
        carouselContainer.innerHTML = '';

        // 确保容器有carousel类
        carouselContainer.className = 'carousel';

        // 创建轮播图面板
        this.categories.forEach((category, index) => {
            const panel = this.createCarouselPanel(category, index);
            carouselContainer.appendChild(panel);
        });
    }

    /**
     * 创建轮播图面板
     */
    createCarouselPanel(category, index) {
        const panel = document.createElement('div');
        panel.className = 'carousel-item';
        panel.dataset.category = category.key;
        panel.dataset.index = index;

        panel.innerHTML = `
            <span class="track-count">${category.count}首</span>

            <div class="item-header">
                <span class="item-icon">${category.icon}</span>
                <h3 class="item-title">${this.getCategoryDisplayName(category.key)}</h3>
                <p class="item-subtitle">${category.name}</p>
            </div>

            <p class="item-description">深入${this.getCategoryDisplayName(category.key)}，感受自然的治愈力量</p>

            <button class="play-btn" onclick="event.stopPropagation(); togglePlaylist(this)">显示播放列表</button>
        `;

        // 添加点击事件
        panel.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectCategory(category.key, index);
        });

        return panel;
    }

    /**
     * 获取分类显示名称
     */
    getCategoryDisplayName(categoryKey) {
        const displayNames = {
            'Animal sounds': '森林栖息地',
            'Chakra': '能量场域',
            'Fire': '温暖壁炉',
            'hypnosis': '梦境花园',
            'meditation': '禅境山谷',
            'Rain': '雨林圣地',
            'running water': '溪流秘境',
            'Singing bowl sound': '颂钵圣殿',
            'Subconscious Therapy': '潜识星域'
        };
        return displayNames[categoryKey] || categoryKey;
    }

    /**
     * 创建控制按钮
     */
    createControlButtons(container) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'carousel-controls';
        controlsDiv.style.cssText = `
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            align-items: center;
        `;

        // 上一个按钮
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '◀';
        prevBtn.className = 'carousel-btn prev-btn';
        prevBtn.style.cssText = this.getButtonStyles();
        prevBtn.addEventListener('click', () => this.rotate(-1));

        // 下一个按钮
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '▶';
        nextBtn.className = 'carousel-btn next-btn';
        nextBtn.style.cssText = this.getButtonStyles();
        nextBtn.addEventListener('click', () => this.rotate(1));

        // 自动旋转切换按钮
        const autoBtn = document.createElement('button');
        autoBtn.innerHTML = '⏸️';
        autoBtn.className = 'carousel-btn auto-btn';
        autoBtn.style.cssText = this.getButtonStyles();
        autoBtn.addEventListener('click', () => this.toggleAutoRotation());

        controlsDiv.appendChild(prevBtn);
        controlsDiv.appendChild(autoBtn);
        controlsDiv.appendChild(nextBtn);
        container.appendChild(controlsDiv);

        // 保存按钮引用
        this.autoBtn = autoBtn;
    }

    /**
     * 获取按钮样式
     */
    getButtonStyles() {
        return `
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 触摸事件
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.carousel-3d-container')) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                this.pauseAutoRotation();
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.carousel-3d-container')) {
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.carousel-3d-container')) {
                const endX = e.changedTouches[0].clientX;
                const deltaX = endX - startX;

                if (Math.abs(deltaX) > 50) {
                    this.rotate(deltaX > 0 ? -1 : 1);
                }

                this.resumeAutoRotation();
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.carousel-3d-container:hover')) {
                switch(e.key) {
                    case 'ArrowLeft':
                        this.rotate(-1);
                        break;
                    case 'ArrowRight':
                        this.rotate(1);
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleAutoRotation();
                        break;
                }
            }
        });
    }

    /**
     * 旋转轮播图
     */
    rotate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.categories.length) % this.categories.length;
        this.updateCarouselDisplay();
        this.resetAutoRotation();
    }

    /**
     * 更新轮播图显示
     */
    updateCarouselDisplay() {
        // 由主HTML脚本的updateCarouselDisplay函数处理
        // 这里只需要触发全局的更新函数
        if (typeof window.updateCarouselDisplay === 'function') {
            window.currentIndex = this.currentIndex;
            window.updateCarouselDisplay();
        }
    }

    /**
     * 选择分类
     */
    selectCategory(categoryKey, index) {
        console.log('选择分类:', categoryKey);

        // 停止自动旋转
        this.pauseAutoRotation();
        this.isInteracting = true;

        // 旋转到选择的面板
        this.currentIndex = index;
        this.updateCarouselDisplay();

        // 触发音频播放列表
        if (window.app && window.app.natureUI) {
            try {
                window.app.natureUI.showPlaylist(categoryKey);
            } catch (error) {
                console.error('触发播放列表失败:', error);
            }
        }

        // 延迟恢复交互状态
        setTimeout(() => {
            this.isInteracting = false;
            this.resumeAutoRotation();
        }, 1000);
    }

    /**
     * 开始自动旋转
     */
    startAutoRotation() {
        if (this.isAutoRotating && !this.autoRotateTimer) {
            this.autoRotateTimer = setInterval(() => {
                if (!this.isInteracting) {
                    this.rotate(1);
                }
            }, this.autoRotateSpeed);
        }
    }

    /**
     * 停止自动旋转
     */
    stopAutoRotation() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
    }

    /**
     * 暂停自动旋转
     */
    pauseAutoRotation() {
        this.stopAutoRotation();
    }

    /**
     * 恢复自动旋转
     */
    resumeAutoRotation() {
        if (this.isAutoRotating) {
            this.startAutoRotation();
        }
    }

    /**
     * 切换自动旋转
     */
    toggleAutoRotation() {
        this.isAutoRotating = !this.isAutoRotating;

        if (this.isAutoRotating) {
            this.startAutoRotation();
            if (this.autoBtn) this.autoBtn.innerHTML = '⏸️';
        } else {
            this.stopAutoRotation();
            if (this.autoBtn) this.autoBtn.innerHTML = '▶️';
        }
    }

    /**
     * 重置自动旋转
     */
    resetAutoRotation() {
        if (this.isAutoRotating) {
            this.stopAutoRotation();
            this.startAutoRotation();
        }
    }

    /**
     * 销毁轮播图
     */
    destroy() {
        this.stopAutoRotation();

        const container = document.getElementById('categoriesContainer');
        if (container) {
            container.innerHTML = '';
        }

        console.log('3D轮播图已销毁');
    }

    /**
     * 重新初始化轮播图
     */
    reinitialize() {
        this.destroy();
        this.initializeCarousel();
    }
}

// 全局访问
window.CarouselController = CarouselController;