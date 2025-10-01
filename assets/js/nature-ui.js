// 沉浸式自然风格UI控制器
class NatureUI {
    constructor(audioManager, playlistUI) {
        this.audioManager = audioManager;
        this.playlistUI = playlistUI;
        this.currentSeason = 'summer';
        // 移除天气相关属性
        this.timerControlsVisible = false;
        this.currentCategory = null;
        
        this.init();
    }
    
    init() {
        try {
            this.initializeEcosystemCards();
            this.bindNatureControls();
            this.bindSeasonControls();
            this.bindTimerControls();
            this.updateCurrentPlayingInfo();
            // 移除天气循环功能
        } catch (error) {
            console.error('NatureUI 初始化失败:', error);
            throw error;
        }
        
            // 监听音频事件
        this.audioManager.eventBus.addEventListener('trackPlay', (e) => {
            this.handleAudioStarted(e.detail);
        });
        
        this.audioManager.eventBus.addEventListener('trackPause', (e) => {
            this.handleAudioStopped();
        });
        
        this.audioManager.eventBus.addEventListener('trackEnded', (e) => {
            this.handleAudioStopped();
        });
        
        this.audioManager.eventBus.addEventListener('progressUpdate', (e) => {
            this.updateProgress(e.detail);
        });
        
        // 监听语言变化事件，重新生成卡片
        document.addEventListener('languageChanged', () => {
            console.log('🌍 检测到语言变化，重新生成生态系统卡片');
            this.initializeEcosystemCards();
        });
        
        document.addEventListener('languageIntegrationChanged', () => {
            console.log('🌍 检测到语言集成变化，重新生成生态系统卡片'); 
            this.initializeEcosystemCards();
        });
    }
    
    // 初始化生态系统卡片
    initializeEcosystemCards() {
        console.log('🌿 开始初始化生态系统卡片...');
        
        const container = document.getElementById('categoriesContainer');
        if (!container) {
            console.error('❌ 未找到 categoriesContainer 元素');
            console.log('尝试从其他选择器查找容器...');
            const alternativeContainer = document.querySelector('.ecosystem-grid');
            if (alternativeContainer) {
                console.log('✅ 找到备用容器:', alternativeContainer);
                alternativeContainer.id = 'categoriesContainer'; // 设置ID以便后续使用
                return this.initializeEcosystemCards(); // 重新调用
            } else {
                console.error('❌ 无法找到任何生态系统容器元素');
                return;
            }
        }
        
        // 优先从 AUDIO_CONFIG 获取数据，与 AudioManager 保持一致
        let categories = null;
        if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories) {
            categories = AUDIO_CONFIG.categories;
            console.log('✅ 从 AUDIO_CONFIG 获取分类数据，数量:', Object.keys(categories).length);
        } else if (this.audioManager.categories && Object.keys(this.audioManager.categories).length > 0) {
            categories = this.audioManager.categories;
            console.log('✅ 从 AudioManager 获取分类数据，数量:', Object.keys(categories).length);
        } else {
            console.error('❌ 无法获取音频分类数据');
            console.log('AUDIO_CONFIG 状态:', typeof AUDIO_CONFIG, AUDIO_CONFIG?.categories ? Object.keys(AUDIO_CONFIG.categories).length : '无数据');
            console.log('AudioManager.categories 状态:', this.audioManager.categories ? Object.keys(this.audioManager.categories).length : '无数据');
            
            // 不再重试，直接失败并显示错误信息
            const container = document.getElementById('categoriesContainer');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                        <h3>🚫 音频数据加载失败</h3>
                        <p>请刷新页面重试，或联系技术支持</p>
                        <button onclick="location.reload()" style="background: #4ecdc4; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">刷新页面</button>
                    </div>
                `;
            }
            return;
        }
        
        // 重置重试计数器
        this.retryCount = 0;
        
        console.log('开始创建生态系统卡片，使用的分类数据:', categories);
        
        // 获取i18n系统实例
        const i18n = window.i18n;
        
        const ecosystemData = {
            'Animal sounds': {
                icon: '🦅',
                name: i18n ? i18n.t('ecosystem.Animal sounds.name') : '森林栖息地',
                type: i18n ? i18n.t('ecosystem.Animal sounds.type') : '鸟类与动物声',
                desc: i18n ? i18n.t('ecosystem.Animal sounds.desc') : '深入原始森林，聆听鸟儿清晨的歌唱、溪水的潺潺声，感受生命的和谐律动',
                count: categories['Animal sounds']?.files?.length || 0
            },
            'Chakra': {
                icon: '🌈',
                name: i18n ? i18n.t('ecosystem.Chakra.name') : '能量场域',
                type: i18n ? i18n.t('ecosystem.Chakra.type') : '脉轮音疗',
                desc: i18n ? i18n.t('ecosystem.Chakra.desc') : '调和身体七个能量中心，通过古老的频率疗法恢复内在平衡与活力',
                count: categories['Chakra']?.files?.length || 0
            },
            'Fire': {
                icon: '🔥',
                name: i18n ? i18n.t('ecosystem.Fire.name') : '温暖壁炉',
                type: i18n ? i18n.t('ecosystem.Fire.type') : '火焰与温暖',
                desc: i18n ? i18n.t('ecosystem.Fire.desc') : '围坐在温暖的火炉旁，木柴燃烧的声音带来家的安全感和内心的宁静',
                count: categories['Fire']?.files?.length || 0
            },
            'hypnosis': {
                icon: '🌙',
                name: i18n ? i18n.t('ecosystem.hypnosis.name') : '梦境花园',
                type: i18n ? i18n.t('ecosystem.hypnosis.type') : '催眠引导',
                desc: i18n ? i18n.t('ecosystem.hypnosis.desc') : '专业的催眠引导声音，带您穿越意识的边界，进入深层疗愈的梦境空间',
                count: categories['hypnosis']?.files?.length || 0
            },
            'meditation': {
                icon: '🧘‍♀️',
                name: i18n ? i18n.t('ecosystem.meditation.name') : '禅境山谷',
                type: i18n ? i18n.t('ecosystem.meditation.type') : '冥想音乐',
                desc: i18n ? i18n.t('ecosystem.meditation.desc') : '在宁静的山谷中冥想，专为瑜伽和静心练习设计的和谐音乐',
                count: categories['meditation']?.files?.length || 0
            },
            'Rain': {
                icon: '☔',
                name: i18n ? i18n.t('ecosystem.Rain.name') : '雨林圣地',
                type: i18n ? i18n.t('ecosystem.Rain.type') : '雨声净化',
                desc: i18n ? i18n.t('ecosystem.Rain.desc') : '雨滴敲打大地的天籁之音，洗涤心灵的尘埃，带来纯净与重生',
                count: categories['Rain']?.files?.length || 0
            },
            'running water': {
                icon: '💧',
                name: i18n ? i18n.t('ecosystem.running water.name') : '溪流秘境',
                type: i18n ? i18n.t('ecosystem.running water.type') : '流水音律',
                desc: i18n ? i18n.t('ecosystem.running water.desc') : '清澈溪流流淌的声音，带来内心的纯净与宁静',
                count: categories['running water']?.files?.length || 0
            },
            'Singing bowl sound': {
                icon: '🎵',
                name: i18n ? i18n.t('ecosystem.Singing bowl sound.name') : '颂钵圣殿',
                type: i18n ? i18n.t('ecosystem.Singing bowl sound.type') : '音疗颂钵',
                desc: i18n ? i18n.t('ecosystem.Singing bowl sound.desc') : '古老藏族颂钵的神圣音频，深层疗愈身心，调和能量振动',
                count: categories['Singing bowl sound']?.files?.length || 0
            },
            'Subconscious Therapy': {
                icon: '🌌',
                name: i18n ? i18n.t('ecosystem.Subconscious Therapy.name') : '潜识星域',
                type: i18n ? i18n.t('ecosystem.Subconscious Therapy.type') : '潜意识疗愈',
                desc: i18n ? i18n.t('ecosystem.Subconscious Therapy.desc') : '深入潜意识层面的心理疗愈音乐，重塑内在世界的和谐',
                count: categories['Subconscious Therapy']?.files?.length || 0
            }
        };
        
        container.innerHTML = '';
        
        Object.entries(ecosystemData).forEach(([categoryKey, data]) => {
            if (!categories[categoryKey]) return;
            
            const card = document.createElement('div');
            card.className = 'ecosystem-card';
            card.dataset.category = categoryKey;
            
            // 创建栖息地指示点
            const indicatorDots = Array(Math.min(Math.ceil(data.count / 15), 5))
                .fill(0)
                .map(() => '<div class="habitat-dot"></div>')
                .join('');
            
            card.innerHTML = `
                <span class="species-count">${data.count}${i18n ? i18n.t('ecosystem.species.count') : '种'}</span>
                <div class="ecosystem-header">
                    <span class="ecosystem-icon">${data.icon}</span>
                    <div class="ecosystem-info">
                        <h3 class="ecosystem-name">${data.name}</h3>
                        <p class="habitat-type">${data.type}</p>
                    </div>
                </div>
                <p class="ecosystem-desc">${data.desc}</p>
                <div class="habitat-indicators">
                    ${indicatorDots}
                </div>
            `;
            
            // 点击事件 - 使用更强健的绑定方式
            const clickHandler = (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('🔗 生态系统卡片被点击:', categoryKey, data.name);
                console.log('🔗 this.openEcosystem 存在:', typeof this.openEcosystem === 'function');
                
                try {
                    this.openEcosystem(categoryKey, data.name);
                } catch (error) {
                    console.error('❌ 打开生态系统失败:', error);
                    alert(`打开 ${data.name} 失败: ${error.message}`);
                }
            };
            
            card.addEventListener('click', clickHandler, { passive: false });
            
            // 添加调试属性
            card._clickHandler = clickHandler;
            card._categoryData = { categoryKey, name: data.name };
            
            container.appendChild(card);
            
            console.log(`✅ 生态系统卡片已创建: ${data.name} (${categoryKey})`);
            console.log(`   - 数据属性: ${card.dataset.category}`);
            console.log(`   - 点击处理器: ${typeof clickHandler}`);
            console.log(`   - 卡片元素:`, card);
        });
        
        console.log('生态系统卡片创建完成，总数:', Object.keys(ecosystemData).length);
    }
    
    // 打开生态系统（播放列表）
    openEcosystem(categoryKey, ecosystemName) {
        console.log('🌿 打开生态系统:', categoryKey, ecosystemName);
        
        // 找到正确的容器元素
        const mainContainer = document.querySelector('main.forest-path');
        const playlistSection = document.getElementById('playlistSection');
        
        console.log('🔍 查找元素结果:', {
            mainContainer: !!mainContainer,
            playlistSection: !!playlistSection,
            mainContainerSelector: mainContainer ? mainContainer.tagName + '.' + mainContainer.className : 'null',
            playlistSectionId: playlistSection ? playlistSection.id : 'null'
        });
        
        if (!playlistSection) {
            console.error('❌ 播放列表区域未找到，请检查HTML结构');
            alert('播放列表区域未找到，请刷新页面重试');
            return;
        }
        
        if (!mainContainer) {
            console.error('❌ 主容器未找到，请检查HTML结构');
        }
        
        // 强制显示播放列表 - 移除所有可能的隐藏样式
        console.log('🚀 开始显示播放列表...');
        
        // 首先隐藏主容器
        if (mainContainer) {
            mainContainer.style.display = 'none';
            console.log('✅ 主容器已隐藏');
        }
        
        // 强制显示播放列表 - 逐步设置每个样式属性
        playlistSection.style.display = 'block';
        playlistSection.style.visibility = 'visible';
        playlistSection.style.opacity = '1';
        playlistSection.style.position = 'fixed';
        playlistSection.style.top = '0';
        playlistSection.style.left = '0';
        playlistSection.style.width = '100%';
        playlistSection.style.height = '100%';
        playlistSection.style.zIndex = '1000';
        playlistSection.style.background = 'rgba(26, 46, 26, 0.95)';
        playlistSection.style.backdropFilter = 'blur(20px)';
        playlistSection.style.overflowY = 'auto';
        playlistSection.style.padding = '2rem';
        
        // 添加激活类
        playlistSection.classList.add('playlist-active');
        console.log('✅ 播放列表样式已应用');
        
        // 确保所有子元素可见
        const playlistHeader = playlistSection.querySelector('.playlist-header');
        const habitatPlayer = playlistSection.querySelector('.habitat-player');
        const trackListDiv = document.getElementById('trackList');
        
        if (playlistHeader) {
            playlistHeader.style.display = 'flex';
            playlistHeader.style.visibility = 'visible';
            playlistHeader.style.opacity = '1';
            console.log('✅ 播放列表头部可见');
        }
        
        if (habitatPlayer) {
            habitatPlayer.style.display = 'block';
            habitatPlayer.style.visibility = 'visible';
            habitatPlayer.style.opacity = '1';
            console.log('✅ 播放器控制区可见');
        }
        
        if (trackListDiv) {
            trackListDiv.style.display = 'block';
            trackListDiv.style.visibility = 'visible';
            trackListDiv.style.opacity = '1';
            console.log('✅ 曲目列表区域可见');
        }
        
        // 更新播放列表标题
        const titleElement = document.getElementById('playlistTitle');
        if (titleElement) {
            titleElement.textContent = ecosystemName;
            console.log('✅ 标题已更新为:', ecosystemName);
        }
        
        // 渲染曲目列表
        console.log('🎵 开始渲染曲目列表...');
        this.renderTrackList(categoryKey);
        
        // 保存当前分类
        this.currentCategory = categoryKey;
        
        // 最终状态检查
        console.log('📊 播放列表最终状态:', {
            display: playlistSection.style.display,
            visibility: playlistSection.style.visibility,
            opacity: playlistSection.style.opacity,
            zIndex: playlistSection.style.zIndex,
            hasActiveClass: playlistSection.classList.contains('playlist-active'),
            boundingRect: playlistSection.getBoundingClientRect()
        });
        
        console.log('🎉 播放列表应该现在可见了！');
        
        // 最后的强制验证和修复 - 如果仍然不可见，使用备用方法
        setTimeout(() => {
            const computedStyle = getComputedStyle(playlistSection);
            const isStillHidden = computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0';
            
            if (isStillHidden) {
                console.warn('⚠️ 播放列表仍然不可见，使用备用显示方法...');
                
                // 备用显示方法：直接修改所有可能的隐藏原因
                playlistSection.setAttribute('style', `
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: fixed !important;
                    top: 0px !important;
                    left: 0px !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    background: rgba(26, 46, 26, 0.95) !important;
                    overflow-y: auto !important;
                    padding: 2rem !important;
                `);
                
                // 移除所有可能的隐藏类
                playlistSection.className = 'playlist-section playlist-active';
                
                console.log('🔧 备用显示方法已应用');
            } else {
                console.log('✅ 播放列表正常显示');
            }
        }, 100);
    }
    
    // 绑定自然控制台事件
    bindNatureControls() {
        // 荷花播放按钮
        const lotusBtn = document.getElementById('lotusPlayBtn');
        if (lotusBtn) {
            lotusBtn.addEventListener('click', () => {
                this.toggleMainPlayback();
            });
        }
        
        // 全局控制按钮
        const globalPlayBtn = document.getElementById('globalPlayBtn');
        const globalPrevBtn = document.getElementById('globalPrevBtn');
        const globalNextBtn = document.getElementById('globalNextBtn');
        
        if (globalPlayBtn) {
            globalPlayBtn.addEventListener('click', () => {
                this.toggleMainPlayback();
            });
        }
        
        if (globalPrevBtn) {
            globalPrevBtn.addEventListener('click', () => {
                this.audioManager.previousTrack();
            });
        }
        
        if (globalNextBtn) {
            globalNextBtn.addEventListener('click', () => {
                this.audioManager.nextTrack();
            });
        }
        
        // 随机和循环按钮
        const shuffleBtn = document.getElementById('shuffleModeBtn');
        const repeatBtn = document.getElementById('repeatModeBtn');
        
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.toggleShuffleMode();
            });
        }
        
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => {
                this.toggleRepeatMode();
            });
        }
        
        // 全局音量控制
        const globalVolume = document.getElementById('globalVolume');
        if (globalVolume) {
            globalVolume.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                this.audioManager.setGlobalVolume(volume);
                this.updateVolumeDisplay(volume);
            });
        }
        
        // 返回分类按钮事件
        const backToCategories = document.getElementById('backToCategories');
        if (backToCategories) {
            backToCategories.addEventListener('click', () => {
                this.showCategories();
            });
        }
        
        // 播放列表内的播放控制
        const playPauseBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playlistShuffleBtn = document.getElementById('shuffleBtn');
        const playlistRepeatBtn = document.getElementById('repeatBtn');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.toggleMainPlayback();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.audioManager.previousTrack();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.audioManager.nextTrack();
            });
        }
        
        if (playlistShuffleBtn) {
            playlistShuffleBtn.addEventListener('click', () => {
                this.toggleShuffleMode();
            });
        }
        
        if (playlistRepeatBtn) {
            playlistRepeatBtn.addEventListener('click', () => {
                this.toggleRepeatMode();
            });
        }
        
        // 音量控制
        const currentTrackVolume = document.getElementById('currentTrackVolume');
        const currentVolumeDisplay = document.getElementById('currentVolumeDisplay');
        
        if (currentTrackVolume) {
            currentTrackVolume.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                if (currentVolumeDisplay) {
                    currentVolumeDisplay.textContent = Math.round(volume * 100) + '%';
                }
                if (this.audioManager.currentTrack) {
                    this.audioManager.setTrackVolume(this.audioManager.currentTrack.trackId, volume);
                }
            });
        }
        
        // 进度条控制
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('input', (e) => {
                const position = parseFloat(e.target.value);
                this.audioManager.seekTo(position);
            });
        }
    }
    
    // 绑定季节控制
    bindSeasonControls() {
        const seasonButtons = document.querySelectorAll('.season');
        seasonButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const season = btn.dataset.season;
                this.changeSeason(season);
            });
        });
    }
    
    // 绑定定时器控制
    bindTimerControls() {
        const timerBtn = document.getElementById('timerBtn');
        const timerControls = document.getElementById('timerControls');
        
        if (timerBtn) {
            timerBtn.addEventListener('click', () => {
                this.toggleTimerControls();
            });
        }
        
        // 定时器功能委托给已有的SleepTimer类处理
    }
    
    // 切换主播放
    toggleMainPlayback() {
        if (this.audioManager.isAnyPlaying()) {
            // 暂停所有播放
            this.audioManager.pauseAll();
        } else {
            // 如果有当前音轨，继续播放；否则播放第一个分类的第一首
            const currentTrack = this.audioManager.getCurrentTrack();
            if (currentTrack) {
                this.audioManager.resumeCurrentTrack();
            } else {
                const firstCategory = Object.keys(this.audioManager.categories)[0];
                if (firstCategory && this.audioManager.categories[firstCategory].files.length > 0) {
                    const firstFile = this.audioManager.categories[firstCategory].files[0];
                    const trackId = this.audioManager.generateTrackId(firstCategory, firstFile);
                    this.audioManager.playTrack(trackId, firstCategory, firstFile, true);
                }
            }
        }
    }
    
    // 切换随机模式
    toggleShuffleMode() {
        this.audioManager.shuffleMode = !this.audioManager.shuffleMode;
        this.syncControlButtons(); // 同步所有按钮状态
        console.log('随机播放:', this.audioManager.shuffleMode ? '开启' : '关闭');
    }
    
    // 切换循环模式
    toggleRepeatMode() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.audioManager.repeatMode);
        this.audioManager.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.syncControlButtons(); // 同步所有按钮状态
        console.log('循环模式:', this.audioManager.repeatMode);
    }
    
    // 切换定时器控制显示
    toggleTimerControls() {
        const timerControls = document.getElementById('timerControls');
        if (timerControls) {
            this.timerControlsVisible = !this.timerControlsVisible;
            timerControls.style.display = this.timerControlsVisible ? 'flex' : 'none';
            
            const timerBtn = document.getElementById('timerBtn');
            if (timerBtn) {
                timerBtn.classList.toggle('active', this.timerControlsVisible);
            }
        }
    }
    
    // 改变季节
    changeSeason(season) {
        this.currentSeason = season;
        
        // 更新季节指示器
        document.querySelectorAll('.season').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.season[data-season="${season}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 更新季节背景效果
        this.updateSeasonalEffects(season);
        console.log('切换到季节:', season);
    }
    
    // 更新季节效果
    updateSeasonalEffects(season) {
        const body = document.body;
        
        // 移除所有季节类
        body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
        
        // 添加当前季节类
        body.classList.add(`season-${season}`);
        
        // 通知疗愈状态控制器季节变化
        document.dispatchEvent(new CustomEvent('seasonChange', {
            detail: { season: season }
        }));
        
        console.log(`季节效果已更新: ${season}`);
    }
    
    // 处理音频开始播放
    handleAudioStarted(detail) {
        // 更新荷花按钮状态
        const lotusBtn = document.getElementById('lotusPlayBtn');
        if (lotusBtn) {
            lotusBtn.textContent = '⏸';
            lotusBtn.classList.add('playing');
        }
        
        // 更新全局播放按钮
        const globalPlayBtn = document.getElementById('globalPlayBtn');
        if (globalPlayBtn) {
            globalPlayBtn.textContent = '⏸';
        }
        
        // 更新播放列表内的播放按钮
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '🎧';
        }
        
        // 同步随机和循环按钮状态
        this.syncControlButtons();
        
        // 更新当前播放信息
        this.updateCurrentPlayingInfo(detail);
        
        // 更新曲目列表UI
        if (detail && detail.trackId) {
            this.updateTrackItemUI(detail.trackId);
        }
        
        // 创建水波纹效果
        this.createWaveRipple();
    }
    
    // 处理音频停止播放
    handleAudioStopped() {
        // 更新荷花按钮状态
        const lotusBtn = document.getElementById('lotusPlayBtn');
        if (lotusBtn) {
            lotusBtn.textContent = '▶';
            lotusBtn.classList.remove('playing');
        }
        
        // 更新全局播放按钮
        const globalPlayBtn = document.getElementById('globalPlayBtn');
        if (globalPlayBtn) {
            globalPlayBtn.textContent = '▶';
        }
        
        // 更新播放列表内的播放按钮
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '▶️';
        }
        
        // 同步随机和循环按钮状态
        this.syncControlButtons();
        
        // 重置播放信息
        this.updateCurrentPlayingInfo(null);
        
        // 重置曲目列表UI
        this.updateTrackItemUI(null);
    }
    
    // 更新当前播放信息
    updateCurrentPlayingInfo(trackInfo = null) {
        const trackName = document.querySelector('.current-track-name');
        const trackArtist = document.querySelector('.current-track-artist');
        
        if (trackInfo && trackInfo.fileName) {
            if (trackName) trackName.textContent = this.formatTrackName(trackInfo.fileName);
            if (trackArtist) trackArtist.textContent = `来自 ${this.getCategoryDisplayName(trackInfo.categoryKey)}`;
        } else {
            if (trackName) trackName.textContent = '选择您的疗愈之声';
            if (trackArtist) trackArtist.textContent = '开始您的自然之旅';
        }
    }
    
    // 格式化曲目名称
    formatTrackName(fileName) {
        return fileName.replace('.mp3', '').substring(0, 30) + (fileName.length > 30 ? '...' : '');
    }
    
    // 获取分类显示名称
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
    
    // 创建水波纹效果
    createWaveRipple() {
        const pondPlayer = document.querySelector('.pond-player');
        if (!pondPlayer) return;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.animationDelay = '0s';
        
        pondPlayer.appendChild(ripple);
        
        // 3秒后移除波纹
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 4000);
    }
    
    // 更新音量显示
    updateVolumeDisplay(volume) {
        const volumeDisplay = document.querySelector('.volume-value');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
        }
    }
    
    // 更新进度
    updateProgress(progressData) {
        // 这个方法可以用来更新任何自定义的进度显示
        // 目前进度条由其他组件处理
    }
    
    // 获取当前状态
    getState() {
        return {
            currentSeason: this.currentSeason,
            timerControlsVisible: this.timerControlsVisible
        };
    }
    
    // 设置状态
    setState(state) {
        if (state.currentSeason) {
            this.changeSeason(state.currentSeason);
        }
        if (typeof state.timerControlsVisible === 'boolean') {
            this.timerControlsVisible = state.timerControlsVisible;
            const timerControls = document.getElementById('timerControls');
            if (timerControls) {
                timerControls.style.display = this.timerControlsVisible ? 'flex' : 'none';
            }
        }
    }
    
    // 显示分类页面
    showCategories() {
        console.log('🔙 返回分类页面');
        
        const mainContainer = document.querySelector('main.forest-path');
        const playlistSection = document.getElementById('playlistSection');
        
        console.log('🔍 返回时元素状态:', {
            mainContainer: !!mainContainer,
            playlistSection: !!playlistSection
        });
        
        if (!mainContainer || !playlistSection) {
            console.error('❌ 返回时无法找到必要元素');
            return;
        }
        
        // 隐藏播放列表
        playlistSection.style.display = 'none';
        playlistSection.style.visibility = 'hidden';
        playlistSection.style.opacity = '0';
        playlistSection.style.zIndex = '-1';
        
        // 显示主容器
        mainContainer.style.display = 'block';
        mainContainer.style.visibility = 'visible';
        mainContainer.style.opacity = '1';
        
        // 移除激活类
        playlistSection.classList.remove('playlist-active');
        
        console.log('✅ 已切换回主页面');
        console.log('📊 返回后状态:', {
            mainVisible: mainContainer.style.display !== 'none',
            playlistHidden: playlistSection.style.display === 'none',
            playlistActiveClass: playlistSection.classList.contains('playlist-active')
        });
        
        this.currentCategory = null;
    }
    
    // 渲染曲目列表
    renderTrackList(categoryKey) {
        console.log('渲染曲目列表:', categoryKey);
        
        const trackList = document.getElementById('trackList');
        console.log('trackList 元素:', !!trackList);
        
        // 优先从 AUDIO_CONFIG 获取数据，与初始化时保持一致
        let category = null;
        if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories && AUDIO_CONFIG.categories[categoryKey]) {
            category = AUDIO_CONFIG.categories[categoryKey];
            console.log('从 AUDIO_CONFIG 获取分类数据:', categoryKey);
        } else if (this.audioManager.categories && this.audioManager.categories[categoryKey]) {
            category = this.audioManager.categories[categoryKey];
            console.log('从 AudioManager 获取分类数据:', categoryKey);
        }
        
        console.log('分类是否存在:', !!category);
        
        if (!trackList || !category) {
            console.error('❌ renderTrackList 失败 - 缺少必要元素或数据');
            console.log('详细状态:', {
                trackList: !!trackList,
                category: !!category,
                categoryKey: categoryKey,
                'AUDIO_CONFIG存在': typeof AUDIO_CONFIG !== 'undefined',
                'AudioManager.categories存在': !!this.audioManager?.categories
            });
            
            // 显示错误信息到播放列表
            if (trackList) {
                trackList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                        <h3>🚫 无法加载播放列表</h3>
                        <p>分类: ${categoryKey}</p>
                        <p>请刷新页面重试</p>
                    </div>
                `;
            }
            return;
        }
        
        const files = category.files || [];
        console.log('文件数量:', files.length);
        
        // 创建曲目列表容器
        const listContainer = document.createElement('div');
        listContainer.className = 'track-list';
        
        files.forEach((fileName, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.dataset.category = categoryKey;
            trackItem.dataset.filename = fileName;
            
            const trackId = this.audioManager.generateTrackId(categoryKey, fileName);
            
            // Create secure DOM elements (prevent XSS)
            const trackHeader = document.createElement('div');
            trackHeader.className = 'track-header';

            const trackNumber = document.createElement('div');
            trackNumber.className = 'track-number';
            trackNumber.textContent = index + 1;

            const trackTitle = document.createElement('h4');
            trackTitle.className = 'track-title';
            trackTitle.textContent = SecurityUtils.sanitizeFileName(this.formatTrackName(fileName));

            const trackDuration = document.createElement('span');
            trackDuration.className = 'track-duration';
            trackDuration.textContent = '--:--';

            const playButton = document.createElement('button');
            playButton.className = 'track-play-btn';
            playButton.dataset.trackId = trackId;
            playButton.textContent = '▶';

            trackHeader.appendChild(trackNumber);
            trackHeader.appendChild(trackTitle);
            trackHeader.appendChild(trackDuration);
            trackItem.appendChild(trackHeader);
            trackItem.appendChild(playButton);
            
            // 点击事件
            trackItem.addEventListener('click', () => {
                this.playTrack(categoryKey, fileName, index);
            });
            
            listContainer.appendChild(trackItem);
        });
        
        trackList.innerHTML = '';
        trackList.appendChild(listContainer);
    }
    
    // 播放曲目
    playTrack(categoryKey, fileName, index) {
        const trackId = this.audioManager.generateTrackId(categoryKey, fileName);
        this.audioManager.playPlaylist(categoryKey, index);
        
        // 更新UI状态
        this.updateTrackItemUI(trackId);
    }
    
    // 更新曲目项UI
    updateTrackItemUI(activeTrackId) {
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach(item => {
            const playBtn = item.querySelector('.track-play-btn');
            const trackId = playBtn?.dataset.trackId;
            
            if (trackId === activeTrackId) {
                item.classList.add('playing');
                if (playBtn) playBtn.textContent = '⏸';
            } else {
                item.classList.remove('playing');
                if (playBtn) playBtn.textContent = '▶';
            }
        });
    }
    
    // 更新进度显示
    updateProgress(progressData) {
        const progressBar = document.getElementById('progressBar');
        const currentTime = document.getElementById('currentTime');
        const totalTime = document.getElementById('totalTime');
        
        if (progressBar && progressData.percentage !== undefined) {
            progressBar.value = progressData.percentage;
        }
        
        if (currentTime && progressData.currentTime !== undefined) {
            currentTime.textContent = this.formatTime(progressData.currentTime);
        }
        
        if (totalTime && progressData.duration !== undefined) {
            totalTime.textContent = this.formatTime(progressData.duration);
        }
    }
    
    // 格式化时间
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 同步控制按钮状态
    syncControlButtons() {
        // 同步随机播放按钮
        const shuffleBtns = [
            document.getElementById('shuffleModeBtn'),
            document.getElementById('shuffleBtn')
        ];
        
        shuffleBtns.forEach(btn => {
            if (btn) {
                if (this.audioManager.shuffleMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
        
        // 同步循环播放按钮
        const repeatBtns = [
            document.getElementById('repeatModeBtn'),
            document.getElementById('repeatBtn')
        ];
        
        repeatBtns.forEach(btn => {
            if (btn) {
                btn.classList.toggle('active', this.audioManager.repeatMode !== 'none');
                
                // 更新按钮显示
                if (this.audioManager.repeatMode === 'one') {
                    btn.textContent = '🔂';
                } else if (this.audioManager.repeatMode === 'all') {
                    btn.textContent = '🔁';
                } else {
                    btn.textContent = '🔁';
                }
            }
        });
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NatureUI;
}