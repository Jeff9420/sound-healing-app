/**
 * 用户行为学习系统 - 声音疗愈应用第三阶段优化
 * 深度学习用户偏好，智能推荐和个性化体验
 * 目标：用户满意度提升50%+，个性化准确率90%+
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 * @version 3.3.0
 */

class UserBehaviorLearningSystem {
    constructor() {
        // 用户行为数据结构
        this.userData = {
            profile: {
                id: this.generateUserId(),
                creationTime: Date.now(),
                preferences: new Map(),
                personalityTraits: new Map(),
                usagePatterns: new Map()
            },
            sessions: [],
            interactions: [],
            preferences: {
                audio: new Map(),
                ui: new Map(),
                timing: new Map(),
                social: new Map()
            },
            learning: {
                models: new Map(),
                predictions: new Map(),
                feedbackLoop: []
            }
        };
        
        // 学习模型配置
        this.learningModels = {
            audioPreference: {
                name: '音频偏好模型',
                features: ['category', 'duration', 'volume', 'time_of_day', 'mood'],
                algorithm: 'weighted_collaborative_filtering',
                confidence: 0.0,
                lastUpdate: null
            },
            usagePattern: {
                name: '使用模式模型', 
                features: ['session_duration', 'frequency', 'time_patterns', 'interaction_depth'],
                algorithm: 'temporal_clustering',
                confidence: 0.0,
                lastUpdate: null
            },
            personalityProfile: {
                name: '个性化档案模型',
                features: ['music_taste', 'exploration_level', 'routine_preference', 'feedback_style'],
                algorithm: 'trait_analysis',
                confidence: 0.0,
                lastUpdate: null
            }
        };
        
        // 推荐系统配置
        this.recommendationEngine = {
            strategies: {
                content_based: { weight: 0.4, active: true },
                collaborative: { weight: 0.3, active: false }, // 需要多用户数据
                hybrid: { weight: 0.3, active: true }
            },
            minConfidence: 0.6,
            maxRecommendations: 8,
            diversityFactor: 0.3
        };
        
        // 个性化设置
        this.personalization = {
            uiAdaptation: {
                theme: 'auto',
                layout: 'adaptive',
                complexity: 'auto'
            },
            audioSettings: {
                defaultVolume: 0.7,
                preferredDuration: 'auto',
                autoplay: false
            },
            notifications: {
                enabled: true,
                timing: 'smart',
                frequency: 'balanced'
            }
        };
        
        this.initializeLearningSystem();
    }
    
    /**
     * 初始化学习系统
     */
    async initializeLearningSystem() {
        console.log('🧠 启动用户行为学习系统...');
        
        try {
            // 加载历史数据
            await this.loadUserData();
            
            // 初始化行为追踪
            this.setupBehaviorTracking();
            
            // 启动学习引擎
            this.initializeLearningEngine();
            
            // 启动推荐系统
            this.initializeRecommendationEngine();
            
            // 应用个性化设置
            this.applyPersonalization();
            
            console.log('✅ 用户行为学习系统启动完成');
            
        } catch (error) {
            console.error('❌ 用户行为学习系统启动失败:', error);
        }
    }
    
    /**
     * 生成用户唯一标识
     */
    generateUserId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return `user_${timestamp}_${random}`;
    }
    
    /**
     * 加载用户历史数据
     */
    async loadUserData() {
        try {
            const stored = localStorage.getItem('userLearning_data');
            if (stored) {
                const data = JSON.parse(stored);
                
                // 恢复数据结构
                if (data.profile) {
                    this.userData.profile = {
                        ...data.profile,
                        preferences: new Map(data.profile.preferences || []),
                        personalityTraits: new Map(data.profile.personalityTraits || []),
                        usagePatterns: new Map(data.profile.usagePatterns || [])
                    };
                }
                
                this.userData.sessions = data.sessions || [];
                this.userData.interactions = data.interactions || [];
                
                if (data.preferences) {
                    this.userData.preferences = {
                        audio: new Map(data.preferences.audio || []),
                        ui: new Map(data.preferences.ui || []),
                        timing: new Map(data.preferences.timing || []),
                        social: new Map(data.preferences.social || [])
                    };
                }
                
                if (data.learning) {
                    this.userData.learning = {
                        models: new Map(data.learning.models || []),
                        predictions: new Map(data.learning.predictions || []),
                        feedbackLoop: data.learning.feedbackLoop || []
                    };
                }
                
                console.log(`📊 加载用户数据: ${this.userData.sessions.length} 个会话，${this.userData.interactions.length} 个交互`);
            }
            
        } catch (error) {
            console.warn('⚠️ 用户数据加载失败，使用默认配置:', error);
        }
    }
    
    /**
     * 设置行为追踪
     */
    setupBehaviorTracking() {
        // 会话追踪
        this.currentSession = {
            id: Date.now().toString(),
            startTime: Date.now(),
            interactions: [],
            audioPlayed: [],
            preferences: {},
            mood: null
        };
        
        // 监听音频播放事件
        document.addEventListener('audioPlayStart', (event) => {
            this.recordAudioPlay(event.detail);
        });
        
        // 监听用户交互
        document.addEventListener('click', (event) => {
            this.recordUserInteraction(event);
        });
        
        // 监听设置变更
        document.addEventListener('settingsChange', (event) => {
            this.recordSettingsChange(event.detail);
        });
        
        // 监听反馈事件
        document.addEventListener('userFeedback', (event) => {
            this.recordUserFeedback(event.detail);
        });
        
        // 页面卸载时保存会话
        window.addEventListener('beforeunload', () => {
            this.endCurrentSession();
            this.saveUserData();
        });
        
        // 定期保存数据
        setInterval(() => {
            this.saveUserData();
        }, 2 * 60 * 1000); // 每2分钟
        
        console.log('👂 用户行为追踪已启动');
    }
    
    /**
     * 记录音频播放行为
     */
    recordAudioPlay(details) {
        const playRecord = {
            timestamp: Date.now(),
            category: details.category,
            fileName: details.fileName,
            duration: details.duration || 0,
            volume: details.volume || 0.7,
            timeOfDay: this.getTimeOfDayCategory(),
            context: this.getCurrentContext(),
            sessionId: this.currentSession.id
        };
        
        // 添加到当前会话
        this.currentSession.audioPlayed.push(playRecord);
        
        // 更新音频偏好
        this.updateAudioPreferences(playRecord);
        
        // 触发学习更新
        this.triggerLearningUpdate('audioPreference', playRecord);
        
        console.log(`🎵 记录音频播放: ${details.category}/${details.fileName}`);
    }
    
    /**
     * 记录用户交互
     */
    recordUserInteraction(event) {
        const interaction = {
            timestamp: Date.now(),
            type: event.type,
            element: event.target.tagName.toLowerCase(),
            className: event.target.className,
            position: { x: event.clientX, y: event.clientY },
            sessionId: this.currentSession.id
        };
        
        // 识别交互模式
        const pattern = this.identifyInteractionPattern(interaction);
        if (pattern) {
            interaction.pattern = pattern;
        }
        
        this.currentSession.interactions.push(interaction);
        this.userData.interactions.push(interaction);
        
        // 更新UI偏好
        this.updateUIPreferences(interaction);
        
        // 限制交互记录长度
        if (this.userData.interactions.length > 1000) {
            this.userData.interactions = this.userData.interactions.slice(-1000);
        }
    }
    
    /**
     * 识别交互模式
     */
    identifyInteractionPattern(interaction) {
        try {
            // 基本的交互模式识别
            let pattern = null;
            
            if (interaction.element === 'button') {
                if (interaction.className.includes('language')) {
                    pattern = 'language_switch';
                } else if (interaction.className.includes('play')) {
                    pattern = 'audio_control';
                } else if (interaction.className.includes('ecosystem')) {
                    pattern = 'category_navigation';
                }
            } else if (interaction.element === 'div') {
                if (interaction.className.includes('ecosystem-card')) {
                    pattern = 'category_selection';
                } else if (interaction.className.includes('track-item')) {
                    pattern = 'track_selection';
                }
            }
            
            return pattern;
        } catch (error) {
            console.warn('⚠️ 交互模式识别失败:', error);
            return null;
        }
    }
    
    /**
     * 更新UI偏好
     */
    updateUIPreferences(interaction) {
        try {
            // 根据交互更新UI偏好
            const uiPrefs = this.userData.preferences.ui;
            
            if (interaction.pattern) {
                const currentCount = uiPrefs.get(interaction.pattern) || 0;
                uiPrefs.set(interaction.pattern, currentCount + 1);
            }
            
            // 记录元素偏好
            const elementKey = `${interaction.element}_${interaction.className}`;
            const currentElementCount = uiPrefs.get(elementKey) || 0;
            uiPrefs.set(elementKey, currentElementCount + 1);
            
        } catch (error) {
            console.warn('⚠️ UI偏好更新失败:', error);
        }
    }
    
    /**
     * 记录设置变更
     */
    recordSettingsChange(details) {
        const change = {
            timestamp: Date.now(),
            setting: details.setting,
            oldValue: details.oldValue,
            newValue: details.newValue,
            context: this.getCurrentContext(),
            sessionId: this.currentSession.id
        };
        
        this.currentSession.preferences[details.setting] = details.newValue;
        
        // 更新个性化配置
        this.updatePersonalizationSettings(change);
        
        console.log(`⚙️ 设置变更: ${details.setting} = ${details.newValue}`);
    }
    
    /**
     * 记录用户反馈
     */
    recordUserFeedback(feedback) {
        const feedbackRecord = {
            timestamp: Date.now(),
            type: feedback.type,
            rating: feedback.rating,
            category: feedback.category,
            text: feedback.text || null,
            context: this.getCurrentContext(),
            sessionId: this.currentSession.id
        };
        
        // 添加到反馈循环
        this.userData.learning.feedbackLoop.push(feedbackRecord);
        
        // 基于反馈调整模型
        this.adjustModelsBasedOnFeedback(feedbackRecord);
        
        console.log(`💬 用户反馈: ${feedback.type} - ${feedback.rating}/5`);
    }
    
    /**
     * 获取当前上下文
     */
    getCurrentContext() {
        const context = {
            timeOfDay: this.getTimeOfDayCategory(),
            dayOfWeek: new Date().getDay(),
            sessionDuration: Date.now() - this.currentSession.startTime,
            interactionCount: this.currentSession.interactions.length,
            audioPlayed: this.currentSession.audioPlayed.length
        };
        
        // 检测可能的心情状态
        const detectedMood = this.detectMoodFromBehavior();
        if (detectedMood) {
            context.mood = detectedMood;
        }
        
        return context;
    }
    
    /**
     * 获取时间段分类
     */
    getTimeOfDayCategory() {
        const hour = new Date().getHours();
        
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
     * 从行为检测心情
     */
    detectMoodFromBehavior() {
        const recentInteractions = this.currentSession.interactions.slice(-10);
        const recentAudio = this.currentSession.audioPlayed.slice(-3);
        
        // 简单的心情检测逻辑
        if (recentInteractions.length > 8) {
            return 'active'; // 高交互频率
        }
        
        if (recentAudio.some(audio => audio.category === 'meditation')) {
            return 'peaceful'; // 选择冥想音频
        }
        
        if (recentAudio.some(audio => audio.category === 'Rain')) {
            return 'relaxed'; // 选择雨声
        }
        
        return null; // 无法判断
    }
    
    /**
     * 初始化学习引擎
     */
    initializeLearningEngine() {
        // 为每个学习模型初始化训练数据
        Object.keys(this.learningModels).forEach(modelName => {
            this.trainModel(modelName);
        });
        
        // 启动定期学习更新
        setInterval(() => {
            this.performPeriodicLearning();
        }, 10 * 60 * 1000); // 每10分钟
        
        console.log('🎓 学习引擎已初始化');
    }
    
    /**
     * 训练指定模型
     */
    trainModel(modelName) {
        const model = this.learningModels[modelName];
        if (!model) {
            return;
        }
        
        try {
            switch (modelName) {
            case 'audioPreference':
                this.trainAudioPreferenceModel();
                break;
            case 'usagePattern':
                this.trainUsagePatternModel();
                break;
            case 'personalityProfile':
                this.trainPersonalityModel();
                break;
            }
            
            model.lastUpdate = Date.now();
            console.log(`📚 模型训练完成: ${model.name}`);
            
        } catch (error) {
            console.warn(`⚠️ 模型训练失败: ${model.name}`, error);
        }
    }
    
    /**
     * 训练音频偏好模型
     */
    trainAudioPreferenceModel() {
        const audioData = this.userData.sessions
            .flatMap(session => session.audioPlayed || []);
        
        if (audioData.length < 5) {
            console.log('📊 音频数据不足，跳过模型训练');
            return;
        }
        
        // 计算分类偏好权重
        const categoryWeights = new Map();
        const timePatterns = new Map();
        
        audioData.forEach(play => {
            // 分类偏好
            const category = play.category;
            categoryWeights.set(category, (categoryWeights.get(category) || 0) + 1);
            
            // 时间模式
            const timeKey = `${play.timeOfDay}_${category}`;
            timePatterns.set(timeKey, (timePatterns.get(timeKey) || 0) + 1);
        });
        
        // 归一化权重
        const totalPlays = audioData.length;
        categoryWeights.forEach((count, category) => {
            categoryWeights.set(category, count / totalPlays);
        });
        
        // 保存模型
        this.userData.learning.models.set('audioPreference', {
            categoryWeights: Array.from(categoryWeights.entries()),
            timePatterns: Array.from(timePatterns.entries()),
            trainingSize: audioData.length,
            accuracy: this.calculateModelAccuracy('audioPreference')
        });
        
        this.learningModels.audioPreference.confidence = 
            Math.min(audioData.length / 20, 1.0); // 20个样本达到满信心
    }
    
    /**
     * 训练使用模式模型
     */
    trainUsagePatternModel() {
        const sessions = this.userData.sessions;
        
        if (sessions.length < 3) {
            console.log('📊 会话数据不足，跳过模式训练');
            return;
        }
        
        // 分析使用模式
        const patterns = {
            averageSessionDuration: 0,
            peakUsageHours: [],
            interactionIntensity: 0,
            returnFrequency: 0
        };
        
        let totalDuration = 0;
        const hourUsage = new Array(24).fill(0);
        let totalInteractions = 0;
        
        sessions.forEach(session => {
            const duration = session.endTime - session.startTime;
            totalDuration += duration;
            
            const hour = new Date(session.startTime).getHours();
            hourUsage[hour]++;
            
            totalInteractions += session.interactions ? session.interactions.length : 0;
        });
        
        patterns.averageSessionDuration = totalDuration / sessions.length;
        patterns.interactionIntensity = totalInteractions / sessions.length;
        
        // 找出使用高峰时段
        const maxUsage = Math.max(...hourUsage);
        patterns.peakUsageHours = hourUsage
            .map((usage, hour) => ({ hour, usage }))
            .filter(item => item.usage >= maxUsage * 0.7)
            .map(item => item.hour);
        
        // 计算回访频率
        if (sessions.length > 1) {
            const timeSpans = [];
            for (let i = 1; i < sessions.length; i++) {
                timeSpans.push(sessions[i].startTime - sessions[i-1].startTime);
            }
            patterns.returnFrequency = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;
        }
        
        this.userData.learning.models.set('usagePattern', patterns);
        this.learningModels.usagePattern.confidence = Math.min(sessions.length / 10, 1.0);
    }
    
    /**
     * 训练个性化档案模型
     */
    trainPersonalityModel() {
        const interactions = this.userData.interactions.slice(-100); // 最近100个交互
        const preferences = this.userData.preferences;
        
        if (interactions.length < 10) {
            console.log('📊 交互数据不足，跳过个性分析');
            return;
        }
        
        const traits = {
            explorationLevel: this.calculateExplorationLevel(interactions),
            routinePreference: this.calculateRoutinePreference(),
            interactionStyle: this.analyzeInteractionStyle(interactions),
            preferenceStability: this.calculatePreferenceStability()
        };
        
        this.userData.learning.models.set('personalityProfile', traits);
        this.learningModels.personalityProfile.confidence = Math.min(interactions.length / 50, 1.0);
    }
    
    /**
     * 计算探索性水平
     */
    calculateExplorationLevel(interactions) {
        // 分析用户是否倾向于尝试新功能和内容
        const uniqueElements = new Set(interactions.map(i => i.className));
        const explorationRatio = uniqueElements.size / interactions.length;
        
        return Math.min(explorationRatio * 2, 1.0); // 标准化到0-1
    }
    
    /**
     * 计算例行偏好
     */
    calculateRoutinePreference() {
        // 分析用户行为的重复性
        const recentSessions = this.userData.sessions.slice(-5);
        
        if (recentSessions.length < 2) {
            return 0.5;
        }
        
        const similarityScore = 0;
        const comparisons = [];
        
        for (let i = 0; i < recentSessions.length - 1; i++) {
            const session1 = recentSessions[i];
            const session2 = recentSessions[i + 1];
            
            // 比较音频选择相似性
            const audio1 = (session1.audioPlayed || []).map(a => a.category);
            const audio2 = (session2.audioPlayed || []).map(a => a.category);
            
            const intersection = audio1.filter(cat => audio2.includes(cat));
            const union = [...new Set([...audio1, ...audio2])];
            
            if (union.length > 0) {
                comparisons.push(intersection.length / union.length);
            }
        }
        
        return comparisons.length > 0 
            ? comparisons.reduce((a, b) => a + b, 0) / comparisons.length
            : 0.5;
    }
    
    /**
     * 分析交互风格
     */
    analyzeInteractionStyle(interactions) {
        const style = {
            clickFrequency: interactions.length / ((Date.now() - interactions[0].timestamp) / 60000), // 每分钟点击次数
            explorationDepth: this.calculateExplorationLevel(interactions),
            patience: this.calculatePatience(interactions)
        };
        
        return style;
    }
    
    /**
     * 计算耐心程度
     */
    calculatePatience(interactions) {
        // 分析用户在操作间的等待时间
        const intervals = [];
        
        for (let i = 1; i < interactions.length; i++) {
            const interval = interactions[i].timestamp - interactions[i-1].timestamp;
            intervals.push(interval);
        }
        
        if (intervals.length === 0) {
            return 0.5;
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return Math.min(avgInterval / 5000, 1.0); // 5秒为满耐心
    }

    /**
     * 计算偏好稳定性
     */
    calculatePreferenceStability() {
        // 分析用户偏好的一致性和稳定性
        const sessions = this.userData.sessions.slice(-10); // 最近10个会话
        
        if (sessions.length < 3) {
            return 0.5;
        } // 数据不足时返回中性值
        
        // 分析音频类别选择的稳定性
        const categoryPreferences = {};
        sessions.forEach(session => {
            (session.audioPlayed || []).forEach(audio => {
                if (audio.category) {
                    categoryPreferences[audio.category] = (categoryPreferences[audio.category] || 0) + 1;
                }
            });
        });
        
        const categories = Object.keys(categoryPreferences);
        if (categories.length === 0) {
            return 0.5;
        }
        
        // 计算偏好分布的稳定性（熵的倒数）
        const total = Object.values(categoryPreferences).reduce((a, b) => a + b, 0);
        let entropy = 0;
        
        for (const count of Object.values(categoryPreferences)) {
            const probability = count / total;
            if (probability > 0) {
                entropy += -probability * Math.log2(probability);
            }
        }
        
        // 标准化熵值到0-1范围，熵越低稳定性越高
        const maxEntropy = Math.log2(categories.length);
        const stabilityScore = maxEntropy > 0 ? (1 - entropy / maxEntropy) : 1;
        
        return Math.max(0, Math.min(1, stabilityScore));
    }
    
    /**
     * 初始化推荐系统
     */
    initializeRecommendationEngine() {
        // 启动推荐生成定时器
        setInterval(() => {
            this.generateRecommendations();
        }, 5 * 60 * 1000); // 每5分钟
        
        console.log('💡 推荐系统已启动');
    }
    
    /**
     * 生成个性化推荐
     */
    generateRecommendations() {
        const recommendations = {
            audio: this.generateAudioRecommendations(),
            ui: this.generateUIRecommendations(),
            timing: this.generateTimingRecommendations(),
            features: this.generateFeatureRecommendations()
        };
        
        this.userData.learning.predictions.set('recommendations', {
            timestamp: Date.now(),
            data: recommendations,
            confidence: this.calculateOverallModelConfidence()
        });
        
        // 触发推荐更新事件
        document.dispatchEvent(new CustomEvent('recommendationsUpdate', {
            detail: recommendations
        }));
        
        console.log('💡 生成新推荐:', recommendations);
    }
    
    /**
     * 生成音频推荐
     */
    generateAudioRecommendations() {
        const audioModel = this.userData.learning.models.get('audioPreference');
        if (!audioModel || audioModel.trainingSize < 5) {
            return this.getDefaultAudioRecommendations();
        }
        
        const currentTime = this.getTimeOfDayCategory();
        const categoryWeights = new Map(audioModel.categoryWeights);
        const timePatterns = new Map(audioModel.timePatterns);
        
        // 基于时间调整权重
        const recommendations = [];
        categoryWeights.forEach((weight, category) => {
            const timeKey = `${currentTime}_${category}`;
            const timeBoost = timePatterns.get(timeKey) || 0;
            
            const finalScore = weight * 0.7 + timeBoost * 0.3;
            
            if (finalScore > 0.1) {
                recommendations.push({
                    category: category,
                    score: finalScore,
                    reason: '基于您的偏好和当前时间段'
                });
            }
        });
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, this.recommendationEngine.maxRecommendations);
    }
    
    /**
     * 获取默认音频推荐
     */
    getDefaultAudioRecommendations() {
        const currentTime = this.getTimeOfDayCategory();
        
        const defaultByTime = {
            morning: ['birds', 'stream', 'wind'],
            afternoon: ['Rain', 'ocean', 'fire'],
            evening: ['meditation', 'Singing bowl sound', 'Rain'],
            night: ['Rain', 'ocean', 'meditation']
        };
        
        return (defaultByTime[currentTime] || defaultByTime.evening).map(category => ({
            category: category,
            score: 0.5,
            reason: '基于时间段的推荐'
        }));
    }
    
    /**
     * 应用个性化设置
     */
    applyPersonalization() {
        const personalityModel = this.userData.learning.models.get('personalityProfile');
        
        if (personalityModel) {
            // 基于个性特征调整界面
            if (personalityModel.explorationLevel > 0.7) {
                this.personalization.uiAdaptation.complexity = 'full';
            } else if (personalityModel.explorationLevel < 0.3) {
                this.personalization.uiAdaptation.complexity = 'simple';
            }
            
            // 基于使用模式调整设置
            const usageModel = this.userData.learning.models.get('usagePattern');
            if (usageModel && usageModel.averageSessionDuration > 30 * 60 * 1000) { // 30分钟+
                this.personalization.audioSettings.autoplay = true;
            }
        }
        
        // 应用界面个性化
        this.applyUIPersonalization();
        
        console.log('🎨 个性化设置已应用');
    }
    
    /**
     * 应用界面个性化
     */
    applyUIPersonalization() {
        const body = document.body;
        
        // 根据复杂度偏好调整界面
        if (this.personalization.uiAdaptation.complexity === 'simple') {
            body.classList.add('simplified-ui');
        } else if (this.personalization.uiAdaptation.complexity === 'full') {
            body.classList.add('full-featured-ui');
        }
        
        // 根据个性特征调整动画
        const personalityModel = this.userData.learning.models.get('personalityProfile');
        if (personalityModel) {
            if (personalityModel.interactionStyle.patience > 0.7) {
                body.classList.add('patient-user'); // 更多动画细节
            } else if (personalityModel.interactionStyle.patience < 0.3) {
                body.classList.add('impatient-user'); // 快速响应
            }
        }
    }
    
    /**
     * 结束当前会话
     */
    endCurrentSession() {
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
            
            this.userData.sessions.push(this.currentSession);
            
            // 限制会话历史长度
            if (this.userData.sessions.length > 50) {
                this.userData.sessions = this.userData.sessions.slice(-50);
            }
            
            console.log(`📝 会话结束: 时长${Math.round(this.currentSession.duration/1000)}秒`);
        }
    }
    
    /**
     * 保存用户数据
     */
    saveUserData() {
        try {
            const dataToSave = {
                profile: {
                    ...this.userData.profile,
                    preferences: Array.from(this.userData.profile.preferences.entries()),
                    personalityTraits: Array.from(this.userData.profile.personalityTraits.entries()),
                    usagePatterns: Array.from(this.userData.profile.usagePatterns.entries())
                },
                sessions: this.userData.sessions.slice(-20), // 保存最近20个会话
                interactions: this.userData.interactions.slice(-200), // 保存最近200个交互
                preferences: {
                    audio: Array.from(this.userData.preferences.audio.entries()),
                    ui: Array.from(this.userData.preferences.ui.entries()),
                    timing: Array.from(this.userData.preferences.timing.entries()),
                    social: Array.from(this.userData.preferences.social.entries())
                },
                learning: {
                    models: Array.from(this.userData.learning.models.entries()),
                    predictions: Array.from(this.userData.learning.predictions.entries()),
                    feedbackLoop: this.userData.learning.feedbackLoop.slice(-50)
                },
                personalization: this.personalization
            };
            
            localStorage.setItem('userLearning_data', JSON.stringify(dataToSave));
            console.log('💾 用户学习数据已保存');
            
        } catch (error) {
            console.warn('⚠️ 保存用户学习数据失败:', error);
        }
    }
    
    /**
     * 获取学习系统报告
     */
    getLearningReport() {
        const overallConfidence = this.calculateOverallModelConfidence();
        
        return {
            userProfile: {
                id: this.userData.profile.id,
                accountAge: Date.now() - this.userData.profile.creationTime,
                totalSessions: this.userData.sessions.length,
                totalInteractions: this.userData.interactions.length
            },
            learningProgress: {
                overallConfidence: (overallConfidence * 100).toFixed(1) + '%',
                models: Object.entries(this.learningModels).map(([name, model]) => ({
                    name: model.name,
                    confidence: (model.confidence * 100).toFixed(1) + '%',
                    lastUpdate: model.lastUpdate ? new Date(model.lastUpdate).toLocaleString() : 'Never'
                }))
            },
            currentRecommendations: this.userData.learning.predictions.get('recommendations'),
            personalization: {
                uiComplexity: this.personalization.uiAdaptation.complexity,
                autoplayEnabled: this.personalization.audioSettings.autoplay,
                adaptiveTheme: this.personalization.uiAdaptation.theme
            },
            insights: this.generateUserInsights()
        };
    }
    
    /**
     * 计算整体模型置信度
     */
    calculateOverallModelConfidence() {
        const confidences = Object.values(this.learningModels).map(model => model.confidence);
        return confidences.length > 0 
            ? confidences.reduce((a, b) => a + b, 0) / confidences.length
            : 0;
    }
    
    /**
     * 生成用户洞察
     */
    generateUserInsights() {
        const insights = [];
        
        const personalityModel = this.userData.learning.models.get('personalityProfile');
        if (personalityModel) {
            if (personalityModel.explorationLevel > 0.7) {
                insights.push('您喜欢探索新功能和内容');
            }
            if (personalityModel.routinePreference > 0.6) {
                insights.push('您偏好规律的使用习惯');
            }
        }
        
        const usageModel = this.userData.learning.models.get('usagePattern');
        if (usageModel) {
            if (usageModel.averageSessionDuration > 20 * 60 * 1000) {
                insights.push('您通常有较长的使用时间');
            }
            if (usageModel.peakUsageHours.includes(new Date().getHours())) {
                insights.push('这是您的活跃使用时段');
            }
        }
        
        return insights;
    }
    
    /**
     * 重置学习数据
     */
    resetLearningData() {
        this.userData = {
            profile: {
                id: this.generateUserId(),
                creationTime: Date.now(),
                preferences: new Map(),
                personalityTraits: new Map(),
                usagePatterns: new Map()
            },
            sessions: [],
            interactions: [],
            preferences: {
                audio: new Map(),
                ui: new Map(),
                timing: new Map(),
                social: new Map()
            },
            learning: {
                models: new Map(),
                predictions: new Map(),
                feedbackLoop: []
            }
        };
        
        localStorage.removeItem('userLearning_data');
        
        console.log('🔄 学习数据已重置');
    }
}

// 创建全局实例
window.learningSystem = new UserBehaviorLearningSystem();

// 导出API给其他模块使用
window.getLearningReport = () => window.learningSystem.getLearningReport();
window.getUserRecommendations = () => window.learningSystem.userData.learning.predictions.get('recommendations');
window.recordUserFeedback = (feedback) => {
    document.dispatchEvent(new CustomEvent('userFeedback', { detail: feedback }));
};

console.log('🚀 用户行为学习系统加载完成');