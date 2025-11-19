/**
 * CanvasManager Module
 * Handles background particle animations.
 */

export class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.animationId = null;
        this.isPageVisible = true;
        this.lastFrameTime = 0;
        this.targetFrameTime = 1000 / 30; // 30 FPS

        if (this.canvas) {
            this.init();
        }
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupVisibilityListener();
        this.changeScene('default');
        this.animate();
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (this.isPageVisible) {
                if (!this.animationId) this.animate();
            } else {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }
        });
    }

    changeScene(scene) {
        if (!this.ctx) return;

        this.particles = [];
        const sceneConfigs = {
            default: { count: 30, colors: ['rgba(255,255,255,0.5)'], type: 'circle' },
            meditation: { count: 40, colors: ['rgba(147,112,219,0.5)', 'rgba(138,43,226,0.3)'], type: 'energy' },
            nature: { count: 50, colors: ['rgba(34,139,34,0.5)', 'rgba(50,205,50,0.3)'], type: 'leaf' },
            rain: { count: 80, colors: ['rgba(173,216,230,0.6)', 'rgba(135,206,235,0.4)'], type: 'drop' },
            singing: { count: 35, colors: ['rgba(255,215,0,0.5)', 'rgba(255,223,0,0.3)'], type: 'energy' }
        };

        const config = sceneConfigs[scene] || sceneConfigs.default;

        for (let i = 0; i < config.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: config.colors[Math.floor(Math.random() * config.colors.length)],
                type: config.type,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    animate(currentTime = 0) {
        if (!this.ctx || !this.isPageVisible) return;

        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < this.targetFrameTime) {
            this.animationId = requestAnimationFrame((t) => this.animate(t));
            return;
        }

        this.lastFrameTime = currentTime - (elapsed % this.targetFrameTime);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.globalAlpha = 0.6;

        for (let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.canvas.width;
            else if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            else if (p.y > this.canvas.height) p.y = 0;

            this.ctx.fillStyle = p.color;

            if (p.type === 'leaf') {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.angle);
                this.ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
                this.ctx.restore();
                p.angle += 0.01;
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.globalAlpha = 1.0;
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
}
