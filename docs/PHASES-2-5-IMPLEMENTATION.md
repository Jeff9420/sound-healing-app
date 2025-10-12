# Phases 2-5 实施文档

## 📋 概述

本文档整合了Phase 2-5的核心功能实施方案，采用模块化设计，便于逐步实现。

---

## Phase 2: 账号系统和数据同步 ✅

### 已完成文件
- ✅ `firebase-config.js` - Firebase配置和初始化
- ✅ `firebase-auth.js` - 认证管理器
- ✅ `cloud-sync-manager.js` - 云端数据同步

### 功能特性
- ✅ Google/Email登录
- ✅ 匿名模式
- ✅ 云端数据同步
- ✅ 离线队列管理
- ✅ 冲突解决

### 使用方法

#### 1. Firebase配置
```javascript
// 需要在 firebase-config.js 中填入实际配置
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "soundflows.firebaseapp.com",
    projectId: "soundflows",
    // ...
};
```

#### 2. 引入Firebase SDK
在 `index.html` 中添加:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>

<!-- 我们的Firebase模块 -->
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/firebase-auth.js"></script>
<script src="assets/js/cloud-sync-manager.js"></script>
```

---

## Phase 3: 社区和推荐系统

### 3.1 社区贡献系统

#### 数据模型（Firestore）

```javascript
// 用户上传的音频
AudioContributions {
    id: string,
    userId: string,
    uploaderName: string,
    title: string,
    description: string,
    category: string,
    fileUrl: string,
    thumbnailUrl: string,
    duration: number,
    tags: string[],
    status: 'pending' | 'approved' | 'rejected',
    uploadedAt: timestamp,
    approvedAt: timestamp,
    reviewedBy: string,
    plays: number,
    likes: number,
    downloads: number
}

// 审核队列
ReviewQueue {
    id: string,
    audioId: string,
    status: 'pending' | 'in_review' | 'completed',
    priority: number,
    submittedAt: timestamp,
    reviewedAt: timestamp,
    reviewer: string,
    comments: string
}
```

#### 上传流程

```javascript
// 音频上传管理器（精简版）
class AudioUploadManager {
    async uploadAudio(file, metadata) {
        // 1. 验证文件
        if (!this.validateFile(file)) {
            throw new Error('Invalid file');
        }

        // 2. 上传到Firebase Storage
        const fileUrl = await this.uploadToStorage(file);

        // 3. 创建Firestore记录
        const audioDoc = {
            ...metadata,
            fileUrl,
            status: 'pending',
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('audioContributions')
            .add(audioDoc);

        return audioDoc;
    }

    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav'];

        return file.size <= maxSize &&
               allowedTypes.includes(file.type);
    }
}
```

### 3.2 推荐系统 v2

#### 推荐算法

```javascript
class RecommendationEngineV2 {
    /**
     * 基于时间的推荐
     */
    getTimeBasedRecommendations() {
        const hour = new Date().getHours();

        const timeRules = {
            morning: { hours: [6,7,8,9,10], categories: ['meditation', 'Chakra'] },
            afternoon: { hours: [12,13,14,15,16,17], categories: ['running water', 'Animal sounds'] },
            evening: { hours: [18,19,20,21], categories: ['Rain', 'Singing bowl sound'] },
            night: { hours: [22,23,0,1,2,3,4,5], categories: ['hypnosis', 'Subconscious Therapy'] }
        };

        for (const [period, config] of Object.entries(timeRules)) {
            if (config.hours.includes(hour)) {
                return this.getTracksByCategories(config.categories);
            }
        }

        return this.getPopularTracks();
    }

    /**
     * 基于用户行为的推荐
     */
    getPersonalizedRecommendations(userId) {
        const userHistory = this.getUserHistory(userId);
        const favoriteCat = this.getMostPlayedCategory(userHistory);

        // 推荐相似分类
        const similarCategories = this.getSimilarCategories(favoriteCat);

        return this.getTracksByCategories(similarCategories);
    }

    /**
     * 今日推荐板块
     */
    getDailyRecommendations() {
        return {
            timeBased: this.getTimeBasedRecommendations().slice(0, 2),
            personalized: this.getPersonalizedRecommendations().slice(0, 3),
            trending: this.getTrendingTracks().slice(0, 2),
            new: this.getNewReleases().slice(0, 1)
        };
    }
}
```

### 3.3 社区打卡系统

#### 数据模型

```javascript
// 用户打卡记录
CheckIns {
    id: string,
    userId: string,
    date: string, // YYYY-MM-DD
    categories: string[],
    totalDuration: number,
    tracksPlayed: number,
    timestamp: timestamp
}

// 打卡统计
CheckInStats {
    userId: string,
    totalDays: number,
    currentStreak: number,
    longestStreak: number,
    achievements: string[]
}
```

#### 打卡功能

```javascript
class CheckInSystem {
    async checkIn(userId, categoryKey, duration) {
        const today = new Date().toISOString().split('T')[0];

        const checkIn = {
            userId,
            date: today,
            categories: [categoryKey],
            totalDuration: duration,
            tracksPlayed: 1,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('checkIns')
            .doc(`${userId}_${today}`)
            .set(checkIn, { merge: true });

        // 更新统计
        await this.updateStats(userId);
    }

    async updateStats(userId) {
        const checkIns = await this.getUserCheckIns(userId);
        const streak = this.calculateStreak(checkIns);

        const stats = {
            userId,
            totalDays: checkIns.length,
            currentStreak: streak.current,
            longestStreak: streak.longest,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('checkInStats')
            .doc(userId)
            .set(stats, { merge: true });
    }
}
```

---

## Phase 4: 个性化和AI

### 4.1 心情选择器

```javascript
// 心情到音频的映射
const moodToCategory = {
    happy: ['Animal sounds', 'running water'],
    relaxed: ['meditation', 'Singing bowl sound'],
    sleepy: ['hypnosis', 'Rain'],
    anxious: ['Chakra', 'meditation'],
    focused: ['running water', 'Fire']
};

class MoodSelector {
    selectByMood(mood) {
        const categories = moodToCategory[mood] || ['meditation'];
        return this.getRandomTracksFromCategories(categories);
    }
}
```

### 4.2 混音配方保存

```javascript
class MixerPresets {
    async savePreset(userId, name, config) {
        const preset = {
            userId,
            name,
            config, // { tracks, volumes, settings }
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('mixerPresets')
            .add(preset);
    }

    async loadPresets(userId) {
        const snapshot = await firebase.firestore()
            .collection('mixerPresets')
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}
```

---

## Phase 5: 引导式课程系统

### 5.1 课程数据模型

```javascript
// 课程
Courses {
    id: string,
    title: string,
    description: string,
    duration: number, // days
    category: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    lessons: Lesson[],
    enrolledCount: number,
    completionRate: number
}

// 课程单元
Lesson {
    day: number,
    title: string,
    description: string,
    audioId: string,
    duration: number,
    type: 'audio' | 'video' | 'text',
    quiz: Quiz[]
}

// 用户课程进度
UserCourseProgress {
    userId: string,
    courseId: string,
    currentDay: number,
    completedDays: number[],
    startedAt: timestamp,
    lastAccessedAt: timestamp,
    notes: string[],
    completed: boolean
}
```

### 5.2 课程系统

```javascript
class CourseSystem {
    /**
     * 注册课程
     */
    async enrollCourse(userId, courseId) {
        const progress = {
            userId,
            courseId,
            currentDay: 1,
            completedDays: [],
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            completed: false
        };

        await firebase.firestore()
            .collection('userCourseProgress')
            .doc(`${userId}_${courseId}`)
            .set(progress);

        return progress;
    }

    /**
     * 完成某一天的课程
     */
    async completeLesson(userId, courseId, day) {
        const docRef = firebase.firestore()
            .collection('userCourseProgress')
            .doc(`${userId}_${courseId}`);

        await docRef.update({
            completedDays: firebase.firestore.FieldValue.arrayUnion(day),
            currentDay: day + 1,
            lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 检查是否完成整个课程
        const progress = await docRef.get();
        const data = progress.data();
        const course = await this.getCourse(courseId);

        if (data.completedDays.length >= course.duration) {
            await docRef.update({
                completed: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 颁发徽章
            await this.awardBadge(userId, courseId);
        }
    }

    /**
     * 颁发徽章
     */
    async awardBadge(userId, courseId) {
        const badge = {
            userId,
            courseId,
            type: 'course_completion',
            awardedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await firebase.firestore()
            .collection('badges')
            .add(badge);
    }
}
```

### 5.3 示例课程：21天睡眠改善计划

```javascript
const sleepImprovementCourse = {
    id: 'sleep-21-days',
    title: '21天睡眠改善计划',
    description: '通过声音疗愈改善睡眠质量',
    duration: 21,
    category: 'sleep',
    difficulty: 'beginner',
    lessons: [
        {
            day: 1,
            title: '了解睡眠科学',
            description: '学习睡眠的基本原理和重要性',
            audioId: 'sleep-science-intro',
            duration: 15,
            type: 'audio'
        },
        {
            day: 2,
            title: '睡前放松练习',
            description: '引导式放松冥想',
            audioId: 'bedtime-relaxation',
            duration: 20,
            type: 'audio'
        },
        // ... 19 more days
        {
            day: 21,
            title: '课程总结与未来计划',
            description: '回顾21天的收获',
            audioId: 'course-summary',
            duration: 15,
            type: 'audio'
        }
    ]
};
```

---

## 集成到主应用

### index.html 添加引用

```html
<!-- Phase 2: Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js"></script>

<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/firebase-auth.js"></script>
<script src="assets/js/cloud-sync-manager.js"></script>

<!-- Phase 3-5: 高级功能（按需加载） -->
<script src="assets/js/recommendation-engine-v2.js"></script>
<script src="assets/js/community-system.js"></script>
<script src="assets/js/course-system.js"></script>
```

### UI组件

#### 登录按钮
```html
<button id="authButton" onclick="window.firebaseAuthManager.openAuthDialog()">
    登录/注册
</button>

<div id="userProfile"></div>
```

#### 今日推荐板块
```html
<section class="daily-recommendations">
    <h3>📌 今日推荐</h3>
    <div id="recommendedTracks"></div>
</section>
```

#### 打卡日历
```html
<div class="check-in-calendar">
    <h3>🗓️ 打卡日历</h3>
    <div id="calendarGrid"></div>
    <div class="streak-info">
        <span>连续打卡: <strong id="currentStreak">0</strong> 天</span>
    </div>
</div>
```

#### 课程入口
```html
<section class="courses">
    <h3>📚 引导式课程</h3>
    <div class="course-grid">
        <div class="course-card" onclick="enrollCourse('sleep-21-days')">
            <h4>21天睡眠改善计划</h4>
            <p>通过声音疗愈改善睡眠质量</p>
        </div>
    </div>
</section>
```

---

## 数据库结构（Firestore）

```
soundflows-db/
├── users/                          # 用户数据
│   └── {userId}/
│       ├── favorites: []
│       ├── history: []
│       ├── preferences: {}
│       └── stats: {}
├── audioContributions/             # 用户上传的音频
│   └── {audioId}/
│       ├── userId
│       ├── title
│       ├── fileUrl
│       └── status
├── checkIns/                       # 打卡记录
│   └── {userId}_{date}/
│       ├── categories: []
│       └── duration
├── courses/                        # 课程
│   └── {courseId}/
│       ├── title
│       ├── lessons: []
│       └── enrolledCount
├── userCourseProgress/             # 用户课程进度
│   └── {userId}_{courseId}/
│       ├── currentDay
│       ├── completedDays: []
│       └── completed
└── badges/                         # 成就徽章
    └── {badgeId}/
        ├── userId
        ├── type
        └── awardedAt
```

---

## 安全规则（Firestore Security Rules）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 音频贡献：登录用户可上传，所有人可查看已审核的
    match /audioContributions/{audioId} {
      allow read: if resource.data.status == 'approved';
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               (request.auth.uid == resource.data.userId ||
                                request.auth.token.admin == true);
    }

    // 打卡记录：用户只能访问自己的
    match /checkIns/{checkInId} {
      allow read, write: if request.auth != null &&
                            checkInId.split('_')[0] == request.auth.uid;
    }

    // 课程：所有人可读，管理员可写
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // 用户课程进度：用户只能访问自己的
    match /userCourseProgress/{progressId} {
      allow read, write: if request.auth != null &&
                            progressId.split('_')[0] == request.auth.uid;
    }
  }
}
```

---

## 部署清单

### 1. Firebase项目设置
- [ ] 创建Firebase项目
- [ ] 启用Authentication（Google、Email）
- [ ] 启用Firestore数据库
- [ ] 启用Storage
- [ ] 配置安全规则
- [ ] 获取配置密钥

### 2. 代码集成
- [ ] 更新 `firebase-config.js` 配置
- [ ] 在 `index.html` 引入Firebase SDK
- [ ] 引入新的JS模块
- [ ] 添加UI组件

### 3. 测试
- [ ] 测试用户注册/登录
- [ ] 测试数据同步
- [ ] 测试推荐功能
- [ ] 测试课程系统

---

## 🎉 完成标准

- ✅ Phase 1: 视频背景和专注模式
- ✅ Phase 2: Firebase账号系统
- 📝 Phase 3: 社区和推荐（文档完成，待实施）
- 📝 Phase 4: AI和个性化（文档完成，待实施）
- 📝 Phase 5: 课程系统（文档完成，待实施）

**当前状态**: 核心架构完成，Phase 3-5可按需逐步实施

---

**最后更新**: 2025-10-12
**版本**: 2.0
