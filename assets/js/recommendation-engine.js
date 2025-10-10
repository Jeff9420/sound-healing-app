/**
 * RecommendationEngine - 智能推荐引擎
 *
 * 功能:
 * - 基于收听历史的推荐
 * - 基于时间段的智能推荐
 * - 相似音频推荐
 * - 个性化推荐算法
 *
 * @class
 * @version 1.0.0
 */

class RecommendationEngine {
    constructor(userDataManager, audioMetadata) {
        this.userDataManager = userDataManager;
        this.audioMetadata = audioMetadata;

        // 时间段推荐配置
        this.timeBasedScenarios = {
            'morning': ['meditation', 'energy_work'],        // 6-10点
            'midday': ['work', 'focus'],                     // 10-14点
            'afternoon': ['relaxation', 'background'],       // 14-18点
            'evening': ['relax', 'meditation'],              // 18-22点
            'night': ['sleep', 'deep_sleep']                 // 22-6点
        };
    }

    /**
     * 获取推荐音频
     * @param {number} count - 推荐数量
     * @returns {Array} 推荐音频列表
     */
    getRecommendations(count = 10) {
        const recommendations = [];

        // 1. 基于收听历史的推荐 (40%)
        const historyBased = this.getHistoryBasedRecommendations(Math.ceil(count * 0.4));
        recommendations.push(...historyBased);

        // 2. 基于时间的推荐 (30%)
        const timeBased = this.getTimeBasedRecommendations(Math.ceil(count * 0.3));
        recommendations.push(...timeBased);

        // 3. 相似音频推荐 (30%)
        const similar = this.getSimilarRecommendations(Math.ceil(count * 0.3));
        recommendations.push(...similar);

        // 去重并限制数量
        const unique = this.deduplicateRecommendations(recommendations);
        return unique.slice(0, count);
    }

    /**
     * 基于收听历史的推荐
     */
    getHistoryBasedRecommendations(count) {
        const stats = this.userDataManager.getStatistics();
        const categoryStats = stats.categoryStats || {};

        // 找出最常听的分类
        const topCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1].plays - a[1].plays)
            .slice(0, 3)
            .map(entry => entry[0]);

        if (topCategories.length === 0) {
            return this.getRandomRecommendations(count);
        }

        const recommendations = [];
        const history = this.userDataManager.getHistory();
        const playedFiles = new Set(history.map(h => h.fileName));

        // 从喜欢的分类中推荐未听过的音频
        for (const category of topCategories) {
            if (recommendations.length >= count) {
                break;
            }

            const categoryData = this.getCategoryData(category);
            if (!categoryData || !categoryData.files) {
                continue;
            }

            // 过滤掉已播放的
            const unplayedFiles = categoryData.files.filter(f => !playedFiles.has(f));

            // 随机选择
            const selected = this.randomSample(unplayedFiles, Math.ceil(count / topCategories.length));

            selected.forEach(fileName => {
                const metadata = this.audioMetadata.getMetadata(category, fileName);
                recommendations.push({
                    ...metadata,
                    reason: 'based_on_history',
                    score: categoryStats[category].plays
                });
            });
        }

        return recommendations;
    }

    /**
     * 基于时间的推荐
     */
    getTimeBasedRecommendations(count) {
        const currentHour = new Date().getHours();
        let timeOfDay = 'night';

        if (currentHour >= 6 && currentHour < 10) {
            timeOfDay = 'morning';
        } else if (currentHour >= 10 && currentHour < 14) {
            timeOfDay = 'midday';
        } else if (currentHour >= 14 && currentHour < 18) {
            timeOfDay = 'afternoon';
        } else if (currentHour >= 18 && currentHour < 22) {
            timeOfDay = 'evening';
        }

        const scenarios = this.timeBasedScenarios[timeOfDay] || ['relaxation'];
        const recommendations = [];

        // 根据时间段查找合适的音频
        for (const scenario of scenarios) {
            if (recommendations.length >= count) {
                break;
            }

            const matches = this.audioMetadata.searchByScenario(scenario);
            const selected = this.randomSample(matches, Math.ceil(count / scenarios.length));

            selected.forEach(metadata => {
                recommendations.push({
                    ...metadata,
                    reason: 'time_based',
                    timeOfDay,
                    score: 0.8
                });
            });
        }

        return recommendations;
    }

    /**
     * 相似音频推荐
     */
    getSimilarRecommendations(count) {
        const history = this.userDataManager.getHistory(5);

        if (history.length === 0) {
            return this.getRandomRecommendations(count);
        }

        const recommendations = [];
        const recentTrack = history[0];

        // 获取最近播放音频的元数据
        const recentMetadata = this.audioMetadata.getMetadata(
            recentTrack.category,
            recentTrack.fileName
        );

        // 查找相似标签的音频
        if (recentMetadata.tags && recentMetadata.tags.length > 0) {
            const similar = this.audioMetadata.searchByTags(recentMetadata.tags);

            // 过滤掉最近播放的
            const filtered = similar.filter(m =>
                m.fileName !== recentTrack.fileName
            );

            const selected = this.randomSample(filtered, count);

            selected.forEach(metadata => {
                recommendations.push({
                    ...metadata,
                    reason: 'similar_to',
                    similarTo: recentTrack.displayName,
                    score: 0.7
                });
            });
        }

        return recommendations;
    }

    /**
     * 随机推荐（兜底方案）
     */
    getRandomRecommendations(count) {
        const allAudio = [];

        if (typeof AUDIO_CONFIG !== 'undefined') {
            for (const [category, data] of Object.entries(AUDIO_CONFIG.categories)) {
                if (data.files) {
                    data.files.forEach(fileName => {
                        const metadata = this.audioMetadata.getMetadata(category, fileName);
                        allAudio.push({
                            ...metadata,
                            reason: 'random',
                            score: 0.5
                        });
                    });
                }
            }
        }

        return this.randomSample(allAudio, count);
    }

    /**
     * "可能喜欢"推荐
     */
    getMayLikeRecommendations(count = 5) {
        const favorites = this.userDataManager.getFavorites();

        if (favorites.length === 0) {
            return this.getRecommendations(count);
        }

        const recommendations = [];
        const favoriteCategories = [...new Set(favorites.map(f => f.category))];

        // 从收藏的分类中推荐
        for (const category of favoriteCategories) {
            if (recommendations.length >= count) {
                break;
            }

            const categoryData = this.getCategoryData(category);
            if (!categoryData || !categoryData.files) {
                continue;
            }

            // 过滤掉已收藏的
            const favFiles = new Set(favorites.map(f => f.fileName));
            const unfavorited = categoryData.files.filter(f => !favFiles.has(f));

            const selected = this.randomSample(unfavorited, Math.ceil(count / favoriteCategories.length));

            selected.forEach(fileName => {
                const metadata = this.audioMetadata.getMetadata(category, fileName);
                recommendations.push({
                    ...metadata,
                    reason: 'may_like',
                    score: 0.9
                });
            });
        }

        return recommendations;
    }

    /**
     * 获取"继续收听"推荐
     */
    getContinueListeningRecommendations(count = 5) {
        const history = this.userDataManager.getHistory(10);

        // 返回最近但不是最新的音频
        return history.slice(1, count + 1).map(item => ({
            ...this.audioMetadata.getMetadata(item.category, item.fileName),
            reason: 'continue_listening',
            lastPlayed: item.playedAt,
            score: 1.0
        }));
    }

    /**
     * 获取"探索新分类"推荐
     */
    getExploreNewRecommendations(count = 5) {
        const stats = this.userDataManager.getStatistics();
        const playedCategories = Object.keys(stats.categoryStats || {});

        // 找出未播放的分类
        let unplayedCategories = [];
        if (typeof AUDIO_CONFIG !== 'undefined') {
            const allCategories = Object.keys(AUDIO_CONFIG.categories);
            unplayedCategories = allCategories.filter(c => !playedCategories.includes(c));
        }

        if (unplayedCategories.length === 0) {
            unplayedCategories = Object.keys(AUDIO_CONFIG.categories);
        }

        const recommendations = [];

        for (const category of unplayedCategories) {
            if (recommendations.length >= count) {
                break;
            }

            const categoryData = this.getCategoryData(category);
            if (!categoryData || !categoryData.files) {
                continue;
            }

            // 选择该分类的代表性音频
            const selected = this.randomSample(categoryData.files, 1);

            selected.forEach(fileName => {
                const metadata = this.audioMetadata.getMetadata(category, fileName);
                recommendations.push({
                    ...metadata,
                    reason: 'explore_new',
                    score: 0.6
                });
            });
        }

        return recommendations;
    }

    /**
     * 工具方法：去重
     */
    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const key = `${rec.category}_${rec.fileName}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * 工具方法：随机采样
     */
    randomSample(array, count) {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, array.length));
    }

    /**
     * 工具方法：获取分类数据
     */
    getCategoryData(category) {
        if (typeof AUDIO_CONFIG === 'undefined') {
            return null;
        }
        return AUDIO_CONFIG.categories[category];
    }

    /**
     * 获取推荐原因的显示文本
     */
    getReasonText(reason, metadata = {}) {
        const texts = {
            'based_on_history': '根据您的收听历史',
            'time_based': `适合${this.getTimeOfDayText(metadata.timeOfDay)}收听`,
            'similar_to': `因为您听过《${metadata.similarTo}》`,
            'may_like': '您可能喜欢',
            'continue_listening': '继续收听',
            'explore_new': '探索新分类',
            'random': '为您推荐'
        };

        return texts[reason] || '推荐给您';
    }

    /**
     * 获取时间段文本
     */
    getTimeOfDayText(timeOfDay) {
        const texts = {
            'morning': '早晨',
            'midday': '午间',
            'afternoon': '下午',
            'evening': '傍晚',
            'night': '夜晚'
        };

        return texts[timeOfDay] || '';
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.RecommendationEngine = RecommendationEngine;

    // 等待依赖加载后初始化
    const initRecommendationEngine = () => {
        if (window.userDataManager && window.audioMetadata) {
            window.recommendationEngine = new RecommendationEngine(
                window.userDataManager,
                window.audioMetadata
            );
            console.log('✅ RecommendationEngine 已创建');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecommendationEngine);
    } else {
        setTimeout(initRecommendationEngine, 100);
    }
}
