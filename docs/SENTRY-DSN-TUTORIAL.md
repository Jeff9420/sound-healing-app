# Sentry DSN 获取详细教程

## 步骤 1：注册/登录 Sentry 账户

### 访问 Sentry
1. 打开浏览器，访问 [https://sentry.io](https://sentry.io)
2. 点击右上角的 **"Sign Up"**（注册）或 **"Log In"**（登录）

### 注册新账户（如果没有账户）
1. 输入邮箱地址
2. 设置密码
3. 选择 **"I am an individual"**（个人使用）或 **"I am using this for my company"**（公司使用）
4. 点击 **"Create Account"**
5. 检查邮箱并验证账户

## 步骤 2：创建新项目

### 创建项目流程
1. 登录后，您会看到欢迎页面
2. 点击 **"Create Project"** 或 **"New Project"** 按钮
3. 选择平台：选择 **"JavaScript"**
4. 点击 **"Create Project"**

### 填写项目信息
1. **Team**：选择或创建团队（个人使用可选择默认）
2. **Project Name**：输入项目名称，例如：
   - `sound-healing-web`
   - `soundflows-app`
   - `meditation-app`
3. 点击 **"Create Project"**

## 步骤 3：获取 DSN（Data Source Name）

### 找到 DSN
创建项目后，Sentry 会显示设置向导：

1. **在设置向导中**
   - 找到 **"Set up your client"** 部分
   - 您会看到类似这样的 DSN：
   ```
   https://5f5292b3a1c54d3e8e5e6f7a8b9c0d1e@o4505811234567890.ingest.sentry.io/4505811234567890
   ```

2. **如果没有显示设置向导**
   - 点击项目名称进入项目
   - 在左侧菜单点击 **"Settings"**（齿轮图标）
   - 在左侧导航栏找到 **"Client Keys (DSN)"**
   - 您会看到 DSN 列表

### DSN 格式说明
```
https://{public_key}@{host}/{path}
```

示例：
```
https://5f5292b3a1c54d3e8e5e6f7a8b9c0d1e@o4505811234567890.ingest.sentry.io/4505811234567890
```

## 步骤 4：配置项目到您的应用

### 更新配置文件
1. 打开 `assets/js/sentry-error-tracking.js`
2. 找到第 12 行的 DSN 配置
3. 将您的真实 DSN 替换进去

```javascript
// 原来的配置
dsn: 'https://5f5292b3a1c54d3e8e5e6f7a8b9c0d1e@o4505811234567890.ingest.sentry.io/4505811234567890',

// 替换为您的真实 DSN
dsn: 'https://YOUR_REAL_DSN_HERE',
```

## 步骤 5：配置项目设置

### 设置环境
1. 在项目 Settings 中，找到 **"Environments"**
2. 添加环境：
   - `production`（生产环境）
   - `development`（开发环境）
   - `staging`（测试环境，可选）

### 配置告警
1. 在左侧菜单点击 **"Alerts"**
2. 点击 **"Create Alert Rule"**
3. 设置告警规则：
   - **Issue frequency**（错误频率）
   - **Number of users affected**（受影响用户数）
   - **Performance issues**（性能问题）

### 设置采样率（可选）
1. 在 Settings 中找到 **"Sampling"**
2. 配置采样率：
   - **Error sampling**: 100%（推荐）
   - **Transaction sampling**: 10%（生产环境推荐）

## 步骤 6：测试配置

### 方法 1：使用测试页面
1. 打开 `sentry-test.html`
2. 点击 **"检查 Sentry 初始化状态"**
3. 如果显示 "✅ Sentry 已成功初始化"，说明配置成功

### 方法 2：手动触发错误
1. 打开您的网站
2. 在浏览器控制台执行：
```javascript
// 触发一个测试错误
window.trackError(new Error('Sentry DSN 测试'), {
    test: true,
    timestamp: new Date().toISOString()
});
```

### 方法 3：查看 Sentry 控制台
1. 登录 Sentry.io
2. 进入您的项目
3. 点击 **"Issues"**
4. 您应该能看到测试错误

## 常见问题解决

### 问题 1：Sentry 未接收到错误

**原因：**
- DSN 配置错误
- 网络连接问题
- 跨域问题

**解决方案：**
1. 检查 DSN 是否正确复制
2. 确保网站通过 HTTP/HTTPS 访问，不是 file://
3. 检查浏览器控制台是否有错误

### 问题 2：DSN 格式错误

**正确格式：**
```
https://{public_key}@{host}/{project_id}
```

**常见错误：**
- 缺少 `https://`
- 缺少 `@`
- 多余的引号
- 包含空格

### 问题 3：CORS 错误

**解决方案：**
在 Sentry 项目设置中：
1. Settings > Security & Privacy
2. 在 **"Allowed Domains"** 中添加您的域名：
   - `localhost`
   - `127.0.0.1`
   - `soundflows.app`

### 问题 4：权限问题

**错误信息：**
``{"error":"invalid_api_key"}```

**解决方案：**
1. 重新生成 DSN
2. 确保使用的是正确的项目 DSN
3. 检查 API 密钥权限

## 高级配置

### 自定义标签
在 `sentry-error-tracking.js` 中添加更多标签：

```javascript
window.Sentry.setTag({
    platform: navigator.platform,
    language: navigator.language,
    theme: localStorage.getItem('theme') || 'light',
    audioSupported: !!AudioContext,
    webglSupported: !!window.WebGLRenderingContext
});
```

### 自定义上下文
添加额外的上下文信息：

```javascript
window.Sentry.setContext("application", {
    version: "3.0.0",
    buildNumber: "20251023-001",
    audioCount: Object.keys(AUDIO_CONFIG).length
});
```

### 过滤错误
添加 `beforeSend` 过滤器：

```javascript
beforeSend: function(event, hint) {
    // 忽略某些错误
    if (event.exception) {
        const error = event.exception.values[0];
        if (error.type === 'ResizeObserver loop limit exceeded') {
            return null; // 不发送此错误
        }
    }
    return event;
}
```

## 生产环境最佳实践

### 1. 环境变量配置
考虑使用环境变量管理 DSN：

```javascript
const SENTRY_DSN = process.env.SENTRY_DSN || 'your-dsn-here';
```

### 2. 错误分组
在错误中添加指纹以更好地分组：

```javascript
window.Sentry.configureScope(scope => {
    scope.setFingerprint(['audio-error', errorCategory]);
});
```

### 3. 版本管理
确保每个版本都有唯一的 release 名称：

```javascript
release: 'soundflows@' + VERSION + '-' + BUILD_DATE
```

## 联系支持

如果遇到问题：

1. **Sentry 文档**：https://docs.sentry.io/
2. **Sentry 支持**：support@sentry.io
3. **社区论坛**：https://forum.sentry.io/

## 快速参考

**DSSN 位置：**
- 项目 > Settings > Client Keys (DSN)

**常用链接：**
- Sentry 登录：https://sentry.io
- 创建项目：https://sentry.io/organizations/new/
- 文档：https://docs.sentry.io/

**测试命令：**
```javascript
// 检查 Sentry 是否加载
console.log(window.Sentry);

// 发送测试错误
window.Sentry.captureException(new Error('测试'));
```

完成以上步骤后，您的 Sentry 错误追踪系统就完全配置好了！