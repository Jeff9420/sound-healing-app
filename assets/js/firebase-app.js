/**
 * Firebase App Module (v9 SDK)
 * Firebase 应用模块
 *
 * @version 2.1.0 - Security Enhanced
 * @date 2025-01-20
 *
 * 安全说明：
 * - Firebase Web API密钥可以公开（Firebase设计如此）
 * - 真正的安全由Firebase安全规则保护
 * - 已在Firebase Console配置：
 *   ✓ 应用检查（App Check）已启用
 *   ✓ API密钥限制为 soundflows.app 域名
 *   ✓ Firestore安全规则已配置
 */

import { initializeApp as firebaseInit } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

// Firebase配置
// 注意：这些密钥已在Firebase Console中配置域名限制
const firebaseConfig = {
    apiKey: "AIzaSyBYWHyLw8jSXSyJ6m1aJ9-yuSmAUud26UY",
    authDomain: "sound-healing-app.firebaseapp.com",
    projectId: "sound-healing-app",
    storageBucket: "sound-healing-app.firebasestorage.app",
    messagingSenderId: "724807513851",
    appId: "1:724807513851:web:eeb170e1746da0359b225e",
    measurementId: "G-CX8BF4THBQ"
};

// 初始化并导出 Firebase App
export const app = firebaseInit(firebaseConfig);

// 验证运行环境（仅在生产环境运行）
if (window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.includes('soundflows.app')) {
    console.warn('⚠️ Firebase仅允许在授权域名使用');
}