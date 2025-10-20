# 🚀 Amplitude 图表快速配置指南

**登录地址**: https://analytics.amplitude.com
**API Key**: b6c4ebe3ec4d16c8f5fd258d29653cfc
**预计时间**: 15-20分钟

---

## 🎯 一键配置清单

### 仪表盘 1: 内容互动分析
1. **页面浏览量图表**
   - 事件: `[Amplitude] Page Viewed`
   - 分组: `Page Path`
   - 图表类型: 折线图

2. **按钮点击热力图**
   - 事件: `[Amplitude] Element Clicked`
   - 分组: `Element Text`
   - 图表类型: 柱状图
   - 限制: Top 10

3. **音频播放事件**
   - 事件: `audio_play` (搜索此事件)
   - 分组: `audio_category`
   - 图表类型: 饼图

### 仪表盘 2: 转化追踪
1. **表单提交趋势**
   - 事件: `plan_submit`
   - 图表类型: 折线图
   - 时间范围: 30天

2. **提交成功率**
   - 事件1: `plan_submit`
   - 事件2: `plan_submit_success`
   - 公式: (B/A)×100

### 仪表盘 3: 用户行为
1. **会话时长**
   - 事件: `[Amplitude] Session End`
   - 指标: `Session Length` 平均值

2. **留存率**
   - 初始事件: `Page Viewed`
   - 返回事件: `Session Start`
   - 类型: N-Day Retention

---

## ⚡ 快速操作步骤

### 创建图表（3分钟一个）：

1. **进入仪表盘**
   - 点击 `Create` → `Dashboard`
   - 输入名称
   - 点击 `Create`

2. **添加图表**
   - 点击 `Add Chart`
   - 选择 `Event Segmentation`
   - 输入事件名称
   - 选择分组条件
   - 点击 `Save`

3. **批量创建**
   - 使用 `Duplicate Chart` 功能
   - 修改事件名称
   - 保存

---

## 🔧 批量导入模板

如果 Amplitude 支持批量导入，您可以使用以下 JSON 模板：

```json
{
  "dashboard": "内容互动分析",
  "charts": [
    {
      "name": "页面浏览量",
      "event": "[Amplitude] Page Viewed",
      "segment_by": "Page Path",
      "chart_type": "line"
    },
    {
      "name": "按钮点击",
      "event": "[Amplitude] Element Clicked",
      "segment_by": "Element Text",
      "chart_type": "bar",
      "limit": 10
    }
  ]
}
```

---

## 💡 实用技巧

### 1. 使用键盘快捷键
- `Ctrl/Cmd + D`: 复制图表
- `Ctrl/Cmd + S`: 保存图表
- `Tab`: 快速切换输入框

### 2. 批量操作
- 创建第一个图表后
- 点击 `...` 菜单
- 选择 `Duplicate`
- 修改事件名称
- 重复 10 次

### 3. 快速搜索事件
- 在事件输入框中直接输入
- 支持模糊搜索
- 常用事件已预配置

---

## ⚠️ 注意事项

1. **数据延迟**
   - 新部署的代码需要 15-30 分钟才显示数据
   - 图表会自动填充数据

2. **事件名称**
   - 自定义事件: `audio_play`, `plan_submit`
   - Amplitude 自动事件: `[Amplitude] Page Viewed`

3. **保存设置**
   - 每个图表都要点击 Save
   - 仪表盘会自动保存

---

## 📞 需要帮助？

1. **实时帮助**
   - Amplitude 右下角有聊天支持
   - 可以截图发送给客服

2. **视频教程**
   - Amplitude Academy 有免费视频
   - 搜索 "Create Chart"

3. **模板库**
   - Amplitude 有预置模板
   - 可以导入后修改

---

## ✅ 完成后验证

1. **检查仪表盘**
   - 每个仪表盘有 3-4 个图表
   - 图表标题正确

2. **测试数据**
   - 访问您的网站
   - 触发一些事件
   - 查看实时数据

3. **设置提醒**
   - 点击每个仪表盘的 `...`
   - 选择 `Schedule`
   - 设置周报邮件

---

**预计完成时间**: 20分钟
**难度**: ⭐⭐☆☆☆

您现在可以开始配置了！