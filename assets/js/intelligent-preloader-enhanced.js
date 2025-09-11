/**
 * 智能音频预加载器 - 增强版
 * 基于用户行为模式和网络状况智能预加载音频
 */

class IntelligentPreloaderEnhanced {
    constructor() {
        this.preloadCache = new Map();
        this.userPatterns = new Map();
        this.networkStatus = 'unknown';
        this.maxPreloadSize = 50; // MB
        this.currentPreloadSize = 0;
        this.preloadQueue = [];
        
        // 预加载策略配置
        this.strategies = {
            popular: { weight: 0.4, enabled: true },
            sequential: { weight: 0.3, enabled: true },
            userHistory: { weight: 0.3, enabled: true }
        };
        
        this.initializePreloader();
    }
    
    initializePreloader() {
        this.detectNetworkStatus();
        this.setupNetworkMonitoring();
        this.loadUserPatterns();
        this.startPreloadingCycle();
        
        console.log('🧠 智能预加载器已启动');
    }
    
    /**
     * 网络状况检测
     */
    detectNetworkStatus() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.networkStatus = connection.effectiveType || 'unknown';
            
            // 根据网络类型调整预加载策略
            switch (connection.effectiveType) {
                case 'slow-2g':
                case '2g':
                    this.maxPreloadSize = 10; // 限制为10MB
                    this.strategies.sequential.enabled = false;
                    break;
                case '3g':
                    this.maxPreloadSize = 25;
                    break;
                case '4g':
                default:
                    this.maxPreloadSize = 50;
                    break;
            }
        }
        
        console.log(`📶 网络状态: ${this.networkStatus}, 预加载限制: ${this.maxPreloadSize}MB`);
    }
    
    /**
     * 网络状况监控
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.detectNetworkStatus();
                this.adjustPreloadingStrategy();
            });
        }
        
        // 监听在线/离线状态
        window.addEventListener('online', () => {
            console.log('🌐 网络已恢复，重启预加载');
            this.resumePreloading();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 网络断开，暂停预加载');
            this.pausePreloading();
        });
    }
    
    /**
     * 用户行为模式学习
     */
    recordUserInteraction(categoryKey, fileName, action = 'play') {
        const timestamp = Date.now();
        const pattern = {
            category: categoryKey,
            file: fileName,
            action,
            timestamp,
            hour: new Date().getHours(),
            dayOfWeek: new Date().getDay()
        };
        
        // 记录用户行为
        if (!this.userPatterns.has(categoryKey)) {
            this.userPatterns.set(categoryKey, []);
        }
        
        this.userPatterns.get(categoryKey).push(pattern);
        
        // 限制历史记录数量
        if (this.userPatterns.get(categoryKey).length > 100) {
            this.userPatterns.get(categoryKey).shift();
        }
        
        this.saveUserPatterns();
        this.updatePreloadQueue();
    }
    
    /**
     * 加载用户历史模式
     */
    loadUserPatterns() {
        try {
            const stored = localStorage.getItem('audioPreloaderPatterns');
            if (stored) {
                const data = JSON.parse(stored);
                this.userPatterns = new Map(data);
                console.log('📚 已加载用户行为模式');
            }
        } catch (error) {
            console.warn('⚠️ 无法加载用户行为模式:', error);
        }
    }
    
    /**
     * 保存用户行为模式
     */
    saveUserPatterns() {
        try {
            const data = Array.from(this.userPatterns.entries());
            localStorage.setItem('audioPreloaderPatterns', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ 无法保存用户行为模式:', error);
        }
    }
    
    /**
     * 更新预加载队列
     */
    updatePreloadQueue() {
        const predictions = this.generatePredictions();
        this.preloadQueue = predictions.slice(0, 10); // 限制队列大小
        
        console.log('🎯 预测队列已更新:', this.preloadQueue.map(p => p.fileName));
    }
    
    /**
     * 生成预加载预测
     */
    generatePredictions() {
        const predictions = [];
        
        // 策略1: 热门音频
        if (this.strategies.popular.enabled) {
            const popular = this.getPopularFiles();
            popular.forEach(file => {
                predictions.push({
                    ...file,
                    score: file.playCount * this.strategies.popular.weight,
                    reason: 'popular'
                });
            });
        }
        
        // 策略2: 序列预测（用户常听的下一首）
        if (this.strategies.sequential.enabled) {
            const sequential = this.getSequentialPredictions();
            sequential.forEach(file => {
                predictions.push({
                    ...file,
                    score: file.probability * this.strategies.sequential.weight,
                    reason: 'sequential'
                });
            });
        }
        
        // 策略3: 基于用户历史
        if (this.strategies.userHistory.enabled) {
            const historical = this.getHistoricalPredictions();
            historical.forEach(file => {
                predictions.push({
                    ...file,
                    score: file.relevance * this.strategies.userHistory.weight,
                    reason: 'history'
                });
            });
        }
        
        // 排序并去重
        return predictions
            .sort((a, b) => b.score - a.score)
            .filter((file, index, arr) => 
                index === arr.findIndex(f => f.fileName === file.fileName)
            );
    }
    
    /**
     * 获取热门文件
     */
    getPopularFiles() {
        const popularity = new Map();
        
        // 统计播放次数
        for (const [category, patterns] of this.userPatterns.entries()) {
            patterns.forEach(pattern => {
                if (pattern.action === 'play') {
                    const key = `${pattern.category}/${pattern.file}`;
                    popularity.set(key, (popularity.get(key) || 0) + 1);
                }
            });
        }
        
        return Array.from(popularity.entries())
            .map(([key, count]) => {
                const [category, fileName] = key.split('/');
                return {
                    categoryKey: category,
                    fileName,
                    playCount: count
                };
            })
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 5);
    }
    
    /**
     * 获取序列预测
     */
    getSequentialPredictions() {
        const sequences = new Map();
        
        for (const [category, patterns] of this.userPatterns.entries()) {
            for (let i = 0; i < patterns.length - 1; i++) {
                const current = patterns[i];
                const next = patterns[i + 1];
                
                if (next.timestamp - current.timestamp < 600000) { // 10分钟内
                    const key = `${current.category}/${current.file}`;
                    const nextKey = `${next.category}/${next.file}`;
                    
                    if (!sequences.has(key)) {
                        sequences.set(key, new Map());
                    }
                    
                    const nextMap = sequences.get(key);
                    nextMap.set(nextKey, (nextMap.get(nextKey) || 0) + 1);
                }
            }
        }
        
        return Array.from(sequences.entries())
            .flatMap(([currentKey, nextMap]) => {
                const total = Array.from(nextMap.values()).reduce((sum, count) => sum + count, 0);
                return Array.from(nextMap.entries()).map(([nextKey, count]) => {
                    const [category, fileName] = nextKey.split('/');
                    return {
                        categoryKey: category,
                        fileName,
                        probability: count / total,
                        fromFile: currentKey
                    };
                });
            })
            .filter(pred => pred.probability > 0.2)
            .slice(0, 5);
    }
    
    /**
     * 获取历史趋势预测
     */
    getHistoricalPredictions() {
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        
        const relevantPatterns = [];
        
        for (const [category, patterns] of this.userPatterns.entries()) {
            patterns.forEach(pattern => {
                let relevance = 0;
                
                // 时间相关性
                if (Math.abs(pattern.hour - currentHour) <= 2) {
                    relevance += 0.5;
                }
                
                // 星期相关性  
                if (pattern.dayOfWeek === currentDay) {
                    relevance += 0.3;
                }
                
                // 最近使用加分
                const daysSince = (Date.now() - pattern.timestamp) / (1000 * 60 * 60 * 24);
                if (daysSince < 7) {
                    relevance += 0.2 * (7 - daysSince) / 7;
                }
                
                if (relevance > 0.3) {
                    relevantPatterns.push({
                        categoryKey: pattern.category,
                        fileName: pattern.file,
                        relevance
                    });
                }
            });
        }
        
        return relevantPatterns
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 5);
    }
    
    /**
     * 开始预加载循环
     */
    startPreloadingCycle() {
        this.preloadInterval = setInterval(() => {
            if (navigator.onLine && this.currentPreloadSize < this.maxPreloadSize) {
                this.processPreloadQueue();
            }
        }, 5000); // 每5秒检查一次
    }
    
    /**
     * 处理预加载队列
     */
    async processPreloadQueue() {
        if (this.preloadQueue.length === 0) {
            this.updatePreloadQueue();
            return;
        }
        
        const item = this.preloadQueue.shift();
        if (!item || this.preloadCache.has(item.fileName)) {
            return;
        }
        
        try {
            await this.preloadAudioFile(item);
        } catch (error) {
            console.warn(`⚠️ 预加载失败: ${item.fileName}`, error);
        }
    }
    
    /**
     * 预加载音频文件
     */
    async preloadAudioFile(item) {
        if (!window.configAdapter) {
            console.warn('⚠️ 配置适配器未就绪，跳过预加载');
            return;
        }
        
        const urls = window.configAdapter.getFallbackUrls(item.categoryKey, item.fileName);
        if (urls.length === 0) {
            return;
        }
        
        console.log(`🔄 预加载: ${item.fileName} (原因: ${item.reason})`);
        
        // 创建音频对象
        const audio = new Audio();
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('预加载超时'));
            }, 30000); // 30秒超时
            
            audio.onloadeddata = () => {
                clearTimeout(timeout);
                
                // 估算文件大小（近似）
                const loadTime = Date.now() - startTime;
                const estimatedSize = Math.max(1, loadTime / 1000 * 2); // MB
                
                this.preloadCache.set(item.fileName, {
                    audio,
                    size: estimatedSize,
                    timestamp: Date.now(),
                    reason: item.reason
                });
                
                this.currentPreloadSize += estimatedSize;
                
                console.log(`✅ 预加载完成: ${item.fileName} (~${estimatedSize.toFixed(1)}MB)`);
                resolve(audio);
            };
            
            audio.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('预加载音频失败'));
            };
            
            // 开始加载
            audio.src = urls[0];
            audio.load();
        });
    }
    
    /**
     * 获取预加载的音频
     */
    getPreloadedAudio(fileName) {
        const cached = this.preloadCache.get(fileName);
        if (cached) {
            console.log(`⚡ 使用预加载音频: ${fileName}`);
            return cached.audio;
        }
        return null;
    }
    
    /**
     * 清理过期的预加载缓存
     */
    cleanupCache() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30分钟
        
        for (const [fileName, cached] of this.preloadCache.entries()) {
            if (now - cached.timestamp > maxAge) {
                this.currentPreloadSize -= cached.size;
                this.preloadCache.delete(fileName);
                console.log(`🧹 清理过期缓存: ${fileName}`);
            }
        }
    }
    
    /**
     * 调整预加载策略
     */
    adjustPreloadingStrategy() {
        // 根据网络状况调整策略
        if (this.networkStatus === 'slow-2g' || this.networkStatus === '2g') {
            this.strategies.sequential.enabled = false;
            this.maxPreloadSize = 10;
        } else {
            this.strategies.sequential.enabled = true;
            this.maxPreloadSize = this.networkStatus === '3g' ? 25 : 50;
        }
        
        // 清理缓存以适应新限制
        if (this.currentPreloadSize > this.maxPreloadSize) {
            this.cleanupCache();
        }
    }
    
    /**
     * 暂停预加载
     */
    pausePreloading() {
        if (this.preloadInterval) {
            clearInterval(this.preloadInterval);
            this.preloadInterval = null;
        }
    }
    
    /**
     * 恢复预加载
     */
    resumePreloading() {
        if (!this.preloadInterval) {
            this.startPreloadingCycle();
        }
    }
    
    /**
     * 获取预加载统计信息
     */
    getStats() {
        return {
            cacheSize: this.preloadCache.size,
            currentSize: this.currentPreloadSize.toFixed(1) + 'MB',
            maxSize: this.maxPreloadSize + 'MB',
            queueLength: this.preloadQueue.length,
            networkStatus: this.networkStatus,
            strategies: this.strategies
        };
    }
}

// 创建全局实例
window.intelligentPreloader = new IntelligentPreloaderEnhanced();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntelligentPreloaderEnhanced;
}

console.log('🧠 智能预加载器增强版已加载');