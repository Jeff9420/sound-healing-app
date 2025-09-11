// 音频配置文件 - Archive.org外部存储版本
const AUDIO_CONFIG = {
    // 存储配置
    storageType: 'archive',
    baseUrl: 'https://archive.org/download/sound-healing-collection/',
    
    // 镜像URLs用于重试机制
    mirrorUrls: [
        'https://ia801504.us.archive.org/download/sound-healing-collection/',
        'https://ia601504.us.archive.org/download/sound-healing-collection/',
        'https://ia601504.us.archive.org/download/sound-healing-collection/'
    ],
    
    // 分类配置
    categories: {
        'Animal sounds': {
            name: '动物声音',
            icon: '🐾',
            description: '自然动物的声音，如鸟鸣、溪水声等',
            archiveFolder: 'animal-sounds/',
            files: [
                'SPA音乐疗馆 1 - 减压疗程 The Curing Shop - For Decompression.mp3',
                'SPA音乐疗馆 4 - 冥想疗程 The Curing Shop - For Meditation.mp3',
                '【大自然韵律】鸟儿欢快的鸣叫.mp3',
                '【沉浸】鸟语花香，流年岁月.mp3',
                '【海鸥】超自然睡眠版.mp3',
                '动物叫声 空旷山谷里的杜鹃.mp3',
                '喜鹊叫声、犬吠、 布谷鸟交织在一起的华丽乐章.mp3',
                '天然大森里的动物欢叫声音.mp3',
                '天空上非常空灵的鸟叫，不知道什么名字.mp3',
                '天籁之音，清脆的鸟鸣【放松减压】.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（上）.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（下）.mp3',
                '山间清澈的小溪声音伴着清脆的鸟叫（中）.mp3',
                '枕着鸟儿的欢叫、母鸡的悠闲睡眠.mp3',
                '森林里百灵鸟鸣叫.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（上）.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（下）.mp3',
                '歌唱的小鸟 减压静心 配舒缓音乐（中）.mp3',
                '气场修补：钵声.敲与磨.潺潺流水.鸟鸣.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣01.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣02.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣03.mp3',
                '海鸥的叫声，海浪的声音（上）.mp3',
                '海鸥的叫声，海浪的声音（下）.mp3',
                '蜜蜂与小鸟对唱.mp3',
                '非常难得的清脆鸟叫，深山里录制.mp3'
            ]
        },
        'Chakra': {
            name: '脉轮音乐',
            icon: '🌈',
            description: '调节身体能量中心的音乐',
            archiveFolder: 'chakra/',
            files: [
                'Hals-Chakra 蓝玉莲华(喉轮).mp3',
                'Herz-Chakra 綠石蓮華(心輪).mp3',
                'Milz-Chakra 玛瑙莲华(脐轮).mp3',
                'Nabel-Chakra 水晶莲华(太阳神经严).mp3',
                'Scheitel-Chakra 紫晶莲华(顶轮).mp3',
                'Stirn-Chakra 石英莲华(眉轮).mp3',
                'Wurzel-Chakra 碧玉莲华(海底轮).mp3'
            ]
        },
        'Fire': {
            name: '火焰声音',
            icon: '🔥',
            description: '壁炉、篝火等温暖舒缓的声音',
            archiveFolder: 'fire-sounds/',
            files: [
                '下雪天卧室壁炉声木柴燃烧白噪音.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣01.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣02.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣03.mp3'
            ]
        },
        'hypnosis': {
            name: '催眠音乐',
            icon: '🌙',
            description: '深度放松与催眠引导音乐',
            archiveFolder: 'hypnosis/',
            files: [
                'Bolo Ram.mp3',
                'Gayatri (Luscious Chill Mix).mp3',
                'Gopala Hare.mp3',
                'Hare Krishna.mp3',
                'Heart Sutra.mp3',
                'Is It Love.mp3',
                'Om Mani Padme Hum.mp3',
                'Om Namah Shivaya.mp3',
                'Opening.mp3',
                'Opium.mp3',
                'Raksha Ma.mp3',
                'Shree Ram  Om.mp3',
                'Stay In My Heart.mp3',
                '催眠专用冥想音乐1.mp3',
                '催眠专用冥想音乐2.mp3',
                '催眠专用冥想音乐3.mp3',
                '催眠专用冥想音乐4.mp3',
                '催眠专用治疗音乐1.mp3',
                '催眠专用治疗音乐2.mp3',
                '催眠专用治疗音乐3.mp3',
                '放松轻音乐1.mp3',
                '放松轻音乐2.mp3'
                // 更多催眠音乐文件...
            ]
        },
        'meditation': {
            name: '冥想音乐',
            icon: '🧘',
            description: '静心冥想与正念练习音乐',
            archiveFolder: 'meditation/',
            files: [
                '冥想 瑜伽必听.mp3',
                '冥想引导词，睡前..曲，专治失眠.mp3',
                '冥想放松 瑜伽舒缓音乐.mp3',
                '减压舒缓放松的神奇音乐.mp3',
                '听海观岸，纯海浪的声音 冥想...mp3',
                '大自然冥想音乐---听声音.mp3',
                '好听的瑜伽冥想音乐.mp3',
                '带您进入深层次睡眠.mp3',
                '开悟.mp3',
                '疗愈神经衰弱，夜深人静聆听.mp3',
                '盘坐冥想，空灵放松.mp3',
                '空怀虚谷.mp3',
                '美妙的音乐，打坐冥想，帮助睡眠，.mp3',
                '静心 大彻大悟.mp3'
            ]
        },
        'Rain': {
            name: '雨声自然',
            icon: '🌧️',
            description: '各种雨声，雷声等自然音效',
            archiveFolder: 'rain-sounds/',
            files: [
                '一声闷雷，大雨倾盆.mp3',
                '倾听山谷中小雨，净化心灵.mp3',
                '奶奶家里听打雷下雨-..必备，治愈失眠.mp3',
                '小时候打雷下雨-..必备，治愈失眠01.mp3',
                '小时候打雷下雨-..必备，治愈失眠02.mp3',
                '小雨 入眠 助眠，学习，冥想，放松 .mp3',
                '记住乡愁打雷下雨-..必备，治愈失眠03.mp3',
                '记住乡愁打雷下雨-..必备，治愈失眠04.mp3',
                '记住乡愁打雷下雨-..必备，治愈失眠05.mp3',
                '记住乡愁打雷下雨-..必备，治愈失眠06.mp3',
                '记住乡愁打雷下雨-..必备，治愈失眠09.mp3',
                '记住乡愁打雷下雨-必备，治愈失眠07.mp3',
                '记住乡愁雷雨过后-..必备，治愈失眠08.mp3',
                '身临情景的雨声.mp3'
            ]
        },
        'running water': {
            name: '流水声音',
            icon: '🌊',
            description: '溪流、河水等自然水声',
            archiveFolder: 'water-sounds/',
            files: [
                '【冥想音乐】钢琴 & 流水声 .mp3',
                '河边点燃篝火、水声和清脆的鸟鸣01.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣02.mp3',
                '河边点燃篝火、水声和清脆的鸟鸣03.mp3',
                '缓缓流水，温柔的抚摸脸颊，恋人般的感觉（上）.mp3',
                '缓缓流水，温柔的抚摸脸颊，恋人般的感觉（下）.mp3'
            ]
        },
        'Singing bowl sound': {
            name: '颂钵音疗',
            icon: '🔔',
            description: '藏族颂钵与音疗频率',
            archiveFolder: 'singing-bowls/',
            files: [
                '01-Healing Bowls - Instrumental - Jane Winther.mp3',
                '02-Falling Still (Moving Toward Nothingness) - Diane Mandle.mp3',
                '03-Return to Om - Diane Mandle.mp3',
                '04-Singing Bowls - Tibetan Meditation Academy.mp3',
                '05-Relaxing Tibetan Bowl - Buddhism Academy.mp3',
                '06-Spiritual Sanctuary - Buddhism Academy.mp3',
                '07-Cycle of Life and Death - Buddha Music Sanctuary.mp3',
                '08-Sacral Chakra (Singing Bowl Only) - Ben Scott.mp3',
                '09-Sonic Massage(Singing Bowl Only) - Ben Scott.mp3',
                '10-The Sea and Healing Bowls II - Jane Winther.mp3',
                '11-The Sea and Healing Bowls - Jane Winther.mp3',
                '12-Singingbowls - Instrumental - Jane Winther.mp3',
                '13-Singing Bowls & Bells - Jane Winther.mp3'
                // 更多颂钵音乐文件...
            ]
        },
        'Subconscious Therapy': {
            name: '潜意识疗愈',
            icon: '✨',
            description: '潜意识调节与心理疗愈音乐',
            archiveFolder: 'subconscious-therapy/',
            files: [
                '全新的开始.mp3',
                '净空.mp3',
                '唤醒.mp3',
                '回忆微微笑.mp3',
                '微醺.mp3',
                '柔情.mp3',
                '梦起始的地方.mp3',
                '滴落的星子.mp3',
                '生机无限.mp3',
                '薄纱之舞.mp3',
                '遇见林间精灵.mp3'
            ]
        }
    },
    
    // Archive.org特定配置
    archiveConfig: {
        collectionId: 'sound-healing-collection',
        retryAttempts: 3,
        retryDelay: 1000,
        verifyDownload: true,
        enableCache: true,
        cacheExpiry: 7 * 24 * 60 * 60 * 1000 // 7天
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUDIO_CONFIG;
} else if (typeof window !== 'undefined') {
    window.AUDIO_CONFIG = AUDIO_CONFIG;
}