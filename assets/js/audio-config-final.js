// 最终版音频配置 - 使用Archive.org外部存储
// 基于上传到 sound-healing-collection 的文件结构

const AUDIO_CONFIG = {
    // Archive.org 基础配置
    storageType: 'archive', // 存储类型标识
    baseUrl: 'https://archive.org/download/sound-healing-collection/',
    
    // 镜像URLs用于重试机制
    mirrorUrls: [
        'https://ia801504.us.archive.org/download/sound-healing-collection/',
        'https://ia601504.us.archive.org/download/sound-healing-collection/',
        'https://ia601504.us.archive.org/download/sound-healing-collection/'
    ],
    
    // 本地回退URL（如果需要）
    fallbackUrl: null, // 已移除本地文件，设为null
    
    // 音频分类配置
    categories: {
        'Animal sounds': {
            name: '自然动物',
            icon: '🦅',
            description: '鸟鸣、海鸥、森林动物的自然声音',
            archiveFolder: 'animal-sounds/',
            bgColor: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
            files: [
                {
                    filename: 'SPA音乐疗馆 1 - 减压疗程 The Curing Shop - For Decompression.mp3',
                    displayName: 'SPA减压疗程',
                    duration: '36:20',
                    size: '39MB'
                },
                {
                    filename: 'SPA音乐疗馆 4 - 冥想疗程 The Curing Shop - For Meditation.mp3',
                    displayName: 'SPA冥想疗程',
                    duration: '37:45',
                    size: '40MB'
                },
                {
                    filename: '【大自然韵律】鸟儿欢快的鸣叫.mp3',
                    displayName: '大自然韵律·鸟儿欢快的鸣叫',
                    duration: '20:12',
                    size: '22MB'
                },
                {
                    filename: '【沉浸】鸟语花香，流年岁月.mp3',
                    displayName: '沉浸·鸟语花香',
                    duration: '6:45',
                    size: '7.2MB'
                },
                {
                    filename: '【海鸥】超自然睡眠版.mp3',
                    displayName: '海鸥·超自然睡眠版',
                    duration: '10:45',
                    size: '12MB'
                }
                // 更多文件将在上传完成后补充完整列表
            ]
        },
        
        'Chakra': {
            name: '脉轮音乐',
            icon: '💎',
            description: '七脉轮平衡与能量调节音乐',
            archiveFolder: 'chakra/',
            bgColor: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
            files: [
                {
                    filename: 'Hals-Chakra 蓝玉莲华(喉轮).mp3',
                    displayName: '喉轮·蓝玉莲华',
                    duration: '15:20',
                    size: '16MB'
                },
                {
                    filename: 'Herz-Chakra 綠石蓮華(心輪).mp3',
                    displayName: '心轮·绿石莲华',
                    duration: '12:30',
                    size: '13MB'
                }
                // 更多脉轮音乐文件
            ]
        },
        
        'Fire': {
            name: '火焰声音',
            icon: '🔥',
            description: '壁炉、篝火等温暖的火焰声音',
            archiveFolder: 'fire-sounds/',
            bgColor: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
            files: [
                {
                    filename: '下雪天卧室壁炉声木柴燃烧白噪音.mp3',
                    displayName: '雪夜壁炉·木柴燃烧',
                    duration: '58:45',
                    size: '62MB'
                }
                // 更多火焰声音文件
            ]
        },
        
        'hypnosis': {
            name: '催眠音乐',
            icon: '🌙',
            description: '深度放松与催眠引导音乐',
            archiveFolder: 'hypnosis/',
            bgColor: 'linear-gradient(135deg, #3F51B5 0%, #9C27B0 100%)',
            files: [
                // 催眠音乐文件将根据实际上传情况补充
            ]
        },
        
        'meditation': {
            name: '冥想音乐',
            icon: '🧘',
            description: '静心冥想与正念练习音乐',
            archiveFolder: 'meditation/',
            bgColor: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
            files: [
                // 冥想音乐文件
            ]
        },
        
        'Rain': {
            name: '雨声自然',
            icon: '🌧️',
            description: '雷雨、小雨等各种雨声',
            archiveFolder: 'rain-sounds/',
            bgColor: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
            files: [
                // 雨声文件
            ]
        },
        
        'running water': {
            name: '流水声音',
            icon: '🌊',
            description: '溪流、河水等自然水声',
            archiveFolder: 'water-sounds/',
            bgColor: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
            files: [
                // 流水声文件
            ]
        },
        
        'Singing bowl sound': {
            name: '颂钵音疗',
            icon: '🔔',
            description: '藏族颂钵与音疗频率',
            archiveFolder: 'singing-bowls/',
            bgColor: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
            files: [
                // 颂钵音乐文件
            ]
        },
        
        'Subconscious Therapy': {
            name: '潜意识疗愈',
            icon: '✨',
            description: '潜意识调节与心理疗愈音乐',
            archiveFolder: 'subconscious-therapy/',
            bgColor: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
            files: [
                // 潜意识疗愈文件
            ]
        }
    },
    
    // 全局设置
    settings: {
        defaultVolume: 0.5,
        crossfadeTime: 2000,
        bufferSize: 4096,
        preloadCount: 2, // 预加载文件数量
        retryAttempts: 3, // 重试次数
        retryDelay: 1000, // 重试延迟(ms)
        enableCrossfade: true,
        enableVisualization: true
    },
    
    // Archive.org 特定配置
    archiveConfig: {
        collectionId: 'sound-healing-collection',
        verifyDownload: true, // 验证下载完整性
        useCache: true, // 启用本地缓存
        cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7天缓存过期
        maxCacheSize: 100 * 1024 * 1024, // 100MB最大缓存
        enableMirrorFallback: true // 启用镜像站点回退
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUDIO_CONFIG;
} else if (typeof window !== 'undefined') {
    window.AUDIO_CONFIG = AUDIO_CONFIG;
}