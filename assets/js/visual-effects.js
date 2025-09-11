class VisualEffects {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isActive = false;
        this.soundBasedEffects = new Map();
        
        this.initCanvas();
        this.setupSoundEffects();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.6';
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        document.body.appendChild(this.canvas);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupSoundEffects() {
        this.soundBasedEffects.set('rain', {
            particleCount: 100,
            color: 'rgba(59, 130, 246, 0.3)',
            speed: 5,
            size: 2,
            direction: 'down'
        });

        this.soundBasedEffects.set('ocean', {
            particleCount: 50,
            color: 'rgba(16, 185, 129, 0.2)',
            speed: 2,
            size: 4,
            direction: 'wave'
        });

        this.soundBasedEffects.set('wind', {
            particleCount: 80,
            color: 'rgba(148, 163, 184, 0.2)',
            speed: 3,
            size: 1.5,
            direction: 'flow'
        });

        this.soundBasedEffects.set('fire', {
            particleCount: 60,
            color: 'rgba(251, 146, 60, 0.3)',
            speed: 1,
            size: 3,
            direction: 'up'
        });

        this.soundBasedEffects.set('stream', {
            particleCount: 40,
            color: 'rgba(56, 189, 248, 0.25)',
            speed: 2.5,
            size: 2.5,
            direction: 'flow'
        });

        this.soundBasedEffects.set('birds', {
            particleCount: 30,
            color: 'rgba(34, 197, 94, 0.3)',
            speed: 1.5,
            size: 2,
            direction: 'float'
        });
    }

    startEffect(soundId, volume = 0.5) {
        const effect = this.soundBasedEffects.get(soundId);
        if (!effect) return;

        const particleCount = Math.floor(effect.particleCount * volume);
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(soundId, effect);
        }

        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }

    stopEffect(soundId) {
        this.particles = this.particles.filter(p => p.soundId !== soundId);
        
        if (this.particles.length === 0) {
            this.isActive = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.clearCanvas();
        }
    }

    createParticle(soundId, effect) {
        const particle = {
            soundId: soundId,
            x: Math.random() * this.canvas.width,
            y: effect.direction === 'up' ? this.canvas.height : -10,
            size: effect.size + Math.random() * 2,
            speed: effect.speed + Math.random() * 2,
            color: effect.color,
            direction: effect.direction,
            life: 1.0,
            decay: 0.001 + Math.random() * 0.002,
            angle: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 2,
            vy: effect.direction === 'up' ? -(1 + Math.random()) : (1 + Math.random())
        };

        this.particles.push(particle);
    }

    animate() {
        if (!this.isActive) return;

        this.clearCanvas();
        this.updateParticles();
        this.drawParticles();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life -= particle.decay;
            
            switch (particle.direction) {
                case 'down':
                    particle.y += particle.speed;
                    particle.x += Math.sin(particle.y * 0.01) * 0.5;
                    break;
                case 'up':
                    particle.y -= particle.speed;
                    particle.x += Math.sin(particle.y * 0.02) * 0.8;
                    break;
                case 'flow':
                    particle.x += particle.vx;
                    particle.y += particle.vy * 0.5;
                    break;
                case 'wave':
                    particle.x += Math.sin(particle.angle) * particle.speed;
                    particle.y += Math.cos(particle.angle * 0.5) * 0.5;
                    particle.angle += 0.02;
                    break;
                case 'float':
                    particle.x += Math.sin(particle.angle) * 0.5;
                    particle.y += Math.cos(particle.angle) * 0.3;
                    particle.angle += 0.03;
                    break;
            }

            return particle.life > 0 && 
                   particle.x > -50 && particle.x < this.canvas.width + 50 &&
                   particle.y > -50 && particle.y < this.canvas.height + 50;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateSoundEffect(soundId, volume, isPlaying) {
        if (isPlaying && volume > 0) {
            this.startEffect(soundId, volume);
        } else {
            this.stopEffect(soundId);
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.particles = [];
        this.isActive = false;
    }
}