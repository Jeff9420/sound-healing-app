class BackgroundSceneManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.currentScene = 'default';
        this.animationId = null;
        this.animationFrame = 0;

        // 性能优化：帧率控制
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;

        // 性能优化：粒子对象池
        this.particlePool = [];
        this.maxParticles = 200;

        // 检测设备性能
        this.isLowEndDevice = this.detectDevicePerformance();

        // 根据设备性能调整粒子数量
        this.performanceMultiplier = this.isLowEndDevice ? 0.5 : 1;

        // Scene configurations with enhanced effects
        this.sceneConfigs = {
            'Animal sounds': {
                type: 'forest',
                colors: ['#1a4d1a', '#2d5a3d', '#3d7c3d', '#4d8c4d', '#6da06d'],
                particles: 'leaves',
                particleCount: Math.floor(40 * this.performanceMultiplier),
                bgGradient: ['#0f2027', '#203a43', '#2c5364']
            },
            'Chakra': { 
                type: 'energy', 
                colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'], 
                particles: 'energy',
                particleCount: 30,
                bgGradient: ['#000000', '#1a0033', '#330066']
            },
            'Fire': {
                type: 'fire',
                colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500', '#DC143C', '#B22222'],
                particles: 'sparks',
                particleCount: Math.floor(60 * this.performanceMultiplier),
                bgGradient: ['#2C1810', '#3D2817', '#4A2C17']
            },
            'hypnosis': {
                type: 'cosmic',
                colors: ['#4B0082', '#8A2BE2', '#9370DB', '#BA55D3', '#DA70D6'],
                particles: 'stars',
                particleCount: Math.floor(100 * this.performanceMultiplier),
                bgGradient: ['#0B0B2B', '#1B1B3B', '#2B2B4B']
            },
            'meditation': { 
                type: 'zen', 
                colors: ['#E0F6FF', '#B0E0E6', '#87CEEB', '#87CEFA', '#B0C4DE'], 
                particles: 'petals',
                particleCount: 25,
                bgGradient: ['#E6F3FF', '#CCE7FF', '#B3DBFF']
            },
            'Rain': {
                type: 'rain',
                colors: ['#4682B4', '#5F9EA0', '#87CEEB', '#B0C4DE', '#708090'],
                particles: 'drops',
                particleCount: Math.floor(80 * this.performanceMultiplier),
                bgGradient: ['#2C3E50', '#34495E', '#455A64']
            },
            'running water': { 
                type: 'water', 
                colors: ['#00CED1', '#48D1CC', '#40E0D0', '#AFEEEE', '#7FDBDA'], 
                particles: 'bubbles',
                particleCount: 50,
                bgGradient: ['#006064', '#00838F', '#0097A7']
            },
            'Singing bowl sound': { 
                type: 'tibetan', 
                colors: ['#DAA520', '#FFD700', '#FFA500', '#CD853F', '#DEB887'], 
                particles: 'ripples',
                particleCount: 20,
                bgGradient: ['#3E2723', '#5D4037', '#6D4C41']
            },
            'Subconscious Therapy': { 
                type: 'therapy', 
                colors: ['#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3', '#C8A8C8'], 
                particles: 'waves',
                particleCount: 35,
                bgGradient: ['#F3E5F5', '#E1BEE7', '#CE93D8']
            }
        };
        
        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    detectDevicePerformance() {
        // 检测设备性能
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isOldBrowser = !window.requestAnimationFrame || !window.Promise;

        // 简单的硬件性能检测
        const memoryLimit = navigator.deviceMemory || 4;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;

        // 如果是移动设备或旧浏览器或低内存设备，认为是低端设备
        return isMobile || isOldBrowser || memoryLimit < 4 || hardwareConcurrency < 4;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // 监听音频播放事件，自动切换场景
        this.audioManager.eventBus.addEventListener('trackPlay', (e) => {
            const detail = e.detail;
            let categoryName = 'default';
            
            if (typeof detail === 'object' && detail.categoryName) {
                categoryName = detail.categoryName;
            }
            
            this.setScene(categoryName);
            if (!this.isActive) {
                this.start();
            }
        });
        
        // 监听音频暂停事件，降低场景强度
        this.audioManager.eventBus.addEventListener('trackPause', () => {
            this.reduceIntensity();
        });
        
        // 监听所有音频停止，关闭场景
        this.audioManager.eventBus.addEventListener('allTracksStopped', () => {
            this.stop();
        });
    }

    start() {
        this.isActive = true;
        document.body.classList.add('scene-active');
        this.lastFrameTime = 0; // 重置帧时间
        this.animationId = requestAnimationFrame((time) => this.animate(time));
        console.log('背景场景已自动启动:', this.currentScene);
    }

    stop() {
        this.isActive = false;
        document.body.classList.remove('scene-active');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.clearCanvas();
        console.log('背景场景已自动停止');
    }

    reduceIntensity() {
        // 降低动画强度，不完全停止
        document.body.style.setProperty('--scene-opacity', '0.4');
        setTimeout(() => {
            document.body.style.removeProperty('--scene-opacity');
        }, 2000);
    }

    setScene(categoryName) {
        this.currentScene = categoryName;
        console.log('切换背景场景到:', categoryName);
    }

    animate(currentTime) {
        if (!this.isActive) {
            return;
        }

        // 帧率控制
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame((time) => this.animate(time));
            return;
        }

        this.lastFrameTime = currentTime;
        this.animationFrame++;
        this.drawScene();

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    drawScene() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const config = this.sceneConfigs[this.currentScene] || {
            type: 'default', 
            colors: ['#3b82f6', '#60a5fa'], 
            particles: 'dots',
            particleCount: 20,
            bgGradient: ['#1e3a8a', '#3b82f6']
        };
        
        // 清除画布并绘制背景渐变
        this.drawBackground(width, height, config);
        
        // 根据场景类型绘制特效
        switch (config.type) {
        case 'rain':
            this.drawRainScene(width, height, config);
            break;
        case 'fire':
            this.drawFireScene(width, height, config);
            break;
        case 'water':
            this.drawWaterScene(width, height, config);
            break;
        case 'forest':
            this.drawForestScene(width, height, config);
            break;
        case 'energy':
            this.drawEnergyScene(width, height, config);
            break;
        case 'cosmic':
            this.drawCosmicScene(width, height, config);
            break;
        case 'zen':
            this.drawZenScene(width, height, config);
            break;
        case 'tibetan':
            this.drawTibetanScene(width, height, config);
            break;
        case 'therapy':
            this.drawTherapyScene(width, height, config);
            break;
        default:
            this.drawDefaultScene(width, height, config);
        }
    }

    drawBackground(width, height, config) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        config.bgGradient.forEach((color, index) => {
            gradient.addColorStop(index / (config.bgGradient.length - 1), color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }
    
    drawRainScene(width, height, config) {
        // 使用对象池优化雨滴效果
        for (let i = 0; i < config.particleCount; i++) {
            const x = (i * 23 + this.animationFrame * 3) % (width + 100);
            const y = (this.animationFrame * 4 + i * 47) % (height + 50);
            const length = 15 + Math.sin(i * 0.1) * 5;

            // 使用缓存的颜色值
            const colorIndex = i % config.colors.length;
            if (!this.rainColors) {
                this.rainColors = [];
            }
            if (!this.rainColors[colorIndex]) {
                this.rainColors[colorIndex] = config.colors[colorIndex] + '9F';
            }

            this.ctx.strokeStyle = this.rainColors[colorIndex];
            this.ctx.lineWidth = 1 + Math.random();
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 3, y + length);
            this.ctx.stroke();
        }

        // 地面水花效果 - 减少数量
        const splashCount = this.isLowEndDevice ? 5 : 10;
        for (let i = 0; i < splashCount; i++) {
            const x = (this.animationFrame * 2 + i * 80) % width;
            const y = height - 20 - Math.random() * 10;
            const size = Math.random() * 3 + 1;

            this.ctx.fillStyle = config.colors[0] + '60';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawFireScene(width, height, config) {
        // 火焰粒子 - 优化低端设备
        const particleCount = this.isLowEndDevice ? Math.floor(config.particleCount * 0.6) : config.particleCount;

        for (let i = 0; i < particleCount; i++) {
            const baseX = width * 0.2 + (i % 10) * (width * 0.6 / 10);
            const x = baseX + Math.sin(this.animationFrame * 0.05 + i) * 50;
            const progress = (this.animationFrame * 2 + i * 15) % height;
            const y = height - progress;
            const size = Math.max(1, 12 - progress / 50) * (1 + Math.sin(i) * 0.3);

            if (progress < height && size > 0) {
                const alpha = Math.max(0, 1 - progress / height);
                // 使用预计算的颜色
                const colorIndex = i % config.colors.length;
                if (!this.fireColors) {
                    this.fireColors = [];
                }
                const alphaKey = Math.floor(alpha * 255).toString(16).padStart(2, '0');
                const colorKey = colorIndex + alphaKey;
                if (!this.fireColors[colorKey]) {
                    this.fireColors[colorKey] = config.colors[colorIndex] + alphaKey;
                }

                this.ctx.fillStyle = this.fireColors[colorKey];
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // 火焰光晕效果 - 低端设备跳过
        if (!this.isLowEndDevice) {
            const glowGradient = this.ctx.createRadialGradient(
                width/2, height, 0,
                width/2, height, width/2
            );
            glowGradient.addColorStop(0, 'rgba(255, 69, 0, 0.3)');
            glowGradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.1)');
            glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(0, 0, width, height);
        }
    }
    
    drawWaterScene(width, height, config) {
        // 水波涟漪 - 多个源点
        for (let i = 0; i < 8; i++) {
            const centerX = width * (0.15 + i * 0.1);
            const centerY = height * (0.3 + Math.sin(i) * 0.4);
            
            for (let ring = 0; ring < 4; ring++) {
                const radius = (this.animationFrame * 2 + i * 30 + ring * 40) % 150;
                const alpha = Math.max(0, 1 - radius / 150);
                
                if (alpha > 0) {
                    this.ctx.strokeStyle = config.colors[ring % config.colors.length] + 
                                          Math.floor(alpha * 128).toString(16).padStart(2, '0');
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        }
        
        // 气泡效果
        for (let i = 0; i < 20; i++) {
            const x = (i * 37) % width;
            const y = height - (this.animationFrame + i * 50) % height;
            const size = 3 + Math.sin(i) * 2;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + '70';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawForestScene(width, height, config) {
        // 飘落的叶子 - 更自然的运动
        for (let i = 0; i < config.particleCount; i++) {
            const x = (this.animationFrame * 0.5 + i * 25 + Math.sin(this.animationFrame * 0.01 + i) * 30) % (width + 100);
            const y = (this.animationFrame + i * 40) % (height + 100);
            const rotation = this.animationFrame * 0.02 + i;
            const size = 4 + Math.sin(i) * 2;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 'CC';
            
            // 绘制叶子形状
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size, size * 1.5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // 阳光透射效果
        for (let i = 0; i < 5; i++) {
            const x = width * (0.2 + i * 0.15);
            const lightGradient = this.ctx.createLinearGradient(x, 0, x, height);
            lightGradient.addColorStop(0, 'rgba(255, 255, 150, 0.1)');
            lightGradient.addColorStop(1, 'rgba(255, 255, 150, 0)');
            
            this.ctx.fillStyle = lightGradient;
            this.ctx.fillRect(x - 20, 0, 40, height);
        }
    }
    
    drawEnergyScene(width, height, config) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 脉轮能量圈 - 多层动态效果
        for (let layer = 0; layer < 3; layer++) {
            for (let i = 0; i < config.colors.length; i++) {
                const radius = 60 + i * 25 + layer * 15 + 
                              Math.sin(this.animationFrame * 0.03 + i + layer) * 10;
                const alpha = 0.4 + Math.sin(this.animationFrame * 0.04 + i + layer) * 0.3;
                
                this.ctx.strokeStyle = config.colors[i] + 
                                      Math.floor(alpha * 255).toString(16).padStart(2, '0');
                this.ctx.lineWidth = 3 + layer;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // 能量粒子
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2 + this.animationFrame * 0.02;
            const distance = 100 + Math.sin(this.animationFrame * 0.05 + i) * 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 'AA';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawCosmicScene(width, height, config) {
        // 闪烁星星 - 更多更真实
        for (let i = 0; i < config.particleCount; i++) {
            const x = (i * 17) % width;
            const y = (i * 23) % height;
            const twinkle = (Math.sin(this.animationFrame * 0.1 + i) + 1) / 2;
            const size = 1 + twinkle * 2;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 
                                Math.floor(twinkle * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 星云效果
        for (let i = 0; i < 3; i++) {
            const centerX = width * (0.3 + i * 0.2);
            const centerY = height * (0.3 + i * 0.3);
            const nebulaGradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, 150
            );
            nebulaGradient.addColorStop(0, config.colors[i] + '40');
            nebulaGradient.addColorStop(1, config.colors[i] + '00');
            
            this.ctx.fillStyle = nebulaGradient;
            this.ctx.fillRect(0, 0, width, height);
        }
    }
    
    drawZenScene(width, height, config) {
        // 飘落花瓣 - 更优雅的动作
        for (let i = 0; i < config.particleCount; i++) {
            const x = (this.animationFrame * 0.3 + i * 30 + Math.sin(this.animationFrame * 0.02 + i) * 50) % (width + 100);
            const y = (this.animationFrame * 0.8 + i * 50) % (height + 100);
            const rotation = this.animationFrame * 0.01 + i;
            const size = 6 + Math.sin(i) * 3;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 'DD';
            
            // 绘制花瓣形状
            this.ctx.beginPath();
            for (let petal = 0; petal < 5; petal++) {
                const petalAngle = (petal / 5) * Math.PI * 2;
                const petalX = Math.cos(petalAngle) * size;
                const petalY = Math.sin(petalAngle) * size * 0.6;
                this.ctx.ellipse(petalX, petalY, size/3, size/2, petalAngle, 0, Math.PI * 2);
            }
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // 禅意光晕
        const zenGradient = this.ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, Math.min(width, height)/2
        );
        zenGradient.addColorStop(0, 'rgba(240, 248, 255, 0.1)');
        zenGradient.addColorStop(1, 'rgba(240, 248, 255, 0)');
        this.ctx.fillStyle = zenGradient;
        this.ctx.fillRect(0, 0, width, height);
    }
    
    drawTibetanScene(width, height, config) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 颂钵声波 - 多重扩散
        for (let wave = 0; wave < 6; wave++) {
            const radius = (this.animationFrame * 1.5 + wave * 30) % 200;
            const alpha = Math.max(0, 1 - radius / 200);
            
            if (alpha > 0) {
                this.ctx.strokeStyle = config.colors[wave % config.colors.length] + 
                                      Math.floor(alpha * 180).toString(16).padStart(2, '0');
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // 金色粒子
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + this.animationFrame * 0.01;
            const distance = 80 + Math.sin(this.animationFrame * 0.03 + i) * 40;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 'BB';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawTherapyScene(width, height, config) {
        // 治疗波纹 - 温和的波动
        for (let i = 0; i < 8; i++) {
            const waveY = height/3 + Math.sin(this.animationFrame * 0.03 + i) * height/8;
            const alpha = 0.4 + Math.sin(this.animationFrame * 0.05 + i) * 0.3;
            
            this.ctx.strokeStyle = config.colors[i % config.colors.length] + 
                                  Math.floor(alpha * 180).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, waveY);
            
            for (let x = 0; x <= width; x += 20) {
                const y = waveY + Math.sin((x + this.animationFrame * 2) * 0.05) * 15;
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
        
        // 治疗光点
        for (let i = 0; i < 20; i++) {
            const x = (i * 50) % width;
            const y = height/2 + Math.sin(this.animationFrame * 0.02 + i) * 50;
            const pulse = (Math.sin(this.animationFrame * 0.1 + i) + 1) / 2;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 
                                Math.floor(pulse * 120).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4 + pulse * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawDefaultScene(width, height, config) {
        // 简单几何粒子
        for (let i = 0; i < config.particleCount; i++) {
            const x = (this.animationFrame + i * 40) % (width + 100);
            const y = height/2 + Math.sin(this.animationFrame * 0.02 + i) * 100;
            const size = 4 + Math.sin(i) * 2;
            
            this.ctx.fillStyle = config.colors[i % config.colors.length] + 'AA';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    cleanup() {
        this.stop();
    }
}