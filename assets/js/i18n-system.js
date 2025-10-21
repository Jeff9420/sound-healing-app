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
        
        // 当前语言 - 默认英文
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
            // 强制设置默认语言为英语
            this.currentLanguage = 'en-US';
            this.fallbackLanguage = 'en-US';

            // 保存到本地存储
            localStorage.setItem('sound_healing_language', 'en-US');

            // 立即加载英语翻译数据
            await this.loadLanguageData('en-US');

            // 初始化格式化器
            this.initializeFormatters();

            // 立即应用英语
            await this.applyLanguage('en-US');

            // 设置初始化完成标志
            this.isInitialized = true;

            console.log(`✅ 国际化系统启动完成，当前语言: ${this.currentLanguage}`);

        } catch (error) {
            console.error('❌ 国际化系统启动失败:', error);
            // 降级到英文
            this.currentLanguage = 'en-US';
        }
    }
    
    /**
     * 检测用户语言偏好
     */
    detectUserLanguage() {
        // 优先级：本地存储 > 浏览器语言 > 默认英文
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
                'common.save': 'Save',
                'common.reset': 'Reset',

                // Authentication
                'auth.title': 'Login / Register',
                'auth.login': 'Login',
                'auth.signup': 'Register',
                'auth.reset': 'Reset Password',
                'auth.close': 'Close',
                'auth.email': 'Email Address',
                'auth.password': 'Password',
                'auth.displayName': 'Display Name',
                'auth.loginButton': 'Login',
                'auth.signupButton': 'Create Account',
                'auth.googleLogin': 'Login with Google',
                'auth.anonymousLogin': 'Continue Anonymously',
                'auth.resetButton': 'Send Reset Email',
                'auth.emailPlaceholder': 'Enter your email',
                'auth.passwordPlaceholder': 'Enter your password',
                'auth.displayNamePlaceholder': 'Enter your name',
                'auth.filledEmail': 'Please fill in all fields',
                'auth.passwordMinLength': 'Password must be at least 6 characters',
                'auth.resetEmailSent': 'Password reset email has been sent',

                // 应用页脚
                'app.footer': '🎧 Use headphones for best natural healing experience',

                // 表单：7日定制冥想计划
                'form.plan.title': 'Get Your 7-Day Custom Meditation Plan',
                'form.plan.description': 'Tell us your current state, and we\'ll create a structured 7-day audio therapy program combining soundscapes, meditation practices, and sleep suggestions.',
                'form.plan.benefit1': '2 daily audio recommendations with practice tips',
                'form.plan.benefit2': 'Reminder schedules aligned with sleep or focus goals',
                'form.plan.benefit3': 'Personalized mixing suggestions and progress tracking guide',

                // Authentication
                'auth.title': 'Login / Register',
                'auth.login': 'Login',
                'auth.signup': 'Register',
                'auth.reset': 'Reset Password',
                'auth.close': 'Close',
                'auth.email': 'Email Address',
                'auth.password': 'Password',
                'auth.displayName': 'Display Name',
                'auth.loginButton': 'Login',
                'auth.signupButton': 'Create Account',
                'auth.googleLogin': 'Login with Google',
                'auth.anonymousLogin': 'Continue Anonymously',
                'auth.resetButton': 'Send Reset Email',
                'auth.emailPlaceholder': 'Enter your email',
                'auth.passwordPlaceholder': 'Enter your password',
                'auth.displayNamePlaceholder': 'Enter your name',
                'auth.filledEmail': 'Please fill in all fields',
                'auth.passwordMinLength': 'Password must be at least 6 characters',
                'auth.resetEmailSent': 'Password reset email has been sent',

                // 表单：7日定制冥想计划
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

                // Hero Section
                'hero.eyebrow': '专业声音疗愈 · 5 种语言随时可用',
                'hero.headline': '213+ 沉浸式疗愈音频，帮你在 5 分钟内放松、睡眠与重启专注',
                'hero.description': '从雨林白噪到脉轮共振，一键进入专属音疗空间。个性化播放、混音、统计与离线缓存，让每一次呼吸都被疗愈。',
                'hero.cta.primary': '立即开启沉浸体验',
                'hero.cta.secondary': '查看核心亮点',
                'hero.cta.plan': '获取定制冥想计划',
                'hero.stats.audio': '疗愈音频与白噪合集',
                'hero.stats.scenes': '场景主题随情绪切换',
                'hero.stats.languages': '语言界面全球同步',

                // Header & Navigation
                'header.tagline': 'Soundflows · 数字音疗工作室',
                'nav.persona.toggle': '使用目标',
                'nav.persona.label': '使用目标',
                'nav.persona.meditation.title': '冥想专注',
                'nav.persona.meditation.desc': '晨间正念与全天专注练习',
                'nav.persona.sleep.title': '深度睡眠',
                'nav.persona.sleep.desc': '雨声与白噪声音引导快速入睡',
                'nav.persona.balance.title': '能量平衡',
                'nav.persona.balance.desc': '脉轮共振与气场净化',
                'nav.persona.emotion.title': '情绪疗愈',
                'nav.persona.emotion.desc': '潜意识疗愈与压力释放',
                'nav.resources': '资源中心',

                // Feature Summary Section
                'features.heading.title': '为什么选择声音疗愈空间？',
                'features.heading.desc': '我们把专业音疗体验压缩进一个浏览器，在任何设备上都能获取科学、柔和且富有仪式感的放松流程。',
                'features.heading.cta': '了解专业音疗统计',
                'features.card1.title': '沉浸场景秒匹配',
                'features.card1.desc': '根据分类智能切换视频背景与氛围动画，自然进入与情绪相匹配的疗愈空间。',
                'features.card2.title': '个性混音与收藏',
                'features.card2.desc': '混合雨声、白噪、颂钵等元素，保存个人配方并跨设备同步历史记录。',
                'features.card3.title': '专注模式与睡眠定时',
                'features.card3.desc': '全屏专注视图与智能睡眠定时器，让冥想、午休与夜间睡眠都更轻松。',
                'features.card4.title': '数据可视化洞察',
                'features.card4.desc': '内置统计面板记录播放频率、时长与偏好，帮助你建立持续的自我照护节奏。',

                // Journey Showcase Section
                'journey.heading.title': '选择与你状态匹配的疗愈旅程',
                'journey.heading.desc': '按目标切换专属声景，立即开始更聚焦的冥想、睡眠或情绪舒缓流程。',
                'journey.meditation.label': '冥想专注',
                'journey.meditation.title': '晨间冥想 & 日常正念',
                'journey.meditation.desc': '精选颂钵与呼吸声景，配合轻引导帮助你在 10 分钟内回到觉察与平静。',
                'journey.meditation.cta': '进入冥想旅程 →',
                'journey.sleep.label': '深度睡眠',
                'journey.sleep.title': '夜间放松 & 快速入睡',
                'journey.sleep.desc': '组合雨声、白噪与定时器，温柔覆盖夜晚每个阶段，让思绪慢慢沉静。',
                'journey.sleep.cta': '打开心流睡眠 →',
                'journey.balance.label': '能量平衡',
                'journey.balance.title': '脉轮疗愈 & 气场净化',
                'journey.balance.desc': '七大脉轮共振与水晶音浴，帮助身体与情绪重新找回内部秩序。',
                'journey.balance.cta': '感受能量复位 →',
                'journey.emotion.label': '情绪疗愈',
                'journey.emotion.title': '释放焦虑与压力',
                'journey.emotion.desc': '潜意识疗愈与引导式放松，陪你走过日常压力、告别负面循环。',
                'journey.emotion.cta': '开始情绪舒缓 →',

                // Content Hub Section
                'content.heading.title': '疗愈知识库 · 每天 10 分钟提升身心觉察',
                'content.heading.desc': '精选文章、实践指南与短视频，结合音疗技巧与真实案例，让"听"与"做"更有结构。',
                'content.heading.cta': '访问全部内容 →',
                'content.card1.tag': '指南',
                'content.card1.title': '30 分钟睡前音疗步骤',
                'content.card1.desc': '按照"缓和呼吸 → 白噪预热 → 深度冥想"的三段结构，快速进入深层睡眠。',
                'content.card1.link': '阅读指南 →',
                'content.card2.tag': '视频',
                'content.card2.title': '雨声 + 颂钵混音实操',
                'content.card2.desc': '1 分钟学会在混音台里叠加雨声与颂钵，让午后专注更稳定。',
                'content.card2.link': '即刻观看 →',
                'content.card3.tag': '案例',
                'content.card3.title': '设计师小安的晨间冥想',
                'content.card3.desc': '看看她如何用 7 日音疗计划缓解焦虑，并保持每周 5 次冥想的习惯。',
                'content.card3.link': '查看故事 →',
                'content.card4.tag': '音疗笔记',
                'content.card4.title': '脉轮共振与情绪释放',
                'content.card4.desc': '从颜色、频率到身体对应部位，了解脉轮疗愈的科学基础与入门练习。',
                'content.card4.link': '下载笔记 →',

                // Impact Proof Section
                'impact.stats.title': '38% 用户完成 7 日引导疗程',
                'impact.stats.desc': '基于 2025 年匿名数据，持续使用混音 + 冥想方案的用户中，有 38% 成功完成我们推荐的深度疗愈课程。',
                'impact.stats.cta': '查看详细数据面板',
                'impact.story.title': '用户故事 · 设计师小安的转变',
                'impact.story.desc': '通过 7 日音疗计划，她将晨间焦虑指数降低 45%，并把 15 分钟冥想融入日常通勤前的仪式。',
                'impact.story.link': '阅读完整故事 →',

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
                
                // Authentication
                'auth.title': 'Login / Register',
                'auth.login': 'Login',
                'auth.signup': 'Register',
                'auth.reset': 'Reset Password',
                'auth.email': 'Email Address',
                'auth.password': 'Password',
                'auth.displayName': 'Display Name',
                'auth.filledEmail': 'Please enter email address',
                'auth.passwordMinLength': 'Password must be at least 6 characters',
                'auth.loginButton': 'Login',
                'auth.signupButton': 'Register',
                'auth.resetButton': 'Send Reset Email',
                'auth.googleLogin': 'Login with Google',
                'auth.emailLogin': 'Email Login',
                'auth.phoneLogin': 'Phone Login',
                'auth.anonymousLogin': 'Use Anonymously',
                'auth.resetEmailSent': 'Password reset email sent',
                'auth.logout': 'Logout',
                'auth.welcome': 'Welcome to Sound Healing Space',
                'auth.resetInstructions': 'Enter your email address and we will send you a reset link',

                // User menu
                'user.welcome': 'Welcome to Sound Healing Space',
                'nav.history': 'Play History',
                'nav.favorites': 'My Favorites',
                'nav.stats': 'Listening Statistics',
                'nav.settings': 'Settings',

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

                // Hero Section
                'hero.eyebrow': 'Professional Sound Healing · Available in 5 Languages',
                'hero.headline': '213+ Immersive Healing Audio Tracks - Relax, Sleep & Refocus in 5 Minutes',
                'hero.description': 'From rainforest white noise to chakra resonance, enter your personal sound therapy space with one click. Personalized playback, mixing, statistics and offline caching make every breath a healing moment.',
                'hero.cta.primary': 'Start Immersive Experience',
                'hero.cta.secondary': 'View Core Features',
                'hero.cta.plan': 'Get Custom Meditation Plan',
                'hero.stats.audio': 'Healing Audio & White Noise Collection',
                'hero.stats.scenes': 'Scene Themes Match Your Mood',
                'hero.stats.languages': 'Language Interface Global Sync',

                // Header & Navigation
                'header.tagline': 'Soundflows · Digital Sound Therapy Studio',
                'nav.persona.toggle': 'Usage Goals',
                'nav.persona.label': 'Usage Goals',
                'nav.persona.meditation.title': 'Meditation & Focus',
                'nav.persona.meditation.desc': 'Morning mindfulness & all-day focus practice',
                'nav.persona.sleep.title': 'Deep Sleep',
                'nav.persona.sleep.desc': 'Rain sounds & white noise guide fast sleep',
                'nav.persona.balance.title': 'Energy Balance',
                'nav.persona.balance.desc': 'Chakra resonance & aura cleansing',
                'nav.persona.emotion.title': 'Emotional Healing',
                'nav.persona.emotion.desc': 'Subconscious therapy & stress release',
                'nav.resources': 'Resource Center',

                // Feature Summary Section
                'features.heading.title': 'Why Choose Sound Healing Space?',
                'features.heading.desc': 'We compress professional sound therapy experience into a browser, bringing scientific, gentle and ritual relaxation flows to any device.',
                'features.heading.cta': 'Explore Professional Sound Therapy Statistics',
                'features.card1.title': 'Immersive Scenes Auto-Match',
                'features.card1.desc': 'Intelligently switch video backgrounds and ambient animations based on category, naturally entering healing spaces that match your emotions.',
                'features.card2.title': 'Personal Mixing & Favorites',
                'features.card2.desc': 'Mix rain sounds, white noise, singing bowls and other elements, save personal recipes and sync listening history across devices.',
                'features.card3.title': 'Focus Mode & Sleep Timer',
                'features.card3.desc': 'Full-screen focus view and smart sleep timer make meditation, naps and nighttime sleep easier.',
                'features.card4.title': 'Data Visualization Insights',
                'features.card4.desc': 'Built-in stats panel records playback frequency, duration and preferences, helping you build sustainable self-care rhythms.',

                // Journey Showcase Section
                'journey.heading.title': 'Choose Healing Journeys That Match Your State',
                'journey.heading.desc': 'Switch to exclusive soundscapes by goal, immediately start more focused meditation, sleep or emotional soothing flows.',
                'journey.meditation.label': 'Meditation & Focus',
                'journey.meditation.title': 'Morning Meditation & Daily Mindfulness',
                'journey.meditation.desc': 'Selected singing bowls and breath soundscapes, with light guidance to help you return to awareness and calm within 10 minutes.',
                'journey.meditation.cta': 'Enter Meditation Journey →',
                'journey.sleep.label': 'Deep Sleep',
                'journey.sleep.title': 'Nighttime Relaxation & Fast Sleep',
                'journey.sleep.desc': 'Combine rain sounds, white noise and timer to gently cover every stage of the night, letting thoughts slowly settle.',
                'journey.sleep.cta': 'Open Flow Sleep →',
                'journey.balance.label': 'Energy Balance',
                'journey.balance.title': 'Chakra Healing & Aura Cleansing',
                'journey.balance.desc': 'Seven chakra resonances and crystal sound baths help body and emotions rediscover internal order.',
                'journey.balance.cta': 'Feel Energy Rebalance →',
                'journey.emotion.label': 'Emotional Healing',
                'journey.emotion.title': 'Release Anxiety & Stress',
                'journey.emotion.desc': 'Subconscious healing and guided relaxation accompany you through daily stress, saying goodbye to negative cycles.',
                'journey.emotion.cta': 'Start Emotional Soothing →',

                // Content Hub Section
                'content.heading.title': 'Healing Knowledge Base · 10 Minutes Daily to Enhance Mind-Body Awareness',
                'content.heading.desc': 'Selected articles, practice guides and short videos, combining sound therapy techniques and real cases, make "listening" and "doing" more structured.',
                'content.heading.cta': 'Visit All Content →',
                'content.card1.tag': 'Guide',
                'content.card1.title': '30-Minute Bedtime Sound Therapy Steps',
                'content.card1.desc': 'Follow the three-step structure of "gentle breathing → white noise warmup → deep meditation" to quickly enter deep sleep.',
                'content.card1.link': 'Read Guide →',
                'content.card2.tag': 'Video',
                'content.card2.title': 'Rain Sound + Singing Bowl Mixing Practice',
                'content.card2.desc': 'Learn in 1 minute how to layer rain sounds and singing bowls in the mixer for more stable afternoon focus.',
                'content.card2.link': 'Watch Now →',
                'content.card3.tag': 'Case Study',
                'content.card3.title': 'Designer An\'s Morning Meditation',
                'content.card3.desc': 'See how she used the 7-day sound therapy plan to relieve anxiety and maintain 5 meditation sessions per week.',
                'content.card3.link': 'View Story →',
                'content.card4.tag': 'Sound Therapy Notes',
                'content.card4.title': 'Chakra Resonance & Emotional Release',
                'content.card4.desc': 'From colors and frequencies to corresponding body parts, understand the scientific basis and beginner practices of chakra healing.',
                'content.card4.link': 'Download Notes →',

                // Impact Proof Section
                'impact.stats.title': '38% of Users Completed 7-Day Guided Therapy',
                'impact.stats.desc': 'Based on 2025 anonymous data, 38% of users who consistently used the mixing + meditation program successfully completed our recommended deep healing course.',
                'impact.stats.cta': 'View Detailed Data Panel',
                'impact.story.title': 'User Story · Designer An\'s Transformation',
                'impact.story.desc': 'Through the 7-day sound therapy plan, she reduced morning anxiety by 45% and integrated 15-minute meditation into her daily pre-commute ritual.',
                'impact.story.link': 'Read Full Story →',

                // SEO Meta Tags (Keyword Optimized)
                'seo.title': 'Free Meditation Music & Rain Sounds for Sleeping | 213+ Healing Sounds',
                'seo.description': 'Free online sound healing platform with 213+ audio tracks: meditation music, rain sounds for sleeping, white noise, nature sounds. Perfect for relaxation, sleep & stress relief.',

                // Authentication Dialog - Firebase Auth UI
                'auth.title': 'Login / Register',
                'auth.login': 'Login',
                'auth.signup': 'Register',
                'auth.reset': 'Reset Password',
                'auth.close': 'Close',

                // Form Labels
                'auth.email': 'Email Address',
                'auth.password': 'Password',
                'auth.displayName': 'Display Name',

                // Form Placeholders
                'auth.emailPlaceholder': 'Enter your email',
                'auth.passwordPlaceholder': 'Enter your password',
                'auth.displayNamePlaceholder': 'Enter your name',

                // Form Buttons
                'auth.loginButton': 'Login',
                'auth.signupButton': 'Create Account',
                'auth.googleLogin': 'Login with Google',
                'auth.anonymousLogin': 'Continue Anonymously',
                'auth.resetButton': 'Send Reset Email',

                // Form Messages
                'auth.filledEmail': 'Please fill in all fields',
                'auth.passwordMinLength': 'Password must be at least 6 characters',
                'auth.resetEmailSent': 'Password reset email has been sent'
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

                // Hero Section
                'hero.eyebrow': 'プロフェッショナル音響療法 · 5言語対応',
                'hero.headline': '213+以上の没入型ヒーリングオーディオ - 5分でリラックス、睡眠、集中力を回復',
                'hero.description': '熱帯雨林のホワイトノイズからチャクラ共鳴まで、ワンクリックで専用の音響療法スペースに入ります。パーソナライズされた再生、ミキシング、統計、オフラインキャッシング - 全ての呼吸を癒しの瞬間に。',
                'hero.cta.primary': '没入体験を始める',
                'hero.cta.secondary': 'コア機能を見る',
                'hero.cta.plan': 'カスタム瞑想プランを入手',
                'hero.stats.audio': 'ヒーリングオーディオ & ホワイトノイズコレクション',
                'hero.stats.scenes': 'シーンテーマは気分に合わせて',
                'hero.stats.languages': '言語インターフェースグローバル同期',

                // Header & Navigation
                'header.tagline': 'Soundflows · デジタル音響療法スタジオ',
                'nav.persona.toggle': '使用目標',
                'nav.persona.label': '使用目標',
                'nav.persona.meditation.title': '瞑想と集中',
                'nav.persona.meditation.desc': '朝のマインドフルネス & 終日集中練習',
                'nav.persona.sleep.title': '深い睡眠',
                'nav.persona.sleep.desc': '雨音 & ホワイトノイズが速やかな眠りへ導く',
                'nav.persona.balance.title': 'エネルギーバランス',
                'nav.persona.balance.desc': 'チャクラ共鳴 & オーラクレンジング',
                'nav.persona.emotion.title': '感情ヒーリング',
                'nav.persona.emotion.desc': '潜在意識療法 & ストレス解放',
                'nav.resources': 'リソースセンター',

                // Feature Summary Section
                'features.heading.title': 'なぜサウンドヒーリングスペースを選ぶのか？',
                'features.heading.desc': 'プロフェッショナルな音響療法体験をブラウザに圧縮し、科学的で優しく儀式的なリラクゼーションフローをあらゆるデバイスにもたらします。',
                'features.heading.cta': 'プロフェッショナル音響療法統計を探索',
                'features.card1.title': '没入型シーン自動マッチング',
                'features.card1.desc': 'カテゴリーに基づいてビデオ背景とアンビエントアニメーションをインテリジェントに切り替え、感情に合ったヒーリングスペースに自然に入ります。',
                'features.card2.title': 'パーソナルミキシング & お気に入り',
                'features.card2.desc': '雨音、ホワイトノイズ、シンギングボウルなどの要素をミックスし、個人のレシピを保存してデバイス間でリスニング履歴を同期します。',
                'features.card3.title': '集中モード & スリープタイマー',
                'features.card3.desc': '全画面集中ビューとスマートスリープタイマーで、瞑想、昼寝、夜間睡眠をより簡単に。',
                'features.card4.title': 'データ可視化インサイト',
                'features.card4.desc': '内蔵統計パネルが再生頻度、時間、好みを記録し、持続可能なセルフケアリズムを構築するのを助けます。',

                // Journey Showcase Section
                'journey.heading.title': '状態に合ったヒーリングジャーニーを選択',
                'journey.heading.desc': '目標別に専用サウンドスケープに切り替え、より集中した瞑想、睡眠、または感情的な落ち着きのフローをすぐに開始します。',
                'journey.meditation.label': '瞑想と集中',
                'journey.meditation.title': '朝の瞑想 & 日常のマインドフルネス',
                'journey.meditation.desc': '厳選されたシンギングボウルと呼吸サウンドスケープ、軽いガイダンスで10分以内に気づきと静けさに戻ります。',
                'journey.meditation.cta': '瞑想ジャーニーに入る →',
                'journey.sleep.label': '深い睡眠',
                'journey.sleep.title': '夜間リラクゼーション & 速やかな眠り',
                'journey.sleep.desc': '雨音、ホワイトノイズ、タイマーを組み合わせて夜の各段階を優しくカバーし、思考をゆっくり落ち着かせます。',
                'journey.sleep.cta': 'フロー睡眠を開く →',
                'journey.balance.label': 'エネルギーバランス',
                'journey.balance.title': 'チャクラヒーリング & オーラクレンジング',
                'journey.balance.desc': '七つのチャクラ共鳴とクリスタルサウンドバスが身体と感情の内部秩序を再発見するのを助けます。',
                'journey.balance.cta': 'エネルギーリバランスを感じる →',
                'journey.emotion.label': '感情ヒーリング',
                'journey.emotion.title': '不安とストレスの解放',
                'journey.emotion.desc': '潜在意識ヒーリングとガイド付きリラクゼーションが日々のストレスを伴い、ネガティブサイクルに別れを告げます。',
                'journey.emotion.cta': '感情的な落ち着きを始める →',

                // Content Hub Section
                'content.heading.title': 'ヒーリング知識ベース · 毎日10分で心身の気づきを高める',
                'content.heading.desc': '厳選された記事、練習ガイド、短編ビデオ、音響療法技術と実際のケースを組み合わせて、「聴く」と「する」をより構造的にします。',
                'content.heading.cta': '全コンテンツを訪問 →',
                'content.card1.tag': 'ガイド',
                'content.card1.title': '30分就寝前音響療法ステップ',
                'content.card1.desc': '「優しい呼吸 → ホワイトノイズウォームアップ → 深い瞑想」の3段階構造に従って、深い睡眠に素早く入ります。',
                'content.card1.link': 'ガイドを読む →',
                'content.card2.tag': 'ビデオ',
                'content.card2.title': '雨音 + シンギングボウルミキシング実践',
                'content.card2.desc': '1分でミキサーで雨音とシンギングボウルを重ねる方法を学び、午後の集中をより安定させます。',
                'content.card2.link': '今すぐ見る →',
                'content.card3.tag': 'ケーススタディ',
                'content.card3.title': 'デザイナーAnの朝の瞑想',
                'content.card3.desc': '彼女が7日間の音響療法プランを使用して不安を和らげ、週5回の瞑想セッションを維持した方法をご覧ください。',
                'content.card3.link': 'ストーリーを見る →',
                'content.card4.tag': '音響療法ノート',
                'content.card4.title': 'チャクラ共鳴と感情解放',
                'content.card4.desc': '色と周波数から対応する身体部位まで、チャクラヒーリングの科学的基礎と初心者の練習を理解します。',
                'content.card4.link': 'ノートをダウンロード →',

                // Impact Proof Section
                'impact.stats.title': '38%のユーザーが7日間のガイド付き療法を完了',
                'impact.stats.desc': '2025年の匿名データに基づくと、ミキシング + 瞑想プログラムを一貫して使用したユーザーの38%が推奨する深いヒーリングコースを成功裏に完了しました。',
                'impact.stats.cta': '詳細なデータパネルを表示',
                'impact.story.title': 'ユーザーストーリー · デザイナーAnの変革',
                'impact.story.desc': '7日間の音響療法プランを通じて、彼女は朝の不安を45%減少させ、毎日の通勤前の儀式に15分の瞑想を統合しました。',
                'impact.story.link': '完全なストーリーを読む →',

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

                // Hero Section
                'hero.eyebrow': '프로페셔널 사운드 힐링 · 5개 언어 지원',
                'hero.headline': '213+ 몰입형 힐링 오디오 트랙 - 5분 안에 릴랙스, 수면, 집중력 회복',
                'hero.description': '열대우림 백색 소음부터 차크라 공명까지, 원클릭으로 당신만의 사운드 테라피 공간에 진입하세요. 개인화된 재생, 믹싱, 통계 및 오프라인 캐싱 - 모든 호흡을 힐링의 순간으로.',
                'hero.cta.primary': '몰입형 경험 시작',
                'hero.cta.secondary': '핵심 기능 보기',
                'hero.cta.plan': '맞춤 명상 계획 받기',
                'hero.stats.audio': '힐링 오디오 & 백색 소음 컬렉션',
                'hero.stats.scenes': '기분에 맞는 장면 테마',
                'hero.stats.languages': '언어 인터페이스 글로벌 동기화',

                // Header & Navigation
                'header.tagline': 'Soundflows · 디지털 사운드 테라피 스튜디오',
                'nav.persona.toggle': '사용 목표',
                'nav.persona.label': '사용 목표',
                'nav.persona.meditation.title': '명상과 집중',
                'nav.persona.meditation.desc': '아침 마인드풀니스 & 하루 종일 집중 연습',
                'nav.persona.sleep.title': '깊은 수면',
                'nav.persona.sleep.desc': '빗소리 & 백색 소음이 빠른 수면으로 안내',
                'nav.persona.balance.title': '에너지 균형',
                'nav.persona.balance.desc': '차크라 공명 & 오라 클렌징',
                'nav.persona.emotion.title': '감정 힐링',
                'nav.persona.emotion.desc': '잠재의식 요법 & 스트레스 해방',
                'nav.resources': '리소스 센터',

                // Feature Summary Section
                'features.heading.title': '왜 사운드 힐링 스페이스를 선택하나요?',
                'features.heading.desc': '우리는 전문 사운드 테라피 경험을 브라우저로 압축하여 과학적이고 부드러우며 의식적인 이완 플로우를 모든 기기에 제공합니다.',
                'features.heading.cta': '전문 사운드 테라피 통계 탐색',
                'features.card1.title': '몰입형 장면 자동 매칭',
                'features.card1.desc': '카테고리에 따라 비디오 배경과 앰비언트 애니메이션을 지능적으로 전환하여 감정에 맞는 힐링 공간으로 자연스럽게 진입합니다.',
                'features.card2.title': '개인 믹싱 & 즐겨찾기',
                'features.card2.desc': '빗소리, 백색 소음, 싱잉볼 등의 요소를 믹스하고, 개인 레시피를 저장하며 기기 간 청취 기록을 동기화합니다.',
                'features.card3.title': '집중 모드 & 수면 타이머',
                'features.card3.desc': '전체 화면 집중 뷰와 스마트 수면 타이머로 명상, 낮잠 및 야간 수면을 더 쉽게.',
                'features.card4.title': '데이터 시각화 인사이트',
                'features.card4.desc': '내장 통계 패널이 재생 빈도, 시간 및 선호도를 기록하여 지속 가능한 자기 관리 리듬을 구축하도록 돕습니다.',

                // Journey Showcase Section
                'journey.heading.title': '상태에 맞는 힐링 여정 선택',
                'journey.heading.desc': '목표별로 전용 사운드스케이프로 전환하여 더 집중된 명상, 수면 또는 감정적 진정 플로우를 즉시 시작합니다.',
                'journey.meditation.label': '명상과 집중',
                'journey.meditation.title': '아침 명상 & 일상 마인드풀니스',
                'journey.meditation.desc': '엄선된 싱잉볼과 호흡 사운드스케이프, 가벼운 가이던스로 10분 이내에 인식과 평온으로 돌아갑니다.',
                'journey.meditation.cta': '명상 여정 입장 →',
                'journey.sleep.label': '깊은 수면',
                'journey.sleep.title': '야간 이완 & 빠른 수면',
                'journey.sleep.desc': '빗소리, 백색 소음, 타이머를 결합하여 밤의 각 단계를 부드럽게 커버하고 생각을 천천히 가라앉힙니다.',
                'journey.sleep.cta': '플로우 수면 열기 →',
                'journey.balance.label': '에너지 균형',
                'journey.balance.title': '차크라 힐링 & 오라 클렌징',
                'journey.balance.desc': '일곱 가지 차크라 공명과 크리스탈 사운드 배스가 몸과 감정의 내부 질서를 재발견하도록 돕습니다.',
                'journey.balance.cta': '에너지 재균형 느끼기 →',
                'journey.emotion.label': '감정 힐링',
                'journey.emotion.title': '불안과 스트레스 해방',
                'journey.emotion.desc': '잠재의식 힐링과 가이드 이완이 일상 스트레스를 동반하며 부정적 순환에 작별을 고합니다.',
                'journey.emotion.cta': '감정적 진정 시작 →',

                // Content Hub Section
                'content.heading.title': '힐링 지식 베이스 · 매일 10분으로 심신 인식 향상',
                'content.heading.desc': '엄선된 기사, 실습 가이드 및 짧은 비디오, 사운드 테라피 기술과 실제 사례를 결합하여 "듣기"와 "하기"를 더 구조화합니다.',
                'content.heading.cta': '모든 콘텐츠 방문 →',
                'content.card1.tag': '가이드',
                'content.card1.title': '30분 취침 전 사운드 테라피 단계',
                'content.card1.desc': '"부드러운 호흡 → 백색 소음 워밍업 → 깊은 명상"의 3단계 구조를 따라 깊은 수면에 빠르게 진입합니다.',
                'content.card1.link': '가이드 읽기 →',
                'content.card2.tag': '비디오',
                'content.card2.title': '빗소리 + 싱잉볼 믹싱 실습',
                'content.card2.desc': '1분 안에 믹서에서 빗소리와 싱잉볼을 레이어하는 방법을 배워 오후 집중력을 더 안정적으로 만듭니다.',
                'content.card2.link': '지금 보기 →',
                'content.card3.tag': '사례 연구',
                'content.card3.title': '디자이너 An의 아침 명상',
                'content.card3.desc': '그녀가 7일 사운드 테라피 플랜을 사용하여 불안을 완화하고 주 5회 명상 세션을 유지한 방법을 확인하세요.',
                'content.card3.link': '스토리 보기 →',
                'content.card4.tag': '사운드 테라피 노트',
                'content.card4.title': '차크라 공명과 감정 해방',
                'content.card4.desc': '색상과 주파수부터 해당 신체 부위까지 차크라 힐링의 과학적 기초와 초보자 실습을 이해합니다.',
                'content.card4.link': '노트 다운로드 →',

                // Impact Proof Section
                'impact.stats.title': '38%의 사용자가 7일 가이드 요법 완료',
                'impact.stats.desc': '2025년 익명 데이터를 기반으로 믹싱 + 명상 프로그램을 꾸준히 사용한 사용자 중 38%가 권장 깊은 힐링 코스를 성공적으로 완료했습니다.',
                'impact.stats.cta': '상세 데이터 패널 보기',
                'impact.story.title': '사용자 스토리 · 디자이너 An의 변화',
                'impact.story.desc': '7일 사운드 테라피 플랜을 통해 그녀는 아침 불안을 45% 감소시키고 매일 출근 전 의식에 15분 명상을 통합했습니다.',
                'impact.story.link': '전체 스토리 읽기 →',

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

                // Hero Section
                'hero.eyebrow': 'Sanación de Sonido Profesional · Disponible en 5 Idiomas',
                'hero.headline': '213+ Pistas de Audio de Sanación Inmersivas - Relájate, Duerme y Recupera el Enfoque en 5 Minutos',
                'hero.description': 'Desde ruido blanco de selva tropical hasta resonancia de chakra, ingresa a tu espacio de terapia de sonido personal con un clic. La reproducción personalizada, mezcla, estadísticas y almacenamiento en caché sin conexión hacen que cada respiración sea un momento de sanación.',
                'hero.cta.primary': 'Comenzar Experiencia Inmersiva',
                'hero.cta.secondary': 'Ver Funciones Principales',
                'hero.cta.plan': 'Obtener Plan de Meditación Personalizado',
                'hero.stats.audio': 'Colección de Audio de Sanación y Ruido Blanco',
                'hero.stats.scenes': 'Temas de Escena Coinciden con Tu Estado de Ánimo',
                'hero.stats.languages': 'Sincronización Global de Interfaz de Idioma',

                // Header & Navigation
                'header.tagline': 'Soundflows · Estudio Digital de Terapia de Sonido',
                'nav.persona.toggle': 'Objetivos de Uso',
                'nav.persona.label': 'Objetivos de Uso',
                'nav.persona.meditation.title': 'Meditación y Enfoque',
                'nav.persona.meditation.desc': 'Atención plena matutina y práctica de enfoque durante todo el día',
                'nav.persona.sleep.title': 'Sueño Profundo',
                'nav.persona.sleep.desc': 'Sonidos de lluvia y ruido blanco guían el sueño rápido',
                'nav.persona.balance.title': 'Equilibrio Energético',
                'nav.persona.balance.desc': 'Resonancia de chakra y limpieza de aura',
                'nav.persona.emotion.title': 'Sanación Emocional',
                'nav.persona.emotion.desc': 'Terapia subconsciente y liberación de estrés',
                'nav.resources': 'Centro de Recursos',

                // Feature Summary Section
                'features.heading.title': '¿Por Qué Elegir Espacio de Sanación de Sonido?',
                'features.heading.desc': 'Comprimimos la experiencia de terapia de sonido profesional en un navegador, trayendo flujos de relajación científicos, suaves y rituales a cualquier dispositivo.',
                'features.heading.cta': 'Explorar Estadísticas de Terapia de Sonido Profesional',
                'features.card1.title': 'Coincidencia Automática de Escenas Inmersivas',
                'features.card1.desc': 'Cambie inteligentemente los fondos de video y las animaciones ambientales según la categoría, entrando naturalmente en espacios de sanación que coinciden con sus emociones.',
                'features.card2.title': 'Mezcla Personal y Favoritos',
                'features.card2.desc': 'Mezcle sonidos de lluvia, ruido blanco, cuencos tibetanos y otros elementos, guarde recetas personales y sincronice el historial de escucha entre dispositivos.',
                'features.card3.title': 'Modo de Enfoque y Temporizador de Sueño',
                'features.card3.desc': 'La vista de enfoque de pantalla completa y el temporizador de sueño inteligente hacen que la meditación, las siestas y el sueño nocturno sean más fáciles.',
                'features.card4.title': 'Perspectivas de Visualización de Datos',
                'features.card4.desc': 'El panel de estadísticas integrado registra la frecuencia de reproducción, la duración y las preferencias, ayudándole a construir ritmos de autocuidado sostenibles.',

                // Journey Showcase Section
                'journey.heading.title': 'Elija Viajes de Sanación que Coincidan con Su Estado',
                'journey.heading.desc': 'Cambie a paisajes sonoros exclusivos por objetivo, comience inmediatamente flujos de meditación, sueño o alivio emocional más enfocados.',
                'journey.meditation.label': 'Meditación y Enfoque',
                'journey.meditation.title': 'Meditación Matutina y Atención Plena Diaria',
                'journey.meditation.desc': 'Cuencos tibetanos seleccionados y paisajes sonoros de respiración, con orientación ligera para ayudarlo a regresar a la conciencia y la calma en 10 minutos.',
                'journey.meditation.cta': 'Entrar al Viaje de Meditación →',
                'journey.sleep.label': 'Sueño Profundo',
                'journey.sleep.title': 'Relajación Nocturna y Sueño Rápido',
                'journey.sleep.desc': 'Combine sonidos de lluvia, ruido blanco y temporizador para cubrir suavemente cada etapa de la noche, dejando que los pensamientos se asienten lentamente.',
                'journey.sleep.cta': 'Abrir Sueño de Flujo →',
                'journey.balance.label': 'Equilibrio Energético',
                'journey.balance.title': 'Sanación de Chakra y Limpieza de Aura',
                'journey.balance.desc': 'Siete resonancias de chakra y baños de sonido de cristal ayudan al cuerpo y las emociones a redescubrir el orden interno.',
                'journey.balance.cta': 'Sentir Reequilibrio Energético →',
                'journey.emotion.label': 'Sanación Emocional',
                'journey.emotion.title': 'Liberar Ansiedad y Estrés',
                'journey.emotion.desc': 'La sanación subconsciente y la relajación guiada lo acompañan a través del estrés diario, despidiéndose de los ciclos negativos.',
                'journey.emotion.cta': 'Comenzar Alivio Emocional →',

                // Content Hub Section
                'content.heading.title': 'Base de Conocimiento de Sanación · 10 Minutos Diarios para Mejorar la Conciencia Mente-Cuerpo',
                'content.heading.desc': 'Artículos seleccionados, guías de práctica y videos cortos, combinando técnicas de terapia de sonido y casos reales, hacen que "escuchar" y "hacer" sean más estructurados.',
                'content.heading.cta': 'Visitar Todo el Contenido →',
                'content.card1.tag': 'Guía',
                'content.card1.title': 'Pasos de Terapia de Sonido de 30 Minutos antes de Acostarse',
                'content.card1.desc': 'Siga la estructura de tres pasos de "respiración suave → calentamiento de ruido blanco → meditación profunda" para entrar rápidamente en el sueño profundo.',
                'content.card1.link': 'Leer Guía →',
                'content.card2.tag': 'Video',
                'content.card2.title': 'Práctica de Mezcla de Sonido de Lluvia + Cuenco Tibetano',
                'content.card2.desc': 'Aprenda en 1 minuto cómo superponer sonidos de lluvia y cuencos tibetanos en el mezclador para un enfoque de tarde más estable.',
                'content.card2.link': 'Ver Ahora →',
                'content.card3.tag': 'Caso de Estudio',
                'content.card3.title': 'Meditación Matutina de la Diseñadora An',
                'content.card3.desc': 'Vea cómo usó el plan de terapia de sonido de 7 días para aliviar la ansiedad y mantener 5 sesiones de meditación por semana.',
                'content.card3.link': 'Ver Historia →',
                'content.card4.tag': 'Notas de Terapia de Sonido',
                'content.card4.title': 'Resonancia de Chakra y Liberación Emocional',
                'content.card4.desc': 'Desde colores y frecuencias hasta partes del cuerpo correspondientes, comprenda la base científica y las prácticas para principiantes de la sanación de chakra.',
                'content.card4.link': 'Descargar Notas →',

                // Impact Proof Section
                'impact.stats.title': '38% de los Usuarios Completaron la Terapia Guiada de 7 Días',
                'impact.stats.desc': 'Basado en datos anónimos de 2025, el 38% de los usuarios que usaron consistentemente el programa de mezcla + meditación completaron con éxito nuestro curso de sanación profunda recomendado.',
                'impact.stats.cta': 'Ver Panel de Datos Detallado',
                'impact.story.title': 'Historia de Usuario · Transformación de la Diseñadora An',
                'impact.story.desc': 'A través del plan de terapia de sonido de 7 días, redujo la ansiedad matutina en un 45% e integró 15 minutos de meditación en su ritual diario antes de ir al trabajo.',
                'impact.story.link': 'Leer Historia Completa →',

                // SEO Meta Etiquetas
                'seo.title': 'Música de Meditación Gratuita y Sonidos de Lluvia para Dormir | 213+ Sonidos Curativos',
                'seo.description': 'Plataforma gratuita de sanación con sonido con más de 213 pistas de audio: música de meditación, sonidos de lluvia para dormir, ruido blanco, sonidos de la naturaleza. Perfecto para relajación, sueño y alivio del estrés.'
            }
        };

        return translations[langCode] || translations['en-US'];
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

        // 立即显示加载指示器
        this.showLoadingIndicator();

        try {
            // 如果语言数据未加载，先加载
            if (!this.loadedLanguages.has(langCode)) {
                await this.loadLanguageData(langCode);
            }

            // 立即更新当前语言
            this.currentLanguage = langCode;

            // 保存语言偏好
            localStorage.setItem('sound_healing_language', langCode);

            // 立即应用语言
            await this.applyLanguage(langCode);

            // 通知语言变更
            this.notifyLanguageChange(langCode);

            // 隐藏加载指示器
            this.hideLoadingIndicator();

            console.log(`✅ 语言切换完成: ${langCode}`);
            return true;

        } catch (error) {
            this.hideLoadingIndicator();
            console.error(`❌ 语言切换失败: ${langCode}`, error);
            return false;
        }
    }

    /**
     * 显示加载指示器
     */
    showLoadingIndicator() {
        let indicator = document.getElementById('language-loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'language-loading-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10001;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            indicator.innerHTML = '🌍 Switching language...';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }

    /**
     * 隐藏加载指示器
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('language-loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
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