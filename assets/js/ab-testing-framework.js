/**
 * A/B测试框架 - 声音疗愈应用第三阶段优化
 * 数据驱动的性能优化和用户体验测试
 * 目标：精准的功能对比测试，数据驱动的决策支持
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 * @version 3.1.0
 */

// 防止重复加载和声明
if (typeof window !== 'undefined' && typeof window.ABTestingFramework === 'undefined') {

    class ABTestingFramework {
        constructor() {
        // 测试配置存储
            this.experiments = new Map();
            this.userGrouping = null;
            this.testResults = new Map();
        
            // 用户识别和分组
            this.userId = this.getUserId();
            this.sessionId = Date.now().toString(36);
        
            // 测试规则配置
            this.testingRules = {
                minSampleSize: 50,      // 最小样本量
                confidenceLevel: 0.95,  // 置信水平
                statisticalPower: 0.8,  // 统计检验力
                testDuration: 7 * 24 * 60 * 60 * 1000  // 默认测试7天
            };
        
            // 预定义的实验配置
            this.predefinedExperiments = {
                preloadStrategy: {
                    name: '音频预加载策略对比',
                    description: '对比不同预加载策略的效果',
                    variants: {
                        control: { name: '原始策略', weight: 0.5 },
                        intelligent: { name: '智能预加载', weight: 0.5 }
                    },
                    metrics: ['audioLoadTime', 'userSatisfaction', 'cacheHitRate']
                },
                uiLayout: {
                    name: '界面布局优化测试',
                    description: '测试不同界面布局对用户体验的影响',
                    variants: {
                        original: { name: '原始布局', weight: 0.4 },
                        optimized: { name: '优化布局', weight: 0.6 }
                    },
                    metrics: ['clickThroughRate', 'sessionDuration', 'bounceRate']
                },
                cacheStrategy: {
                    name: '缓存策略对比',
                    description: '对比不同缓存策略的性能影响',
                    variants: {
                        aggressive: { name: '激进缓存', weight: 0.33 },
                        balanced: { name: '平衡缓存', weight: 0.33 },
                        conservative: { name: '保守缓存', weight: 0.34 }
                    },
                    metrics: ['pageLoadTime', 'cacheSize', 'networkRequests']
                }
            };
        
            // 性能指标收集器
            this.metricsCollector = {
                audioLoadTime: [],
                userSatisfaction: [],
                cacheHitRate: [],
                clickThroughRate: [],
                sessionDuration: 0,
                pageLoadTime: [],
                networkRequests: 0
            };
        
            this.initializeFramework();
        }
    
        /**
     * 初始化A/B测试框架
     */
        async initializeFramework() {
            console.log('🧪 启动A/B测试框架...');
        
            try {
            // 加载保存的实验数据
                await this.loadExperimentData();
            
                // 初始化用户分组
                this.initializeUserGrouping();
            
                // 设置指标收集
                this.setupMetricsCollection();
            
                // 启动活跃实验
                this.activateRunningExperiments();
            
                // 设置数据上报
                this.setupDataReporting();
            
                console.log('✅ A/B测试框架启动完成');
            
            } catch (error) {
                console.error('❌ A/B测试框架启动失败:', error);
            }
        }
    
        /**
     * 获取用户唯一标识
     */
        getUserId() {
            let userId = localStorage.getItem('abtest_userId');
        
            if (!userId) {
            // 生成稳定的用户ID
                userId = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
                localStorage.setItem('abtest_userId', userId);
            }
        
            return userId;
        }
    
        /**
     * 加载实验数据
     */
        async loadExperimentData() {
            try {
                const stored = localStorage.getItem('abtest_experiments');
                if (stored) {
                    const data = JSON.parse(stored);
                
                    // 恢复实验数据的Map结构
                    const experimentsData = data.experiments || [];
                    this.experiments = new Map();
                
                    for (const [experimentId, experiment] of experimentsData) {
                    // 重建实验对象的Map结构
                        const reconstructedExperiment = {
                            ...experiment,
                            participants: new Map(experiment.participants || []),
                            results: new Map(experiment.results || [])
                        };
                        this.experiments.set(experimentId, reconstructedExperiment);
                    }
                
                    this.testResults = new Map(data.testResults || []);
                
                    console.log(`📊 加载了 ${this.experiments.size} 个实验配置`);
                }
            
            } catch (error) {
                console.warn('⚠️ 实验数据加载失败:', error);
            }
        }
    
        /**
     * 初始化用户分组
     */
        initializeUserGrouping() {
        // 基于用户ID的稳定哈希分组
            this.userGrouping = this.hashUser(this.userId);
        
            console.log(`👥 用户分组: ${this.userGrouping} (ID: ${this.userId})`);
        }
    
        /**
     * 用户哈希函数，确保稳定分组
     */
        hashUser(userId) {
            let hash = 0;
            for (let i = 0; i < userId.length; i++) {
                const char = userId.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 转为32位整数
            }
            return Math.abs(hash);
        }
    
        /**
     * 创建新实验
     */
        createExperiment(experimentId, config) {
            const experiment = {
                id: experimentId,
                name: config.name || experimentId,
                description: config.description || '',
                variants: config.variants || {},
                metrics: config.metrics || [],
                startDate: config.startDate || Date.now(),
                endDate: config.endDate || (Date.now() + this.testingRules.testDuration),
                status: 'active',
                participants: new Map(),
                results: new Map()
            };
        
            // 验证变体权重总和为1
            const totalWeight = Object.values(experiment.variants).reduce((sum, variant) => sum + (variant.weight || 0), 0);
            if (Math.abs(totalWeight - 1) > 0.01) {
                throw new Error(`实验 ${experimentId} 的变体权重总和必须为1，当前为: ${totalWeight}`);
            }
        
            this.experiments.set(experimentId, experiment);
        
            console.log(`🧪 创建实验: ${experiment.name}`);
        
            return experiment;
        }
    
        /**
     * 为用户分配实验变体
     */
        getVariantForUser(experimentId) {
            const experiment = this.experiments.get(experimentId);
            if (!experiment || experiment.status !== 'active') {
                return null;
            }
        
            // 检查实验是否已过期
            if (Date.now() > experiment.endDate) {
                this.stopExperiment(experimentId);
                return null;
            }
        
            // 检查用户是否已经分组
            if (experiment.participants.has(this.userId)) {
                return experiment.participants.get(this.userId);
            }
        
            // 基于用户哈希值分配变体
            const userHash = this.hashUser(this.userId + experimentId) / Math.pow(2, 32);
            let cumulativeWeight = 0;
        
            for (const [variantId, variant] of Object.entries(experiment.variants)) {
                cumulativeWeight += variant.weight;
                if (userHash < cumulativeWeight) {
                // 分配到该变体
                    experiment.participants.set(this.userId, variantId);
                
                    console.log(`🎲 用户分配到实验 ${experimentId} 的变体: ${variant.name}`);
                
                    return variantId;
                }
            }
        
            // 兜底：分配到最后一个变体
            const variants = Object.keys(experiment.variants);
            const lastVariant = variants[variants.length - 1];
            experiment.participants.set(this.userId, lastVariant);
        
            return lastVariant;
        }
    
        /**
     * 获取功能变体（用于代码中的条件判断）
     */
        getFeatureVariant(featureName) {
        // 查找包含该功能的活跃实验
            for (const [experimentId, experiment] of this.experiments.entries()) {
                if (experiment.status === 'active' && experiment.name.toLowerCase().includes(featureName.toLowerCase())) {
                    return this.getVariantForUser(experimentId);
                }
            }
        
            return null; // 没有相关实验，使用默认行为
        }
    
        /**
     * 设置指标收集
     */
        setupMetricsCollection() {
        // 监听性能指标事件
            document.addEventListener('performanceMetric', (event) => {
                this.recordMetric(event.detail.metric, event.detail.value);
            });
        
            // 监听用户交互事件
            document.addEventListener('click', (event) => {
                this.recordUserInteraction(event);
            });
        
            // 页面加载时间
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.recordMetric('pageLoadTime', loadTime);
            });
        
            // 会话时长追踪
            this.sessionStartTime = Date.now();
        
            window.addEventListener('beforeunload', () => {
                const sessionDuration = Date.now() - this.sessionStartTime;
                this.recordMetric('sessionDuration', sessionDuration);
                this.saveExperimentData();
            });
        
            console.log('📊 指标收集器已启动');
        }
    
        /**
     * 记录指标数据
     */
        recordMetric(metricName, value, experimentId = null) {
            const metricData = {
                timestamp: Date.now(),
                sessionId: this.sessionId,
                value: value,
                experimentId: experimentId
            };
        
            // 存储到本地收集器
            if (this.metricsCollector[metricName]) {
                if (Array.isArray(this.metricsCollector[metricName])) {
                    this.metricsCollector[metricName].push(metricData);
                } else {
                    this.metricsCollector[metricName] = value;
                }
            }
        
            // 关联到相关实验
            this.experiments.forEach((experiment, expId) => {
                if (experiment.status === 'active' && experiment.metrics.includes(metricName)) {
                    const userVariant = experiment.participants.get(this.userId);
                    if (userVariant) {
                        if (!experiment.results.has(userVariant)) {
                            experiment.results.set(userVariant, {});
                        }
                    
                        const variantResults = experiment.results.get(userVariant);
                        if (!variantResults[metricName]) {
                            variantResults[metricName] = [];
                        }
                    
                        variantResults[metricName].push(metricData);
                    }
                }
            });
        
            console.log(`📊 记录指标: ${metricName} = ${value}`);
        }
    
        /**
     * 记录用户交互
     */
        recordUserInteraction(event) {
            const target = event.target;
            const interaction = {
                timestamp: Date.now(),
                element: target.tagName,
                className: target.className,
                id: target.id
            };
        
            // 点击率相关指标
            if (target.closest('.ecosystem-card') || target.closest('button')) {
                this.recordMetric('clickThroughRate', 1);
            }
        }
    
        /**
     * 激活运行中的实验
     */
        activateRunningExperiments() {
        // 启动预定义实验（如果尚未运行）
            Object.entries(this.predefinedExperiments).forEach(([expId, config]) => {
                if (!this.experiments.has(expId)) {
                    this.createExperiment(expId, config);
                }
            });
        
            console.log(`🚀 激活 ${this.experiments.size} 个实验`);
        }
    
        /**
     * 停止实验
     */
        stopExperiment(experimentId) {
            const experiment = this.experiments.get(experimentId);
            if (experiment) {
                experiment.status = 'stopped';
                experiment.endDate = Date.now();
            
                console.log(`⏹️ 实验已停止: ${experiment.name}`);
            }
        }
    
        /**
     * 分析实验结果
     */
        analyzeExperiment(experimentId) {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) {
                return null;
            }
        
            const analysis = {
                experimentId: experimentId,
                name: experiment.name,
                duration: experiment.endDate - experiment.startDate,
                participants: experiment.participants.size,
                variants: {},
                recommendations: []
            };
        
            // 分析每个变体
            Object.keys(experiment.variants).forEach(variantId => {
                const variantData = experiment.results.get(variantId) || {};
                const variantAnalysis = {
                    participants: Array.from(experiment.participants.values()).filter(v => v === variantId).length,
                    metrics: {}
                };
            
                // 计算每个指标的统计数据
                experiment.metrics.forEach(metricName => {
                    const metricData = variantData[metricName] || [];
                    if (metricData.length > 0) {
                        const values = metricData.map(d => d.value);
                        variantAnalysis.metrics[metricName] = {
                            count: values.length,
                            mean: values.reduce((a, b) => a + b, 0) / values.length,
                            median: this.calculateMedian(values),
                            stdDev: this.calculateStdDev(values)
                        };
                    }
                });
            
                analysis.variants[variantId] = variantAnalysis;
            });
        
            // 生成建议
            analysis.recommendations = this.generateRecommendations(analysis);
        
            console.log(`📈 实验分析完成: ${experiment.name}`, analysis);
        
            return analysis;
        }
    
        /**
     * 计算中位数
     */
        calculateMedian(values) {
            const sorted = values.slice().sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
        
            return sorted.length % 2 !== 0 
                ? sorted[mid] 
                : (sorted[mid - 1] + sorted[mid]) / 2;
        }
    
        /**
     * 计算标准差
     */
        calculateStdDev(values) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
            return Math.sqrt(variance);
        }
    
        /**
     * 生成优化建议
     */
        generateRecommendations(analysis) {
            const recommendations = [];
        
            // 检查样本量充足性
            if (analysis.participants < this.testingRules.minSampleSize) {
                recommendations.push({
                    type: 'warning',
                    message: `样本量过小 (${analysis.participants})，建议至少 ${this.testingRules.minSampleSize} 个样本`
                });
            }
        
            // 比较变体性能
            const variants = Object.entries(analysis.variants);
            if (variants.length >= 2) {
                variants.forEach(([variantId, variant]) => {
                    if (variant.participants > 0) {
                        recommendations.push({
                            type: 'info',
                            message: `变体 ${variantId}: ${variant.participants} 个参与者，关键指标表现分析已生成`
                        });
                    }
                });
            }
        
            return recommendations;
        }
    
        /**
     * 设置数据上报
     */
        setupDataReporting() {
        // 定期保存实验数据
            setInterval(() => {
                this.saveExperimentData();
            }, 5 * 60 * 1000); // 每5分钟保存一次
        
            // 页面可见性变化时保存数据
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.saveExperimentData();
                }
            });
        }
    
        /**
     * 保存实验数据
     */
        saveExperimentData() {
            try {
            // 序列化实验数据，将Map对象转换为可序列化的格式
                const experimentsToSave = Array.from(this.experiments.entries()).map(([id, experiment]) => {
                    return [id, {
                        ...experiment,
                        participants: Array.from(experiment.participants.entries()),
                        results: Array.from(experiment.results.entries())
                    }];
                });
            
                const dataToSave = {
                    experiments: experimentsToSave,
                    testResults: Array.from(this.testResults.entries()),
                    metricsCollector: this.metricsCollector,
                    lastUpdate: Date.now()
                };
            
                localStorage.setItem('abtest_experiments', JSON.stringify(dataToSave));
                console.log('💾 实验数据已保存');
            
            } catch (error) {
                console.warn('⚠️ 保存实验数据失败:', error);
            }
        }
    
        /**
     * 获取A/B测试报告
     */
        getABTestReport() {
            const activeExperiments = Array.from(this.experiments.entries())
                .filter(([, exp]) => exp.status === 'active');
        
            const stoppedExperiments = Array.from(this.experiments.entries())
                .filter(([, exp]) => exp.status === 'stopped');
        
            return {
                framework: {
                    userId: this.userId,
                    sessionId: this.sessionId,
                    userGroup: this.userGrouping
                },
                experiments: {
                    active: activeExperiments.length,
                    stopped: stoppedExperiments.length,
                    total: this.experiments.size
                },
                currentVariants: this.getCurrentVariants(),
                metrics: this.getMetricsSummary(),
                activeTests: activeExperiments.map(([id, exp]) => ({
                    id,
                    name: exp.name,
                    participants: exp.participants.size,
                    daysRunning: Math.ceil((Date.now() - exp.startDate) / (24 * 60 * 60 * 1000))
                }))
            };
        }
    
        /**
     * 获取当前用户的变体分配
     */
        getCurrentVariants() {
            const variants = {};
        
            this.experiments.forEach((experiment, experimentId) => {
                if (experiment.status === 'active') {
                    const variant = experiment.participants.get(this.userId);
                    if (variant) {
                        variants[experimentId] = {
                            variant: variant,
                            name: experiment.variants[variant]?.name || variant
                        };
                    }
                }
            });
        
            return variants;
        }
    
        /**
     * 获取指标摘要
     */
        getMetricsSummary() {
            const summary = {};
        
            Object.entries(this.metricsCollector).forEach(([metric, data]) => {
                if (Array.isArray(data)) {
                    summary[metric] = {
                        count: data.length,
                        latest: data.length > 0 ? data[data.length - 1].value : null
                    };
                } else {
                    summary[metric] = { value: data };
                }
            });
        
            return summary;
        }
    
        /**
     * 手动触发功能测试
     */
        triggerFeatureTest(featureName, data = {}) {
            const variant = this.getFeatureVariant(featureName);
        
            if (variant) {
            // 记录功能使用
                this.recordMetric('featureUsage', 1, featureName);
            
                // 返回变体配置
                console.log(`🧪 功能测试触发: ${featureName} -> ${variant}`);
                return variant;
            }
        
            return 'control'; // 默认控制组
        }
    
        /**
     * 重置所有实验数据
     */
        resetAllExperiments() {
            this.experiments.clear();
            this.testResults.clear();
            this.metricsCollector = {
                audioLoadTime: [],
                userSatisfaction: [],
                cacheHitRate: [],
                clickThroughRate: [],
                sessionDuration: 0,
                pageLoadTime: [],
                networkRequests: 0
            };
        
            localStorage.removeItem('abtest_experiments');
        
            console.log('🔄 所有实验数据已重置');
        }
    }

    // 将ABTestingFramework类添加到window对象以便全局访问
    if (typeof window !== 'undefined') {
        window.ABTestingFramework = ABTestingFramework;
        console.log('✅ ABTestingFramework类定义已加载');
    }

} // 结束 ABTestingFramework 类定义检查

// 创建全局实例（只创建一次）
if (typeof window !== 'undefined' && !window.abTestFramework && typeof window.ABTestingFramework !== 'undefined') {
    window.abTestFramework = new window.ABTestingFramework();

    // 导出API给其他模块使用
    window.getFeatureVariant = (featureName) => window.abTestFramework.getFeatureVariant(featureName);
    window.recordABMetric = (metric, value) => window.abTestFramework.recordMetric(metric, value);
    window.getABTestReport = () => window.abTestFramework.getABTestReport();
    window.analyzeExperiment = (experimentId) => window.abTestFramework.analyzeExperiment(experimentId);

    console.log('🚀 A/B测试框架加载完成');
} else if (typeof window !== 'undefined' && window.abTestFramework) {
    console.log('✅ A/B测试框架实例已存在，跳过创建');
}