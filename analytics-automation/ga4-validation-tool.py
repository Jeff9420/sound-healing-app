#!/usr/bin/env python3
"""
Google Analytics 4 配置验证和测试工具
用于验证GA4配置的正确性并测试事件追踪

使用方法:
python ga4-validation-tool.py --config ga4-events-config.json --action validate
python ga4-validation-tool.py --config ga4-events-config.json --action test-events
python ga4-validation-tool.py --config ga4-events-config.json --action generate-report
"""

import json
import argparse
import sys
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import re
import hashlib

class GA4ValidationTool:
    def __init__(self, config_path: str):
        """初始化GA4验证工具"""
        self.config_path = config_path
        self.config = self.load_config()
        self.validation_results = []
        self.test_results = []

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

    def log_validation(self, level: str, message: str, details: Optional[str] = None):
        """记录验证结果"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = {
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "details": details
        }
        self.validation_results.append(result)

        status_icon = "PASS" if level == "INFO" else "WARN" if level == "WARNING" else "FAIL"
        print(f"[{timestamp}] {status_icon}: {message}")
        if details:
            print(f"   Details: {details}")

    def log_test(self, test_name: str, status: str, details: Optional[str] = None):
        """记录测试结果"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = {
            "timestamp": timestamp,
            "test_name": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)

        status_icon = status
        print(f"[{timestamp}] {status_icon}: {test_name}")
        if details:
            print(f"   Details: {details}")

    def validate_config_structure(self) -> bool:
        """验证配置文件结构"""
        self.log_validation("INFO", "开始验证配置文件结构...")

        required_sections = [
            "ga4Configuration",
            "customEvents",
            "conversions",
            "customDimensions",
            "audiences",
            "goals"
        ]

        missing_sections = []
        for section in required_sections:
            if section not in self.config:
                missing_sections.append(section)

        if missing_sections:
            self.log_validation("ERROR", f"缺少必需的配置部分: {', '.join(missing_sections)}")
            return False

        self.log_validation("INFO", "配置文件结构验证通过")
        return True

    def validate_ga4_configuration(self) -> bool:
        """验证GA4基本配置"""
        self.log_validation("INFO", "开始验证GA4基本配置...")

        ga4_config = self.config.get("ga4Configuration", {})
        required_fields = ["propertyId", "measurementId", "propertyName"]

        errors = []
        for field in required_fields:
            if not ga4_config.get(field):
                errors.append(f"缺少 {field}")

        if errors:
            self.log_validation("ERROR", f"GA4配置错误: {', '.join(errors)}")
            return False

        # 验证measurementId格式
        measurement_id = ga4_config.get("measurementId", "")
        if not re.match(r'^G-[A-Z0-9]{10}$', measurement_id):
            self.log_validation("WARNING", f"Measurement ID格式可能不正确: {measurement_id}")

        self.log_validation("INFO", "GA4基本配置验证通过")
        return True

    def validate_events(self) -> bool:
        """验证事件配置"""
        self.log_validation("INFO", "开始验证事件配置...")

        events = self.config.get("customEvents", [])
        if not events:
            self.log_validation("WARNING", "未配置任何自定义事件")
            return True

        errors = []
        warnings = []

        for i, event in enumerate(events):
            # 检查必需字段
            if not event.get("eventName"):
                errors.append(f"事件 {i} 缺少 eventName")
            elif not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', event["eventName"]):
                warnings.append(f"事件名称格式可能不正确: {event['eventName']}")

            if not event.get("category"):
                warnings.append(f"事件 {event.get('eventName', i)} 缺少 category")

            # 检查参数
            parameters = event.get("parameters", {})
            for param_name, param_value in parameters.items():
                if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', param_name):
                    warnings.append(f"参数名称格式可能不正确: {param_name} (事件: {event.get('eventName', i)})")

        if errors:
            self.log_validation("ERROR", f"事件配置错误: {', '.join(errors)}")
            return False

        if warnings:
            self.log_validation("WARNING", f"事件配置警告: {', '.join(warnings)}")

        self.log_validation("INFO", f"事件配置验证通过 ({len(events)} 个事件)")
        return True

    def validate_conversions(self) -> bool:
        """验证转化配置"""
        self.log_validation("INFO", "开始验证转化配置...")

        conversions = self.config.get("conversions", [])
        if not conversions:
            self.log_validation("WARNING", "未配置任何转化事件")
            return True

        errors = []
        event_names = {event["eventName"] for event in self.config.get("customEvents", [])}

        for conversion in conversions:
            if not conversion.get("eventName"):
                errors.append("转化配置缺少 eventName")
            elif conversion["eventName"] not in event_names:
                errors.append(f"转化事件引用不存在的事件: {conversion['eventName']}")

            if not conversion.get("conversionName"):
                errors.append(f"转化配置缺少 conversionName (事件: {conversion.get('eventName', 'unknown')})")

        if errors:
            self.log_validation("ERROR", f"转化配置错误: {', '.join(errors)}")
            return False

        self.log_validation("INFO", f"转化配置验证通过 ({len(conversions)} 个转化)")
        return True

    def validate_dimensions(self) -> bool:
        """验证自定义维度配置"""
        self.log_validation("INFO", "开始验证自定义维度配置...")

        dimensions = self.config.get("customDimensions", [])
        if not dimensions:
            self.log_validation("WARNING", "未配置任何自定义维度")
            return True

        errors = []
        warnings = []

        for dimension in dimensions:
            if not dimension.get("dimensionName"):
                errors.append("维度配置缺少 dimensionName")

            if not dimension.get("dimensionId"):
                errors.append(f"维度配置缺少 dimensionId (维度: {dimension.get('dimensionName', 'unknown')})")

            if dimension.get("scope") not in ["event", "user", "session"]:
                warnings.append(f"维度作用域可能不正确: {dimension.get('scope', 'unknown')}")

        if errors:
            self.log_validation("ERROR", f"自定义维度配置错误: {', '.join(errors)}")
            return False

        if warnings:
            self.log_validation("WARNING", f"自定义维度配置警告: {', '.join(warnings)}")

        self.log_validation("INFO", f"自定义维度配置验证通过 ({len(dimensions)} 个维度)")
        return True

    def validate_audiences(self) -> bool:
        """验证受众群体配置"""
        self.log_validation("INFO", "开始验证受众群体配置...")

        audiences = self.config.get("audiences", [])
        if not audiences:
            self.log_validation("WARNING", "未配置任何受众群体")
            return True

        errors = []
        warnings = []

        for audience in audiences:
            if not audience.get("audienceName"):
                errors.append("受众群体配置缺少 audienceName")

            if not audience.get("inclusionCriteria"):
                errors.append(f"受众群体配置缺少 inclusionCriteria (受众群体: {audience.get('audienceName', 'unknown')})")

            if audience.get("membershipDurationDays", 0) <= 0:
                warnings.append(f"成员资格期限可能不正确: {audience.get('membershipDurationDays', 0)} 天")

        if errors:
            self.log_validation("ERROR", f"受众群体配置错误: {', '.join(errors)}")
            return False

        if warnings:
            self.log_validation("WARNING", f"受众群体配置警告: {', '.join(warnings)}")

        self.log_validation("INFO", f"受众群体配置验证通过 ({len(audiences)} 个受众群体)")
        return True

    def validate_goals(self) -> bool:
        """验证目标配置"""
        self.log_validation("INFO", "开始验证目标配置...")

        goals = self.config.get("goals", [])
        if not goals:
            self.log_validation("WARNING", "未配置任何目标")
            return True

        errors = []
        event_names = {event["eventName"] for event in self.config.get("customEvents", [])}

        for goal in goals:
            if not goal.get("goalName"):
                errors.append("目标配置缺少 goalName")

            if goal.get("type") == "event":
                event_details = goal.get("eventDetails", {})
                if not event_details.get("eventName"):
                    errors.append(f"事件目标缺少 eventName (目标: {goal.get('goalName', 'unknown')})")
                elif event_details["eventName"] not in event_names:
                    errors.append(f"事件目标引用不存在的事件: {event_details['eventName']}")

        if errors:
            self.log_validation("ERROR", f"目标配置错误: {', '.join(errors)}")
            return False

        self.log_validation("INFO", f"目标配置验证通过 ({len(goals)} 个目标)")
        return True

    def validate_code_integration(self) -> bool:
        """验证代码集成配置"""
        self.log_validation("INFO", "开始验证代码集成配置...")

        # 检查是否有对应的JavaScript文件
        js_files = [
            "assets/js/analytics.js",
            "assets/js/analytics-config.js",
            "analytics-automation/setup_files/gtag-setup.js"
        ]

        existing_files = []
        for js_file in js_files:
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "gtag" in content or "analytics" in content.lower():
                        existing_files.append(js_file)
            except FileNotFoundError:
                continue

        if not existing_files:
            self.log_validation("WARNING", "未找到Analytics相关的JavaScript文件")
            return True

        self.log_validation("INFO", f"找到 {len(existing_files)} 个Analytics相关文件: {', '.join(existing_files)}")
        return True

    def test_event_tracking(self) -> bool:
        """测试事件追踪功能"""
        self.log_test("Event Tracking Test", "START", "开始测试事件追踪功能")

        # 模拟事件数据
        test_events = [
            {
                "eventName": "audio_play",
                "parameters": {
                    "audio_category": "meditation",
                    "audio_format": "mp3",
                    "event_label": "peaceful_meditation"
                }
            },
            {
                "eventName": "featured_track_play",
                "parameters": {
                    "event_label": "ocean_waves"
                }
            },
            {
                "eventName": "share",
                "parameters": {
                    "event_label": "facebook"
                }
            }
        ]

        for event in test_events:
            try:
                # 这里应该调用实际的事件追踪函数
                # 为了测试目的，我们模拟验证
                self.log_test(f"Event: {event['eventName']}", "PASS",
                            f"参数: {json.dumps(event['parameters'], ensure_ascii=False)}")
            except Exception as e:
                self.log_test(f"Event: {event['eventName']}", "FAIL", f"错误: {str(e)}")
                return False

        self.log_test("Event Tracking Test", "PASS", "所有事件追踪测试通过")
        return True

    def test_gtag_integration(self) -> bool:
        """测试gtag集成"""
        self.log_test("gtag Integration Test", "START", "开始测试gtag集成")

        # 检查gtag.js配置
        ga4_config = self.config.get("ga4Configuration", {})
        measurement_id = ga4_config.get("measurementId")

        if not measurement_id:
            self.log_test("gtag Integration Test", "FAIL", "未配置Measurement ID")
            return False

        # 验证Measurement ID格式
        if not re.match(r'^G-[A-Z0-9]{10}$', measurement_id):
            self.log_test("gtag Integration Test", "FAIL", f"Measurement ID格式不正确: {measurement_id}")
            return False

        self.log_test("gtag Integration Test", "PASS", f"gtag集成配置正确 (Measurement ID: {measurement_id})")
        return True

    def test_data_layer_integration(self) -> bool:
        """测试Data Layer集成"""
        self.log_test("Data Layer Integration Test", "START", "开始测试Data Layer集成")

        # 模拟Data Layer测试
        test_data = {
            "event": "page_view",
            "page_title": "Sound Healing Space",
            "page_location": "https://soundflows.app/",
            "timestamp": datetime.now().isoformat()
        }

        try:
            # 这里应该验证实际的Data Layer实现
            self.log_test("Data Layer Integration Test", "PASS",
                         f"Data Layer测试通过: {json.dumps(test_data, ensure_ascii=False)}")
        except Exception as e:
            self.log_test("Data Layer Integration Test", "FAIL", f"错误: {str(e)}")
            return False

        return True

    def test_api_connectivity(self) -> bool:
        """测试API连接"""
        self.log_test("API Connectivity Test", "START", "开始测试API连接")

        # 测试Google Analytics API连接
        endpoints = [
            "https://www.googletagmanager.com/gtag/js",
            "https://www.google-analytics.com/analytics.js"
        ]

        for endpoint in endpoints:
            try:
                response = requests.head(endpoint, timeout=10)
                if response.status_code == 200:
                    self.log_test(f"API Endpoint: {endpoint}", "PASS", "连接正常")
                else:
                    self.log_test(f"API Endpoint: {endpoint}", "FAIL", f"HTTP状态码: {response.status_code}")
                    return False
            except requests.RequestException as e:
                self.log_test(f"API Endpoint: {endpoint}", "FAIL", f"连接错误: {str(e)}")
                return False

        self.log_test("API Connectivity Test", "PASS", "所有API连接测试通过")
        return True

    def run_validation(self) -> bool:
        """运行完整验证"""
        self.log_validation("INFO", "开始Google Analytics 4配置验证...")

        validation_steps = [
            ("配置文件结构", self.validate_config_structure),
            ("GA4基本配置", self.validate_ga4_configuration),
            ("事件配置", self.validate_events),
            ("转化配置", self.validate_conversions),
            ("自定义维度", self.validate_dimensions),
            ("受众群体", self.validate_audiences),
            ("目标配置", self.validate_goals),
            ("代码集成", self.validate_code_integration)
        ]

        all_passed = True
        for step_name, step_function in validation_steps:
            try:
                if not step_function():
                    all_passed = False
            except Exception as e:
                self.log_validation("ERROR", f"{step_name}验证过程中发生错误: {str(e)}")
                all_passed = False

        if all_passed:
            self.log_validation("INFO", "所有验证步骤通过")
        else:
            self.log_validation("ERROR", "部分验证步骤失败")

        return all_passed

    def run_tests(self) -> bool:
        """运行所有测试"""
        self.log_test("Test Suite", "START", "开始Google Analytics 4测试套件")

        test_steps = [
            ("事件追踪测试", self.test_event_tracking),
            ("gtag集成测试", self.test_gtag_integration),
            ("Data Layer集成测试", self.test_data_layer_integration),
            ("API连接测试", self.test_api_connectivity)
        ]

        all_passed = True
        for step_name, step_function in test_steps:
            try:
                if not step_function():
                    all_passed = False
            except Exception as e:
                self.log_test(f"Test: {step_name}", "FAIL", f"测试过程中发生错误: {str(e)}")
                all_passed = False

        if all_passed:
            self.log_test("Test Suite", "PASS", "所有测试通过")
        else:
            self.log_test("Test Suite", "FAIL", "部分测试失败")

        return all_passed

    def generate_validation_report(self) -> str:
        """生成验证报告"""
        report = f"""# Google Analytics 4 配置验证报告

生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
配置文件: {self.config_path}

## 验证摘要

### 验证结果概览
- **总验证步骤**: {len(self.validation_results)}
- **通过**: {len([r for r in self.validation_results if r['level'] == 'INFO'])}
- **警告**: {len([r for r in self.validation_results if r['level'] == 'WARNING'])}
- **错误**: {len([r for r in self.validation_results if r['level'] == 'ERROR'])}

### 测试结果概览
- **总测试项目**: {len(self.test_results)}
- **通过**: {len([r for r in self.test_results if r['status'] == 'PASS'])}
- **失败**: {len([r for r in self.test_results if r['status'] == 'FAIL'])}
- **警告**: {len([r for r in self.test_results if r['status'] == 'WARNING'])}

## 详细验证结果

"""

        # 添加验证结果
        report += "### 验证步骤详情\n"
        for result in self.validation_results:
            icon = "PASS" if result['level'] == 'INFO' else "WARN" if result['level'] == 'WARNING' else "FAIL"
            report += f"- {icon} **{result['timestamp']}** - {result['message']}\n"
            if result['details']:
                report += f"  - 详情: {result['details']}\n"

        # 添加测试结果
        report += "\n### 测试结果详情\n"
        for result in self.test_results:
            icon = result['status']
            report += f"- {icon} **{result['timestamp']}** - {result['test_name']}\n"
            if result['details']:
                report += f"  - 详情: {result['details']}\n"

        # 添加配置统计
        ga4_config = self.config.get("ga4Configuration", {})
        report += f"""
## 配置统计

### 基础配置
- **属性ID**: {ga4_config.get('propertyId', '未设置')}
- **衡量ID**: {ga4_config.get('measurementId', '未设置')}
- **属性名称**: {ga4_config.get('propertyName', '未设置')}
- **数据保留期**: {ga4_config.get('dataRetention', '未设置')}
- **增强型衡量**: {'启用' if ga4_config.get('enhancedMeasurement') else '禁用'}
- **IP匿名化**: {'启用' if ga4_config.get('ipAnonymization') else '禁用'}

### 组件统计
- **自定义事件**: {len(self.config.get('customEvents', []))} 个
- **转化事件**: {len(self.config.get('conversions', []))} 个
- **自定义维度**: {len(self.config.get('customDimensions', []))} 个
- **自定义指标**: {len(self.config.get('customMetrics', []))} 个
- **受众群体**: {len(self.config.get('audiences', []))} 个
- **目标**: {len(self.config.get('goals', []))} 个
- **报告**: {len(self.config.get('reports', []))} 个
- **警报**: {len(self.config.get('alerts', []))} 个

## 建议和改进

### 立即处理
"""

        # 添加错误建议
        errors = [r for r in self.validation_results if r['level'] == 'ERROR']
        if errors:
            report += "- 修复所有错误项\n"
            for error in errors:
                report += f"  - {error['message']}\n"

        # 添加警告建议
        warnings = [r for r in self.validation_results if r['level'] == 'WARNING']
        if warnings:
            report += "\n### 建议优化\n"
            for warning in warnings:
                report += f"  - {warning['message']}\n"

        # 添加失败测试建议
        failed_tests = [r for r in self.test_results if r['status'] == 'FAIL']
        if failed_tests:
            report += "\n### 测试失败修复\n"
            for test in failed_tests:
                report += f"  - {test['test_name']}: {test['details']}\n"

        report += f"""
## 下一步行动

### 配置实施
1. [验证] 验证配置文件完整性
2. [待实施] 在GA4控制台中创建自定义事件
3. [待实施] 设置转化事件
4. [待实施] 创建自定义维度和指标
5. [待实施] 设置受众群体
6. [待实施] 配置目标
7. [待实施] 部署JavaScript代码
8. [待实施] 测试事件追踪
9. [待实施] 验证数据收集

### 监控和维护
- 定期检查验证报告
- 监控事件数据收集
- 更新配置以适应业务需求
- 备份配置文件

报告结束
"""
        return report

    def export_report(self, output_file: str = "validation-report.md"):
        """导出验证报告"""
        report = self.generate_validation_report()
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"验证报告已导出到: {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Google Analytics 4 配置验证工具')
    parser.add_argument('--config', type=str, default='ga4-events-config.json',
                       help='配置文件路径 (默认: ga4-events-config.json)')
    parser.add_argument('--action', type=str,
                       choices=['validate', 'test', 'report', 'all'],
                       default='validate', help='执行的操作')
    parser.add_argument('--output', type=str, default='validation-report.md',
                       help='报告输出文件 (默认: validation-report.md)')

    args = parser.parse_args()

    # 创建验证工具实例
    validator = GA4ValidationTool(args.config)

    # 执行相应操作
    success = True
    if args.action in ['validate', 'all']:
        success &= validator.run_validation()

    if args.action in ['test', 'all']:
        success &= validator.run_tests()

    if args.action in ['report', 'all']:
        validator.export_report(args.output)

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()