/**
 * AudioMetadata - 闊抽鍏冩暟鎹鐞嗙郴缁? *
 * 涓烘瘡涓煶棰戞彁渚涜缁嗙殑鍏冩暟鎹俊鎭?
 * - 鎻忚堪銆佹椂闀裤€侀€傜敤鍦烘櫙
 * - 闅惧害绛夌骇銆佹爣绛? * - 绯诲垪璇剧▼淇℃伅
 *
 * @class
 * @version 1.0.0
 */

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

class AudioMetadata {
    constructor() {
        this.metadata = new Map();
        this.loadDefaultMetadata();
    }

    /**
     * 鍔犺浇榛樿鍏冩暟鎹?     */
    loadDefaultMetadata() {
        // 浠庨厤缃姞杞藉熀纭€淇℃伅
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

        console.log(`鉁?AudioMetadata 宸插姞杞?${this.metadata.size} 涓煶棰戝厓鏁版嵁`);
    }

    /**
     * 鐢熸垚鍏冩暟鎹?     */
    generateMetadata(category, fileName) {
        const displayName = fileName.replace(/\.(mp3|wav|ogg|m4a|wma|flac|aac)$/i, '');

        // 鍩轰簬鍒嗙被鐨勯粯璁ゅ厓鏁版嵁
        const categoryDefaults = {
            'meditation': {
                description: '涓撲笟鍐ユ兂寮曞闊抽锛屽府鍔╂偍杩涘叆娣卞害鏀炬澗鐘舵€?,
                scenarios: ['sleep', 'meditation', 'relaxation'],
                difficulty: 'beginner',
                duration: '15:00',
                benefits: ['鍑忓帇', '鏀瑰杽鐫＄湢', '鎻愬崌涓撴敞鍔?],
                tags: ['鍐ユ兂', '鏀炬澗', '姝ｅ康']
            },
            'Rain': {
                description: '绾噣闆ㄥ０锛岃惀閫犺嚜鐒舵斁鏉炬皼鍥?,
                scenarios: ['sleep', 'work', 'study'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['鍔╃湢', '鐧藉櫔闊?, '闆嗕腑娉ㄦ剰鍔?],
                tags: ['鑷劧闊虫晥', '鐧藉櫔闊?, '闆ㄥ０']
            },
            'Singing bowl sound': {
                description: '瑗胯棌棰傞挼闊崇枟锛屽钩琛¤韩蹇冭兘閲?,
                scenarios: ['meditation', 'healing', 'yoga'],
                difficulty: 'intermediate',
                duration: '20:00',
                benefits: ['鑳介噺骞宠　', '娣卞害鏀炬澗', '鎯呯华鐤楁剤'],
                tags: ['闊崇枟', '棰傞挼', '鑳介噺鐤楁剤']
            },
            'Chakra': {
                description: '鑴夎疆涓撳睘鐤楁剤闊抽锛屽钩琛′竷澶ц兘閲忎腑蹇?,
                scenarios: ['meditation', 'healing', 'energy_work'],
                difficulty: 'intermediate',
                duration: '25:00',
                benefits: ['鑳介噺骞宠　', '鑴夎疆婵€娲?, '韬績鍜岃皭'],
                tags: ['鑴夎疆', '鑳介噺', '鐤楁剤']
            },
            'hypnosis': {
                description: '涓撲笟鍌湢闊抽锛屾敼鍠勭潯鐪犺川閲?,
                scenarios: ['sleep', 'relaxation'],
                difficulty: 'beginner',
                duration: '45:00',
                benefits: ['娣卞害鐫＄湢', '鍑忓皯澶辩湢', '鏀炬澗韬績'],
                tags: ['鍌湢', '鐫＄湢', '娣卞害鏀炬澗']
            },
            'Animal sounds': {
                description: '澶ц嚜鐒跺姩鐗╅煶鏁堬紝鍥炲綊鑷劧鎬€鎶?,
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '20:00',
                benefits: ['鏀炬澗蹇冩儏', '鑷劧鐤楁剤', '鍑忓帇'],
                tags: ['鑷劧闊虫晥', '鍔ㄧ墿', '鐜闊?]
            },
            'Fire': {
                description: '娓╂殩鐨勭瘽鐏０闊筹紝钀ラ€犺垝閫傛皼鍥?,
                scenarios: ['relaxation', 'sleep', 'background'],
                difficulty: 'beginner',
                duration: '30:00',
                benefits: ['娓╂殩鑸掗€?, '鏀炬澗', '钀ラ€犳皼鍥?],
                tags: ['鑷劧闊虫晥', '鐏劙', '鐜闊?]
            },
            'running water': {
                description: '娓呮緢娴佹按澹帮紝瀹侀潤鐨勮嚜鐒朵箣澹?,
                scenarios: ['relaxation', 'meditation', 'work'],
                difficulty: 'beginner',
                duration: '25:00',
                benefits: ['蹇冪伒鍑€鍖?, '涓撴敞', '鏀炬澗'],
                tags: ['鑷劧闊虫晥', '姘村０', '鐧藉櫔闊?]
            },
            'Subconscious Therapy': {
                description: '娼滄剰璇嗛噸濉戦煶棰戯紝绉瀬蹇冪悊寤鸿',
                scenarios: ['self_improvement', 'meditation', 'sleep'],
                difficulty: 'advanced',
                duration: '35:00',
                benefits: ['娼滄剰璇嗛噸缂栫▼', '绉瀬鏆楃ず', '蹇冪悊鐤楁剤'],
                tags: ['娼滄剰璇?, '蹇冪悊鐤楁剤', '鑷垜鎻愬崌']
            }
        };

        const defaults = categoryDefaults[category] || {
            description: '澹伴煶鐤楁剤闊抽',
            scenarios: ['relaxation'],
            difficulty: 'beginner',
            duration: '20:00',
            benefits: ['鏀炬澗'],
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
     * 鐢熸垚鍞竴閿?     */
    generateKey(category, fileName) {
        return `${category}__${fileName}`;
    }

    /**
     * 鑾峰彇闊抽鍏冩暟鎹?     */
    getMetadata(category, fileName) {
        const key = this.generateKey(category, fileName);
        return this.metadata.get(key) || this.generateMetadata(category, fileName);
    }

    /**
     * 鑾峰彇褰撳墠璇█涓嬬殑鏄剧ず鍚嶇О
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
     * 鏍规嵁鍦烘櫙鎼滅储闊抽
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
     * 鏍规嵁闅惧害鎼滅储
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
     * 鏍规嵁鏍囩鎼滅储
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
     * 鑾峰彇鎵€鏈夊満鏅?     */
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
     * 鑾峰彇鎵€鏈夋爣绛?     */
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
     * 鑾峰彇鍒嗙被缁熻
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

            // 闅惧害缁熻
            if (meta.difficulty) {
                stats[meta.category].difficulties[meta.difficulty] =
                    (stats[meta.category].difficulties[meta.difficulty] || 0) + 1;
            }

            // 鍦烘櫙缁熻
            if (meta.scenarios) {
                meta.scenarios.forEach(s => stats[meta.category].scenarios.add(s));
            }
        }

        // 杞崲Set涓烘暟缁?        for (const category in stats) {
            stats[category].scenarios = Array.from(stats[category].scenarios);
        }

        return stats;
    }
}

// 鍒涘缓鍏ㄥ眬瀹炰緥
if (typeof window !== 'undefined') {
    window.AudioMetadata = AudioMetadata;
    window.audioMetadata = new AudioMetadata();
    console.log('鉁?AudioMetadata 宸插垱寤?);
}
