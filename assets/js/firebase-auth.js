/**
 * Firebase Auth Module (v9 SDK)
 * Firebase 认证模块
 *
 * @version 2.0.0
 * @date 2025-01-20
 */

import { app } from './firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 导出认证实例和相关函数
export const auth = getAuth(app);
export { onAuthStateChanged };

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
}

export async function signInWithEmail(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
}

export async function logout() {
    return await signOut(auth);
}

export async function signInAnonym() {
    return await signInAnonymously(auth);
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}