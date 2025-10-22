/**
 * 内容国际化管理器
 * 管理资源中心内容的5种语言翻译
 * 支持的语言：中文(简体)、英文、日文、韩文、西班牙文
 */

(function() {
    'use strict';

    // 支持的语言列表
    const SUPPORTED_LANGUAGES = {
        'zh-CN': { name: '简体中文', nativeName: '简体中文' },
        'en-US': { name: 'English', nativeName: 'English' },
        'ja-JP': { name: 'Japanese', nativeName: '日本語' },
        'ko-KR': { name: 'Korean', nativeName: '한국어' },
        'es-ES': { name: 'Spanish', nativeName: 'Español' }
    };

    // 内容类别
    const CONTENT_CATEGORIES = {
        articles: '文章',
        guides: '指南',
        videos: '视频',
        meditation: '冥想',
        sleep: '睡眠',
        stress: '压力管理',
        focus: '专注',
        chakra: '脉轮',
        mindfulness: '正念'
    };

    // 内容翻译数据
    const CONTENT_TRANSLATIONS = {
        // 首页内容
        home: {
            'zh-CN': {
                title: '声音疗愈空间',
                tagline: '专业音频疗法平台',
                heroTitle: '213+ 沉浸式疗愈音频，帮你在 5 分钟内放松、睡眠与重启专注',
                heroDescription: '从雨林白噪到脉轮共振，一键进入专属音疗空间。个性化播放、混音、统计与离线缓存，让每一次呼吸都被疗愈。',
                features: {
                    title: '为什么选择声音疗愈空间？',
                    description: '我们把专业音疗体验压缩进一个浏览器，在任何设备上都能获取科学、柔和且富有仪式感的放松流程。',
                    card1: {
                        title: '沉浸场景秒匹配',
                        description: '根据分类智能切换视频背景与氛围动画，自然进入与情绪相匹配的疗愈空间。'
                    },
                    card2: {
                        title: '个性混音与收藏',
                        description: '混合雨声、白噪、颂钵等元素，保存个人配方并跨设备同步历史记录。'
                    },
                    card3: {
                        title: '专注模式与睡眠定时',
                        description: '全屏专注视图与智能睡眠定时器，让冥想、午休与夜间睡眠都更轻松。'
                    },
                    card4: {
                        title: '数据可视化洞察',
                        description: '内置统计面板记录播放频率、时长与偏好，帮助你建立持续的自我照护节奏。'
                    }
                }
            },
            'en-US': {
                title: 'Sound Healing Space',
                tagline: 'Professional Audio Therapy Platform',
                heroTitle: '213+ Immersive Healing Audio Tracks to Relax, Sleep & Refocus in 5 Minutes',
                heroDescription: 'From rainforest white noise to chakra resonance, enter your exclusive sound healing space with one click. Personalized playback, mixing, statistics and offline caching make every breath healing.',
                features: {
                    title: 'Why Choose Sound Healing Space?',
                    description: 'We compress professional sound therapy experiences into a browser, allowing you to access scientific, gentle and ritualistic relaxation processes on any device.',
                    card1: {
                        title: 'Immersive Scene Matching',
                        description: 'Intelligently switch video backgrounds and ambient animations based on categories, naturally entering a healing space that matches your emotions.'
                    },
                    card2: {
                        title: 'Personalized Mixing & Collection',
                        description: 'Mix elements like rain sounds, white noise, singing bowls, save personal formulas and sync history across devices.'
                    },
                    card3: {
                        title: 'Focus Mode & Sleep Timer',
                        description: 'Full-screen focus view and smart sleep timer make meditation, lunch breaks and night sleep easier.'
                    },
                    card4: {
                        title: 'Data Visualization Insights',
                        description: 'Built-in statistics panel records playback frequency, duration and preferences, helping you establish continuous self-care routines.'
                    }
                }
            },
            'ja-JP': {
                title: 'サウンドヒーリングスペース',
                tagline: 'プロフェッショナルオーディオセラピープラットフォーム',
                heroTitle: '213+の没入型ヒーリングオーディオで5分でリラックス、睡眠、集中力を再充電',
                heroDescription: '雨林のホワイトノイズからチャクラ共鳴まで、ワンクリックで専用のサウンドヒーリングスペースに入ります。パーソナライズされた再生、ミキシング、統計、オフラインキャッシュで、すべての呼吸を癒します。',
                features: {
                    title: 'なぜサウンドヒーリングスペースを選ぶのか？',
                    description: 'プロのサウンドセラピー体験をブラウザに圧縮し、どのデバイスでも科学的で優しく、儀式的なリラクゼーションプロセスを取得できます。',
                    card1: {
                        title: '没入型シーンマッチング',
                        description: 'カテゴリに基づいて動画背景と雰囲気アニメーションをインテリジェントに切り替え、感情に合ったヒーリングスペースに自然に入ります。'
                    },
                    card2: {
                        title: 'パーソナライズされたミキシングとコレクション',
                        description: '雨音、ホワイトノイズ、シンギングボウルなどの要素をミックスし、個人用の処方を保存してデバイス間で履歴を同期します。'
                    },
                    card3: {
                        title: 'フォーカスモードと睡眠タイマー',
                        description: 'フルスクリーンフォーカスビューとスマート睡眠タイマーで、瞑想、昼休、夜の睡眠をより簡単にします。'
                    },
                    card4: {
                        title: 'データ可視化インサイト',
                        description: '内蔵統計パネルが再生頻度、時間、好みを記録し、継続的なセルフケアルーチンを確立するのに役立ちます。'
                    }
                }
            },
            'ko-KR': {
                title: '사운드 힐링 스페이스',
                tagline: '전문 오디오 테라피 플랫폼',
                heroTitle: '213개의 몰입형 힐링 오디오로 5분 안에 휴식, 수면 및 집중력 재축',
                heroDescription: '열대림 백색소음부터 차크라 공명까지, 한 번의 클릭으로 전용 사운드 힐링 공간에 들어가세요. 개인화된 재생, 믹싱, 통계 및 오프라인 캐싱으로 모든 호흡을 힐링하세요.',
                features: {
                    title: '왜 사운드 힐링 스페이스를 선택해야 할까요?',
                    description: '전문 사운드 테라피 경험을 브라우저에 압축하여 어떤 디바이스에서든 과학적, 부드럽고 의식적인 릴렉세이션 프로세스를 얻을 수 있습니다.',
                    card1: {
                        title: '몰입형 장면 매칭',
                        description: '카테고리에 따라 비디오 배경과 분위기 애니메이션을 지능적으로 전환하여 감정과 일치하는 힐링 공간에 자연스럽게 들어갑니다.'
                    },
                    card2: {
                        title: '개인화된 믹싱 및 컬렉션',
                        description: '비 소리, 백색소음, 싱볼 등 요소를 믹스하고 개인용 처방을 저장하여 기기 간에 기록을 동기화하세요.'
                    },
                    card3: {
                        title: '포커스 모드 및 수면 타이머',
                        description: '전체 화면 포커스 뷰와 스마트 수면 타이머로 명상, 점심 시간, 밤 수면을 더 쉽게 만듭니다.'
                    },
                    card4: {
                        title: '데이터 시각화 인사이트',
                        description: '내장 통계 패널이 재생 빈도, 시간, 선호를 기록하여 지속적인 셀프케어 루틴을 확립하는 데 도움을 줍니다.'
                    }
                }
            },
            'es-ES': {
                title: 'Espacio de Sanación con Sonido',
                tagline: 'Plataforma Profesional de Terapia de Audio',
                heroTitle: '213+ Pistas de Audio Sanador Inmersivo para Relajarse, Dormir y Reenfocar en 5 Minutos',
                heroDescription: 'Desde el ruido blanco de la selva tropical hasta la resonancia del chakra, entra en tu espacio de sanación con sonido con un clic. Reproducción personalizada, mezcla, estadísticas y caché sin conexión hacen que cada respiración sea sanadora.',
                features: {
                    title: '¿Por Qué Elegir Espacio de Sanación con Sonido?',
                    description: 'Comprimimos experiencias de terapia de sonido profesional en un navegador, permitiéndote acceder a procesos de relajación científicos, suaves y rituales en cualquier dispositivo.',
                    card1: {
                        title: 'Coincidencia de Escena Inmersiva',
                        description: 'Cambia inteligentemente fondos de video y animaciones ambientales basadas en categorías, entrando naturalmente en un espacio de sanación que coincida con tus emociones.'
                    },
                    card2: {
                        title: 'Mezcla y Colección Personalizadas',
                        description: 'Mezcla elementos como sonidos de lluvia, ruido blanco, cuencos tibetanos, guarda fórmulas personales y sincroniza el historial entre dispositivos.'
                    },
                    card3: {
                        title: 'Modo Enfoque y Temporizador de Sueño',
                        description: 'La vista de enfoque de pantalla completa y el temporizador de sueño inteligente hacen la meditación, las siestas y el sueño nocturno más fáciles.'
                    },
                    card4: {
                        title: 'Visualización de Datos',
                        description: 'El panel de estadísticas incorporado registra frecuencia de reproducción, duración y preferencias, ayudándote a establecer rutinas continuas de autocuidado.'
                    }
                }
            }
        },

        // 冥想指南内容
        meditationGuide: {
            'zh-CN': {
                title: '冥想完全指南',
                description: '从基础到高级，掌握冥想的每个细节',
                sections: [
                    {
                        title: '什么是冥想？',
                        content: '冥想是一种通过训练注意力来达到心理清晰、情绪平静和稳定状态的练习。'
                    },
                    {
                        title: '冥想的类型',
                        content: '包括正念冥想、超觉冥想、瑜伽冥想、慈心冥想等多种形式。'
                    },
                    {
                        title: '如何开始冥想',
                        content: '1. 找一个安静的地方 2. 舒适地坐下 3. 专注于呼吸 4. 从5分钟开始 5. 保持耐心'
                    }
                ]
            },
            'en-US': {
                title: 'Complete Meditation Guide',
                description: 'Master every aspect of meditation from basics to advanced',
                sections: [
                    {
                        title: 'What is Meditation?',
                        content: 'Meditation is a practice where an individual uses a technique to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.'
                    },
                    {
                        title: 'Types of Meditation',
                        content: 'Includes mindfulness meditation, transcendental meditation, yoga meditation, loving-kindness meditation, and many other forms.'
                    },
                    {
                        title: 'How to Start Meditation',
                        content: '1. Find a quiet place 2. Sit comfortably 3. Focus on your breath 4. Start with 5 minutes 5. Be patient'
                    }
                ]
            },
            'ja-JP': {
                title: '瞑想完全ガイド',
                description: '基本から上級まで、瞑想のすべての詳細をマスター',
                sections: [
                    {
                        title: '瞑想とは？',
                        content: '瞑想は、注意力を訓練して心理的に明晰で、感情的に落ち着いた安定した状態に達するための実践です。'
                    },
                    {
                        title: '瞑想の種類',
                        content: 'マインドフルネス瞑想、超越瞑想、ヨガ瞑想、慈愛瞑想など多くの形式が含まれます。'
                    },
                    {
                        title: '瞑想の始め方',
                        content: '1. 静かな場所を見つける 2. 快適に座る 3. 呼吸に集中する 4. 5分から始める 5. 忍耐強く'
                    }
                ]
            },
            'ko-KR': {
                title: '명상 완전 가이드',
                description: '기초부터 고급까지, 명상의 모든 세부 사항 마스터',
                sections: [
                    {
                        title: '명상이란?',
                        content: '명상은 주의력을 훈련하여 정신적으로 명확하고, 감정적으로 차분하며 안정된 상태에 도달하는 연습입니다.'
                    },
                    {
                        title: '명상의 종류',
                        content: '마인드풀니스 명상, 초월 명상, 요가 명상, 자애 명상 등 많은 형태가 포함됩니다.'
                    },
                    {
                        title: '명상 시작 방법',
                        content: '1. 조용한 장소 찾기 2. 편안하게 앉기 3. 호흡에 집중하기 4. 5분부터 시작하기 5. 인내심 갖기'
                    }
                ]
            },
            'es-ES': {
                title: 'Guía Completa de Meditación',
                description: 'Domina todos los aspectos de la meditación desde lo básico hasta lo avanzado',
                sections: [
                    {
                        title: '¿Qué es la Meditación?',
                        content: 'La meditación es una práctica donde un individuo utiliza una técnica para entrenar la atención y la conciencia, logrando un estado mentalmente claro y emocionalmente calmado y estable.'
                    },
                    {
                        title: 'Tipos de Meditación',
                        content: 'Incluye meditación de atención plena, meditación trascendental, meditación de yoga, meditación de amabilidad bondadosa y muchas otras formas.'
                    },
                    {
                        title: 'Cómo Empezar a Meditar',
                        content: '1. Encuentra un lugar tranquilo 2. Siéntate cómodamente 3. Enfócate en tu respiración 4. Comienza con 5 minutos 5. Ten paciencia'
                    }
                ]
            }
        },

        // 睡眠改善内容
        sleepGuide: {
            'zh-CN': {
                title: '改善睡眠的10个技巧',
                description: '科学的睡眠改善方法，帮你获得更好的休息',
                tips: [
                    '建立固定的睡眠时间表',
                    '创建舒适的睡眠环境',
                    '睡前避免咖啡因和酒精',
                    '使用雨声或白噪音',
                    '睡前30分钟远离电子屏幕',
                    '保持卧室温度在18-22°C',
                    '进行睡前冥想或深呼吸',
                    '避免晚餐过饱',
                    '睡前洗个热水澡',
                    '使用舒适的床上用品'
                ]
            },
            'en-US': {
                title: '10 Tips for Better Sleep',
                description: 'Scientific methods to improve your sleep and get better rest',
                tips: [
                    'Establish a consistent sleep schedule',
                    'Create a comfortable sleep environment',
                    'Avoid caffeine and alcohol before bed',
                    'Use rain sounds or white noise',
                    'Stay away from screens 30 minutes before bed',
                    'Keep bedroom temperature between 18-22°C',
                    'Practice bedtime meditation or deep breathing',
                    'Avoid large meals before bed',
                    'Take a warm bath before sleep',
                    'Use comfortable bedding'
                ]
            },
            'ja-JP': {
                title: 'より良い睡眠のための10のヒント',
                description: '睡眠を改善し、より良い休息を得るための科学的な方法',
                tips: [
                    '一貫した睡眠スケジュールを確立する',
                    '快適な睡眠環境を作る',
                    '寝る前にカフェインとアルコールを避ける',
                    '雨音またはホワイトノイズを使用する',
                    '寝る30分前にスクリーンから離れる',
                    '寝室の温度を18-22°Cに保つ',
                    '就寝前の瞑想または深呼吸を実践する',
                    '寝る前の大きな食事を避ける',
                    '就寝前に温かいお風呂に入る',
                    '快適な寝具を使用する'
                ]
            },
            'ko-KR': {
                title: '더 나은 수면을 위한 10가지 팁',
                description: '수면을 개선하고 더 나은 휴식을 얻기 위한 과학적 방법',
                tips: [
                    '일관된 수면 스케줄 확립',
                    '편안한 수면 환경 조성',
                    '수면 전 카페인과 알코올 피하기',
                    '비 소리나 백색소음 사용',
                    '수면 30분 전 스크린에서 멀어지기',
                    '침실 온도를 18-22°C로 유지',
                    '취침 명상이나 심호흡 실천',
                    '수면 전 큰 식사 피하기',
                    '수면 전 따뜻한 목욕',
                    '편안한 침구 사용'
                ]
            },
            'es-ES': {
                title: '10 Consejos para Mejorar el Sueño',
                description: 'Métodos científicos para mejorar tu sueño y obtener mejor descanso',
                tips: [
                    'Establece un horario de sueño consistente',
                    'Crea un ambiente de sueño cómodo',
                    'Evita cafeína y alcohol antes de dormir',
                    'Usa sonidos de lluvia o ruido blanco',
                    'Aléjate de las pantallas 30 minutos antes de dormir',
                    'Mantén la temperatura del dormitorio entre 18-22°C',
                    'Practica meditación antes de dormir o respiración profunda',
                    'Evita comidas grandes antes de dormir',
                    'Toma un baño tibio antes de dormir',
                    'Usa ropa de cama cómoda'
                ]
            }
        }
    };

    // 内容国际化管理器类
    class ContentI18nManager {
        constructor() {
            this.currentLanguage = this.detectLanguage();
            this.contentCache = new Map();
            this.loadContent();
        }

        // 检测语言
        detectLanguage() {
            const savedLang = localStorage.getItem('content-language');
            if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
                return savedLang;
            }

            const browserLang = navigator.language || 'en-US';
            const supportedCodes = Object.keys(SUPPORTED_LANGUAGES);

            for (const code of supportedCodes) {
                if (browserLang.startsWith(code.split('-')[0])) {
                    return code;
                }
            }

            return 'en-US'; // 默认语言
        }

        // 加载内容
        loadContent() {
            for (const category in CONTENT_TRANSLATIONS) {
                this.contentCache.set(category, CONTENT_TRANSLATIONS[category]);
            }
        }

        // 获取内容
        getContent(category, path = null) {
            const categoryContent = this.contentCache.get(category);
            if (!categoryContent) {
                console.warn(`内容类别不存在: ${category}`);
                return null;
            }

            const langContent = categoryContent[this.currentLanguage];
            if (!langContent) {
                console.warn(`语言内容不存在: ${category}[${this.currentLanguage}]`);
                return categoryContent['en-US'] || null;
            }

            if (path) {
                return this.getNestedValue(langContent, path);
            }

            return langContent;
        }

        // 获取嵌套值
        getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : null;
            }, obj);
        }

        // 设置语言
        setLanguage(language) {
            if (SUPPORTED_LANGUAGES[language]) {
                this.currentLanguage = language;
                localStorage.setItem('content-language', language);
                this.notifyLanguageChange();
            }
        }

        // 通知语言变更
        notifyLanguageChange() {
            const event = new CustomEvent('contentLanguageChange', {
                detail: { language: this.currentLanguage }
            });
            document.dispatchEvent(event);
        }

        // 翻译文本内容
        translateContent(element, category, path) {
            const content = this.getContent(category, path);
            if (content && element) {
                element.innerHTML = content;
            }
        }

        // 获取支持的语言列表
        getSupportedLanguages() {
            return SUPPORTED_LANGUAGES;
        }

        // 获取当前语言
        getCurrentLanguage() {
            return this.currentLanguage;
        }

        // 动态加载翻译文件
        async loadTranslationsFile(category) {
            try {
                const filePath = `/assets/i18n/content/${category}-${this.currentLanguage}.json`;
                const response = await fetch(filePath);
                if (response.ok) {
                    const translations = await response.json();
                    this.contentCache.set(category, {
                        ...this.contentCache.get(category),
                        [this.currentLanguage]: translations
                    });
                }
            } catch (error) {
                console.warn(`加载翻译文件失败: ${category}-${this.currentLanguage}`, error);
            }
        }

        // 批量翻译页面
        translatePage(translations) {
            translations.forEach(({ selector, category, path, attribute }) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const content = this.getContent(category, path);
                    if (content) {
                        if (attribute) {
                            element.setAttribute(attribute, content);
                        } else {
                            element.textContent = content;
                        }
                    }
                });
            });
        }
    }

    // 初始化内容国际化管理器
    window.contentI18n = window.contentI18n || {};
    window.contentI18n.manager = new ContentI18nManager();

    // 导出供使用
    window.getContentI18n = function(category, path) {
        return window.contentI18n.manager.getContent(category, path);
    };

    window.setContentLanguage = function(language) {
        return window.contentI18n.manager.setLanguage(language);
    };

    window.translateContent = function(selector, category, path, attribute) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const content = window.getContentI18n(category, path);
            if (content) {
                if (attribute) {
                    element.setAttribute(attribute, content);
                } else {
                    element.textContent = content;
                }
            }
        });
    };

    console.log('✅ 内容国际化管理器已初始化');
})();