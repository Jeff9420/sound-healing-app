/**
 * Cloud Sync Manager
 * 云端数据同步管理器
 *
 * 功能：
 * 1. 同步收藏、历史记录到云端
 * 2. 跨设备数据同步
 * 3. 离线队列管理
 * 4. 冲突解决策略
 *
 * @version 2.0.0
 * @date 2025-10-12
 */

class CloudSyncManager {
    constructor() {
        this.db = null;
        this.userId = null;
        this.syncQueue = [];
        this.isSyncing = false;
        this.lastSyncTime = null;

        // 防抖定时器
        this.debounceTimer = null;
        this.debounceDelay = 2000; // 2秒防抖

        this.init();
    }

    /**
     * 初始化同步管理器
     */
    async init() {
        console.log('☁️ 初始化云端同步管理器...');

        // 等待Firebase初始化
        await this.waitForFirebase();

        if (typeof firebase !== 'undefined' && firebase.firestore) {
            this.db = firebase.firestore();

            // 监听用户登录状态
            window.addEventListener('userSignedIn', (e) => {
                this.onUserSignedIn(e.detail.user);
            });

            window.addEventListener('userSignedOut', () => {
                this.onUserSignedOut();
            });

            console.log('✅ 云端同步管理器初始化完成');
        } else {
            console.warn('⚠️ Firestore不可用，仅使用本地存储');
        }
    }

    /**
     * 等待Firebase加载
     */
    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    /**
     * 用户登录时
     */
    async onUserSignedIn(user) {
        this.userId = user.uid;
        console.log('☁️ 用户已登录，开始同步数据...', this.userId);

        // 从云端拉取数据并合并到本地
        await this.pullFromCloud();

        // 将本地数据推送到云端
        await this.syncLocalToCloud();
    }

    /**
     * 用户登出时
     */
    onUserSignedOut() {
        this.userId = null;
        console.log('☁️ 用户已登出，停止云端同步');
    }

    /**
     * 从云端拉取数据
     */
    async pullFromCloud() {
        if (!this.db || !this.userId) {
            return;
        }

        try {
            console.log('📥 从云端拉取数据...');

            const userDoc = await this.db.collection('users').doc(this.userId).get();

            if (userDoc.exists) {
                const cloudData = userDoc.data();

                // 合并云端数据到本地
                this.mergeCloudDataToLocal(cloudData);

                console.log('✅ 云端数据已拉取并合并');
            } else {
                console.log('📝 云端无数据，创建新用户文档');
                await this.createUserDocument();
            }
        } catch (error) {
            console.error('❌ 拉取云端数据失败:', error);
        }
    }

    /**
     * 合并云端数据到本地
     */
    mergeCloudDataToLocal(cloudData) {
        // 获取本地数据管理器
        const userDataManager = window.userDataManager;
        if (!userDataManager) {
            console.warn('⚠️ UserDataManager不可用');
            return;
        }

        // 合并收藏
        if (cloudData.favorites && Array.isArray(cloudData.favorites)) {
            const localFavorites = userDataManager.getFavorites();
            const mergedFavorites = this.mergeLists(localFavorites, cloudData.favorites, 'trackId');
            userDataManager.favorites = mergedFavorites;
            localStorage.setItem('favorites', JSON.stringify(mergedFavorites));
        }

        // 合并历史记录
        if (cloudData.history && Array.isArray(cloudData.history)) {
            const localHistory = userDataManager.getHistory();
            const mergedHistory = this.mergeLists(localHistory, cloudData.history, 'trackId');
            userDataManager.history = mergedHistory;
            localStorage.setItem('history', JSON.stringify(mergedHistory));
        }

        // 合并用户偏好
        if (cloudData.preferences) {
            const localPreferences = userDataManager.preferences;
            const mergedPreferences = { ...localPreferences, ...cloudData.preferences };
            userDataManager.preferences = mergedPreferences;
            localStorage.setItem('userPreferences', JSON.stringify(mergedPreferences));
        }

        console.log('✅ 数据合并完成');
    }

    /**
     * 合并列表（去重）
     */
    mergeLists(local, cloud, key) {
        const merged = [...cloud];
        const cloudIds = new Set(cloud.map(item => item[key]));

        // 添加本地独有的项
        local.forEach(item => {
            if (!cloudIds.has(item[key])) {
                merged.push(item);
            }
        });

        return merged;
    }

    /**
     * 同步本地数据到云端
     */
    async syncLocalToCloud() {
        if (!this.db || !this.userId) {
            return;
        }

        // 防抖：避免频繁同步
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(async () => {
            await this.performSync();
        }, this.debounceDelay);
    }

    /**
     * 执行同步
     */
    async performSync() {
        if (this.isSyncing) {
            console.log('⏳ 同步进行中，跳过本次请求');
            return;
        }

        this.isSyncing = true;

        try {
            console.log('📤 同步本地数据到云端...');

            const userDataManager = window.userDataManager;
            if (!userDataManager) {
                throw new Error('UserDataManager不可用');
            }

            const syncData = {
                favorites: userDataManager.getFavorites(),
                history: userDataManager.getHistory(),
                preferences: userDataManager.preferences,
                lastSyncTime: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('users').doc(this.userId).set(syncData, { merge: true });

            this.lastSyncTime = new Date();
            console.log('✅ 数据已同步到云端');

            // 触发同步完成事件
            window.dispatchEvent(new CustomEvent('cloudSyncComplete', {
                detail: { success: true }
            }));

        } catch (error) {
            console.error('❌ 同步失败:', error);

            // 添加到离线队列
            this.addToSyncQueue();

            window.dispatchEvent(new CustomEvent('cloudSyncComplete', {
                detail: { success: false, error: error.message }
            }));
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 创建用户文档
     */
    async createUserDocument() {
        if (!this.db || !this.userId) {
            return;
        }

        try {
            const userDataManager = window.userDataManager;
            const userData = {
                userId: this.userId,
                favorites: userDataManager ? userDataManager.getFavorites() : [],
                history: userDataManager ? userDataManager.getHistory() : [],
                preferences: userDataManager ? userDataManager.preferences : {},
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('users').doc(this.userId).set(userData);
            console.log('✅ 用户文档已创建');
        } catch (error) {
            console.error('❌ 创建用户文档失败:', error);
        }
    }

    /**
     * 添加收藏（并同步）
     */
    async addFavorite(trackId, trackName, categoryKey) {
        // 更新本地
        if (window.userDataManager) {
            window.userDataManager.addFavorite(trackId, trackName, categoryKey);
        }

        // 同步到云端
        await this.syncLocalToCloud();
    }

    /**
     * 移除收藏（并同步）
     */
    async removeFavorite(trackId) {
        // 更新本地
        if (window.userDataManager) {
            window.userDataManager.removeFavorite(trackId);
        }

        // 同步到云端
        await this.syncLocalToCloud();
    }

    /**
     * 添加历史记录（并同步）
     */
    async addHistory(trackId, trackName, categoryKey, duration) {
        // 更新本地
        if (window.userDataManager) {
            window.userDataManager.addHistory(trackId, trackName, categoryKey, duration);
        }

        // 同步到云端（防抖，避免频繁同步）
        await this.syncLocalToCloud();
    }

    /**
     * 添加到离线同步队列
     */
    addToSyncQueue() {
        const userDataManager = window.userDataManager;
        if (!userDataManager) {
            return;
        }

        this.syncQueue.push({
            timestamp: Date.now(),
            data: {
                favorites: userDataManager.getFavorites(),
                history: userDataManager.getHistory(),
                preferences: userDataManager.preferences
            }
        });

        // 保存到localStorage
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    /**
     * 处理离线队列
     */
    async processSyncQueue() {
        if (this.syncQueue.length === 0 || !this.userId) {
            return;
        }

        console.log(`📦 处理离线队列，共 ${this.syncQueue.length} 条`);

        while (this.syncQueue.length > 0) {
            const item = this.syncQueue.shift();

            try {
                await this.db.collection('users').doc(this.userId).set(item.data, { merge: true });
                console.log('✅ 离线数据已同步');
            } catch (error) {
                console.error('❌ 离线数据同步失败:', error);
                // 重新加入队列
                this.syncQueue.unshift(item);
                break;
            }
        }

        // 更新localStorage
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    /**
     * 强制同步
     */
    async forceSync() {
        // 清除防抖定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        await this.performSync();
    }

    /**
     * 获取同步状态
     */
    getSyncStatus() {
        return {
            isSyncing: this.isSyncing,
            lastSyncTime: this.lastSyncTime,
            queueLength: this.syncQueue.length,
            userId: this.userId
        };
    }
}

// 自动初始化
let cloudSyncManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cloudSyncManager = new CloudSyncManager();
        window.cloudSyncManager = cloudSyncManager;
    });
} else {
    cloudSyncManager = new CloudSyncManager();
    window.cloudSyncManager = cloudSyncManager;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncManager;
}
