# 📋 多语言功能实施计划 - 明天任务清单

**创建时间**: 2025-10-18
**优先级**: 高
**预计时间**: 2-3 小时

---

## ✅ 今天已完成

1. **修改默认语言为英语**
   - 文件: `assets/js/i18n-system.js`
   - 第 58-59 行
   - 默认语言: `en-US`
   - 后备语言: `en-US`

---

## 📝 明天待办任务

### 任务 1: 为表单添加 data-i18n 属性

#### 1.1 资源订阅表单（顶部）

**位置**: `index.html` 约 250-270 行

需要添加 i18n 的元素：
```html
<!-- 当前代码 -->
<input type="email" name="email" placeholder="your@email.com" required>
<button type="submit">Subscribe</button>

<!-- 修改为 -->
<input type="email" name="email" data-i18n-placeholder="form.subscribe.email.placeholder" placeholder="your@email.com" required>
<button type="submit" data-i18n="form.subscribe.button">Subscribe</button>
```

#### 1.2 7日冥想计划表单

**位置**: `index.html` 约 390-428 行

需要添加 i18n 的元素：
```html
<!-- 标题 -->
<h3 data-i18n="form.plan.title">领取你的 7 日定制冥想计划</h3>

<!-- 描述 -->
<p data-i18n="form.plan.description">告诉我们你当前的状态...</p>

<!-- 表单字段 -->
<label for="planName" data-i18n="form.plan.name.label">你的昵称</label>
<input id="planName" name="name" data-i18n-placeholder="form.plan.name.placeholder" placeholder="如：小觉" required>

<label for="planEmail" data-i18n="form.plan.email.label">联系邮箱</label>
<input id="planEmail" name="email" data-i18n-placeholder="form.plan.email.placeholder" placeholder="your@email.com" required>

<label for="planGoal" data-i18n="form.plan.goal.label">当前最想改善的目标</label>
<select id="planGoal" name="goal" required>
    <option value="" data-i18n="form.plan.goal.placeholder">请选择</option>
    <option value="sleep" data-i18n="form.plan.goal.sleep">提升睡眠质量</option>
    <option value="focus" data-i18n="form.plan.goal.focus">提升专注效率</option>
    <option value="stress" data-i18n="form.plan.goal.stress">缓解焦虑与压力</option>
    <option value="mindfulness" data-i18n="form.plan.goal.mindfulness">建立规律冥想习惯</option>
</select>

<label for="planTime" data-i18n="form.plan.time.label">每日可投入的时长</label>
<select id="planTime" name="time" required>
    <option value="" data-i18n="form.plan.time.placeholder">请选择</option>
    <option value="5-10" data-i18n="form.plan.time.5-10">5-10 分钟</option>
    <option value="10-20" data-i18n="form.plan.time.10-20">10-20 分钟</option>
    <option value="20-30" data-i18n="form.plan.time.20-30">20-30 分钟</option>
    <option value="30+" data-i18n="form.plan.time.30+">30 分钟以上</option>
</select>

<button type="submit" data-i18n="form.plan.submit">领取定制计划</button>

<!-- 成功消息 -->
<div class="conversion-offer__success" data-i18n="form.plan.success">✅ 计划申请成功！...</div>
```

---

### 任务 2: 在 i18n-system.js 添加翻译

**位置**: `assets/js/i18n-system.js` 约 189-1069 行

需要在每个语言的翻译对象中添加：

#### 中文翻译 (zh-CN)
```javascript
// 表单 - 资源订阅
'form.subscribe.email.placeholder': 'your@email.com',
'form.subscribe.button': '订阅',

// 表单 - 7日冥想计划
'form.plan.title': '领取你的 7 日定制冥想计划',
'form.plan.description': '告诉我们你当前的状态，我们会组合合适的声景、冥想练习与睡眠建议，发送一份结构化的 7 日音疗安排。',
'form.plan.name.label': '你的昵称',
'form.plan.name.placeholder': '如：小觉',
'form.plan.email.label': '联系邮箱',
'form.plan.email.placeholder': 'your@email.com',
'form.plan.goal.label': '当前最想改善的目标',
'form.plan.goal.placeholder': '请选择',
'form.plan.goal.sleep': '提升睡眠质量',
'form.plan.goal.focus': '提升专注效率',
'form.plan.goal.stress': '缓解焦虑与压力',
'form.plan.goal.mindfulness': '建立规律冥想习惯',
'form.plan.time.label': '每日可投入的时长',
'form.plan.time.placeholder': '请选择',
'form.plan.time.5-10': '5-10 分钟',
'form.plan.time.10-20': '10-20 分钟',
'form.plan.time.20-30': '20-30 分钟',
'form.plan.time.30+': '30 分钟以上',
'form.plan.submit': '领取定制计划',
'form.plan.success': '✅ 计划申请成功！我们会在 5 分钟内将定制冥想安排发送至你的邮箱，请注意查收。',
```

#### 英文翻译 (en-US)
```javascript
// Form - Subscribe
'form.subscribe.email.placeholder': 'your@email.com',
'form.subscribe.button': 'Subscribe',

// Form - 7-Day Meditation Plan
'form.plan.title': 'Get Your 7-Day Custom Meditation Plan',
'form.plan.description': 'Tell us about your current state, and we\'ll combine suitable soundscapes, meditation practices, and sleep suggestions to send you a structured 7-day sound therapy plan.',
'form.plan.name.label': 'Your Nickname',
'form.plan.name.placeholder': 'e.g., Alex',
'form.plan.email.label': 'Contact Email',
'form.plan.email.placeholder': 'your@email.com',
'form.plan.goal.label': 'Your Primary Goal',
'form.plan.goal.placeholder': 'Please select',
'form.plan.goal.sleep': 'Improve Sleep Quality',
'form.plan.goal.focus': 'Enhance Focus & Productivity',
'form.plan.goal.stress': 'Reduce Anxiety & Stress',
'form.plan.goal.mindfulness': 'Build Regular Meditation Habit',
'form.plan.time.label': 'Daily Time Commitment',
'form.plan.time.placeholder': 'Please select',
'form.plan.time.5-10': '5-10 minutes',
'form.plan.time.10-20': '10-20 minutes',
'form.plan.time.20-30': '20-30 minutes',
'form.plan.time.30+': '30+ minutes',
'form.plan.submit': 'Get Custom Plan',
'form.plan.success': '✅ Application successful! We\'ll send your custom meditation plan to your email within 5 minutes.',
```

#### 日文翻译 (ja-JP)
```javascript
// フォーム - 購読
'form.subscribe.email.placeholder': 'your@email.com',
'form.subscribe.button': '購読',

// フォーム - 7日間瞑想プラン
'form.plan.title': '7日間カスタム瞑想プランを受け取る',
'form.plan.description': '現在の状態を教えてください。適切なサウンドスケープ、瞑想練習、睡眠アドバイスを組み合わせた7日間のサウンドセラピープランをお送りします。',
'form.plan.name.label': 'ニックネーム',
'form.plan.name.placeholder': '例：太郎',
'form.plan.email.label': '連絡先メール',
'form.plan.email.placeholder': 'your@email.com',
'form.plan.goal.label': '主な目標',
'form.plan.goal.placeholder': '選択してください',
'form.plan.goal.sleep': '睡眠の質を向上',
'form.plan.goal.focus': '集中力と生産性を向上',
'form.plan.goal.stress': '不安とストレスを軽減',
'form.plan.goal.mindfulness': '定期的な瞑想習慣を確立',
'form.plan.time.label': '毎日の時間投資',
'form.plan.time.placeholder': '選択してください',
'form.plan.time.5-10': '5-10分',
'form.plan.time.10-20': '10-20分',
'form.plan.time.20-30': '20-30分',
'form.plan.time.30+': '30分以上',
'form.plan.submit': 'カスタムプランを取得',
'form.plan.success': '✅ 申請が成功しました！5分以内にカスタム瞑想プランをメールでお送りします。',
```

#### 韩文翻译 (ko-KR)
```javascript
// 양식 - 구독
'form.subscribe.email.placeholder': 'your@email.com',
'form.subscribe.button': '구독',

// 양식 - 7일 명상 계획
'form.plan.title': '7일 맞춤 명상 계획 받기',
'form.plan.description': '현재 상태를 알려주시면 적절한 사운드스케이프, 명상 연습 및 수면 제안을 결합한 7일간의 구조화된 사운드 테라피 계획을 보내드립니다.',
'form.plan.name.label': '닉네임',
'form.plan.name.placeholder': '예: 민수',
'form.plan.email.label': '연락처 이메일',
'form.plan.email.placeholder': 'your@email.com',
'form.plan.goal.label': '주요 목표',
'form.plan.goal.placeholder': '선택해주세요',
'form.plan.goal.sleep': '수면 질 향상',
'form.plan.goal.focus': '집중력 및 생산성 향상',
'form.plan.goal.stress': '불안과 스트레스 감소',
'form.plan.goal.mindfulness': '규칙적인 명상 습관 형성',
'form.plan.time.label': '일일 시간 투자',
'form.plan.time.placeholder': '선택해주세요',
'form.plan.time.5-10': '5-10분',
'form.plan.time.10-20': '10-20분',
'form.plan.time.20-30': '20-30분',
'form.plan.time.30+': '30분 이상',
'form.plan.submit': '맞춤 계획 받기',
'form.plan.success': '✅ 신청이 완료되었습니다! 5분 이내에 맞춤 명상 계획을 이메일로 보내드리겠습니다.',
```

#### 西班牙语翻译 (es-ES)
```javascript
// Formulario - Suscribir
'form.subscribe.email.placeholder': 'your@email.com',
'form.subscribe.button': 'Suscribirse',

// Formulario - Plan de Meditación de 7 Días
'form.plan.title': 'Obtén Tu Plan de Meditación Personalizado de 7 Días',
'form.plan.description': 'Cuéntanos sobre tu estado actual y combinaremos paisajes sonoros adecuados, prácticas de meditación y sugerencias de sueño para enviarte un plan de terapia de sonido estructurado de 7 días.',
'form.plan.name.label': 'Tu Apodo',
'form.plan.name.placeholder': 'ej.: Carlos',
'form.plan.email.label': 'Email de Contacto',
'form.plan.email.placeholder': 'your@email.com',
'form.plan.goal.label': 'Tu Objetivo Principal',
'form.plan.goal.placeholder': 'Por favor selecciona',
'form.plan.goal.sleep': 'Mejorar la Calidad del Sueño',
'form.plan.goal.focus': 'Mejorar el Enfoque y la Productividad',
'form.plan.goal.stress': 'Reducir la Ansiedad y el Estrés',
'form.plan.goal.mindfulness': 'Construir un Hábito de Meditación Regular',
'form.plan.time.label': 'Compromiso de Tiempo Diario',
'form.plan.time.placeholder': 'Por favor selecciona',
'form.plan.time.5-10': '5-10 minutos',
'form.plan.time.10-20': '10-20 minutos',
'form.plan.time.20-30': '20-30 minutos',
'form.plan.time.30+': '30+ minutos',
'form.plan.submit': 'Obtener Plan Personalizado',
'form.plan.success': '✅ ¡Solicitud exitosa! Enviaremos tu plan de meditación personalizado a tu correo en 5 minutos.',
```

---

### 任务 3: 更新 i18n-system.js 的 updatePageContent 方法

**问题**: 当前方法不支持 `data-i18n-placeholder` 和 `<select>` 中的 `<option>` 翻译

**解决方案**: 修改 `updatePageContent()` 方法（约第 1200 行）

```javascript
updatePageContent() {
    // 更新 data-i18n 属性的元素
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.getTranslation(key);

        // 根据元素类型更新内容
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
            element.placeholder = translation;
        } else if (element.hasAttribute('title')) {
            element.title = translation;
        } else {
            element.textContent = translation;
        }
    });

    // ✅ 新增: 更新 data-i18n-placeholder 属性
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = this.getTranslation(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        }
    });

    // 更新特殊元素
    this.updateSpecialElements();
}
```

---

### 任务 4: 测试多语言切换

#### 4.1 本地测试
1. 打开 https://soundflows.app
2. 切换语言选择器到不同语言
3. 检查表单字段是否正确翻译

#### 4.2 测试清单
- [ ] 英语 (en-US) - 默认语言
- [ ] 中文 (zh-CN)
- [ ] 日语 (ja-JP)
- [ ] 韩语 (ko-KR)
- [ ] 西班牙语 (es-ES)

#### 4.3 验证项目
- [ ] 表单标签翻译正确
- [ ] 输入框 placeholder 翻译正确
- [ ] 下拉选项翻译正确
- [ ] 按钮文字翻译正确
- [ ] 成功消息翻译正确
- [ ] 语言切换后立即生效

---

### 任务 5: 提交并部署

#### 5.1 Git 提交
```bash
git add assets/js/i18n-system.js index.html
git commit -m "🌍 实现表单多语言功能 - 支持 5 种语言

## 变更内容
- 修改默认语言为英语
- 为表单添加 data-i18n 属性
- 添加表单字段的 5 种语言翻译
- 更新 i18n 系统支持 placeholder 翻译

## 支持语言
- 英语 (默认)
- 中文
- 日语
- 韩语
- 西班牙语

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

#### 5.2 部署验证
- 等待 2-3 分钟 Vercel 部署完成
- 访问 https://soundflows.app
- 硬刷新 (Ctrl + Shift + R)
- 测试所有语言切换

---

## 📊 预期结果

### 用户体验
1. **默认显示英语**: 首次访问自动显示英语界面
2. **语言自动保存**: 切换语言后刷新页面保持选择
3. **表单完全翻译**: 所有表单字段支持 5 种语言
4. **实时切换**: 切换语言立即更新表单文本

### 技术指标
- ✅ 5 种语言完全支持
- ✅ 表单字段 100% 翻译覆盖
- ✅ 无需刷新页面即可切换
- ✅ SEO 友好（HTML lang 属性自动更新）

---

## 🔧 可能遇到的问题

### 问题 1: 翻译不生效
**原因**: i18n 系统未加载完成就渲染表单
**解决**: 确保 i18n-system.js 在 index.html 之前加载

### 问题 2: Placeholder 不更新
**原因**: updatePageContent 方法未处理 placeholder
**解决**: 添加 data-i18n-placeholder 处理逻辑

### 问题 3: Select 选项不翻译
**原因**: Option 元素的 textContent 更新时机问题
**解决**: 在 updatePageContent 中特殊处理 select > option

---

## 📚 参考文档

- **现有 i18n 系统**: `assets/js/i18n-system.js`
- **表单结构**: `index.html` 第 248-428 行
- **HubSpot 集成**: `docs/HUBSPOT-INTEGRATION-COMPLETE.md`

---

**维护者**: SoundFlows Team
**创建时间**: 2025-10-18 22:00
**预计完成时间**: 明天 2-3 小时
**优先级**: 高
