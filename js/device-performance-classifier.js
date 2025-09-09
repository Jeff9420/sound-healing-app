/**
 * 设备性能分级系统 - 声音疗愈应用第二阶段优化
 * 根据设备性能自适应调整功能和体验
 * 目标：不同设备等级自动优化，提升低端设备体验
 * 
 * @author Claude Code Performance Optimization - Phase 2
 * @date 2024-09-05
 * @version 2.1.0
 */

class DevicePerformanceClassifier {
    constructor() {
        this.deviceClass = 'unknown';
        this.performanceScore = 0;
        this.capabilities = new Set();
        this.limitations = new Set();
        
        // 性能评估指标
        this.metrics = {
            cpu: 0,
            memory: 0,
            network: 0,
            gpu: 0,
            storage: 0,
            display: 0
        };
        
        // 设备分级标准
        this.deviceClasses = {
            high: {
                name: '高性能设备',
                minScore: 80,
                features: ['all', 'advanced_visuals', 'background_effects', 'full_audio_processing'],
                audioPreload: 8,
                animationLevel: 'full',
                cacheStrategy: 'aggressive'
            },
            medium: {
                name: '中等性能设备',
                minScore: 50,
                features: ['basic', 'audio', 'simple_visuals', 'basic_effects'],
                audioPreload: 4,
                animationLevel: 'reduced',
                cacheStrategy: 'balanced'
            },
            low: {
                name: '低端设备',
                minScore: 0,
                features: ['basic', 'essential_audio'],
                audioPreload: 2,
                animationLevel: 'minimal',
                cacheStrategy: 'conservative'
            }
        };
        
        this.initializeClassification();
    }
    
    /**
     * 初始化设备分级
     */
    async initializeClassification() {
        console.log('🔍 开始设备性能分级...');
        
        try {
            await this.analyzeCPU();
            await this.analyzeMemory();
            await this.analyzeNetwork();
            await this.analyzeGPU();
            await this.analyzeStorage();
            await this.analyzeDisplay();
            
            this.calculatePerformanceScore();
            this.classifyDevice();
            this.applyOptimizations();
            
            console.log(`✅ 设备分级完成: ${this.deviceClass} (得分: ${this.performanceScore})`);
            
        } catch (error) {
            console.warn('⚠️ 设备分级失败，使用默认中等配置:', error);
            this.deviceClass = 'medium';
            this.performanceScore = 50;
        }
    }
    
    /**
     * 分析CPU性能
     */
    async analyzeCPU() {
        // 硬件并发数
        const cores = navigator.hardwareConcurrency || 2;
        this.metrics.cpu += Math.min(cores / 8, 1) * 25;
        
        // JavaScript执行性能测试
        const startTime = performance.now();
        let iterations = 0;
        const testDuration = 10; // 毫秒
        
        const endTime = startTime + testDuration;
        while (performance.now() < endTime) {
            Math.random() * Math.random();
            iterations++;
        }
        
        // 基于迭代次数评估性能
        const opsPerMs = iterations / testDuration;
        this.metrics.cpu += Math.min(opsPerMs / 10000, 1) * 25;
        
        console.log(`💻 CPU分析: 核心数=${cores}, 性能=${opsPerMs.toFixed(0)}ops/ms`);
    }
    
    /**
     * 分析内存性能
     */
    async analyzeMemory() {
        // 设备内存（如果支持）
        if (navigator.deviceMemory) {
            const memoryGB = navigator.deviceMemory;
            this.metrics.memory += Math.min(memoryGB / 8, 1) * 30;
            console.log(`🧠 内存分析: 设备内存=${memoryGB}GB`);
        }
        
        // JavaScript堆内存（如果支持）
        if (performance.memory) {
            const totalMB = performance.memory.jsHeapSizeLimit / (1024 * 1024);
            const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
            const availableRatio = (totalMB - usedMB) / totalMB;
            
            this.metrics.memory += Math.min(totalMB / 1000, 1) * 20;
            this.metrics.memory += availableRatio * 10;
            
            console.log(`🧠 内存分析: JS堆=${totalMB.toFixed(0)}MB, 使用率=${((1-availableRatio)*100).toFixed(1)}%`);
        }
        
        // 兜底评估
        if (this.metrics.memory === 0) {
            this.metrics.memory = 25; // 假设中等内存水平
        }
    }
    
    /**
     * 分析网络性能
     */
    async analyzeNetwork() {
        if (navigator.connection) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            const downlink = connection.downlink || 1;
            
            // 根据网络类型评分
            const networkScores = {
                'slow-2g': 5,
                '2g': 15,
                '3g': 25,
                '4g': 35,
                '5g': 40
            };
            
            this.metrics.network = networkScores[effectiveType] || 20;
            this.metrics.network += Math.min(downlink / 10, 1) * 10;
            
            console.log(`📶 网络分析: 类型=${effectiveType}, 带宽=${downlink}Mbps`);
        } else {
            this.metrics.network = 25; // 默认中等网络
        }
    }
    
    /**
     * 分析GPU性能
     */
    async analyzeGPU() {
        // 检查GPU加速支持
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            this.metrics.gpu += 20;
            
            // 获取GPU信息
            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            
            // 简单的GPU性能评估
            if (renderer && renderer.toLowerCase().includes('nvidia')) {
                this.metrics.gpu += 15;
            } else if (renderer && renderer.toLowerCase().includes('amd')) {
                this.metrics.gpu += 10;
            } else if (renderer && renderer.toLowerCase().includes('intel')) {
                this.metrics.gpu += 5;
            }
            
            console.log(`🎮 GPU分析: ${vendor} ${renderer}`);
        } else {
            console.log('🎮 GPU分析: 无WebGL支持');
        }
        
        // 检查CSS GPU加速支持
        if (CSS.supports('transform', 'translateZ(0)')) {
            this.metrics.gpu += 5;
        }
        
        if (CSS.supports('will-change', 'transform')) {
            this.metrics.gpu += 5;
        }
    }
    
    /**
     * 分析存储性能
     */
    async analyzeStorage() {
        // 检查存储API支持
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const quotaGB = (estimate.quota || 0) / (1024 * 1024 * 1024);
                const usageGB = (estimate.usage || 0) / (1024 * 1024 * 1024);
                
                this.metrics.storage += Math.min(quotaGB / 10, 1) * 20;
                
                console.log(`💾 存储分析: 配额=${quotaGB.toFixed(1)}GB, 已用=${usageGB.toFixed(1)}GB`);
            } catch (error) {
                console.warn('存储分析失败:', error);
                this.metrics.storage = 10;
            }
        } else {
            this.metrics.storage = 10;
        }
        
        // 检查IndexedDB支持
        if ('indexedDB' in window) {
            this.metrics.storage += 5;
        }
        
        // 检查Cache API支持
        if ('caches' in window) {
            this.metrics.storage += 5;
        }
    }
    
    /**
     * 分析显示性能
     */
    async analyzeDisplay() {
        const screen = window.screen;
        
        // 屏幕分辨率
        const pixels = screen.width * screen.height;
        this.metrics.display += Math.min(pixels / (1920 * 1080), 1) * 15;
        
        // 像素密度
        const dpr = window.devicePixelRatio || 1;
        this.metrics.display += Math.min(dpr / 2, 1) * 10;
        
        // 检查色彩空间支持
        if (screen.colorDepth >= 24) {
            this.metrics.display += 5;
        }
        
        console.log(`📺 显示分析: 分辨率=${screen.width}x${screen.height}, DPR=${dpr}, 色深=${screen.colorDepth}bit`);
    }
    
    /**
     * 计算综合性能得分
     */
    calculatePerformanceScore() {
        this.performanceScore = Object.values(this.metrics).reduce((sum, score) => sum + score, 0);
        this.performanceScore = Math.min(Math.max(this.performanceScore, 0), 100);
        
        console.log('📊 性能指标详情:', this.metrics);
    }
    
    /**
     * 设备分级
     */
    classifyDevice() {
        if (this.performanceScore >= this.deviceClasses.high.minScore) {
            this.deviceClass = 'high';
        } else if (this.performanceScore >= this.deviceClasses.medium.minScore) {
            this.deviceClass = 'medium';
        } else {
            this.deviceClass = 'low';
        }
        
        const config = this.deviceClasses[this.deviceClass];
        this.capabilities = new Set(config.features);
        
        console.log(`🏷️ 设备分级: ${config.name} (${this.deviceClass.toUpperCase()})`);
    }
    
    /**
     * 应用性能优化
     */
    applyOptimizations() {
        const config = this.deviceClasses[this.deviceClass];
        
        // 设置全局性能配置
        window.DEVICE_CONFIG = {
            class: this.deviceClass,
            score: this.performanceScore,
            audioPreload: config.audioPreload,
            animationLevel: config.animationLevel,
            cacheStrategy: config.cacheStrategy,
            capabilities: Array.from(this.capabilities)
        };
        
        // 应用CSS类以控制样式
        document.documentElement.classList.add(`device-${this.deviceClass}`);
        document.documentElement.classList.add(`animation-${config.animationLevel}`);
        
        // 调整动画
        this.adjustAnimations(config.animationLevel);
        
        // 调整音频预加载
        if (window.audioLazyLoader) {
            window.audioLazyLoader.updatePreloadStrategy(config.audioPreload);
        }
        
        console.log('🔧 性能优化已应用:', config);
    }
    
    /**
     * 调整动画效果
     */
    adjustAnimations(level) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'device-animations';
        
        let css = '';
        
        if (level === 'minimal') {
            css = `
                .device-low * {
                    animation-duration: 0s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0.1s !important;
                }
                .device-low .cloud,
                .device-low .ripple,
                .device-low .background-scene {
                    display: none !important;
                }
            `;
        } else if (level === 'reduced') {
            css = `
                .device-medium .cloud {
                    animation-duration: 30s !important;
                }
                .device-medium .ripple {
                    animation-duration: 4s !important;
                }
                .device-medium .background-scene {
                    opacity: 0.3 !important;
                }
            `;
        }
        
        if (css) {
            animationStyles.textContent = css;
            document.head.appendChild(animationStyles);
        }
    }
    
    /**
     * 获取设备配置
     */
    getDeviceConfig() {
        return {
            class: this.deviceClass,
            score: this.performanceScore,
            metrics: this.metrics,
            capabilities: Array.from(this.capabilities),
            limitations: Array.from(this.limitations),
            config: this.deviceClasses[this.deviceClass]
        };
    }
    
    /**
     * 检查功能支持
     */
    hasCapability(feature) {
        return this.capabilities.has(feature);
    }
    
    /**
     * 动态调整性能级别
     */
    adjustPerformanceLevel(newLevel) {
        if (this.deviceClasses[newLevel]) {
            console.log(`🔄 调整性能级别: ${this.deviceClass} -> ${newLevel}`);
            this.deviceClass = newLevel;
            this.applyOptimizations();
        }
    }
    
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            deviceClass: this.deviceClass,
            performanceScore: this.performanceScore,
            metrics: { ...this.metrics },
            config: this.deviceClasses[this.deviceClass],
            capabilities: Array.from(this.capabilities),
            recommendations: this.generateRecommendations()
        };
    }
    
    /**
     * 生成性能优化建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.memory < 20) {
            recommendations.push('建议关闭不必要的浏览器标签页以释放内存');
        }
        
        if (this.metrics.network < 20) {
            recommendations.push('网络连接较慢，建议在WiFi环境下使用');
        }
        
        if (this.metrics.gpu < 15) {
            recommendations.push('GPU性能较低，已自动简化视觉效果');
        }
        
        if (this.deviceClass === 'low') {
            recommendations.push('已启用省电模式，部分高级功能将被限制');
        }
        
        return recommendations;
    }
}

// 创建全局实例
window.deviceClassifier = new DevicePerformanceClassifier();

// 导出性能检测函数给其他模块使用
window.getDeviceClass = () => window.deviceClassifier.deviceClass;
window.getDeviceScore = () => window.deviceClassifier.performanceScore;
window.hasCapability = (feature) => window.deviceClassifier.hasCapability(feature);

console.log('🚀 设备性能分级系统加载完成');