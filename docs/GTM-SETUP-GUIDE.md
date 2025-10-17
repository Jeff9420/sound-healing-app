# 🏷️ Google Tag Manager (GTM) 配置指南

**项目**: SoundFlows 声音疗愈平台
**预计时间**: 20-30 分钟
**难度**: ⭐⭐☆☆☆ 简单

---

## 📋 目标

配置 GTM 来追踪以下自定义事件：

### 1. 方案提交事件
- `plan_submit` - 用户提交7日定制方案表单
- `plan_submit_success` - 提交成功
- `plan_automation_success` - 营销自动化触发成功
- `plan_automation_failure` - 营销自动化触发失败

### 2. 资源订阅事件
- `resources_subscribe_submit` - 用户提交资源订阅
- `resources_subscribe_success` - 订阅成功
- `resources_subscribe_automation_success` - 自动化成功
- `resources_subscribe_automation_failure` - 自动化失败

### 3. 内容互动事件
- `content_detail_click` - 点击内容详情
- `content_cta_click` - 点击内容 CTA
- `content_conversion` - 内容转化

---

## 第一步: 创建 GTM 账号和容器

### 1. 创建 GTM 账号

1. **访问 GTM 网站**:
   - 打开浏览器，访问: https://tagmanager.google.com
   - 使用您的 Google 账号登录

2. **创建账号**:
   - 点击 **"创建账号"** 或 **"Create Account"** 按钮
   - 填写账号信息：
     - **账号名称**: `SoundFlows` 或 `声音疗愈`
     - **国家/地区**: 选择您的国家
     - 勾选 **"与 Google 及其他方分享数据"**（可选）
   - 点击 **"继续"** 或 **"Continue"**

### 2. 创建容器（Container）

1. **容器设置**:
   - **容器名称**: `soundflows.app` 或 `声音疗愈网站`
   - **目标平台**: 选择 **"网页"** 或 **"Web"**（重要！）
   - 点击 **"创建"** 或 **"Create"**

2. **接受服务条款**:
   - 阅读 Google Tag Manager 服务条款
   - 勾选 **"是"** 同意 GDPR 和条款
   - 点击 **"确定"** 或 **"Yes"**

3. **获取容器代码**:
   - 创建后会弹出 **"安装 Google Tag Manager"** 窗口
   - 您会看到两段代码：
     ```html
     <!-- Google Tag Manager -->
     <script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
     <!-- End Google Tag Manager -->

     <!-- Google Tag Manager (noscript) -->
     <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"...></iframe></noscript>
     <!-- End Google Tag Manager (noscript) -->
     ```
   - **记下您的容器 ID**: `GTM-XXXXXX`（例如 `GTM-ABC123`）
   - **暂时不要关闭这个窗口**，我们稍后会需要这些代码

---

## 第二步: 配置自定义事件触发器（Triggers）

### 触发器 1: 方案提交相关

#### 1.1 创建 `plan_submit` 触发器

1. **进入触发器页面**:
   - 点击左侧菜单 **"触发器"** 或 **"Triggers"**
   - 点击右上角 **"新建"** 或 **"New"**

2. **配置触发器**:
   - 点击顶部的触发器名称区域，输入: `CE - plan_submit`
   - 点击触发器配置区域

3. **选择触发器类型**:
   - 选择 **"自定义事件"** 或 **"Custom Event"**

4. **配置事件名称**:
   - **事件名称**: 输入 `plan_submit`
   - **使用正则表达式匹配**: 不勾选
   - **此触发器的触发条件**: 选择 **"所有自定义事件"**

5. **保存**:
   - 点击右上角 **"保存"** 或 **"Save"**

#### 1.2 创建其他方案提交触发器

重复以上步骤，创建以下触发器：

| 触发器名称 | 事件名称 |
|-----------|---------|
| `CE - plan_submit_success` | `plan_submit_success` |
| `CE - plan_automation_success` | `plan_automation_success` |
| `CE - plan_automation_failure` | `plan_automation_failure` |

### 触发器 2: 资源订阅相关

创建以下触发器（步骤同上）：

| 触发器名称 | 事件名称 |
|-----------|---------|
| `CE - resources_subscribe_submit` | `resources_subscribe_submit` |
| `CE - resources_subscribe_success` | `resources_subscribe_success` |
| `CE - resources_subscribe_automation_success` | `resources_subscribe_automation_success` |
| `CE - resources_subscribe_automation_failure` | `resources_subscribe_automation_failure` |

### 触发器 3: 内容互动相关

创建以下触发器（步骤同上）：

| 触发器名称 | 事件名称 |
|-----------|---------|
| `CE - content_detail_click` | `content_detail_click` |
| `CE - content_cta_click` | `content_cta_click` |
| `CE - content_conversion` | `content_conversion` |

**完成后，您应该有 11 个自定义事件触发器**。

---

## 第三步: 创建数据层变量（Data Layer Variables）

### 为什么需要数据层变量？

数据层变量用于捕获事件中的参数（如用户目标、内容分类等），这些参数会被传递到 GA4。

### 变量 1: goal（用户目标）

1. **进入变量页面**:
   - 点击左侧菜单 **"变量"** 或 **"Variables"**
   - 滚动到 **"用户定义的变量"** 部分
   - 点击 **"新建"** 或 **"New"**

2. **配置变量**:
   - 变量名称: `DLV - goal`
   - 点击变量配置区域
   - 选择变量类型: **"数据层变量"** 或 **"Data Layer Variable"**

3. **数据层变量设置**:
   - **数据层变量名称**: 输入 `goal`
   - **数据层版本**: 选择 **"版本 2"**
   - **设置默认值**: 留空（可选）

4. **保存**

### 变量 2-4: 其他参数变量

重复以上步骤，创建以下变量：

| 变量名称 | 数据层变量名称 | 说明 |
|---------|---------------|------|
| `DLV - content_category` | `content_category` | 内容分类 |
| `DLV - crm_status` | `crm_status` | CRM状态 |
| `DLV - automation_status` | `automation_status` | 自动化状态 |

**完成后，您应该有 4 个数据层变量**。

---

## 第四步: 创建 GA4 事件代码（Tags）

### 代码 1: plan_submit 事件

1. **进入代码页面**:
   - 点击左侧菜单 **"代码"** 或 **"Tags"**
   - 点击右上角 **"新建"** 或 **"New"**

2. **配置代码名称**:
   - 代码名称: `GA4 Event - plan_submit`

3. **配置代码类型**:
   - 点击 **"代码配置"** 区域
   - 选择 **"Google Analytics: GA4 事件"** 或 **"Google Analytics: GA4 Event"**

4. **配置 GA4 设置**:
   - **配置代码**: 选择 **"Google 代码"** 或 **"Google Tag"**
   - **代码 ID**: 输入您的 GA4 测量 ID: `G-4NZR3HR3J1`

5. **配置事件名称**:
   - **事件名称**: 输入 `plan_submit`

6. **添加事件参数**:
   - 点击 **"事件参数"** 下的 **"添加行"**
   - 添加以下参数：

   | 参数名称 | 值 |
   |---------|---|
   | `goal` | `{{DLV - goal}}` |

   **如何添加**:
   - 参数名称列: 输入 `goal`
   - 值列: 点击输入框右侧的 **"+"** 图标 → 选择 **"DLV - goal"** 变量

7. **配置触发器**:
   - 点击 **"触发条件"** 区域
   - 选择之前创建的触发器: `CE - plan_submit`

8. **保存**

### 代码 2-11: 其他事件代码

重复以上步骤，创建以下代码：

#### 方案提交相关代码

| 代码名称 | 事件名称 | 事件参数 | 触发器 |
|---------|---------|---------|-------|
| `GA4 Event - plan_submit_success` | `plan_submit_success` | `goal`: `{{DLV - goal}}`<br>`crm_status`: `{{DLV - crm_status}}` | `CE - plan_submit_success` |
| `GA4 Event - plan_automation_success` | `plan_automation_success` | `goal`: `{{DLV - goal}}`<br>`automation_status`: `{{DLV - automation_status}}` | `CE - plan_automation_success` |
| `GA4 Event - plan_automation_failure` | `plan_automation_failure` | `goal`: `{{DLV - goal}}`<br>`automation_status`: `{{DLV - automation_status}}` | `CE - plan_automation_failure` |

#### 资源订阅相关代码

| 代码名称 | 事件名称 | 事件参数 | 触发器 |
|---------|---------|---------|-------|
| `GA4 Event - resources_subscribe_submit` | `resources_subscribe_submit` | 无参数 | `CE - resources_subscribe_submit` |
| `GA4 Event - resources_subscribe_success` | `resources_subscribe_success` | `crm_status`: `{{DLV - crm_status}}` | `CE - resources_subscribe_success` |
| `GA4 Event - resources_subscribe_automation_success` | `resources_subscribe_automation_success` | `automation_status`: `{{DLV - automation_status}}` | `CE - resources_subscribe_automation_success` |
| `GA4 Event - resources_subscribe_automation_failure` | `resources_subscribe_automation_failure` | `automation_status`: `{{DLV - automation_status}}` | `CE - resources_subscribe_automation_failure` |

#### 内容互动相关代码

| 代码名称 | 事件名称 | 事件参数 | 触发器 |
|---------|---------|---------|-------|
| `GA4 Event - content_detail_click` | `content_detail_click` | `content_category`: `{{DLV - content_category}}` | `CE - content_detail_click` |
| `GA4 Event - content_cta_click` | `content_cta_click` | `content_category`: `{{DLV - content_category}}` | `CE - content_cta_click` |
| `GA4 Event - content_conversion` | `content_conversion` | `content_category`: `{{DLV - content_category}}` | `CE - content_conversion` |

**完成后，您应该有 11 个 GA4 事件代码**。

---

## 第五步: 预览和测试

### 1. 进入预览模式

1. **点击预览按钮**:
   - 点击 GTM 界面右上角的 **"预览"** 或 **"Preview"** 按钮

2. **连接您的网站**:
   - 在弹出窗口中输入: `https://www.soundflows.app`
   - 点击 **"连接"** 或 **"Connect"**

3. **查看 Tag Assistant**:
   - 会打开一个新窗口，显示 Tag Assistant Connected
   - 您的网站会在新标签页中打开

### 2. 测试事件触发

在您的网站上执行以下操作：

1. **测试方案提交**:
   - 在网站上找到 "7日定制冥想计划" 表单
   - 填写表单并提交
   - 在 Tag Assistant 中查看是否触发了 `plan_submit` 事件

2. **检查触发的代码**:
   - 在 Tag Assistant 左侧事件列表中，点击 `plan_submit` 事件
   - 右侧应显示 **"Tags Fired"**（已触发的代码）
   - 应该能看到 `GA4 Event - plan_submit` 代码

3. **检查变量值**:
   - 点击 `GA4 Event - plan_submit` 代码
   - 展开 **"Event Parameters"**
   - 检查 `goal` 参数是否有值

### 3. 调试问题

**如果代码未触发**:
1. 检查触发器是否正确配置
2. 确认事件名称拼写正确
3. 查看 Tag Assistant 中的错误信息

**如果参数为空**:
1. 检查数据层变量名称是否正确
2. 确认网站代码中正确推送了数据到 dataLayer

---

## 第六步: 发布容器

### 1. 退出预览模式

- 点击 Tag Assistant 窗口右上角的 **"退出预览模式"** 或 **"Exit preview mode"**

### 2. 发布更改

1. **提交更改**:
   - 回到 GTM 界面
   - 点击右上角的 **"提交"** 或 **"Submit"** 按钮

2. **填写版本信息**:
   - **版本名称**: 输入 `v1 - 初始配置 - 11个自定义事件`
   - **版本说明**: 输入详细说明
     ```
     配置了以下自定义事件追踪：
     - 方案提交事件 (4个)
     - 资源订阅事件 (4个)
     - 内容互动事件 (3个)

     包含 11 个触发器、4 个数据层变量、11 个 GA4 事件代码。
     ```

3. **发布**:
   - 点击右上角的 **"发布"** 或 **"Publish"** 按钮

**🎉 恭喜！您的 GTM 容器已发布到生产环境！**

---

## 第七步: 安装 GTM 代码到网站

### 获取容器代码

1. 在 GTM 界面，点击右上角的容器 ID（如 `GTM-XXXXXX`）
2. 选择 **"安装 Google Tag Manager"**
3. 复制两段代码

### 代码说明

您需要添加两段代码到 `index.html`:

**代码 1**: 添加到 `<head>` 部分（尽可能靠前）
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
<!-- End Google Tag Manager -->
```

**代码 2**: 添加到 `<body>` 开始标签之后
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

**⚠️ 请把 `GTM-XXXXXX` 替换成您实际的容器 ID！**

---

## 第八步: 更新 CSP 策略

GTM 需要访问以下域名，需要更新 `vercel.json` 的 CSP 配置：

在 `vercel.json` 的 `Content-Security-Policy` 中添加：

- **script-src**: 添加 `https://www.googletagmanager.com`
- **connect-src**: 添加 `https://www.googletagmanager.com`
- **img-src**: 已有 `https://www.google-analytics.com`（无需修改）

---

## ✅ 完成检查清单

完成所有配置后，检查以下项目：

### GTM 配置
- [ ] GTM 账号已创建
- [ ] GTM 容器已创建（容器 ID: GTM-XXXXXX）
- [ ] 11 个自定义事件触发器已创建
- [ ] 4 个数据层变量已创建
- [ ] 11 个 GA4 事件代码已创建
- [ ] 预览模式测试通过
- [ ] 容器已发布到生产环境

### 网站代码
- [ ] GTM `<head>` 代码已添加到 index.html
- [ ] GTM `<noscript>` 代码已添加到 index.html
- [ ] vercel.json CSP 已更新
- [ ] 代码已提交到 GitHub
- [ ] Vercel 已自动部署

### 验证
- [ ] 访问网站，打开浏览器控制台
- [ ] 执行表单提交操作
- [ ] 控制台中能看到 dataLayer.push() 调用
- [ ] GTM Tag Assistant 显示事件已触发
- [ ] GA4 实时报告中能看到事件

---

## 🔍 验证 GTM 是否正常工作

### 方法 1: 浏览器控制台

1. 打开网站: https://www.soundflows.app
2. 打开浏览器开发者工具（F12）
3. 在控制台输入: `window.dataLayer`
4. 应该能看到 dataLayer 数组

### 方法 2: GTM Tag Assistant

1. 安装 Chrome 扩展: **Tag Assistant Legacy**
2. 访问您的网站
3. 点击扩展图标
4. 应该能看到 GTM 容器已加载

### 方法 3: GA4 实时报告

1. 登录 GA4: https://analytics.google.com
2. 导航到: **报告** → **实时**
3. 在网站上触发事件（提交表单）
4. 应该能在 GA4 实时报告中看到自定义事件

---

## 📚 参考资源

- **GTM 官方文档**: https://support.google.com/tagmanager
- **GTM 快速入门**: https://support.google.com/tagmanager/answer/6103696
- **GA4 事件配置**: https://support.google.com/analytics/answer/9267735

---

**创建日期**: 2025-10-17
**维护者**: SoundFlows Analytics Team
**预计完成时间**: 20-30 分钟
