/**
 * RecommendationEngine Module
 * Handles personalized audio recommendations.
 */

import { AUDIO_CONFIG } from './audio-config.js';

export class RecommendationEngine {
    constructor(userDataManager, audioMetadata) {
        this.userDataManager = userDataManager;
        this.audioMetadata = audioMetadata;

        this.timeBasedScenarios = {
            'morning': ['meditation', 'energy_work'],
            'midday': ['work', 'focus'],
            'afternoon': ['relaxation', 'background'],
            'evening': ['relax', 'meditation'],
            'night': ['sleep', 'deep_sleep']
        };
    }

    getRecommendations(count = 10) {
        const recommendations = [];
        recommendations.push(...this.getHistoryBasedRecommendations(Math.ceil(count * 0.4)));
        recommendations.push(...this.getTimeBasedRecommendations(Math.ceil(count * 0.3)));
        recommendations.push(...this.getSimilarRecommendations(Math.ceil(count * 0.3)));
        return this.deduplicateRecommendations(recommendations).slice(0, count);
    }

    getHistoryBasedRecommendations(count) {
        if (!this.userDataManager) return this.getRandomRecommendations(count);
        const stats = this.userDataManager.getStatistics();
        const categoryStats = stats.categoryStats || {};
        const topCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1].plays - a[1].plays)
            .slice(0, 3)
            .map(entry => entry[0]);

        if (topCategories.length === 0) return this.getRandomRecommendations(count);

        const recommendations = [];
        const history = this.userDataManager.getHistory();
        const playedFiles = new Set(history.map(h => h.fileName));

        for (const category of topCategories) {
            if (recommendations.length >= count) break;
            const categoryData = this.getCategoryData(category);
            if (!categoryData || !categoryData.files) continue;

            const unplayedFiles = categoryData.files.filter(f => !playedFiles.has(f));
            const selected = this.randomSample(unplayedFiles, Math.ceil(count / topCategories.length));

            selected.forEach(fileName => {
                const metadata = this.audioMetadata ? this.audioMetadata.getMetadata(category, fileName) : {};
                recommendations.push({
                    ...metadata,
                    category,
                    fileName,
                    reason: 'based_on_history',
                    score: categoryStats[category].plays
                });
            });
        }
        return recommendations;
    }

    getTimeBasedRecommendations(count) {
        if (!this.audioMetadata) return [];
        const currentHour = new Date().getHours();
        let timeOfDay = 'night';
        if (currentHour >= 6 && currentHour < 10) timeOfDay = 'morning';
        else if (currentHour >= 10 && currentHour < 14) timeOfDay = 'midday';
        else if (currentHour >= 14 && currentHour < 18) timeOfDay = 'afternoon';
        else if (currentHour >= 18 && currentHour < 22) timeOfDay = 'evening';

        const scenarios = this.timeBasedScenarios[timeOfDay] || ['relaxation'];
        const recommendations = [];

        for (const scenario of scenarios) {
            if (recommendations.length >= count) break;
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

    getSimilarRecommendations(count) {
        if (!this.userDataManager || !this.audioMetadata) return [];
        const history = this.userDataManager.getHistory(5);
        if (history.length === 0) return this.getRandomRecommendations(count);

        const recommendations = [];
        const recentTrack = history[0];
        const recentMetadata = this.audioMetadata.getMetadata(recentTrack.category, recentTrack.fileName);

        if (recentMetadata && recentMetadata.tags && recentMetadata.tags.length > 0) {
            const similar = this.audioMetadata.searchByTags(recentMetadata.tags);
            const filtered = similar.filter(m => m.fileName !== recentTrack.fileName);
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

    getRandomRecommendations(count) {
        const allAudio = [];
        for (const [category, data] of Object.entries(AUDIO_CONFIG.categories)) {
            if (data.files) {
                data.files.forEach(fileName => {
                    const metadata = this.audioMetadata ? this.audioMetadata.getMetadata(category, fileName) : {};
                    allAudio.push({
                        ...metadata,
                        category,
                        fileName,
                        reason: 'random',
                        score: 0.5
                    });
                });
            }
        }
        return this.randomSample(allAudio, count);
    }

    deduplicateRecommendations(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            const key = `${rec.category}_${rec.fileName}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    randomSample(array, count) {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, array.length));
    }

    getCategoryData(category) {
        return AUDIO_CONFIG.categories[category];
    }

    getReasonText(reason, metadata = {}) {
        const texts = {
            'based_on_history': 'Based on your listening history',
            'time_based': `Perfect for ${metadata.timeOfDay || 'now'}`,
            'similar_to': `Because you listened to ${metadata.similarTo}`,
            'may_like': 'You may like',
            'continue_listening': 'Continue listening',
            'explore_new': 'Explore something new',
            'random': 'Recommended for you'
        };
        return texts[reason] || 'Recommended';
    }
}
