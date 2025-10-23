# HubSpot CRM 集成配置指南

## 概述

您的项目已经配置了 HubSpot CRM 集成，用于：
- 收集资源订阅表单
- 收集 7 日冥想计划申请
- 自动化邮件营销

## 当前配置状态

### ✅ 已配置
- **Portal ID**: 244150644
- **资源订阅表单 GUID**: ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4
- **冥想计划表单 GUID**: ec666460-ee7c-4057-97a6-d6f1fdd9c061
- **CRM Bridge**: `assets/js/crm-bridge.js` 已配置

### 📍 下一步操作

1. **验证 HubSpot 表单存在**
2. **创建 HubSpot Workflows 自动化**
3. **测试表单提交**
4. **监控数据流入**

## HubSpot 设置步骤

### 步骤 1: 验证 HubSpot 账户

1. 登录 [HubSpot](https://app.hubspot.com)
2. 确认 Portal ID 为 `244150644`
   - 在 Settings > Account Defaults 中查看
3. 确认您有 Marketing Hub Starter（免费）或更高版本

### 步骤 2: 创建或验证表单

#### 资源订阅表单
1. 导航到 **Marketing > Forms**
2. 查找表单 GUID: `ce1bb1ff-0230-4f9b-bf4c-ea92ca4962f4`
   - 如果不存在，创建新表单
3. 表单字段配置：
   ```
   必需字段:
   - email (Email)

   可选字段:
   - firstname (Single-line text)
   - lastname (Single-line text)
   - company (Single-line text)
   ```

#### 冥想计划表单
1. 创建新表单或查找 GUID: `ec666460-ee7c-4057-97a6-d6f1fdd9c061`
2. 表单字段配置：
   ```
   必需字段:
   - email (Email)
   - name (Single-line text) - 或 firstname + lastname
   - goal (Dropdown/Radio)
     * 睡眠质量 (sleep)
     * 专注效率 (focus)
     * 缓解焦虑 (stress)
     * 冥想习惯 (mindfulness)
   - time (Dropdown/Radio)
     * 5-10分钟 (5-10)
     * 10-20分钟 (10-20)
     * 20-30分钟 (20-30)
     * 30分钟以上 (30+)
   ```

### 步骤 3: 创建 HubSpot Workflows（自动化邮件）

#### 创建 7 日冥想计划 Workflow

1. **导航到 Automation > Workflows**
2. **点击 "Create workflow"**
3. **选择 "Contact-based"**
4. **设置触发条件**：
   ```
   IF form submission EQUALS [冥想计划表单名称]
   ```

5. **添加 Action 步骤**：

   **Day 0 - 立即发送**：
   - 内部通知：通知团队新计划申请
   - 营销邮件：欢迎邮件 + 计划概览

   **Day 1 - 等待 1 天**：
   - 营销邮件：Day 1 练习指引
   - 内容：根据他们的目标推荐音频

   **Day 2 - 等待 1 天**：
   - 营销邮件：Day 2 练习
   - 内容：进度跟踪提醒

   **Day 3-6 - 每天发送**：
   - 营销邮件：持续练习指引
   - 内容：个性化建议

   **Day 7 - 等待 1 天**：
   - 营销邮件：总结 + 下一步
   - 内容：完成祝贺 + 进阶建议

#### 创建资源订阅 Workflow

1. **创建新 Workflow**
2. **触发条件**：
   ```
   IF form submission EQUALS [资源订阅表单名称]
   ```

3. **Action**：
   - 添加到 "Website Subscriber" 列表
   - 发送欢迎邮件（可选）
   - 设置标签："website-subscriber"

### 步骤 4: 配置表单属性

1. **导航到 Settings > Properties**
2. **创建自定义属性**（如果不存在）：
   ```
   meditation_goal (Dropdown)
   - sleep: 睡眠质量
   - focus: 专注效率
   - stress: 缓解焦虑
   - mindfulness: 冥想习惯

   preferred_time (Dropdown)
   - 5-10: 5-10分钟
   - 10-20: 10-20分钟
   - 20-30: 20-30分钟
   - 30+: 30分钟以上
   ```

### 步骤 5: 测试集成

#### 方法 1: 使用测试页面
1. 打开 `crm-test.html`
2. 填写测试表单
3. 检查 HubSpot 是否收到数据

#### 方法 2: 使用浏览器控制台
```javascript
// 测试冥想计划提交
window.crmBridge.sendToCrm(window.SITE_CONFIG.planEndpoint, {
    email: 'test@example.com',
    name: '测试用户',
    goal: 'stress',
    time: '10-20',
    event: 'plan_submit',
    form_name: 'conversionOffer'
});

// 测试资源订阅
window.crmBridge.sendToCrm(window.SITE_CONFIG.subscribeEndpoint, {
    email: 'subscriber@example.com',
    name: '订阅用户',
    event: 'resources_subscribe',
    form_name: 'contentHub'
});
```

### 步骤 6: 验证数据

1. **在 HubSpot 中查看**：
   - 导航到 **Contacts > All contacts**
   - 搜索测试邮箱
   - 确认联系人已创建

2. **查看表单提交**：
   - 导航到 **Marketing > Forms**
   - 选择表单
   - 查看 **Submissions** 标签

3. **检查 Workflow 活动**：
   - 导航到 **Automation > Workflows**
   - 查看已注册的联系人
   - 确认邮件已发送

## 监控和维护

### 每周检查
- [ ] 查看表单提交数量
- [ ] 检查 Workflow 执行率
- [ ] 查看邮件打开率
- [ ] 处理失败的提交

### 每月优化
- [ ] 优化邮件标题
- [ ] 测试不同发送时间
- [ ] 分析转化率
- [ ] 更新邮件内容

## 故障排除

### 表单提交失败

**错误：400 Bad Request**
- 检查表单 GUID 是否正确
- 确认所有必需字段都已提交
- 验证字段名称匹配

**错误：401 Unauthorized**
- 检查 Portal ID 是否正确
- 确认表单已发布

**错误：404 Not Found**
- 表单 GUID 不存在
- 表单未发布或已删除

### Workflow 未触发

1. 检查触发条件设置
2. 确认表单名称匹配
3. 查看 Workflow 中的错误日志
4. 确认联系人未被其他 Workflow 排除

### 邮件未发送

1. 检查 HubSpot 邮件发送配额
2. 确认联系人已验证邮箱
3. 查看邮件发送历史
4. 检查是否被标记为垃圾邮件

## 高级配置

### 添加生命周期阶段
```javascript
// 在 crm-bridge.js 中添加
if (endpointType === 'hubspot') {
    body.fields.push({
        name: 'lifecyclestage',
        value: 'lead' // subscriber, lead, marketingqualifiedlead, etc.
    });
}
```

### 添加来源追踪
```javascript
// 自动添加 UTM 参数
const urlParams = new URLSearchParams(window.location.search);
const utmSource = urlParams.get('utm_source') || 'website';
const utmMedium = urlParams.get('utm_medium') || 'form';
const utmCampaign = urlParams.get('utm_campaign') || '';

// 添加到提交数据
fields.push(
    { name: 'utm_source', value: utmSource },
    { name: 'utm_medium', value: utmMedium },
    { name: 'utm_campaign', value: utmCampaign }
);
```

## 相关文件

- `assets/js/config.js` - CRM 配置
- `assets/js/crm-bridge.js` - CRM 桥接逻辑
- `assets/js/email-automation.js` - 邮件自动化
- `crm-test.html` - CRM 测试页面
- `docs/CRM-EMAIL-INTEGRATION-GUIDE.md` - 完整集成指南

## 联系支持

如果您在配置过程中遇到问题：
1. HubSpot 帮助中心：https://help.hubspot.com/
2. 开发者文档：https://developers.hubspot.com/
3. 检查浏览器控制台错误
4. 使用测试页面验证配置

---

**最后更新**: 2025-10-23
**版本**: 1.0.0