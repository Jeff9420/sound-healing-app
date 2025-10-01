# Google Analytics 4 受众群体设置指南

## 1. 受众群体创建步骤

### 在Google Analytics控制台中创建受众群体

1. 登录 Google Analytics
2. 选择您的属性
3. 导航到: 配置 → 受众群体定义
4. 点击"新建受众群体"

## 2. 受众群体配置模板

以下受众群体需要在GA4控制台中创建：

### Highly Engaged Users
- **受众群体名称**: Highly Engaged Users
- **描述**: Users who have played audio multiple times
- **成员资格期限**: 30 天
- **包含条件**:
  - 事件: `audio_play` greater_than_or_equal 3
  - 会话指标: `session_duration` greater_than 300

### Featured Track Enthusiasts
- **受众群体名称**: Featured Track Enthusiasts
- **描述**: Users who frequently play featured tracks
- **成员资格期限**: 14 天
- **包含条件**:
  - 事件: `featured_track_play` greater_than_or_equal 2

### Social Sharers
- **受众群体名称**: Social Sharers
- **描述**: Users who have shared content
- **成员资格期限**: 90 天
- **包含条件**:
  - 事件: `share` greater_than_or_equal 1

### Power Listeners
- **受众群体名称**: Power Listeners
- **描述**: Users with long listening sessions
- **成员资格期限**: 30 天
- **包含条件**:
  - 事件: `audio_duration` greater_than 600
  - 用户属性: `total_session_count` greater_than_or_equal 5

### New User Explorers
- **受众群体名称**: New User Explorers
- **描述**: New users who completed tutorial
- **成员资格期限**: 7 天
- **包含条件**:
  - 用户属性: `first_session_timestamp` greater_than 7_days_ago
  - 事件: `tutorial_complete` greater_than_or_equal 1

### Mobile Users
- **受众群体名称**: Mobile Users
- **描述**: Users accessing from mobile devices
- **成员资格期限**: 30 天
- **包含条件**:
  - 设备类别: mobile

### Desktop Users
- **受众群体名称**: Desktop Users
- **描述**: Users accessing from desktop devices
- **成员资格期限**: 30 天
- **包含条件**:
  - 设备类别: desktop

### Deep Scrollers
- **受众群体名称**: Deep Scrollers
- **描述**: Users who scroll 90%+ of pages
- **成员资格期限**: 14 天
- **包含条件**:
  - 事件: `scroll_depth` greater_than_or_equal 90
