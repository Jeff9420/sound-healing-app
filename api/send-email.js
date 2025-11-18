/**
 * Formspree API 代理
 * Vercel Serverless Function
 *
 * 用途：
 * 1. 隐藏 Formspree Form ID
 * 2. 添加速率限制
 * 3. 验证请求来源
 * 4. 防止垃圾邮件滥用
 *
 * @version 1.0.0
 */

// 速率限制存储（内存中，生产环境建议使用Redis）
const rateLimitStore = new Map();

// 配置
const CONFIG = {
    // Formspree Form ID（从环境变量读取）
    FORMSPREE_FORM_ID: process.env.FORMSPREE_FORM_ID || 'mldpqopn',

    // 允许的来源
    ALLOWED_ORIGINS: [
        'https://soundflows.app',
        'https://www.soundflows.app',
        'http://localhost:3000',  // 开发环境
        'http://127.0.0.1:3000'   // 开发环境
    ],

    // 速率限制（每IP每小时最多发送次数）
    RATE_LIMIT: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60 * 60 * 1000  // 1小时
    }
};

/**
 * 检查速率限制
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const key = `rate_${ip}`;

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetAt: now + CONFIG.RATE_LIMIT.WINDOW_MS });
        return true;
    }

    const record = rateLimitStore.get(key);

    // 重置窗口已过期
    if (now > record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + CONFIG.RATE_LIMIT.WINDOW_MS });
        return true;
    }

    // 检查是否超过限制
    if (record.count >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
        return false;
    }

    // 增加计数
    record.count++;
    return true;
}

/**
 * 验证请求来源
 */
function validateOrigin(req) {
    const origin = req.headers.origin || req.headers.referer;

    if (!origin) {
        return false;
    }

    return CONFIG.ALLOWED_ORIGINS.some(allowed =>
        origin.startsWith(allowed)
    );
}

/**
 * 验证邮件数据
 */
function validateEmailData(data) {
    // 检查必需字段
    if (!data.email || !data.message) {
        return { valid: false, error: '缺少必需字段' };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return { valid: false, error: '邮箱格式无效' };
    }

    // 验证邮箱长度
    if (data.email.length > 254) {
        return { valid: false, error: '邮箱地址过长' };
    }

    // 验证消息长度
    if (data.message.length > 5000) {
        return { valid: false, error: '消息内容过长' };
    }

    // 检查垃圾邮件关键词（简单过滤）
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations'];
    const messageL

ower = data.message.toLowerCase();
    if (spamKeywords.some(keyword => messageLower.includes(keyword))) {
        return { valid: false, error: '消息包含不允许的内容' };
    }

    return { valid: true };
}

/**
 * 主处理函数
 */
export default async function handler(req, res) {
    // 设置CORS头
    const origin = req.headers.origin;
    if (CONFIG.ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method Not Allowed',
            message: '仅支持POST请求'
        });
    }

    try {
        // 1. 验证来源
        if (!validateOrigin(req)) {
            console.warn('❌ 无效的请求来源:', req.headers.origin);
            return res.status(403).json({
                error: 'Forbidden',
                message: '请求来源未授权'
            });
        }

        // 2. 检查速率限制
        const ip = req.headers['x-forwarded-for'] ||
                   req.headers['x-real-ip'] ||
                   req.connection.remoteAddress ||
                   'unknown';

        if (!checkRateLimit(ip)) {
            console.warn('❌ 速率限制触发:', ip);
            return res.status(429).json({
                error: 'Too Many Requests',
                message: '请求过于频繁，请稍后再试'
            });
        }

        // 3. 验证数据
        const emailData = req.body;
        const validation = validateEmailData(emailData);

        if (!validation.valid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: validation.error
            });
        }

        // 4. 转发到Formspree
        const formspreeUrl = `https://formspree.io/f/${CONFIG.FORMSPREE_FORM_ID}`;

        const formspreeResponse = await fetch(formspreeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const responseData = await formspreeResponse.json();

        // 5. 返回结果
        if (formspreeResponse.ok) {
            console.log('✅ 邮件发送成功:', emailData.email);
            return res.status(200).json({
                success: true,
                message: '邮件发送成功',
                data: responseData
            });
        } else {
            console.error('❌ Formspree错误:', responseData);
            return res.status(formspreeResponse.status).json({
                error: 'Email Send Failed',
                message: '邮件发送失败',
                details: responseData
            });
        }

    } catch (error) {
        console.error('❌ 服务器错误:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: '服务器错误，请稍后重试'
        });
    }
}
