# Google Analytics 4 目标设置指南

## 1. 目标创建步骤

### 在Google Analytics控制台中创建目标

1. 登录 Google Analytics
2. 选择您的属性
3. 导航到: 配置 → 目标
4. 点击"新建目标"

## 2. 目标配置模板

以下目标需要在GA4控制台中创建：

### Audio Engagement Goal
- **目标名称**: Audio Engagement Goal
- **描述**: Users who play audio for more than 30 seconds
- **类型**: event
- **目标值**: 1
- **事件条件**: audio_duration greater_than_or_equal 30

### Feature Adoption Goal
- **目标名称**: Feature Adoption Goal
- **描述**: Users who complete tutorial
- **类型**: event
- **目标值**: 5
- **事件条件**: tutorial_complete greater_than_or_equal 1

### Social Sharing Goal
- **目标名称**: Social Sharing Goal
- **描述**: Users who share content
- **类型**: event
- **目标值**: 3
- **事件条件**: share greater_than_or_equal 1

### Content Exploration Goal
- **目标名称**: Content Exploration Goal
- **描述**: Users who explore multiple categories
- **类型**: event
- **目标值**: 2
- **事件条件**: category_switch greater_than_or_equal 3
