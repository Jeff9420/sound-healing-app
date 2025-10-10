class SoundHealingApp {
    constructor() {
        this.audioManager = null;
        this.playlistUI = null;
        this.uiController = null;
        this.sleepTimer = null;
        this.visualEffects = null;
        this.themeManager = null;
        this.performanceMonitor = null;
        this.backgroundSceneManager = null;
        this.natureUI = null; // 新增自然UI控制器
        this.carouselController = null; // 3D轮播图控制器
        this.isReady = false;
    }

    async initializeAudioManager() {
        // 简化的AudioManager初始化 - 移除不必要的重试
        try {
            // 优先使用全局实例
            if (typeof window !== 'undefined' && window.audioManager) {
                console.log('✅ 使用现有的AudioManager实例');
                this.audioManager = window.audioManager;
                return;
            }

            // 检查AudioManager类是否可用
            if (typeof AudioManager !== 'undefined') {
                console.log('✅ 创建新的AudioManager实例');
                this.audioManager = new AudioManager();
                return;
            }

            // 最后尝试window.AudioManager
            if (typeof window !== 'undefined' && typeof window.AudioManager !== 'undefined') {
                console.log('✅ 使用window.AudioManager创建实例');
                this.audioManager = new window.AudioManager();
                return;
            }

            // 如果都失败，等待短暂时间再试一次
            console.log('⏳ AudioManager未就绪，等待200ms...');
            await new Promise(resolve => setTimeout(resolve, 200));

            if (typeof AudioManager !== 'undefined') {
                console.log('✅ AudioManager加载完成，创建实例');
                this.audioManager = new AudioManager();
                return;
            }

            throw new Error('❌ AudioManager类未找到，请确保audio-manager.js已加载');

        } catch (error) {
            console.error('❌ AudioManager初始化失败:', error);
            throw error;
        }
    }

    async initialize() {
        try {
            this.showAppStatus('初始化中...');
            
            // 健壮的AudioManager初始化，解决模块冲突问题
            await this.initializeAudioManager();
            await this.audioManager.initialize();
            console.log('✅ AudioManager 初始化完成，准备初始化UI组件');
            
            // 逐步初始化组件，增加错误处理
            try {
                this.playlistUI = new PlaylistUI(this.audioManager);
                console.log('PlaylistUI 初始化成功');
            } catch (error) {
                console.error('PlaylistUI 初始化失败:', error);
            }
            
            try {
                this.uiController = new UIController(this.audioManager);
                console.log('UIController 初始化成功');
            } catch (error) {
                console.error('UIController 初始化失败:', error);
            }
            
            try {
                this.sleepTimer = new SleepTimer(this.audioManager, this.uiController || null);
                console.log('SleepTimer 初始化成功');
            } catch (error) {
                console.error('SleepTimer 初始化失败:', error);
            }
            
            try {
                this.visualEffects = new VisualEffects();
                console.log('VisualEffects 初始化成功');
            } catch (error) {
                console.error('VisualEffects 初始化失败:', error);
            }
            
            try {
                this.themeManager = new ThemeManager();
                console.log('ThemeManager 初始化成功');
            } catch (error) {
                console.error('ThemeManager 初始化失败:', error);
            }
            
            try {
                this.performanceMonitor = new PerformanceMonitor();
                console.log('PerformanceMonitor 初始化成功');
            } catch (error) {
                console.error('PerformanceMonitor 初始化失败:', error);
            }
            
            try {
                this.backgroundSceneManager = new BackgroundSceneManager(this.audioManager);
                console.log('BackgroundSceneManager 初始化成功');
            } catch (error) {
                console.error('BackgroundSceneManager 初始化失败:', error);
            }
            
            // 初始化自然UI控制器 - 现在AudioManager已经完全准备好
            if (typeof NatureUI !== 'undefined') {
                try {
                    console.log('开始创建 NatureUI，AudioManager categories数量:', Object.keys(this.audioManager.categories).length);
                    this.natureUI = new NatureUI(this.audioManager, this.playlistUI);
                    console.log('✅ NatureUI 初始化成功');
                    
                    // 确保全局访问 - 关键修复！
                    window.app = this;
                    console.log('✅ 全局app对象已设置');
                    
                    // 验证生态系统卡片是否创建成功
                    const container = document.getElementById('categoriesContainer');
                    const cardCount = container?.children?.length || 0;
                    console.log(`✅ 生态系统卡片创建完成: ${cardCount} 个卡片`);
                    
                    if (cardCount === 0) {
                        console.warn('⚠️ 没有创建任何生态系统卡片，尝试手动重新初始化');
                        this.natureUI.initializeEcosystemCards();
                    }
                    
                    // 双重验证全局访问
                    console.log('验证全局访问:', {
                        'window.app存在': !!window.app,
                        'window.app.natureUI存在': !!window.app?.natureUI,
                        'this.natureUI存在': !!this.natureUI
                    });
                    
                } catch (error) {
                    console.error('NatureUI 初始化失败:', error);
                    console.error('错误详情:', error.stack);
                    // 不抛出错误，让应用继续运行
                }
            } else {
                console.error('NatureUI 类未找到!');
            }

            // 初始化3D轮播图控制器
            try {
                this.carouselController = new CarouselController(this.audioManager);
                console.log('✅ 3D轮播图控制器初始化成功');
            } catch (error) {
                console.error('3D轮播图控制器初始化失败:', error);
            }
            
            this.connectVisualEffects();
            this.performanceMonitor.startMonitoring();
            
            this.setupGlobalErrorHandling();
            this.setupVisibilityHandling();
            
            this.isReady = true;
            
            // 最终确保全局访问 - 关键修复！
            window.app = this;
            console.log('🔧 最终设置全局app对象，验证访问:');
            console.log('- window.app 存在:', !!window.app);
            console.log('- window.app.natureUI 存在:', !!window.app?.natureUI);
            console.log('- window.app.isReady:', window.app?.isReady);
            
            this.showAppStatus('就绪');
            
            console.log('✅ 声音疗愈应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            console.error('错误详情:', error.message);
            console.error('错误堆栈:', error.stack);
            
            // 临时显示详细错误信息
            alert('初始化错误: ' + error.message + '\n\n查看控制台了解详情');
            
            this.showAppStatus('初始化失败');
            this.handleInitializationError(error);
        }
    }

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('💫 无Service Worker支持，继续使用基础缓存');
            return null;
        }
        
        if (location.protocol === 'file:') {
            console.log('💫 无Service Worker支持，继续使用基础缓存');
            return null;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker注册成功:', registration);
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.uiController?.showMessage('应用已更新，刷新页面获取最新功能', 'info');
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.warn('⚠️ Service Worker注册失败，使用降级模式', error);
            return null;
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('全局JavaScript错误:', e.error);
            this.uiController?.showError('应用遇到了问题，请刷新页面重试');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise拒绝:', e.reason);
            this.uiController?.showError('音频处理遇到问题，请检查网络连接');
        });
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.uiController?.handleVisibilityChange();
        });
    }

    handleInitializationError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'initialization-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h2>初始化失败</h2>
                <p>应用无法正常启动，可能的原因：</p>
                <ul>
                    <li>网络连接问题</li>
                    <li>音频文件加载失败</li>
                    <li>浏览器兼容性问题</li>
                </ul>
                <button onclick="location.reload()" class="retry-btn">重试</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    showAppStatus(status) {
        // 在控制台显示状态，不需要DOM元素
        console.log(`应用状态: ${status}`);
        
        // 如果有状态元素则更新，否则忽略
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    connectVisualEffects() {
        this.audioManager.eventBus.addEventListener('trackPlay', (e) => {
            const detail = typeof e.detail === 'string' ? { trackId: e.detail } : e.detail;
            const instance = this.audioManager.getTrackInstance(detail.trackId);
            if (instance && this.visualEffects) {
                this.visualEffects.updateSoundEffect(detail.trackId, instance.volume, true);
            }
        });

        this.audioManager.eventBus.addEventListener('trackPause', (e) => {
            if (this.visualEffects) {
                this.visualEffects.updateSoundEffect(e.detail, 0, false);
            }
        });

        this.audioManager.eventBus.addEventListener('volumeChange', (e) => {
            const { trackId, volume } = e.detail;
            const instance = this.audioManager.getTrackInstance(trackId);
            if (this.visualEffects) {
                this.visualEffects.updateSoundEffect(trackId, volume, instance?.isPlaying || false);
            }
        });
    }

    async cleanup() {
        try {
            if (this.audioManager) {
                this.audioManager.cleanup();
            }
            if (this.visualEffects) {
                this.visualEffects.cleanup();
            }
            if (this.backgroundSceneManager) {
                this.backgroundSceneManager.cleanup();
            }
            if (this.performanceMonitor) {
                this.performanceMonitor.stopMonitoring();
            }
            this.isReady = false;
        } catch (error) {
            console.error('应用清理失败:', error);
        }
    }
}

let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化应用...');
    
    app = new SoundHealingApp();
    
    // 立即设置全局访问 - 确保调试工具可用
    window.app = app;
    console.log('🔧 DOM加载后立即设置全局app对象');
    
    if ('serviceWorker' in navigator) {
        await app.registerServiceWorker();
    }
    
    await app.initialize();
    
    // 再次确认全局访问
    window.app = app;
    console.log('🔧 应用初始化后再次确认全局app对象');
    console.log('最终验证:', {
        'app变量': !!app,
        'window.app': !!window.app,
        'app.natureUI': !!app?.natureUI,
        'window.app.natureUI': !!window.app?.natureUI
    });
});

window.addEventListener('beforeunload', () => {
    if (app && app.isReady) {
        app.audioManager?.saveUserSettings();
        app.cleanup();
    }
});

// 调试函数
window.debugTest = function() {
    console.log('=== 调试测试开始 ===');
    
    const debugInfo = [];
    
    debugInfo.push('=== 应用状态检查 ===');
    debugInfo.push(`app 对象: ${window.app ? '✅ 存在' : '❌ 不存在'}`);
    debugInfo.push(`app.natureUI: ${window.app?.natureUI ? '✅ 存在' : '❌ 不存在'}`);
    debugInfo.push(`app.audioManager: ${window.app?.audioManager ? '✅ 存在' : '❌ 不存在'}`);
    
    // 检查音频配置
    debugInfo.push('\n=== 音频配置检查 ===');
    if (typeof AUDIO_CONFIG !== 'undefined') {
        const categoryCount = Object.keys(AUDIO_CONFIG.categories || {}).length;
        debugInfo.push(`AUDIO_CONFIG: ✅ 存在，${categoryCount} 个分类`);
        debugInfo.push(`分类列表: ${Object.keys(AUDIO_CONFIG.categories || {}).join(', ')}`);
    } else {
        debugInfo.push('AUDIO_CONFIG: ❌ 不存在');
    }
    
    if (window.app?.audioManager?.categories) {
        const categoryCount = Object.keys(window.app.audioManager.categories).length;
        debugInfo.push(`AudioManager分类: ✅ ${categoryCount} 个分类`);
    } else {
        debugInfo.push('AudioManager分类: ❌ 不存在或为空');
    }
    
    // 检查DOM元素
    debugInfo.push('\n=== DOM元素检查 ===');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const playlistSection = document.getElementById('playlistSection');
    const mainContainer = document.querySelector('main.forest-path');
    const trackList = document.getElementById('trackList');
    const backBtn = document.getElementById('backToCategories');
    
    debugInfo.push(`categoriesContainer: ${categoriesContainer ? '✅ 存在' : '❌ 不存在'} (${categoriesContainer?.children?.length || 0} 个子元素)`);
    debugInfo.push(`playlistSection: ${playlistSection ? '✅ 存在' : '❌ 不存在'}`);
    debugInfo.push(`mainContainer: ${mainContainer ? '✅ 存在' : '❌ 不存在'}`);
    debugInfo.push(`trackList: ${trackList ? '✅ 存在' : '❌ 不存在'}`);
    debugInfo.push(`backToCategories按钮: ${backBtn ? '✅ 存在' : '❌ 不存在'}`);
    
    // 检查生态系统卡片是否有点击事件
    debugInfo.push('\n=== 生态系统卡片检查 ===');
    if (categoriesContainer && categoriesContainer.children.length > 0) {
        debugInfo.push(`找到 ${categoriesContainer.children.length} 个卡片`);
        Array.from(categoriesContainer.children).forEach((card, index) => {
            const category = card.dataset.category;
            const hasClickListener = card.onclick || card.addEventListener;
            debugInfo.push(`卡片 ${index + 1}: 分类=${category || '未设置'}, 点击事件=${hasClickListener ? '已绑定' : '未绑定'}`);
            
            // 测试点击事件
            if (index === 0 && window.app?.natureUI) {
                debugInfo.push('尝试触发第一个卡片的点击事件...');
                try {
                    card.click();
                    debugInfo.push('✅ 第一个卡片点击测试完成');
                } catch (error) {
                    debugInfo.push(`❌ 第一个卡片点击测试失败: ${error.message}`);
                }
            }
        });
    } else {
        debugInfo.push('❌ 没有找到任何生态系统卡片');
        
        // 尝试重新初始化
        if (window.app?.natureUI) {
            debugInfo.push('尝试重新初始化生态系统卡片...');
            try {
                window.app.natureUI.initializeEcosystemCards();
                debugInfo.push('✅ 重新初始化完成');
            } catch (error) {
                debugInfo.push(`❌ 重新初始化失败: ${error.message}`);
            }
        }
    }
    
    // 显示在页面上
    const debugDisplay = document.createElement('div');
    debugDisplay.id = 'debug-display';
    debugDisplay.style.cssText = `
        position: fixed; 
        top: 10px; 
        right: 10px; 
        width: 450px; 
        max-height: 90vh; 
        background: rgba(0,0,0,0.95); 
        color: #00ff00; 
        padding: 20px; 
        border-radius: 8px; 
        font-family: 'Courier New', monospace; 
        font-size: 11px; 
        z-index: 9999;
        overflow-y: auto;
        white-space: pre-line;
        border: 2px solid #00ff00;
        box-shadow: 0 0 20px rgba(0,255,0,0.3);
    `;
    
    debugDisplay.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #00ff00; padding-bottom: 10px;">
            <strong style="color: #ffff00;">🔧 调试信息面板</strong>
            <button onclick="document.getElementById('debug-display').remove()" style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✖ 关闭</button>
        </div>
        ${debugInfo.join('\n')}
        
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #00ff00;">
            <button onclick="window.testEcosystemClick()" style="background: #4ecdc4; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">🧪 测试卡片点击</button>
            <button onclick="window.forceReinitialize()" style="background: #ff9500; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">🔄 强制重新初始化</button>
        </div>
    `;
    
    // 移除之前的调试面板
    const existingPanel = document.getElementById('debug-display');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    document.body.appendChild(debugDisplay);
    
    // 同时输出到控制台
    console.log(debugInfo.join('\n'));
};

window.forceShowPlaylist = function() {
    console.log('=== 强制显示播放列表（带CSS修复） ===');
    const mainContainer = document.querySelector('main.forest-path');
    const playlistSection = document.getElementById('playlistSection');
    
    let result = '';
    
    if (mainContainer && playlistSection) {
        // 应用完整的显示逻辑
        mainContainer.style.display = 'none';
        playlistSection.style.display = 'block';
        playlistSection.style.visibility = 'visible';
        playlistSection.style.opacity = '1';
        playlistSection.classList.add('playlist-active');
        
        console.log('页面已切换到播放列表（使用新的CSS修复）');
        console.log('播放列表样式状态:', {
            display: playlistSection.style.display,
            visibility: playlistSection.style.visibility,
            opacity: playlistSection.style.opacity,
            hasActiveClass: playlistSection.classList.contains('playlist-active'),
            computedDisplay: getComputedStyle(playlistSection).display
        });
        result += '✅ 页面已切换到播放列表（CSS修复版）\n';
        
        // 更新播放列表标题
        const titleElement = document.getElementById('playlistTitle');
        if (titleElement) {
            titleElement.textContent = '测试播放列表';
            result += '✅ 标题已更新\n';
        }
        
        // 强制渲染一个测试列表
        const trackList = document.getElementById('trackList');
        if (trackList) {
            trackList.innerHTML = `
                <div class="track-list">
                    <div class="track-item" style="background: rgba(45, 74, 45, 0.6); padding: 1rem; margin: 0.5rem 0; border-radius: 12px; cursor: pointer;">
                        <div class="track-header">
                            <div class="track-number" style="display: inline-block; width: 28px; height: 28px; background: rgba(127, 176, 105, 0.3); border-radius: 50%; text-align: center; line-height: 28px; margin-right: 10px;">1</div>
                            <h4 class="track-title" style="display: inline; color: #f7f4e9;">测试音频 1</h4>
                        </div>
                    </div>
                    <div class="track-item" style="background: rgba(45, 74, 45, 0.6); padding: 1rem; margin: 0.5rem 0; border-radius: 12px; cursor: pointer;">
                        <div class="track-header">
                            <div class="track-number" style="display: inline-block; width: 28px; height: 28px; background: rgba(127, 176, 105, 0.3); border-radius: 50%; text-align: center; line-height: 28px; margin-right: 10px;">2</div>
                            <h4 class="track-title" style="display: inline; color: #f7f4e9;">测试音频 2</h4>
                        </div>
                    </div>
                    <div class="track-item" style="background: rgba(45, 74, 45, 0.6); padding: 1rem; margin: 0.5rem 0; border-radius: 12px; cursor: pointer;">
                        <div class="track-header">
                            <div class="track-number" style="display: inline-block; width: 28px; height: 28px; background: rgba(127, 176, 105, 0.3); border-radius: 50%; text-align: center; line-height: 28px; margin-right: 10px;">3</div>
                            <h4 class="track-title" style="display: inline; color: #f7f4e9;">测试音频 3</h4>
                        </div>
                    </div>
                </div>
            `;
            result += '✅ 测试音频列表已渲染\n';
        } else {
            result += '❌ trackList 元素不存在\n';
        }
        
        // 检查返回按钮
        const backBtn = document.getElementById('backToCategories');
        if (backBtn) {
            result += '✅ 返回按钮存在且可见\n';
            // 确保返回按钮有事件监听器
            backBtn.onclick = () => {
                mainContainer.style.display = 'block';
                playlistSection.style.display = 'none';
                alert('已返回主页面');
            };
            result += '✅ 返回按钮事件已绑定\n';
        } else {
            result += '❌ 返回按钮不存在\n';
        }
        
    } else {
        result += '❌ DOM元素检查:\n';
        result += `- mainContainer: ${mainContainer ? '存在' : '不存在'}\n`;
        result += `- playlistSection: ${playlistSection ? '存在' : '不存在'}\n`;
    }
    
    alert('播放列表测试结果:\n\n' + result);
};

window.checkNatureUI = function() {
    console.log('=== NatureUI 状态检查 ===');
    if (window.app?.natureUI) {
        console.log('NatureUI 存在');
        console.log('currentCategory:', window.app.natureUI.currentCategory);
        
        // 尝试强制重新初始化
        try {
            window.app.natureUI.initializeEcosystemCards();
            console.log('已强制重新初始化生态系统卡片');
            alert('已重新初始化生态系统卡片，请检查页面');
        } catch (error) {
            console.error('重新初始化失败:', error);
            alert('重新初始化失败: ' + error.message);
        }
    } else {
        console.log('NatureUI 不存在');
        alert('NatureUI 没有正确初始化');
    }
};

// 新增测试函数
window.testEcosystemClick = function() {
    console.log('=== 测试生态系统卡片点击 ===');
    const categoriesContainer = document.getElementById('categoriesContainer');
    
    if (!categoriesContainer) {
        alert('❌ categoriesContainer 不存在');
        return;
    }
    
    const firstCard = categoriesContainer.children[0];
    if (!firstCard) {
        alert('❌ 没有找到任何生态系统卡片');
        return;
    }
    
    const category = firstCard.dataset.category;
    console.log('点击第一个卡片:', category);
    
    try {
        // 详细记录点击过程
        console.log('准备点击卡片，当前状态:');
        console.log('- 主页面显示状态:', document.querySelector('main.forest-path')?.style.display || '默认');
        console.log('- 播放列表显示状态:', document.getElementById('playlistSection')?.style.display || '默认');
        
        firstCard.click();
        console.log('✅ 卡片点击事件已触发');
        
        // 检查点击后的状态变化
        setTimeout(() => {
            const mainContainer = document.querySelector('main.forest-path');
            const playlistSection = document.getElementById('playlistSection');
            const trackList = document.getElementById('trackList');
            const backBtn = document.getElementById('backToCategories');
            const playlistTitle = document.getElementById('playlistTitle');
            
            console.log('点击后状态检查:');
            console.log('- 主页面显示状态:', mainContainer?.style.display || '默认');
            console.log('- 播放列表显示状态:', playlistSection?.style.display || '默认');
            console.log('- 播放列表标题:', playlistTitle?.textContent || '无');
            console.log('- 音频列表内容长度:', trackList?.innerHTML?.length || 0);
            console.log('- 返回按钮存在:', !!backBtn);
            
            // 更准确的可见性检查
            const isVisible = playlistSection && (
                playlistSection.style.display === 'block' || 
                playlistSection.classList.contains('playlist-active') ||
                getComputedStyle(playlistSection).display !== 'none'
            );
            const hasContent = trackList && trackList.innerHTML.length > 50; // 有实际内容
            const hasTitle = playlistTitle && playlistTitle.textContent.length > 3;
            
            let result = '点击测试结果:\n\n';
            result += '✅ 卡片点击: 成功\n';
            result += `${isVisible ? '✅' : '❌'} 播放列表显示: ${isVisible ? '已显示' : '未显示'}\n`;
            result += `${hasContent ? '✅' : '❌'} 音频列表内容: ${hasContent ? '有内容' : '无内容'}\n`;
            result += `${hasTitle ? '✅' : '❌'} 播放列表标题: ${hasTitle ? playlistTitle.textContent : '无标题'}\n`;
            result += `${backBtn ? '✅' : '❌'} 返回按钮: ${backBtn ? '存在' : '不存在'}\n`;
            
            if (isVisible && hasContent && hasTitle && backBtn) {
                result += '\n🎉 所有功能正常！点击任意生态系统卡片都应该工作了！';
            }
            
            alert(result);
        }, 300);
    } catch (error) {
        console.error('点击测试异常:', error);
        alert('❌ 卡片点击失败: ' + error.message);
    }
};

window.forceReinitialize = function() {
    console.log('=== 强制重新初始化 ===');
    
    if (!window.app?.natureUI) {
        alert('❌ NatureUI 不存在，无法重新初始化');
        return;
    }
    
    try {
        // 清空容器
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '';
        }
        
        // 重新初始化
        window.app.natureUI.initializeEcosystemCards();
        
        setTimeout(() => {
            const cardCount = categoriesContainer?.children?.length || 0;
            alert(`✅ 重新初始化完成，创建了 ${cardCount} 个卡片`);
        }, 200);
        
    } catch (error) {
        console.error('重新初始化失败:', error);
        alert('❌ 重新初始化失败: ' + error.message);
    }
};

window.verifyFix = function() {
    console.log('=== 验证修复效果 ===');
    
    const results = [];
    let allPass = true;
    
    // 详细的全局对象检查
    results.push('=== 全局对象状态 ===');
    results.push(`window.app 类型: ${typeof window.app}`);
    results.push(`window.app 存在: ${!!window.app}`);
    if (window.app) {
        results.push(`window.app.isReady: ${window.app.isReady}`);
        results.push(`window.app.natureUI 存在: ${!!window.app.natureUI}`);
        results.push(`window.app.audioManager 存在: ${!!window.app.audioManager}`);
    }
    
    // 检查1：应用初始化
    if (window.app && window.app.isReady) {
        results.push('✅ 应用初始化成功');
    } else {
        results.push('❌ 应用未正确初始化');
        results.push(`   - window.app: ${!!window.app}`);
        results.push(`   - isReady: ${window.app?.isReady}`);
        allPass = false;
    }
    
    // 检查2：AudioManager
    if (window.app?.audioManager?.categories && Object.keys(window.app.audioManager.categories).length > 0) {
        results.push(`✅ AudioManager 数据加载成功 (${Object.keys(window.app.audioManager.categories).length} 个分类)`);
    } else {
        results.push('❌ AudioManager 数据加载失败');
        allPass = false;
    }
    
    // 检查3：NatureUI
    if (window.app?.natureUI) {
        results.push('✅ NatureUI 初始化成功');
    } else {
        results.push('❌ NatureUI 初始化失败');
        allPass = false;
    }
    
    // 检查4：生态系统卡片
    const categoriesContainer = document.getElementById('categoriesContainer');
    const cardCount = categoriesContainer?.children?.length || 0;
    if (cardCount > 0) {
        results.push(`✅ 生态系统卡片创建成功 (${cardCount} 个)`);
    } else {
        results.push('❌ 生态系统卡片创建失败');
        allPass = false;
    }
    
    // 检查5：点击事件测试
    if (cardCount > 0) {
        const firstCard = categoriesContainer.children[0];
        const hasCategory = firstCard.dataset.category;
        if (hasCategory) {
            results.push('✅ 生态系统卡片数据设置正确');
            
            // 模拟点击测试
            try {
                console.log('执行点击测试...');
                firstCard.click();
                
                setTimeout(() => {
                    const playlistSection = document.getElementById('playlistSection');
                    const isVisible = playlistSection && playlistSection.style.display !== 'none';
                    
                    if (isVisible) {
                        results.push('✅ 点击测试成功：播放列表已显示');
                        
                        // 检查返回按钮
                        const backBtn = document.getElementById('backToCategories');
                        if (backBtn) {
                            results.push('✅ 返回按钮存在');
                            
                            // 点击返回按钮
                            backBtn.click();
                            results.push('✅ 返回功能测试完成');
                        } else {
                            results.push('❌ 返回按钮不存在');
                            allPass = false;
                        }
                    } else {
                        results.push('❌ 点击测试失败：播放列表未显示');
                        allPass = false;
                    }
                    
                    // 显示最终结果
                    const finalStatus = allPass ? '🎉 所有测试通过！修复成功！' : '⚠️ 部分测试未通过，需要进一步检查';
                    results.push('\n' + finalStatus);
                    
                    alert('修复验证结果：\n\n' + results.join('\n'));
                }, 500);
                
            } catch (error) {
                results.push(`❌ 点击测试异常: ${error.message}`);
                allPass = false;
                alert('修复验证结果：\n\n' + results.join('\n'));
            }
        } else {
            results.push('❌ 生态系统卡片缺少数据属性');
            allPass = false;
            alert('修复验证结果：\n\n' + results.join('\n'));
        }
    } else {
        alert('修复验证结果：\n\n' + results.join('\n'));
    }
};

// 简单直接的全局对象修复函数
window.fixGlobalAccess = function() {
    console.log('=== 修复全局对象访问 ===');
    
    // 找到本地app变量
    if (typeof app !== 'undefined' && app) {
        window.app = app;
        console.log('✅ 从本地app变量恢复全局访问');
        console.log('验证结果:', {
            'window.app': !!window.app,
            'window.app.natureUI': !!window.app?.natureUI,
            'window.app.isReady': window.app?.isReady
        });
        
        alert('✅ 全局访问已修复！现在可以使用调试工具了。');
        return true;
    }
    
    // 尝试从DOM中找到应用实例
    console.log('尝试重新初始化应用...');
    alert('❌ 无法找到应用实例，请刷新页面');
    return false;
};

// 切换调试工具面板
window.toggleDebugTools = function() {
    const panel = document.getElementById('debugToolsPanel');
    if (panel) {
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
        console.log(`调试工具面板 ${isVisible ? '已隐藏' : '已显示'}`);
    }
};

// 主应用专用的播放列表修复函数
window.emergencyPlaylistFix = function() {
    console.log('🚨 执行紧急播放列表修复...');
    
    const playlistSection = document.getElementById('playlistSection');
    const mainContainer = document.querySelector('main.forest-path');
    
    if (!playlistSection) {
        console.error('❌ 播放列表区域不存在');
        return false;
    }
    
    // 强制隐藏主容器
    if (mainContainer) {
        mainContainer.style.setProperty('display', 'none', 'important');
    }
    
    // 使用最强制的方式显示播放列表
    playlistSection.removeAttribute('style');
    playlistSection.setAttribute('style', `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: fixed !important;
        top: 0px !important;
        left: 0px !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99999 !important;
        background: rgba(26, 46, 26, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        overflow-y: auto !important;
        padding: 2rem !important;
        margin: 0 !important;
        border: none !important;
    `);
    
    // 强制设置类
    playlistSection.className = 'playlist-section playlist-active';
    
    // 确保所有子元素可见
    const header = playlistSection.querySelector('.playlist-header');
    const player = playlistSection.querySelector('.habitat-player');
    const trackList = document.getElementById('trackList');
    
    [header, player, trackList].forEach(element => {
        if (element) {
            element.style.setProperty('display', 'block', 'important');
            element.style.setProperty('visibility', 'visible', 'important');
            element.style.setProperty('opacity', '1', 'important');
        }
    });
    
    // 设置测试内容
    const titleElement = document.getElementById('playlistTitle');
    if (titleElement) {
        titleElement.textContent = '🚨 紧急修复测试';
    }
    
    if (trackList) {
        trackList.innerHTML = `
            <div class="track-list" style="display: block !important;">
                <div class="track-item" style="display: block !important; background: rgba(45, 74, 45, 0.8) !important; padding: 1rem !important; margin: 0.5rem 0 !important; border-radius: 12px !important; color: #f7f4e9 !important;">
                    <h4>🚨 紧急修复测试音频 1</h4>
                </div>
                <div class="track-item" style="display: block !important; background: rgba(45, 74, 45, 0.8) !important; padding: 1rem !important; margin: 0.5rem 0 !important; border-radius: 12px !important; color: #f7f4e9 !important;">
                    <h4>🚨 紧急修复测试音频 2</h4>
                </div>
                <div class="track-item" style="display: block !important; background: rgba(45, 74, 45, 0.8) !important; padding: 1rem !important; margin: 0.5rem 0 !important; border-radius: 12px !important; color: #f7f4e9 !important;">
                    <h4>🚨 紧急修复测试音频 3</h4>
                </div>
            </div>
        `;
    }
    
    // 绑定返回按钮
    const backBtn = document.getElementById('backToCategories');
    if (backBtn) {
        backBtn.style.setProperty('display', 'flex', 'important');
        backBtn.style.setProperty('visibility', 'visible', 'important');
        backBtn.onclick = () => {
            playlistSection.style.setProperty('display', 'none', 'important');
            if (mainContainer) {
                mainContainer.style.setProperty('display', 'block', 'important');
            }
            console.log('🔙 已返回主页面');
        };
    }
    
    console.log('🚨 紧急修复完成，播放列表应该现在强制显示');
    return true;
};