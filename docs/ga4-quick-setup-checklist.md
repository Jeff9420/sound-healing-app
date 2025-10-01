# Google Analytics 4 快速配置检查清单

## 📋 配置前检查

### ✅ 前置条件
- [ ] GA4 Measurement ID 已正确配置（G-4NZR3HR3J1）
- [ ] 跟踪代码已安装到网站
- [ ] Cookie 同意管理已部署

## 🎯 转化目标配置

### 步骤1：创建转化目标
访问：Google Analytics → 管理 → 转化

- [ ] **Audio Session Complete**
  - 事件名称：audio_complete
  - 价值：10

- [ ] **Featured Track Play**
  - 事件名称：featured_track_play
  - 价值：15

- [ ] **Social Share**
  - 事件名称：share
  - 价值：20

- [ ] **Tutorial Complete**
  - 事件名称：tutorial_complete
  - 价值：15

## 👥 受众群体配置

### 步骤2：创建受众群体
访问：Google Analytics → 管理 → 受众群体定义

### 核心受众群体
- [ ] **高价值用户**
  - 条件：事件数 > 10 AND audio_complete > 3

- [ ] **冥想爱好者**
  - 条件：audio_category 包含 meditation/hypnosis AND 会话时长 > 20分钟

- [ ] **睡眠改善用户**
  - 条件：sleep_timer_set > 5 AND 类别为 Rain/Fire

- [ ] **多语言用户**
  - 条件：language_change > 1 AND 会话数 > 3

### 行为受众群体
- [ ] **活跃用户**（7天内）
  - 条件：会话数 > 3 AND 最近7天活跃

- [ ] **新用户探索者**
  - 条件：首次会话 AND category_switch > 2

- [ ] **深夜用户**
  - 条件：访问时间 22:00-02:00 AND 会话时长 > 15分钟

- [ ] **多类别探索者**
  - 条件：DISTINCT audio_category > 3 AND 会话时长 > 25分钟

## 📊 报告配置

### 步骤3：创建关键报告
访问：Google Analytics → 探索

- [ ] **音频类别表现报告**
  - 维度：audio_category, device_type
  - 指标：用户数, 事件数, 平均会话时长

- [ ] **用户路径分析**
  - 路径：首页 → 精选曲目 → 播放 → 完成

- [ ] **时间模式分析**
  - 维度：小时, 星期
  - 指标：用户数, 会话数

## 🔍 验证测试

### 步骤4：验证配置
- [ ] 访问测试页面：/test-analytics.html
- [ ] 检查 DebugView 中的实时事件
- [ ] 确认转化目标正在触发
- [ ] 验证受众群体计算正确

## 📈 监控指标

### 关键指标检查
- [ ] 日活跃用户数（DAU）
- [ ] 平均会话时长（目标：>10分钟）
- [ ] 音频播放完成率（目标：>60%）
- [ ] 7天留存率（目标：>30%）
- [ ] 精选曲目点击率（目标：>15%）

## 🚀 后续优化

### 基于数据的行动
- [ ] 分析最受欢迎的音频类别
- [ ] 识别用户流失点
- [ ] 优化高跳出率页面
- [ ] 测试不同的内容推荐策略

---

**⏱️ 预计完成时间：30-45分钟**

**💡 提示：配置完成后等待24-48小时，让数据积累，然后再进行分析。**