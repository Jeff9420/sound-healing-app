/**
 * 智能音频预加载系统 - 声音疗愈应用第三阶段优化
 * 基于用户行为学习的预测性音频加载
 * 目标：预测准确率85%+，用户体验无缝化
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 * @version 3.0.0
 */

class IntelligentAudioPreloader {
    constructor() {
        // 用户行为数据存储
        this.userBehavior = {
            playHistory: [],
            timePatterns: new Map(),
            categoryPreferences: new Map(),
            sequencePatterns: new Map(),
            sessionData: {
                startTime: Date.now(),
                actions: [],
                preferences: {}
            }
        };
        
        // 预测模型配置
        this.predictionModel = {
            weights: {
                timeOfDay: 0.25,        // 时间段偏好权重
                categoryHistory: 0.30,   // 分类历史权重
                sequencePattern: 0.25,   // 播放序列权重
                recentBehavior: 0.20    // 近期行为权重
            },
            thresholds: {
                preloadConfidence: 0.6,  // 预加载置信度阈值
                learningMinSamples: 10   // 学习最小样本数
            }
        };
        
        // 预加载状态管理
        this.preloadQueue = new Map();
        this.preloadCache = new Map();
        this.loadingPromises = new Map();
        
        // 性能指标
        this.metrics = {
            predictions: 0,
            hits: 0,
            misses: 0,
            preloadSavings: 0,
            accuracy: 0
        };
        
        this.initializeSystem();
    }
    
    /**
     * 初始化智能预加载系统
     */
    async initializeSystem() {
        console.log('🧠 启动智能音频预加载系统...');
        
        try {
            // 加载历史行为数据
            await this.loadUserBehaviorHistory();
            
            // 初始化行为监听
            this.setupBehaviorTracking();
            
            // 初始化预测引擎
            this.initializePredictionEngine();
            
            // 启动周期性分析
            this.startPeriodicAnalysis();
            
            console.log('✅ 智能预加载系统启动完成');
            
        } catch (error) {
            console.error('❌ 智能预加载系统启动失败:', error);
        }
    }
    
    /**
     * 加载用户历史行为数据
     */
    async loadUserBehaviorHistory() {
        try {
            const stored = localStorage.getItem('audioPreloader_userBehavior');
            if (stored) {
                const data = JSON.parse(stored);
                
                // 合并历史数据，保持Map结构
                this.userBehavior.playHistory = data.playHistory || [];
                this.userBehavior.timePatterns = new Map(data.timePatterns || []);
                this.userBehavior.categoryPreferences = new Map(data.categoryPreferences || []);
                this.userBehavior.sequencePatterns = new Map(data.sequencePatterns || []);
                
                console.log(`📊 加载历史行为数据: ${this.userBehavior.playHistory.length}条播放记录`);
            }
            
        } catch (error) {
            console.warn('⚠️ 历史数据加载失败:', error);
        }
    }
    
    /**
     * 设置用户行为跟踪
     */
    setupBehaviorTracking() {
        // 监听音频播放事件
        document.addEventListener('audioPlayStart', (event) => {
            this.recordPlayEvent(event.detail);
        });
        
        // 监听分类选择事件
        document.addEventListener('categorySelect', (event) => {
            this.recordCategorySelection(event.detail);
        });
        
        // 监听播放完成事件
        document.addEventListener('audioPlayComplete', (event) => {
            this.recordPlayCompletion(event.detail);
        });
        
        // 监听用户交互模式
        document.addEventListener('click', (event) => {
            this.recordUserInteraction(event);
        });
        
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            this.saveUserBehaviorData();
        });
        
        console.log('👂 用户行为跟踪已启动');
    }
    
    /**
     * 记录播放事件
     */
    recordPlayEvent(details) {
        const now = Date.now();
        const timeOfDay = this.getTimeOfDayCategory(now);
        
        const playRecord = {
            timestamp: now,
            category: details.category,
            fileName: details.fileName,
            timeOfDay: timeOfDay,
            duration: details.duration || 0,
            sessionId: this.userBehavior.sessionData.startTime
        };
        
        // 添加到历史记录
        this.userBehavior.playHistory.push(playRecord);
        
        // 限制历史记录长度
        if (this.userBehavior.playHistory.length > 200) {
            this.userBehavior.playHistory = this.userBehavior.playHistory.slice(-200);
        }
        
        // 更新时间模式
        this.updateTimePatterns(timeOfDay, details.category);
        
        // 更新分类偏好
        this.updateCategoryPreferences(details.category);
        
        // 更新序列模式
        this.updateSequencePatterns(details.category);
        
        // 触发预测
        this.triggerPrediction();
        
        console.log(`🎵 记录播放事件: ${details.category}/${details.fileName}`);
    }
    
    /**
     * 获取时间段分类
     */
    getTimeOfDayCategory(timestamp) {
        const hour = new Date(timestamp).getHours();
        
        if (hour >= 6 && hour < 12) {
            return 'morning';
        }
        if (hour >= 12 && hour < 18) {
            return 'afternoon';
        }
        if (hour >= 18 && hour < 22) {
            return 'evening';
        }
        return 'night';
    }
    
    /**
     * 更新时间模式数据
     */
    updateTimePatterns(timeOfDay, category) {
        const key = `${timeOfDay}_${category}`;
        const current = this.userBehavior.timePatterns.get(key) || { count: 0, weight: 0 };
        
        current.count++;
        current.weight = Math.min(current.count * 0.1, 1.0);
        
        this.userBehavior.timePatterns.set(key, current);
    }
    
    /**
     * 更新分类偏好
     */
    updateCategoryPreferences(category) {
        const current = this.userBehavior.categoryPreferences.get(category) || { 
            count: 0, 
            score: 0,
            lastPlayed: 0
        };
        
        current.count++;
        current.lastPlayed = Date.now();
        // 计算偏好得分（结合频率和时间衰减）
        current.score = current.count * Math.exp(-(Date.now() - current.lastPlayed) / (7 * 24 * 60 * 60 * 1000));
        
        this.userBehavior.categoryPreferences.set(category, current);
    }
    
    /**
     * 更新播放序列模式
     */
    updateSequencePatterns(category) {
        const recentPlays = this.userBehavior.playHistory.slice(-5).map(p => p.category);
        
        if (recentPlays.length >= 2) {
            const sequence = recentPlays.slice(-2).join(' -> ');
            const current = this.userBehavior.sequencePatterns.get(sequence) || { count: 0, confidence: 0 };
            
            current.count++;
            current.confidence = Math.min(current.count / 10, 1.0);
            
            this.userBehavior.sequencePatterns.set(sequence, current);
        }
    }
    
    /**
     * 记录分类选择
     */
    recordCategorySelection(details) {
        this.userBehavior.sessionData.actions.push({
            type: 'category_select',
            category: details.category,
            timestamp: Date.now()
        });
    }
    
    /**
     * 记录用户交互
     */
    recordUserInteraction(event) {
        // 简化的交互记录，避免过度跟踪
        const target = event.target.closest('.ecosystem-card') || event.target.closest('.track-item');
        if (target) {
            this.userBehavior.sessionData.actions.push({
                type: 'ui_interaction',
                element: target.className,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * 初始化预测引擎
     */
    initializePredictionEngine() {
        // 如果有足够的历史数据，开始预测
        if (this.userBehavior.playHistory.length >= this.predictionModel.thresholds.learningMinSamples) {
            this.trainPredictionModel();
        }
        
        console.log('🔮 预测引擎已初始化');
    }
    
    /**
     * 训练预测模型
     */
    trainPredictionModel() {
        console.log('📈 开始训练预测模型...');
        
        // 分析时间模式权重
        this.analyzeTimePatterns();
        
        // 分析分类偏好权重
        this.analyzeCategoryPreferences();
        
        // 分析序列模式权重
        this.analyzeSequencePatterns();
        
        console.log('✅ 预测模型训练完成');
    }
    
    /**
     * 分析时间模式
     */
    analyzeTimePatterns() {
        const currentTimeCategory = this.getTimeOfDayCategory(Date.now());
        const relevantPatterns = Array.from(this.userBehavior.timePatterns.entries())
            .filter(([key]) => key.startsWith(currentTimeCategory));
        
        // 更新时间模式权重
        relevantPatterns.forEach(([key, data]) => {
            const category = key.split('_')[1];
            if (this.userBehavior.categoryPreferences.has(category)) {
                const categoryData = this.userBehavior.categoryPreferences.get(category);
                categoryData.timeWeight = data.weight;
                this.userBehavior.categoryPreferences.set(category, categoryData);
            }
        });
    }
    
    /**
     * 分析分类偏好
     */
    analyzeCategoryPreferences() {
        const totalPlays = this.userBehavior.playHistory.length;
        
        this.userBehavior.categoryPreferences.forEach((data, category) => {
            // 计算相对频率
            data.frequency = data.count / totalPlays;
            
            // 计算时间衰减分数
            const daysSinceLastPlay = (Date.now() - data.lastPlayed) / (24 * 60 * 60 * 1000);
            data.recencyScore = Math.exp(-daysSinceLastPlay / 7); // 7天半衰期
            
            this.userBehavior.categoryPreferences.set(category, data);
        });
    }
    
    /**
     * 分析序列模式
     */
    analyzeSequencePatterns() {
        // 获取最近播放的分类
        const recentPlays = this.userBehavior.playHistory.slice(-3).map(p => p.category);
        
        if (recentPlays.length >= 1) {
            const lastCategory = recentPlays[recentPlays.length - 1];
            
            // 查找以当前分类开始的序列模式
            this.userBehavior.sequencePatterns.forEach((data, sequence) => {
                if (sequence.startsWith(lastCategory + ' -> ')) {
                    const nextCategory = sequence.split(' -> ')[1];
                    
                    if (this.userBehavior.categoryPreferences.has(nextCategory)) {
                        const categoryData = this.userBehavior.categoryPreferences.get(nextCategory);
                        categoryData.sequenceWeight = data.confidence;
                        this.userBehavior.categoryPreferences.set(nextCategory, categoryData);
                    }
                }
            });
        }
    }
    
    /**
     * 触发智能预测
     */
    async triggerPrediction() {
        if (this.userBehavior.playHistory.length < this.predictionModel.thresholds.learningMinSamples) {
            return;
        }
        
        const predictions = this.generatePredictions();
        await this.executePredictions(predictions);
    }
    
    /**
     * 生成预测结果
     */
    generatePredictions() {
        const predictions = [];
        const currentTime = this.getTimeOfDayCategory(Date.now());
        
        this.userBehavior.categoryPreferences.forEach((data, category) => {
            let confidence = 0;
            
            // 时间模式权重
            confidence += (data.timeWeight || 0) * this.predictionModel.weights.timeOfDay;
            
            // 分类历史权重
            confidence += (data.frequency || 0) * this.predictionModel.weights.categoryHistory;
            
            // 序列模式权重
            confidence += (data.sequenceWeight || 0) * this.predictionModel.weights.sequencePattern;
            
            // 近期行为权重
            confidence += (data.recencyScore || 0) * this.predictionModel.weights.recentBehavior;
            
            if (confidence >= this.predictionModel.thresholds.preloadConfidence) {
                predictions.push({
                    category: category,
                    confidence: confidence,
                    reason: this.generatePredictionReason(data)
                });
            }
        });
        
        // 按置信度排序
        predictions.sort((a, b) => b.confidence - a.confidence);
        
        this.metrics.predictions += predictions.length;
        
        console.log(`🔮 生成 ${predictions.length} 个预测:`, predictions);
        
        return predictions.slice(0, 3); // 最多预加载3个分类
    }
    
    /**
     * 生成预测原因说明
     */
    generatePredictionReason(data) {
        const reasons = [];
        
        if (data.frequency > 0.2) {
            reasons.push('高频播放');
        }
        if (data.recencyScore > 0.8) {
            reasons.push('最近常听');
        }
        if (data.timeWeight > 0.5) {
            reasons.push('时间段偏好');
        }
        if (data.sequenceWeight > 0.6) {
            reasons.push('播放序列模式');
        }
        
        return reasons.join(', ') || '综合分析';
    }
    
    /**
     * 执行预测预加载
     */
    async executePredictions(predictions) {
        for (const prediction of predictions) {
            if (!this.preloadQueue.has(prediction.category)) {
                this.preloadQueue.set(prediction.category, {
                    confidence: prediction.confidence,
                    reason: prediction.reason,
                    timestamp: Date.now()
                });
                
                // 异步执行预加载
                this.preloadCategory(prediction.category, prediction.confidence);
            }
        }
    }
    
    /**
     * 预加载指定分类
     */
    async preloadCategory(category, confidence) {
        if (this.loadingPromises.has(category)) {
            return this.loadingPromises.get(category);
        }
        
        console.log(`⚡ 智能预加载分类: ${category} (置信度: ${confidence.toFixed(2)})`);
        
        const loadingPromise = this.performCategoryPreload(category, confidence);
        this.loadingPromises.set(category, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.preloadCache.set(category, {
                data: result,
                loadTime: Date.now(),
                confidence: confidence
            });
            
            console.log(`✅ 预加载完成: ${category}`);
            
        } catch (error) {
            console.warn(`⚠️ 预加载失败: ${category}`, error);
        } finally {
            this.loadingPromises.delete(category);
        }
    }
    
    /**
     * 执行分类预加载
     */
    async performCategoryPreload(category, confidence) {
        // 集成现有的音频懒加载系统
        if (window.audioLazyLoader) {
            const startTime = performance.now();
            
            // 根据置信度决定预加载数量
            const preloadCount = Math.ceil(confidence * 5); // 最多5个文件
            
            await window.audioLazyLoader.lazyLoadCategory(category, 0, preloadCount);
            
            const loadTime = performance.now() - startTime;
            this.metrics.preloadSavings += loadTime;
            
            return { loadTime, filesPreloaded: preloadCount };
        }
        
        throw new Error('音频懒加载系统未就绪');
    }
    
    /**
     * 验证预测准确性
     */
    validatePrediction(actualCategory) {
        if (this.preloadQueue.has(actualCategory)) {
            this.metrics.hits++;
            const preloadData = this.preloadQueue.get(actualCategory);
            
            console.log(`🎯 预测命中: ${actualCategory} (原因: ${preloadData.reason})`);
            
            // 清除已使用的预加载
            this.preloadQueue.delete(actualCategory);
            
            return true;
        } else {
            this.metrics.misses++;
            console.log(`❌ 预测失误: ${actualCategory}`);
            return false;
        }
    }
    
    /**
     * 启动周期性分析
     */
    startPeriodicAnalysis() {
        // 每5分钟重新训练模型
        setInterval(() => {
            if (this.userBehavior.playHistory.length >= this.predictionModel.thresholds.learningMinSamples) {
                this.trainPredictionModel();
            }
        }, 5 * 60 * 1000);
        
        // 每10分钟清理过期预加载
        setInterval(() => {
            this.cleanupExpiredPreloads();
        }, 10 * 60 * 1000);
        
        // 每小时保存用户数据
        setInterval(() => {
            this.saveUserBehaviorData();
        }, 60 * 60 * 1000);
    }
    
    /**
     * 清理过期预加载
     */
    cleanupExpiredPreloads() {
        const now = Date.now();
        const expireTime = 10 * 60 * 1000; // 10分钟过期
        
        this.preloadQueue.forEach((data, category) => {
            if (now - data.timestamp > expireTime) {
                this.preloadQueue.delete(category);
                console.log(`🧹 清理过期预加载: ${category}`);
            }
        });
        
        this.preloadCache.forEach((data, category) => {
            if (now - data.loadTime > expireTime) {
                this.preloadCache.delete(category);
                console.log(`🧹 清理过期缓存: ${category}`);
            }
        });
    }
    
    /**
     * 保存用户行为数据
     */
    saveUserBehaviorData() {
        try {
            const dataToSave = {
                playHistory: this.userBehavior.playHistory,
                timePatterns: Array.from(this.userBehavior.timePatterns.entries()),
                categoryPreferences: Array.from(this.userBehavior.categoryPreferences.entries()),
                sequencePatterns: Array.from(this.userBehavior.sequencePatterns.entries())
            };
            
            localStorage.setItem('audioPreloader_userBehavior', JSON.stringify(dataToSave));
            console.log('💾 用户行为数据已保存');
            
        } catch (error) {
            console.warn('⚠️ 保存用户行为数据失败:', error);
        }
    }
    
    /**
     * 获取智能预加载报告
     */
    getIntelligenceReport() {
        this.metrics.accuracy = this.metrics.hits + this.metrics.misses > 0 
            ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100).toFixed(2)
            : 0;
        
        return {
            learningStatus: this.userBehavior.playHistory.length >= this.predictionModel.thresholds.learningMinSamples 
                ? 'active' : 'learning',
            behaviorData: {
                totalPlays: this.userBehavior.playHistory.length,
                trackedCategories: this.userBehavior.categoryPreferences.size,
                timePatterns: this.userBehavior.timePatterns.size,
                sequencePatterns: this.userBehavior.sequencePatterns.size
            },
            predictions: {
                total: this.metrics.predictions,
                accuracy: this.metrics.accuracy + '%',
                hits: this.metrics.hits,
                misses: this.metrics.misses
            },
            performance: {
                preloadSavings: this.metrics.preloadSavings.toFixed(2) + 'ms',
                activePreloads: this.preloadQueue.size,
                cachedCategories: this.preloadCache.size
            },
            topCategories: this.getTopCategories(),
            timePreferences: this.getTimePreferences()
        };
    }
    
    /**
     * 获取用户最喜欢的分类
     */
    getTopCategories() {
        return Array.from(this.userBehavior.categoryPreferences.entries())
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 5)
            .map(([category, data]) => ({
                category,
                score: data.score.toFixed(2),
                frequency: ((data.frequency || 0) * 100).toFixed(1) + '%'
            }));
    }
    
    /**
     * 获取时间偏好分析
     */
    getTimePreferences() {
        const timeAnalysis = {};
        
        this.userBehavior.timePatterns.forEach((data, key) => {
            const [timeOfDay, category] = key.split('_');
            if (!timeAnalysis[timeOfDay]) {
                timeAnalysis[timeOfDay] = [];
            }
            timeAnalysis[timeOfDay].push({
                category,
                weight: data.weight.toFixed(2),
                count: data.count
            });
        });
        
        // 排序每个时间段的分类
        Object.keys(timeAnalysis).forEach(timeOfDay => {
            timeAnalysis[timeOfDay].sort((a, b) => b.weight - a.weight);
            timeAnalysis[timeOfDay] = timeAnalysis[timeOfDay].slice(0, 3);
        });
        
        return timeAnalysis;
    }
    
    /**
     * 手动重置学习数据
     */
    resetLearningData() {
        this.userBehavior.playHistory = [];
        this.userBehavior.timePatterns.clear();
        this.userBehavior.categoryPreferences.clear();
        this.userBehavior.sequencePatterns.clear();
        
        this.metrics = {
            predictions: 0,
            hits: 0,
            misses: 0,
            preloadSavings: 0,
            accuracy: 0
        };
        
        localStorage.removeItem('audioPreloader_userBehavior');
        
        console.log('🔄 学习数据已重置');
    }
}

// 创建全局实例
window.intelligentPreloader = new IntelligentAudioPreloader();

// 导出API给其他模块使用
window.getIntelligenceReport = () => window.intelligentPreloader.getIntelligenceReport();
window.validatePrediction = (category) => window.intelligentPreloader.validatePrediction(category);

// 集成到现有音频播放事件中
document.addEventListener('audioPlayStart', (event) => {
    if (event.detail && event.detail.category) {
        window.intelligentPreloader.validatePrediction(event.detail.category);
    }
});

console.log('🚀 智能音频预加载系统加载完成');