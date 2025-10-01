# Google Analytics 4 事件设置指南

## 1. 基础设置步骤

### 在Google Analytics控制台中创建事件

1. 登录 Google Analytics (https://analytics.google.com)
2. 选择您的属性 (SoundFlows)
3. 导航到: 配置 → 事件
4. 点击"创建事件"
5. 选择"创建自定义事件"

## 2. 事件配置模板

以下事件需要在GA4控制台中创建：

### audio_play
- **事件名称**: audio_play
- **类别**: audio
- **描述**: Track when audio track is played
- **参数**:
  - `audio_category`: dimension1
  - `audio_format`: dimension2
  - `device_type`: dimension3
- **转化事件**: 是 (转化值: 1)

### audio_duration
- **事件名称**: audio_duration
- **类别**: engagement
- **描述**: Track audio listening duration
- **参数**:
  - `duration_seconds`: value
  - `track_name`: event_label
- **转化事件**: 否

### featured_track_play
- **事件名称**: featured_track_play
- **类别**: feature
- **描述**: Track featured track plays
- **参数**:
  - `track_name`: event_label
- **转化事件**: 是 (转化值: 2)

### category_switch
- **事件名称**: category_switch
- **类别**: navigation
- **描述**: Track category navigation changes
- **参数**:
  - `category_name`: event_label
- **转化事件**: 否

### theme_change
- **事件名称**: theme_change
- **类别**: feature
- **描述**: Track theme changes
- **参数**:
  - `theme_name`: event_label
- **转化事件**: 否

### language_change
- **事件名称**: language_change
- **类别**: feature
- **描述**: Track language changes
- **参数**:
  - `language_code`: event_label
- **转化事件**: 否

### share
- **事件名称**: share
- **类别**: social
- **描述**: Track content sharing
- **参数**:
  - `platform`: event_label
- **转化事件**: 是 (转化值: 3)

### tutorial_complete
- **事件名称**: tutorial_complete
- **类别**: onboarding
- **描述**: Track tutorial completion
- **参数**:
  - `tutorial_type`: event_label
- **转化事件**: 是 (转化值: 5)

### sleep_timer_set
- **事件名称**: sleep_timer_set
- **类别**: feature
- **描述**: Track sleep timer usage
- **参数**:
  - `timer_minutes`: value
- **转化事件**: 否

### scroll_depth
- **事件名称**: scroll_depth
- **类别**: engagement
- **描述**: Track page scroll depth
- **参数**:
  - `scroll_percentage`: value
- **转化事件**: 否

### audio_error
- **事件名称**: audio_error
- **类别**: error
- **描述**: Track audio playback errors
- **参数**:
  - `error_type`: event_label
- **转化事件**: 否

### javascript_error
- **事件名称**: javascript_error
- **类别**: error
- **描述**: Track JavaScript errors
- **参数**:
  - `error_location`: event_label
- **转化事件**: 否

### outbound_click
- **事件名称**: outbound_click
- **类别**: navigation
- **描述**: Track outbound link clicks
- **参数**:
  - `destination_domain`: event_label
- **转化事件**: 否
