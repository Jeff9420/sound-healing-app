class SceneVisualizer {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.canvas = document.getElementById('audioCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.currentScene = 'default';
        this.animationId = null;
        this.animationFrame = 0;
        
        // Scene configurations
        this.sceneConfigs = {
            'Animal sounds': { type: 'forest', colors: ['#228B22', '#32CD32', '#90EE90'], particles: 'leaves' },
            'Chakra': { type: 'energy', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'], particles: 'energy' },
            'Fire': { type: 'fire', colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'], particles: 'sparks' },
            'hypnosis': { type: 'cosmic', colors: ['#4B0082', '#8A2BE2', '#9370DB', '#BA55D3'], particles: 'stars' },
            'meditation': { type: 'zen', colors: ['#87CEEB', '#B0E0E6', '#E0F6FF', '#F0F8FF'], particles: 'petals' },
            'Rain': { type: 'rain', colors: ['#4682B4', '#5F9EA0', '#87CEEB', '#B0C4DE'], particles: 'drops' },
            'running water': { type: 'water', colors: ['#00CED1', '#48D1CC', '#40E0D0', '#AFEEEE'], particles: 'bubbles' },
            'Singing bowl sound': { type: 'tibetan', colors: ['#DAA520', '#FFD700', '#FFA500', '#CD853F'], particles: 'ripples' },
            'Subconscious Therapy': { type: 'therapy', colors: ['#DDA0DD', '#EE82EE', '#DA70D6', '#BA55D3'], particles: 'waves' }
        };
        
        this.setupCanvas();
        this.bindElements();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    bindElements() {
        this.elements = {
            toggleBtn: document.getElementById('visualizationToggle'),
            typeSelect: document.getElementById('visualizationType')
        };
    }

    setupEventListeners() {
        this.elements.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        this.elements.typeSelect.addEventListener('change', (e) => {
            this.currentScene = e.target.value;
        });

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
        
        this.audioManager.eventBus.addEventListener('trackPause', () => {
            this.stop();
        });
    }

    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.isActive = true;
        this.updateToggleButton();
        this.animate();
        console.log('场景可视化已启动');
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.clearCanvas();
        this.updateToggleButton();
        console.log('场景可视化已停止');
    }

    setScene(categoryName) {
        this.currentScene = categoryName;
        console.log('切换场景到:', categoryName);
    }

    animate() {
        if (!this.isActive) return;

        this.animationFrame++;
        this.drawScene();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawScene() {
        this.clearCanvas();
        
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        const config = this.sceneConfigs[this.currentScene] || this.sceneConfigs['default'] || 
                      { type: 'default', colors: ['#3b82f6', '#60a5fa'], particles: 'dots' };
        
        switch (config.type) {
            case 'rain':
                this.drawRainScene(width, height, config.colors);
                break;
            case 'fire':
                this.drawFireScene(width, height, config.colors);
                break;
            case 'water':
                this.drawWaterScene(width, height, config.colors);
                break;
            case 'forest':
                this.drawForestScene(width, height, config.colors);
                break;
            case 'energy':
                this.drawEnergyScene(width, height, config.colors);
                break;
            case 'cosmic':
                this.drawCosmicScene(width, height, config.colors);
                break;
            case 'zen':
                this.drawZenScene(width, height, config.colors);
                break;
            case 'tibetan':
                this.drawTibetanScene(width, height, config.colors);
                break;
            case 'therapy':
                this.drawTherapyScene(width, height, config.colors);
                break;
            default:
                this.drawDefaultScene(width, height, config.colors);
        }
    }
    
    drawRainScene(width, height, colors) {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#2C3E50');
        gradient.addColorStop(1, '#34495E');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 雨滴效果
        for (let i = 0; i < 30; i++) {
            const x = (i * 13 + this.animationFrame * 2) % width;
            const y = (this.animationFrame * 3 + i * 37) % height;
            
            this.ctx.strokeStyle = colors[i % colors.length] + '80';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 2, y + 10);
            this.ctx.stroke();
        }
    }
    
    drawFireScene(width, height, colors) {
        // 火焰背景
        const gradient = this.ctx.createRadialGradient(width/2, height, 0, width/2, height, width/2);
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.5, '#FF6347');
        gradient.addColorStop(1, '#8B0000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 火焰粒子
        for (let i = 0; i < 20; i++) {
            const x = width/2 + Math.sin(this.animationFrame * 0.05 + i) * 50;
            const y = height - (this.animationFrame * 2 + i * 10) % height;
            const size = Math.random() * 8 + 2;
            
            this.ctx.fillStyle = colors[i % colors.length] + Math.floor(Math.random() * 100 + 50).toString(16);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawWaterScene(width, height, colors) {
        // 水波背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#E0F6FF');
        gradient.addColorStop(1, '#87CEEB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 水波纹
        for (let i = 0; i < 5; i++) {
            const centerX = width * (0.2 + i * 0.15);
            const centerY = height * 0.5;
            const radius = (this.animationFrame * 2 + i * 20) % 100;
            
            this.ctx.strokeStyle = colors[i % colors.length] + '60';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawForestScene(width, height, colors) {
        // 森林背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 飘落的叶子
        for (let i = 0; i < 15; i++) {
            const x = (this.animationFrame + i * 25) % width;
            const y = (this.animationFrame * 0.5 + i * 30) % height;
            const rotation = this.animationFrame * 0.02 + i;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fillRect(-3, -6, 6, 12);
            this.ctx.restore();
        }
    }
    
    drawEnergyScene(width, height, colors) {
        // 能量背景
        this.ctx.fillStyle = '#000015';
        this.ctx.fillRect(0, 0, width, height);
        
        // 脉轮能量圈
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let i = 0; i < colors.length; i++) {
            const radius = 20 + i * 8 + Math.sin(this.animationFrame * 0.05 + i) * 5;
            const alpha = 0.3 + Math.sin(this.animationFrame * 0.03 + i) * 0.2;
            
            this.ctx.strokeStyle = colors[i] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawCosmicScene(width, height, colors) {
        // 宇宙背景
        this.ctx.fillStyle = '#0B0B2B';
        this.ctx.fillRect(0, 0, width, height);
        
        // 星星
        for (let i = 0; i < 25; i++) {
            const x = (i * 17) % width;
            const y = (i * 23) % height;
            const twinkle = Math.sin(this.animationFrame * 0.1 + i) * 0.5 + 0.5;
            
            this.ctx.fillStyle = colors[i % colors.length] + Math.floor(twinkle * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1 + twinkle, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawZenScene(width, height, colors) {
        // 禅意背景
        const gradient = this.ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#F0F8FF');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 飘落的花瓣
        for (let i = 0; i < 12; i++) {
            const x = (this.animationFrame * 0.3 + i * 30) % width;
            const y = (this.animationFrame * 0.8 + i * 40) % height;
            const rotation = this.animationFrame * 0.01 + i;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.fillStyle = colors[i % colors.length] + '80';
            
            // 花瓣形状
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawTibetanScene(width, height, colors) {
        // 西藏风格背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#FFE5B4');
        gradient.addColorStop(1, '#DAA520');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 声波涟漪
        const centerX = width / 2;
        const centerY = height / 2;
        
        for (let i = 0; i < 4; i++) {
            const radius = (this.animationFrame * 1.5 + i * 25) % 120;
            const alpha = 1 - (radius / 120);
            
            this.ctx.strokeStyle = colors[i % colors.length] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawTherapyScene(width, height, colors) {
        // 治疗背景
        const gradient = this.ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        gradient.addColorStop(0, '#F8F0FF');
        gradient.addColorStop(1, '#E6E6FA');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 治疗波
        for (let i = 0; i < 8; i++) {
            const y = height/4 + Math.sin(this.animationFrame * 0.03 + i) * height/6;
            const alpha = 0.3 + Math.sin(this.animationFrame * 0.05 + i) * 0.2;
            
            this.ctx.strokeStyle = colors[i % colors.length] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            
            for (let x = 0; x <= width; x += 20) {
                const waveY = y + Math.sin((x + this.animationFrame * 2) * 0.05) * 10;
                this.ctx.lineTo(x, waveY);
            }
            this.ctx.stroke();
        }
    }
    
    drawDefaultScene(width, height, colors) {
        // 默认场景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, colors[0] || '#3b82f6');
        gradient.addColorStop(1, colors[1] || '#1e40af');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 简单粒子
        for (let i = 0; i < 10; i++) {
            const x = (this.animationFrame + i * 40) % width;
            const y = height/2 + Math.sin(this.animationFrame * 0.02 + i) * 20;
            
            this.ctx.fillStyle = (colors[i % colors.length] || '#60a5fa') + '80';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    clearCanvas() {
        const width = this.canvas.width / window.devicePixelRatio;
        const height = this.canvas.height / window.devicePixelRatio;
        this.ctx.clearRect(0, 0, width, height);
    }

    updateToggleButton() {
        if (this.isActive) {
            this.elements.toggleBtn.textContent = '🔇 关闭场景';
            this.elements.toggleBtn.classList.add('active');
        } else {
            this.elements.toggleBtn.textContent = '🎨 显示场景';
            this.elements.toggleBtn.classList.remove('active');
        }
    }

    cleanup() {
        this.stop();
    }
}