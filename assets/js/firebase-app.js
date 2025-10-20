/**
 * Firebase App Module (v9 SDK)
 * Firebase 应用模块
 *
 * @version 2.0.0
 * @date 2025-01-20
 */

import { initializeApp as firebaseInit } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

// Firebase配置
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