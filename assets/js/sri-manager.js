/**
 * SRI (Subresource Integrity) 管理器 - SoundFlows声音疗愈应用
 * 确保外部资源完整性，防止篡改攻击
 */

class SRIManager {
    constructor() {
        this.initialized = false;
        this.sriCache = new Map();
        this.integrityHashes = new Map();

        // 预定义的完整性哈希值
        this.knownHashes = {
            // Web Vitals
            'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js': {
                'sha384': 'sha384-...实际哈希值需要计算...' // 实际部署时需要计算真实的SRI哈希
            },

            // 常用CDN资源（示例）
            'https://cdn.jsdelivr.net/npm/web-vitals@3/dist/web-vitals.iife.js': {
                'sha384': 'sha384-...实际哈希值需要计算...'
            }
        };

        // CSP策略中的外部域名
        this.allowedDomains = new Set([
            'www.googletagmanager.com',
            'www.clarity.ms',
            'www.google-analytics.com',
            'stats.g.doubleclick.net',
            'unpkg.com',
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
            'fonts.gstatic.com'
        ]);

        this.init();
    }

    /**
     * 初始化SRI管理器
     */
    init() {
        if (this.initialized) {
            return;
        }

        // 监听所有动态加载的资源
        this.setupResourceMonitoring();

        // 验证现有资源
        this.validateExistingResources();

        // 拦截动态脚本加载
        this.hijackScriptLoading();

        // 提供SRI生成工具
        this.setupSRITools();

        this.initialized = true;
        console.log('🔒 SRI管理器已初始化');
    }

    /**
     * 设置资源监控
     */
    setupResourceMonitoring() {
        // 监听脚本加载
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleSecurityViolation(event);
        });

        // 使用MutationObserver监控动态添加的资源
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.validateElementIntegrity(node);
                    }
                });
            });
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href']
        });
    }

    /**
     * 验证现有资源
     */
    validateExistingResources() {
        // 验证所有link标签
        document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
            this.validateElementIntegrity(link);
        });

        // 验证所有script标签
        document.querySelectorAll('script[src]').forEach(script => {
            this.validateElementIntegrity(script);
        });
    }

    /**
     * 验证元素完整性
     */
    async validateElementIntegrity(element) {
        const src = element.getAttribute('src') || element.getAttribute('href');
        if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
            return;
        }

        // 检查是否是外部资源
        if (!this.isExternalResource(src)) {
            return;
        }

        // 检查是否已有完整性属性
        if (element.getAttribute('integrity')) {
            this.verifyIntegrity(element, src);
            return;
        }

        // 如果是已知资源，自动添加SRI
        if (this.knownHashes[src]) {
            this.addIntegrityAttribute(element, src);
            return;
        }

        // 对于未知的外部资源，发出警告
        if (this.shouldHaveSRI(src)) {
            console.warn(`⚠️ 外部资源缺少SRI保护: ${src}`);
            this.logMissingSRI(src);
        }
    }

    /**
     * 拦截脚本加载
     */
    hijackScriptLoading() {
        // 保存原始方法
        const originalAppendChild = Element.prototype.appendChild;
        const originalInsertBefore = Element.prototype.insertBefore;

        // 重写appendChild
        Element.prototype.appendChild = function(element) {
            if (element.tagName === 'SCRIPT' && element.src) {
                window.sriManager.validateScriptElement(element);
            }
            return originalAppendChild.call(this, element);
        };

        // 重写insertBefore
        Element.prototype.insertBefore = function(element, referenceNode) {
            if (element.tagName === 'SCRIPT' && element.src) {
                window.sriManager.validateScriptElement(element);
            }
            return originalInsertBefore.call(this, element, referenceNode);
        };

        // 监听动态脚本创建
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            if (tagName === 'SCRIPT') {
                const descriptor = Object.getOwnPropertyDescriptor(element, 'src');
                if (descriptor && descriptor.configurable) {
                    Object.defineProperty(element, 'src', {
                        get() {
                            return descriptor.get.call(element);
                        },
                        set(value) {
                            descriptor.set.call(element, value);
                            if (value) {
                                setTimeout(() => {
                                    window.sriManager.validateScriptElement(element);
                                }, 0);
                            }
                        },
                        configurable: true
                    });
                }
            }
            return element;
        };
    }

    /**
     * 验证脚本元素
     */
    validateScriptElement(script) {
        const src = script.src;
        if (!src || !this.isExternalResource(src)) {
            return;
        }

        // 检查是否需要SRI
        if (this.shouldHaveSRI(src) && !script.getAttribute('integrity')) {
            // 尝试从缓存获取
            if (this.sriCache.has(src)) {
                script.setAttribute('integrity', this.sriCache.get(src));
                return;
            }

            // 对于性能测试文件，允许无SRI（仅测试环境）
            if (src.includes('web-vitals') && window.location.pathname.includes('performance-test')) {
                console.warn('⚠️ 性能测试环境允许无SRI的web-vitals加载');
                return;
            }

            console.error(`🚨 检测到无SRI保护的外部脚本: ${src}`);
            this.handleUnprotectedResource(script, src);
        }
    }

    /**
     * 设置SRI工具
     */
    setupSRITools() {
        // 提供全局SRI生成函数
        window.generateSRI = async (url) => {
            return this.generateIntegrityHash(url);
        };

        window.validateResourceSRI = async (url, integrity) => {
            return this.verifyRemoteIntegrity(url, integrity);
        };

        // 添加SRI检查工具到控制台
        console.group('🔒 SRI工具可用');
        console.log('generateSRI(url) - 生成指定URL的SRI哈希');
        console.log('validateResourceSRI(url, integrity) - 验证资源完整性');
        console.log('window.sriManager - 访问SRI管理器实例');
        console.groupEnd();
    }

    /**
     * 生成完整性哈希
     */
    async generateIntegrityHash(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const buffer = await response.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-384', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            return `sha384-${hashHex}`;
        } catch (error) {
            console.error('生成SRI哈希失败:', error);
            return null;
        }
    }

    /**
     * 验证远程资源完整性
     */
    async verifyRemoteIntegrity(url, integrity) {
        try {
            const generatedHash = await this.generateIntegrityHash(url);
            return generatedHash === integrity;
        } catch (error) {
            console.error('验证资源完整性失败:', error);
            return false;
        }
    }

    /**
     * 验证完整性
     */
    async verifyIntegrity(element, url) {
        const integrity = element.getAttribute('integrity');
        if (!integrity) {
            return true;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                return false;
            }

            const buffer = await response.arrayBuffer();
            const [algorithm, expectedHash] = integrity.split('-');

            if (algorithm.startsWith('sha')) {
                const hashAlgorithm = algorithm.replace('sha', 'SHA');
                const hashBuffer = await crypto.subtle.digest(hashAlgorithm, buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const actualHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                if (actualHash !== expectedHash) {
                    console.error(`🚨 SRI验证失败: ${url}`);
                    console.error(`期望: ${expectedHash}`);
                    console.error(`实际: ${actualHash}`);
                    this.handleIntegrityViolation(element, url);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('SRI验证出错:', error);
            return false;
        }
    }

    /**
     * 添加完整性属性
     */
    addIntegrityAttribute(element, url) {
        const hashInfo = this.knownHashes[url];
        if (hashInfo) {
            const algorithm = Object.keys(hashInfo)[0];
            const hash = hashInfo[algorithm];
            element.setAttribute('integrity', `${algorithm}-${hash}`);
            element.setAttribute('crossorigin', 'anonymous');
            console.log(`✅ 已为 ${url} 添加SRI保护`);
        }
    }

    /**
     * 处理安全违规
     */
    handleSecurityViolation(event) {
        console.error('🚨 CSP违规:', event);

        if (event.blockedURI && event.blockedURI.startsWith('http')) {
            console.error('被阻止的资源:', event.blockedURI);
            console.error('违规指令:', event.violatedDirective);
        }
    }

    /**
     * 处理完整性违规
     */
    handleIntegrityViolation(element, url) {
        // 移除违规元素
        element.remove();

        // 显示警告
        this.showSecurityWarning(`检测到资源篡改: ${url}`);

        // 记录事件
        this.logSecurityEvent('integrity_violation', { url });
    }

    /**
     * 处理无保护资源
     */
    handleUnprotectedResource(element, url) {
        // 在生产环境中阻止加载
        if (this.isProductionEnvironment()) {
            element.setAttribute('integrity', 'blocked-by-sri-policy');
            element.remove();
            this.showSecurityWarning(`已阻止无SRI保护的外部资源: ${url}`);
        }
    }

    /**
     * 显示安全警告
     */
    showSecurityWarning(message) {
        // 创建警告提示
        const warning = document.createElement('div');
        warning.className = 'sri-warning';
        warning.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: monospace;
            font-size: 12px;
        `;
        warning.innerHTML = `
            <strong>🔒 安全警告</strong><br>
            ${message}<br>
            <small>请检查控制台获取更多信息</small>
        `;

        document.body.appendChild(warning);

        // 5秒后自动消失
        setTimeout(() => {
            warning.remove();
        }, 5000);
    }

    /**
     * 检查是否是外部资源
     */
    isExternalResource(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.origin !== window.location.origin;
        } catch {
            return false;
        }
    }

    /**
     * 检查是否需要SRI
     */
    shouldHaveSRI(url) {
        try {
            const urlObj = new URL(url);
            return this.allowedDomains.has(urlObj.hostname);
        } catch {
            return false;
        }
    }

    /**
     * 检查是否是生产环境
     */
    isProductionEnvironment() {
        return (
            window.location.hostname !== 'localhost' &&
            !window.location.hostname.startsWith('127.0.0.1') &&
            !window.location.hostname.startsWith('192.168.') &&
            !window.location.hostname.includes('.local') &&
            !window.location.protocol.includes('http://') &&
            !window.location.search.includes('dev=1')
        );
    }

    /**
     * 记录缺失的SRI
     */
    logMissingSRI(url) {
        this.logSecurityEvent('missing_sri', {
            url,
            location: window.location.href,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 记录安全事件
     */
    logSecurityEvent(type, details) {
        if (window.navigator.sendBeacon) {
            const data = {
                type,
                details,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            };
            navigator.sendBeacon('/api/security-log', JSON.stringify(data));
        }
    }

    /**
     * 批量更新资源的SRI
     */
    async batchUpdateSRI() {
        console.log('🔍 开始批量更新SRI...');

        // 查找所有需要SRI的外部资源
        const elements = [
            ...document.querySelectorAll('script[src]'),
            ...document.querySelectorAll('link[rel="stylesheet"][href]')
        ];

        const updates = [];

        for (const element of elements) {
            const url = element.getAttribute('src') || element.getAttribute('href');
            if (url && this.isExternalResource(url) && this.shouldHaveSRI(url)) {
                const hash = await this.generateIntegrityHash(url);
                if (hash) {
                    element.setAttribute('integrity', hash);
                    element.setAttribute('crossorigin', 'anonymous');
                    updates.push({ url, hash });
                    this.sriCache.set(url, hash);
                }
            }
        }

        console.log(`✅ 已更新 ${updates.length} 个资源的SRI`);
        return updates;
    }

    /**
     * 生成SRI报告
     */
    generateSRIReport() {
        const resources = [
            ...document.querySelectorAll('script[src]'),
            ...document.querySelectorAll('link[rel="stylesheet"][href]')
        ];

        const report = {
            total: resources.length,
            withSRI: 0,
            withoutSRI: 0,
            external: 0,
            details: []
        };

        resources.forEach(resource => {
            const url = resource.getAttribute('src') || resource.getAttribute('href');
            const isExternal = this.isExternalResource(url);
            const hasSRI = !!resource.getAttribute('integrity');

            if (isExternal) {
                report.external++;
            }
            if (hasSRI) {
                report.withSRI++;
            } else if (isExternal) {
                report.withoutSRI++;
            }

            report.details.push({
                url,
                isExternal,
                hasSRI,
                tag: resource.tagName.toLowerCase()
            });
        });

        return report;
    }

    /**
     * 打印SRI报告
     */
    printSRIReport() {
        const report = this.generateSRIReport();

        console.group('🔒 SRI完整性报告');
        console.log(`总资源数: ${report.total}`);
        console.log(`有SRI保护: ${report.withSRI}`);
        console.log(`无SRI保护: ${report.withoutSRI}`);
        console.log(`外部资源: ${report.external}`);

        if (report.details.some(d => d.isExternal && !d.hasSRI)) {
            console.warn('以下外部资源缺少SRI保护:');
            report.details
                .filter(d => d.isExternal && !d.hasSRI)
                .forEach(d => console.warn(`- ${d.url}`));
        }

        console.groupEnd();
    }

    /**
     * 公共API
     */

    // 获取SRI状态
    getSRIStatus() {
        return this.generateSRIReport();
    }

    // 更新单个资源的SRI
    async updateResourceSRI(url) {
        const hash = await this.generateIntegrityHash(url);
        if (hash) {
            this.sriCache.set(url, hash);
            this.knownHashes[url] = { 'sha384': hash };
            return hash;
        }
        return null;
    }

    // 验证所有资源
    async validateAllResources() {
        const resources = [
            ...document.querySelectorAll('script[integrity]'),
            ...document.querySelectorAll('link[integrity]')
        ];

        const results = [];
        for (const resource of resources) {
            const url = resource.getAttribute('src') || resource.getAttribute('href');
            const integrity = resource.getAttribute('integrity');
            const isValid = await this.verifyIntegrity(resource, url);
            results.push({ url, isValid });
        }

        return results;
    }

    // 销毁实例
    destroy() {
        this.sriCache.clear();
        this.integrityHashes.clear();
        this.initialized = false;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.sriManager = new SRIManager();

    // 导出到全局命名空间
    window.SRIManager = SRIManager;

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.sriManager.init();

            // 开发环境中自动打印SRI报告
            if (window.location.hostname === 'localhost') {
                setTimeout(() => {
                    window.sriManager.printSRIReport();
                }, 1000);
            }
        });
    } else {
        window.sriManager.init();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SRIManager;
}