#!/usr/bin/env python3
"""
Google Analytics 4 Setup Automation Script
用于自动化配置Google Analytics 4事件、目标、受众群体和报告

使用方法:
python ga4-setup-automation.py --config ga4-events-config.json --action setup
python ga4-setup-automation.py --config ga4-events-config.json --action validate
python ga4-setup-automation.py --config ga4-events-config.json --action export
"""

import json
import argparse
import sys
from datetime import datetime
from typing import Dict, List, Any
import requests
import time

class GA4Automation:
    def __init__(self, config_path: str):
        """初始化GA4自动化配置器"""
        self.config_path = config_path
        self.config = self.load_config()
        self.api_base = "https://analyticsadmin.googleapis.com/v1alpha"
        self.setup_logs = []

    def load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件 {self.config_path} 不存在")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ 配置文件JSON格式错误: {e}")
            sys.exit(1)

    def log_message(self, level: str, message: str):
        """记录日志消息"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        self.setup_logs.append(log_entry)
        print(log_entry)

    def validate_config(self) -> bool:
        """验证配置文件的完整性和正确性"""
        self.log_message("INFO", "开始验证配置文件...")

        required_fields = [
            "ga4Configuration.propertyId",
            "ga4Configuration.measurementId",
            "customEvents",
            "conversions",
            "customDimensions",
            "audiences"
        ]

        errors = []

        # 检查必填字段
        for field in required_fields:
            keys = field.split('.')
            current = self.config
            for key in keys:
                if key not in current:
                    errors.append(f"缺少必填字段: {field}")
                    break
                current = current[key]

        # 验证事件配置
        if "customEvents" in self.config:
            for i, event in enumerate(self.config["customEvents"]):
                if not event.get("eventName"):
                    errors.append(f"事件 {i} 缺少 eventName")
                if not event.get("category"):
                    errors.append(f"事件 {event.get('eventName', i)} 缺少 category")

        # 验证受众群体配置
        if "audiences" in self.config:
            for i, audience in enumerate(self.config["audiences"]):
                if not audience.get("audienceName"):
                    errors.append(f"受众群体 {i} 缺少 audienceName")
                if not audience.get("inclusionCriteria"):
                    errors.append(f"受众群体 {audience.get('audienceName', i)} 缺少 inclusionCriteria")

        if errors:
            self.log_message("ERROR", "配置验证失败:")
            for error in errors:
                self.log_message("ERROR", f"  - {error}")
            return False

        self.log_message("INFO", "配置文件验证通过")
        return True

    def generate_gtag_setup(self) -> str:
        """生成gtag.js设置代码"""
        config = self.config["ga4Configuration"]

        gtag_code = f'''<!-- Google Analytics 4 Setup for SoundFlows -->
<script async src="https://www.googletagmanager.com/gtag/js?id={config["measurementId"]}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());

  // GA4 Configuration
  gtag('config', '{config["measurementId"]}', {{
    'anonymize_ip': {str(config["ipAnonymization"]).lower()},
    'cookie_flags': 'SameSite=None;Secure',
    'custom_map': {{
'''

        # 添加自定义维度
        for dimension in self.config.get("customDimensions", []):
            gtag_code += f"      '{dimension['dimensionId']}': '{dimension['dimensionName'].lower().replace(' ', '_')}',\n"

        gtag_code = gtag_code.rstrip(',\n') + '\n    }\n  });\n\n'

        # 添加事件追踪函数
        gtag_code += '''  // Event tracking functions
  function trackEvent(eventName, params = {}) {
    gtag('event', eventName, params);
  }

  // Audio tracking
  function trackAudioPlay(category, trackName, format = 'unknown') {
    trackEvent('audio_play', {
      'audio_category': category,
      'audio_format': format,
      'event_label': trackName,
      'value': 1
    });
  }

  function trackAudioDuration(duration, trackName) {
    trackEvent('audio_duration', {
      'event_category': 'engagement',
      'event_label': trackName,
      'value': duration
    });
  }

  // Feature tracking
  function trackFeature(featureName) {
    trackEvent('feature_used', {
      'event_category': 'feature',
      'event_label': featureName
    });
  }

  // Social tracking
  function trackShare(platform) {
    trackEvent('share', {
      'event_category': 'social',
      'event_label': platform
    });
  }

  // Export to global scope
  window.trackEvent = trackEvent;
  window.trackAudioPlay = trackAudioPlay;
  window.trackAudioDuration = trackAudioDuration;
  window.trackFeature = trackFeature;
  window.trackShare = trackShare;
</script>'''

        return gtag_code

    def generate_measurement_protocol_setup(self) -> str:
        """生成Measurement Protocol设置代码"""
        config = self.config["ga4Configuration"]

        return f'''// Measurement Protocol v2 Setup
const MEASUREMENT_ID = '{config["measurementId"]}';
const API_SECRET = 'YOUR_API_SECRET'; // 需要在GA4中创建

async function sendEventToGA4(eventData) {{
  const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${{MEASUREMENT_ID}}&api_secret=${{API_SECRET}}`, {{
    method: 'POST',
    headers: {{
      'Content-Type': 'application/json',
    }},
    body: JSON.stringify({{
      client_id: await getClientId(),
      events: [eventData]
    }})
  }});

  return response.json();
}}

async function getClientId() {{
  // 从cookie或localStorage获取client_id
  let clientId = localStorage.getItem('ga_client_id');
  if (!clientId) {{
    clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ga_client_id', clientId);
  }}
  return clientId;
}}'''

    def generate_data_layer_setup(self) -> str:
        """生成Data Layer设置代码"""
        return '''// Data Layer Setup
window.dataLayer = window.dataLayer || [];

function pushToDataLayer(event, data = {}) {
  window.dataLayer.push({
    event: event,
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Enhanced E-commerce events (if needed)
function trackEcommerceEvent(eventName, ecommerceData) {
  pushToDataLayer(eventName, {
    ecommerce: ecommerceData
  });
}

// Custom event tracking
function trackCustomEvent(eventName, category, label, value = null) {
  pushToDataLayer('custom_event', {
    event_name: eventName,
    event_category: category,
    event_label: label,
    event_value: value
  });
}'''

    def generate_event_setup_guide(self) -> str:
        """生成事件设置指南"""
        guide = '''# Google Analytics 4 事件设置指南

## 1. 基础设置步骤

### 在Google Analytics控制台中创建事件

1. 登录 Google Analytics (https://analytics.google.com)
2. 选择您的属性 (SoundFlows)
3. 导航到: 配置 → 事件
4. 点击"创建事件"
5. 选择"创建自定义事件"

## 2. 事件配置模板

以下事件需要在GA4控制台中创建：
'''

        for event in self.config.get("customEvents", []):
            guide += f'''
### {event["eventName"]}
- **事件名称**: {event["eventName"]}
- **类别**: {event["category"]}
- **描述**: {event["description"]}
- **参数**:
'''
            for param_name, param_value in event.get("parameters", {}).items():
                guide += f'  - `{param_name}`: {param_value}\n'

            if event.get("conversion"):
                guide += f'- **转化事件**: 是 (转化值: {event["conversionValue"]})\n'
            else:
                guide += '- **转化事件**: 否\n'

        return guide

    def generate_audience_setup_guide(self) -> str:
        """生成受众群体设置指南"""
        guide = '''# Google Analytics 4 受众群体设置指南

## 1. 受众群体创建步骤

### 在Google Analytics控制台中创建受众群体

1. 登录 Google Analytics
2. 选择您的属性
3. 导航到: 配置 → 受众群体定义
4. 点击"新建受众群体"

## 2. 受众群体配置模板

以下受众群体需要在GA4控制台中创建：
'''

        for audience in self.config.get("audiences", []):
            guide += f'''
### {audience["audienceName"]}
- **受众群体名称**: {audience["audienceName"]}
- **描述**: {audience["description"]}
- **成员资格期限**: {audience["membershipDurationDays"]} 天
- **包含条件**:
'''

            criteria = audience.get("inclusionCriteria", {})
            if "and" in criteria:
                for condition in criteria["and"]:
                    if "eventFilter" in condition:
                        filter_info = condition["eventFilter"]
                        guide += f'  - 事件: `{filter_info["eventName"]}` {filter_info["comparisonType"]} {filter_info["comparisonValue"]}\n'
                    elif "sessionFilter" in condition:
                        filter_info = condition["sessionFilter"]
                        guide += f'  - 会话指标: `{filter_info["metricName"]}` {filter_info["comparisonType"]} {filter_info["comparisonValue"]}\n'
                    elif "userPropertyFilter" in condition:
                        filter_info = condition["userPropertyFilter"]
                        guide += f'  - 用户属性: `{filter_info["userPropertyName"]}` {filter_info["comparisonType"]} {filter_info["comparisonValue"]}\n'
                    elif "deviceCategoryFilter" in condition:
                        filter_info = condition["deviceCategoryFilter"]
                        guide += f'  - 设备类别: {filter_info["deviceCategory"]}\n'
            elif "eventFilter" in criteria:
                filter_info = criteria["eventFilter"]
                guide += f'  - 事件: `{filter_info["eventName"]}` {filter_info["comparisonType"]} {filter_info["comparisonValue"]}\n'
            elif "deviceCategoryFilter" in criteria:
                filter_info = criteria["deviceCategoryFilter"]
                guide += f'  - 设备类别: {filter_info["deviceCategory"]}\n'

        return guide

    def generate_conversion_setup_guide(self) -> str:
        """生成转化设置指南"""
        guide = '''# Google Analytics 4 转化设置指南

## 1. 转化事件设置步骤

### 在Google Analytics控制台中设置转化

1. 登录 Google Analytics
2. 选择您的属性
3. 导航到: 配置 → 事件
4. 找到需要标记为转化的事件
5. 切换"标记为转化"开关

## 2. 转化事件列表

以下事件需要标记为转化事件：
'''

        for conversion in self.config.get("conversions", []):
            guide += f'''
### {conversion["conversionName"]}
- **事件名称**: {conversion["eventName"]}
- **转化名称**: {conversion["conversionName"]}
- **计数方法**: {conversion["countingMethod"]}
- **转化值**: {conversion["conversionValue"]}
- **货币**: {conversion["currencyCode"]}
'''

        return guide

    def generate_goal_setup_guide(self) -> str:
        """生成目标设置指南"""
        guide = '''# Google Analytics 4 目标设置指南

## 1. 目标创建步骤

### 在Google Analytics控制台中创建目标

1. 登录 Google Analytics
2. 选择您的属性
3. 导航到: 配置 → 目标
4. 点击"新建目标"

## 2. 目标配置模板

以下目标需要在GA4控制台中创建：
'''

        for goal in self.config.get("goals", []):
            guide += f'''
### {goal["goalName"]}
- **目标名称**: {goal["goalName"]}
- **描述**: {goal["description"]}
- **类型**: {goal["type"]}
- **目标值**: {goal["value"]}
'''

            if goal["type"] == "event":
                event_details = goal["eventDetails"]
                guide += f'- **事件条件**: {event_details["eventName"]} {event_details["condition"]} {event_details["value"]}\n'

        return guide

    def export_setup_files(self, output_dir: str = "setup_files"):
        """导出所有设置文件"""
        import os

        # 创建输出目录
        os.makedirs(output_dir, exist_ok=True)

        # 生成gtag设置文件
        gtag_setup = self.generate_gtag_setup()
        with open(f"{output_dir}/gtag-setup.js", "w", encoding="utf-8") as f:
            f.write(gtag_setup)

        # 生成Measurement Protocol设置文件
        mp_setup = self.generate_measurement_protocol_setup()
        with open(f"{output_dir}/measurement-protocol.js", "w", encoding="utf-8") as f:
            f.write(mp_setup)

        # 生成Data Layer设置文件
        dl_setup = self.generate_data_layer_setup()
        with open(f"{output_dir}/data-layer.js", "w", encoding="utf-8") as f:
            f.write(dl_setup)

        # 生成设置指南
        event_guide = self.generate_event_setup_guide()
        with open(f"{output_dir}/event-setup-guide.md", "w", encoding="utf-8") as f:
            f.write(event_guide)

        audience_guide = self.generate_audience_setup_guide()
        with open(f"{output_dir}/audience-setup-guide.md", "w", encoding="utf-8") as f:
            f.write(audience_guide)

        conversion_guide = self.generate_conversion_setup_guide()
        with open(f"{output_dir}/conversion-setup-guide.md", "w", encoding="utf-8") as f:
            f.write(conversion_guide)

        goal_guide = self.generate_goal_setup_guide()
        with open(f"{output_dir}/goal-setup-guide.md", "w", encoding="utf-8") as f:
            f.write(goal_guide)

        # 生成配置摘要
        summary = self.generate_setup_summary()
        with open(f"{output_dir}/setup-summary.md", "w", encoding="utf-8") as f:
            f.write(summary)

        self.log_message("INFO", f"设置文件已导出到 {output_dir} 目录")

    def generate_setup_summary(self) -> str:
        """生成设置摘要"""
        config = self.config["ga4Configuration"]

        summary = f'''# Google Analytics 4 设置摘要

## 配置信息
- **属性ID**: {config["propertyId"]}
- **衡量ID**: {config["measurementId"]}
- **属性名称**: {config["propertyName"]}
- **数据保留期**: {config["dataRetention"]}
- **增强型衡量**: {"启用" if config["enhancedMeasurement"] else "禁用"}
- **IP匿名化**: {"启用" if config["ipAnonymization"] else "禁用"}

## 统计信息
- **自定义事件**: {len(self.config.get("customEvents", []))} 个
- **转化事件**: {len(self.config.get("conversions", []))} 个
- **自定义维度**: {len(self.config.get("customDimensions", []))} 个
- **自定义指标**: {len(self.config.get("customMetrics", []))} 个
- **受众群体**: {len(self.config.get("audiences", []))} 个
- **目标**: {len(self.config.get("goals", []))} 个
- **报告**: {len(self.config.get("reports", []))} 个
- **警报**: {len(self.config.get("alerts", []))} 个

## 下一步行动

1. [验证] 验证配置文件完整性
2. [待实施] 在GA4控制台中创建自定义事件
3. [待实施] 设置转化事件
4. [待实施] 创建自定义维度和指标
5. [待实施] 设置受众群体
6. [待实施] 配置目标
7. [待实施] 创建自定义报告
8. [待实施] 设置警报
9. [待实施] 实施gtag.js代码
10. [待实施] 测试事件追踪
11. [待实施] 验证数据收集

## 文件清单

### JavaScript文件
- `gtag-setup.js` - Google Analytics主脚本
- `measurement-protocol.js` - Measurement Protocol设置
- `data-layer.js` - Data Layer设置

### 设置指南
- `event-setup-guide.md` - 事件设置指南
- `audience-setup-guide.md` - 受众群体设置指南
- `conversion-setup-guide.md` - 转化设置指南
- `goal-setup-guide.md` - 目标设置指南

### 配置文件
- `ga4-events-config.json` - 主要配置文件

生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
'''
        return summary

    def run_setup(self):
        """运行完整的设置流程"""
        self.log_message("INFO", "开始Google Analytics 4自动化设置...")

        # 1. 验证配置
        if not self.validate_config():
            return False

        # 2. 导出设置文件
        self.export_setup_files()

        # 3. 生成设置摘要
        summary = self.generate_setup_summary()
        self.log_message("INFO", "\n" + "="*50)
        self.log_message("INFO", "设置摘要:")
        self.log_message("INFO", "="*50)
        print(summary)

        self.log_message("INFO", "Google Analytics 4 自动化设置完成！")
        return True

    def run_validation(self):
        """运行配置验证"""
        self.log_message("INFO", "开始验证配置...")

        if self.validate_config():
            self.log_message("INFO", "配置验证通过")

            # 检查是否有必要的配置
            config = self.config["ga4Configuration"]
            if not config.get("measurementId"):
                self.log_message("WARNING", "未设置measurementId，请更新配置文件")

            if not config.get("propertyId"):
                self.log_message("WARNING", "未设置propertyId，请更新配置文件")

            return True
        else:
            return False

    def run_export(self, output_dir: str = "setup_files"):
        """运行配置导出"""
        self.log_message("INFO", f"开始导出配置到 {output_dir}...")

        if not self.validate_config():
            return False

        self.export_setup_files(output_dir)
        return True

def main():
    parser = argparse.ArgumentParser(description='Google Analytics 4 自动化设置工具')
    parser.add_argument('--config', type=str, default='ga4-events-config.json',
                       help='配置文件路径 (默认: ga4-events-config.json)')
    parser.add_argument('--action', type=str, choices=['setup', 'validate', 'export'],
                       default='setup', help='执行的操作')
    parser.add_argument('--output', type=str, default='setup_files',
                       help='输出目录 (默认: setup_files)')

    args = parser.parse_args()

    # 创建自动化实例
    ga4_auto = GA4Automation(args.config)

    # 执行相应操作
    if args.action == 'setup':
        success = ga4_auto.run_setup()
    elif args.action == 'validate':
        success = ga4_auto.run_validation()
    elif args.action == 'export':
        success = ga4_auto.run_export(args.output)

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()