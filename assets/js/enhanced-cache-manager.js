/**
 * 增强缓存管理器
 * 智能管理音频文件离线缓存和内存优化
 */

class EnhancedCacheManager {
    constructor() {
        this.cacheName = 'sound-healing-audio-cache';
        this.maxCacheSize = 200; // MB
        this.currentCacheSize = 0;
        this.cacheItems = new Map();
        this.accessTimes = new Map();
        this.downloadProgress = new Map();
        this.priorityQueue = [];
        
        // 缓存策略
        this.strategies = {
            lru: { enabled: true, weight: 0.4 },
            frequency: { enabled: true, weight: 0.3 },
            size: { enabled: true, weight: 0.3 }
        };
        
        this.initializeCacheManager();
    }
    
    async initializeCacheManager() {
        await this.loadCacheIndex();
        await this.calculateCurrentSize();
        this.setupPeriodicCleanup();
        
        console.log('📦 增强缓存管理器已初始化');
        console.log(`💾 缓存状态: ${this.currentCacheSize.toFixed(1)}MB / ${this.maxCacheSize}MB`);
    }
    
    /**
     * 加载缓存索引
     */
    async loadCacheIndex() {
        try {
            const stored = localStorage.getItem('audioCacheIndex');
            if (stored) {
                const data = JSON.parse(stored);
                this.cacheItems = new Map(data.items || []);
                this.accessTimes = new Map(data.accessTimes || []);
                console.log('📚 已加载缓存索引');
            }
        } catch (error) {
            console.warn('⚠️ 无法加载缓存索引:', error);
        }
    }
    
    /**
     * 保存缓存索引
     */
    saveCacheIndex() {
        try {
            const data = {
                items: Array.from(this.cacheItems.entries()),
                accessTimes: Array.from(this.accessTimes.entries()),
                lastUpdated: Date.now()
            };
            localStorage.setItem('audioCacheIndex', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ 无法保存缓存索引:', error);
        }
    }
    
    /**
     * 计算当前缓存大小
     */
    async calculateCurrentSize() {
        this.currentCacheSize = 0;
        
        try {
            const cache = await caches.open(this.cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const size = await this.estimateResponseSize(response);
                    const url = request.url;
                    const fileName = this.extractFileName(url);
                    
                    if (fileName) {
                        this.cacheItems.set(fileName, {
                            url,
                            size,
                            timestamp: Date.now(),
                            lastAccess: this.accessTimes.get(fileName) || Date.now()
                        });
                        this.currentCacheSize += size;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ 计算缓存大小时出错:', error);
        }
    }
    
    /**
     * 估算响应大小
     */
    async estimateResponseSize(response) {
        try {
            const clone = response.clone();
            const buffer = await clone.arrayBuffer();
            return buffer.byteLength / (1024 * 1024); // MB
        } catch (error) {
            return 5; // 默认估算值
        }
    }
    
    /**
     * 提取文件名
     */
    extractFileName(url) {
        const match = url.match(/\/([^\/]+\.mp3)$/);
        return match ? decodeURIComponent(match[1]) : null;
    }
    
    /**
     * 缓存音频文件
     */
    async cacheAudio(fileName, url, priority = 'normal') {
        if (this.cacheItems.has(fileName)) {
            this.recordAccess(fileName);
            return true;
        }
        
        try {
            console.log(`📥 开始缓存: ${fileName}`);
            
            const cache = await caches.open(this.cacheName);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const size = await this.estimateResponseSize(response.clone());
            
            // 检查空间是否足够
            if (this.currentCacheSize + size > this.maxCacheSize) {
                await this.makeSpace(size);
            }
            
            // 添加到缓存
            await cache.put(url, response);
            
            // 更新索引
            this.cacheItems.set(fileName, {
                url,
                size,
                timestamp: Date.now(),
                lastAccess: Date.now(),
                priority
            });
            
            this.currentCacheSize += size;
            this.recordAccess(fileName);
            this.saveCacheIndex();
            
            console.log(`✅ 缓存完成: ${fileName} (${size.toFixed(1)}MB)`);
            return true;
            
        } catch (error) {
            console.error(`❌ 缓存失败: ${fileName}`, error);
            return false;
        }
    }
    
    /**
     * 获取缓存音频
     */
    async getCachedAudio(fileName) {
        if (!this.cacheItems.has(fileName)) {
            return null;
        }
        
        try {
            const item = this.cacheItems.get(fileName);
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(item.url);
            
            if (response) {
                this.recordAccess(fileName);
                console.log(`⚡ 使用缓存音频: ${fileName}`);
                return response;
            } else {
                // 缓存中没有找到，清理索引
                this.removeCacheItem(fileName);
                return null;
            }
        } catch (error) {
            console.warn(`⚠️ 获取缓存音频失败: ${fileName}`, error);
            return null;
        }
    }
    
    /**
     * 记录访问
     */
    recordAccess(fileName) {
        const now = Date.now();
        this.accessTimes.set(fileName, now);
        
        if (this.cacheItems.has(fileName)) {
            const item = this.cacheItems.get(fileName);
            item.lastAccess = now;
            item.accessCount = (item.accessCount || 0) + 1;
        }
    }
    
    /**
     * 释放空间
     */
    async makeSpace(requiredSize) {
        const candidates = this.getEvictionCandidates();
        let freedSpace = 0;
        
        console.log(`🧹 需要释放空间: ${requiredSize.toFixed(1)}MB`);
        
        for (const candidate of candidates) {
            if (freedSpace >= requiredSize) break;
            
            const freed = await this.removeCacheItem(candidate.fileName);
            freedSpace += freed;
        }
        
        console.log(`✅ 已释放空间: ${freedSpace.toFixed(1)}MB`);
    }
    
    /**
     * 获取清理候选项
     */
    getEvictionCandidates() {
        const items = Array.from(this.cacheItems.entries());
        const now = Date.now();
        
        return items
            .map(([fileName, item]) => {
                let score = 0;
                
                // LRU策略
                if (this.strategies.lru.enabled) {
                    const hoursSinceAccess = (now - item.lastAccess) / (1000 * 60 * 60);
                    score += hoursSinceAccess * this.strategies.lru.weight;
                }
                
                // 使用频率策略
                if (this.strategies.frequency.enabled) {
                    const accessCount = item.accessCount || 1;
                    score += (10 / accessCount) * this.strategies.frequency.weight;
                }
                
                // 文件大小策略
                if (this.strategies.size.enabled) {
                    score += item.size * this.strategies.size.weight;
                }
                
                return {
                    fileName,
                    score,
                    size: item.size,
                    priority: item.priority || 'normal'
                };
            })
            .filter(item => item.priority !== 'high')
            .sort((a, b) => b.score - a.score);
    }
    
    /**
     * 删除缓存项
     */
    async removeCacheItem(fileName) {
        const item = this.cacheItems.get(fileName);
        if (!item) return 0;
        
        try {
            const cache = await caches.open(this.cacheName);
            await cache.delete(item.url);
            
            this.cacheItems.delete(fileName);
            this.accessTimes.delete(fileName);
            this.currentCacheSize -= item.size;
            
            console.log(`🗑️ 已删除缓存: ${fileName} (释放${item.size.toFixed(1)}MB)`);
            return item.size;
        } catch (error) {
            console.warn(`⚠️ 删除缓存项失败: ${fileName}`, error);
            return 0;
        }
    }
    
    /**
     * 批量预缓存
     */
    async batchCache(fileList, maxConcurrent = 3) {
        console.log(`🔄 开始批量缓存: ${fileList.length}个文件`);
        
        const semaphore = new Array(maxConcurrent).fill(null);
        const results = [];
        
        for (let i = 0; i < fileList.length; i += maxConcurrent) {
            const batch = fileList.slice(i, i + maxConcurrent);
            const promises = batch.map(async (file) => {
                const urls = window.configAdapter?.getFallbackUrls(file.categoryKey, file.fileName) || [];
                if (urls.length > 0) {
                    return await this.cacheAudio(file.fileName, urls[0], file.priority);
                }
                return false;
            });
            
            const batchResults = await Promise.allSettled(promises);
            results.push(...batchResults);
            
            // 小延迟避免过载
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ 批量缓存完成: ${successful}/${fileList.length}`);
        
        return results;
    }
    
    /**
     * 设置定期清理
     */
    setupPeriodicCleanup() {
        // 每30分钟清理一次
        setInterval(() => {
            this.cleanupExpiredItems();
        }, 30 * 60 * 1000);
        
        // 每5分钟检查缓存状态
        setInterval(() => {
            this.saveCacheIndex();
            console.log(`📊 缓存状态: ${this.cacheItems.size}项, ${this.currentCacheSize.toFixed(1)}MB`);
        }, 5 * 60 * 1000);
    }
    
    /**
     * 清理过期项
     */
    async cleanupExpiredItems() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
        const toRemove = [];
        
        for (const [fileName, item] of this.cacheItems.entries()) {
            if (now - item.lastAccess > maxAge) {
                toRemove.push(fileName);
            }
        }
        
        if (toRemove.length > 0) {
            console.log(`🧹 清理过期缓存: ${toRemove.length}项`);
            for (const fileName of toRemove) {
                await this.removeCacheItem(fileName);
            }
            this.saveCacheIndex();
        }
    }
    
    /**
     * 获取缓存统计
     */
    getStats() {
        const totalItems = this.cacheItems.size;
        const utilizationPercent = (this.currentCacheSize / this.maxCacheSize * 100).toFixed(1);
        
        return {
            totalItems,
            currentSize: this.currentCacheSize.toFixed(1) + 'MB',
            maxSize: this.maxCacheSize + 'MB',
            utilization: utilizationPercent + '%',
            hitRate: this.calculateHitRate(),
            oldestItem: this.getOldestItem(),
            newestItem: this.getNewestItem()
        };
    }
    
    /**
     * 计算命中率
     */
    calculateHitRate() {
        const hits = Array.from(this.cacheItems.values())
            .reduce((sum, item) => sum + (item.accessCount || 1), 0);
        return hits > 0 ? ((hits / this.cacheItems.size) * 100).toFixed(1) + '%' : '0%';
    }
    
    /**
     * 获取最旧项
     */
    getOldestItem() {
        let oldest = null;
        for (const [fileName, item] of this.cacheItems.entries()) {
            if (!oldest || item.lastAccess < oldest.lastAccess) {
                oldest = { fileName, ...item };
            }
        }
        return oldest ? {
            fileName: oldest.fileName,
            age: Math.round((Date.now() - oldest.lastAccess) / (1000 * 60 * 60)) + 'h'
        } : null;
    }
    
    /**
     * 获取最新项
     */
    getNewestItem() {
        let newest = null;
        for (const [fileName, item] of this.cacheItems.entries()) {
            if (!newest || item.lastAccess > newest.lastAccess) {
                newest = { fileName, ...item };
            }
        }
        return newest ? {
            fileName: newest.fileName,
            age: Math.round((Date.now() - newest.lastAccess) / (1000 * 60)) + 'min'
        } : null;
    }
    
    /**
     * 强制清空缓存
     */
    async clearAllCache() {
        try {
            await caches.delete(this.cacheName);
            this.cacheItems.clear();
            this.accessTimes.clear();
            this.currentCacheSize = 0;
            localStorage.removeItem('audioCacheIndex');
            
            console.log('🗑️ 已清空所有缓存');
            return true;
        } catch (error) {
            console.error('❌ 清空缓存失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.enhancedCacheManager = new EnhancedCacheManager();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCacheManager;
}

console.log('📦 增强缓存管理器已加载');