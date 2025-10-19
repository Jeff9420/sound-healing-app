/**
 * 国际化(i18n)系统 - 声音疗愈应用多语言支持
 * 支持中文、英语、日语、韩语、西班牙语等多种语言
 * 目标：提供流畅的多语言切换体验
 * 
 * @author Claude Code Performance Optimization - Multilingual
 * @date 2024-09-05
 * @version 4.0.0
 */

class InternationalizationSystem {
    constructor() {
        // 支持的语言配置
        this.supportedLanguages = {
            'zh-CN': {
                code: 'zh-CN',
                name: '简体中文',
                nativeName: '简体中文',
                flag: '🇨🇳',
                rtl: false,
                fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif'
            },
            'en-US': {
                code: 'en-US',
                name: 'English',
                nativeName: 'English',
                flag: '🇺🇸',
                rtl: false,
                fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
            },
            'ja-JP': {
                code: 'ja-JP',
                name: 'Japanese',
                nativeName: '日本語',
                flag: '🇯🇵',
                rtl: false,
                fontFamily: '"Hiragino Sans", "Yu Gothic", "Meiryo", "Takao", "Microsoft YaHei", sans-serif'
            },
            'ko-KR': {
                code: 'ko-KR',
                name: 'Korean',
                nativeName: '한국어',
                flag: '🇰🇷',
                rtl: false,
                fontFamily: '"Malgun Gothic", "Noto Sans KR", "Apple Gothic", sans-serif'
            },
            'es-ES': {
                code: 'es-ES',
                name: 'Spanish',
                nativeName: 'Español',
                flag: '🇪🇸',
                rtl: false,
                fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
            }
        };
        
        // 当前语言 - 默认英语
        this.currentLanguage = 'en-US';
        this.fallbackLanguage = 'en-US';
        
        // 翻译数据存储
        this.translations = new Map();
        this.loadedLanguages = new Set();
        
        // 语言变更监听器
        this.languageChangeListeners = new Set();
        
        // 格式化器
        this.formatters = {
            number: new Map(),
            date: new Map(),
            time: new Map()
        };
        
        // 初始化状态标志
        this.isInitialized = false;
        
        this.initializeSystem();
    }
    
    /**
     * 初始化国际化系统
     */
    async initializeSystem() {
        console.log('🌍 启动国际化系统...');
        
        try {
            // 检测用户语言偏好
            this.detectUserLanguage();
            
            // 加载翻译数据
            await this.loadTranslations();
            
            // 初始化格式化器
            this.initializeFormatters();
            
            // 应用当前语言
            await this.applyLanguage(this.currentLanguage);
            
            // 设置初始化完成标志
            this.isInitialized = true;
            
            console.log(`✅ 国际化系统启动完成，当前语言: ${this.currentLanguage}`);
            
        } catch (error) {
            console.error('❌ 国际化系统启动失败:', error);
            // 降级到中文
            this.currentLanguage = 'zh-CN';
        }
    }
    
    /**
     * 检测用户语言偏好
     */
    detectUserLanguage() {
        // 优先级：本地存储 > 浏览器语言 > 默认英语
        const savedLanguage = localStorage.getItem('sound_healing_language');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            console.log(`📱 使用保存的语言偏好: ${savedLanguage}`);
            return;
        }
        
        // 检测浏览器语言
        const browserLang = navigator.language || navigator.languages?.[0];
        if (browserLang) {
            // 匹配完整的语言代码
            if (this.supportedLanguages[browserLang]) {
                this.currentLanguage = browserLang;
                console.log(`🌐 检测到浏览器语言: ${browserLang}`);
                return;
            }
            
            // 匹配语言主代码 (如 'en' 匹配 'en-US')
            const langCode = browserLang.split('-')[0];
            const matchedLang = Object.keys(this.supportedLanguages).find(
                key => key.startsWith(langCode)
            );
            
            if (matchedLang) {
                this.currentLanguage = matchedLang;
                console.log(`🌐 匹配浏览器语言: ${browserLang} -> ${matchedLang}`);
                return;
            }
        }
        
        console.log(`🌐 使用默认语言: ${this.currentLanguage}`);
    }
    
    /**
     * 加载翻译数据
     */
    async loadTranslations() {
        console.log('📚 加载翻译数据...');
        
        // 首先加载当前语言
        await this.loadLanguageData(this.currentLanguage);
        
        // 加载后备语言（如果不同）
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadLanguageData(this.fallbackLanguage);
        }
    }
    
    /**
     * 加载指定语言数据
     */
    async loadLanguageData(langCode) {
        if (this.loadedLanguages.has(langCode)) {
            return; // 已加载
        }
        
        try {
            const translations = this.getTranslationData(langCode);
            this.translations.set(langCode, translations);
            this.loadedLanguages.add(langCode);
            
            console.log(`✅ 已加载 ${langCode} 翻译数据`);
            
        } catch (error) {
            console.warn(`⚠️ 加载 ${langCode} 翻译数据失败:`, error);
        }
    }
    
    /**
     * 获取翻译数据（内嵌式，避免网络请求）
     */
    getTranslationData(langCode) {
        const translations = {
            'zh-CN': {
                // 页面标题和基本信息 - 修复HTML data-i18n匹配
                'meta.description': '声音疗愈应用 - 聆听大自然的治愈之声，重归内心宁静',
                'meta.appTitle': '声音疗愈',
                'meta.title': '声音疗愈 - 自然之声',
                'app.title': '声音疗愈',
                'app.subtitle': '聆听大自然的治愈之声，重归内心宁静',
                'app.footer': '🎧 使用耳机聆听，获得最佳的自然疗愈体验',
                'app.ready': '声音疗愈空间已准备就绪！',

                // 加载屏幕
                'loading.text': '🎵 正在加载声音疗愈空间...',
                'loading.subtext': '请稍候，正在加载疗愈音频',

                // 模态框
                'modal.close': '×',

                // 播放列表
                'playlist.title': '选择音频',
                
                // 头部区域
                'header.title': '声音疗愈',
                'header.subtitle': '聆听大自然的治愈之声，重归内心宁静',
                
                // 主界面
                'main.exploreTitle': '探索声音生态',
                'main.explore': '探索声音生态',
                'main.selectSound': '选择您的疗愈之声',
                'main.startJourney': '开始您的自然之旅',
                
                // 播放器
                'player.selectSound': '选择您的疗愈之声',
                'player.startJourney': '开始您的自然之旅',
                'player.noAudioSelected': '未选择音频',
                'player.playButton': '主播放按钮',
                'player.notPlaying': '未播放',
                'player.nowPlaying': '正在播放',
                'player.playError': '播放失败，请点击播放按钮',
                'player.shuffle': '随机播放',
                'player.shuffleOn': '随机播放已开启',
                'player.shuffleOff': '随机播放已关闭',
                'player.repeat': '循环播放',
                'player.repeatSingle': '单曲循环已开启',
                'player.repeatAll': '循环播放已开启',
                'player.sleepTimer': '睡眠定时器',
                'player.minimize': '▲ 收起',
                'player.expand': '▼ 展开',
                'player.playbackRate': '播放速度',
                
                // 疗愈模式
                'healing.mode.focus': '专注模式',
                'healing.mode.relax': '放松模式',
                'healing.mode.sleep': '睡眠模式',
                'healing.mode.meditation': '冥想模式',
                'healing.mode.work': '工作模式',
                'healing.mode.nature': '自然模式',
                
                // 疗愈模式描述
                'healing.desc.focus': '帮助集中注意力',
                'healing.desc.relax': '缓解压力和紧张',
                'healing.desc.sleep': '帮助快速入眠',
                'healing.desc.meditation': '深度内观和平静',
                'healing.desc.work': '提高工作效率',
                'healing.desc.nature': '感受大自然的力量',
                
                // 音频分类
                'category.Rain': '雨声',
                'category.ocean': '海浪声',
                'category.wind': '风声',
                'category.fire': '篝火声',
                'category.stream': '溪流声',
                'category.birds': '鸟鸣声',
                'category.meditation': '冥想音乐',
                'category.Singing bowl sound': '颂钵音声',
                
                // 控制按钮
                'controls.play': '播放',
                'controls.pause': '暂停',
                'controls.stop': '停止',
                'controls.previous': '上一首',
                'controls.next': '下一首',
                'controls.playPause': '播放/暂停',
                'controls.shuffle': '随机播放',
                'controls.repeat': '重复播放',
                'controls.timer': '睡眠定时',
                'controls.volume': '音量',
                'controls.atmosphere': '氛围',
                
                // 播放列表控制
                'playlist.shuffle': '随机播放',
                'playlist.repeat': '重复播放',
                'playlist.backToEcosystem': '🌿 返回生态',
                'playlist.habitatAudio': '栖息地音频',
                
                // 播放列表
                'playlist.backToEcosystem': '🌿 返回生态',
                'playlist.habitatAudio': '栖息地音频',
                'playlist.noTrack': '未选择音频',
                'playlist.currentTime': '当前时间',
                'playlist.totalTime': '总时长',
                
                // 定时器
                'timer.none': '无定时',
                'timer.5min': '5分钟',
                'timer.10min': '10分钟',
                'timer.15min': '15分钟',
                'timer.off': '关闭',
                'timer.30min': '30分钟',
                'timer.60min': '60分钟',
                'timer.90min': '90分钟',
                'timer.120min': '120分钟',
                'timer.start': '开始',
                'timer.notStarted': '未启动',
                'timer.active': '定时器激活',
                'timer.remaining': '剩余时间',
                'timer.title': '睡眠定时器',
                'timer.set': '睡眠定时器已设置为',
                'timer.minutes': '分钟',
                'timer.stopped': '睡眠定时器已停止播放',
                'timer.closed': '睡眠定时器已关闭',
                
                // 季节
                'season.spring': '春',
                'season.summer': '夏',
                'season.autumn': '秋',
                'season.winter': '冬',
                
                // 消息提示
                'message.sessionReminder': '已聆听 {minutes} 分钟，注意适当休息',
                'message.modeChanged': '模式已切换至',
                'message.languageChanged': '语言已切换至',
                'message.timerSet': '定时器设置为 {duration} 分钟',
                'message.loading': '加载中...',
                'message.error': '出现错误',
                
                // 智能推荐
                'recommendation.morning': '清晨时光，唤醒内心的平静与专注',
                'recommendation.work': '工作时间，推荐有助专注的自然声音',
                'recommendation.evening': '傍晚时分，适合减压和放松的音频',
                'recommendation.night': '夜间时光，推荐舒缓的声音帮助放松',
                
                // 房间卡片翻译 (用于动态生成的房间)
                'rooms.Subconscious Therapy': '潜识星域',
                'rooms.hypnosis': '梦境花园',
                'rooms.meditation': '禅境山谷',
                'rooms.Singing bowl sound': '颂钵圣殿',
                'rooms.Rain': '雨林圣地',
                'rooms.Chakra': '能量场域',
                'rooms.Animal sounds': '森林栖息地',
                'rooms.Fire': '温暖壁炉',
                'rooms.running water': '溪流秘境',

                // 播放列表界面翻译
                'rooms.showPlaylist': '显示播放列表',
                'rooms.hidePlaylist': '隐藏播放列表',
                'playlist.title': '播放列表',
                'playlist.noTracks': '此分类暂无音频文件',
                'playlist.loading': '加载中...',

                // 生态系统卡片
                'ecosystem.Animal sounds.name': '森林栖息地',
                'ecosystem.Animal sounds.type': '鸟类与动物声',
                'ecosystem.Animal sounds.desc': '深入原始森林，聆听鸟儿清晨的歌唱、溪水的潺潺声，感受生命的和谐律动',
                'ecosystem.Chakra.name': '能量场域',
                'ecosystem.Chakra.type': '脉轮音疗',
                'ecosystem.Chakra.desc': '调和身体七个能量中心，通过古老的频率疗法恢复内在平衡与活力',
                'ecosystem.Fire.name': '温暖壁炉',
                'ecosystem.Fire.type': '火焰与温暖',
                'ecosystem.Fire.desc': '围坐在温暖的火炉旁，木柴燃烧的声音带来家的安全感和内心的宁静',
                'ecosystem.hypnosis.name': '梦境花园',
                'ecosystem.hypnosis.type': '催眠引导',
                'ecosystem.hypnosis.desc': '专业的催眠引导声音，带您穿越意识的边界，进入深层疗愈的梦境空间',
                'ecosystem.meditation.name': '禅境山谷',
                'ecosystem.meditation.type': '冥想音乐',
                'ecosystem.meditation.desc': '在宁静的山谷中冥想，专为瑜伽和静心练习设计的和谐音乐',
                'ecosystem.Rain.name': '雨林圣地',
                'ecosystem.Rain.type': '雨声净化',
                'ecosystem.Rain.desc': '雨滴敲打大地的天籁之音，洗涤心灵的尘埃，带来纯净与重生',
                'ecosystem.running water.name': '溪流秘境',
                'ecosystem.running water.type': '流水音律',
                'ecosystem.running water.desc': '清澈溪流流淌的声音，带来内心的纯净与宁静',
                'ecosystem.Singing bowl sound.name': '颂钵圣殿',
                'ecosystem.Singing bowl sound.type': '音疗颂钵',
                'ecosystem.Singing bowl sound.desc': '古老藏族颂钵的神圣音频，深层疗愈身心，调和能量振动',
                'ecosystem.Subconscious Therapy.name': '潜识星域',
                'ecosystem.Subconscious Therapy.type': '潜意识疗愈',
                'ecosystem.Subconscious Therapy.desc': '深入潜意识层面的心理疗愈音乐，重塑内在世界的和谐',
                'ecosystem.species.count': '种',
                
                // 设置和其他
                'settings.language': '语言设置',
                'settings.theme': '主题设置',
                'settings.notifications': '通知设置',
                'common.ok': '确定',
                'common.cancel': '取消',
                'common.close': '关闭',
                'common.save': '保存',
                'common.reset': '重置',
                
                // 应用页脚
                'app.footer': '🎧 使用耳机聆听，获得最佳的自然疗愈体验',

                // 表单：7日定制冥想计划
                'form.plan.title': '领取你的 7 日定制冥想计划',
                'form.plan.description': '告诉我们你当前的状态，我们会组合合适的声景、冥想练习与睡眠建议，发送一份结构化的 7 日音疗安排。',
                'form.plan.benefit1': '每日 2 份推荐音频与练习提示',
                'form.plan.benefit2': '结合睡眠或专注目标的提醒计划',
                'form.plan.benefit3': '个性化混音建议与进度跟踪指引',

                // 表单标签
                'form.plan.label.name': '你的昵称',
                'form.plan.label.email': '联系邮箱',
                'form.plan.label.goal': '当前最想改善的目标',
                'form.plan.label.time': '每日可投入的时长',

                // 表单占位符
                'form.plan.placeholder.name': '如：小觉',
                'form.plan.placeholder.email': 'your@email.com',

                // 目标选项
                'form.plan.goal.select': '请选择',
                'form.plan.goal.sleep': '提升睡眠质量',
                'form.plan.goal.focus': '提升专注效率',
                'form.plan.goal.stress': '缓解焦虑与压力',
                'form.plan.goal.mindfulness': '建立规律冥想习惯',

                // 时长选项
                'form.plan.time.select': '请选择',
                'form.plan.time.5-10': '5-10 分钟',
                'form.plan.time.10-20': '10-20 分钟',
                'form.plan.time.20-30': '20-30 分钟',
                'form.plan.time.30+': '30 分钟以上',

                // 提交按钮和成功消息
                'form.plan.submit': '领取定制计划',
                'form.plan.success': '✅ 计划申请成功！我们会在 5 分钟内将定制冥想安排发送至你的邮箱，请注意查收。',

                // SEO Meta 标签
                'seo.title': '声音疗愈 - 213+ 免费冥想音乐、助眠白噪音、自然疗愈声音',
                'seo.description': '免费在线声音疗愈平台，提供 213+ 高品质音频：冥想音乐、雨声助眠、白噪音、自然声景。专为放松、睡眠、减压设计的声音疗愈工具。'
            },
            
            'en-US': {
                // Page titles and basic info - Fix HTML data-i18n matches
                'meta.description': 'Sound Healing App - Listen to the healing sounds of nature, return to inner peace',
                'meta.appTitle': 'Sound Healing',
                'meta.title': 'Sound Healing - Nature\'s Voice',
                'app.title': 'Sound Healing',
                'app.subtitle': 'Listen to the healing sounds of nature, return to inner peace',
                'app.footer': '🎧 Use headphones for the best natural healing experience',
                
                // Header area
                'header.title': 'Sound Healing',
                'header.subtitle': 'Listen to the healing sounds of nature, return to inner peace',
                
                // Main interface
                'main.exploreTitle': 'Explore Sound Ecosystem',
                'main.explore': 'Explore Sound Ecosystem',
                'main.selectSound': 'Choose Your Healing Sound',
                'main.startJourney': 'Begin Your Natural Journey',
                
                // Player
                'player.selectSound': 'Choose Your Healing Sound',
                'player.startJourney': 'Begin Your Natural Journey',
                'player.noAudioSelected': 'No Audio Selected',
                'player.playButton': 'Main Play Button',
                
                // Healing modes
                'healing.mode.focus': 'Focus Mode',
                'healing.mode.relax': 'Relax Mode',
                'healing.mode.sleep': 'Sleep Mode',
                'healing.mode.meditation': 'Meditation Mode',
                'healing.mode.work': 'Work Mode',
                'healing.mode.nature': 'Nature Mode',
                
                // Healing mode descriptions
                'healing.desc.focus': 'Help concentrate attention',
                'healing.desc.relax': 'Relieve stress and tension',
                'healing.desc.sleep': 'Help fall asleep quickly',
                'healing.desc.meditation': 'Deep introspection and calm',
                'healing.desc.work': 'Improve work efficiency',
                'healing.desc.nature': 'Feel the power of nature',
                
                // Audio categories
                'category.Rain': 'Rain',
                'category.ocean': 'Ocean Waves',
                'category.wind': 'Wind',
                'category.fire': 'Campfire',
                'category.stream': 'Stream',
                'category.birds': 'Birds',
                'category.meditation': 'Meditation Music',
                'category.Singing bowl sound': 'Singing Bowl',
                
                // Control buttons
                'controls.play': 'Play',
                'controls.pause': 'Pause',
                'controls.stop': 'Stop',
                'controls.previous': 'Previous',
                'controls.next': 'Next',
                'controls.playPause': 'Play/Pause',
                'controls.shuffle': 'Shuffle',
                'controls.repeat': 'Repeat',
                'controls.timer': 'Sleep Timer',
                'controls.volume': 'Volume',
                'controls.atmosphere': 'Atmosphere',
                
                // Playlist controls
                'playlist.shuffle': 'Shuffle',
                'playlist.repeat': 'Repeat',
                
                // Playlist
                'playlist.backToEcosystem': '🌿 Back to Ecosystem',
                'playlist.habitatAudio': 'Habitat Audio',
                'playlist.noTrack': 'No Audio Selected',
                'playlist.currentTime': 'Current Time',
                'playlist.totalTime': 'Total Duration',
                
                // Timer
                'timer.none': 'No Timer',
                'timer.5min': '5 Minutes',
                'timer.10min': '10 Minutes',
                'timer.15min': '15 Minutes',
                'timer.30min': '30 Minutes',
                'timer.off': 'Off',
                'timer.60min': '60 Minutes',
                'timer.90min': '90 Minutes',
                'timer.120min': '120 Minutes',
                'timer.start': 'Start',
                'timer.notStarted': 'Not Started',
                'timer.active': 'Timer Active',
                'timer.remaining': 'Remaining',
                
                // Seasons
                'season.spring': 'Spring',
                'season.summer': 'Summer',
                'season.autumn': 'Autumn',
                'season.winter': 'Winter',
                
                // Messages
                'message.sessionReminder': 'You\'ve been listening for {minutes} minutes, take a break',
                'message.modeChanged': 'Mode changed to',
                'message.languageChanged': 'Language changed to',
                'message.timerSet': 'Timer set to {duration} minutes',
                'message.loading': 'Loading...',
                'message.error': 'An error occurred',
                
                // Smart recommendations
                'recommendation.morning': 'Morning time, awaken inner peace and focus',
                'recommendation.work': 'Work hours, recommended natural sounds for focus',
                'recommendation.evening': 'Evening time, suitable for stress relief and relaxation',
                'recommendation.night': 'Night time, recommended soothing sounds for relaxation',

                // Room card translations (for dynamically generated rooms)
                'rooms.Subconscious Therapy': 'Subconscious Starfield',
                'rooms.hypnosis': 'Dream Garden',
                'rooms.meditation': 'Zen Valley',
                'rooms.Singing bowl sound': 'Singing Bowl Temple',
                'rooms.Rain': 'Rainforest Sanctuary',
                'rooms.Chakra': 'Energy Field',
                'rooms.Animal sounds': 'Forest Habitat',
                'rooms.Fire': 'Warm Fireplace',
                'rooms.running water': 'Stream Sanctuary',

                // Playlist interface translations
                'rooms.showPlaylist': 'Show Playlist',
                'rooms.hidePlaylist': 'Hide Playlist',
                'playlist.title': 'Playlist',
                'playlist.noTracks': 'No audio files in this category',
                'playlist.loading': 'Loading...',

                // 生态系统卡片
                'ecosystem.Animal sounds.name': 'Forest Habitat',
                'ecosystem.Animal sounds.type': 'Birds & Animal Sounds',
                'ecosystem.Animal sounds.desc': 'Dive into pristine forests, listen to birds\' morning songs and flowing streams, feel life\'s harmonious rhythm',
                'ecosystem.Chakra.name': 'Energy Field',
                'ecosystem.Chakra.type': 'Chakra Sound Therapy',
                'ecosystem.Chakra.desc': 'Balance the body\'s seven energy centers through ancient frequency therapy to restore inner balance and vitality',
                'ecosystem.Fire.name': 'Warm Fireplace',
                'ecosystem.Fire.type': 'Flame & Warmth',
                'ecosystem.Fire.desc': 'Gather around the warm fireplace, the sound of burning wood brings home safety and inner tranquility',
                'ecosystem.hypnosis.name': 'Dream Garden',
                'ecosystem.hypnosis.type': 'Hypnotic Guidance',
                'ecosystem.hypnosis.desc': 'Professional hypnotic guidance sounds that take you across consciousness boundaries into deep healing dreamscapes',
                'ecosystem.meditation.name': 'Zen Valley',
                'ecosystem.meditation.type': 'Meditation Music',
                'ecosystem.meditation.desc': 'Meditate in serene valleys, harmonious music designed for yoga and mindfulness practice',
                'ecosystem.Rain.name': 'Rainforest Sanctuary',
                'ecosystem.Rain.type': 'Rain Purification',
                'ecosystem.Rain.desc': 'Nature\'s symphony of raindrops on earth, washing away mental dust, bringing purity and renewal',
                'ecosystem.running water.name': 'Stream Sanctuary',
                'ecosystem.running water.type': 'Flowing Water Rhythm',
                'ecosystem.running water.desc': 'The sound of clear streams flowing, bringing inner purity and tranquility',
                'ecosystem.Singing bowl sound.name': 'Singing Bowl Temple',
                'ecosystem.Singing bowl sound.type': 'Sound Therapy Bowls',
                'ecosystem.Singing bowl sound.desc': 'Sacred audio of ancient Tibetan singing bowls, deep healing for body and mind, harmonizing energy vibrations',
                'ecosystem.Subconscious Therapy.name': 'Subconscious Starfield',
                'ecosystem.Subconscious Therapy.type': 'Subconscious Healing',
                'ecosystem.Subconscious Therapy.desc': 'Psychological healing music that delves into subconscious levels, reshaping inner world harmony',
                'ecosystem.species.count': ' species',
                
                // Settings and others
                'settings.language': 'Language Settings',
                'settings.theme': 'Theme Settings',
                'settings.notifications': 'Notification Settings',
                'common.ok': 'OK',
                'common.cancel': 'Cancel',
                'common.close': 'Close',
                'common.save': 'Save',
                'common.reset': 'Reset',
                
                // App footer
                'app.footer': '🎧 Use headphones for the best natural healing experience',

                // Form: 7-Day Custom Meditation Plan
                'form.plan.title': 'Get Your 7-Day Custom Meditation Plan',
                'form.plan.description': 'Tell us your current state, and we\'ll create a personalized 7-day audio therapy program combining soundscapes, meditation practices, and sleep guidance.',
                'form.plan.benefit1': '2 daily audio recommendations with practice tips',
                'form.plan.benefit2': 'Reminder schedules aligned with sleep or focus goals',
                'form.plan.benefit3': 'Personalized mixing suggestions and progress tracking guide',

                // Form Labels
                'form.plan.label.name': 'Your Name',
                'form.plan.label.email': 'Email Address',
                'form.plan.label.goal': 'What would you like to improve?',
                'form.plan.label.time': 'Daily time you can commit',

                // Form Placeholders
                'form.plan.placeholder.name': 'e.g., Sarah',
                'form.plan.placeholder.email': 'your@email.com',

                // Goal Options
                'form.plan.goal.select': 'Please Select',
                'form.plan.goal.sleep': 'Improve Sleep Quality',
                'form.plan.goal.focus': 'Boost Focus & Productivity',
                'form.plan.goal.stress': 'Reduce Anxiety & Stress',
                'form.plan.goal.mindfulness': 'Build Regular Meditation Habit',

                // Time Options
                'form.plan.time.select': 'Please Select',
                'form.plan.time.5-10': '5-10 minutes',
                'form.plan.time.10-20': '10-20 minutes',
                'form.plan.time.20-30': '20-30 minutes',
                'form.plan.time.30+': '30+ minutes',

                // Submit Button & Success Message
                'form.plan.submit': 'Get Custom Plan',
                'form.plan.success': '✅ Plan request successful! We\'ll send your custom meditation schedule to your inbox within 5 minutes. Please check your email.',

                // SEO Meta Tags (Keyword Optimized)
                'seo.title': 'Free Meditation Music & Rain Sounds for Sleeping | 213+ Healing Sounds',
                'seo.description': 'Free online sound healing platform with 213+ audio tracks: meditation music, rain sounds for sleeping, white noise, nature sounds. Perfect for relaxation, sleep & stress relief.'
            },
            
            'ja-JP': {
                // ページタイトルと基本情報 - HTML data-i18n マッチ修正
                'meta.description': 'サウンドヒーリングアプリ - 自然の癒しの音に耳を傾け、心の平穏を取り戻す',
                'meta.appTitle': 'サウンドヒーリング',
                'meta.title': 'サウンドヒーリング - 自然の声',
                'app.title': 'サウンドヒーリング',
                'app.subtitle': '自然の癒しの音に耳を傾け、心の平穏を取り戻す',
                'app.footer': '🎧 最高の自然療法体験には、ヘッドホンをご使用ください',
                
                // ヘッダー領域
                'header.title': 'サウンドヒーリング',
                'header.subtitle': '自然の癒しの音に耳を傾け、心の平穏を取り戻す',
                
                // メインインターフェース
                'main.exploreTitle': '音の生態系を探索',
                'main.explore': '音の生態系を探索',
                'main.selectSound': 'あなたの癒しの音を選んでください',
                'main.startJourney': '自然の旅を始めましょう',
                
                // プレーヤー
                'player.selectSound': 'あなたの癒しの音を選んでください',
                'player.startJourney': '自然の旅を始めましょう',
                'player.noAudioSelected': '音声が選択されていません',
                'player.playButton': 'メイン再生ボタン',
                
                // ヒーリングモード
                'healing.mode.focus': '集中モード',
                'healing.mode.relax': 'リラックスモード',
                'healing.mode.sleep': 'スリープモード',
                'healing.mode.meditation': '瞑想モード',
                'healing.mode.work': 'ワークモード',
                'healing.mode.nature': 'ネイチャーモード',
                
                // ヒーリングモード説明
                'healing.desc.focus': '注意力の集中を助けます',
                'healing.desc.relax': 'ストレスと緊張を和らげます',
                'healing.desc.sleep': '素早い入眠をサポートします',
                'healing.desc.meditation': '深い内省と静寂',
                'healing.desc.work': '作業効率を向上させます',
                'healing.desc.nature': '自然の力を感じてください',
                
                // 音声カテゴリー
                'category.Rain': '雨の音',
                'category.ocean': '波の音',
                'category.wind': '風の音',
                'category.fire': '焚き火の音',
                'category.stream': '小川の音',
                'category.birds': '鳥のさえずり',
                'category.meditation': '瞑想音楽',
                'category.Singing bowl sound': 'シンギングボウル',
                
                // コントロールボタン
                'controls.play': '再生',
                'controls.pause': '一時停止',
                'controls.stop': '停止',
                'controls.previous': '前へ',
                'controls.next': '次へ',
                'controls.shuffle': 'シャッフル',
                'controls.repeat': 'リピート',
                'controls.timer': 'スリープタイマー',
                'controls.volume': 'ボリューム',
                'controls.atmosphere': '雰囲気',
                
                // プレイリスト
                'playlist.backToEcosystem': '🌿 エコシステムに戻る',
                'playlist.habitatAudio': '生息地オーディオ',
                'playlist.noTrack': 'オーディオが選択されていません',
                'playlist.currentTime': '現在の時間',
                'playlist.totalTime': '総再生時間',
                
                // タイマー
                'timer.none': 'タイマーなし',
                'timer.5min': '5分',
                'timer.10min': '10分',
                'timer.15min': '15分',
                'timer.30min': '30分',
                'timer.off': 'オフ',
                'timer.60min': '60分',
                'timer.90min': '90分',
                'timer.120min': '120分',
                'timer.start': 'スタート',
                'timer.notStarted': '未開始',
                'timer.active': 'タイマー動作中',
                'timer.remaining': '残り時間',
                
                // 季節
                'season.spring': '春',
                'season.summer': '夏',
                'season.autumn': '秋',
                'season.winter': '冬',
                
                // メッセージ
                'message.sessionReminder': '{minutes}分間聴いています。適度に休憩してください',
                'message.modeChanged': 'モードが次に変更されました',
                'message.languageChanged': '言語が次に変更されました',
                'message.timerSet': 'タイマーを{duration}分に設定しました',
                'message.loading': '読み込み中...',
                'message.error': 'エラーが発生しました',
                
                // スマート推薦
                'recommendation.morning': '朝の時間、内なる平穏と集中を目覚めさせる',
                'recommendation.work': '仕事の時間、集中に役立つ自然の音をお勧めします',
                'recommendation.evening': '夕方の時間、ストレス解消とリラクゼーションに適した音声',
                'recommendation.night': '夜の時間、リラクゼーションを助ける穏やかな音をお勧めします',

                // ルームカード翻訳（動的に生成されるルーム用）
                'rooms.Subconscious Therapy': '潜在意識の星域',
                'rooms.hypnosis': '夢の花園',
                'rooms.meditation': '禅の谷',
                'rooms.Singing bowl sound': 'シンギングボウル寺院',
                'rooms.Rain': '雨林の聖地',
                'rooms.Chakra': 'エネルギーフィールド',
                'rooms.Animal sounds': '森の生息地',
                'rooms.Fire': '暖かい暖炉',
                'rooms.running water': '渓流の聖域',

                // プレイリストインターフェース翻訳
                'rooms.showPlaylist': 'プレイリストを表示',
                'rooms.hidePlaylist': 'プレイリストを非表示',
                'playlist.title': 'プレイリスト',
                'playlist.noTracks': 'このカテゴリにはオーディオファイルがありません',
                'playlist.loading': '読み込み中...',

                // エコシステムカード
                'ecosystem.Animal sounds.name': '森の生息地',
                'ecosystem.Animal sounds.type': '鳥と動物の音',
                'ecosystem.Animal sounds.desc': '原始林に深く入り、鳥の朝の歌声と小川のせせらぎを聞き、生命の調和のリズムを感じる',
                'ecosystem.Chakra.name': 'エネルギーフィールド',
                'ecosystem.Chakra.type': 'チャクラサウンドセラピー',
                'ecosystem.Chakra.desc': '古代の周波数療法により身体の7つのエネルギーセンターを調和させ、内なるバランスと活力を回復',
                'ecosystem.Fire.name': '暖かい暖炉',
                'ecosystem.Fire.type': '炎と温もり',
                'ecosystem.Fire.desc': '暖かい暖炉の周りに集まり、薪の燃える音が家の安全感と心の静けさをもたらす',
                'ecosystem.hypnosis.name': '夢の花園',
                'ecosystem.hypnosis.type': '催眠ガイダンス',
                'ecosystem.hypnosis.desc': '意識の境界を越えて深い癒しの夢の世界へ導くプロの催眠ガイダンス音声',
                'ecosystem.meditation.name': '禅の谷',
                'ecosystem.meditation.type': '瞑想音楽',
                'ecosystem.meditation.desc': '静寂な谷で瞑想し、ヨガとマインドフルネス練習のために設計された調和音楽',
                'ecosystem.Rain.name': '雨林の聖地',
                'ecosystem.Rain.type': '雨の浄化',
                'ecosystem.Rain.desc': '大地に降る雨滴の自然の交響曲、心の塵を洗い流し、純粋さと再生をもたらす',
                'ecosystem.running water.name': '渓流の聖域',
                'ecosystem.running water.type': '流水のリズム',
                'ecosystem.running water.desc': '清らかな渓流の流れる音、内なる純粋さと静けさをもたらす',
                'ecosystem.Singing bowl sound.name': 'シンギングボウル寺院',
                'ecosystem.Singing bowl sound.type': 'サウンドセラピーボウル',
                'ecosystem.Singing bowl sound.desc': '古代チベットのシンギングボウルの神聖な音声、心身の深い癒し、エネルギー振動の調和',
                'ecosystem.Subconscious Therapy.name': '潜在意識の星域',
                'ecosystem.Subconscious Therapy.type': '潜在意識ヒーリング',
                'ecosystem.Subconscious Therapy.desc': '潜在意識レベルに深く入り込む心理的ヒーリング音楽、内なる世界の調和を再構築',
                'ecosystem.species.count': '種',
                
                // 設定とその他
                'settings.language': '言語設定',
                'settings.theme': 'テーマ設定',
                'settings.notifications': '通知設定',
                'common.ok': 'OK',
                'common.cancel': 'キャンセル',
                'common.close': '閉じる',
                'common.save': '保存',
                'common.reset': 'リセット',
                
                // アプリフッター
                'app.footer': '🎧 ヘッドフォンを使用して、最高の自然治療体験をお楽しみください',

                // フォーム：7日間カスタム瞑想プラン
                'form.plan.title': '7日間カスタム瞑想プランを受け取る',
                'form.plan.description': '現在の状態をお知らせください。音風景、瞑想練習、睡眠アドバイスを組み合わせた、構造化された7日間の音響療法プログラムをお送りします。',
                'form.plan.benefit1': '毎日2つの推奨オーディオと練習のヒント',
                'form.plan.benefit2': '睡眠または集中目標に合わせたリマインダープラン',
                'form.plan.benefit3': 'パーソナライズされたミキシングの提案と進捗追跡ガイド',

                // フォームラベル
                'form.plan.label.name': 'お名前',
                'form.plan.label.email': 'メールアドレス',
                'form.plan.label.goal': '改善したい目標',
                'form.plan.label.time': '毎日確保できる時間',

                // フォームプレースホルダー
                'form.plan.placeholder.name': '例：さくら',
                'form.plan.placeholder.email': 'your@email.com',

                // 目標オプション
                'form.plan.goal.select': '選択してください',
                'form.plan.goal.sleep': '睡眠の質を向上',
                'form.plan.goal.focus': '集中力と効率を向上',
                'form.plan.goal.stress': '不安とストレスを軽減',
                'form.plan.goal.mindfulness': '規則的な瞑想習慣を確立',

                // 時間オプション
                'form.plan.time.select': '選択してください',
                'form.plan.time.5-10': '5〜10分',
                'form.plan.time.10-20': '10〜20分',
                'form.plan.time.20-30': '20〜30分',
                'form.plan.time.30+': '30分以上',

                // 送信ボタンと成功メッセージ
                'form.plan.submit': 'カスタムプランを取得',
                'form.plan.success': '✅ プランリクエスト成功！5分以内にカスタム瞑想スケジュールをメールでお送りします。メールをご確認ください。',

                // SEO Meta タグ
                'seo.title': '無料瞑想音楽＆睡眠用雨音 | 213+以上のヒーリングサウンド',
                'seo.description': '213+以上のオーディオトラックを提供する無料オンライン音響療法プラットフォーム：瞑想音楽、睡眠用雨音、ホワイトノイズ、自然音。リラクゼーション、睡眠、ストレス解消に最適。'
            },
            
            'ko-KR': {
                // 메타 정보
                'meta.description': '사운드 힐링 앱 - 자연의 치유하는 소리를 듣고 내면의 평화로 돌아가세요',
                'meta.appTitle': '사운드 힐링',
                'meta.title': '사운드 힐링 - 자연의 소리',
                
                // 페이지 제목 및 기본 정보
                'app.title': '사운드 힐링',
                'app.subtitle': '자연의 치유하는 소리를 듣고 내면의 평화로 돌아가세요',
                'app.footer': '🎧 최고의 자연 치유 경험을 위해 헤드폰을 사용하세요',
                
                // 헤더
                'header.title': '사운드 힐링',
                'header.subtitle': '자연의 치유하는 소리를 듣고 내면의 평화로 돌아가세요',
                
                // 메인 인터페이스
                'main.exploreTitle': '소리 생태계 탐험',
                'main.explore': '소리 생태계 탐험',
                'main.selectSound': '치유의 소리를 선택하세요',
                'main.startJourney': '자연 여행을 시작하세요',
                
                // 플레이어
                'player.selectSound': '치유의 소리를 선택하세요',
                'player.startJourney': '자연 여행을 시작하세요',
                'player.noAudioSelected': '선택된 오디오 없음',
                'player.playButton': '메인 재생 버튼',
                
                // 힐링 모드
                'healing.mode.focus': '집중 모드',
                'healing.mode.relax': '이완 모드',
                'healing.mode.sleep': '수면 모드',
                'healing.mode.meditation': '명상 모드',
                'healing.mode.work': '업무 모드',
                'healing.mode.nature': '자연 모드',
                
                // 힐링 모드 설명
                'healing.desc.focus': '주의력 집중을 도와줍니다',
                'healing.desc.relax': '스트레스와 긴장을 완화합니다',
                'healing.desc.sleep': '빠른 잠들기를 도와줍니다',
                'healing.desc.meditation': '깊은 내면 성찰과 평온함',
                'healing.desc.work': '업무 효율성을 향상시킵니다',
                'healing.desc.nature': '자연의 힘을 느끼세요',
                
                // 오디오 카테고리
                'category.Rain': '빗소리',
                'category.ocean': '바다 파도',
                'category.wind': '바람 소리',
                'category.fire': '모닥불 소리',
                'category.stream': '시냇물 소리',
                'category.birds': '새 소리',
                'category.meditation': '명상 음악',
                'category.Singing bowl sound': '싱잉볼',
                
                // 제어 버튼
                'controls.play': '재생',
                'controls.pause': '일시정지',
                'controls.stop': '정지',
                'controls.previous': '이전',
                'controls.next': '다음',
                'controls.shuffle': '셔플',
                'controls.repeat': '반복',
                'controls.timer': '수면 타이머',
                'controls.volume': '볼륨',
                'controls.atmosphere': '분위기',
                
                // 플레이리스트
                'playlist.backToEcosystem': '🌿 생태계로 돌아가기',
                'playlist.habitatAudio': '서식지 오디오',
                'playlist.noTrack': '선택된 오디오 없음',
                'playlist.currentTime': '현재 시간',
                'playlist.totalTime': '총 재생 시간',
                
                // 타이머
                'timer.none': '타이머 없음',
                'timer.5min': '5분',
                'timer.10min': '10분',
                'timer.15min': '15분',
                'timer.30min': '30분',
                'timer.off': '끔',
                'timer.60min': '60분',
                'timer.90min': '90분',
                'timer.120min': '120분',
                'timer.start': '시작',
                'timer.notStarted': '시작 안됨',
                'timer.active': '타이머 활성',
                'timer.remaining': '남은 시간',
                
                // 계절
                'season.spring': '봄',
                'season.summer': '여름',
                'season.autumn': '가을',
                'season.winter': '겨울',
                
                // 메시지
                'message.sessionReminder': '{minutes}분간 듣고 계세요. 적당한 휴식을 취하세요',
                'message.modeChanged': '모드가 다음으로 변경되었습니다',
                'message.languageChanged': '언어가 다음으로 변경되었습니다',
                'message.timerSet': '타이머가 {duration}분으로 설정되었습니다',
                'message.loading': '로딩 중...',
                'message.error': '오류가 발생했습니다',
                
                // 스마트 추천
                'recommendation.morning': '아침 시간, 내면의 평화와 집중력을 깨워보세요',
                'recommendation.work': '업무 시간, 집중에 도움이 되는 자연 소리를 추천합니다',
                'recommendation.evening': '저녁 시간, 스트레스 해소와 이완에 적합한 오디오',
                'recommendation.night': '밤 시간, 이완을 돕는 부드러운 소리를 추천합니다',

                // 룸 카드 번역 (동적으로 생성되는 룸용)
                'rooms.Subconscious Therapy': '잠재의식 별자리',
                'rooms.hypnosis': '꿈의 정원',
                'rooms.meditation': '선 계곡',
                'rooms.Singing bowl sound': '싱잉볼 사원',
                'rooms.Rain': '우림 성역',
                'rooms.Chakra': '에너지 필드',
                'rooms.Animal sounds': '숲 서식지',
                'rooms.Fire': '따뜻한 벽난로',
                'rooms.running water': '시내 성역',

                // 플레이리스트 인터페이스 번역
                'rooms.showPlaylist': '플레이리스트 표시',
                'rooms.hidePlaylist': '플레이리스트 숨기기',
                'playlist.title': '플레이리스트',
                'playlist.noTracks': '이 카테고리에는 오디오 파일이 없습니다',
                'playlist.loading': '로딩 중...',

                // 생태계 카드
                'ecosystem.Animal sounds.name': '숲 서식지',
                'ecosystem.Animal sounds.type': '새와 동물 소리',
                'ecosystem.Animal sounds.desc': '원시림 깊이 들어가 새들의 아침 노래와 시냇물 소리를 들으며, 생명의 조화로운 리듬을 느껴보세요',
                'ecosystem.Chakra.name': '에너지 필드',
                'ecosystem.Chakra.type': '차크라 사운드 테라피',
                'ecosystem.Chakra.desc': '고대 주파수 치료법을 통해 몸의 일곱 에너지 센터를 조화시켜 내적 균형과 활력을 회복',
                'ecosystem.Fire.name': '따뜻한 벽난로',
                'ecosystem.Fire.type': '불꽃과 온기',
                'ecosystem.Fire.desc': '따뜻한 벽난로 주위에 모여, 타는 장작 소리가 가정의 안전감과 마음의 평온함을 가져다줍니다',
                'ecosystem.hypnosis.name': '꿈의 정원',
                'ecosystem.hypnosis.type': '최면 가이드',
                'ecosystem.hypnosis.desc': '의식의 경계를 넘어 깊은 치유의 꿈 세계로 인도하는 전문 최면 가이드 음성',
                'ecosystem.meditation.name': '선 계곡',
                'ecosystem.meditation.type': '명상 음악',
                'ecosystem.meditation.desc': '고요한 계곡에서 명상하며, 요가와 마음챙김 연습을 위해 설계된 조화로운 음악',
                'ecosystem.Rain.name': '우림 성역',
                'ecosystem.Rain.type': '비 정화',
                'ecosystem.Rain.desc': '대지에 떨어지는 빗방울의 자연 교향곡, 마음의 먼지를 씻어내고 순수함과 재생을 가져다줍니다',
                'ecosystem.running water.name': '시내 성역',
                'ecosystem.running water.type': '흐르는 물 리듬',
                'ecosystem.running water.desc': '맑은 시냇물이 흘러가는 소리, 내면의 순수함과 평온함을 가져다줍니다',
                'ecosystem.Singing bowl sound.name': '싱잉볼 사원',
                'ecosystem.Singing bowl sound.type': '사운드 테라피 볼',
                'ecosystem.Singing bowl sound.desc': '고대 티베트 싱잉볼의 신성한 음성, 몸과 마음의 깊은 치유, 에너지 진동의 조화',
                'ecosystem.Subconscious Therapy.name': '잠재의식 별역',
                'ecosystem.Subconscious Therapy.type': '잠재의식 치유',
                'ecosystem.Subconscious Therapy.desc': '잠재의식 레벨에 깊이 들어가는 심리적 치유 음악, 내면 세계의 조화를 재구성',
                'ecosystem.species.count': '종',
                
                // 설정 및 기타
                'settings.language': '언어 설정',
                'settings.theme': '테마 설정',
                'settings.notifications': '알림 설정',
                'common.ok': '확인',
                'common.cancel': '취소',
                'common.close': '닫기',
                'common.save': '저장',
                'common.reset': '재설정',
                
                // 앱 푸터
                'app.footer': '🎧 헤드폰을 사용하여 최고의 자연 치유 경험을 누리세요',

                // 양식: 7일 맞춤 명상 계획
                'form.plan.title': '7일 맞춤 명상 계획 받기',
                'form.plan.description': '현재 상태를 알려주시면, 음향 풍경, 명상 연습, 수면 가이드를 결합한 구조화된 7일 오디오 치료 프로그램을 만들어 드립니다.',
                'form.plan.benefit1': '매일 2개의 추천 오디오와 연습 팁',
                'form.plan.benefit2': '수면 또는 집중 목표에 맞춘 리마인더 일정',
                'form.plan.benefit3': '개인화된 믹싱 제안 및 진행 상황 추적 가이드',

                // 양식 레이블
                'form.plan.label.name': '이름',
                'form.plan.label.email': '이메일 주소',
                'form.plan.label.goal': '개선하고 싶은 목표',
                'form.plan.label.time': '매일 투자할 수 있는 시간',

                // 양식 플레이스홀더
                'form.plan.placeholder.name': '예: 민지',
                'form.plan.placeholder.email': 'your@email.com',

                // 목표 옵션
                'form.plan.goal.select': '선택하세요',
                'form.plan.goal.sleep': '수면 질 향상',
                'form.plan.goal.focus': '집중력과 생산성 향상',
                'form.plan.goal.stress': '불안과 스트레스 감소',
                'form.plan.goal.mindfulness': '규칙적인 명상 습관 형성',

                // 시간 옵션
                'form.plan.time.select': '선택하세요',
                'form.plan.time.5-10': '5-10분',
                'form.plan.time.10-20': '10-20분',
                'form.plan.time.20-30': '20-30분',
                'form.plan.time.30+': '30분 이상',

                // 제출 버튼 및 성공 메시지
                'form.plan.submit': '맞춤 계획 받기',
                'form.plan.success': '✅ 계획 요청 성공! 5분 이내에 맞춤 명상 일정을 이메일로 보내드립니다. 이메일을 확인하세요.',

                // SEO Meta 태그
                'seo.title': '무료 명상 음악 & 수면 빗소리 | 213+ 힐링 사운드',
                'seo.description': '213+개의 오디오 트랙을 제공하는 무료 온라인 사운드 힐링 플랫폼: 명상 음악, 수면용 빗소리, 백색 소음, 자연 소리. 릴렉스, 수면 및 스트레스 해소에 완벽합니다.'
            },
            
            'es-ES': {
                // Meta información
                'meta.description': 'Aplicación de Sanación con Sonidos - Escucha los sonidos curativos de la naturaleza, regresa a la paz interior',
                'meta.appTitle': 'Sanación con Sonidos',
                'meta.title': 'Sanación con Sonidos - Voz de la Naturaleza',
                
                // Títulos de página e información básica
                'app.title': 'Sanación con Sonidos',
                'app.subtitle': 'Escucha los sonidos curativos de la naturaleza, regresa a la paz interior',
                'app.footer': '🎧 Usa auriculares para la mejor experiencia de sanación natural',
                
                // Encabezado
                'header.title': 'Sanación con Sonidos',
                'header.subtitle': 'Escucha los sonidos curativos de la naturaleza, regresa a la paz interior',
                
                // Interfaz principal
                'main.exploreTitle': 'Explorar Ecosistema de Sonidos',
                'main.explore': 'Explorar Ecosistema de Sonidos',
                'main.selectSound': 'Elige Tu Sonido Curativo',
                'main.startJourney': 'Comienza Tu Viaje Natural',
                
                // Reproductor
                'player.selectSound': 'Elige Tu Sonido Curativo',
                'player.startJourney': 'Comienza Tu Viaje Natural',
                'player.noAudioSelected': 'Ningún Audio Seleccionado',
                'player.playButton': 'Botón de Reproducción Principal',
                
                // Modos de sanación
                'healing.mode.focus': 'Modo Concentración',
                'healing.mode.relax': 'Modo Relajación',
                'healing.mode.sleep': 'Modo Sueño',
                'healing.mode.meditation': 'Modo Meditación',
                'healing.mode.work': 'Modo Trabajo',
                'healing.mode.nature': 'Modo Naturaleza',
                
                // Descripciones de modos de sanación
                'healing.desc.focus': 'Ayuda a concentrar la atención',
                'healing.desc.relax': 'Alivia el estrés y la tensión',
                'healing.desc.sleep': 'Ayuda a conciliar el sueño rápidamente',
                'healing.desc.meditation': 'Introspección profunda y calma',
                'healing.desc.work': 'Mejora la eficiencia laboral',
                'healing.desc.nature': 'Siente el poder de la naturaleza',
                
                // Categorías de audio
                'category.Rain': 'Lluvia',
                'category.ocean': 'Olas del Océano',
                'category.wind': 'Viento',
                'category.fire': 'Fogata',
                'category.stream': 'Arroyo',
                'category.birds': 'Pájaros',
                'category.meditation': 'Música de Meditación',
                'category.Singing bowl sound': 'Cuenco Tibetano',
                
                // Botones de control
                'controls.play': 'Reproducir',
                'controls.pause': 'Pausar',
                'controls.stop': 'Detener',
                'controls.previous': 'Anterior',
                'controls.next': 'Siguiente',
                'controls.shuffle': 'Aleatorio',
                'controls.repeat': 'Repetir',
                'controls.timer': 'Temporizador de Sueño',
                'controls.volume': 'Volumen',
                'controls.atmosphere': 'Atmósfera',
                
                // Lista de reproducción
                'playlist.backToEcosystem': '🌿 Volver al Ecosistema',
                'playlist.habitatAudio': 'Audio del Hábitat',
                'playlist.noTrack': 'Ningún Audio Seleccionado',
                'playlist.currentTime': 'Tiempo Actual',
                'playlist.totalTime': 'Duración Total',
                
                // Temporizador
                'timer.none': 'Sin Temporizador',
                'timer.5min': '5 Minutos',
                'timer.10min': '10 Minutos',
                'timer.15min': '15 Minutos',
                'timer.30min': '30 Minutos',
                'timer.off': 'Apagado',
                'timer.60min': '60 Minutos',
                'timer.90min': '90 Minutos',
                'timer.120min': '120 Minutos',
                'timer.start': 'Iniciar',
                'timer.notStarted': 'No Iniciado',
                'timer.active': 'Temporizador Activo',
                'timer.remaining': 'Tiempo Restante',
                
                // Estaciones
                'season.spring': 'Primavera',
                'season.summer': 'Verano',
                'season.autumn': 'Otoño',
                'season.winter': 'Invierno',
                
                // Mensajes
                'message.sessionReminder': 'Has estado escuchando durante {minutes} minutos, toma un descanso',
                'message.modeChanged': 'Modo cambiado a',
                'message.languageChanged': 'Idioma cambiado a',
                'message.timerSet': 'Temporizador configurado a {duration} minutos',
                'message.loading': 'Cargando...',
                'message.error': 'Ocurrió un error',
                
                // Recomendaciones inteligentes
                'recommendation.morning': 'Tiempo matutino, despierta la paz interior y la concentración',
                'recommendation.work': 'Horas de trabajo, sonidos naturales recomendados para la concentración',
                'recommendation.evening': 'Tiempo vespertino, adecuado para el alivio del estrés y la relajación',
                'recommendation.night': 'Tiempo nocturno, sonidos relajantes recomendados para la relajación',

                // Traducciones de tarjetas de sala (para salas generadas dinámicamente)
                'rooms.Subconscious Therapy': 'Campo Estelar Subconsciente',
                'rooms.hypnosis': 'Jardín de Ensueños',
                'rooms.meditation': 'Valle Zen',
                'rooms.Singing bowl sound': 'Templo de Cuencos Tibetanos',
                'rooms.Rain': 'Santuario de la Selva Tropical',
                'rooms.Chakra': 'Campo de Energía',
                'rooms.Animal sounds': 'Hábitat Forestal',
                'rooms.Fire': 'Chimenea Cálida',
                'rooms.running water': 'Santuario del Arroyo',

                // Traducciones de interfaz de lista de reproducción
                'rooms.showPlaylist': 'Mostrar Lista de Reproducción',
                'rooms.hidePlaylist': 'Ocultar Lista de Reproducción',
                'playlist.title': 'Lista de Reproducción',
                'playlist.noTracks': 'No hay archivos de audio en esta categoría',
                'playlist.loading': 'Cargando...',

                // Tarjetas del ecosistema
                'ecosystem.Animal sounds.name': 'Hábitat Forestal',
                'ecosystem.Animal sounds.type': 'Sonidos de Aves y Animales',
                'ecosystem.Animal sounds.desc': 'Sumérgete en bosques prístinos, escucha las canciones matutinas de los pájaros y arroyos, siente el ritmo armonioso de la vida',
                'ecosystem.Chakra.name': 'Campo de Energía',
                'ecosystem.Chakra.type': 'Terapia de Sonido Chakra',
                'ecosystem.Chakra.desc': 'Equilibra los siete centros de energía del cuerpo a través de la terapia de frecuencia antigua para restaurar el equilibrio interno y la vitalidad',
                'ecosystem.Fire.name': 'Chimenea Cálida',
                'ecosystem.Fire.type': 'Llama y Calor',
                'ecosystem.Fire.desc': 'Reúnete alrededor de la chimenea cálida, el sonido de la madera ardiendo trae la seguridad del hogar y la tranquilidad interior',
                'ecosystem.hypnosis.name': 'Jardín de Ensueños',
                'ecosystem.hypnosis.type': 'Guía Hipnótica',
                'ecosystem.hypnosis.desc': 'Sonidos de guía hipnótica profesional que te llevan a través de los límites de la conciencia hacia paisajes de ensueños de sanación profunda',
                'ecosystem.meditation.name': 'Valle Zen',
                'ecosystem.meditation.type': 'Música de Meditación',
                'ecosystem.meditation.desc': 'Medita en valles serenos, música armoniosa diseñada para práctica de yoga y atención plena',
                'ecosystem.Rain.name': 'Santuario de la Selva Tropical',
                'ecosystem.Rain.type': 'Purificación de Lluvia',
                'ecosystem.Rain.desc': 'Sinfonía natural de gotas de lluvia sobre la tierra, lavando el polvo mental, trayendo pureza y renovación',
                'ecosystem.running water.name': 'Santuario del Arroyo',
                'ecosystem.running water.type': 'Ritmo de Agua Fluyente',
                'ecosystem.running water.desc': 'El sonido de arroyos claros fluyendo, trayendo pureza interior y tranquilidad',
                'ecosystem.Singing bowl sound.name': 'Templo de Cuencos Tibetanos',
                'ecosystem.Singing bowl sound.type': 'Cuencos de Terapia de Sonido',
                'ecosystem.Singing bowl sound.desc': 'Audio sagrado de antiguos cuencos tibetanos, sanación profunda para cuerpo y mente, armonización de vibraciones energéticas',
                'ecosystem.Subconscious Therapy.name': 'Campo Estelar Subconsciente',
                'ecosystem.Subconscious Therapy.type': 'Sanación Subconsciente',
                'ecosystem.Subconscious Therapy.desc': 'Música de sanación psicológica que profundiza en niveles subconscientes, remodelando la armonía del mundo interior',
                'ecosystem.species.count': ' especies',
                
                // Configuraciones y otros
                'settings.language': 'Configuración de Idioma',
                'settings.theme': 'Configuración de Tema',
                'settings.notifications': 'Configuración de Notificaciones',
                'common.ok': 'Aceptar',
                'common.cancel': 'Cancelar',
                'common.close': 'Cerrar',
                'common.save': 'Guardar',
                'common.reset': 'Restablecer',
                
                // Pie de página de la app
                'app.footer': '🎧 Use auriculares para la mejor experiencia de sanación natural',

                // Formulario: Plan de Meditación Personalizado de 7 Días
                'form.plan.title': 'Obtén Tu Plan de Meditación Personalizado de 7 Días',
                'form.plan.description': 'Cuéntanos tu estado actual y crearemos un programa estructurado de terapia de audio de 7 días que combina paisajes sonoros, prácticas de meditación y orientación para el sueño.',
                'form.plan.benefit1': '2 recomendaciones de audio diarias con consejos de práctica',
                'form.plan.benefit2': 'Programas de recordatorio alineados con objetivos de sueño o concentración',
                'form.plan.benefit3': 'Sugerencias de mezcla personalizadas y guía de seguimiento de progreso',

                // Etiquetas de Formulario
                'form.plan.label.name': 'Tu Nombre',
                'form.plan.label.email': 'Correo Electrónico',
                'form.plan.label.goal': '¿Qué te gustaría mejorar?',
                'form.plan.label.time': 'Tiempo diario que puedes dedicar',

                // Marcadores de Posición
                'form.plan.placeholder.name': 'ej. María',
                'form.plan.placeholder.email': 'tu@email.com',

                // Opciones de Objetivos
                'form.plan.goal.select': 'Por Favor Seleccione',
                'form.plan.goal.sleep': 'Mejorar Calidad del Sueño',
                'form.plan.goal.focus': 'Aumentar Concentración y Productividad',
                'form.plan.goal.stress': 'Reducir Ansiedad y Estrés',
                'form.plan.goal.mindfulness': 'Establecer Hábito Regular de Meditación',

                // Opciones de Tiempo
                'form.plan.time.select': 'Por Favor Seleccione',
                'form.plan.time.5-10': '5-10 minutos',
                'form.plan.time.10-20': '10-20 minutos',
                'form.plan.time.20-30': '20-30 minutos',
                'form.plan.time.30+': '30+ minutos',

                // Botón de Envío y Mensaje de Éxito
                'form.plan.submit': 'Obtener Plan Personalizado',
                'form.plan.success': '✅ ¡Solicitud de plan exitosa! Enviaremos tu horario de meditación personalizado a tu bandeja de entrada en 5 minutos. Por favor revisa tu correo electrónico.',

                // SEO Meta Etiquetas
                'seo.title': 'Música de Meditación Gratuita y Sonidos de Lluvia para Dormir | 213+ Sonidos Curativos',
                'seo.description': 'Plataforma gratuita de sanación con sonido con más de 213 pistas de audio: música de meditación, sonidos de lluvia para dormir, ruido blanco, sonidos de la naturaleza. Perfecto para relajación, sueño y alivio del estrés.'
            }
        };
        
        return translations[langCode] || translations['zh-CN'];
    }
    
    /**
     * 初始化格式化器
     */
    initializeFormatters() {
        for (const langCode of Object.keys(this.supportedLanguages)) {
            // 数字格式化器
            this.formatters.number.set(langCode, new Intl.NumberFormat(langCode));
            
            // 日期格式化器
            this.formatters.date.set(langCode, new Intl.DateTimeFormat(langCode, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }));
            
            // 时间格式化器
            this.formatters.time.set(langCode, new Intl.DateTimeFormat(langCode, {
                hour: '2-digit',
                minute: '2-digit'
            }));
        }
    }
    
    /**
     * 获取翻译文本
     */
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }
    
    /**
     * 获取原始翻译（不进行参数替换）
     */
    getTranslation(key) {
        // 尝试获取当前语言的翻译
        const currentTranslations = this.translations.get(this.currentLanguage);
        if (currentTranslations && currentTranslations[key]) {
            return currentTranslations[key];
        }
        
        // 回退到默认语言
        const fallbackTranslations = this.translations.get(this.fallbackLanguage);
        if (fallbackTranslations && fallbackTranslations[key]) {
            return fallbackTranslations[key];
        }
        
        // 如果都没有，返回键名
        console.warn(`🌍 翻译缺失: ${key} (语言: ${this.currentLanguage})`);
        return key;
    }
    
    /**
     * 参数插值
     */
    interpolate(template, params) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    /**
     * 切换语言
     */
    async changeLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.warn(`🌍 不支持的语言: ${langCode}`);
            return false;
        }
        
        if (langCode === this.currentLanguage) {
            return true; // 已经是当前语言
        }
        
        console.log(`🌍 切换语言: ${this.currentLanguage} -> ${langCode}`);
        
        try {
            // 加载新语言数据
            await this.loadLanguageData(langCode);
            
            // 更新当前语言
            this.currentLanguage = langCode;
            
            // 保存语言偏好
            localStorage.setItem('sound_healing_language', langCode);
            
            // 应用语言
            await this.applyLanguage(langCode);
            
            // 通知语言变更
            this.notifyLanguageChange(langCode);
            
            console.log(`✅ 语言切换完成: ${langCode}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 语言切换失败: ${langCode}`, error);
            return false;
        }
    }
    
    /**
     * 应用语言设置
     */
    async applyLanguage(langCode) {
        const langConfig = this.supportedLanguages[langCode];
        
        // 更新HTML lang属性
        document.documentElement.lang = langCode;
        
        // 更新页面标题
        document.title = this.getTranslation('app.title');
        
        // 更新字体
        if (langConfig.fontFamily) {
            document.documentElement.style.setProperty('--i18n-font-family', langConfig.fontFamily);
        }
        
        // 更新文字方向（RTL/LTR）
        document.documentElement.dir = langConfig.rtl ? 'rtl' : 'ltr';

        // 更新 SEO Meta 标签
        this.updateSEOMetaTags();

        // 更新页面内容
        this.updatePageContent();
    }

    /**
     * 更新 SEO Meta 标签
     */
    updateSEOMetaTags() {
        const title = this.getTranslation('seo.title');
        const description = this.getTranslation('seo.description');

        // 更新 <title> 标签
        if (title && title !== 'seo.title') {
            document.title = title;
        }

        // 更新标准 meta 标签
        const titleMeta = document.querySelector('meta[name="title"]');
        if (titleMeta && title && title !== 'seo.title') {
            titleMeta.content = title;
        }

        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta && description && description !== 'seo.description') {
            descMeta.content = description;
        }

        // 更新 Open Graph meta 标签
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && title && title !== 'seo.title') {
            ogTitle.content = title;
        }

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && description && description !== 'seo.description') {
            ogDesc.content = description;
        }

        // 更新 Twitter Card meta 标签
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle && title && title !== 'seo.title') {
            twitterTitle.content = title;
        }

        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc && description && description !== 'seo.description') {
            twitterDesc.content = description;
        }

        console.log(`🔍 SEO Meta 标签已更新: ${this.currentLanguage}`);
    }

    /**
     * 更新页面内容
     */
    updatePageContent() {
        // 查找所有带有 data-i18n 属性的元素
        const i18nElements = document.querySelectorAll('[data-i18n]');

        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);

            // 根据元素类型更新内容
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                // ✅ INPUT 元素：不修改 textContent，只在下方处理 placeholder
            } else if (element.tagName === 'OPTION') {
                // ✅ 新增：<option> 元素更新 textContent
                element.textContent = translation;
            } else if (element.hasAttribute('title')) {
                element.title = translation;
            } else {
                element.textContent = translation;
            }
        });

        // ✅ 新增：处理 data-i18n-placeholder 属性
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            element.placeholder = translation;
        });

        // 更新特殊元素
        this.updateSpecialElements();
    }
    
    /**
     * 更新特殊元素
     */
    updateSpecialElements() {
        // 更新季节按钮标题
        const seasonButtons = document.querySelectorAll('.season');
        seasonButtons.forEach(btn => {
            const season = btn.getAttribute('data-season');
            if (season) {
                btn.title = this.getTranslation(`season.${season}`);
            }
        });
        
        // 更新定时器选项
        const timerOptions = document.querySelectorAll('#timerDuration option');
        timerOptions.forEach(option => {
            const value = option.value;
            if (value === '0') {
                option.textContent = this.getTranslation('timer.none');
            } else {
                option.textContent = this.getTranslation(`timer.${value}min`);
            }
        });
    }
    
    /**
     * 格式化数字
     */
    formatNumber(number, langCode = this.currentLanguage) {
        const formatter = this.formatters.number.get(langCode);
        return formatter ? formatter.format(number) : number.toString();
    }
    
    /**
     * 格式化日期
     */
    formatDate(date, langCode = this.currentLanguage) {
        const formatter = this.formatters.date.get(langCode);
        return formatter ? formatter.format(date) : date.toLocaleDateString();
    }
    
    /**
     * 格式化时间
     */
    formatTime(date, langCode = this.currentLanguage) {
        const formatter = this.formatters.time.get(langCode);
        return formatter ? formatter.format(date) : date.toLocaleTimeString();
    }
    
    /**
     * 添加语言变更监听器
     */
    onLanguageChange(callback) {
        this.languageChangeListeners.add(callback);
    }
    
    /**
     * 移除语言变更监听器
     */
    offLanguageChange(callback) {
        this.languageChangeListeners.delete(callback);
    }
    
    /**
     * 通知语言变更
     */
    notifyLanguageChange(langCode) {
        const langConfig = this.supportedLanguages[langCode];
        
        this.languageChangeListeners.forEach(callback => {
            try {
                callback(langCode, langConfig);
            } catch (error) {
                console.warn('🌍 语言变更监听器错误:', error);
            }
        });
        
        // 发送全局事件
        document.dispatchEvent(new CustomEvent('languageChange', {
            detail: { langCode, langConfig }
        }));
    }
    
    /**
     * 获取当前语言信息
     */
    getCurrentLanguage() {
        return {
            code: this.currentLanguage,
            config: this.supportedLanguages[this.currentLanguage],
            name: this.supportedLanguages[this.currentLanguage]?.nativeName || this.currentLanguage
        };
    }
    
    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return Object.entries(this.supportedLanguages).map(([code, config]) => ({
            code,
            name: config.name,
            nativeName: config.nativeName,
            flag: config.flag
        }));
    }
    
    /**
     * 销毁国际化系统
     */
    destroy() {
        this.languageChangeListeners.clear();
        this.translations.clear();
        this.loadedLanguages.clear();
        
        console.log('🌍 国际化系统已销毁');
    }
}

// 创建全局实例
window.i18n = new InternationalizationSystem();

// 导出常用函数
window.t = (key, params) => window.i18n.t(key, params);
window.changeLanguage = (langCode) => window.i18n.changeLanguage(langCode);
window.getCurrentLanguage = () => window.i18n.getCurrentLanguage();
window.getSupportedLanguages = () => window.i18n.getSupportedLanguages();

console.log('🚀 国际化系统模块加载完成');