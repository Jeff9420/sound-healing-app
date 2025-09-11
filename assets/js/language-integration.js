/**
 * 多语言集成控制器 - 声音疗愈应用
 * 负责语言切换UI交互和动态内容更新
 * 
 * @author Claude Code Multi-language Integration
 * @date 2024-09-05
 */

class LanguageIntegrationController {
    constructor() {
        this.i18nSystem = null;
        this.languageSelector = null;
        this.languageToggle = null;
        this.languageDropdown = null;
        this.isInitialized = false;
        
        // 等待i18n系统初始化
        this.waitForI18nSystem();
    }
    
    /**
     * 等待国际化系统加载完成
     */
    async waitForI18nSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5秒超时
        
        const checkI18n = () => {
            if (window.i18n && window.i18n.isInitialized) {
                this.i18nSystem = window.i18n;
                this.init();
                return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkI18n, 100);
            } else {
                console.error('❌ 国际化系统加载超时');
            }
        };
        
        checkI18n();
    }
    
    /**
     * 初始化语言切换控制器
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.initializeElements();
            this.setupEventListeners();
            this.updateLanguageDisplay();
            this.isInitialized = true;
            
            console.log('✅ 语言集成控制器初始化完成');
        } catch (error) {
            console.error('❌ 语言集成控制器初始化失败:', error);
        }
    }
    
    /**
     * 初始化DOM元素
     */
    initializeElements() {
        this.languageSelector = document.getElementById('languageSelector');
        this.languageToggle = document.getElementById('languageToggle');
        this.languageDropdown = document.getElementById('languageDropdown');
        
        console.log('🔍 DOM元素检查:', {
            languageSelector: !!this.languageSelector,
            languageToggle: !!this.languageToggle,
            languageDropdown: !!this.languageDropdown
        });
        
        if (!this.languageSelector || !this.languageToggle || !this.languageDropdown) {
            throw new Error('语言选择器DOM元素未找到');
        }
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        console.log('🔧 设置语言切换事件监听器...');
        
        // 切换下拉菜单显示/隐藏
        this.languageToggle.addEventListener('click', (e) => {
            console.log('🖱️ 语言切换按钮被点击');
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // 语言选项点击事件
        this.languageDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const langCode = option.getAttribute('data-lang');
                this.changeLanguage(langCode);
            }
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.languageSelector.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // 监听语言变更事件
        document.addEventListener('languageChanged', (e) => {
            this.updateLanguageDisplay();
        });
        
        // 监听语言集成变更事件
        document.addEventListener('languageIntegrationChanged', (e) => {
            this.updateLanguageDisplay();
        });
        
        // 键盘导航支持
        this.languageDropdown.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }
    
    /**
     * 切换下拉菜单显示状态
     */
    toggleDropdown() {
        const isActive = this.languageSelector.classList.contains('active');
        if (isActive) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    /**
     * 打开下拉菜单
     */
    openDropdown() {
        this.languageSelector.classList.add('active');
        this.updateActiveOption();
        
        // 聚焦到当前语言选项
        const currentOption = this.languageDropdown.querySelector('.language-option.active');
        if (currentOption) {
            currentOption.focus();
        }
    }
    
    /**
     * 关闭下拉菜单
     */
    closeDropdown() {
        this.languageSelector.classList.remove('active');
    }
    
    /**
     * 更新语言显示
     */
    updateLanguageDisplay() {
        if (!this.i18nSystem) return;
        
        const currentLang = this.i18nSystem.getCurrentLanguage();
        const langInfo = this.i18nSystem.supportedLanguages[currentLang];
        
        if (langInfo && this.languageToggle) {
            this.languageToggle.textContent = `🌐 ${langInfo.nativeName}`;
        }
        
        this.updateActiveOption();
    }
    
    /**
     * 更新下拉菜单中的激活选项
     */
    updateActiveOption() {
        if (!this.i18nSystem || !this.languageDropdown) return;
        
        const currentLang = this.i18nSystem.getCurrentLanguage();
        const options = this.languageDropdown.querySelectorAll('.language-option');
        
        options.forEach(option => {
            const langCode = option.getAttribute('data-lang');
            if (langCode === currentLang) {
                option.classList.add('active');
                option.setAttribute('aria-selected', 'true');
            } else {
                option.classList.remove('active');
                option.setAttribute('aria-selected', 'false');
            }
        });
    }
    
    /**
     * 切换语言
     */
    async changeLanguage(langCode) {
        if (!this.i18nSystem || !langCode) return;
        
        try {
            // 显示切换动画
            this.showLanguageChangeAnimation();
            
            // 切换语言
            await this.i18nSystem.changeLanguage(langCode);
            
            // 关闭下拉菜单
            this.closeDropdown();
            
            // 更新显示
            this.updateLanguageDisplay();
            
            // 触发自定义事件
            this.dispatchLanguageChangeEvent(langCode);
            
            console.log(`🌍 语言已切换为: ${langCode}`);
        } catch (error) {
            console.error('❌ 语言切换失败:', error);
            this.showErrorMessage('语言切换失败，请稍后重试');
        }
    }
    
    /**
     * 显示语言切换动画
     */
    showLanguageChangeAnimation() {
        // 为body添加切换动画类
        document.body.classList.add('language-changing');
        
        // 动画完成后移除类
        setTimeout(() => {
            document.body.classList.remove('language-changing');
        }, 500);
    }
    
    /**
     * 触发语言变更自定义事件
     */
    dispatchLanguageChangeEvent(langCode) {
        const event = new CustomEvent('languageIntegrationChanged', {
            detail: { 
                language: langCode,
                timestamp: Date.now()
            },
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 键盘导航处理
     */
    handleKeyboardNavigation(e) {
        const options = Array.from(this.languageDropdown.querySelectorAll('.language-option'));
        const currentIndex = options.findIndex(option => document.activeElement === option);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % options.length;
                options[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                options[prevIndex].focus();
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (currentIndex >= 0) {
                    const langCode = options[currentIndex].getAttribute('data-lang');
                    this.changeLanguage(langCode);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                this.languageToggle.focus();
                break;
        }
    }
    
    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        // 创建临时错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'language-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }
    
    /**
     * 获取当前语言信息
     */
    getCurrentLanguageInfo() {
        if (!this.i18nSystem) return null;
        
        const currentLang = this.i18nSystem.getCurrentLanguage();
        return {
            code: currentLang,
            info: this.i18nSystem.supportedLanguages[currentLang],
            isRTL: ['ar', 'he', 'fa'].includes(currentLang.split('-')[0])
        };
    }
    
    /**
     * 刷新所有可翻译内容
     */
    refreshTranslations() {
        if (this.i18nSystem && this.i18nSystem.updatePageContent) {
            this.i18nSystem.updatePageContent();
        }
    }
    
    /**
     * 销毁控制器
     */
    destroy() {
        if (this.languageToggle) {
            this.languageToggle.removeEventListener('click', this.toggleDropdown);
        }
        
        if (this.languageDropdown) {
            this.languageDropdown.removeEventListener('click', this.changeLanguage);
            this.languageDropdown.removeEventListener('keydown', this.handleKeyboardNavigation);
        }
        
        document.removeEventListener('click', this.closeDropdown);
        document.removeEventListener('languageChanged', this.updateLanguageDisplay);
        
        this.isInitialized = false;
        console.log('🧹 语言集成控制器已销毁');
    }
}

// 创建全局实例，使用DOM就绪检查
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.languageIntegration = new LanguageIntegrationController();
    });
} else {
    window.languageIntegration = new LanguageIntegrationController();
}

// CSS动画样式注入
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .language-changing {
        transition: opacity 0.3s ease;
    }
    
    .language-changing * {
        transition: all 0.3s ease;
    }
    
    .language-error-message {
        animation: slideInRight 0.3s ease;
    }
`;

document.head.appendChild(animationStyles);

// 全局初始化函数，供手动调用
window.initLanguageIntegration = () => {
    if (!window.languageIntegration) {
        window.languageIntegration = new LanguageIntegrationController();
    }
    return window.languageIntegration;
};

console.log('🌍 语言集成控制器已加载');