/**
 * Sentry 配置验证脚本
 * 用于验证新的 Sentry DSN 和配置是否正确
 */

// 在浏览器控制台中运行此脚本
function verifySentryConfig() {
    console.group('🔍 Sentry 配置验证');

    // 1. 检查 Sentry 是否加载
    if (!window.Sentry) {
        console.error('❌ Sentry 未加载');
        console.groupEnd();
        return false;
    }
    console.log('✅ Sentry 已加载');

    // 2. 检查 DSN
    const config = window.SentryConfig || {};
    if (config.dsn) {
        console.log('✅ DSN 已配置:', config.dsn.substring(0, 50) + '...');
    } else {
        console.error('❌ DSN 未配置');
    }

    // 3. 检查 PII 设置
    console.log('✅ PII 设置:', {
        sendDefaultPii: config.sendDefaultPii,
        environment: config.environment,
        release: config.release
    });

    // 4. 发送测试事件
    console.log('📤 发送测试事件...');

    // 测试消息
    window.trackEvent('Sentry 配置验证测试', 'info', {
        extra: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            testType: 'config-verification'
        }
    });

    // 测试错误（包含敏感数据）
    window.trackError(new Error('配置验证测试错误 - 包含敏感数据: password=secret123'), {
        test: true,
        sensitiveInfo: 'token=abc123def456',
        url: 'https://example.com/api?password=mypass&key=apikey'
    });

    console.log('✅ 测试事件已发送');
    console.log('📊 请在 Sentry 控制台查看: https://sentry.io');

    console.groupEnd();
    return true;
}

// 验证用户追踪
function verifyUserTracking() {
    console.group('👤 用户追踪验证');

    if (!window.Sentry) {
        console.error('❌ Sentry 未初始化');
        console.groupEnd();
        return;
    }

    // 设置测试用户
    window.Sentry.setUser({
        id: 'verify-user-' + Date.now(),
        email: 'verify@example.com',
        username: '验证用户',
        ip_address: '{{auto}}'
    });

    console.log('✅ 测试用户已设置');

    // 发送用户相关事件
    window.trackEvent('用户追踪验证', 'info', {
        extra: {
            userId: 'verify-user-' + Date.now(),
            action: 'verification',
            timestamp: new Date().toISOString()
        }
    });

    console.log('✅ 用户追踪事件已发送');
    console.groupEnd();
}

// 验证敏感数据过滤
function verifyPIIFiltering() {
    console.group('🔒 PII 过滤验证');

    const sensitiveStrings = [
        'password=secret123',
        'token=abc123def456',
        'authorization=bearer xyz',
        'sessionid=session123',
        'cookie=value123',
        'secret=mysecret'
    ];

    const testError = new Error('PII 过滤测试 - ' + sensitiveStrings.join(', '));

    window.trackError(testError, {
        sensitiveHeaders: {
            'Authorization': 'Bearer token123',
            'Cookie': 'session=abc123',
            'X-API-Key': 'secretkey'
        },
        url: 'https://api.example.com/endpoint?password=mypass&token=xyz'
    });

    console.log('✅ PII 过滤测试已发送');
    console.log('⚠️ 请在 Sentry 中检查敏感数据是否被正确过滤');
    console.groupEnd();
}

// 完整验证流程
function runFullVerification() {
    console.log('🚀 开始完整的 Sentry 配置验证...\n');

    verifySentryConfig();
    setTimeout(() => {
        verifyUserTracking();
        setTimeout(() => {
            verifyPIIFiltering();
            console.log('\n✨ 验证完成！请到 Sentry 控制台查看结果');
        }, 1000);
    }, 1000);
}

// 导出验证函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        verifySentryConfig,
        verifyUserTracking,
        verifyPIIFiltering,
        runFullVerification
    };
} else {
    // 浏览器环境，挂载到 window
    window.SentryVerification = {
        verifySentryConfig,
        verifyUserTracking,
        verifyPIIFiltering,
        runFullVerification
    };
}

// 自动运行验证（如果在浏览器中）
if (typeof window !== 'undefined') {
    console.log('💡 Sentry 验证工具已加载');
    console.log('运行 runFullVerification() 开始完整验证');
}