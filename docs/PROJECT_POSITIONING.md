# SoundFlows - Project Positioning & Development Guidelines

**Version**: v3.1.0
**Last Updated**: 2025-01-20

---

## 🌍 Target Audience

### Primary Market
- **Geographic**: International/Overseas users
- **Language**: English-speaking users
- **Demographics**: Global wellness & meditation community
- **Priority**: 100% - All features and configurations should prioritize this audience

### Secondary Markets
- **Chinese** (`zh-CN`): Simplified Chinese speakers
- **Japanese** (`ja-JP`): Japanese speakers
- **Korean** (`ko-KR`): Korean speakers
- **Spanish** (`es-ES`): Spanish speakers
- **Priority**: Secondary - Translation support but not primary focus

---

## 🎯 Development Principles

### Language Policy

**CRITICAL RULE**: Always default to English in all configurations

#### ✅ DO (English First)
```javascript
// ✅ GOOD: English default
const defaultLanguage = 'en-US';
const fallbackLanguage = 'en-US';

// ✅ GOOD: Error messages in English
throw new Error('Invalid email format');

// ✅ GOOD: Console logs in English
console.log('Audio loaded successfully');

// ✅ GOOD: API responses in English
res.json({ message: 'Email sent successfully' });

// ✅ GOOD: Comments in English
// Load user preferences from localStorage
const userPrefs = loadPreferences();
```

#### ❌ DON'T (Chinese First)
```javascript
// ❌ BAD: Chinese default
const defaultLanguage = 'zh-CN';

// ❌ BAD: Error messages in Chinese
throw new Error('邮箱格式无效');

// ❌ BAD: Console logs in Chinese
console.log('音频加载成功');

// ❌ BAD: Comments in Chinese
// 从localStorage加载用户偏好
const userPrefs = loadPreferences();
```

---

## 📝 Content Guidelines

### Code & Documentation

| Content Type | Primary Language | Secondary |
|--------------|-----------------|-----------|
| **Code Comments** | ✅ English | ❌ None |
| **Git Commits** | ✅ English | ❌ None |
| **Documentation** | ✅ English | ⚠️ Chinese (if needed) |
| **README** | ✅ English | ⚠️ Chinese section |
| **API Responses** | ✅ English | ❌ None |
| **Error Messages** | ✅ English | ❌ None |
| **Console Logs** | ✅ English | ❌ None |

### User-Facing Content

| Content Type | Default | Localization |
|--------------|---------|--------------|
| **UI Interface** | ✅ English | ✅ i18n support |
| **Email Templates** | ✅ English | ✅ Language-aware |
| **Notifications** | ✅ English | ✅ Language-aware |
| **Help Text** | ✅ English | ✅ i18n support |
| **Error Messages** | ✅ English | ✅ i18n support |

---

## 🌐 Configuration Standards

### Default Settings

**Always use these defaults in all configurations**:

```javascript
// Language Configuration
DEFAULT_LANGUAGE = 'en-US'
FALLBACK_LANGUAGE = 'en-US'
PRIMARY_LOCALE = 'en-US'

// Time & Date
DEFAULT_TIMEZONE = 'UTC'
DATE_FORMAT = 'MM/DD/YYYY'  // US format
TIME_FORMAT = '12h'          // 12-hour with AM/PM

// Currency
DEFAULT_CURRENCY = 'USD'

// Units
DISTANCE_UNIT = 'miles'
TEMPERATURE_UNIT = 'fahrenheit'
```

### Language Detection Priority

```javascript
// Correct language detection order
1. User's explicit selection (localStorage)
2. Browser language (navigator.language)
3. DEFAULT: 'en-US' (always fallback to English)

// ❌ WRONG: Never default to Chinese
if (!userLang) userLang = 'zh-CN';  // BAD

// ✅ CORRECT: Always default to English
if (!userLang) userLang = 'en-US';  // GOOD
```

---

## 📧 Email & Communication

### Email Templates

**Default Language**: English

```javascript
// ✅ CORRECT
const welcomeEmail = {
  subject: 'Welcome to SoundFlows',
  body: 'Thank you for joining our meditation community...',
  language: userLanguage || 'en-US'  // Fallback to English
};

// ❌ WRONG
const welcomeEmail = {
  subject: '欢迎使用声音疗愈',
  body: '感谢您加入我们的冥想社区...',
  language: 'zh-CN'
};
```

### Communication Channels

- **Support Email**: Use English as primary language
- **Documentation**: English first, translations optional
- **Social Media**: English-focused content
- **Marketing**: Target international/English-speaking markets

---

## 🧪 Testing Guidelines

### Test Data

**Use English test data**:

```javascript
// ✅ GOOD: English test data
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  language: 'en-US'
};

// ❌ BAD: Chinese test data
const testUser = {
  name: '张三',
  email: 'zhangsan@example.com',
  language: 'zh-CN'
};
```

### Test Scenarios

**Priority**:
1. ✅ English UI/UX (Primary)
2. ✅ English error handling (Primary)
3. ⚠️ Other languages (Secondary)

---

## 📊 Analytics & Reporting

### Metrics Collection

**Label everything in English**:

```javascript
// ✅ GOOD
gtag('event', 'audio_play', {
  category: 'meditation',
  action: 'play',
  label: 'zen-bamboo.mp4'
});

// ❌ BAD
gtag('event', '音频播放', {
  category: '冥想',
  action: '播放',
  label: '禅意竹林.mp4'
});
```

### Dashboard & Reports

- **Metric names**: English
- **Category labels**: English
- **Chart titles**: English
- **Export formats**: English headers

---

## 🚀 Deployment Checklist

Before deploying, verify:

- [ ] Default language is `en-US`
- [ ] English is the primary fallback
- [ ] Error messages display in English by default
- [ ] Email templates default to English
- [ ] Console logs are in English
- [ ] API responses are in English
- [ ] Documentation is in English
- [ ] Test with English locale first
- [ ] Analytics labels are in English

---

## 🔍 Common Mistakes to Avoid

### ❌ Mistake 1: Chinese-first configuration
```javascript
// WRONG
const config = {
  defaultLang: 'zh-CN',
  supportedLangs: ['zh-CN', 'en-US']
};
```

### ✅ Correction
```javascript
// CORRECT
const config = {
  defaultLang: 'en-US',
  supportedLangs: ['en-US', 'zh-CN', 'ja-JP', 'ko-KR', 'es-ES']
};
```

### ❌ Mistake 2: Chinese error messages
```javascript
// WRONG
throw new Error('用户未登录');
```

### ✅ Correction
```javascript
// CORRECT
throw new Error('User not authenticated');
```

### ❌ Mistake 3: Chinese-first routing
```javascript
// WRONG
const defaultRoute = '/zh/';
```

### ✅ Correction
```javascript
// CORRECT
const defaultRoute = '/en/';
```

---

## 📚 Additional Resources

- **i18n Guide**: See `CLAUDE.md` § Multilingual System
- **API Documentation**: English only
- **User Guide**: English with i18n support
- **Developer Docs**: English only

---

## ⚠️ Historical Note

**Project Folder Name**: `声音疗愈` (Chinese)
- **Reason**: Historical decision, difficult to change
- **Solution**: Use "SoundFlows" in all code, configs, and documentation
- **DO NOT** let folder name influence development decisions
- **Always** prioritize English in actual implementation

---

## 🎯 Quick Reference

**When in doubt, ask yourself**:
1. "Is this configuration in English?"
2. "Does this default to English users?"
3. "Will international users understand this?"

**If the answer to any is "No", revise to prioritize English.**

---

**Remember**: SoundFlows is an **international platform** for **global users**.
English is not just a language option—it's our **primary identity**.

---

**Document Version**: 1.0.0
**Maintained by**: SoundFlows Development Team
**Last Review**: 2025-01-20
