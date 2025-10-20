/**
 * Firebase Firestore Module (v9 SDK)
 * Firebase 数据库模块
 *
 * @version 2.0.0
 * @date 2025-01-20
 */

import { app } from './firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 导出数据库实例和相关函数
export const db = getFirestore(app);
export { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit };

// 便捷函数
export async function saveUserDocument(userId, data) {
    try {
        await setDoc(doc(db, 'users', userId), data, { merge: true });
        return true;
    } catch (error) {
        console.error('保存用户数据失败:', error);
        return false;
    }
}

export async function getUserDocument(userId) {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return null;
    }
}

export async function updateUserDocument(userId, data) {
    try {
        await updateDoc(doc(db, 'users', userId), data);
        return true;
    } catch (error) {
        console.error('更新用户数据失败:', error);
        return false;
    }
}