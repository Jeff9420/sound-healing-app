/**
 * 浏览器兼容性检测和补丁系统
 * 确保应用在各种浏览器中正常运行
 */

(() => {
    'use strict';

    class BrowserCompatibility {
        constructor() {
            this.features = this.detectFeatures();
            this.applyPolyfills();
            this.addCompatibilityClasses();
        }

        detectFeatures() {
            const features = {
                // 音频支持
                audio: !!window.Audio,
                audioContext: !!(window.AudioContext || window.webkitAudioContext),
                webAudioAPI: !!(window.AudioContext || window.webkitAudioContext),

                // Canvas支持
                canvas: !!document.createElement('canvas').getContext,
                requestAnimationFrame: !!window.requestAnimationFrame,

                // Promise支持
                promise: !!window.Promise,

                // Fetch API
                fetch: !!window.fetch,

                // 触摸支持
                touch: 'ontouchstart' in window,

                // 设备内存信息
                deviceMemory: navigator.deviceMemory || 4,

                // 硬件并发
                hardwareConcurrency: navigator.hardwareConcurrency || 4,

                // CSS特性
                cssVariables: window.CSS && CSS.supports('color', 'var(--test)'),
                flexbox: CSS.supports('display', 'flex'),
                grid: CSS.supports('display', 'grid'),

                // 浏览器检测
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
                isFirefox: /Firefox/i.test(navigator.userAgent),
                isChrome: /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent),
                isEdge: /Edge/i.test(navigator.userAgent),
                isIE: !!document.documentMode
            };

            return features;
        }

        applyPolyfills() {
            // RequestAnimationFrame polyfill
            if (!this.features.requestAnimationFrame) {
                const vendors = ['ms', 'moz', 'webkit', 'o'];
                for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
                }

                if (!window.requestAnimationFrame) {
                    window.requestAnimationFrame = (callback) => {
                        return window.setTimeout(callback, 16);
                    };
                    window.cancelAnimationFrame = (id) => {
                        clearTimeout(id);
                    };
                }
            }

            // Promise polyfill (如果需要)
            if (!this.features.promise) {
                console.warn('Promise not supported. Consider adding a Promise polyfill.');
            }

            // Canvas性能优化
            if (this.features.canvas) {
                this.optimizeCanvasPerformance();
            }

            // 音频上下文兼容性
            if (this.features.audioContext) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
            }
        }

        optimizeCanvasPerformance() {
            // 为低端设备优化Canvas渲染
            if (this.features.isMobile || this.features.deviceMemory < 4) {
                const style = document.createElement('style');
                style.textContent = `
          canvas {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        `;
                document.head.appendChild(style);
            }
        }

        addCompatibilityClasses() {
            const html = document.documentElement;

            // 添加浏览器类
            if (this.features.isMobile) {
                html.classList.add('mobile-device');
            }
            if (this.features.isSafari) {
                html.classList.add('safari');
            }
            if (this.features.isFirefox) {
                html.classList.add('firefox');
            }
            if (this.features.isChrome) {
                html.classList.add('chrome');
            }
            if (this.features.isEdge) {
                html.classList.add('edge');
            }
            if (this.features.isIE) {
                html.classList.add('ie');
            }

            // 添加功能类
            if (this.features.touch) {
                html.classList.add('touch-enabled');
            }
            if (this.features.cssVariables) {
                html.classList.add('css-variables');
            }
            if (!this.features.flexbox) {
                html.classList.add('no-flexbox');
            }
            if (!this.features.grid) {
                html.classList.add('no-grid');
            }

            // 添加性能类
            if (this.features.deviceMemory < 4) {
                html.classList.add('low-memory-device');
            }
            if (this.features.hardwareConcurrency < 4) {
                html.classList.add('low-cpu-device');
            }
        }

        getCompatibilityInfo() {
            return {
                ...this.features,
                isLowEndDevice: this.features.isMobile ||
                       this.features.deviceMemory < 4 ||
                       this.features.hardwareConcurrency < 4,
                supportedAudioFormats: this.getSupportedAudioFormats()
            };
        }

        getSupportedAudioFormats() {
            const audio = document.createElement('audio');
            const formats = {
                mp3: !!audio.canPlayType('audio/mpeg;'),
                wav: !!audio.canPlayType('audio/wav; codecs="1"'),
                ogg: !!audio.canPlayType('audio/ogg; codecs="vorbis"'),
                aac: !!audio.canPlayType('audio/aac;'),
                flac: !!audio.canPlayType('audio/flac;')
            };

            return formats;
        }

        showCompatibilityWarning() {
            if (!this.features.audio) {
                this.showWarning('您的浏览器不支持音频播放', '请使用现代浏览器如Chrome、Firefox或Safari');
            }

            if (this.features.isIE) {
                this.showWarning('Internet Explorer支持有限', '建议升级到Edge浏览器以获得最佳体验');
            }

            if (this.features.isLowEndDevice) {
                console.info('检测到低端设备，已自动优化性能');
            }
        }

        showWarning(title, message) {
            // 创建友好的警告提示
            const warning = document.createElement('div');
            warning.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b6b;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 80%;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

            warning.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 14px;">${message}</div>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 12px;
          padding: 6px 16px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          border-radius: 4px;
          cursor: pointer;
        ">知道了</button>
      `;

            document.body.appendChild(warning);

            // 10秒后自动消失
            setTimeout(() => {
                if (warning.parentElement) {
                    warning.remove();
                }
            }, 10000);
        }
    }

    // 初始化兼容性检测
    window.browserCompatibility = new BrowserCompatibility();

    // 在DOM加载完成后显示警告
    document.addEventListener('DOMContentLoaded', () => {
        window.browserCompatibility.showCompatibilityWarning();
    });

    // 导出兼容性信息供其他模块使用
    window.soundHealingCompatibility = window.browserCompatibility.getCompatibilityInfo();
})();