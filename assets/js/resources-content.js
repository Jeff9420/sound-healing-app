/**
 * 资源中心内容管理
 * 提供多语言资源内容和动态加载
 * @version 1.0.0
 */

class ResourcesContent {
    constructor() {
        this.contentLoaded = false;
        this.currentLanguage = 'zh-CN';
        this.contents = new Map();
        this.init();
    }

    init() {
        this.loadContents();
        this.bindEvents();
    }

    /**
     * 加载所有资源内容
     */
    loadContents() {
        // 冥想指南内容
        this.contents.set('meditation-guide', {
            'zh-CN': {
                title: '冥想入门：从5分钟开始',
                sections: [
                    {
                        title: '什么是冥想',
                        content: '冥想是一种通过专注和觉察来训练心智的练习。它不是要清空大脑，而是学会观察自己的想法而不被它们控制。',
                        tips: [
                            '找一个安静的地方，坐直身体',
                            '闭上眼睛，专注于呼吸',
                            '从每天5分钟开始',
                            '不要评判自己的体验'
                        ]
                    },
                    {
                        title: '初学者常见问题',
                        content: '刚开始冥想时，你可能会遇到各种挑战。记住这些都是正常的，关键是要有耐心和坚持。',
                        tips: [
                            '思绪纷乱？这是正常的，温和地把注意力带回呼吸',
                            '睡着？说明你很放松，可以尝试坐直一些',
                            '坐不住？从更短的时间开始，逐步增加',
                            '没有感觉？冥想的效果是累积的，坚持下去'
                        ]
                    },
                    {
                        title: '推荐音频',
                        content: '配合冥想的音频可以帮助你更快进入状态。',
                        audios: [
                            { name: '引导冥想初学者', duration: '5分钟', category: 'meditation' },
                            { name: '正念呼吸练习', duration: '10分钟', category: 'meditation' },
                            { name: '身体扫描冥想', duration: '15分钟', category: 'meditation' }
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Meditation for Beginners: Start with 5 Minutes',
                sections: [
                    {
                        title: 'What is Meditation',
                        content: 'Meditation is a practice of training the mind through focus and awareness. It\'s not about emptying your mind, but learning to observe your thoughts without being controlled by them.',
                        tips: [
                            'Find a quiet place and sit straight',
                            'Close your eyes and focus on breathing',
                            'Start with 5 minutes daily',
                            'Don\'t judge your experience'
                        ]
                    },
                    {
                        title: 'Common Beginner Challenges',
                        content: 'When starting meditation, you may encounter various challenges. Remember these are normal, the key is patience and persistence.',
                        tips: [
                            'Mind wandering? Normal, gently bring attention back to breath',
                            'Falling asleep? Means you\'re relaxed, try sitting straighter',
                            'Can\'t sit still? Start with shorter time and gradually increase',
                            'Not feeling anything? Effects accumulate over time, keep practicing'
                        ]
                    },
                    {
                        title: 'Recommended Audio',
                        content: 'Meditation audio can help you enter the state faster.',
                        audios: [
                            { name: 'Guided Meditation for Beginners', duration: '5 min', category: 'meditation' },
                            { name: 'Mindful Breathing Exercise', duration: '10 min', category: 'meditation' },
                            { name: 'Body Scan Meditation', duration: '15 min', category: 'meditation' }
                        ]
                    }
                ]
            }
        });

        // 睡眠指南内容
        this.contents.set('sleep-guide', {
            'zh-CN': {
                title: '科学改善睡眠质量',
                sections: [
                    {
                        title: '理解睡眠周期',
                        content: '睡眠分为快速眼动期（REM）和非快速眼动期（NREM）。一个完整的睡眠周期约90分钟，每晚需要4-6个周期。',
                        tips: [
                            '成人需要7-9小时睡眠',
                            '深度睡眠在凌晨前更多',
                            'REM睡眠有助于记忆巩固',
                            '规律的作息时间最重要'
                        ]
                    },
                    {
                        title: '声音助眠原理',
                        content: '特定的音频频率可以帮助大脑进入放松状态，促进褪黑素分泌，缩短入睡时间。',
                        tips: [
                            '60-80 BPM的节拍最接近 resting heart rate',
                            '粉噪音可以有效遮蔽环境噪音',
                            '自然声音激活大脑的放松反应',
                            '低频音频有助于深度睡眠'
                        ]
                    },
                    {
                        title: '睡前仪式建议',
                        content: '建立固定的睡前仪式可以帮助身体建立睡眠信号。',
                        routine: [
                            '睡前1小时关闭电子设备',
                            '播放15-30分钟助眠音频',
                            '进行轻度伸展或瑜伽',
                            '保持卧室温度在18-22°C',
                            '使用遮光窗帘和耳塞'
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Scientifically Improve Sleep Quality',
                sections: [
                    {
                        title: 'Understanding Sleep Cycles',
                        content: 'Sleep consists of REM and NREM phases. A complete sleep cycle is about 90 minutes, requiring 4-6 cycles per night.',
                        tips: [
                            'Adults need 7-9 hours of sleep',
                            'Deep sleep is more abundant before midnight',
                            'REM sleep helps memory consolidation',
                            'Consistent schedule is most important'
                        ]
                    },
                    {
                        title: 'Sound Sleep Principles',
                        content: 'Specific audio frequencies can help the brain enter a relaxed state, promote melatonin secretion, and shorten sleep onset time.',
                        tips: [
                            '60-80 BPM beats closest to resting heart rate',
                            'Pink noise effectively masks environmental noise',
                            'Nature sounds activate brain relaxation response',
                            'Low-frequency audio aids deep sleep'
                        ]
                    },
                    {
                        title: 'Bedtime Ritual Suggestions',
                        content: 'Establishing a fixed bedtime ritual can help the body build sleep signals.',
                        routine: [
                            'Turn off electronic devices 1 hour before bed',
                            'Play 15-30 minutes of sleep audio',
                            'Do light stretching or yoga',
                            'Keep bedroom temperature between 18-22°C',
                            'Use blackout curtains and earplugs'
                        ]
                    }
                ]
            }
        });

        // 压力管理内容
        this.contents.set('stress-guide', {
            'zh-CN': {
                title: '日常压力管理策略',
                sections: [
                    {
                        title: '认识压力',
                        content: '压力本身并非坏事，适度的压力可以帮助我们保持警觉和专注。关键在于如何管理和应对压力。',
                        types: [
                            { name: '急性压力', desc: '短期压力，由特定事件引发' },
                            { name: '慢性压力', desc: '长期持续的压力，需要特别关注' },
                            { name: '积极压力', desc: '有益的激励性压力' }
                        ]
                    },
                    {
                        title: '快速放松技巧',
                        content: '当感到压力过大时，可以尝试这些快速有效的放松方法。',
                        techniques: [
                            { name: '4-7-8呼吸法', desc: '吸气4秒，屏息7秒，呼气8秒' },
                            { name: '渐进式肌肉放松', desc: '从脚到头依次收紧和放松肌肉群' },
                            { name: '5-4-3-2-1技巧', desc: '识别5样看到、4样听到、3样闻到的东西' }
                        ]
                    },
                    {
                        title: '声音疗愈减压',
                        content: '不同的声音对缓解压力有不同的效果。',
                        sounds: [
                            { type: '自然声音', effect: '降低皮质醇水平', examples: ['雨声', '海浪', '森林'] },
                            { type: '冥想音乐', effect: '激活副交感神经', examples: ['钢琴曲', '弦乐'] },
                            { type: '双耳节拍', effect: '引导脑波进入放松状态', examples: ['Alpha波', 'Theta波'] }
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Daily Stress Management Strategies',
                sections: [
                    {
                        title: 'Understanding Stress',
                        content: 'Stress itself isn\'t bad; moderate stress can help us stay alert and focused. The key is how to manage and respond to stress.',
                        types: [
                            { name: 'Acute Stress', desc: 'Short-term stress triggered by specific events' },
                            { name: 'Chronic Stress', desc: 'Long-term continuous stress requiring special attention' },
                            { name: 'Eustress', desc: 'Beneficial motivational stress' }
                        ]
                    },
                    {
                        title: 'Quick Relaxation Techniques',
                        content: 'When feeling overwhelmed, try these quick and effective relaxation methods.',
                        techniques: [
                            { name: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s' },
                            { name: 'Progressive Muscle Relaxation', desc: 'Tense and relax muscle groups from feet to head' },
                            { name: '5-4-3-2-1 Technique', desc: 'Identify 5 things seen, 4 heard, 3 smelled' }
                        ]
                    },
                    {
                        title: 'Sound Healing for Stress',
                        content: 'Different sounds have different effects on stress relief.',
                        sounds: [
                            { type: 'Nature Sounds', effect: 'Lower cortisol levels', examples: ['Rain', 'Ocean', 'Forest'] },
                            { type: 'Meditation Music', effect: 'Activate parasympathetic nervous', examples: ['Piano', 'Strings'] },
                            { type: 'Binaural Beats', effect: 'Guide brainwaves to relaxed state', examples: ['Alpha waves', 'Theta waves'] }
                        ]
                    }
                ]
            }
        });

        // 专注力提升内容
        this.contents.set('focus-guide', {
            'zh-CN': {
                title: '提升专注力的音疗方法',
                sections: [
                    {
                        title: '专注力的科学',
                        content: '专注力是一种有限资源，可以通过训练得到提升。大脑在不同状态下会产生不同的脑波，影响我们的专注程度。',
                        brainwaves: [
                            { type: 'Beta波 (13-30Hz)', desc: '警觉和专注状态' },
                            { type: 'Alpha波 (8-12Hz)', desc: '放松但清醒的状态' },
                            { type: 'Theta波 (4-7Hz)', desc: '深度放松和创造力' },
                            { type: 'Delta波 (0.5-3Hz)', desc: '深度无梦睡眠' }
                        ]
                    },
                    {
                        title: '最佳工作背景音',
                        content: '选择合适的工作背景音可以显著提升专注力和工作效率。',
                        recommendations: [
                            { name: 'Lo-fi音乐', desc: '简单的节拍，不过分干扰' },
                            { name: '白噪音', desc: '遮蔽环境噪音' },
                            { name: '自然声音', desc: '提升认知表现' },
                            { name: '巴洛克音乐', desc: '有助于学习和记忆' }
                        ]
                    },
                    {
                        title: '番茄工作法',
                        content: '结合声音疗愈的番茄工作法：25分钟专注工作 + 5分钟休息。',
                        steps: [
                            '选择适合专注的音乐',
                            '设定25分钟计时器',
                            '全力投入工作',
                            '休息时听放松音乐',
                            '重复4次后长休息'
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Sound Healing Methods for Focus Enhancement',
                sections: [
                    {
                        title: 'The Science of Focus',
                        content: 'Focus is a limited resource that can be improved through training. The brain produces different brainwaves in different states, affecting our concentration.',
                        brainwaves: [
                            { type: 'Beta waves (13-30Hz)', desc: 'Alert and focused state' },
                            { type: 'Alpha waves (8-12Hz)', desc: 'Relaxed but awake state' },
                            { type: 'Theta waves (4-7Hz)', desc: 'Deep relaxation and creativity' },
                            { type: 'Delta waves (0.5-3Hz)', desc: 'Deep dreamless sleep' }
                        ]
                    },
                    {
                        title: 'Best Work Background Music',
                        content: 'Choosing the right work background music can significantly improve focus and productivity.',
                        recommendations: [
                            { name: 'Lo-fi Music', desc: 'Simple beats, not too distracting' },
                            { name: 'White Noise', desc: 'Masks environmental noise' },
                            { name: 'Nature Sounds', desc: 'Enhances cognitive performance' },
                            { name: 'Baroque Music', desc: 'Aids learning and memory' }
                        ]
                    },
                    {
                        title: 'Pomodoro Technique',
                        content: 'Pomodoro Technique with sound healing: 25min focused work + 5min break.',
                        steps: [
                            'Choose focus-appropriate music',
                            'Set 25-minute timer',
                            'Fully engage in work',
                            'Listen to relaxing music during breaks',
                            'Take long break after 4 repetitions'
                        ]
                    }
                ]
            }
        });

        // 情绪疗愈内容
        this.contents.set('emotional-guide', {
            'zh-CN': {
                title: '情绪疗愈与平衡',
                sections: [
                    {
                        title: '情绪与频率的关系',
                        content: '每种情绪都有其对应的振动频率。通过特定频率的声音，可以帮助平衡和转化情绪状态。',
                        frequencies: [
                            { emotion: '恐惧', frequency: '396Hz', effect: '转化恐惧为爱' },
                            { emotion: '内疚', frequency: '417Hz', effect: '清除负面情绪' },
                            { emotion: '愤怒', frequency: '639Hz', effect: '促进和谐关系' },
                            { emotion: '悲伤', frequency: '741Hz', effect: '提升直觉力' }
                        ]
                    },
                    {
                        title: '颂钵疗愈',
                        content: '颂钵是一种古老的疗愈工具，通过声音振动作用于身心。',
                        benefits: [
                            '深度放松身心',
                            '清理能量阻塞',
                            '平衡脉轮系统',
                            '提升意识状态'
                        ]
                    },
                    {
                        title: '日常情绪调节',
                        content: '建立日常的情绪调节习惯，保持情绪健康。',
                        practices: [
                            { name: '早晨感恩冥想', duration: '10分钟' },
                            { name: '午间能量平衡', duration: '15分钟' },
                            { name: '傍晚释放练习', duration: '20分钟' },
                            { name: '睡前清理冥想', duration: '30分钟' }
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Emotional Healing and Balance',
                sections: [
                    {
                        title: 'Emotion and Frequency Relationship',
                        content: 'Each emotion has its corresponding vibrational frequency. Through specific frequency sounds, we can help balance and transform emotional states.',
                        frequencies: [
                            { emotion: 'Fear', frequency: '396Hz', effect: 'Transform fear to love' },
                            { emotion: 'Guilt', frequency: '417Hz', effect: 'Clear negative emotions' },
                            { emotion: 'Anger', frequency: '639Hz', effect: 'Promote harmonious relationships' },
                            { emotion: 'Sadness', frequency: '741Hz', effect: 'Enhance intuition' }
                        ]
                    },
                    {
                        title: 'Singing Bowl Healing',
                        content: 'Singing bowls are ancient healing tools that work on body and mind through sound vibration.',
                        benefits: [
                            'Deep relaxation of body and mind',
                            'Clear energy blockages',
                            'Balance chakra system',
                            'Elevate consciousness'
                        ]
                    },
                    {
                        title: 'Daily Emotional Regulation',
                        content: 'Establish daily emotional regulation habits to maintain emotional health.',
                        practices: [
                            { name: 'Morning Gratitude Meditation', duration: '10 min' },
                            { name: 'Midday Energy Balance', duration: '15 min' },
                            { name: 'Evening Release Practice', duration: '20 min' },
                            { name: 'Bedtime Clearing Meditation', duration: '30 min' }
                        ]
                    }
                ]
            }
        });

        // 颂钵疗愈内容
        this.contents.set('healing-guide', {
            'zh-CN': {
                title: '颂钵疗愈详解',
                sections: [
                    {
                        title: '颂钵的历史',
                        content: '颂钵起源于喜马拉雅地区，已有超过3000年的历史。最初被用作食物容器，后来发现其独特的声音具有疗愈效果。',
                        history: [
                            '起源于西藏和尼泊尔',
                            '由七种金属制成（金、银、铜、铁、锡、铅、锌）',
                            '每个行星对应一种金属',
                            '寺庙修行者的秘密工具'
                        ]
                    },
                    {
                        title: '颂钵的科学原理',
                        content: '颂钵的声音包含丰富的泛音，能够产生共振效应，影响人体的细胞和能量场。',
                        principles: [
                            '声音振动影响水分子的排列',
                            '共振效应清除能量阻塞',
                            '双耳效应平衡大脑半球',
                            '频率影响神经系统'
                        ]
                    },
                    {
                        title: '基础演奏技巧',
                        content: '学习颂钵的基本演奏方法。',
                        techniques: [
                            {
                                name: '敲击法',
                                desc: '用软木槌轻敲钵边',
                                tips: '保持力度均匀，避免重击'
                            },
                            {
                                name: '摩擦法',
                                desc: '用木槌沿钵边摩擦',
                                tips: '保持恒定速度和压力'
                            },
                            {
                                name: '水钵法',
                                desc: '在钵中加水产生不同音效',
                                tips: '水量不超过钵的1/3'
                            }
                        ]
                    }
                ]
            },
            'en-US': {
                title: 'Singing Bowl Healing Explained',
                sections: [
                    {
                        title: 'History of Singing Bowls',
                        content: 'Singing bowls originated in the Himalayan region with over 3000 years of history. Initially used as food containers, later discovered to have unique healing sound effects.',
                        history: [
                            'Originated in Tibet and Nepal',
                            'Made of seven metals (gold, silver, copper, iron, tin, lead, zinc)',
                            'Each planet corresponds to a metal',
                            'Secret tool of temple practitioners'
                        ]
                    },
                    {
                        title: 'Scientific Principles of Singing Bowls',
                        content: 'Singing bowl sounds contain rich overtones that can produce resonance effects, affecting body cells and energy fields.',
                        principles: [
                            'Sound vibrations affect water molecule arrangement',
                            'Resonance effects clear energy blockages',
                            'Binaural effects balance brain hemispheres',
                            'Frequencies affect nervous system'
                        ]
                    },
                    {
                        title: 'Basic Playing Techniques',
                        content: 'Learn basic singing bowl playing methods.',
                        techniques: [
                            {
                                name: 'Striking Method',
                                desc: 'Gently strike bowl rim with soft mallet',
                                tips: 'Maintain even force, avoid heavy strikes'
                            },
                            {
                                name: 'Rimming Method',
                                desc: 'Rub bowl rim with mallet',
                                tips: 'Maintain constant speed and pressure'
                            },
                            {
                                name: 'Water Bowl Method',
                                desc: 'Add water to bowl for different sound effects',
                                tips: 'Water level not exceed 1/3 of bowl'
                            }
                        ]
                    }
                ]
            }
        });

        this.contentLoaded = true;
    }

    /**
     * 获取指定内容
     */
    getContent(contentId, language = null) {
        const lang = language || this.getCurrentLanguage();
        const content = this.contents.get(contentId);
        return content ? content[lang] || content['en-US'] : null;
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        if (window.i18n) {
            return window.i18n.currentLanguage;
        }
        return localStorage.getItem('sound_healing_language') || 'zh-CN';
    }

    /**
     * 渲染内容到页面
     */
    renderContent(contentId, targetElement) {
        const content = this.getContent(contentId);
        if (!content || !targetElement) return;

        let html = `<div class="resource-content">`;
        html += `<h1>${content.title}</h1>`;

        content.sections.forEach(section => {
            html += `<section class="content-section">`;
            html += `<h2>${section.title}</h2>`;
            html += `<p>${section.content}</p>`;

            // 渲染提示列表
            if (section.tips) {
                html += `<ul class="tips-list">`;
                section.tips.forEach(tip => {
                    html += `<li>${tip}</li>`;
                });
                html += `</ul>`;
            }

            // 渲染音频列表
            if (section.audios) {
                html += `<div class="audio-list">`;
                section.audios.forEach(audio => {
                    html += `<div class="audio-item">`;
                    html += `<h4>${audio.name}</h4>`;
                    html += `<p>${audio.duration}</p>`;
                    html += `<button onclick="playAudio('${audio.category}', '${audio.name}')" class="play-btn">▶ 播放</button>`;
                    html += `</div>`;
                });
                html += `</div>`;
            }

            html += `</section>`;
        });

        html += `</div>`;
        targetElement.innerHTML = html;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 监听语言变化
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.refreshContent();
        });
    }

    /**
     * 刷新内容
     */
    refreshContent() {
        // 重新渲染当前显示的内容
        const currentContent = document.querySelector('.resource-content');
        if (currentContent) {
            // 获取当前内容ID并重新渲染
            const contentId = currentContent.dataset.contentId;
            if (contentId) {
                this.renderContent(contentId, currentContent.parentElement);
            }
        }
    }

    /**
     * 搜索内容
     */
    searchContent(query) {
        const results = [];
        const lang = this.getCurrentLanguage();

        this.contents.forEach((content, id) => {
            const contentInLang = content[lang] || content['en-US'];
            if (contentInLang.title.toLowerCase().includes(query.toLowerCase()) ||
                contentInLang.sections.some(section =>
                    section.content.toLowerCase().includes(query.toLowerCase())
                )) {
                results.push({ id, title: contentInLang.title });
            }
        });

        return results;
    }
}

// 初始化资源内容管理器
window.resourcesContent = new ResourcesContent();

// 播放音频的辅助函数
function playAudio(category, name) {
    if (window.audioManager) {
        // 查找对应的音频并播放
        const track = window.audioManager.tracks.find(t =>
            t.category === category && t.name === name
        );
        if (track) {
            window.audioManager.playTrack(track.id, category, track.fileName);
        }
    }
}