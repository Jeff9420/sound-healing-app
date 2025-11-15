// Formspree 快速配置脚本
// Form ID: mldpqopn

// 1. 保存Form ID到localStorage
localStorage.setItem('formspreeFormId', 'mldpqopn');
console.log('✅ Form ID已保存: mldpqopn');

// 2. 创建全局配置对象
window.FORMSPREE_CONFIG = {
    formId: 'mldpqopn',
    endpoint: 'https://formspree.io/f/mldpqopn',
    monthlyLimit: 50,
    isActive: true
};

// 3. 自动初始化Formspree服务
function initFormspreeService() {
    // 保存配置到localStorage（如果还没有保存）
    if (!localStorage.getItem('formspreeFormId')) {
        localStorage.setItem('formspreeFormId', 'mldpqopn');
    }

    // 加载Formspree邮件服务
    if (typeof FormspeeEmailService !== 'undefined') {
        const formspreeService = new FormspeeEmailService('mldpqopn');
        window.emailService = formspreeService;

        console.log('✅ Formspree邮件服务已初始化');
        console.log(`📊 每月免费额度: ${formspreeService.monthlyLimit} 封邮件`);
        console.log(`🔗 端点: ${formspreeService.endpoint}`);

        return formspreeService;
    }
}

// 4. 测试函数
async function testFormspreeEmail() {
    if (!window.emailService) {
        console.error('❌ 邮件服务未初始化');
        return;
    }

    const result = await window.emailService.sendEmail({
        to: 'test@example.com',
        subject: '测试邮件 - Formspree',
        html: `
            <h2>📧 Formspree 测试邮件</h2>
            <p>这是一封测试邮件，验证Formspree邮件服务是否正常工作。</p>
            <p><strong>Form ID:</strong> mldpqopn</p>
            <p><strong>发送时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
        `
    });

    if (result.success) {
        console.log('✅ 测试邮件发送成功！');
    } else {
        console.error('❌ 测试邮件发送失败:', result.error);
    }

    return result;
}

// 5. 暴露到全局作用域
window.initFormspreeService = initFormspreeService;
window.testFormspreeEmail = testFormspreeEmail;

// 6. 页面加载后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    initFormspreeService();

    // 显示配置成功提示
    console.log(`
🎉 Formspree配置成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Form ID: mldpqopn
端点: https://formspree.io/f/mldpqopn
免费额度: 50封/月
状态: ✅ 已激活
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 使用方法：
1. 测试邮件: testFormspreeEmail()
2. 发送邮件: window.emailService.sendEmail(options)
3. 查看统计: window.emailService.getSendingStats()
    `);
});

console.log('✅ Formspree配置脚本已加载');