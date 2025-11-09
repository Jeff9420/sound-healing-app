(function(){
    const extraTranslations = {
        'en-US': {
            'hero.panel.badge': 'Trusted nightly ritual',
            'hero.panel.copy': 'A calm-first experience that streams instantly on any device—no log-in required to start relaxing tonight.',
            'hero.panel.footer': 'Backed by 120K+ anonymous sleep & focus logs',
            'hero.panel.link': 'See results →',
            'hero.metrics.soundscapes': 'Healing soundscapes',
            'hero.metrics.soundscapes.desc': 'Rain, white noise, bowls & breath-led journeys.',
            'hero.metrics.languages': 'Languages supported',
            'hero.metrics.languages.desc': 'English, 中文, 日本語, 한국어, Español & more.',
            'hero.metrics.sessions': 'Guided sessions played',
            'hero.metrics.sessions.desc': 'Sleep logs, focus rituals and mindful mornings.',
            'hero.metrics.journeys': '5 core journeys',
            'hero.metrics.journeys.sleep': 'Sleep',
            'hero.metrics.journeys.focus': 'Focus',
            'hero.metrics.journeys.anxiety': 'Anxiety',
            'hero.metrics.journeys.emotion': 'Emotions',
            'hero.metrics.journeys.chakra': 'Chakras',
            'player.instantLabel': 'Instant Player',
            'player.instantHeadline': 'One tap to start relaxing',
            'player.defaultTrack.badge': 'Official recommendation',
            'player.defaultTrack.title': 'Sleep Warm Rain · 15 min',
            'player.defaultTrack.tags': '#sleep #beginner #try-tonight',
            'player.defaultTrack.desc': 'A gentle, voice-free rain track to slow your mind before bed.',
            'player.defaultTrack.error': 'Unable to load the starter track. Please try another category.',
            'player.helper': 'Press ▶️ to start your first session. No signup needed.',
            'form.plan.trust': 'Generated from 120K+ anonymous sessions. You can unsubscribe anytime.',
            'form.plan.privacy': 'We only send content related to sleep and mindfulness. No spam, no selling your data.',
            'auth.guestHint': 'You can explore most features as a guest and link your email later.',
            'auth.guestCta': 'Continue as guest',
            'quickStart.title': 'What do you need tonight?',
            'quickStart.subtitle': 'Pick a journey and start with a single tap.',
            'quickStart.browseAll': 'Browse all categories',
            'featured.rain.name': '15-min Sleep Rain',
            'featured.rain.purpose': 'Eases your mind into deep sleep before bed.',
            'featured.meditation.name': '10-min Focus Breath',
            'featured.meditation.purpose': 'Resets anxious mornings with breathing cues.',
            'featured.hypnosis.name': 'Guided Hypnosis Intro',
            'featured.hypnosis.purpose': 'A gentle suggestion track for stress release.',
            'featured.playBtn': 'Play now',
            'categories.title': 'Sound journeys by goal',
            'categories.subtitle': '213+ curated playlists for sleep, focus, stress relief and more.'
        },
        'zh-CN': {
            'hero.panel.badge': '每天的安心例行',
            'hero.panel.copy': '无需登录即可即点即听，在任何设备上都能先感受再决定。',
            'hero.panel.footer': '基于 120K+ 匿名睡眠与专注日志',
            'hero.panel.link': '查看数据 →',
            'hero.metrics.soundscapes': '疗愈声景',
            'hero.metrics.soundscapes.desc': '雨声、白噪、颂钵与呼吸引导',
            'hero.metrics.languages': '支持语言',
            'hero.metrics.languages.desc': '英语、中文、日语、韩语、西语等',
            'hero.metrics.sessions': '引导冥想播放',
            'hero.metrics.sessions.desc': '睡眠记录、专注流程、晨间练习',
            'hero.metrics.journeys': '5 个疗愈目标',
            'hero.metrics.journeys.sleep': '睡眠',
            'hero.metrics.journeys.focus': '专注',
            'hero.metrics.journeys.anxiety': '焦虑',
            'hero.metrics.journeys.emotion': '情绪',
            'hero.metrics.journeys.chakra': '脉轮',
            'player.instantLabel': '即时播放器',
            'player.instantHeadline': '按下播放，立刻放松',
            'player.defaultTrack.badge': '官方推荐',
            'player.defaultTrack.title': '15 分钟雨声 · 快速入睡',
            'player.defaultTrack.tags': '#睡眠 #新手向 #今晚就试试',
            'player.defaultTrack.desc': '无人声的温柔雨声，睡前 15 分钟帮助大脑慢下来。',
            'player.defaultTrack.error': '暂时无法加载默认音轨，请稍后重试或选择其他分类。',
            'player.helper': '点击 ▶️ 即可开始今天的疗愈声音旅程，无需注册。',
            'form.plan.trust': '基于 120K+ 匿名使用数据生成，可随时取消订阅。',
            'form.plan.privacy': '我们只会发送与你睡眠/冥想相关的内容，不会出售邮箱或发送广告。',
            'auth.guestHint': '也可以先匿名体验，大部分功能随时再绑定邮箱。',
            'auth.guestCta': '先匿名体验',
            'quickStart.title': '今晚你想改善什么？',
            'quickStart.subtitle': '一键选择一个疗愈旅程，立即开始。',
            'quickStart.browseAll': '浏览全部分类',
            'featured.rain.name': '15 分钟助眠雨声',
            'featured.rain.purpose': '睡前让大脑慢下来，进入深度睡眠。',
            'featured.meditation.name': '10 分钟专注呼吸',
            'featured.meditation.purpose': '晨间呼吸练习，降低焦虑指数。',
            'featured.hypnosis.name': '放松催眠引导',
            'featured.hypnosis.purpose': '温和的语音建议，舒缓压力。',
            'featured.playBtn': '立即播放',
            'categories.title': '按目标挑选声音旅程',
            'categories.subtitle': '213+ 精选播放清单，覆盖睡眠、专注、情绪等场景。'
        }
    };

    const fallbackLanguages = ['ja-JP', 'ko-KR', 'es-ES'];

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.i18n || !window.i18n.translations) {
            return;
        }

        Object.keys(extraTranslations).forEach(lang => {
            const existing = window.i18n.translations.get(lang) || {};
            window.i18n.translations.set(lang, { ...existing, ...extraTranslations[lang] });
        });

        fallbackLanguages.forEach(lang => {
            const existing = window.i18n.translations.get(lang) || {};
            window.i18n.translations.set(lang, { ...extraTranslations['en-US'], ...existing });
        });

        if (typeof window.i18n.updateDOM === 'function') {
            window.i18n.updateDOM();
        }
    });
})();
