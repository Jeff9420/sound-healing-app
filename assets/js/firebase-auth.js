/**
 * Firebase Auth Module (v9 SDK)
 * Firebase 认证模块
 *
 * 统一封装 v9 模块化 API，避免在其它模块中直接依赖 SDK 原生 API，
 * 方便在 UI 层使用动态导入时获得兼容的包装函数。
 *
 * @version 2.1.0
 * @date 2025-10-21
 */

import { app } from './firebase-app.js';
import {
    getAuth,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    signInWithPopup as firebaseSignInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    signOut as firebaseSignOut,
    signInAnonymously as firebaseSignInAnonymously
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 共享认证实例
export const auth = getAuth(app);

/**
 * 订阅认证状态变化（已绑定 auth 实例）
 */
export function onAuthStateChanged(callback) {
    return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * 支持 UI 层默认使用包装好的登录方法，同时兼容传入自定义 auth 实例
 */
export async function signInWithPopup(authInstance = auth, provider = new GoogleAuthProvider()) {
    return firebaseSignInWithPopup(authInstance, provider);
}

export { GoogleAuthProvider };

export async function signInWithEmailAndPassword(authInstance = auth, email, password) {
    return firebaseSignInWithEmailAndPassword(authInstance, email, password);
}

export async function createUserWithEmailAndPassword(authInstance = auth, email, password) {
    return firebaseCreateUserWithEmailAndPassword(authInstance, email, password);
}

export async function sendPasswordResetEmail(authInstance = auth, email) {
    return firebaseSendPasswordResetEmail(authInstance, email);
}

export async function signOut(authInstance = auth) {
    return firebaseSignOut(authInstance);
}

export async function signInAnonymously(authInstance = auth) {
    return firebaseSignInAnonymously(authInstance);
}

export function getCurrentUser(authInstance = auth) {
    return authInstance.currentUser;
}

export function onAuthStateChange(callback) {
    console.warn('onAuthStateChange(callback) 已弃用，请使用 onAuthStateChanged(callback)');
    return onAuthStateChanged(callback);
}
