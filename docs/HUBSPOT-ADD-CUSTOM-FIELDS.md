# 🔧 HubSpot 表单添加自定义字段指南

**问题**: test@soundflows.app 联系人创建成功,但没有姓名、目标、时间等字段数据

**原因**: HubSpot 表单只有基础字段 (First Name, Last Name, Email),缺少自定义字段

**解决方案**: 添加自定义字段到表单

---

## 📋 快速修复步骤 (5 分钟)

### 第 1 步: 编辑表单

1. 登录 HubSpot: https://app.hubspot.com
2. 导航到 **Marketing** → **Forms**
3. 找到你的表单 (Form GUID: ec666460-ee7c-4057-97a6-d6f1fdd9c061)
4. 点击表单名称进入编辑

### 第 2 步: 添加自定义字段 - Meditation Goal

1. 在表单编辑器中,点击 **+ Add new field**
2. 选择 **Dropdown select**

**字段配置**:
```
Field Label: Meditation Goal
Internal Name: meditation_goal
Field Type: Dropdown select
Required: Yes
```

**选项值** (重要!必须完全一致):
```
stress - 缓解焦虑与压力
sleep - 提升睡眠质量
focus - 提升专注效率
mindfulness - 建立规律冥想习惯
```

**⚠️ 注意**:
- 左边的值 (`stress`, `sleep`, 等) 必须与网站表单的 `value` 完全匹配
- 右边的文本是用户看到的显示文本

3. 点击 **Create**

### 第 3 步: 添加自定义字段 - Preferred Time

1. 再次点击 **+ Add new field**
2. 选择 **Dropdown select**

**字段配置**:
```
Field Label: Preferred Time
Internal Name: preferred_time
Field Type: Dropdown select
Required: Yes
```

**选项值** (重要!必须完全一致):
```
5-10 - 5-10 分钟
10-20 - 10-20 分钟
20-30 - 20-30 分钟
30+ - 30 分钟以上
```

3. 点击 **Create**

### 第 4 步: 调整字段顺序

拖动字段调整顺序为:
1. First Name
2. Last Name
3. Email
4. Meditation Goal
5. Preferred Time

### 第 5 步: 保存表单

1. 点击右上角 **Update**
2. 确认更新成功

---

## 🧪 测试更新

### 删除旧的测试联系人

1. 在 HubSpot Contacts 中
2. 找到 `test@soundflows.app`
3. 点击联系人
4. 点击右上角 **操作** → **删除**
5. 确认删除

### 重新测试提交

1. 访问 https://soundflows.app
2. 硬刷新 (Ctrl + Shift + R)
3. 滚动到 "7 日定制冥想计划" 表单
4. 填写信息:
   - 昵称: 张三
   - 邮箱: test@soundflows.app
   - 目标: 缓解焦虑与压力
   - 时长: 10-20 分钟
5. 提交

### 验证结果

回到 HubSpot,查看新的 test@soundflows.app 联系人,应该看到:
- ✅ First Name: 张
- ✅ Last Name: 三
- ✅ Email: test@soundflows.app
- ✅ Meditation Goal: stress (或显示 "缓解焦虑与压力")
- ✅ Preferred Time: 10-20 (或显示 "10-20 分钟")

---

## 🔍 字段值映射详解

### 网站表单 → HubSpot 字段

| 网站表单字段 | 网站 Value | HubSpot 字段名 | HubSpot 接收值 |
|------------|-----------|--------------|--------------|
| 昵称 | "张三" | firstname | "张" |
| 昵称 | "张三" | lastname | "三" |
| 邮箱 | "test@..." | email | "test@..." |
| 目标 | "stress" | meditation_goal | "stress" |
| 目标 | "sleep" | meditation_goal | "sleep" |
| 目标 | "focus" | meditation_goal | "focus" |
| 目标 | "mindfulness" | meditation_goal | "mindfulness" |
| 时长 | "5-10" | preferred_time | "5-10" |
| 时长 | "10-20" | preferred_time | "10-20" |
| 时长 | "20-30" | preferred_time | "20-30" |
| 时长 | "30+" | preferred_time | "30+" |

### 网站表单代码 (index.html)

```html
<select id="planGoal" name="goal" required>
    <option value="">请选择</option>
    <option value="sleep">提升睡眠质量</option>
    <option value="focus">提升专注效率</option>
    <option value="stress">缓解焦虑与压力</option>
    <option value="mindfulness">建立规律冥想习惯</option>
</select>

<select id="planTime" name="time" required>
    <option value="">请选择</option>
    <option value="5-10">5-10 分钟</option>
    <option value="10-20">10-20 分钟</option>
    <option value="20-30">20-30 分钟</option>
    <option value="30+">30 分钟以上</option>
</select>
```

### CRM Bridge 映射代码

```javascript
// 字段映射
const fieldMap = {
    'email': 'email',
    'goal': 'meditation_goal',  // ← 重要映射
    'time': 'preferred_time',   // ← 重要映射
    'firstname': 'firstname',
    'lastname': 'lastname'
};
```

---

## ⚠️ 常见错误

### 错误 1: 字段名称不匹配

**❌ 错误示例**:
- Internal Name: `Meditation_Goal` (大写 M 和 G)
- Internal Name: `meditation-goal` (使用连字符)

**✅ 正确示例**:
- Internal Name: `meditation_goal` (小写,下划线)

### 错误 2: 选项值不匹配

**❌ 错误示例**:
```
缓解焦虑与压力 - 缓解焦虑与压力  (左边应该是 "stress")
```

**✅ 正确示例**:
```
stress - 缓解焦虑与压力  (左边是英文值,右边是中文标签)
```

### 错误 3: 字段类型错误

**❌ 错误示例**:
- 使用 "Single-line text" 类型

**✅ 正确示例**:
- 使用 "Dropdown select" 类型

---

## 📸 HubSpot 表单配置截图说明

### 添加 Meditation Goal 字段

**创建字段对话框应该显示**:
```
┌─────────────────────────────────┐
│ Create a new property           │
├─────────────────────────────────┤
│ Object: Contact                 │
│ Group: Contact Information      │
│                                 │
│ Label: Meditation Goal          │
│ Description: 用户的冥想目标       │
│                                 │
│ Field type: Dropdown select     │
│                                 │
│ Internal name: meditation_goal  │
│ (自动生成,检查是否正确)            │
│                                 │
│ Options:                        │
│ ┌─────────────────────────────┐│
│ │ Internal value | Label     ││
│ │ stress         | 缓解焦虑与压力││
│ │ sleep          | 提升睡眠质量 ││
│ │ focus          | 提升专注效率 ││
│ │ mindfulness    | 建立规律冥想 ││
│ └─────────────────────────────┘│
│                                 │
│ ☑ Required field                │
│                                 │
│ [Cancel]  [Create]              │
└─────────────────────────────────┘
```

---

## 🎯 为什么需要这样配置?

### 数据流程

1. **用户在网站选择**: "缓解焦虑与压力"
2. **浏览器发送值**: `goal: "stress"`
3. **CRM Bridge 转换**: `meditation_goal: "stress"`
4. **HubSpot 接收**: 在 `meditation_goal` 字段存储 `"stress"`
5. **HubSpot 显示**: 根据 Dropdown 配置显示 "缓解焦虑与压力"

### 如果不配置会怎样?

- HubSpot 收到 `meditation_goal: "stress"` 但表单中没有此字段
- HubSpot **忽略** 这个数据
- 联系人创建成功但字段为空 ← **这就是当前的情况!**

---

## 🚀 配置完成后

### 立即生效

- 表单更新后立即生效
- 新提交会包含所有字段数据
- 旧联系人数据不会自动更新

### 数据完整性

从现在开始,每个新提交的联系人都会包含:
- ✅ 完整的姓名 (First Name + Last Name)
- ✅ 邮箱
- ✅ 冥想目标
- ✅ 偏好时间

---

## 📚 相关文档

- **HubSpot 表单配置向导**: `docs/HUBSPOT-CONFIGURATION-WIZARD.md`
- **字段映射说明**: `docs/CRM-EMAIL-INTEGRATION-GUIDE.md`
- **邮件自动化设置**: `docs/HUBSPOT-EMAIL-SETUP.md`

---

**维护者**: SoundFlows Team
**文档版本**: 1.0
**最后更新**: 2025-10-18
**优先级**: ⚠️ 高 - 必须配置才能收集完整数据
