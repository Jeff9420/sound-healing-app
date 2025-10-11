/**
 * ChartVisualizer - 专业图表可视化工具
 *
 * 功能:
 * - 饼图 (分类占比)
 * - 折线图 (趋势分析)
 * - 柱状图 (对比分析)
 * - 环形图 (进度展示)
 *
 * @class
 * @version 1.0.0
 */

class ChartVisualizer {
    constructor() {
        this.colors = [
            '#FF6B9D', '#C44569', '#FFA07A', '#FFD93D',
            '#6BCB77', '#4D96FF', '#9B59B6', '#E67E22',
            '#1ABC9C', '#E74C3C', '#3498DB', '#F39C12'
        ];
    }

    /**
     * 创建饼图 - 显示分类占比
     */
    createPieChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 计算总数
        const total = data.reduce((sum, item) => sum + item.value, 0);

        if (total === 0) {
            this.drawNoData(ctx, canvas);
            return;
        }

        // 绘制饼图
        let startAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            const color = this.colors[index % this.colors.length];

            // 绘制扇形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // 添加边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制百分比文本
            const percentage = ((item.value / total) * 100).toFixed(1);
            if (percentage > 5) { // 只在占比大于5%时显示文本
                const midAngle = startAngle + sliceAngle / 2;
                const textX = centerX + Math.cos(midAngle) * (radius * 0.65);
                const textY = centerY + Math.sin(midAngle) * (radius * 0.65);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percentage}%`, textX, textY);
            }

            startAngle = endAngle;
        });

        // 绘制图例
        this.drawLegend(ctx, data, canvas.width - 150, 20);
    }

    /**
     * 创建环形图 - 用于显示进度
     */
    createDonutChart(canvasId, percentage, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = Math.min(centerX, centerY) - 20;
        const innerRadius = outerRadius * 0.6;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景圆环
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();

        // 绘制进度圆环
        const endAngle = -Math.PI / 2 + (percentage / 100) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, -Math.PI / 2, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, -Math.PI / 2, true);
        ctx.closePath();

        // 渐变色
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, options.startColor || '#FF6B9D');
        gradient.addColorStop(1, options.endColor || '#C44569');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制百分比文本
        ctx.fillStyle = options.textColor || '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, centerX, centerY);

        // 绘制标签
        if (options.label) {
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(options.label, centerX, centerY + 30);
        }
    }

    /**
     * 创建折线图 - 显示趋势
     */
    createLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const padding = 50;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) {
            this.drawNoData(ctx, canvas);
            return;
        }

        // 找出最大值
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;

        // 绘制网格线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();

            // Y轴标签
            const value = maxValue - (valueRange / 5) * i;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value), padding - 10, y + 4);
        }

        // 绘制折线
        const stepX = chartWidth / (data.length - 1 || 1);

        ctx.beginPath();
        ctx.strokeStyle = options.lineColor || '#6666FF';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        data.forEach((point, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // 绘制渐变填充
        if (options.fill) {
            ctx.lineTo(padding + stepX * (data.length - 1), padding + chartHeight);
            ctx.lineTo(padding, padding + chartHeight);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
            gradient.addColorStop(0, options.fillColor || 'rgba(102, 102, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(102, 102, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // 绘制数据点
        data.forEach((point, index) => {
            const x = padding + stepX * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

            // 外圈
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = options.lineColor || '#6666FF';
            ctx.fill();

            // 内圈
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // X轴标签
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(point.label, x, padding + chartHeight + 20);
        });
    }

    /**
     * 创建柱状图
     */
    createBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        const padding = 50;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) {
            this.drawNoData(ctx, canvas);
            return;
        }

        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = chartWidth / data.length * 0.6;
        const barGap = chartWidth / data.length * 0.4;

        // 绘制Y轴网格线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();

            // Y轴标签
            const value = maxValue - (maxValue / 5) * i;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value), padding - 10, y + 4);
        }

        // 绘制柱状图
        data.forEach((item, index) => {
            const x = padding + (barWidth + barGap) * index + barGap / 2;
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = padding + chartHeight - barHeight;

            // 渐变色柱子
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            const color = this.colors[index % this.colors.length];
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.darkenColor(color, 0.3));

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // 柱子边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);

            // 数值标签
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.value, x + barWidth / 2, y - 8);

            // X轴标签
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';

            // 如果标签太长,旋转显示
            if (item.label.length > 6) {
                ctx.save();
                ctx.translate(x + barWidth / 2, padding + chartHeight + 15);
                ctx.rotate(-Math.PI / 6);
                ctx.fillText(item.label, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(item.label, x + barWidth / 2, padding + chartHeight + 20);
            }
        });
    }

    /**
     * 绘制图例
     */
    drawLegend(ctx, data, x, y) {
        const itemHeight = 25;
        const boxSize = 15;

        data.forEach((item, index) => {
            const currentY = y + index * itemHeight;
            const color = this.colors[index % this.colors.length];

            // 颜色方块
            ctx.fillStyle = color;
            ctx.fillRect(x, currentY, boxSize, boxSize);

            // 文本
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const label = item.label.length > 12 ? item.label.substring(0, 10) + '...' : item.label;
            ctx.fillText(label, x + boxSize + 8, currentY + 1);
        });
    }

    /**
     * 绘制无数据提示
     */
    drawNoData(ctx, canvas) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
    }

    /**
     * 加深颜色
     */
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.max(0, Math.floor(r * (1 - amount)));
        const newG = Math.max(0, Math.floor(g * (1 - amount)));
        const newB = Math.max(0, Math.floor(b * (1 - amount)));

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * 导出图表为图片
     */
    exportChart(canvasId, filename = 'chart.png') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.ChartVisualizer = ChartVisualizer;
    window.chartVisualizer = new ChartVisualizer();
    console.log('✅ ChartVisualizer 已初始化');
}
