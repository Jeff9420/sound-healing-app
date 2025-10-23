/**
 * 全局错误处理器
 * 捕获未处理的错误和Promise拒绝，提供统一的错误处理和上报
 *
 * @author Sound Healing Team
 * @version 1.0.0
 */

class GlobalErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // 最多保存50个错误
        this.isInitialized = false;
        this.isHandlingError = false; // 防止递归调用
    }

    /**
     * 初始化全局错误处理
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        // 捕获全局JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        });

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection({
                type: 'unhandledrejection',
                reason: event.reason,
                promise: event.promise,
                timestamp: new Date().toISOString()
            });

            // 阻止默认的控制台错误输出
            event.preventDefault();
        });

        // 捕获资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError({
                    type: 'resource',
                    tagName: event.target.tagName,
                    src: event.target.src || event.target.href,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);

        this.isInitialized = true;
        console.log('✅ 全局错误处理器已初始化');
    }

    /**
     * 处理JavaScript错误
     */
    handleError(errorInfo) {
        // 防止递归调用导致栈溢出
        if (this.isHandlingError) {
            return;
        }

        try {
            this.isHandlingError = true;

            console.error('🔴 全局错误:', errorInfo);

            // 保存错误信息
            this.saveError(errorInfo);

            // 上报到分析服务
            this.reportToAnalytics('javascript_error', errorInfo);

            // 对于严重错误，显示用户友好的提示
            if (this.isCriticalError(errorInfo)) {
                this.showUserNotification(
                    '应用遇到了一个问题，我们正在努力修复。请刷新页面重试。',
                    'error'
                );
            }
        } catch (e) {
            // 错误处理过程中出错，只记录到控制台
            console.error('[ErrorHandler] Failed to handle error:', e);
        } finally {
            this.isHandlingError = false;
        }
    }

    /**
     * 处理Promise拒绝
     */
    handlePromiseRejection(rejectionInfo) {
        console.error('🔴 未处理的Promise拒绝:', rejectionInfo);

        // 保存错误信息
        this.saveError(rejectionInfo);

        // 上报到分析服务
        this.reportToAnalytics('promise_rejection', rejectionInfo);

        // 特殊处理：音频加载失败
        if (rejectionInfo.reason && rejectionInfo.reason.message) {
            const message = rejectionInfo.reason.message;

            if (message.includes('音频加载超时') || message.includes('音频加载失败')) {
                this.showUserNotification(
                    '音频加载失败，请检查网络连接或稍后重试',
                    'warning'
                );
            }
        }
    }

    /**
     * 处理资源加载错误
     */
    handleResourceError(errorInfo) {
        // 过滤掉正常的blob URL错误（视频降级时产生）
        if (errorInfo.src && errorInfo.src.startsWith('blob:')) {
            // 这是视频降级到Canvas的正常行为，不需要警告
            return;
        }

        // 过滤掉扩展程序阻止的脚本
        if (errorInfo.tagName === 'SCRIPT' &&
            (errorInfo.src.includes('amplitude.com') ||
             errorInfo.src.includes('googletagmanager.com'))) {
            // 扩展程序阻止跟踪脚本，这是正常的
            return;
        }

        console.warn('⚠️ 资源加载失败:', errorInfo);

        // 保存错误信息
        this.saveError(errorInfo);

        // 上报到分析服务
        this.reportToAnalytics('resource_error', errorInfo);
    }

    /**
     * 保存错误信息
     */
    saveError(errorInfo) {
        this.errors.push(errorInfo);

        // 限制错误数量
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // 保存到localStorage (用于调试)
        try {
            const recentErrors = this.errors.slice(-10);
            localStorage.setItem('app_errors', JSON.stringify(recentErrors));
        } catch (e) {
            // 忽略localStorage错误
        }
    }

    /**
     * 判断是否为严重错误
     */
    isCriticalError(errorInfo) {
        if (!errorInfo.message) return false;

        const criticalKeywords = [
            'Cannot read property',
            'is not a function',
            'is not defined',
            'Failed to fetch'
        ];

        return criticalKeywords.some(keyword =>
            errorInfo.message.includes(keyword)
        );
    }

    /**
     * 上报到Google Analytics
     */
    reportToAnalytics(errorType, errorInfo) {
        if (typeof gtag === 'undefined') {
            return;
        }

        try {
            // 安全获取错误描述
            let description = 'Unknown error';
            try {
                description = this.getErrorDescription(errorInfo);
            } catch (e) {
                description = 'Error description unavailable';
            }

            gtag('event', 'exception', {
                description: description,
                fatal: this.isCriticalError(errorInfo),
                error_type: errorType,
                error_location: errorInfo.filename || 'unknown',
                error_line: errorInfo.line || 0
            });
        } catch (e) {
            // 静默失败，不要抛出新错误
            // console.warn('无法上报错误到Analytics:', e);
        }
    }

    /**
     * 获取错误描述
     */
    getErrorDescription(errorInfo) {
        if (errorInfo.message) {
            return errorInfo.message.substring(0, 150);
        } else if (errorInfo.reason) {
            if (errorInfo.reason.message) {
                return errorInfo.reason.message.substring(0, 150);
            }
            return String(errorInfo.reason).substring(0, 150);
        } else if (errorInfo.src) {
            return `Resource failed: ${errorInfo.src}`.substring(0, 150);
        }
        return 'Unknown error';
    }

    /**
     * 显示用户通知
     */
    showUserNotification(message, type = 'info') {
        // 使用全局通知函数
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }

        // 备用：简单的控制台输出
        const emoji = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };

        console.log(`${emoji[type] || ''} ${message}`);
    }

    /**
     * 获取所有错误
     */
    getErrors() {
        return [...this.errors];
    }

    /**
     * 清空错误记录
     */
    clearErrors() {
        this.errors = [];
        try {
            localStorage.removeItem('app_errors');
        } catch (e) {
            // 忽略
        }
    }

    /**
     * 获取错误统计
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-5)
        };

        this.errors.forEach(error => {
            const type = error.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.globalErrorHandler = new GlobalErrorHandler();

    // 页面加载后立即初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.globalErrorHandler.initialize();
        });
    } else {
        window.globalErrorHandler.initialize();
    }

    // 开发模式：在控制台添加便捷方法
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.getErrors = () => window.globalErrorHandler.getErrors();
        window.getErrorStats = () => window.globalErrorHandler.getErrorStats();
        window.clearErrors = () => window.globalErrorHandler.clearErrors();

        console.log('🛠️ 调试方法已添加: getErrors(), getErrorStats(), clearErrors()');
    }
}
