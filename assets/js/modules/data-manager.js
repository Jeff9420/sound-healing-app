/**
 * DataManager Module
 * Handles data fetching, audio configuration, and category management.
 */

import { AUDIO_CONFIG } from './audio-config.js';

export class DataManager {
    constructor(audioMetadata) {
        this.audioConfig = AUDIO_CONFIG;
        this.audioMetadata = audioMetadata;

        this.categoryInfo = {
            meditation: { name: '冥想空间', icon: '🧘', desc: '找回内心的平静' },
            nature: { name: '自然之声', icon: '🌿', desc: '森林与流水的治愈' },
            rain: { name: '雨声系列', icon: '🌧️', desc: '伴着雨声入眠' },
            singing: { name: '钵颂疗愈', icon: '🔔', desc: '深层音波平衡身心' }
        };

        this.categoryPresentations = {
            'Animal sounds': { badge: 'Forest Pulse', label: 'Bio Acoustic', tagline: 'Alpha Calm Bloom', accent: '#58f5c3' },
            'Fire': { badge: 'Warm Focus', label: 'Ember Flow', tagline: '200% Deep Heat Care', accent: '#ff8a65' },
            'hypnosis': { badge: 'Dream Lab', label: 'Subconscious Drift', tagline: 'Guided REM Reset', accent: '#a066ff' },
            'meditation': { badge: 'Zen Studio', label: 'Breathing Field', tagline: 'Mindful Bio-Sync', accent: '#7bdcb5' },
            'Rain': { badge: 'Cloud Core', label: 'Rain Sanctuary', tagline: 'Delta Sleep Engine', accent: '#5ec8ff' },
            'running water': { badge: 'Flow State', label: 'Liquid Focus', tagline: 'Hydro Memory Boost', accent: '#63f5ff' },
            'Singing bowl sound': { badge: 'Resonance Lab', label: 'Tibetan Bloom', tagline: 'Gamma Chakra Align', accent: '#f7b1ff' },
            'Chakra': { badge: 'Energy Grid', label: 'Chakra Align', tagline: 'Multi-tone Balance', accent: '#ff7de9' },
            'Subconscious Therapy': { badge: 'Mind Lab', label: 'Deep Therapy', tagline: 'Neuro Reset Mode', accent: '#a3b1ff' }
        };

        this.defaultSleepSession = {
            categoryKey: 'Rain',
            fileName: '小雨 入眠 助眠，学习，冥想，放松.mp3',
            fallbackTitle: 'Sleep Warm Rain · 15 min',
            fallbackTags: '#sleep #beginner #try-tonight',
            fallbackDesc: 'A gentle, voice-free rain track to slow your mind before bed.',
            badge: 'Official recommendation',
            duration: '15:00'
        };
    }

    getAudioUrl(categoryKey, filename) {
        if (this.audioConfig.categories && this.audioConfig.categories[categoryKey]) {
            const category = this.audioConfig.categories[categoryKey];
            const folderName = category.folder || categoryKey.toLowerCase().replace(/\s+/g, '-');
            return `${this.audioConfig.baseUrl}${folderName}/${encodeURIComponent(filename)}`;
        }
        return null;
    }

    getCategoryData(key) {
        return this.audioConfig.categories ? this.audioConfig.categories[key] : null;
    }

    getTracksForCategory(key) {
        const category = this.getCategoryData(key);
        if (!category || !category.files) return [];
        return category.files.map(fileName => ({
            name: this.getLocalizedTrackTitle(key, fileName),
            fileName: fileName,
            category: key,
            url: this.getAudioUrl(key, fileName),
            duration: 0 // Placeholder, will be updated on metadata load
        }));
    }

    getAvailableCategoryEntries() {
        if (this.audioConfig.categories) {
            return Object.entries(this.audioConfig.categories);
        }
        return Object.entries(this.categoryInfo);
    }

    getCategoryInfo(key) {
        return this.categoryInfo[key] || {};
    }

    getCategoryPresentation(key) {
        return this.categoryPresentations[key] || {};
    }

    getDefaultSessionConfig() {
        return this.defaultSleepSession;
    }

    getCategoryDisplayName(key, category) {
        const getText = (k, f) => window.i18n ? (window.i18n.t(k) || f) : f;

        if (category.nameKey) {
            return getText(category.nameKey, category.name || this.categoryInfo[key]?.name || key);
        }
        const ecoKey = `ecosystem.${key}.name`;
        const fallbackKey = `category.${key}`;
        return getText(ecoKey, getText(fallbackKey, category.name || this.categoryInfo[key]?.name || key));
    }

    getCategoryDescription(key, category) {
        const getText = (k, f) => window.i18n ? (window.i18n.t(k) || f) : f;
        return getText(`ecosystem.${key}.desc`, category.description || this.categoryInfo[key]?.desc || '');
    }

    getLocalizedTrackTitle(categoryKey, fileName) {
        if (this.audioMetadata && typeof this.audioMetadata.getLocalizedTitle === 'function') {
            const localized = this.audioMetadata.getLocalizedTitle(categoryKey, fileName);
            if (localized) return localized;
        }
        return fileName.replace(/\.[^/.]+$/, '');
    }

    getTrackMetaSummary(categoryKey, fileName) {
        if (!this.audioMetadata || typeof this.audioMetadata.getMetadata !== 'function') {
            return '';
        }
        const metadata = this.audioMetadata.getMetadata(categoryKey, fileName);
        if (!metadata) return '';

        const formatDuration = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.max(0, Math.floor(seconds % 60));
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const durationLabel = metadata.duration || (metadata.durationSeconds ? formatDuration(metadata.durationSeconds) : '');
        const tags = Array.isArray(metadata.tags) ? metadata.tags.slice(0, 2).join(' · ') : '';
        return [durationLabel, tags].filter(Boolean).join(' · ');
    }
}
