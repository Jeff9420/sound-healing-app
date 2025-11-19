/**
 * AudioMetadata Module
 * Provides detailed metadata for audio files.
 */

import { AUDIO_CONFIG } from './audio-config.js';

const AUDIO_METADATA_OVERRIDES = {
    'meditation': {
        '冥想 瑜伽必听.mp3': {
            translations: {
                'zh-CN': '冥想 · 瑜伽必听',
                en: 'Meditation Essentials for Yogis'
            },
            durationSeconds: 960,
            tags: ['冥想', '瑜伽', '深呼吸'],
            description: '温暖的脉冲与浅吟人声，引导你进入 16 分钟的冥想状态。',
            instrumentation: 'pads · bells',
            mood: ['calm', 'grounded'],
        },
        '减压舒缓放松的神奇音乐.mp3': {
            translations: {
                'zh-CN': '减压舒缓 · 神奇音乐',
                en: 'Stress Relief Miracle'
            },
            durationSeconds: 1320,
            tags: ['减压', '放松', '夜间'],
            description: '柔和合成器与轻雨声的混合，逐渐放宽脑部节奏。',
            instrumentation: 'synth pads · rain textures',
            mood: ['soothing'],
        },
    },
    'Rain': {
        '一声闷雷，大雨倾盆.mp3': {
            translations: {
                'zh-CN': '闷雷倾盆 · 沉浸雨夜',
                en: 'Rolling Thunder Downpour'
            },
            durationSeconds: 1500,
            tags: ['白噪音', '助眠', '自然'],
            description: '密集的雨滴与低频雷声，包裹式的深夜安全感。',
            instrumentation: 'field recording',
            mood: ['sleep'],
        },
        '小雨 入眠 助眠，学习，冥想，放松.mp3': {
            translations: {
                'zh-CN': '细雨入眠',
                en: 'Soft Rain Focus'
            },
            durationSeconds: 1800,
            tags: ['专注', '轻雨', '背景'],
            description: '持续的小雨声与树叶沙沙声，适合学习或冥想背景。',
            instrumentation: 'field recording',
            mood: ['focus'],
        },
    },
    'Singing bowl sound': {
        '01-Healing Bowls - Instrumental - Jane Winther.mp3': {
            translations: {
                'zh-CN': '疗愈颂钵 · 共振旅程',
                en: 'Healing Bowls · Resonant Journey'
            },
            durationSeconds: 780,
            tags: ['颂钵', '疗愈', '正念'],
            description: '层叠的西藏颂钵泛音，轻柔扫过整个空间。',
            instrumentation: 'tibetan bowls',
            mood: ['restore'],
        },
    },
    'Animal sounds': {
        '森林里百灵鸟鸣叫.mp3': {
            translations: {
                'zh-CN': '森林 · 百灵鸟合唱',
                en: 'Forest Lark Chorus'
            },
            durationSeconds: 1200,
            tags: ['自然', '清晨', '呼吸'],
            description: '高频的百灵鸟与远处溪流声，适合早晨伸展。',
            instrumentation: 'field recording',
            mood: ['uplifting'],
        },
    },
};

export class AudioMetadata {
    constructor() {
        this.metadata = new Map();
        this.loadDefaultMetadata();
    }

    /**
     * 加载默认元数据
     */
    loadDefaultMetadata() {
        // 从配置加载基础信息
        if (AUDIO_CONFIG) {
            for (const [category, data] of Object.entries(AUDIO_CONFIG.categories)) {
                if (data.files) {
                    data.files.forEach(fileName => {
                        const key = this.generateKey(category, fileName);
                        this.metadata.set(key, this.generateMetadata(category, fileName));
                    });
                }
            }
        }

        console.log(`✅ AudioMetadata 已加载 ${this.metadata.size} 个音频元数据`);
    }

    /**
     * 生成元数据
     */
    generateMetadata(category, fileName) {
        const displayName = fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');

        // 基于分类的默认元数据
        const categoryDefaults = {
            'meditation': {
                description: '专业冥想引导音频，帮助您进入深度放松状态。',
                scenarios: ['sleep', 'meditation', 'relaxation'],
                difficulty: 'beginner',
                duration: '15:00',
                benefits: ['减压', '改善睡眠', '提升专注力'],
                tags: ['冥想', '放松', '正念']
            },
            'Rain': {
                description: '纯净雨声，营造自然放松氛围。',
                scenarios: ['sleep', 'work', 'study'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['助眠', '白噪音', '集中注意力'],
                tags: ['自然音效', '白噪音', '雨声']
            },
            'Singing bowl sound': {
                description: '西藏颂钵音疗，平衡身心能量。',
                scenarios: ['meditation', 'healing', 'yoga'],
                difficulty: 'intermediate',
                duration: '20:00',
                benefits: ['能量平衡', '深度放松', '情绪疗愈'],
                tags: ['音疗', '颂钵', '能量疗愈']
            },
            'Chakra': {
                description: '脉轮专属疗愈音频，平衡七大能量中心。',
                scenarios: ['meditation', 'healing', 'energy_work'],
                difficulty: 'intermediate',
                duration: '25:00',
                benefits: ['能量平衡', '脉轮激活', '身心和谐'],
                tags: ['脉轮', '能量', '疗愈']
            },
            'hypnosis': {
                description: '专业催眠音频，改善睡眠质量。',
                scenarios: ['sleep', 'relaxation'],
                difficulty: 'beginner',
                duration: '45:00',
                benefits: ['深度睡眠', '减少失眠', '放松身心'],
                tags: ['催眠', '睡眠', '深度放松']
            },
            'Animal sounds': {
                description: '大自然动物音效，回归自然怀抱。',
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '20:00',
                benefits: ['放松心情', '自然疗愈', '减压'],
                tags: ['自然音效', '动物', '环境音']
            },
            'Fire': {
                description: '温暖的篝火声音，营造舒适氛围。',
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['温暖舒适', '放松', '营造氛围'],
                tags: ['自然音效', '火焰', '环境音']
            },
            'running water': {
                description: '清澈流水声，宁静的自然之声。',
                scenarios: ['relaxation', 'meditation', 'work'],
                difficulty: 'beginner',
                duration: '25:00',
                benefits: ['心灵净化', '专注', '放松'],
                tags: ['自然音效', '水声', '白噪音']
            },
            'Subconscious Therapy': {
                description: '潜意识重塑音频，积极心理建设',
                scenarios: ['self_improvement', 'meditation', 'sleep'],
                difficulty: 'advanced',
                duration: '35:00',
                benefits: ['潜意识重编程', '积极暗示', '心理疗愈'],
                tags: ['潜意识', '心理疗愈', '自我提升']
            }
        };

        const defaults = categoryDefaults[category] || {
            description: '声音疗愈音频',
            scenarios: ['relaxation'],
            difficulty: 'beginner',
            duration: '20:00',
            benefits: ['放松'],
            tags: [category]
        };

        const override = AUDIO_METADATA_OVERRIDES?.[category]?.[fileName];

        const metadata = {
            category,
            fileName,
            displayName: override?.displayName || displayName,
            ...defaults,
            tags: override?.tags || defaults.tags,
            translations: override?.translations || null,
            durationSeconds: override?.durationSeconds || null,
            instrumentation: override?.instrumentation || null,
            mood: override?.mood || defaults.tags,
            addedAt: new Date().toISOString()
        };

        if (override?.description) {
            metadata.description = override.description;
        }

        return metadata;
    }

    /**
     * 生成唯一键
     */
    generateKey(category, fileName) {
        return `${category}__${fileName}`;
    }

    /**
     * 获取音频元数据
     */
    getMetadata(category, fileName) {
        const key = this.generateKey(category, fileName);
        return this.metadata.get(key) || this.generateMetadata(category, fileName);
    }

    /**
     * 获取当前语言下的显示名称
     */
    getLocalizedTitle(category, fileName, fallbackLang = 'en') {
        const metadata = this.getMetadata(category, fileName);
        if (!metadata) {
            return fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');
        }

        const translations = metadata.translations || {};
        const lang = (document.documentElement?.lang || fallbackLang).toLowerCase();
        const short = lang.split('-')[0];

        return translations[lang] ||
            translations[short] ||
            translations['zh-CN'] ||
            metadata.displayName;
    }

    /**
     * 根据场景搜索音频
     */
    searchByScenario(scenario) {
        const results = [];

        for (const [key, meta] of this.metadata) {
            if (meta.scenarios && meta.scenarios.includes(scenario)) {
                results.push(meta);
            }
        }

        return results;
    }

    /**
     * 根据难度搜索
     */
    searchByDifficulty(difficulty) {
        const results = [];

        for (const [key, meta] of this.metadata) {
            if (meta.difficulty === difficulty) {
                results.push(meta);
            }
        }

        return results;
    }

    /**
     * 根据标签搜索
     */
    searchByTags(tags) {
        const results = [];
        const searchTags = Array.isArray(tags) ? tags : [tags];

        for (const [key, meta] of this.metadata) {
            if (meta.tags) {
                const hasTag = searchTags.some(tag =>
                    meta.tags.some(metaTag =>
                        metaTag.toLowerCase().includes(tag.toLowerCase())
                    )
                );

                if (hasTag) {
                    results.push(meta);
                }
            }
        }

        return results;
    }

    /**
     * 获取所有场景
     */
    getAllScenarios() {
        const scenarios = new Set();

        for (const [key, meta] of this.metadata) {
            if (meta.scenarios) {
                meta.scenarios.forEach(s => scenarios.add(s));
            }
        }

        return Array.from(scenarios);
    }

    /**
     * 获取所有标签
     */
    getAllTags() {
        const tags = new Set();

        for (const [key, meta] of this.metadata) {
            if (meta.tags) {
                meta.tags.forEach(t => tags.add(t));
            }
        }

        return Array.from(tags);
    }

    /**
     * 获取分类统计
     */
    getCategoryStats() {
        const stats = {};

        for (const [key, meta] of this.metadata) {
            if (!stats[meta.category]) {
                stats[meta.category] = {
                    count: 0,
                    difficulties: {},
                    scenarios: new Set()
                };
            }

            stats[meta.category].count++;

            // 难度统计
            if (meta.difficulty) {
                stats[meta.category].difficulties[meta.difficulty] =
                    (stats[meta.category].difficulties[meta.difficulty] || 0) + 1;
            }

            // 场景统计
            if (meta.scenarios) {
                meta.scenarios.forEach(s => stats[meta.category].scenarios.add(s));
            }
        }

        // 转换Set为数组
        for (const category in stats) {
            stats[category].scenarios = Array.from(stats[category].scenarios);
        }

        return stats;
    }
}
