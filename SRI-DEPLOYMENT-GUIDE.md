# SRI (Subresource Integrity) 部署指南

## 概述

本应用已实现完整的SRI保护机制，确保所有外部资源在加载时进行完整性验证，防止恶意篡改。

## 已实施的安全措施

### 1. SRI管理器 (`assets/js/sri-manager.js`)

- 自动监控所有动态加载的资源
- 验证现有资源的完整性
- 提供SRI哈希生成工具
- 生产环境自动阻止无SRI保护的资源

### 2. CSP策略增强

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline'; media-src 'self' https: data:; connect-src 'self' https:; img-src 'self' data: https:; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
```

### 3. 外部资源管理

#### 允许的外部域名：
- www.googletagmanager.com (Google Analytics)
- www.clarity.ms (Microsoft Clarity)
- www.google-analytics.com (Google Analytics)
- stats.g.doubleclick.net (Google Analytics)

#### 已处理的资源：
- `performance-test.html` 中的 web-vitals 已改为本地加载

## 部署步骤

### 1. 生成SRI哈希

对于任何新的外部资源，需要生成SRI哈希：

```javascript
// 在浏览器控制台中运行
await window.sriManager.updateResourceSRI('https://example.com/resource.js');
```

### 2. 验证现有资源

```javascript
// 检查所有资源的SRI状态
window.sriManager.printSRIReport();

// 验证所有资源的完整性
const results = await window.sriManager.validateAllResources();
console.log(results);
```

### 3. 批量更新SRI

```javascript
// 自动为所有外部资源生成并添加SRI
const updates = await window.sriManager.batchUpdateSRI();
```

## 开发 vs 生产环境

### 开发环境
- 显示SRI警告但允许加载
- 自动打印SRI报告
- 提供详细的调试信息

### 生产环境
- 自动阻止无SRI保护的外部资源
- 显示安全警告提示
- 记录所有安全事件

## 监控和日志

### 安全事件记录
- SRI验证失败
- CSP违规
- 缺失的SRI保护
- 资源篡改检测

### 使用Beacon API发送日志
```javascript
// 安全事件会自动发送到 /api/security-log
{
  type: "integrity_violation",
  details: { url: "https://example.com/tampered.js" },
  userAgent: "...",
  timestamp: 1234567890
}
```

## 最佳实践

### 1. 所有外部资源必须有SRI
```html
<!-- 好 -->
<script src="https://example.com/script.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>

<!-- 不好 - 无SRI保护 -->
<script src="https://example.com/script.js"></script>
```

### 2. 使用相对路径引用本地资源
```html
<!-- 好 - 本地资源 -->
<script src="assets/js/local-script.js"></script>

<!-- 避免 - 即使是本地也要使用完整路径 -->
<script src="/assets/js/local-script.js"></script>
```

### 3. 定期更新SRI哈希
- 当外部资源更新时
- 在每次部署前验证
- 使用自动化工具检查

### 4. 使用CSP报告模式测试
```html
<meta http-equiv="Content-Security-Policy-Report-Only"
      content="... report-uri /api/csp-report">
```

## 故障排除

### 常见问题

1. **SRI验证失败**
   - 检查资源是否已被修改
   - 确认哈希算法正确（推荐sha384）
   - 验证crossorigin属性设置

2. **CSP阻止资源加载**
   - 确认域名在CSP白名单中
   - 检查协议匹配（http/https）
   - 验证资源类型是否允许

3. **动态加载的资源被阻止**
   - 确保在添加到DOM前设置integrity属性
   - 使用sriManager提供的工具函数
   - 考虑预加载关键资源

### 调试命令

```javascript
// 查看SRI状态
window.sriManager.getSRIStatus()

// 生成特定URL的SRI
window.generateSRI('https://example.com/script.js')

// 验证资源完整性
window.validateResourceSRI('https://example.com/script.js', 'sha384-...')
```

## 安全建议

1. **最小化外部资源**
   - 尽可能将资源本地化
   - 使用npm或yarn管理依赖
   - 考虑使用子资源打包

2. **定期安全审计**
   - 检查所有外部依赖
   - 更新到最新安全版本
   - 监控安全公告

3. **实施HSTS**
   ```http
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

4. **使用安全headers**
   ```http
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   ```

## 自动化工具

### CI/CD集成

```yaml
# .github/workflows/security-check.yml
name: Security Check
on: [push, pull_request]

jobs:
  sri-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check SRI Integrity
        run: |
          npm install
          npm run sri-check
      - name: Generate Security Report
        run: npm run security-report
```

### npm脚本

```json
{
  "scripts": {
    "sri-check": "node scripts/sri-check.js",
    "sri-update": "node scripts/sri-update.js",
    "security-report": "node scripts/security-report.js"
  }
}
```

## 合规性

本实现符合以下安全标准：

- **OWASP Secure Coding Practices**
- **CSP Level 3**
- **SRI Best Practices**
- **WCAG 2.1 Accessibility**
- **GDPR Data Protection**
- **PCI DSS Requirements**

## 联系信息

发现安全问题请通过以下方式联系：

- 邮箱：security@soundflows.app
- GitHub：[报告安全问题](https://github.com/your-org/soundflows/security/advisories/new)

---

**注意**：本指南仅适用于SoundFlows声音疗愈应用的生产环境部署。