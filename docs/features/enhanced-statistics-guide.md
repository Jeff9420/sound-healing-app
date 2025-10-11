# 📊 增强统计功能指南

## 📋 功能概述

声音疗愈应用的统计系统已全面升级,新增**专业图表可视化**功能,帮助用户直观了解收听习惯和使用数据。

---

## ✨ 新增功能

### 1. **Canvas图表可视化** 🎨

#### 饼图 (Pie Chart)
- **用途**: 显示分类占比
- **数据**: Top 5最常听的分类
- **特性**:
  - 12色调色板,自动配色
  - 百分比标注 (占比>5%时显示)
  - 交互式图例
  - 扇形分割清晰

#### 折线图 (Line Chart)
- **用途**: 趋势分析
- **数据**: 最近7天播放次数
- **特性**:
  - 渐变填充效果
  - 数据点高亮显示
  - 网格线参考
  - Y轴自动缩放

#### 柱状图 (Bar Chart)
- **用途**: 数据对比
- **数据**: 分类播放次数
  - 渐变色柱子
  - 数值标签显示
  - X轴标签自动旋转 (长文本)
  - 悬浮效果

#### 环形图 (Donut Chart)
- **用途**: 进度展示
- **数据**: 成就完成度
- **特性**:
  - 渐变色圆环
  - 百分比中心显示
  - 可自定义颜色和标签

### 2. **原有统计功能** 📈

#### 概览卡片
- 🎵 总播放次数
- ⏰ 累计收听时长
- ⭐ 收藏数量
- 📈 日均播放

#### HTML图表
- 📊 分类条形图
- 📅 7天播放趋势
- 🏆 成就系统

---

## 🎨 图表系统架构

### ChartVisualizer类

**核心方法**:

```javascript
// 1. 创建饼图
chartVisualizer.createPieChart(canvasId, data, options);

// 2. 创建环形图
chartVisualizer.createDonutChart(canvasId, percentage, options);

// 3. 创建折线图
chartVisualizer.createLineChart(canvasId, data, options);

// 4. 创建柱状图
chartVisualizer.createBarChart(canvasId, data, options);

// 5. 导出图表
chartVisualizer.exportChart(canvasId, 'filename.png');
```

### 数据格式

**通用格式**:
```javascript
[
    { label: '分类名', value: 数值 },
    { label: '下一个', value: 数值 },
    // ...
]
```

**示例 - 分类占比**:
```javascript
const categoryData = [
    { label: '冥想音乐', value: 45 },
    { label: '雨声', value: 32 },
    { label: '颂钵音疗', value: 18 },
    { label: '脉轮疗愈', value: 12 },
    { label: '催眠引导', value: 8 }
];
```

---

## 🎯 使用场景

### 场景1: 了解收听偏好
**问题**: 我最喜欢哪类音频?
**解决**: 查看饼图,快速识别Top分类

### 场景2: 追踪使用趋势
**问题**: 最近收听频率如何?
**解决**: 查看折线图,分析7天趋势

### 场景3: 设定收听目标
**问题**: 我听了多少时间?
**解决**: 查看累计时长卡片和成就系统

### 场景4: 数据导出分享
**问题**: 想保存统计图表
**解决**: 使用exportChart()导出PNG

---

## 🔧 技术实现

### Canvas绘图流程

#### 1. 饼图绘制
```javascript
// 计算总数
const total = data.reduce((sum, item) => sum + item.value, 0);

// 绘制扇形
let startAngle = -Math.PI / 2;
data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();

    startAngle = endAngle;
});
```

#### 2. 折线图绘制
```javascript
// 找出最大值,确定Y轴范围
const maxValue = Math.max(...data.map(d => d.value));

// 绘制折线
ctx.beginPath();
data.forEach((point, index) => {
    const x = padding + stepX * index;
    const y = padding + chartHeight - (point.value / maxValue) * chartHeight;

    if (index === 0) {
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
    }
});
ctx.stroke();
```

### 颜色方案

**调色板** (12色):
```javascript
colors = [
    '#FF6B9D', '#C44569', '#FFA07A', '#FFD93D',
    '#6BCB77', '#4D96FF', '#9B59B6', '#E67E22',
    '#1ABC9C', '#E74C3C', '#3498DB', '#F39C12'
];
```

**自动配色**: 使用 `index % colors.length` 循环分配

**颜色加深**:
```javascript
darkenColor(color, amount) {
    // RGB值乘以 (1 - amount)
    // 例: darkenColor('#FF6B9D', 0.3) → 更深的粉色
}
```

### 响应式设计

**Canvas尺寸**:
```javascript
// 饼图: 300x300
<canvas id="categoryPieChart" width="300" height="300"></canvas>

// 折线图: 400x300
<canvas id="trendLineChart" width="400" height="300"></canvas>
```

**CSS适配**:
```css
.chart-container canvas {
    width: 100%;      /* 响应式宽度 */
    height: auto;     /* 保持比例 */
    max-width: 100%;  /* 防止溢出 */
}
```

---

## 📱 移动端优化

### 网格布局
```css
.visual-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
}
```

### 触摸友好
- 图表容器最小宽度: 300px
- 间距充足: 25px gap
- 自适应单列/双列布局

### 性能优化
- **懒渲染**: 仅在打开统计面板时绘制
- **清空画布**: 每次绘制前clearRect
- **防抖动**: 避免频繁重绘

---

## 🌐 主题支持

### 深色主题 (默认)
```css
.chart-container {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-container h4 {
    color: rgba(255, 255, 255, 0.9);
}
```

### 浅色主题
```css
[data-theme="light"] .chart-container {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .chart-container h4 {
    color: #2d3436;
}
```

---

## 🧪 测试指南

### 功能测试

**测试1: 图表渲染**
1. 打开统计面板 (📊 按钮)
2. 验证饼图显示分类占比
3. 验证折线图显示7天趋势
4. 检查图例和标签正确性

**测试2: 无数据处理**
1. 清空localStorage
2. 打开统计面板
3. 验证显示"暂无数据"提示

**测试3: 主题切换**
1. 切换到浅色主题
2. 打开统计面板
3. 验证图表颜色适配浅色背景

**测试4: 导出功能**
```javascript
// 在控制台执行
chartVisualizer.exportChart('categoryPieChart', 'my-stats.png');
```
验证下载PNG文件

### 数据准确性测试

**步骤**:
1. 播放3首"冥想音乐"
2. 播放2首"雨声"
3. 播放1首"颂钵音疗"
4. 打开统计面板
5. 验证:
   - 总播放次数 = 6
   - 饼图: 冥想50%, 雨声33%, 颂钵17%
   - 折线图今日 = 6

### 性能测试

**指标**:
- 图表绘制时间: < 50ms
- 面板打开延迟: < 100ms
- 内存占用: ~200KB

**测试方法**:
```javascript
console.time('chartRender');
window.statsDashboard.render();
console.timeEnd('chartRender');
```

---

## 📊 数据统计

### 支持的指标

#### 基础指标
- ✅ 总播放次数
- ✅ 累计收听时长 (小时)
- ✅ 收藏数量
- ✅ 日均播放次数

#### 分类统计
- ✅ 每个分类的播放次数
- ✅ 每个分类的收听时长
- ✅ Top 5热门分类

#### 趋势分析
- ✅ 最近7天播放次数
- ✅ 首次播放日期
- ✅ 连续收听天数

#### 成就系统
- 🎵 初次体验: 播放第1首
- 🎧 音乐爱好者: 累计10次
- 🌟 疗愈达人: 累计50次
- 👑 声音大师: 累计100次
- ⏰ 入门疗愈: 1小时
- ⭐ 疗愈爱好者: 10小时
- 🏆 疗愈专家: 50小时
- 🔥 7天坚持: 连续7天
- 💝 收藏家: 收藏10个
- 🗺️ 探索者: 听完所有分类

---

## 🚀 未来扩展

### 计划功能

1. **更多图表类型** 🎯
   - 雷达图 (多维度分析)
   - 热力图 (时间分布)
   - 气泡图 (分类对比)
   - 树状图 (层级关系)

2. **高级分析** 📈
   - 收听时间段分析 (早中晚分布)
   - 季节性趋势分析
   - 周末vs工作日对比
   - 音频时长偏好

3. **个性化报告** 📄
   - 周报/月报自动生成
   - PDF导出完整报告
   - 邮件定期发送统计

4. **社交分享** 🌐
   - 分享统计图表到社交媒体
   - 生成精美分享卡片
   - 好友对比功能

5. **AI洞察** 🤖
   - 基于数据的智能推荐
   - 收听习惯分析报告
   - 个性化疗愈建议

---

## 🐛 常见问题

### Q1: 图表不显示?
**A**: 检查以下项:
1. ChartVisualizer是否加载
2. Canvas元素ID是否正确
3. 是否有统计数据

**诊断**:
```javascript
console.log('ChartVisualizer:', window.chartVisualizer);
console.log('Canvas:', document.getElementById('categoryPieChart'));
console.log('Stats:', window.userDataManager.getStatistics());
```

### Q2: 图表模糊?
**A**: Canvas分辨率问题

**解决**:
```javascript
// 设置高分辨率
const dpr = window.devicePixelRatio || 1;
canvas.width = 300 * dpr;
canvas.height = 300 * dpr;
ctx.scale(dpr, dpr);
```

### Q3: 导出图表失败?
**A**: 检查浏览器权限和Canvas污染

**解决**:
```javascript
// 确保crossOrigin设置正确
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = audioUrl;
```

### Q4: 图例文本被截断?
**A**: Canvas区域不足

**解决**:
```javascript
// 增加Canvas宽度或缩短标签
const label = item.label.length > 12
    ? item.label.substring(0, 10) + '...'
    : item.label;
```

---

## 📝 开发者API

### 创建自定义图表

```javascript
// 1. 准备数据
const myData = [
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 20 }
];

// 2. 创建Canvas
const canvas = document.createElement('canvas');
canvas.id = 'myChart';
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);

// 3. 绘制图表
chartVisualizer.createBarChart('myChart', myData, {
    title: '我的统计',
    colors: ['#FF6B9D', '#4D96FF', '#6BCB77']
});
```

### 扩展ChartVisualizer

```javascript
// 添加新图表类型
ChartVisualizer.prototype.createRadarChart = function(canvasId, data, options) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // 自定义绘图逻辑
    // ...
};
```

### 监听图表事件

```javascript
// 图表渲染完成事件
window.addEventListener('chartRendered', (e) => {
    console.log('图表已渲染:', e.detail);
});

// 在ChartVisualizer中触发
createPieChart(canvasId, data) {
    // ... 绘图逻辑

    window.dispatchEvent(new CustomEvent('chartRendered', {
        detail: { type: 'pie', canvasId, dataCount: data.length }
    }));
}
```

---

## ✅ 总结

### 核心优势
1. ✅ **可视化直观** - 饼图/折线图/柱状图/环形图
2. ✅ **性能优异** - Canvas高效绘制,<50ms渲染
3. ✅ **主题适配** - 深色/浅色主题完美支持
4. ✅ **响应式设计** - 桌面/移动端自适应
5. ✅ **导出功能** - PNG图片导出

### 用户价值
- 📊 清晰了解收听习惯
- 📈 追踪使用趋势变化
- 🎯 设定个人收听目标
- 🏆 解锁成就获得激励
- 💾 导出分享统计成果

### 技术亮点
- 纯JavaScript Canvas绘图,无第三方库依赖
- 12色自动配色系统
- 智能标签布局和文本截断
- 渐变色填充和边框效果
- 主题感知的配色方案

---

**作者**: Sound Healing Team
**版本**: 2.0.0
**最后更新**: 2025-10-11
**文件**: chart-visualizer.js, stats-dashboard.js
