/**
 * AudioMetadata - 音频元数据管理系统
 *
 * 为每个音频提供详细的元数据信息:
 * - 描述、时长、适用场景
 * - 难度等级、标签
 * - 系列课程信息
 *
 * @class
 * @version 1.0.0
 */

class AudioMetadata {
    constructor() {
        this.metadata = new Map();
        this.loadDefaultMetadata();
    }

    /**
     * 加载默认元数据
     */
    loadDefaultMetadata() {
        // 从配置加载基础信息
        if (typeof AUDIO_CONFIG !== 'undefined') {
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
                description: '专业冥想引导音频，帮助您进入深度放松状态',
                scenarios: ['sleep', 'meditation', 'relaxation'],
                difficulty: 'beginner',
                duration: '15:00',
                benefits: ['减压', '改善睡眠', '提升专注力'],
                tags: ['冥想', '放松', '正念']
            },
            'Rain': {
                description: '纯净雨声，营造自然放松氛围',
                scenarios: ['sleep', 'work', 'study'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['助眠', '白噪音', '集中注意力'],
                tags: ['自然音效', '白噪音', '雨声']
            },
            'Singing bowl sound': {
                description: '西藏颂钵音疗，平衡身心能量',
                scenarios: ['meditation', 'healing', 'yoga'],
                difficulty: 'intermediate',
                duration: '20:00',
                benefits: ['能量平衡', '深度放松', '情绪疗愈'],
                tags: ['音疗', '颂钵', '能量疗愈']
            },
            'Chakra': {
                description: '脉轮专属疗愈音频，平衡七大能量中心',
                scenarios: ['meditation', 'healing', 'energy_work'],
                difficulty: 'intermediate',
                duration: '25:00',
                benefits: ['能量平衡', '脉轮激活', '身心和谐'],
                tags: ['脉轮', '能量', '疗愈']
            },
            'hypnosis': {
                description: '专业催眠音频，改善睡眠质量',
                scenarios: ['sleep', 'relaxation'],
                difficulty: 'beginner',
                duration: '45:00',
                benefits: ['深度睡眠', '减少失眠', '放松身心'],
                tags: ['催眠', '睡眠', '深度放松']
            },
            'Animal sounds': {
                description: '大自然动物音效，回归自然怀抱',
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '20:00',
                benefits: ['放松心情', '自然疗愈', '减压'],
                tags: ['自然音效', '动物', '环境音']
            },
            'Fire': {
                description: '温暖的篝火声音，营造舒适氛围',
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['温暖舒适', '放松', '营造氛围'],
                tags: ['自然音效', '火焰', '环境音']
            },
            'running water': {
                description: '清澈流水声，宁静的自然之声',
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

        return {
            category,
            fileName,
            displayName,
            ...defaults,
            addedAt: new Date().toISOString()
        };
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

// 创建全局实例
if (typeof window !== 'undefined') {
    window.AudioMetadata = AudioMetadata;
    window.audioMetadata = new AudioMetadata();
    console.log('✅ AudioMetadata 已创建');
}
