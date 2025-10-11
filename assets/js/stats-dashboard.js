/**
 * StatsDashboard - 用户统计仪表板
 *
 * 功能:
 * - 收听时长统计
 * - 最常听的分类
 * - 收听习惯分析
 * - 数据可视化
 * - 成就系统
 *
 * @class
 * @version 1.0.0
 */

class StatsDashboard {
    constructor(userDataManager) {
        this.userDataManager = userDataManager;
        this.modal = null;

        // 成就定义
        this.achievements = {
            'first_play': { name: '初次体验', desc: '播放第一首音频', icon: '🎵' },
            'play_10': { name: '音乐爱好者', desc: '累计播放10次', icon: '🎧' },
            'play_50': { name: '疗愈达人', desc: '累计播放50次', icon: '🌟' },
            'play_100': { name: '声音大师', desc: '累计播放100次', icon: '👑' },
            'hour_1': { name: '入门疗愈', desc: '累计收听1小时', icon: '⏰' },
            'hour_10': { name: '疗愈爱好者', desc: '累计收听10小时', icon: '⭐' },
            'hour_50': { name: '疗愈专家', desc: '累计收听50小时', icon: '🏆' },
            'daily_streak_7': { name: '7天坚持', desc: '连续7天收听', icon: '🔥' },
            'favorite_10': { name: '收藏家', desc: '收藏10个音频', icon: '💝' },
            'explorer': { name: '探索者', desc: '收听所有分类', icon: '🗺️' }
        };
    }

    /**
     * 打开统计面板
     */
    open() {
        if (!this.modal) {
            this.createModal();
        }

        this.modal.style.display = 'flex';
        setTimeout(() => this.modal.classList.add('active'), 10);
        this.render();
    }

    /**
     * 关闭统计面板
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('active');
            setTimeout(() => {
                this.modal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 创建模态框
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'statsDashboard';
        this.modal.className = 'stats-modal';
        this.modal.innerHTML = `
            <div class="stats-content">
                <div class="stats-header">
                    <h2>📊 <span data-i18n="stats.title">收听统计</span></h2>
                    <button class="stats-close" onclick="window.statsDashboard.close()">×</button>
                </div>

                <div class="stats-body" id="statsBody">
                    <!-- 内容将动态生成 -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // 点击背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    /**
     * 渲染统计数据
     */
    render() {
        const container = document.getElementById('statsBody');
        if (!container) {
            return;
        }

        const stats = this.userDataManager.getStatistics();
        const history = this.userDataManager.getHistory();
        const favorites = this.userDataManager.getFavorites();

        container.innerHTML = `
            ${this.renderOverview(stats, history, favorites)}
            ${this.renderVisualCharts(stats, history)}
            ${this.renderCategoryChart(stats)}
            ${this.renderTimeChart(history)}
            ${this.renderAchievements(stats)}
        `;

        // 渲染Canvas图表 - 使用requestAnimationFrame确保DOM已渲染
        requestAnimationFrame(() => {
            this.renderCanvasCharts(stats, history);
        });
    }

    /**
     * 渲染概览
     */
    renderOverview(stats, history, favorites) {
        const totalHours = (stats.totalPlayTime / 3600).toFixed(1);
        const avgPerDay = history.length > 0 ? (stats.totalPlays / this.getDaysSinceFirstPlay(history)).toFixed(1) : 0;

        return `
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">🎵</div>
                    <div class="stat-value">${stats.totalPlays}</div>
                    <div class="stat-label" data-i18n="stats.totalPlays">总播放次数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-value">${totalHours}h</div>
                    <div class="stat-label" data-i18n="stats.totalTime">累计收听时长</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${favorites.length}</div>
                    <div class="stat-label" data-i18n="stats.favorites">收藏数量</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">${avgPerDay}</div>
                    <div class="stat-label" data-i18n="stats.avgPerDay">日均播放</div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染分类图表
     */
    renderCategoryChart(stats) {
        const categories = Object.entries(stats.categoryStats || {})
            .sort((a, b) => b[1].plays - a[1].plays)
            .slice(0, 5);

        if (categories.length === 0) {
            return '<div class="stats-section"><p class="stats-empty">暂无分类数据</p></div>';
        }

        const maxPlays = Math.max(...categories.map(c => c[1].plays));

        const barsHtml = categories.map(([category, data]) => {
            const percentage = (data.plays / maxPlays * 100).toFixed(1);
            const hours = (data.playTime / 3600).toFixed(1);

            return `
                <div class="chart-bar-item">
                    <div class="chart-label">${category}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${percentage}%">
                            <span class="chart-value">${data.plays}次 (${hours}h)</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="stats-section">
                <h3>📊 <span data-i18n="stats.topCategories">最常听的分类</span></h3>
                <div class="chart-bars">
                    ${barsHtml}
                </div>
            </div>
        `;
    }

    /**
     * 渲染时间图表
     */
    renderTimeChart(history) {
        if (history.length === 0) {
            return '';
        }

        // 按日期统计
        const dailyStats = this.getDailyStats(history);
        const last7Days = Object.entries(dailyStats).slice(-7);

        if (last7Days.length === 0) {
            return '';
        }

        const maxCount = Math.max(...last7Days.map(d => d[1]));

        const barsHtml = last7Days.map(([date, count]) => {
            const height = maxCount > 0 ? (count / maxCount * 100) : 0;
            const dateStr = this.formatDate(date);

            return `
                <div class="time-bar">
                    <div class="time-bar-fill" style="height: ${height}%">
                        <span class="time-bar-value">${count}</span>
                    </div>
                    <div class="time-bar-label">${dateStr}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="stats-section">
                <h3>📅 <span data-i18n="stats.last7Days">最近7天</span></h3>
                <div class="time-chart">
                    ${barsHtml}
                </div>
            </div>
        `;
    }

    /**
     * 渲染成就
     */
    renderAchievements(stats) {
        const unlockedAchievements = this.getUnlockedAchievements(stats);

        const achievementsHtml = Object.entries(this.achievements).map(([key, achievement]) => {
            const unlocked = unlockedAchievements.includes(key);
            const className = unlocked ? 'achievement unlocked' : 'achievement locked';

            return `
                <div class="${className}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.desc}</div>
                    </div>
                    ${unlocked ? '<div class="achievement-badge">✓</div>' : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="stats-section">
                <h3>🏆 <span data-i18n="stats.achievements">成就系统</span> (${unlockedAchievements.length}/${Object.keys(this.achievements).length})</h3>
                <div class="achievements-grid">
                    ${achievementsHtml}
                </div>
            </div>
        `;
    }

    /**
     * 获取已解锁的成就
     */
    getUnlockedAchievements(stats) {
        const unlocked = [];
        const totalPlays = stats.totalPlays || 0;
        const totalHours = (stats.totalPlayTime || 0) / 3600;
        const favorites = this.userDataManager.getFavorites().length;
        const categoriesUsed = Object.keys(stats.categoryStats || {}).length;
        const totalCategories = typeof AUDIO_CONFIG !== 'undefined'
            ? Object.keys(AUDIO_CONFIG.categories).length
            : 9;

        // 播放次数成就
        if (totalPlays >= 1) {
            unlocked.push('first_play');
        }
        if (totalPlays >= 10) {
            unlocked.push('play_10');
        }
        if (totalPlays >= 50) {
            unlocked.push('play_50');
        }
        if (totalPlays >= 100) {
            unlocked.push('play_100');
        }

        // 收听时长成就
        if (totalHours >= 1) {
            unlocked.push('hour_1');
        }
        if (totalHours >= 10) {
            unlocked.push('hour_10');
        }
        if (totalHours >= 50) {
            unlocked.push('hour_50');
        }

        // 收藏成就
        if (favorites >= 10) {
            unlocked.push('favorite_10');
        }

        // 探索成就
        if (categoriesUsed >= totalCategories) {
            unlocked.push('explorer');
        }

        // 连续收听成就（简化版）
        const history = this.userDataManager.getHistory();
        if (this.hasStreakOfDays(history, 7)) {
            unlocked.push('daily_streak_7');
        }

        return unlocked;
    }

    /**
     * 检查连续天数
     */
    hasStreakOfDays(history, days) {
        if (history.length < days) {
            return false;
        }

        const dates = new Set();
        history.forEach(item => {
            const date = new Date(item.playedAt).toDateString();
            dates.add(date);
        });

        return dates.size >= days;
    }

    /**
     * 获取每日统计
     */
    getDailyStats(history) {
        const stats = {};

        history.forEach(item => {
            const date = new Date(item.playedAt).toISOString().split('T')[0];
            stats[date] = (stats[date] || 0) + 1;
        });

        return stats;
    }

    /**
     * 获取首次播放以来的天数
     */
    getDaysSinceFirstPlay(history) {
        if (history.length === 0) {
            return 1;
        }

        const firstPlay = new Date(history[history.length - 1].playedAt);
        const now = new Date();
        const diffTime = Math.abs(now - firstPlay);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(diffDays, 1);
    }

    /**
     * 格式化日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    /**
     * 渲染可视化图表区域
     */
    renderVisualCharts(stats, history) {
        return `
            <div class="stats-section">
                <h3>📈 <span data-i18n="stats.visualAnalysis">可视化分析</span></h3>
                <div class="visual-charts-grid">
                    <div class="chart-container">
                        <h4>分类占比</h4>
                        <canvas id="categoryPieChart" width="300" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>趋势分析</h4>
                        <canvas id="trendLineChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染Canvas图表
     */
    renderCanvasCharts(stats, history) {
        if (!window.chartVisualizer) {
            console.warn('ChartVisualizer not loaded');
            return;
        }

        // 1. 分类占比饼图
        const categoryData = Object.entries(stats.categoryStats || {})
            .sort((a, b) => b[1].plays - a[1].plays)
            .slice(0, 5)
            .map(([category, data]) => ({
                label: category,
                value: data.plays
            }));

        if (categoryData.length > 0) {
            window.chartVisualizer.createPieChart('categoryPieChart', categoryData);
        }

        // 2. 趋势折线图
        const dailyStats = this.getDailyStats(history);
        const last7Days = Object.entries(dailyStats).slice(-7);

        if (last7Days.length > 0) {
            const trendData = last7Days.map(([date, count]) => ({
                label: this.formatDate(date),
                value: count
            }));

            window.chartVisualizer.createLineChart('trendLineChart', trendData, {
                lineColor: '#6666FF',
                fill: true,
                fillColor: 'rgba(102, 102, 255, 0.3)'
            });
        }
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.StatsDashboard = StatsDashboard;

    // 等待userDataManager加载后初始化
    if (window.userDataManager) {
        window.statsDashboard = new StatsDashboard(window.userDataManager);
        console.log('✅ StatsDashboard 已创建');
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (window.userDataManager) {
                window.statsDashboard = new StatsDashboard(window.userDataManager);
                console.log('✅ StatsDashboard 已创建');
            }
        });
    }
}
