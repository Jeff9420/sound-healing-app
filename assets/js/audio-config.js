// Archive.org 外部存储音频配置文件
const AUDIO_CONFIG = {
    // Archive.org 基础URL - 示例集合ID
    baseUrl: 'https://archive.org/download/sound-healing-collection/',
    
    // 备用CDN链接
    mirrorUrls: [
        'https://ia801504.us.archive.org/download/sound-healing-collection/',
        'https://ia601504.us.archive.org/download/sound-healing-collection/'
    ],
    
    // 本地fallback路径（如果Archive.org不可用）
    fallbackUrl: 'assets/audio/',
    
    categories: {
        'Animal sounds': {
            name: '动物声音',
            icon: '🐾',
            description: '自然动物的声音，如鸟鸣、溪水声等',
            archiveFolder: 'animal-sounds/',
            files: [
                {
                    filename: 'spa-music-decompression.mp3',
                    originalName: 'SPA音乐疗馆 1 - 减压疗程 The Curing Shop - For Decompression.mp3',
                    duration: '15:30',
                    size: '14.2MB'
                },
                {
                    filename: 'spa-music-meditation.mp3', 
                    originalName: 'SPA音乐疗馆 4 - 冥想疗程 The Curing Shop - For Meditation.mp3',
                    duration: '12:45',
                    size: '11.8MB'
                },
                {
                    filename: 'nature-bird-songs.mp3',
                    originalName: '【大自然韵律】鸟儿欢快的鸣叫.mp3',
                    duration: '18:20',
                    size: '16.5MB'
                },
                {
                    filename: 'bird-flower-fragrance.mp3',
                    originalName: '【沉浸】鸟语花香，流年岁月.mp3',
                    duration: '22:15',
                    size: '20.1MB'
                },
                {
                    filename: 'seagull-sleep-version.mp3',
                    originalName: '【海鸥】超自然睡眠版.mp3',
                    duration: '28:30',
                    size: '25.8MB'
                }
                // 可以继续添加更多文件...
            ]
        },
        
        'Chakra': {
            name: '脉轮音乐',
            icon: '🌈',
            description: '调节身体能量中心的音乐',
            archiveFolder: 'chakra/',
            files: [
                {
                    filename: 'throat-chakra-blue-lotus.mp3',
                    originalName: 'Hals-Chakra 蓝玉莲华(喉轮).mp3',
                    duration: '20:00',
                    size: '18.2MB',
                    chakra: 'throat',
                    frequency: '741Hz'
                },
                {
                    filename: 'heart-chakra-green-stone.mp3',
                    originalName: 'Herz-Chakra 綠石蓮華(心輪).mp3',
                    duration: '18:45',
                    size: '17.1MB',
                    chakra: 'heart',
                    frequency: '528Hz'
                },
                {
                    filename: 'sacral-chakra-agate.mp3',
                    originalName: 'Milz-Chakra 玛瑙莲华(脐轮).mp3',
                    duration: '19:30',
                    size: '17.8MB',
                    chakra: 'sacral',
                    frequency: '417Hz'
                }
                // 继续添加其他脉轮...
            ]
        },
        
        'Fire': {
            name: '火焰声音',
            icon: '🔥',
            description: '篝火、壁炉等温暖的火焰声音',
            archiveFolder: 'fire/',
            files: [
                {
                    filename: 'bedroom-fireplace-snow.mp3',
                    originalName: '下雪天卧室壁炉声木柴燃烧白噪音.mp3',
                    duration: '60:00',
                    size: '54.5MB',
                    type: 'white-noise'
                },
                {
                    filename: 'riverside-campfire-01.mp3',
                    originalName: '河边点燃篝火、水声和清脆的鸟鸣01.mp3',
                    duration: '45:20',
                    size: '41.2MB',
                    type: 'nature-mix'
                }
                // 继续添加火焰音频...
            ]
        },
        
        'Rain': {
            name: '雨声',
            icon: '🌧️',
            description: '各种雨声，助眠放松必备',
            archiveFolder: 'rain/',
            files: [
                {
                    filename: 'thunder-heavy-rain.mp3',
                    originalName: '一声闷雷，大雨倾盆.mp3',
                    duration: '35:15',
                    size: '32.1MB',
                    intensity: 'heavy',
                    hasThunder: true
                },
                {
                    filename: 'valley-light-rain.mp3',
                    originalName: '倾听山谷中小雨，净化心灵.mp3',
                    duration: '42:30',
                    size: '38.7MB',
                    intensity: 'light',
                    hasThunder: false
                }
                // 继续添加雨声音频...
            ]
        },
        
        'meditation': {
            name: '冥想音乐',
            icon: '🧘',
            description: '专用于冥想、瑜伽的宁静音乐',
            archiveFolder: 'meditation/',
            files: [
                {
                    filename: 'yoga-meditation-essential.mp3',
                    originalName: '冥想 瑜伽必听.mp3',
                    duration: '30:00',
                    size: '27.3MB',
                    style: 'yoga'
                },
                {
                    filename: 'sleep-meditation-guide.mp3',
                    originalName: '冥想引导词，睡前..曲，专治失眠.mp3',
                    duration: '25:45',
                    size: '23.4MB',
                    style: 'sleep-guide'
                }
                // 继续添加冥想音频...
            ]
        },
        
        'hypnosis': {
            name: '催眠音乐',
            icon: '😴',
            description: '专业催眠和深度放松音乐',
            archiveFolder: 'hypnosis/',
            files: [
                {
                    filename: 'bolo-ram.mp3',
                    originalName: 'Bolo Ram.mp3',
                    duration: '12:30',
                    size: '11.4MB',
                    type: 'mantra'
                },
                {
                    filename: 'om-mani-padme-hum.mp3',
                    originalName: 'Om Mani Padme Hum.mp3',
                    duration: '15:20',
                    size: '14.0MB',
                    type: 'tibetan-mantra'
                }
                // 继续添加催眠音频...
            ]
        },
        
        'running water': {
            name: '流水声',
            icon: '💧',
            description: '溪流、河水等自然流水声',
            archiveFolder: 'water/',
            files: [
                {
                    filename: 'piano-flowing-water.mp3',
                    originalName: '【冥想音乐】钢琴 & 流水声 .mp3',
                    duration: '20:15',
                    size: '18.4MB',
                    instruments: ['piano', 'water']
                },
                {
                    filename: 'gentle-stream-caress.mp3',
                    originalName: '缓缓流水，温柔的抚摸脸颊，恋人般的感觉（上）.mp3',
                    duration: '25:30',
                    size: '23.2MB',
                    type: 'gentle-stream'
                }
                // 继续添加流水音频...
            ]
        },
        
        'Singing bowl sound': {
            name: '颂钵声音',
            icon: '🎵',
            description: '藏族颂钵音疗，身心疗愈',
            archiveFolder: 'singing-bowls/',
            files: [
                {
                    filename: 'healing-bowls-jane-winther.mp3',
                    originalName: '01-Healing Bowls - Instrumental - Jane Winther.mp3',
                    duration: '18:45',
                    size: '17.1MB',
                    artist: 'Jane Winther',
                    type: 'instrumental'
                },
                {
                    filename: 'tibetan-meditation-academy.mp3',
                    originalName: '04-Singing Bowls - Tibetan Meditation Academy.mp3',
                    duration: '22:15',
                    size: '20.2MB',
                    artist: 'Tibetan Meditation Academy',
                    type: 'traditional'
                }
                // 继续添加颂钵音频...
            ]
        },
        
        'Subconscious Therapy': {
            name: '潜意识疗愈',
            icon: '🌙',
            description: '潜意识层面的心理疗愈音乐',
            archiveFolder: 'subconscious/',
            files: [
                {
                    filename: 'new-beginning.mp3',
                    originalName: '全新的开始.mp3',
                    duration: '16:30',
                    size: '15.0MB',
                    theme: 'renewal'
                },
                {
                    filename: 'awakening.mp3',
                    originalName: '唤醒.mp3',
                    duration: '14:20',
                    size: '13.1MB',
                    theme: 'awakening'
                }
                // 继续添加潜意识疗愈音频...
            ]
        }
    }
};

// Archive.org URL生成器
function generateArchiveUrl(category, file) {
    const baseUrl = AUDIO_CONFIG_ARCHIVE.baseUrl;
    const folder = AUDIO_CONFIG_ARCHIVE.categories[category].archiveFolder;
    return `${baseUrl}${folder}${file.filename}`;
}

// 获取镜像URL（如果主URL失败）
function getMirrorUrl(category, file, mirrorIndex = 0) {
    const mirrorUrls = AUDIO_CONFIG_ARCHIVE.mirrorUrls;
    if (mirrorIndex < mirrorUrls.length) {
        const folder = AUDIO_CONFIG_ARCHIVE.categories[category].archiveFolder;
        return `${mirrorUrls[mirrorIndex]}${folder}${file.filename}`;
    }
    return null;
}

// 获取本地fallback URL
function getFallbackUrl(category, file) {
    const fallbackUrl = AUDIO_CONFIG_ARCHIVE.fallbackUrl;
    return `${fallbackUrl}${category}/${file.originalName}`;
}

// 导出配置和工具函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AUDIO_CONFIG_ARCHIVE,
        generateArchiveUrl,
        getMirrorUrl,
        getFallbackUrl
    };
}