/**
 * 7日冥想计划 - 邮件模板配置
 *
 * 此文件定义了7日冥想计划的邮件序列模板
 * 通过HubSpot Workflows自动发送
 *
 * 使用方法:
 * 1. 在HubSpot中创建相应的邮件模板
 * 2. 设置自动化Workflow触发条件
 * 3. 配置延迟发送规则
 */

window.EMAIL_TEMPLATES = window.EMAIL_TEMPLATES || {
    /**
     * 7日冥想计划邮件序列
     *
     * 发送规则:
     * - 第0天: 立即发送欢迎邮件
     * - 第1-7天: 每天发送一封冥想指导
     * - 第8天: 发送完成邮件和后续建议
     */

    // 第0天 - 欢迎邮件（立即发送）
    day0: {
        name: "欢迎加入7日冥想计划",
        subject: "🧘‍♀️ 欢迎加入SoundFlows 7日冥想计划",
        template: "welcome_day0",
        delayMinutes: 0,
        content: {
            zh: {
                title: "开启你的冥想之旅",
                preview: "7天，让我们一起找回内心的平静",
                sections: [
                    {
                        type: "welcome",
                        content: "亲爱的{{contact.firstname}}，欢迎加入SoundFlows 7日冥想计划！"
                    },
                    {
                        type: "introduction",
                        content: "在接下来的7天里，我们将一起通过冥想练习，帮助你缓解压力、改善睡眠、提升专注力。"
                    },
                    {
                        type: "schedule",
                        content: "每天你都会收到一封邮件，包含当天的冥想主题、练习指导和音频链接。"
                    },
                    {
                        type: "cta",
                        button: "开始第一天冥想",
                        url: "https://soundflows.app/#meditation-plan"
                    }
                ]
            },
            en: {
                title: "Begin Your Meditation Journey",
                preview: "7 days to find inner peace together",
                sections: [
                    {
                        type: "welcome",
                        content: "Dear {{contact.firstname}}, welcome to the SoundFlows 7-Day Meditation Challenge!"
                    },
                    {
                        type: "introduction",
                        content: "Over the next 7 days, we'll use meditation practices to help you relieve stress, improve sleep, and enhance focus."
                    },
                    {
                        type: "schedule",
                        content: "Each day you'll receive an email with the day's meditation theme, practice guidance, and audio links."
                    },
                    {
                        type: "cta",
                        button: "Start Day 1 Meditation",
                        url: "https://soundflows.app/#meditation-plan"
                    }
                ]
            }
        }
    },

    // 第1天 - 基础呼吸冥想
    day1: {
        name: "基础呼吸冥想",
        subject: "第1天：基础呼吸冥想 | Day 1: Basic Breathing Meditation",
        template: "meditation_day1",
        delayHours: 24,
        audioCategory: "meditation",
        audioTrack: "breathing-basics",
        content: {
            zh: {
                title: "基础呼吸冥想",
                subtitle: "从呼吸开始，回归当下",
                duration: "10分钟",
                benefits: [
                    "平静心绪，缓解焦虑",
                    "提升专注力",
                    "建立冥想基础"
                ],
                instructions: [
                    "找一个安静的地方，舒适地坐下",
                    "闭上眼睛，将注意力放在呼吸上",
                    "深吸气4秒，屏息4秒，呼气4秒",
                    "保持这个节奏10分钟"
                ]
            },
            en: {
                title: "Basic Breathing Meditation",
                subtitle: "Return to the present through breath",
                duration: "10 minutes",
                benefits: [
                    "Calm the mind, relieve anxiety",
                    "Improve focus",
                    "Build meditation foundation"
                ],
                instructions: [
                    "Find a quiet place and sit comfortably",
                    "Close your eyes and focus on your breath",
                    "Inhale for 4s, hold for 4s, exhale for 4s",
                    "Maintain this rhythm for 10 minutes"
                ]
            }
        }
    },

    // 第2天 - 身体扫描冥想
    day2: {
        name: "身体扫描冥想",
        subject: "第2天：身体扫描冥想 | Day 2: Body Scan Meditation",
        template: "meditation_day2",
        delayHours: 48,
        audioCategory: "meditation",
        audioTrack: "body-scan-relaxation",
        content: {
            zh: {
                title: "身体扫描冥想",
                subtitle: "释放身体的紧张与疲劳",
                duration: "15分钟",
                benefits: [
                    "深度放松身体",
                    "提升身体觉察力",
                    "改善睡眠质量"
                ],
                instructions: [
                    "躺下或舒适地坐着",
                    "从脚趾开始，逐步向上扫描身体",
                    "感受每个部位的感觉，不做判断",
                    "释放所有紧张，完全放松"
                ]
            },
            en: {
                title: "Body Scan Meditation",
                subtitle: "Release tension and fatigue from the body",
                duration: "15 minutes",
                benefits: [
                    "Deep body relaxation",
                    "Enhance body awareness",
                    "Improve sleep quality"
                ],
                instructions: [
                    "Lie down or sit comfortably",
                    "Start from toes, gradually scan upward",
                    "Feel sensations in each part without judgment",
                    "Release all tension, completely relax"
                ]
            }
        }
    },

    // 第3天 - 正念冥想
    day3: {
        name: "正念冥想",
        subject: "第3天：正念冥想 | Day 3: Mindfulness Meditation",
        template: "meditation_day3",
        delayHours: 72,
        audioCategory: "meditation",
        audioTrack: "mindfulness-practice",
        content: {
            zh: {
                title: "正念冥想",
                subtitle: "培养觉察，活在当下",
                duration: "12分钟",
                benefits: [
                    "减少思绪纷乱",
                    "增强情绪调节能力",
                    "提升幸福感"
                ],
                instructions: [
                    "保持舒适的坐姿",
                    "观察当下的念头和感受",
                    "不做评判，只是观察",
                    "温和地将注意力带回呼吸"
                ]
            },
            en: {
                title: "Mindfulness Meditation",
                subtitle: "Cultivate awareness, live in the present",
                duration: "12 minutes",
                benefits: [
                    "Reduce racing thoughts",
                    "Enhance emotional regulation",
                    "Increase happiness"
                ],
                instructions: [
                    "Maintain comfortable sitting posture",
                    "Observe current thoughts and feelings",
                    "No judgment, just observe",
                    "Gently return attention to breath"
                ]
            }
        }
    },

    // 第4天 - 慈心冥想
    day4: {
        name: "慈心冥想",
        subject: "第4天：慈心冥想 | Day 4: Loving-Kindness Meditation",
        template: "meditation_day4",
        delayHours: 96,
        audioCategory: "meditation",
        audioTrack: "loving-kindness",
        content: {
            zh: {
                title: "慈心冥想",
                subtitle: "培养慈悲与爱心",
                duration: "15分钟",
                benefits: [
                    "增强同理心",
                    "改善人际关系",
                    "减少负面情绪"
                ],
                instructions: [
                    "舒适地坐下，闭上眼睛",
                    "对自己发送祝福：愿我快乐",
                    "将祝福扩展到亲人、朋友",
                    "最后祝福所有生命"
                ]
            },
            en: {
                title: "Loving-Kindness Meditation",
                subtitle: "Cultivate compassion and love",
                duration: "15 minutes",
                benefits: [
                    "Enhance empathy",
                    "Improve relationships",
                    "Reduce negative emotions"
                ],
                instructions: [
                    "Sit comfortably, close eyes",
                    "Send blessings to self: May I be happy",
                    "Extend blessings to family, friends",
                    "Finally bless all beings"
                ]
            }
        }
    },

    // 第5天 - 行走冥想
    day5: {
        name: "行走冥想",
        subject: "第5天：行走冥想 | Day 5: Walking Meditation",
        template: "meditation_day5",
        delayHours: 120,
        audioCategory: "meditation",
        audioTrack: "walking-meditation",
        content: {
            zh: {
                title: "行走冥想",
                subtitle: "在移动中寻找平静",
                duration: "20分钟",
                benefits: [
                    "连接身体与自然",
                    "提升专注力",
                    "适合好动的人"
                ],
                instructions: [
                    "选择一个安静的地方缓慢行走",
                    "感受脚底与地面的接触",
                    "配合步伐的节奏呼吸",
                    "保持觉察，享受当下"
                ]
            },
            en: {
                title: "Walking Meditation",
                subtitle: "Find calm in movement",
                duration: "20 minutes",
                benefits: [
                    "Connect body with nature",
                    "Enhance focus",
                    "Suitable for active people"
                ],
                instructions: [
                    "Choose quiet place, walk slowly",
                    "Feel contact between feet and ground",
                    "Coordinate breath with steps",
                    "Maintain awareness, enjoy present"
                ]
            }
        }
    },

    // 第6天 - 声音冥想
    day6: {
        name: "声音冥想",
        subject: "第6天：声音冥想 | Day 6: Sound Meditation",
        template: "meditation_day6",
        delayHours: 144,
        audioCategory: "Singing bowl sound",
        audioTrack: "singing-bowl-healing",
        content: {
            zh: {
                title: "声音冥想",
                subtitle: "用声音净化心灵",
                duration: "15分钟",
                benefits: [
                    "深度放松",
                    "净化能量场",
                    "平衡脉轮"
                ],
                instructions: [
                    "使用耳机获得最佳效果",
                    "专注于颂钵的声音振动",
                    "让声音在体内 resonate",
                    "释放所有杂念"
                ]
            },
            en: {
                title: "Sound Meditation",
                subtitle: "Purify mind with sound",
                duration: "15 minutes",
                benefits: [
                    "Deep relaxation",
                    "Cleanse energy field",
                    "Balance chakras"
                ],
                instructions: [
                    "Use headphones for best effect",
                    "Focus on singing bowl vibrations",
                    "Let sound resonate in body",
                    "Release all distracting thoughts"
                ]
            }
        }
    },

    // 第7天 - 整合与感恩
    day7: {
        name: "整合与感恩",
        subject: "第7天：整合与感恩 | Day 7: Integration & Gratitude",
        template: "meditation_day7",
        delayHours: 168,
        audioCategory: "meditation",
        audioTrack: "gratitude-meditation",
        content: {
            zh: {
                title: "整合与感恩",
                subtitle: "回顾7天的成长",
                duration: "20分钟",
                benefits: [
                    "巩固冥想习惯",
                    "培养感恩心",
                    "规划未来练习"
                ],
                instructions: [
                    "回顾这7天的体验",
                    "感谢自己的坚持",
                    "制定未来冥想计划",
                    "分享给需要的人"
                ]
            },
            en: {
                title: "Integration & Gratitude",
                subtitle: "Review 7 days of growth",
                duration: "20 minutes",
                benefits: [
                    "Solidify meditation habit",
                    "Cultivate gratitude",
                    "Plan future practice"
                ],
                instructions: [
                    "Review experiences of past 7 days",
                    "Thank yourself for persistence",
                    "Create future meditation plan",
                    "Share with those in need"
                ]
            }
        }
    },

    // 第8天 - 完成祝福
    day8: {
        name: "冥想计划完成",
        subject: "🎉 恭喜完成7日冥想计划！",
        template: "completion_day8",
        delayHours: 192,
        content: {
            zh: {
                title: "恭喜你完成了7日冥想计划！",
                subtitle: "这只是开始，不是结束",
                achievements: [
                    "坚持7天的冥想练习",
                    "学会了多种冥想技巧",
                    "找到了内心的平静"
                ],
                nextSteps: [
                    "继续每日冥想习惯",
                    "探索更多音频资源",
                    "加入社区分享体验"
                ],
                resources: [
                    {
                        name: "高级冥想课程",
                        url: "https://soundflows.app/#advanced"
                    },
                    {
                        name: "冥想社区",
                        url: "https://soundflows.app/#community"
                    },
                    {
                        name: "个人定制计划",
                        url: "https://soundflows.app/#custom"
                    }
                ]
            },
            en: {
                title: "Congratulations on Completing the 7-Day Meditation Plan!",
                subtitle: "This is just the beginning, not the end",
                achievements: [
                    "Persisted 7 days of meditation practice",
                    "Learned multiple meditation techniques",
                    "Found inner peace"
                ],
                nextSteps: [
                    "Continue daily meditation habit",
                    "Explore more audio resources",
                    "Join community to share experiences"
                ],
                resources: [
                    {
                        name: "Advanced Meditation Course",
                        url: "https://soundflows.app/#advanced"
                    },
                    {
                        name: "Meditation Community",
                        url: "https://soundflows.app/#community"
                    },
                    {
                        name: "Personal Custom Plan",
                        url: "https://soundflows.app/#custom"
                    }
                ]
            }
        }
    }
};

/**
 * HubSpot Workflow配置说明
 *
 * 在HubSpot中设置以下Workflow:
 *
 * 1. 触发条件:
 *    - 表单提交: 7日冥想计划注册
 *    - 标签: "7-day-meditation-plan"
 *
 * 2. 动作序列:
 *    - 立即发送: Day0欢迎邮件
 *    - 延迟24小时: 发送Day1邮件
 *    - 延迟48小时: 发送Day2邮件
 *    - ...
 *    - 延迟192小时: 发送Day8完成邮件
 *
 * 3. 个性化字段:
 *    - {{contact.firstname}} - 名字
 *    - {{contact.lastname}} - 姓氏
 *    - {{contact.email}} - 邮箱
 *    - {{contact.meditation_goal}} - 冥想目标
 *    - {{contact.preferred_time}} - 偏好时间
 *
 * 4. 邮件模板创建:
 *    - 使用以上内容创建HubSpot邮件模板
 *    - 包含音频链接按钮
 *    - 添加社交媒体分享按钮
 *    - 配置跟踪参数
 */

// 导出给测试使用
if (typeof window !== 'undefined') {
    window.getEmailTemplate = function(day) {
        return window.EMAIL_TEMPLATES[`day${day}`] || null;
    };

    window.getAllEmailTemplates = function() {
        return window.EMAIL_TEMPLATES;
    };
}