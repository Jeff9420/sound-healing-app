// 3D音频房间轮播管理器 - 六边形轮播，每个房间显示音频列表
class AudioRoomCarousel {
    constructor() {
        this.currentAngle = 0;
        this.currentIndex = 0;
        this.totalRooms = 9; // 9个房间（九边形）
        this.autoRotateActive = false;
        this.autoRotateInterval = null;
        this.currentPlayingAudio = null;

        this.carousel = null;
        this.indicators = [];
        this.rooms = [];

        // 选择所有9个音频分类作为房间
        this.selectedCategories = [
            'Subconscious Therapy', // 潜识星域 - 第1个房间
            'hypnosis',             // 梦境花园 - 第2个房间
            'meditation',           // 禅境山谷 - 第3个房间
            'Singing bowl sound',   // 颂钵圣殿 - 第4个房间
            'Rain',                 // 雨林圣地 - 第5个房间
            'Chakra',              // 能量场域 - 第6个房间
            'Animal sounds',        // 森林栖息地 - 第7个房间
            'Fire',                 // 温暖壁炉 - 第8个房间
            'running water'         // 溪流秘境 - 第9个房间
        ];

        this.initializeElements();
    }

    initializeElements() {
        this.carousel = document.getElementById('carrossel');
        this.indicatorsContainer = document.getElementById('indicadores');

        if (!this.carousel) {
            console.error('3D轮播容器未找到');
            return;
        }
    }

    // 创建音频房间
    createAudioRooms() {
        if (!this.carousel || typeof AUDIO_CONFIG === 'undefined') {
            console.warn('轮播容器或音频配置未就绪');
            return;
        }

        // 清空容器
        this.carousel.innerHTML = '';
        this.rooms = [];

        // 房间配置映射
        const roomConfigs = {
            'Subconscious Therapy': {
                icon: '🌌',
                name: '潜识星域',
                subtitle: '潜意识疗愈',
                description: '深层心灵疗愈空间'
            },
            'hypnosis': {
                icon: '🌙',
                name: '梦境花园',
                subtitle: '催眠引导',
                description: '进入深度放松状态'
            },
            'meditation': {
                icon: '🧘‍♀️',
                name: '禅境山谷',
                subtitle: '冥想音乐',
                description: '宁静致远的冥想空间'
            },
            'Singing bowl sound': {
                icon: '🎵',
                name: '颂钵圣殿',
                subtitle: '音疗颂钵',
                description: '古老的声音疗愈艺术'
            },
            'Rain': {
                icon: '☔',
                name: '雨林圣地',
                subtitle: '雨声净化',
                description: '自然雨声的净化力量'
            },
            'Chakra': {
                icon: '🌈',
                name: '能量场域',
                subtitle: '脉轮音疗',
                description: '平衡身心能量中心'
            },
            'Animal sounds': {
                icon: '🦅',
                name: '森林栖息地',
                subtitle: '动物声音',
                description: '感受大自然生命力量'
            },
            'Fire': {
                icon: '🔥',
                name: '温暖壁炉',
                subtitle: '火焰音效',
                description: '温暖舒适的火焰声音'
            },
            'running water': {
                icon: '💧',
                name: '溪流秘境',
                subtitle: '流水音律',
                description: '清澈溪流的治愈声音'
            }
        };

        // 创建9个房间
        this.selectedCategories.forEach((categoryKey, index) => {
            const categoryData = AUDIO_CONFIG.categories[categoryKey];
            if (!categoryData) return;

            const roomConfig = roomConfigs[categoryKey];
            const audioFiles = categoryData.files || [];

            const roomElement = document.createElement('div');
            roomElement.className = 'carrossel-item';
            roomElement.dataset.category = categoryKey;
            roomElement.dataset.index = index;

            roomElement.innerHTML = `
                <div class="room-count">${audioFiles.length}首</div>

                <div class="room-header">
                    <span class="room-icon" role="img" aria-label="${roomConfig.subtitle}">${roomConfig.icon}</span>
                    <h3 class="room-title">${roomConfig.name}</h3>
                    <p class="room-subtitle">${roomConfig.subtitle}</p>
                </div>

                <div class="audio-list" id="audioList${index}">
                    ${audioFiles.map((fileName, audioIndex) => `
                        <div class="audio-item" data-file="${fileName}" data-category="${categoryKey}" data-index="${audioIndex}">
                            <div class="audio-title">${this.formatAudioTitle(fileName)}</div>
                            <div class="audio-duration">• 轻点播放</div>
                        </div>
                    `).join('')}
                </div>
            `;

            // 绑定音频播放事件
            this.bindAudioEvents(roomElement, categoryKey);

            this.carousel.appendChild(roomElement);
            this.rooms.push(roomElement);
        });

        this.createIndicators();
        this.updateRoomVisibility(); // 初始化房间可见性
        console.log('✅ 9个音频房间创建完成');
    }

    // 格式化音频标题
    formatAudioTitle(fileName) {
        let title = fileName.replace(/\.(mp3|wma|wav|flac)$/i, '');
        title = title.replace(/^\d+\./, ''); // 移除数字前缀
        title = title.replace(/^(催眠音乐|催眠专用|放松轻音乐)/, ''); // 移除常见前缀

        if (title.length > 25) {
            title = title.substring(0, 22) + '...';
        }

        return title.trim() || fileName;
    }

    // 绑定音频播放事件
    bindAudioEvents(roomElement, categoryKey) {
        const audioItems = roomElement.querySelectorAll('.audio-item');

        audioItems.forEach((audioItem) => {
            audioItem.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const fileName = audioItem.dataset.file;

                // 清除其他播放状态
                document.querySelectorAll('.audio-item').forEach(item => {
                    item.classList.remove('playing');
                });

                // 设置当前播放状态
                audioItem.classList.add('playing');

                // 播放音频
                await this.playAudio(categoryKey, fileName);

                // 更新音频时长显示
                audioItem.querySelector('.audio-duration').textContent = '• 正在播放...';
            });
        });
    }

    // 播放音频
    async playAudio(categoryKey, fileName) {
        try {
            // 如果有原有的音频管理器，使用它
            if (window.emergencyAudioManager) {
                await window.emergencyAudioManager.playTrack(categoryKey, fileName);
            } else {
                console.log(`播放音频: ${categoryKey} - ${fileName}`);

                // 创建简单的音频播放器
                if (this.currentPlayingAudio) {
                    this.currentPlayingAudio.pause();
                }

                const audioUrl = this.getAudioUrl(categoryKey, fileName);
                this.currentPlayingAudio = new Audio(audioUrl);
                this.currentPlayingAudio.volume = 0.5;

                await this.currentPlayingAudio.play();

                // 更新池塘播放按钮
                this.updateNowPlaying(categoryKey, fileName);
            }
        } catch (error) {
            console.error('播放失败:', error);
            this.showError(`播放失败: ${error.message}`);
        }
    }

    // 获取音频URL
    getAudioUrl(categoryKey, fileName) {
        const categoryMappings = {
            'Animal sounds': 'animal-sounds',
            'Chakra': 'chakra',
            'Fire': 'fire-sounds',
            'hypnosis': 'hypnosis',
            'meditation': 'meditation',
            'Rain': 'rain-sounds',
            'running water': 'water-sounds',
            'Singing bowl sound': 'singing-bowls',
            'Subconscious Therapy': 'subconscious-therapy'
        };

        const mappedCategory = categoryMappings[categoryKey] || categoryKey.toLowerCase().replace(/\s+/g, '-');
        const encodedFileName = encodeURIComponent(fileName);
        return `/api/audio/${mappedCategory}/${encodedFileName}`;
    }

    // 更新正在播放显示
    updateNowPlaying(categoryKey, fileName) {
        const currentTrackName = document.querySelector('.current-track-name');
        const currentTrackArtist = document.querySelector('.current-track-artist');
        const lotusBtn = document.getElementById('lotusPlayBtn');

        const displayName = this.formatAudioTitle(fileName);

        if (currentTrackName) {
            currentTrackName.textContent = displayName;
        }

        if (currentTrackArtist) {
            const roomNames = {
                'Subconscious Therapy': '潜识星域',
                'hypnosis': '梦境花园',
                'meditation': '禅境山谷',
                'Singing bowl sound': '颂钵圣殿',
                'Rain': '雨林圣地',
                'Chakra': '能量场域'
            };
            currentTrackArtist.textContent = roomNames[categoryKey] || categoryKey;
        }

        if (lotusBtn) {
            lotusBtn.textContent = '⏸';
        }
    }

    // 创建指示器
    createIndicators() {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';
        this.indicators = [];

        for (let i = 0; i < this.totalRooms; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicador';
            indicator.dataset.index = i;

            if (i === this.currentIndex) {
                indicator.classList.add('ativo');
            }

            indicator.addEventListener('click', () => this.goToRoom(i));

            this.indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }

    // 轮播控制方法
    nextRoom() {
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex + 1) % this.totalRooms;
        this.currentAngle -= 40; // 九边形，每次旋转40度
        this.updateCarousel();
        this.updateIndicators();
    }

    previousRoom() {
        this.stopAutoRotate();
        this.currentIndex = (this.currentIndex - 1 + this.totalRooms) % this.totalRooms;
        this.currentAngle += 40;
        this.updateCarousel();
        this.updateIndicators();
    }

    goToRoom(index) {
        this.stopAutoRotate();
        const difference = index - this.currentIndex;
        this.currentAngle -= difference * 40;
        this.currentIndex = index;
        this.updateCarousel();
        this.updateIndicators();
    }

    updateCarousel() {
        if (this.carousel) {
            this.carousel.style.transform = `rotateY(${this.currentAngle}deg)`;
            this.updateRoomVisibility();
        }
    }

    // 更新房间可见性和焦点效果
    updateRoomVisibility() {
        this.rooms.forEach((room, index) => {
            // 移除所有类
            room.classList.remove('active', 'adjacent');

            // 当前房间
            if (index === this.currentIndex) {
                room.classList.add('active');
            }
            // 相邻房间（前一个和后一个）
            else if (
                index === (this.currentIndex - 1 + this.totalRooms) % this.totalRooms ||
                index === (this.currentIndex + 1) % this.totalRooms
            ) {
                room.classList.add('adjacent');
            }
        });
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('ativo', index === this.currentIndex);
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

        if (this.carousel) {
            this.carousel.classList.add('auto-rotate');
        }

        this.autoRotateInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.totalRooms;
            this.updateIndicators();
        }, 3000); // 每3秒更新一次指示器
    }

    stopAutoRotate() {
        this.autoRotateActive = false;

        if (this.carousel) {
            this.carousel.classList.remove('auto-rotate');
        }

        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    // 显示错误
    showError(message) {
        console.error(message);

        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// 全局变量
let anguloAtual = 0;
let itemAtual = 0;
const totalItens = 9;
let carrossel = null;
let indicadores = [];
let autoRotateAtivo = false;
let audioRoomCarousel = null;

// 轮播控制函数（与carrossel-3d.html兼容）
function rotacionar(angulo) {
    carrossel = carrossel || document.getElementById('carrossel');
    if (carrossel) {
        carrossel.style.transform = `rotateY(${angulo}deg)`;
    }
}

function proximo() {
    if (audioRoomCarousel) {
        audioRoomCarousel.nextRoom();
    } else {
        // 备用逻辑
        pararAutoRotate();
        anguloAtual -= 40;
        itemAtual = (itemAtual + 1) % totalItens;
        rotacionar(anguloAtual);
        atualizarIndicadores();
    }
}

function anterior() {
    if (audioRoomCarousel) {
        audioRoomCarousel.previousRoom();
    } else {
        // 备用逻辑
        pararAutoRotate();
        anguloAtual += 40;
        itemAtual = (itemAtual - 1 + totalItens) % totalItens;
        rotacionar(anguloAtual);
        atualizarIndicadores();
    }
}

function irPara(indice) {
    if (audioRoomCarousel) {
        audioRoomCarousel.goToRoom(indice);
    } else {
        // 备用逻辑
        pararAutoRotate();
        const diferenca = indice - itemAtual;
        anguloAtual -= diferenca * 40;
        itemAtual = indice;
        rotacionar(anguloAtual);
        atualizarIndicadores();
    }
}

function atualizarIndicadores() {
    indicadores = indicadores.length ? indicadores : document.querySelectorAll('.indicador');
    indicadores.forEach((indicador, i) => {
        indicador.classList.toggle('ativo', i === itemAtual);
    });
}

function toggleAutoRotate() {
    if (audioRoomCarousel) {
        audioRoomCarousel.toggleAutoRotate();
    } else {
        // 备用逻辑
        if (autoRotateAtivo) {
            pararAutoRotate();
        } else {
            iniciarAutoRotate();
        }
    }
}

function iniciarAutoRotate() {
    carrossel = carrossel || document.getElementById('carrossel');
    if (carrossel) {
        carrossel.classList.add('auto-rotate');
        autoRotateAtivo = true;
    }
}

function pararAutoRotate() {
    carrossel = carrossel || document.getElementById('carrossel');
    if (carrossel) {
        carrossel.classList.remove('auto-rotate');
        autoRotateAtivo = false;
    }
}

// 初始化函数
function initializeAudioRoomCarousel() {
    if (typeof AUDIO_CONFIG === 'undefined') {
        console.warn('音频配置未加载，延迟初始化音频房间轮播');
        setTimeout(initializeAudioRoomCarousel, 500);
        return;
    }

    try {
        audioRoomCarousel = new AudioRoomCarousel();
        audioRoomCarousel.createAudioRooms();

        // 设置全局变量
        carrossel = document.getElementById('carrossel');
        indicadores = document.querySelectorAll('.indicador');

        console.log('✅ 音频房间轮播初始化完成');
    } catch (error) {
        console.error('音频房间轮播初始化失败:', error);
    }
}

// 替换原有的卡片创建函数
function forceCreateEcosystemCards3D() {
    if (audioRoomCarousel) {
        audioRoomCarousel.createAudioRooms();
    } else {
        initializeAudioRoomCarousel();
    }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeAudioRoomCarousel, 1000);
    });
} else {
    setTimeout(initializeAudioRoomCarousel, 1000);
}

// 导出到全局作用域
window.AudioRoomCarousel = AudioRoomCarousel;
window.audioRoomCarousel = audioRoomCarousel;
window.initializeAudioRoomCarousel = initializeAudioRoomCarousel;
window.forceCreateEcosystemCards3D = forceCreateEcosystemCards3D;