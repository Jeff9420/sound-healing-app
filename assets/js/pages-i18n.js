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
                'resources.footer.cta': 'Start Free Experience',

                // Resource detail pages
                'detail.category.guide': 'Practice Guide',
                'detail.category.video': 'Video Tutorial',
                'detail.category.story': 'User Story',
                'detail.category.interview': 'Expert Interview',
                'detail.category.endorsement': 'Brand Endorsement',
                'detail.category.blog': 'Blog Article',
                'detail.category.download': 'Download',
                'detail.cta.plan': 'Fill Needs Form',
                'detail.cta.impact': 'View Case Studies',
                'detail.content.preview': 'Content Preview',
                'detail.content.preparing': 'We are currently preparing the complete content for this guide.',
                'detail.highlights.title': 'Highlights',
                'detail.highlight.one': 'Highlight 1: Combining sound with breathing techniques',
                'detail.highlight.two': 'Highlight 2: Ready-to-use daily routines',
                'detail.highlight.three': 'Highlight 3: Recommended audio tracks and exercises',
                'detail.content.coming': 'Please stay tuned for the complete version, which will be published shortly after review.',
                'detail.actions.title': 'Next Steps',
                'detail.actions.submit': 'Submit My Practice Needs',
                'detail.actions.subscribe': 'Subscribe to Weekly Selection',
                'detail.related.title': 'Related Reading',
                'detail.related.more': 'Explore More Healing Scenarios →'
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
                'resources.footer.cta': '开始免费体验',

                // Resource detail pages
                'detail.category.guide': '实践指南',
                'detail.category.video': '视频教程',
                'detail.category.story': '用户故事',
                'detail.category.interview': '专家访谈',
                'detail.category.endorsement': '品牌背书',
                'detail.category.blog': '博客文章',
                'detail.category.download': '下载资源',
                'detail.cta.plan': '填写需求表单',
                'detail.cta.impact': '查看实践案例',
                'detail.content.preview': '内容预告',
                'detail.content.preparing': '我们正在整理本指南的完整内容。',
                'detail.highlights.title': '亮点',
                'detail.highlight.one': '亮点一：结合声音与呼吸的实用技巧',
                'detail.highlight.two': '亮点二：可直接应用的日常流程',
                'detail.highlight.three': '亮点三：推荐音频与配套练习',
                'detail.content.coming': '敬请期待完整版，我们会在完成审核后第一时间发布。',
                'detail.actions.title': '下一步行动',
                'detail.actions.submit': '提交我的练习需求',
                'detail.actions.subscribe': '订阅每周精选',
                'detail.related.title': '延伸阅读',
                'detail.related.more': '探索更多疗愈场景 →'
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
                'resources.footer.cta': '無料体験を開始',

                // Resource detail pages
                'detail.category.guide': '実践ガイド',
                'detail.category.video': 'ビデオチュートリアル',
                'detail.category.story': 'ユーザーストーリー',
                'detail.category.interview': '専門家インタビュー',
                'detail.category.endorsement': 'ブランド推薦',
                'detail.category.blog': 'ブログ記事',
                'detail.category.download': 'ダウンロード',
                'detail.cta.plan': 'ニーズフォームに記入',
                'detail.cta.impact': 'ケーススタディを見る',
                'detail.content.preview': 'コンテンツプレビュー',
                'detail.content.preparing': 'このガイドの完全なコンテンツを現在準備中です。',
                'detail.highlights.title': 'ハイライト',
                'detail.highlight.one': 'ハイライト1：音と呼吸を組み合わせたテクニック',
                'detail.highlight.two': 'ハイライト2：すぐに使える日常ルーチン',
                'detail.highlight.three': 'ハイライト3：推奨オーディオトラックとエクササイズ',
                'detail.content.coming': '完全版の公開をお待ちください。レビュー後すぐに公開されます。',
                'detail.actions.title': '次のステップ',
                'detail.actions.submit': '私の実践ニーズを提出',
                'detail.actions.subscribe': '週刊セレクションを購読',
                'detail.related.title': '関連記事',
                'detail.related.more': 'さらに癒しのシナリオを探索 →'
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
                'resources.footer.cta': '무료 체험 시작',

                // Resource detail pages
                'detail.category.guide': '실천 가이드',
                'detail.category.video': '비디오 튜토리얼',
                'detail.category.story': '사용자 스토리',
                'detail.category.interview': '전문가 인터뷰',
                'detail.category.endorsement': '브랜드 추천',
                'detail.category.blog': '블로그 기사',
                'detail.category.download': '다운로드',
                'detail.cta.plan': '필요 양식 작성',
                'detail.cta.impact': '사례 연구 보기',
                'detail.content.preview': '콘텐츠 미리보기',
                'detail.content.preparing': '이 가이드의 완전한 콘텐츠를 현재 준비 중입니다.',
                'detail.highlights.title': '하이라이트',
                'detail.highlight.one': '하이라이트 1: 소리와 호흡을 결합한 기술',
                'detail.highlight.two': '하이라이트 2: 바로 사용 가능한 일상 루틴',
                'detail.highlight.three': '하이라이트 3: 추천 오디오 트랙 및 운동',
                'detail.content.coming': '완전판을 기대해 주세요. 검토 후 곧 게시됩니다.',
                'detail.actions.title': '다음 단계',
                'detail.actions.submit': '내 실천 필요 제출',
                'detail.actions.subscribe': '주간 셀렉션 구독',
                'detail.related.title': '관련 읽기',
                'detail.related.more': '더 많은 힐링 시나리오 탐색 →'
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
                'resources.footer.cta': 'Comenzar Experiencia Gratuita',

                // Resource detail pages
                'detail.category.guide': 'Guía Práctica',
                'detail.category.video': 'Tutorial en Video',
                'detail.category.story': 'Historia de Usuario',
                'detail.category.interview': 'Entrevista de Experto',
                'detail.category.endorsement': 'Recomendación de Marca',
                'detail.category.blog': 'Artículo de Blog',
                'detail.category.download': 'Descarga',
                'detail.cta.plan': 'Completar Formulario de Necesidades',
                'detail.cta.impact': 'Ver Estudios de Caso',
                'detail.content.preview': 'Vista Previa del Contenido',
                'detail.content.preparing': 'Actualmente estamos preparando el contenido completo de esta guía.',
                'detail.highlights.title': 'Aspectos Destacados',
                'detail.highlight.one': 'Aspecto 1: Combinando sonido con técnicas de respiración',
                'detail.highlight.two': 'Aspecto 2: Rutinas diarias listas para usar',
                'detail.highlight.three': 'Aspecto 3: Pistas de audio recomendadas y ejercicios',
                'detail.content.coming': 'Por favor, esté atento a la versión completa, que se publicará en breve después de la revisión.',
                'detail.actions.title': 'Próximos Pasos',
                'detail.actions.submit': 'Enviar Mis Necesidades de Práctica',
                'detail.actions.subscribe': 'Suscribirse a Selección Semanal',
                'detail.related.title': 'Lectura Relacionada',
                'detail.related.more': 'Explorar Más Escenarios de Sanación →'
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
