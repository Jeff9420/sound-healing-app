/**
 * 内存优化器
 * 智能管理音频对象、Canvas缓冲和DOM元素内存使用
 */

class MemoryOptimizer {
    constructor() {
        this.audioPool = new Map();
        this.canvasBuffers = new Map();
        this.observedElements = new Set();
        this.maxAudioInstances = 5;
        this.maxCanvasBuffers = 3;
        this.memoryThreshold = 100; // MB
        this.cleanupInterval = null;
        
        // 内存监控
        this.memoryUsage = {
            audio: 0,
            canvas: 0,
            dom: 0,
            total: 0
        };
        
        this.initializeOptimizer();
    }
    
    initializeOptimizer() {
        this.setupMemoryMonitoring();
        this.setupIntersectionObserver();
        this.startPeriodicCleanup();
        this.bindWindowEvents();
        
        console.log('🧠 内存优化器已初始化');
    }
    
    /**
     * 设置内存监控
     */
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            this.memorySupported = true;
            this.startMemoryTracking();
        } else {
            console.warn('⚠️ 浏览器不支持memory API');
            this.memorySupported = false;
        }
    }
    
    /**
     * 开始内存追踪
     */
    startMemoryTracking() {
        setInterval(() => {
            if (this.memorySupported) {
                const memory = performance.memory;
                this.memoryUsage.total = memory.usedJSHeapSize / (1024 * 1024);
                
                // 检查是否需要紧急清理
                if (this.memoryUsage.total > this.memoryThreshold) {
                    console.warn('⚠️ 内存使用超出阈值，启动紧急清理');
                    this.emergencyCleanup();
                }
            }
        }, 10000); // 每10秒检查一次
    }
    
    /**
     * 音频对象池管理
     */
    getAudioFromPool(src) {
        let audio;
        
        // 检查池中是否有可用的音频对象
        const poolKey = 'audio_' + Date.now();
        if (this.audioPool.size < this.maxAudioInstances) {
            audio = new Audio();
            this.audioPool.set(poolKey, {
                element: audio,
                inUse: true,
                src: src,
                created: Date.now()
            });
        } else {
            // 复用最旧的音频对象
            const oldestKey = this.findOldestAudioObject();
            if (oldestKey) {
                const poolItem = this.audioPool.get(oldestKey);
                audio = poolItem.element;
                
                // 清理旧的事件监听器
                this.cleanupAudioElement(audio);
                
                // 更新池信息
                poolItem.inUse = true;
                poolItem.src = src;
                poolItem.created = Date.now();
            } else {
                // 创建新的音频对象
                audio = new Audio();
            }
        }
        
        // 设置音频源
        audio.src = src;
        
        // 添加清理监听器
        audio.addEventListener('ended', () => {
            this.releaseAudioFromPool(audio);
        });
        
        audio.addEventListener('error', () => {
            this.releaseAudioFromPool(audio);
        });
        
        console.log('🔊 从池中获取音频对象', { poolSize: this.audioPool.size });
        return audio;
    }
    
    /**
     * 查找最旧的音频对象
     */
    findOldestAudioObject() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, item] of this.audioPool.entries()) {
            if (!item.inUse && item.created < oldestTime) {
                oldestTime = item.created;
                oldestKey = key;
            }
        }
        
        return oldestKey;
    }
    
    /**
     * 释放音频对象回池
     */
    releaseAudioFromPool(audioElement) {
        for (const [key, item] of this.audioPool.entries()) {
            if (item.element === audioElement) {
                item.inUse = false;
                
                // 暂停并重置
                audioElement.pause();
                audioElement.currentTime = 0;
                
                console.log('♻️ 音频对象已释放回池');
                break;
            }
        }
    }
    
    /**
     * 清理音频元素
     */
    cleanupAudioElement(audio) {
        // 暂停播放
        if (!audio.paused) {
            audio.pause();
        }
        
        // 重置时间
        audio.currentTime = 0;
        
        // 移除源
        audio.removeAttribute('src');
        audio.load();
        
        // 清理自定义属性
        audio.removeAttribute('data-track-id');
        audio.removeAttribute('data-category');
    }
    
    /**
     * Canvas缓冲管理
     */
    createCanvasBuffer(width, height, id) {
        // 检查是否已存在
        if (this.canvasBuffers.has(id)) {
            const buffer = this.canvasBuffers.get(id);
            if (buffer.canvas.width === width && buffer.canvas.height === height) {
                buffer.lastUsed = Date.now();
                return buffer;
            }
        }
        
        // 检查缓冲数量限制
        if (this.canvasBuffers.size >= this.maxCanvasBuffers) {
            this.cleanupOldestCanvasBuffer();
        }
        
        // 创建新缓冲
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        const buffer = {
            canvas,
            ctx,
            width,
            height,
            created: Date.now(),
            lastUsed: Date.now()
        };
        
        this.canvasBuffers.set(id, buffer);
        
        console.log('🎨 创建Canvas缓冲', { id, width, height, totalBuffers: this.canvasBuffers.size });
        return buffer;
    }
    
    /**
     * 获取Canvas缓冲
     */
    getCanvasBuffer(id) {
        const buffer = this.canvasBuffers.get(id);
        if (buffer) {
            buffer.lastUsed = Date.now();
            return buffer;
        }
        return null;
    }
    
    /**
     * 清理最旧的Canvas缓冲
     */
    cleanupOldestCanvasBuffer() {
        let oldestId = null;
        let oldestTime = Infinity;
        
        for (const [id, buffer] of this.canvasBuffers.entries()) {
            if (buffer.lastUsed < oldestTime) {
                oldestTime = buffer.lastUsed;
                oldestId = id;
            }
        }
        
        if (oldestId) {
            const buffer = this.canvasBuffers.get(oldestId);
            
            // 清理Canvas
            buffer.ctx.clearRect(0, 0, buffer.width, buffer.height);
            buffer.canvas.width = 1;
            buffer.canvas.height = 1;
            
            this.canvasBuffers.delete(oldestId);
            console.log('🧹 清理最旧Canvas缓冲:', oldestId);
        }
    }
    
    /**
     * 设置交叉观察器（用于懒加载）
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleElementVisible(entry.target);
                    } else {
                        this.handleElementHidden(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            console.log('👁️ 交叉观察器已设置');
        }
    }
    
    /**
     * 观察元素
     */
    observeElement(element) {
        if (this.intersectionObserver && !this.observedElements.has(element)) {
            this.intersectionObserver.observe(element);
            this.observedElements.add(element);
        }
    }
    
    /**
     * 停止观察元素
     */
    unobserveElement(element) {
        if (this.intersectionObserver && this.observedElements.has(element)) {
            this.intersectionObserver.unobserve(element);
            this.observedElements.delete(element);
        }
    }
    
    /**
     * 处理元素可见
     */
    handleElementVisible(element) {
        if (element.dataset.lazyLoad) {
            // 触发懒加载
            const src = element.dataset.src;
            if (src) {
                element.src = src;
                element.removeAttribute('data-src');
                element.removeAttribute('data-lazy-load');
            }
        }
    }
    
    /**
     * 处理元素隐藏
     */
    handleElementHidden(element) {
        // 如果是图片或视频，可以考虑卸载
        if (element.tagName === 'IMG' || element.tagName === 'VIDEO') {
            // 保存原始src到data属性
            if (element.src && !element.dataset.originalSrc) {
                element.dataset.originalSrc = element.src;
            }
        }
    }
    
    /**
     * DOM元素清理
     */
    cleanupDOMElement(element) {
        // 移除事件监听器
        const clone = element.cloneNode(true);
        element.parentNode?.replaceChild(clone, element);
        
        // 清理自定义属性
        const attributes = element.attributes;
        for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];
            if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) {
                element.removeAttribute(attr.name);
            }
        }
        
        return clone;
    }
    
    /**
     * 开始定期清理
     */
    startPeriodicCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.performRoutineCleanup();
        }, 30000); // 每30秒清理一次
    }
    
    /**
     * 例行清理
     */
    performRoutineCleanup() {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5分钟
        
        // 清理未使用的音频对象
        for (const [key, item] of this.audioPool.entries()) {
            if (!item.inUse && now - item.created > maxAge) {
                this.cleanupAudioElement(item.element);
                this.audioPool.delete(key);
            }
        }
        
        // 清理未使用的Canvas缓冲
        for (const [id, buffer] of this.canvasBuffers.entries()) {
            if (now - buffer.lastUsed > maxAge) {
                this.cleanupOldestCanvasBuffer();
                break; // 一次只清理一个
            }
        }
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
        
        console.log('🧹 例行清理完成', this.getMemoryStats());
    }
    
    /**
     * 紧急内存清理
     */
    emergencyCleanup() {
        console.warn('🚨 执行紧急内存清理');
        
        // 清理所有未使用的音频对象
        for (const [key, item] of this.audioPool.entries()) {
            if (!item.inUse) {
                this.cleanupAudioElement(item.element);
                this.audioPool.delete(key);
            }
        }
        
        // 清理所有Canvas缓冲
        for (const [id, buffer] of this.canvasBuffers.entries()) {
            buffer.ctx.clearRect(0, 0, buffer.width, buffer.height);
            buffer.canvas.width = 1;
            buffer.canvas.height = 1;
        }
        this.canvasBuffers.clear();
        
        // 触发垃圾回收
        if (window.gc) {
            window.gc();
        }
        
        // 通知应用程序内存紧张
        window.dispatchEvent(new CustomEvent('memoryPressure', {
            detail: { 
                level: 'high',
                usage: this.memoryUsage.total
            }
        }));
    }
    
    /**
     * 绑定窗口事件
     */
    bindWindowEvents() {
        // 页面隐藏时清理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performRoutineCleanup();
            }
        });
        
        // 窗口大小改变时清理Canvas缓冲
        window.addEventListener('resize', () => {
            this.canvasBuffers.clear();
            console.log('📐 窗口大小改变，清理Canvas缓冲');
        });
        
        // 内存不足警告
        window.addEventListener('memoryPressure', (event) => {
            console.warn('⚠️ 收到内存压力警告:', event.detail);
        });
    }
    
    /**
     * 获取内存统计
     */
    getMemoryStats() {
        let stats = {
            audioPoolSize: this.audioPool.size,
            canvasBufferCount: this.canvasBuffers.size,
            observedElements: this.observedElements.size,
            memorySupported: this.memorySupported
        };
        
        if (this.memorySupported && performance.memory) {
            const memory = performance.memory;
            stats.memory = {
                used: Math.round(memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
                total: Math.round(memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
                limit: Math.round(memory.jsHeapSizeLimit / (1024 * 1024)) + 'MB'
            };
        }
        
        return stats;
    }
    
    /**
     * 销毁优化器
     */
    destroy() {
        // 清理定时器
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        // 清理交叉观察器
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // 清理所有资源
        this.emergencyCleanup();
        
        console.log('🗑️ 内存优化器已销毁');
    }
    
    /**
     * 获取优化建议
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (this.audioPool.size >= this.maxAudioInstances) {
            suggestions.push('音频对象池已满，考虑增加池大小或减少同时播放的音频数量');
        }
        
        if (this.canvasBuffers.size >= this.maxCanvasBuffers) {
            suggestions.push('Canvas缓冲区已满，考虑优化动画或减少同时渲染的Canvas数量');
        }
        
        if (this.memorySupported && this.memoryUsage.total > this.memoryThreshold * 0.8) {
            suggestions.push('内存使用接近阈值，建议执行清理操作');
        }
        
        return suggestions;
    }
}

// 创建全局实例
window.memoryOptimizer = new MemoryOptimizer();

// 与音频管理器集成
if (window.audioManager) {
    // 重写音频创建方法使用对象池
    const originalCreateAudio = window.audioManager.createAudio || ((src) => new Audio(src));
    window.audioManager.createAudio = (src) => {
        return window.memoryOptimizer.getAudioFromPool(src);
    };
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryOptimizer;
}

console.log('🧠 内存优化器已加载');