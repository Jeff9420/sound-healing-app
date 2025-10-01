# Google Analytics 4 Measurement ID 获取指南

## 目录
1. [准备工作](#准备工作)
2. [登录 Google Analytics](#登录-google-analytics)
3. [查找或创建媒体资源](#查找或创建媒体资源)
4. [获取 Measurement ID](#获取-measurement-id)
5. [验证 ID 是否正确](#验证-id-是否正确)
6. [常见问题](#常见问题)

---

## 准备工作

在开始之前，请确保您具备以下条件：

- 一个有效的 Google 账户
- 访问 [Google Analytics](https://analytics.google.com/) 的权限
- 如果您要为新网站设置，需要网站的 URL

---

## 登录 Google Analytics

### 步骤 1：访问 Google Analytics
1. 打开浏览器，访问 [https://analytics.google.com](https://analytics.google.com)

2. 点击右上角的"登录"按钮

![登录页面](https://via.placeholder.com/800x400?text=Google+Analytics+Login+Page)

3. 使用您的 Google 账户登录

---

## 查找或创建媒体资源

### 情况一：已有媒体资源

1. **登录后查看媒体资源列表**
   - 登录后，您会看到左侧的媒体资源列表
   - 每个网站或应用对应一个媒体资源

2. **选择正确的媒体资源**
   - 找到您要使用的网站对应的媒体资源
   - 点击媒体资源名称进入管理界面

### 情况二：创建新媒体资源

1. **点击创建按钮**
   - 在媒体资源列表下方，点击"创建媒体资源"

2. **填写媒体资源信息**
   ```
   媒体资源名称：输入您的网站名称（如：声音疗愈网站）
   报告时区：选择"中国标准时间"
   货币：选择"人民币(CNY)"
   ```

3. **填写业务信息**
   - 行业类别：选择"艺术与娱乐"
   - 企业规模：根据实际情况选择
   - 点击"创建"

---

## 获取 Measurement ID

### 方法一：通过媒体资源设置获取

1. **进入管理界面**
   - 点击左下角的"管理"齿轮图标

2. **导航到数据流**
   - 在中间列"媒体资源"下，点击"数据流"
   - 这会显示所有数据流（网站、iOS应用、Android应用）

3. **找到 Measurement ID**
   - 点击您的网站数据流
   - Measurement ID 显示在页面顶部
   - 格式为：`G-XXXXXXXXXX`

![Measurement ID 位置](https://via.placeholder.com/600x300?text=Measurement+ID+Location)

### 方法二：通过全局网站代码获取

1. 在同一页面，向下滚动找到"全局网站代码(gtag.js)"部分
2. Measurement ID 也出现在代码中：
   ```javascript
   gtag('config', 'G-XXXXXXXXXX');
   ```

---

## 验证 ID 是否正确

### 验证方法一：查看 ID 格式

Google Analytics 4 的 Measurement ID 必须符合以下格式：
- 以"G-"开头
- 后跟10个字符（数字和字母组合）
- 示例：`G-1A2B3C4D5E`

### 验证方法二：检查实时数据

1. 在 Google Analytics 左侧菜单中，点击"报告"
2. 在报告页面，点击"实时"
3. 访问您的网站（如果已安装跟踪代码）
4. 在实时报告中看到"过去30分钟内的用户数"大于0，说明ID有效

### 验证方法三：使用 Google Tag Assistant

1. 安装 [Google Tag Assistant](https://tagassistant.google.com/) 扩展程序
2. 访问您的网站
3. 点击 Tag Assistant 图标
4. 查看是否检测到正确的 GA4 标签

---

## 在声音疗愈网站中配置

获取 Measurement ID 后，请在以下位置添加：

1. **在 `assets/js/app.js` 中**
   ```javascript
   // 在文件开头或适当位置添加
   const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // 替换为您的实际ID
   ```

2. **在 HTML 文件中添加 Google Analytics 代码**
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 常见问题

### Q: 我的 Measurement ID 显示为 "UA-" 开头，怎么办？
A: 这是旧版的 Google Analytics ID。您需要创建新的 GA4 媒体资源才能获取以"G-"开头的 Measurement ID。

### Q: 我没有权限访问 Google Analytics 怎么办？
A: 您需要联系网站管理员，要求他们授予您访问权限，或者请他们提供 Measurement ID。

### Q: 为什么我看不到数据流选项？
A: 确保您选择了正确的媒体资源。GA4 媒体资源才会显示数据流选项。

### Q: Measurement ID 可以在多个网站使用吗？
A: 不可以，每个网站应该使用独立的 Measurement ID 以确保数据准确性。

---

## 快速检查清单

在完成设置后，请确认以下事项：

- [ ] Measurement ID 格式为 `G-XXXXXXXXXX`
- [ ] 已将代码添加到网站的 `<head>` 部分
- [ ] 使用 Google Tag Assistant 确认代码正确加载
- [ ] 在 Google Analytics 实时报告中能看到访问数据
- [ ] 所有页面的 URL 都正确跟踪

---

## 联系支持

如果您在获取 Measurement ID 过程中遇到任何问题，可以访问：
- [Google Analytics 帮助中心](https://support.google.com/analytics)
- [Google Analytics 社区论坛](https://support.google.com/analytics/community)

---

*最后更新：2025年9月29日*