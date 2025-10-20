# 🔥 Firebase 配置指南 - 声音疗愈项目

**预计时间**: 10-15分钟
**费用**: 免费（Spark Plan）

---

## 📋 第一步：创建 Firebase 项目

### 1. 访问 Firebase 控制台
1. 打开浏览器，访问：https://console.firebase.google.com
2. 使用您的 Google 账号登录
3. 如果是新用户，可能需要接受服务条款

### 2. 创建新项目
1. 点击 **"添加项目"**（或 **"创建项目"**）
2. 项目信息：
   - **项目名称**: `sound-healing-app`（或您喜欢的名称）
   - **项目 ID**: 可以使用自动生成的（如：`sound-healing-app-12345`）
   - **地区**: 选择离您最近的地区（如：`asia-east1`）
3. 点击 **"继续"**
4. 选择是否启用 Google Analytics（可选，建议暂时关闭）
5. 点击 **"创建项目"**

### 3. 等待项目创建（约 30 秒）

---

## ⚙️ 第二步：配置 Web 应用

### 1. 注册您的 Web 应用
1. 项目创建后，在左侧菜单点击 **"Authentication"**
2. 在登录方法标签页下，点击 **"电子邮件/密码"**
3. 点击右上角的齿轮图标（设置）
4. 选择 **"常规"** 标签
5. 在 **"您的应用"** 部分，点击 **"Web 应用"**
6. **应用昵称**: `声音疗愈空间`
7. 点击 **"注册应用"**

### 2. 获取 Firebase 配置
1. 注册后会显示配置信息
2. 点击 **"继续到控制台"**
3. 在左侧菜单，选择 **项目概览**（齿轮图标）
4. 滚动到 **"您的应用"** 部分
5. 点击 Web 应用的配置
6. 点击 **"Firebase SDK 片段"**
7. 复制配置代码（我们只需要 firebaseConfig 部分）

---

## 🔑 第三步：更新项目配置

### 1. 打开 Firebase 配置文件
打开 `assets/js/firebase-config.js`

### 2. 替换配置信息
将以下内容：
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

替换为（示例，请使用您自己的值）：
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyCabcdefghijklmnopqrstuvwxyz",
    authDomain: "sound-healing-app.firebaseapp.com",
    projectId: "sound-healing-app-12345",
    storageBucket: "sound-healing-app-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## 🗄️ 第四步：设置 Firestore 数据库

### 1. 创建 Firestore 数据库
1. 在左侧菜单，点击 **"Firestore Database"**
2. 点击 **"创建数据库"**
3. 选择 **"以测试模式启动"**（推荐用于开发）
4. 点击 **"启用"**

### 2. 设置安全规则（重要！）
替换默认规则为：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许已认证用户读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 允许所有人读取公开数据（如音频元数据）
    match /public/{documentId} {
      allow read;
    }

    // 拒绝其他所有访问
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🚀 第五步：启用 Email 认证

### 1. 启用认证方式
1. 在左侧菜单，点击 **"Authentication"**
2. 点击 **"登录方法"**
3. 启用 **"电子邮件/密码"**
4. （可选）启用 Google、Facebook 等第三方登录

### 2. 设置模板（可选）
1. 点击 **"模板"** 标签
2. 启用 **"电子邮件验证"**
3. 编辑邮件模板（可选）

---

## 📦 第六步：引入 Firebase SDK

### 1. 在 index.html 中添加 Firebase SDK
找到 External JavaScript Files 部分（约第 270 行），添加：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js"></script>

<!-- Firebase 模块 -->
<script src="assets/js/firebase-config.js"></script>
<script src="assets/js/firebase-auth.js"></script>
```

### 2. 确保加载顺序正确
```
firebase-app.js → firebase-auth.js → firebase-firestore.js
```

---

## ✅ 第七步：测试配置

### 1. 测试用户注册
1. 重新加载您的网站
2. 查找登录按钮（应该在页面加载后出现）
3. 尝试注册一个测试账号
4. 验证邮箱并登录

### 2. 检查 Firebase 控制台
1. 在 Authentication 页面查看用户
2. 在 Firestore 查看数据是否保存

### 3. 调试技巧
打开浏览器控制台，查看这些日志：
- `✅ Firebase App 初始化成功`
- `✅ Firebase Auth 初始化成功`
- `用户登录成功: user@example.com`

---

## 🔧 常见问题解决

### 问题 1：配置错误
**错误信息**：`FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created - call Firebase.initializeApp()`
**解决**：检查是否正确引入了 Firebase SDK

### 问题 2：认证失败
**错误信息**：`auth/network-request-failed`
**解决**：检查网络连接，确保没有 ad blocker 阻止

### 问题 3：Firestore 权限错误
**错误信息**：`Missing or insufficient permissions`
**解决**：检查安全规则设置

### 问题 4：跨域问题
Firebase 会自动处理大多数跨域问题。

---

## 🎯 Firebase 功能使用示例

### 用户数据同步
```javascript
// 保存用户设置
await firebase.firestore().collection('users').doc(userId).set({
    preferences: {
        volume: 0.7,
        theme: 'dark',
        language: 'zh-CN'
    },
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
});
```

### 播放历史
```javascript
// 保存播放记录
await firebase.firestore().collection('users').doc(userId)
    .collection('playHistory')
    .add({
        trackId: 'meditation-audio-1',
        playedAt: firebase.firestore.FieldValue.serverTimestamp(),
        duration: 300
    });
```

### 离线支持
Firebase 会自动缓存数据，支持离线访问。

---

## 📊 监控使用量

1. **Firebase 控制台 → 使用情况标签**
   - 实时查看各项服务的使用量
   - 设置预算告警（可选）

2. **免费额度提醒**
   - 接近限制时会收到邮件通知
   - 可以设置每日/每月预算

---

## ✅ 配置完成清单

- [ ] 创建 Firebase 项目
- [ ] 注册 Web 应用
- [ ] 更新 firebase-config.js
- [ ] 创建 Firestore 数据库
- [ ] 设置安全规则
- [ ] 启用 Email 认证
- [ ] 引入 Firebase SDK
- [ ] 测试用户注册登录

---

## 🎉 恭喜！

您的声音疗愈网站现在已经具备了：
- ✅ 用户认证系统
- ✅ 云端数据存储
- ✅ 跨设备同步
- ✅ 免费额度（足够满足需求）

现在您可以：
1. 让用户注册账号
2. 保存播放历史和收藏
3. 在不同设备上同步数据
4. 提供个性化体验

需要我帮您测试配置或解决任何问题吗？