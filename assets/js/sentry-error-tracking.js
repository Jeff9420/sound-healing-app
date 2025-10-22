/**
 * Sentry错误追踪配置
 * 自动捕获和报告前端错误
 * 版本: 1.0.0
 */

(function() {
    'use strict';

    // Sentry配置
    const SENTRY_CONFIG = {
        dsn: 'https://your-dsn@sentry.io/your-project-id', // 需要替换为实际的DSN
        environment: window.location.hostname === 'localhost' ? 'development' : 'production',
        release: 'soundflows@v3.0.0',
        tracesSampleRate: 0.1, // 10%的采样率
        debug: false,
        beforeSend: function(event, hint) {
            // 过滤敏感信息
            if (event.exception) {
                // 检查是否有敏感信息
                const errorString = JSON.stringify(event);
                const sensitivePatterns = [
                    /password/i,
                    /token/i,
                    /secret/i,
                    /key/i
                ];

                if (sensitivePatterns.some(pattern => pattern.test(errorString))) {
                    // 清除敏感信息
                    event.exception.values[0].stacktrace = {
                        frames: event.exception.values[0].stacktrace.frames.map(frame => ({
                            ...frame,
                            filename: frame.filename.replace(/\/.*\//, '/***/')
                        }))
                    };
                }
            }
            return event;
        }
    };

    // 动态加载Sentry SDK
    function loadSentry() {
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/7.64.0/bundle.tracing.min.js';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            if (window.Sentry) {
                window.Sentry.init(SENTRY_CONFIG);
                console.log('✅ Sentry错误追踪已初始化');

                // 设置用户上下文
                if (window.userManager && window.userManager.currentUser) {
                    const user = window.userManager.currentUser;
                    window.Sentry.setUser({
                        id: user.uid || 'anonymous',
                        email: user.email || undefined,
                        username: user.displayName || 'Anonymous User'
                    });
                }

                // 设置标签
                window.Sentry.setTag({
                    platform: navigator.platform,
                    language: navigator.language,
                    theme: localStorage.getItem('theme') || 'light'
                });

                // 自定义错误追踪函数
                window.trackError = function(error, context = {}) {
                    if (window.Sentry) {
                        window.Sentry.withScope(scope => {
                            Object.keys(context).forEach(key => {
                                scope.setTag(key, context[key]);
                            });
                            window.Sentry.captureException(error);
                        });
                    }
                };

                // 追踪自定义事件
                window.trackEvent = function(message, level = 'info', extra = {}) {
                    if (window.Sentry) {
                        window.Sentry.captureMessage(message, level, extra);
                    }
                };
            }
        };
        script.onerror = function() {
            console.warn('⚠️ Sentry SDK加载失败');
        };
        document.head.appendChild(script);
    }

    // 初始化错误追踪
    function initErrorTracking() {
        // 仅在生产环境加载Sentry
        if (SENTRY_CONFIG.environment === 'production') {
            loadSentry();
        } else {
            console.log('🔧 开发环境 - Sentry未加载');

            // 开发环境的错误追踪
            window.trackError = function(error, context = {}) {
                console.error('追踪错误:', error, context);
            };

            window.trackEvent = function(message, level = 'info', extra = {}) {
                console.log(`[${level.toUpperCase()}] ${message}`, extra);
            };
        }

        // 全局错误处理
        window.addEventListener('error', function(event) {
            const error = event.error || new Error(event.message);
            const context = {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            if (window.trackError) {
                window.trackError(error, context);
            }
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', function(event) {
            const error = event.reason || new Error('Unhandled Promise Rejection');
            const context = {
                type: 'unhandledrejection',
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            if (window.trackError) {
                window.trackError(error, context);
            }

            // 防止控制台显示错误
            event.preventDefault();
        });

        // 音频播放错误追踪
        window.addEventListener('audioerror', function(event) {
            const audio = event.target;
            const context = {
                audioSrc: audio.src,
                audioType: audio.type || 'unknown',
                currentTime: audio.currentTime,
                playbackState: audio.readyState
            };

            if (window.trackError) {
                window.trackError(new Error('音频播放失败'), context);
            }
        });

        // 视频加载错误追踪
        window.addEventListener('videoerror', function(event) {
            const video = event.target;
            const context = {
                videoSrc: video.src,
                videoType: video.type || 'unknown',
                currentTime: video.currentTime,
                readyState: video.readyState
            };

            if (window.trackError) {
                window.trackError(new Error('视频加载失败'), context);
            }
        });
    }

    // 性能监控
    function initPerformanceTracking() {
        // 页面加载性能
        window.addEventListener('load', function() {
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    const perfData = {
                        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                        tcpConnect: timing.connectEnd - timing.connectStart,
                        serverResponse: timing.responseEnd - timing.requestStart,
                        domLoad: timing.domContentLoadedEventEnd - timing.navigationStart,
                        pageLoad: timing.loadEventEnd - timing.navigationStart,
                        totalTime: timing.loadEventEnd - timing.navigationStart
                    };

                    // 如果性能指标异常，发送到Sentry
                    if (perfData.totalTime > 5000) { // 5秒
                        window.trackEvent('页面加载时间过长', 'warning', {
                            extra: perfData
                        });
                    }
                }
            }, 1000);
        });

        // 内存使用监控
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                const memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };

                // 内存使用超过80%时发送警告
                const usagePercent = (memoryUsage.used / memoryUsage.limit) * 100;
                if (usagePercent > 80) {
                    window.trackEvent('内存使用过高', 'warning', {
                        extra: memoryUsage
                    });
                }
            }, 60000); // 每分钟检查一次
        }
    }

    // API错误拦截
    function initAPIErrorTracking() {
        // 拦截fetch请求错误
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch.apply(this, args);

                // 检查响应状态
                if (!response.ok) {
                    const context = {
                        url: args[0],
                        method: args[1]?.method || 'GET',
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: new Date().toISOString()
                    };

                    // 4xx和5xx错误发送到Sentry
                    if (response.status >= 400) {
                        window.trackEvent(`API请求失败: ${response.status}`, 'warning', {
                            extra: context
                        });
                    }
                }

                return response;
            } catch (error) {
                const context = {
                    url: args[0],
                    method: args[1]?.method || 'GET',
                    timestamp: new Date().toISOString(),
                    isNetworkError: true
                };

                window.trackError(error, context);
                throw error;
            }
        };
    }

    // 初始化所有追踪功能
    document.addEventListener('DOMContentLoaded', function() {
        initErrorTracking();
        initPerformanceTracking();
        initAPIErrorTracking();
    });

    // 导出配置（供调试使用）
    window.SentryConfig = SENTRY_CONFIG;
})();