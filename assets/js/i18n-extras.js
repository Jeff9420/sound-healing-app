(function () {
    const translations = {
        'en-US': {
            'player.instantLabel': 'Instant Player',
            'player.instantHeadline': 'One tap to start relaxing',
            'player.defaultTrack.badge': 'Official recommendation',
            'player.defaultTrack.title': 'Sleep Warm Rain · 15 min',
            'player.defaultTrack.tags': '#sleep #beginner #try-tonight',
            'player.defaultTrack.desc': 'A gentle, voice-free rain track to slow your mind before bed.',
            'player.defaultTrack.error': 'Unable to load the starter track. Please try another category.',
            'player.helper': 'Press ▶️ to start your first session. No signup needed.',
            'form.plan.trust': 'Generated from 120K+ anonymous sessions. You can unsubscribe anytime.',
            'form.plan.privacy': 'We only send sleep and mindfulness tips. No spam, no selling your data.',
            'auth.guestHint': 'You can explore most features as a guest and link your email later.',
            'auth.guestCta': 'Continue as guest'
        },
        'zh-CN': {
            'player.instantLabel': '即时播放器',
            'player.instantHeadline': '按下播放，立刻放松',
            'player.defaultTrack.badge': '官方推荐',
            'player.defaultTrack.title': '15 分钟雨声 · 快速入睡',
            'player.defaultTrack.tags': '#睡眠 #新手向 #今晚就试试',
            'player.defaultTrack.desc': '无人声的温柔雨声，睡前 15 分钟帮助大脑慢下来。',
            'player.defaultTrack.error': '暂时无法加载默认音轨，请稍后重试或选择其他分类。',
            'player.helper': '点击 ▶️ 即可开始今天的疗愈声音旅程，无需注册。',
            'form.plan.trust': '基于 120K+ 匿名使用数据生成，可随时取消订阅。',
            'form.plan.privacy': '我们只会发送睡眠/冥想相关内容，不会出售邮箱或推送广告。',
            'auth.guestHint': '也可以先匿名体验，大部分功能随时再绑定邮箱。',
            'auth.guestCta': '先匿名体验'
        }
    };

    const fallbackTargets = ['ja-JP', 'ko-KR', 'es-ES'];

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.i18n || !window.i18n.translations) {
            return;
        }

        Object.entries(translations).forEach(([lang, values]) => {
            const current = window.i18n.translations.get(lang) || {};
            window.i18n.translations.set(lang, { ...current, ...values });
        });

        fallbackTargets.forEach((lang) => {
            const current = window.i18n.translations.get(lang) || {};
            window.i18n.translations.set(lang, { ...translations['en-US'], ...current });
        });

        if (typeof window.i18n.updateDOM === 'function') {
            window.i18n.updateDOM();
        }
    });
})();
