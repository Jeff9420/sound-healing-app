/**
 * CRM端点测试脚本
 * 用于验证HubSpot API连接和配置
 */

const CRM_TEST_CONFIG = {
    // HubSpot测试端点
    hubspot: {
        testFormId: '12345678-abcd-efgh-ijkl-1234567890ab', // 测试表单ID，需要替换为实际ID
        testEndpoint: 'https://api.hsforms.com/submissions/v3/integration/submit/PORTAL_ID/FORM_GUID'
    },

    // 测试数据
    testData: {
        email: 'test@example.com',
        name: 'Test User',
        goal: '测试冥想目标',
        time: 'morning',
        form_name: '7日冥想挑战',
        funnel_step: 'step_1_signup',
        source: 'soundflows_app'
    }
};

/**
 * 测试HubSpot连接
 */
async function testHubSpotConnection() {
    console.log('🧪 测试HubSpot连接...');

    // 检查是否存在CRM bridge
    if (!window.crmBridge) {
        console.error('❌ CRM bridge未加载');
        return false;
    }

    // 检测端点类型
    const testEndpoint = CRM_TEST_CONFIG.hubspot.testEndpoint;
    const endpointType = window.crmBridge.detectEndpointType(testEndpoint);
    console.log('📍 检测到端点类型:', endpointType);

    // 测试数据转换
    const hubspotFormat = window.crmBridge.convertToHubSpotFormat(CRM_TEST_CONFIG.testData);
    console.log('🔄 转换为HubSpot格式:', hubspotFormat);

    // 实际发送测试（需要有效的端点）
    if (testEndpoint && !testEndpoint.includes('PORTAL_ID') && !testEndpoint.includes('FORM_GUID')) {
        try {
            console.log('📤 发送测试请求到HubSpot...');
            const result = await window.crmBridge.sendToCrm(testEndpoint, CRM_TEST_CONFIG.testData);
            console.log('✅ HubSpot测试成功:', result);
            return true;
        } catch (error) {
            console.error('❌ HubSpot测试失败:', error);
            return false;
        }
    } else {
        console.log('⚠️ 需要配置实际的HubSpot端点才能进行完整测试');
        console.log('请更新CRM_TEST_CONFIG.hubspot.testEndpoint为实际的HubSpot表单URL');
        return false;
    }
}

/**
 * 测试表单提交功能
 */
function testFormSubmission() {
    console.log('📝 测试表单提交功能...');

    // 查找页面中的表单
    const forms = document.querySelectorAll('form[data-crm-form]');

    if (forms.length === 0) {
        console.log('⚠️ 页面中没有找到CRM表单');
        return;
    }

    forms.forEach((form, index) => {
        console.log(`📋 表单 ${index + 1}:`, {
            id: form.id || '无ID',
            formName: form.dataset.crmForm,
            action: form.action,
            method: form.method
        });
    });
}

/**
 * 验证HubSpot配置
 */
function verifyHubSpotConfig() {
    console.log('🔍 验证HubSpot配置...');

    // 检查全局配置
    if (!window.SITE_CONFIG || !window.SITE_CONFIG.crm) {
        console.log('⚠️ 未找到CRM配置，请在SITE_CONFIG中添加');
        return false;
    }

    const crmConfig = window.SITE_CONFIG.crm;
    console.log('📋 CRM配置:', crmConfig);

    // 检查HubSpot特定配置
    if (crmConfig.hubspot) {
        console.log('✅ 找到HubSpot配置:', crmConfig.hubspot);

        // 验证必需字段
        const requiredFields = ['portalId', 'formGuid'];
        const missingFields = requiredFields.filter(field => !crmConfig.hubspot[field]);

        if (missingFields.length > 0) {
            console.log('⚠️ 缺少HubSpot配置字段:', missingFields);
            return false;
        }

        console.log('✅ HubSpot配置完整');
        return true;
    }

    console.log('⚠️ 未找到HubSpot配置');
    return false;
}

/**
 * 运行所有CRM测试
 */
async function runCrmTests() {
    console.log('🚀 开始CRM集成测试...');
    console.log('=' .repeat(50));

    // 1. 验证配置
    const configValid = verifyHubSpotConfig();

    // 2. 测试表单
    testFormSubmission();

    // 3. 测试连接（如果配置有效）
    if (configValid) {
        await testHubSpotConnection();
    } else {
        console.log('⚠️ 跳过连接测试，配置不完整');
    }

    console.log('=' .repeat(50));
    console.log('🏁 CRM测试完成');
}

// 导出测试函数
if (typeof window !== 'undefined') {
    window.testCrm = {
        runTests: runCrmTests,
        testHubSpot: testHubSpotConnection,
        testForms: testFormSubmission,
        verifyConfig: verifyHubSpotConfig
    };

    // 自动运行测试（如果在开发环境）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runCrmTests, 2000);
        });
    }
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runCrmTests,
        testHubSpotConnection,
        testFormSubmission,
        verifyHubSpotConfig,
        CRM_TEST_CONFIG
    };
}