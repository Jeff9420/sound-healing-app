# API和配置文档

## 外部API和服务配置

### 1. Firebase配置

#### Firebase项目信息
- **项目ID**: sound-healing-app (示例)
- **API密钥**: AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx
- **认证域名**: soundflows.app
- **数据库URL**: https://sound-healing-app.firebaseio.com
- **存储桶**: sound-healing-app.appspot.com

#### Firebase配置代码
```javascript
// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "sound-healing-app.firebaseapp.com",
    projectId: "sound-healing-app",
    storageBucket: "sound-healing-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345",
    measurementId: "G-4NZR3HR3J1"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
```

#### Firebase服务使用
```javascript
// 认证服务
const auth = firebase.auth();

// Firestore数据库
const db = firebase.firestore();

// 存储服务
const storage = firebase.storage();

// 分析服务
const analytics = firebase.analytics();
```

### 2. Formspree邮件服务

#### 配置信息
- **Form ID**: mldpqopn
- **端点**: https://formspree.io/f/mldpqopn
- **免费额度**: 50封/月
- **无需API密钥**

#### 邮件模板配置
```javascript
// 邮件类型和模板
const EMAIL_TEMPLATES = {
    welcome: {
        subject: '欢迎加入SoundFlows',
        template: 'welcome-template'
    },
    passwordReset: {
        subject: '密码重置请求',
        template: 'reset-template'
    },
    dailyReminder: {
        subject: '每日冥想提醒',
        template: 'reminder-template'
    },
    weeklyDigest: {
        subject: '周度使用报告',
        template: 'digest-template'
    }
};

// 发送邮件
const sendEmail = async (type, data) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('subject', EMAIL_TEMPLATES[type].subject);
    formData.append('message', generateContent(type, data));
    formData.append('_template', 'table');

    const response = await fetch(`https://formspree.io/f/mldpqopn`, {
        method: 'POST',
        body: formData
    });

    return response.json();
};
```

### 3. Google Analytics 4

#### 配置信息
- **测量ID**: G-4NZR3HR3J1
- **流名称**: SoundFlows Web
- **数据保留**: 14个月
- **增强衡量**: 已启用

#### GA4初始化
```html
<!-- Google Analytics (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4NZR3HR3J1"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-4NZR3HR3J1', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
    });
</script>
```

#### 自定义事件追踪
```javascript
// 音频播放事件
gtag('event', 'audio_play', {
    event_category: 'Audio',
    event_label: 'Meditation Music - Track Name',
    audio_category: 'meditation',
    track_name: 'Morning Meditation'
});

// 用户注册事件
gtag('event', 'sign_up', {
    method: 'Email',
    user_type: 'Premium'
});

// 语言切换事件
gtag('event', 'language_change', {
    new_language: 'zh-CN'
});
```

### 4. Amplitude分析

#### 配置信息
- **API密钥**: b6c4ebe3ec4d16c8f5fd258d29653cfc
- **项目ID**: 123456789

#### Amplitude初始化
```javascript
// Amplitude SDK配置
amplitude.init('b6c4ebe3ec4d16c8f5fd258d29653cfc', {
    fetchRemoteConfig: true,
    autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true
    }
});
```

### 5. Microsoft Clarity

#### 配置代码
```html
<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "abcdefghij");
</script>
```

## 内部API和事件系统

### 1. 自定义事件系统

#### 事件类型定义
```javascript
// 用户相关事件
const USER_EVENTS = {
    REGISTERED: 'userRegistered',
    LOGIN: 'userLoggedIn',
    LOGOUT: 'userLoggedOut',
    PROFILE_UPDATED: 'userProfileUpdated'
};

// 音频相关事件
const AUDIO_EVENTS = {
    PLAY: 'audioPlayed',
    PAUSE: 'audioPaused',
    STOP: 'audioStopped',
    COMPLETE: 'audioCompleted',
    PROGRESS: 'audioProgress'
};

// 系统相关事件
const SYSTEM_EVENTS = {
    DAILY_REMINDER: 'dailyReminderTriggered',
    WEEKLY_DIGEST: 'weeklyDigestGenerated',
    PASSWORD_RESET: 'passwordResetRequested'
};
```

#### 事件监听和触发
```javascript
// 触发事件
const triggerEvent = (eventName, data) => {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
};

// 监听事件
document.addEventListener('userRegistered', (event) => {
    const userData = event.detail;
    console.log('新用户注册:', userData);
    sendWelcomeEmail(userData);
});
```

### 2. 音频管理API

#### AudioManager类
```javascript
class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.playlist = [];
        this.currentIndex = 0;
        this.volume = 0.7;
    }

    // 播放音频
    async playTrack(trackId, category, fileName) {
        const url = `https://archive.org/download/sound-healing-collection/${category}/${fileName}`;

        this.currentAudio = new Audio(url);
        this.currentAudio.volume = this.volume;

        await this.currentAudio.play();
        this.isPlaying = true;

        triggerEvent('audioPlayed', {
            trackId,
            category,
            fileName,
            duration: this.currentAudio.duration
        });
    }

    // 暂停播放
    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.isPlaying = false;
            triggerEvent('audioPaused');
        }
    }

    // 停止播放
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isPlaying = false;
            triggerEvent('audioStopped');
        }
    }

    // 设置音量
    setVolume(volume) {
        this.volume = volume;
        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }
    }

    // 获取进度
    getProgress() {
        if (this.currentAudio) {
            return {
                current: this.currentAudio.currentTime,
                total: this.currentAudio.duration,
                percentage: (this.currentAudio.currentTime / this.currentAudio.duration) * 100
            };
        }
        return null;
    }
}
```

### 3. 用户数据管理API

#### UserDataManager类
```javascript
class UserDataManager {
    constructor() {
        this.storageKey = 'userData';
        this.data = this.loadData();
    }

    // 加载数据
    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : this.getDefaultData();
    }

    // 获取默认数据
    getDefaultData() {
        return {
            uid: null,
            email: null,
            displayName: null,
            preferences: {
                language: 'en-US',
                theme: 'dark',
                volume: 0.7
            },
            history: [],
            favorites: [],
            statistics: {
                totalSessions: 0,
                totalMinutes: 0,
                streakDays: 0,
                lastPlayDate: null
            }
        };
    }

    // 保存数据
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // 更新用户信息
    updateUser(userInfo) {
        this.data = { ...this.data, ...userInfo };
        this.saveData();
    }

    // 添加播放历史
    addPlayHistory(track) {
        this.data.history.unshift({
            ...track,
            playedAt: new Date().toISOString()
        });

        // 只保留最近100条
        if (this.data.history.length > 100) {
            this.data.history = this.data.history.slice(0, 100);
        }

        this.saveData();
    }

    // 添加收藏
    addFavorite(track) {
        const exists = this.data.favorites.find(f => f.id === track.id);
        if (!exists) {
            this.data.favorites.push(track);
            this.saveData();
        }
    }

    // 移除收藏
    removeFavorite(trackId) {
        this.data.favorites = this.data.favorites.filter(f => f.id !== trackId);
        this.saveData();
    }

    // 更新统计数据
    updateStatistics(duration) {
        this.data.statistics.totalSessions++;
        this.data.statistics.totalMinutes += Math.floor(duration / 60);
        this.data.statistics.lastPlayDate = new Date().toISOString();
        this.saveData();
    }
}
```

### 4. 通知系统API

#### NotificationManager类
```javascript
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.checkPermission();
    }

    // 检查权限
    async checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    // 请求权限
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }
        return false;
    }

    // 显示通知
    showNotification(title, options = {}) {
        if (this.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/icon-96x96.png',
                ...options
            });

            setTimeout(() => notification.close(), 5000);
            return notification;
        }
    }

    // 每日提醒通知
    showDailyReminder(streakDays) {
        const messages = [
            '🧘‍♀️ 是时候进行今日冥想了！',
            '🌸 让我们一起开始今天的冥想练习吧',
            '🕊️ 深呼吸，放松身心，开始冥想'
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];

        return this.showNotification('SoundFlows 每日冥想提醒', {
            body: streakDays > 0
                ? `🔥 连续${streakDays}天！${message}`
                : message,
            requireInteraction: true,
            actions: [
                { action: 'start', title: '开始练习' },
                { action: 'later', title: '稍后提醒' }
            ]
        });
    }
}
```

## 配置文件

### 1. 音频配置 (audio-config.js)
```javascript
window.AUDIO_CONFIG = {
    // Archive.org基础URL
    baseUrl: 'https://archive.org/download/sound-healing-collection/',

    // 音频分类配置
    categories: {
        meditation: {
            name: '冥想音乐',
            folder: 'meditation',
            tracks: [
                { id: 'med001', file: 'Morning_Meditation.mp3', title: '晨间冥想', duration: 600 },
                { id: 'med002', file: 'Evening_Meditation.mp3', title: '晚间冥想', duration: 480 },
                // ... 更多音轨
            ]
        },
        rain: {
            name: '雨声',
            folder: 'rain-sounds',
            tracks: [
                { id: 'rain001', file: 'Gentle_Rain.mp3', title: '轻柔雨声', duration: 1800 },
                { id: 'rain002', file: 'Heavy_Rain.mp3', title: '大雨声', duration: 1800 },
                // ... 更多音轨
            ]
        },
        // ... 其他分类
    },

    // 默认设置
    defaultSettings: {
        volume: 0.7,
        autoplay: false,
        loop: false,
        shuffle: false
    }
};
```

### 2. 视频配置 (video-background-manager.js)
```javascript
window.VIDEO_CONFIG = {
    // Cloudflare R2 CDN
    baseUrl: 'https://media.soundflows.app/',

    // 视频映射
    videoMap: {
        meditation: 'zen-bamboo.ia.mp4',
        rain: 'rain-drops.ia.mp4',
        fire: 'campfire-flames.ia.mp4',
        water: 'flowing-stream.ia.mp4',
        chakra: 'energy-chakra.ia.mp4',
        singing: 'temple-golden.ia.mp4',
        animal: 'forest-birds.ia.mp4',
        hypnosis: 'cosmic-stars.ia.mp4',
        therapy: 'dreamy-clouds.ia.mp4'
    },

    // 播放设置
    settings: {
        autoplay: true,
        muted: true,
        loop: true,
        preload: 'auto'
    }
};
```

### 3. 国际化配置 (i18n-system.js)
```javascript
window.I18N_CONFIG = {
    // 默认语言
    defaultLanguage: 'en-US',

    // 支持的语言
    supportedLanguages: {
        'zh-CN': '简体中文',
        'en-US': 'English',
        'ja-JP': '日本語',
        'ko-KR': '한국어',
        'es-ES': 'Español'
    },

    // 语言检测优先级
    detectionOrder: [
        'localStorage',      // 用户保存的偏好
        'navigator.language', // 浏览器语言
        'default'            // 默认语言
    ],

    // 回退语言
    fallbackLanguage: 'en-US'
};
```

### 4. PWA配置 (manifest.json)
```json
{
    "name": "声音疗愈空间 - SoundFlows",
    "short_name": "SoundFlows",
    "description": "专业的声音疗愈平台，提供213+疗愈音频",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a2e",
    "theme_color": "#6666ff",
    "orientation": "portrait",
    "categories": ["health", "lifestyle", "music"],
    "lang": "zh-CN",
    "dir": "ltr",
    "icons": [
        {
            "src": "/assets/icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png"
        },
        {
            "src": "/assets/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/assets/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "screenshots": [
        {
            "src": "/assets/images/screenshot-desktop.png",
            "sizes": "1280x720",
            "type": "image/png",
            "form_factor": "wide"
        },
        {
            "src": "/assets/images/screenshot-mobile.png",
            "sizes": "375x667",
            "type": "image/png",
            "form_factor": "narrow"
        }
    ]
}
```

### 5. Vercel配置 (vercel.json)
```json
{
    "version": 2,
    "name": "sound-flows",
    "builds": [
        {
            "src": "**/*.html",
            "use": "@vercel/static"
        },
        {
            "src": "assets/**/*",
            "use": "@vercel/static"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/$1"
        }
    ],
    "headers": [
        {
            "source": "/assets/(.*)",
            "headers": [
                {
                    "key": "Cache-Control",
                    "value": "public, max-age=31536000, immutable"
                }
            ]
        },
        {
            "source": "/(.*\\.(mp3|mp4|wav|ogg))",
            "headers": [
                {
                    "key": "Cache-Control",
                    "value": "public, max-age=86400"
                },
                {
                    "key": "Accept-Ranges",
                    "value": "bytes"
                }
            ]
        }
    ],
    "cleanUrls": true,
    "trailingSlash": false
}
```

## 环境变量

### 开发环境 (.env.local)
```bash
# Firebase配置
FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=sound-healing-app.firebaseapp.com
FIREBASE_PROJECT_ID=sound-healing-app
FIREBASE_STORAGE_BUCKET=sound-healing-app.appspot.com

# 分析服务
GOOGLE_ANALYTICS_ID=G-4NZR3HR3J1
AMPLITUDE_API_KEY=b6c4ebe3ec4d16c8f5fd258d29653cfc
CLARITY_PROJECT_ID=abcdefghij

# 邮件服务
FORMSPREE_FORM_ID=mldpqopn

# API端点
API_BASE_URL=https://api.soundflows.app
CDN_BASE_URL=https://media.soundflows.app
```

### 生产环境变量 (Vercel)
```bash
# 在Vercel控制台设置以下环境变量
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
GOOGLE_ANALYTICS_ID=G-4NZR3HR3J1
AMPLITUDE_API_KEY=b6c4ebe3ec4d16c8f5fd258d29653cfc
FORMSPREE_FORM_ID=mldpqopn
```

## 数据格式规范

### 1. 用户数据格式
```javascript
{
    "uid": "unique_user_id",
    "email": "user@example.com",
    "displayName": "用户名",
    "photoURL": "https://example.com/avatar.jpg",
    "preferences": {
        "language": "zh-CN",
        "theme": "dark",
        "volume": 0.7,
        "reminderTime": "20:00",
        "reminderEnabled": true
    },
    "statistics": {
        "totalSessions": 150,
        "totalMinutes": 3600,
        "streakDays": 7,
        "lastPlayDate": "2025-01-24T12:00:00Z",
        "favoriteCategory": "meditation",
        "mostPlayedTrack": "Morning Meditation"
    }
}
```

### 2. 音频数据格式
```javascript
{
    "id": "track_unique_id",
    "title": "音频标题",
    "category": "meditation",
    "fileName": "Morning_Meditation.mp3",
    "duration": 600,
    "url": "https://archive.org/download/...",
    "description": "音频描述",
    "tags": ["冥想", "放松", "早晨"],
    "mood": "calm",
    "bpm": 60,
    "key": "C"
}
```

### 3. 播放历史格式
```javascript
{
    "id": "history_unique_id",
    "trackId": "track_unique_id",
    "playedAt": "2025-01-24T12:00:00Z",
    "duration": 600,
    "playedDuration": 450,
    "completed": true,
    "source": "playlist",
    "device": "desktop"
}
```

## 错误代码

### 1. 音频错误
```javascript
const AUDIO_ERRORS = {
    LOAD_FAILED: 'AUDIO_LOAD_FAILED',
    PLAY_FAILED: 'AUDIO_PLAY_FAILED',
    NETWORK_ERROR: 'AUDIO_NETWORK_ERROR',
    DECODE_ERROR: 'AUDIO_DECODE_ERROR',
    NOT_SUPPORTED: 'AUDIO_NOT_SUPPORTED'
};
```

### 2. 认证错误
```javascript
const AUTH_ERRORS = {
    INVALID_EMAIL: 'auth/invalid-email',
    USER_DISABLED: 'auth/user-disabled',
    USER_NOT_FOUND: 'auth/user-not-found',
    WRONG_PASSWORD: 'auth/wrong-password',
    EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
    WEAK_PASSWORD: 'auth/weak-password'
};
```

### 3. 网络错误
```javascript
const NETWORK_ERRORS = {
    OFFLINE: 'NETWORK_OFFLINE',
    TIMEOUT: 'NETWORK_TIMEOUT',
    SERVER_ERROR: 'SERVER_ERROR',
    RATE_LIMITED: 'RATE_LIMITED'
};
```

---

*文档版本: v1.0.0*
*最后更新: 2025-01-24*