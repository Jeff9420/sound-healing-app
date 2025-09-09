class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggle = null;
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.bindElements();
        this.setupEventListeners();
        this.applyTheme();
    }

    bindElements() {
        this.themeToggle = document.getElementById('themeToggle');
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!this.hasUserPreference()) {
                this.currentTheme = e.matches ? 'light' : 'dark';
                this.applyTheme();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
        
        console.log(`主题切换至: ${this.currentTheme}`);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
            }
        }

        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = this.currentTheme === 'dark' ? '#1a1a2e' : '#f8fafc';
        }
    }

    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('sound-healing-theme');
            if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
                this.currentTheme = savedTheme;
                return;
            }
        } catch (error) {
            console.warn('主题设置加载失败:', error);
        }

        this.currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    saveTheme() {
        try {
            localStorage.setItem('sound-healing-theme', this.currentTheme);
        } catch (error) {
            console.warn('主题设置保存失败:', error);
        }
    }

    hasUserPreference() {
        try {
            return localStorage.getItem('sound-healing-theme') !== null;
        } catch {
            return false;
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}