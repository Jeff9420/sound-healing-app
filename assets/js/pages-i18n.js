/**
 * Pages i18n System
 * 为所有子页面提供多语言支持
 * @version 1.0.0
 */

class PagesI18n {
    constructor() {
        this.currentLang = 'en-US'; // 默认英语
        this.fallbackLang = 'en-US';
        this.translations = {};
        this.init();
    }

    init() {
        // 检测或加载语言
        this.detectLanguage();

        // 加载翻译
        this.loadTranslations();

        // 应用翻译
        this.applyTranslations();

        // 创建语言切换器
        this.createLanguageSwitcher();

        console.log('✅ Pages i18n initialized, language:', this.currentLang);
    }

    detectLanguage() {
        // 优先级: URL参数 > localStorage > 浏览器语言 > 默认英语
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');

        if (urlLang) {
            this.currentLang = urlLang;
            localStorage.setItem('pages_language', urlLang);
            return;
        }

        const savedLang = localStorage.getItem('pages_language');
        if (savedLang) {
            this.currentLang = savedLang;
            return;
        }

        // 默认英语
        this.currentLang = 'en-US';
    }

    loadTranslations() {
        // 内嵌的翻译数据
        this.translations = {
            'en-US': {
                'nav.back': '← Back to Home',
                'nav.backResources': '← Back to Resources',
                'common.subscribe': 'Subscribe',
                'common.submitting': 'Submitting...',
                'common.emailPlaceholder': 'Enter your email',
                'common.success': 'Success!',
                'common.error': 'Error occurred',
                'alert.subscribeSuccess': 'Subscription successful! Check your inbox.',
                'alert.subscribeFailed': 'Sorry, submission failed. Please try again later.',
                'alert.invalidEmail': 'Please enter a valid email address.',

                // Resources page specific
                'resources.hero.title': 'Sound Healing Resource Hub',
                'resources.hero.desc': 'Browse curated sound healing guides, videos, case studies & expert interviews. Updated weekly, completely free to help you integrate soundscape practice into daily life.',
                'resources.subscribe.placeholder': 'Enter email to receive weekly curated practices',
                'resources.subscribe.button': 'Subscribe to Weekly Selection',
                'resources.subscribe.note': 'Completely free, no credit card required. You can unsubscribe anytime from the email footer.',
                'resources.footer.title': 'Ready to Start Your Sound Healing Journey?',
                'resources.footer.desc': 'Explore 213+ professional sound healing tracks in the main app',
                'resources.footer.cta': 'Start Free Experience'
            },

            'zh-CN': {
                'nav.back': '← 返回首页',
                'nav.backResources': '← 返回资源中心',
                'common.subscribe': '订阅',
                'common.submitting': '提交中...',
                'common.emailPlaceholder': '请输入您的邮箱',
                'common.success': '成功！',
                'common.error': '发生错误',
                'alert.subscribeSuccess': '订阅成功！请查收邮件。',
                'alert.subscribeFailed': '抱歉，提交失败，请稍后再试。',
                'alert.invalidEmail': '请输入有效的邮箱地址。',

                // Resources page specific
                'resources.hero.title': '声音疗愈资源枢纽',
                'resources.hero.desc': '浏览精选的声音疗愈指南、短视频、案例与专家访谈，每周更新且完全免费，帮助你把声景练习嵌入日常。',
                'resources.subscribe.placeholder': '请输入邮箱，接收每周精选练习',
                'resources.subscribe.button': '订阅每周精选',
                'resources.subscribe.note': '完全免费，无需信用卡。订阅成功后你可在任何邮件底部取消订阅。',
                'resources.footer.title': '准备开始你的声音疗愈之旅？',
                'resources.footer.desc': '在主应用中探索213+专业声音疗愈音轨',
                'resources.footer.cta': '开始免费体验'
            },

            'ja-JP': {
                'nav.back': '← ホームに戻る',
                'nav.backResources': '← リソースに戻る',
                'common.subscribe': '購読',
                'common.submitting': '送信中...',
                'common.emailPlaceholder': 'メールアドレスを入力',
                'common.success': '成功！',
                'common.error': 'エラーが発生しました',
                'alert.subscribeSuccess': '購読成功！メールをご確認ください。',
                'alert.subscribeFailed': '申し訳ございません、送信に失敗しました。後でもう一度お試しください。',
                'alert.invalidEmail': '有効なメールアドレスを入力してください。',

                // Resources page specific
                'resources.hero.title': 'サウンドヒーリングリソースハブ',
                'resources.hero.desc': '厳選されたサウンドヒーリングガイド、ビデオ、ケーススタディ、専門家インタビューを閲覧。毎週更新、完全無料で日常にサウンドスケープの実践を組み込むお手伝いをします。',
                'resources.subscribe.placeholder': 'メールアドレスを入力して週刊セレクションを受信',
                'resources.subscribe.button': '週刊セレクションを購読',
                'resources.subscribe.note': '完全無料、クレジットカード不要。メールフッターからいつでも購読解除できます。',
                'resources.footer.title': 'サウンドヒーリングの旅を始める準備はできましたか？',
                'resources.footer.desc': 'メインアプリで213+のプロフェッショナルなサウンドヒーリングトラックを探索',
                'resources.footer.cta': '無料体験を開始'
            },

            'ko-KR': {
                'nav.back': '← 홈으로 돌아가기',
                'nav.backResources': '← 리소스로 돌아가기',
                'common.subscribe': '구독',
                'common.submitting': '제출 중...',
                'common.emailPlaceholder': '이메일 주소 입력',
                'common.success': '성공!',
                'common.error': '오류 발생',
                'alert.subscribeSuccess': '구독 성공! 이메일을 확인하세요.',
                'alert.subscribeFailed': '죄송합니다. 제출에 실패했습니다. 나중에 다시 시도해주세요.',
                'alert.invalidEmail': '유효한 이메일 주소를 입력하세요.',

                // Resources page specific
                'resources.hero.title': '사운드 힐링 리소스 허브',
                'resources.hero.desc': '엄선된 사운드 힐링 가이드, 비디오, 사례 연구 및 전문가 인터뷰를 탐색하세요. 매주 업데이트되며 완전 무료로 일상에 사운드스케이프 실천을 통합하는 데 도움을 드립니다.',
                'resources.subscribe.placeholder': '이메일을 입력하여 주간 엄선 실천법 수신',
                'resources.subscribe.button': '주간 셀렉션 구독',
                'resources.subscribe.note': '완전 무료, 신용카드 불필요. 이메일 하단에서 언제든지 구독 취소할 수 있습니다.',
                'resources.footer.title': '사운드 힐링 여정을 시작할 준비가 되셨나요?',
                'resources.footer.desc': '메인 앱에서 213+ 전문 사운드 힐링 트랙 탐색',
                'resources.footer.cta': '무료 체험 시작'
            },

            'es-ES': {
                'nav.back': '← Volver al Inicio',
                'nav.backResources': '← Volver a Recursos',
                'common.subscribe': 'Suscribirse',
                'common.submitting': 'Enviando...',
                'common.emailPlaceholder': 'Ingrese su correo electrónico',
                'common.success': '¡Éxito!',
                'common.error': 'Ocurrió un error',
                'alert.subscribeSuccess': '¡Suscripción exitosa! Revise su bandeja de entrada.',
                'alert.subscribeFailed': 'Lo sentimos, el envío falló. Por favor, inténtelo más tarde.',
                'alert.invalidEmail': 'Por favor ingrese una dirección de correo electrónico válida.',

                // Resources page specific
                'resources.hero.title': 'Centro de Recursos de Sanación con Sonido',
                'resources.hero.desc': 'Explore guías seleccionadas de sanación con sonido, videos, estudios de caso y entrevistas de expertos. Actualizado semanalmente, completamente gratuito para ayudarte a integrar la práctica de paisajes sonoros en la vida diaria.',
                'resources.subscribe.placeholder': 'Ingrese correo para recibir prácticas seleccionadas semanalmente',
                'resources.subscribe.button': 'Suscribirse a Selección Semanal',
                'resources.subscribe.note': 'Completamente gratis, no se requiere tarjeta de crédito. Puede darse de baja en cualquier momento desde el pie de página del correo.',
                'resources.footer.title': '¿Listo para Comenzar tu Viaje de Sanación con Sonido?',
                'resources.footer.desc': 'Explora 213+ pistas profesionales de sanación con sonido en la aplicación principal',
                'resources.footer.cta': 'Comenzar Experiencia Gratuita'
            }
        };
    }

    getTranslation(key) {
        const lang = this.translations[this.currentLang];
        const fallback = this.translations[this.fallbackLang];
        return lang?.[key] || fallback?.[key] || key;
    }

    applyTranslations() {
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLang;

        // 应用data-i18n属性
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getTranslation(key);

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // 应用data-i18n-placeholder属性
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.getTranslation(key);
        });

        // 应用data-i18n-title属性
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.getTranslation(key);
        });

        // 更新alert消息（如果有全局alert函数）
        this.patchAlerts();
    }

    patchAlerts() {
        const originalAlert = window.alert;
        const self = this;

        window.alert = function(message) {
            // 尝试翻译已知的alert消息
            let translatedMessage = message;

            const knownMessages = {
                '我们已收到订阅请求，精选内容将发送至您的邮箱。': 'alert.subscribeSuccess',
                '抱歉，提交失败，请稍后再试。': 'alert.subscribeFailed',
                '请输入有效的邮箱地址。': 'alert.invalidEmail'
            };

            const messageKey = knownMessages[message];
            if (messageKey) {
                translatedMessage = self.getTranslation(messageKey);
            }

            originalAlert.call(window, translatedMessage);
        };
    }

    changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('pages_language', lang);
        this.applyTranslations();

        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'pages-lang-switcher';
        switcher.innerHTML = `
            <select id="pagesLangSelect" aria-label="Select Language">
                <option value="en-US" ${this.currentLang === 'en-US' ? 'selected' : ''}>English</option>
                <option value="zh-CN" ${this.currentLang === 'zh-CN' ? 'selected' : ''}>简体中文</option>
                <option value="ja-JP" ${this.currentLang === 'ja-JP' ? 'selected' : ''}>日本語</option>
                <option value="ko-KR" ${this.currentLang === 'ko-KR' ? 'selected' : ''}>한국어</option>
                <option value="es-ES" ${this.currentLang === 'es-ES' ? 'selected' : ''}>Español</option>
            </select>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .pages-lang-switcher {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }

            #pagesLangSelect {
                padding: 8px 12px;
                border: 2px solid rgba(125, 181, 255, 0.3);
                border-radius: 8px;
                background: rgba(16, 24, 34, 0.95);
                color: #e9f1ff;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            #pagesLangSelect:hover {
                border-color: rgba(125, 181, 255, 0.6);
                background: rgba(16, 24, 34, 1);
            }

            #pagesLangSelect:focus {
                outline: none;
                border-color: #7db5ff;
                box-shadow: 0 0 0 3px rgba(125, 181, 255, 0.2);
            }

            @media (max-width: 768px) {
                .pages-lang-switcher {
                    top: 10px;
                    right: 10px;
                }

                #pagesLangSelect {
                    padding: 6px 10px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);

        // 添加到页面
        document.body.appendChild(switcher);

        // 绑定事件
        const select = document.getElementById('pagesLangSelect');
        select.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pagesI18n = new PagesI18n();
    });
} else {
    window.pagesI18n = new PagesI18n();
}

window.PagesI18n = PagesI18n;
