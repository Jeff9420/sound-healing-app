# SaaS组件国际化集成指南

本文档说明如何将新创建的SaaS组件翻译集成到现有的i18n系统中。

## 📁 相关文件

### 新创建的文件
- `assets/js/i18n-saas-extensions.js` - SaaS组件翻译数据（5种语言）
- `assets/js/i18n-saas-integrator.js` - 翻译集成器脚本

### 现有文件
- `assets/js/i18n-system.js` - 主国际化系统
- `assets/js/i18n-translations-addon.js` - 认证界面翻译扩展

## 🚀 快速开始

### 1. 在HTML中按顺序加载脚本

在您的主HTML文件（如`index.html`或`saas-landing.html`）的`<head>`或`<body>`底部添加：

```html
<!-- i18n系统（主系统） -->
<script src="assets/js/i18n-system.js"></script>

<!-- 认证翻译扩展（如果需要） -->
<script src="assets/js/i18n-translations-addon.js"></script>

<!-- SaaS组件翻译扩展 -->
<script src="assets/js/i18n-saas-extensions.js"></script>

<!-- SaaS翻译集成器 -->
<script src="assets/js/i18n-saas-integrator.js"></script>
```

**重要**：加载顺序必须严格遵守，集成器依赖于前面的脚本。

### 2. 自动集成

集成器会自动：
1. 等待`i18n-system.js`和`i18n-saas-extensions.js`加载完成
2. 将SaaS翻译数据合并到主i18n系统中
3. 刷新页面UI翻译
4. 触发`saasTranslationsReady`事件

### 3. 监听集成完成事件（可选）

如果您需要在翻译集成完成后执行某些操作：

```javascript
document.addEventListener('saasTranslationsReady', function(event) {
    console.log('SaaS翻译已就绪！', event.detail);
    // event.detail包含：
    // - timestamp: 集成完成时间戳
    // - languagesIntegrated: 已集成的语言数组

    // 您的自定义逻辑
    initializeSaasSections();
});
```

## 📦 翻译覆盖范围

SaaS扩展翻译涵盖以下组件：

### 1. Benefits Section (好处区域)
- 4个核心优势卡片
- CTA按钮

### 2. Features Section (功能区域)
- 6大功能特性（Sleep Timer、Video Backgrounds、Mixer、History、Focus、PWA）
- 功能演示文本
- 统计数据

### 3. How It Works Section (使用流程)
- 3步使用指南
- Pro tips提示
- 演示区域文本

### 4. Social Proof Section (用户证言)
- 6条用户评价
- 统计数据
- 信任徽章

### 5. Pricing Section (价格方案)
- 3个定价层级（Free、Support、Enterprise）
- 功能对比表
- FAQ引导

### 6. FAQ Section (常见问题)
- 12个问题分4大类
- 详细答案
- 支持CTA

### 7. Footer (页脚)
- 品牌信息
- 4列导航链接
- Newsletter订阅表单
- 社交媒体链接
- 法律链接

## 🌍 支持的语言

### 完整翻译
- **English (en-US)** - 100%完成
- **中文 (zh-CN)** - 100%完成

### 部分翻译（主要标题和眉标）
- **日本語 (ja-JP)** - 约30%完成
- **한국어 (ko-KR)** - 约30%完成
- **Español (es-ES)** - 约30%完成

> **注意**：日语、韩语和西班牙语的完整翻译将在后续版本中补充。

## 🔧 手动集成（可选）

如果自动集成不工作，您可以手动触发：

```javascript
// 在浏览器控制台或脚本中执行
window.reloadSaasTranslations();
```

这将重新合并翻译数据并刷新UI。

## 📝 添加新翻译键值

### 方法1：扩展`i18n-saas-extensions.js`

在`SAAS_TRANSLATIONS`对象中添加新键值：

```javascript
const SAAS_TRANSLATIONS = {
    'en-US': {
        // 现有翻译...
        'newSection.title': 'New Section Title',
        'newSection.description': 'Description text',
    },
    'zh-CN': {
        // 现有翻译...
        'newSection.title': '新区域标题',
        'newSection.description': '描述文本',
    },
    // 其他语言...
};
```

### 方法2：运行时动态添加

```javascript
// 等待集成完成
document.addEventListener('saasTranslationsReady', function() {
    const i18n = window.i18n;

    // 为英语添加翻译
    let enTranslations = i18n.translations.get('en-US');
    enTranslations['dynamic.key'] = 'Dynamic Value';

    // 为中文添加翻译
    let zhTranslations = i18n.translations.get('zh-CN');
    zhTranslations['dynamic.key'] = '动态值';

    // 刷新UI
    i18n.translatePage();
});
```

## 🎯 HTML使用示例

在新创建的SaaS组件中，所有需要翻译的文本都使用`data-i18n`属性：

```html
<!-- 简单文本翻译 -->
<h2 data-i18n="benefits.title">
    Designed for Better Sleep, Focus & Wellness
</h2>

<!-- 包含HTML的翻译（使用innerHTML） -->
<p data-i18n="features.timer.point1">
    <strong>60-min default</strong> — optimal for most sleep cycles
</p>

<!-- placeholder翻译 -->
<input
    type="email"
    placeholder="your@email.com"
    data-i18n-placeholder="footer.newsletter.placeholder"
/>

<!-- aria-label翻译 -->
<button
    aria-label="Subscribe"
    data-i18n-aria-label="footer.newsletter.button"
>
    Subscribe
</button>
```

## 🐛 调试

### 检查翻译是否加载

```javascript
// 检查i18n系统
console.log('i18n系统:', window.i18n);

// 检查SaaS翻译数据
console.log('SaaS翻译:', window.SAAS_TRANSLATIONS);

// 检查某个语言的翻译
console.log('英语翻译:', window.i18n.translations.get('en-US'));
console.log('中文翻译:', window.i18n.translations.get('zh-CN'));

// 检查特定键值
console.log('Benefits标题:', window.i18n.translate('benefits.title'));
```

### 常见问题

#### 1. 翻译没有显示

**可能原因**：
- 脚本加载顺序错误
- `data-i18n`属性拼写错误
- 翻译键值不存在

**解决方法**：
```javascript
// 检查控制台是否有错误
// 手动重新加载翻译
window.reloadSaasTranslations();
```

#### 2. 部分文本未翻译

**可能原因**：
- 当前语言缺少该翻译键值
- 回退到英语默认值

**解决方法**：
- 在`i18n-saas-extensions.js`中为该语言添加缺失的翻译

#### 3. 语言切换不生效

**可能原因**：
- 语言选择器未正确触发`i18n.changeLanguage()`

**解决方法**：
```javascript
// 在语言选择器change事件中
document.getElementById('language-select').addEventListener('change', function(e) {
    const newLang = e.target.value;
    window.i18n.changeLanguage(newLang);
});
```

## 🔄 更新工作流

### 添加新SaaS组件时

1. **在HTML中添加`data-i18n`属性**
   ```html
   <h3 data-i18n="newComponent.title">New Component Title</h3>
   ```

2. **在`i18n-saas-extensions.js`中添加翻译**
   ```javascript
   'en-US': {
       'newComponent.title': 'New Component Title',
   },
   'zh-CN': {
       'newComponent.title': '新组件标题',
   },
   ```

3. **测试翻译**
   - 打开浏览器控制台
   - 切换语言检查翻译是否正确
   - 使用`window.i18n.translate('newComponent.title')`验证

4. **提交代码**
   ```bash
   git add assets/js/i18n-saas-extensions.js components/new-component.html
   git commit -m "feat: 添加新组件及翻译"
   git push
   ```

## 📊 翻译完成度

| 语言 | 完成度 | 翻译键值数 | 状态 |
|------|--------|-----------|------|
| English (en-US) | 100% | ~300+ | ✅ 完成 |
| 中文 (zh-CN) | 100% | ~300+ | ✅ 完成 |
| 日本語 (ja-JP) | 30% | ~100+ | 🚧 进行中 |
| 한국어 (ko-KR) | 30% | ~100+ | 🚧 进行中 |
| Español (es-ES) | 30% | ~100+ | 🚧 进行中 |

## 🎯 下一步

1. **完善日语/韩语/西班牙语翻译** - 补充完整的翻译键值
2. **创建翻译测试页面** - 方便检查所有翻译是否正确
3. **添加翻译覆盖率工具** - 自动检测缺失的翻译键值
4. **建立翻译贡献流程** - 允许社区贡献翻译

## 📞 支持

如有问题或需要帮助，请：
- 查看浏览器控制台错误信息
- 检查GitHub Issues
- 联系技术支持

---

**最后更新**: 2025-01-13
**版本**: 1.0.0
**作者**: Claude Code
