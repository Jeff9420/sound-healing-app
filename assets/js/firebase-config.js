/**
 * Firebase Configuration and Initialization
 * Firebase配置和初始化
 *
 * @version 2.0.0
 * @date 2025-10-12
 */

// Firebase配置（需要替换为实际配置）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Firebase服务初始化状态
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

/**
 * 初始化Firebase服务
 */
async function initializeFirebase() {
    try {
        console.log('🔥 初始化Firebase服务...');

        // 检查Firebase SDK是否加载
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK未加载，使用本地存储模式');
            return false;
        }

        // 初始化Firebase App
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase App初始化成功');
        } else {
            firebaseApp = firebase.app();
        }

        // 初始化Authentication
        firebaseAuth = firebase.auth();
        console.log('✅ Firebase Auth初始化成功');

        // 初始化Firestore
        firebaseDb = firebase.firestore();
        console.log('✅ Firestore初始化成功');

        // 初始化Storage
        firebaseStorage = firebase.storage();
        console.log('✅ Firebase Storage初始化成功');

        // 监听认证状态变化
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 用户已登录:', user.email);
                onUserSignedIn(user);
            } else {
                console.log('👤 用户未登录');
                onUserSignedOut();
            }
        });

        return true;

    } catch (error) {
        console.error('❌ Firebase初始化失败:', error);
        return false;
    }
}

/**
 * 用户登录时的回调
 */
function onUserSignedIn(user) {
    // 触发全局事件
    window.dispatchEvent(new CustomEvent('userSignedIn', {
        detail: { user }
    }));

    // 同步本地数据到云端
    if (window.cloudSyncManager) {
        window.cloudSyncManager.syncLocalToCloud(user.uid);
    }
}

/**
 * 用户登出时的回调
 */
function onUserSignedOut() {
    // 触发全局事件
    window.dispatchEvent(new CustomEvent('userSignedOut'));
}

/**
 * 获取当前用户
 */
function getCurrentUser() {
    return firebaseAuth ? firebaseAuth.currentUser : null;
}

/**
 * 检查用户是否已登录
 */
function isUserSignedIn() {
    return !!getCurrentUser();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFirebase,
        getCurrentUser,
        isUserSignedIn,
        firebaseAuth,
        firebaseDb,
        firebaseStorage
    };
}

// 自动初始化（延迟到DOM加载完成）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 延迟初始化，等待Firebase SDK加载
        setTimeout(initializeFirebase, 1000);
    });
} else {
    setTimeout(initializeFirebase, 1000);
}
