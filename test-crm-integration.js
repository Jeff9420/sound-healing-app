/**
 * CRM 集成测试脚本
 * 在浏览器控制台中运行此脚本来测试 CRM 集成
 */

// CRM 测试套件
(function() {
    'use strict';

    const CRM_TEST = {
        // 配置信息
        config: window.SITE_CONFIG || {},
        bridge: window.crmBridge || {},

        // 测试结果
        results: [],

        // 日志函数
        log: function(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[CRM Test ${timestamp}]`;

            switch(type) {
                case 'success':
                    console.log(`%c${prefix} ✅ ${message}`, 'color: #4caf50');
                    break;
                case 'error':
                    console.error(`%c${prefix} ❌ ${message}`, 'color: #f44336');
                    break;
                case 'warning':
                    console.warn(`%c${prefix} ⚠️ ${message}`, 'color: #ff9800');
                    break;
                default:
                    console.log(`%c${prefix} ℹ️ ${message}`, 'color: #2196f3');
            }
        },

        // 检查配置
        checkConfig: function() {
            this.log('开始检查 CRM 配置...', 'info');

            const checks = [
                {
                    name: 'SITE_CONFIG 存在',
                    check: () => !!window.SITE_CONFIG
                },
                {
                    name: 'CRM Bridge 存在',
                    check: () => !!window.crmBridge
                },
                {
                    name: '计划端点配置',
                    check: () => !!this.config.planEndpoint
                },
                {
                    name: '订阅端点配置',
                    check: () => !!this.config.subscribeEndpoint
                },
                {
                    name: '邮件自动化配置',
                    check: () => !!this.config.emailAutomation
                }
            ];

            let allPassed = true;
            checks.forEach(check => {
                const passed = check.check();
                this.log(`${check.name}: ${passed ? '✅' : '❌'}`, passed ? 'success' : 'error');
                if (!passed) allPassed = false;
            });

            return allPassed;
        },

        // 生成测试数据
        generateTestData: function(type) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);

            switch(type) {
                case 'plan':
                    return {
                        email: `test.plan.${timestamp}@example.com`,
                        name: `测试用户${random}`,
                        goal: 'stress',
                        time: '10-20',
                        event: 'plan_submit_test',
                        form_name: 'test-script',
                        timestamp: new Date().toISOString()
                    };

                case 'subscribe':
                    return {
                        email: `test.sub.${timestamp}@example.com`,
                        name: `订阅用户${random}`,
                        company: `测试公司${random}`,
                        event: 'subscribe_test',
                        form_name: 'test-script',
                        timestamp: new Date().toISOString()
                    };

                default:
                    return {};
            }
        },

        // 测试计划提交
        testPlanSubmit: async function() {
            this.log('测试冥想计划提交...', 'info');

            try {
                const data = this.generateTestData('plan');
                const result = await this.bridge.sendToCrm(this.config.planEndpoint, data);

                this.log('冥想计划提交成功', 'success');
                console.log('提交数据:', data);
                console.log('CRM 响应:', result);

                this.results.push({ test: 'plan', status: 'success', data, result });
                return true;
            } catch (error) {
                this.log(`冥想计划提交失败: ${error.message}`, 'error');
                console.error('错误详情:', error);

                this.results.push({ test: 'plan', status: 'error', error: error.message });
                return false;
            }
        },

        // 测试订阅提交
        testSubscribeSubmit: async function() {
            this.log('测试资源订阅提交...', 'info');

            try {
                const data = this.generateTestData('subscribe');
                const result = await this.bridge.sendToCrm(this.config.subscribeEndpoint, data);

                this.log('资源订阅提交成功', 'success');
                console.log('提交数据:', data);
                console.log('CRM 响应:', result);

                this.results.push({ test: 'subscribe', status: 'success', data, result });
                return true;
            } catch (error) {
                this.log(`资源订阅提交失败: ${error.message}`, 'error');
                console.error('错误详情:', error);

                this.results.push({ test: 'subscribe', status: 'error', error: error.message });
                return false;
            }
        },

        // 测试错误处理
        testErrorHandling: async function() {
            this.log('测试错误处理...', 'info');

            const errorTests = [
                {
                    name: '无效邮箱',
                    test: () => this.bridge.sendToCrm(this.config.planEndpoint, {
                        email: 'invalid-email',
                        name: '测试'
                    })
                },
                {
                    name: '空数据',
                    test: () => this.bridge.sendToCrm(this.config.planEndpoint, {})
                },
                {
                    name: '无效端点',
                    test: () => this.bridge.sendToCrm('https://invalid-endpoint.com/api', {})
                }
            ];

            for (const errorTest of errorTests) {
                try {
                    await errorTest.test();
                    this.log(`${errorTest.name}: 应该失败但成功了`, 'warning');
                } catch (error) {
                    this.log(`${errorTest.name}: 正确捕获错误 - ${error.message}`, 'success');
                }
            }
        },

        // 批量测试
        batchTest: async function(count = 5) {
            this.log(`开始批量测试 (${count} 个计划 + ${count} 个订阅)...`, 'info');

            for (let i = 0; i < count; i++) {
                this.log(`测试 ${i + 1}/${count}...`, 'info');

                await this.testPlanSubmit();
                await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms

                await this.testSubscribeSubmit();
                await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms
            }

            this.log(`批量测试完成！共提交 ${count * 2} 条记录`, 'success');
        },

        // 生成测试报告
        generateReport: function() {
            const success = this.results.filter(r => r.status === 'success').length;
            const error = this.results.filter(r => r.status === 'error').length;
            const total = this.results.length;

            console.log('\n📊 CRM 测试报告');
            console.log('================');
            console.log(`总测试数: ${total}`);
            console.log(`成功: ${success} ✅`);
            console.log(`失败: ${error} ❌`);
            console.log(`成功率: ${total > 0 ? ((success / total) * 100).toFixed(2) : 0}%`);

            if (error > 0) {
                console.log('\n❌ 失败的测试:');
                this.results
                    .filter(r => r.status === 'error')
                    .forEach(r => {
                        console.log(`  - ${r.test}: ${r.error}`);
                    });
            }

            return { total, success, error, rate: total > 0 ? (success / total) : 0 };
        },

        // 运行完整测试套件
        runFullTest: async function() {
            console.clear();
            console.log('🚀 开始 CRM 完整测试套件...\n');

            // 1. 检查配置
            const configOk = this.checkConfig();
            if (!configOk) {
                this.log('配置检查失败，请先配置 CRM', 'error');
                return;
            }

            // 2. 测试计划提交
            await this.testPlanSubmit();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. 测试订阅提交
            await this.testSubscribeSubmit();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 4. 测试错误处理
            await this.testErrorHandling();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 5. 生成报告
            this.generateReport();

            this.log('\n✨ 测试完成！请登录 HubSpot 查看测试数据', 'success');
            console.log('\n💡 提示:');
            console.log('- 在 HubSpot Contacts 中搜索 "test.plan." 或 "test.sub." 查看测试联系人');
            console.log('- 检查 Marketing > Forms 查看表单提交记录');
            console.log('- 检查 Automation > Workflows 查看自动化执行情况');
        }
    };

    // 导出到全局
    window.CRM_TEST = CRM_TEST;

    // 快捷命令
    window.crmTest = CRM_TEST.runFullTest.bind(CRM_TEST);
    window.crmBatch = CRM_TEST.batchTest.bind(CRM_TEST);
    window.crmConfig = CRM_TEST.checkConfig.bind(CRM_TEST);

    console.log('🔧 CRM 测试工具已加载！');
    console.log('\n可用命令:');
    console.log('  crmTest()        - 运行完整测试套件');
    console.log('  crmBatch(n)      - 批量测试 n 条记录');
    console.log('  crmConfig()      - 检查配置');
    console.log('  CRM_TEST         - 访问所有测试方法');
    console.log('\n运行 crmTest() 开始测试');
})();

// 立即显示欢迎信息
console.log('%c🎯 CRM 集成测试工具', 'font-size: 20px; color: #6666ff; font-weight: bold;');
console.log('%c请在 HubSpot 中查看测试结果: https://app.hubspot.com', 'font-size: 14px; color: #666;');