/**
 * Sentry错误追踪配置
 * 自动捕获和报告前端错误
 * 版本: 1.0.0
 */

(function() {
    'use strict';

    // Sentry配置
    const SENTRY_CONFIG = {
        dsn: 'https://174e02272656ef61eb15fd4c0d739d07@o4510233460670465.ingest.us.sentry.io/4510236672131072', // 官方 DSN
        environment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'development' : 'production',
        release: 'soundflows@v3.0.0',
        tracesSampleRate: window.location.hostname === 'localhost' ? 1.0 : 0.1, // 开发环境100%采样，生产环境10%采样
        debug: window.location.hostname === 'localhost',
        sendDefaultPii: true, // 发送默认 PII 数据（如 IP 地址）
        beforeSend: function(event, hint) {
            // 过滤敏感信息，即使启用了 sendDefaultPii
            if (event.exception) {
                // 检查是否有敏感信息
                const errorString = JSON.stringify(event);
                const sensitivePatterns = [
                    /password/i,
                    /token/i,
                    /secret/i,
                    /key/i,
                    /authorization/i,
                    /cookie/i,
                    /session/i
                ];

                if (sensitivePatterns.some(pattern => pattern.test(errorString))) {
                    // 清除敏感信息
                    if (event.exception.values[0].stacktrace) {
                        event.exception.values[0].stacktrace = {
                            frames: event.exception.values[0].stacktrace.frames.map(frame => ({
                                ...frame,
                                filename: frame.filename.replace(/\/.*\//, '/***/'),
                                pre_context: frame.pre_context ? frame.pre_context.map(line =>
                                    line.replace(/(?:password|token|secret|key|authorization|cookie|session)[\s=:]+[^\s\n]*/gi, '$1***')
                                ) : undefined,
                                context_line: frame.context_line ?
                                    frame.context_line.replace(/(?:password|token|secret|key|authorization|cookie|session)[\s=:]+[^\s\n]*/gi, '$1***') : undefined,
                                post_context: frame.post_context ? frame.post_context.map(line =>
                                    line.replace(/(?:password|token|secret|key|authorization|cookie|session)[\s=:]+[^\s\n]*/gi, '$1***')
                                ) : undefined
                            }))
                        };
                    }
                }
            }

            // 清除请求中的敏感数据
            if (event.request && event.request.headers) {
                const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
                Object.keys(event.request.headers).forEach(header => {
                    if (sensitiveHeaders.includes(header.toLowerCase())) {
                        event.request.headers[header] = '***';
                    }
                });
            }

            // 清除 URL 中的敏感参数
            if (event.request && event.request.url) {
                event.request.url = event.request.url.replace(/([?&])(?:password|token|secret|key|authorization|cookie|session)=[^&]*/gi, '$1$2=***');
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
                        email: SENTRY_CONFIG.sendDefaultPii ? (user.email || undefined) : undefined,
                        username: user.displayName || 'Anonymous User',
                        ip_address: SENTRY_CONFIG.sendDefaultPii ? '{{auto}}' : undefined
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

                const pendingAiEvents = Array.isArray(window.__pendingAISignatureSentry)
                    ? window.__pendingAISignatureSentry.splice(0)
                    : [];
                pendingAiEvents.forEach(payload => {
                    if (window.Sentry && typeof window.Sentry.addBreadcrumb === 'function') {
                        window.Sentry.addBreadcrumb({
                            category: 'ai',
                            message: 'soundflows.aiSignatureStart (queued)',
                            data: payload,
                            level: 'info'
                        });
                    }
                    if (window.Sentry) {
                        window.Sentry.captureMessage('ai_signature_start', {
                            level: 'info',
                            extra: payload
                        });
                    }
                });
            }
        };
        script.onerror = function() {
            console.warn('⚠️ Sentry SDK加载失败');
        };
        document.head.appendChild(script);
    }

    // 初始化错误追踪
    function initErrorTracking() {
        // 在所有环境加载Sentry，但根据环境调整配置
        loadSentry();

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
                playbackState: audio.readyState,
                audioCategory: audio.dataset.category || 'unknown',
                trackName: audio.dataset.trackName || 'unknown'
            };

            if (window.trackError) {
                window.trackError(new Error('音频播放失败'), context);
            }
        });

        // 添加音频管理器错误追踪
        if (window.audioManager) {
            const originalPlayTrack = window.audioManager.playTrack;
            window.audioManager.playTrack = function(...args) {
                try {
                    return originalPlayTrack.apply(this, args);
                } catch (error) {
                    window.trackError(error, {
                        function: 'audioManager.playTrack',
                        args: args,
                        audioCategory: args[1],
                        trackName: args[2]
                    });
                    throw error;
                }
            };
        }

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

        // 音频加载性能监控
        window.addEventListener('load', function() {
            // 监控音频配置加载
            if (window.AUDIO_CONFIG) {
                const audioCount = Object.values(window.AUDIO_CONFIG).reduce((sum, cat) => sum + (cat?.files?.length || 0), 0);
                window.trackEvent('音频配置加载完成', 'info', {
                    extra: {
                        categories: Object.keys(window.AUDIO_CONFIG).length,
                        totalTracks: audioCount
                    }
                });
            }
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
