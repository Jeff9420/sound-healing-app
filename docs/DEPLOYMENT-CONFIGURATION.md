# 部署配置指南

## 概述

SoundFlows 声音疗愈平台需要配置多个第三方服务以实现完整的分析和监控功能。本指南将帮助您正确配置所有必需的服务。

## 📋 配置清单

### 1. 环境配置

1. **复制环境配置文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件**
   - 填入所有必需的 API 密钥和配置
   - 确保生产环境设置正确

### 2. 分析平台配置

#### Google Analytics 4
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新账户或使用现有账户
3. 创建新的媒体资源
4. 获取测量 ID（格式：G-XXXXXXXXXX）
5. 更新 `.env` 文件中的 `GA4_MEASUREMENT_ID`

#### Amplitude Analytics
1. 访问 [Amplitude](https://amplitude.com/)
2. 注册并创建新项目
3. 在项目设置中找到 API Key
4. 更新 `.env` 文件中的 `AMPLITUDE_API_KEY`

#### Microsoft Clarity
1. 访问 [Clarity](https://clarity.microsoft.com/)
2. 登录并创建新项目
3. 获取项目 ID
4. 更新 `.env` 文件中的 `CLARITY_PROJECT_ID`

### 3. 错误监控配置

#### Sentry.io
1. 访问 [Sentry](https://sentry.io/)
2. 创建新组织
3. 创建新项目（选择 JavaScript）
4. 获取 DSN（数据源名称）
5. 更新 `assets/js/sentry-error-tracking.js` 中的 DSN

### 4. CRM 配置

#### HubSpot
1. 访问 [HubSpot](https://hubspot.com/)
2. 创建或使用现有账户
3. **获取 Portal ID**：
   - 进入 Settings → Account Details
   - 复制 Portal ID
4. **创建表单**：
   - Marketing → Forms → Create form
   - 创建"定制计划"表单
   - 获取表单 GUID
5. **配置工作流**（可选）：
   - Automation → Workflows
   - 创建自动化流程

### 5. 云存储配置

#### Archive.org（音频托管）
1. 访问 [Archive.org](https://archive.org/)
2. 创建账户
3. 上传音频文件到集合
4. 确认集合名称：`sound-healing-collection`

#### Cloudflare R2（视频托管）
1. 登录 Cloudflare Dashboard
2. 启用 R2 Object Storage
3. 创建存储桶
4. 上传视频文件
5. 配置自定义域名（可选）

## 🔧 技术配置

### Vercel 部署（推荐）

1. **连接 GitHub**
   ```bash
   # 确保已推送到 GitHub
   git add .
   git commit -m "Add configuration"
   git push origin main
   ```

2. **Vercel 设置**
   - 访问 [Vercel](https://vercel.com/)
   - 导入 GitHub 仓库
   - 配置环境变量（在 Project Settings → Environment Variables）
   - 设置域名

### 手动部署

1. **构建项目**
   ```bash
   # 无需构建，项目是纯静态文件
   ```

2. **上传到服务器**
   ```bash
   # 使用 rsync 或 FTP 上传所有文件
   rsync -avz ./ public/ user@server:/var/www/html/
   ```

3. **配置服务器**
   - 确保支持 HTTPS
   - 配置正确的 MIME 类型
   - 启用 Gzip 压缩

## 📊 验证配置

### 检查工具

1. **Google Tag Assistant**
   - 安装 Chrome 扩展
   - 访问网站并验证标签

2. **Sentry Test**
   ```javascript
   // 在控制台执行
   throw new Error('Test error');
   ```

3. **Network 面板**
   - 检查所有资源加载状态
   - 验证 API 请求成功

### 测试清单

- [ ] Google Analytics 正在追踪页面浏览
- [ ] Amplitude 事件正在发送
- [ ] Clarity 热力图正在记录
- [ ] Sentry 错误正在捕获
- [ ] HubSpot 表单正常提交
- [ ] Service Worker 正常注册
- [ ] PWA 可以安装
- [ ] 音频文件从 CDN 加载
- [ ] 视频文件正常播放

## 🔒 安全注意事项

### API 密钥管理

1. **仅使用客户端密钥**
   - 所有前端配置都使用公钥
   - 不暴露私钥或数据库密码

2. **环境变量保护**
   - .env 文件已在 .gitignore 中
   - 不要提交 .env 文件到版本库

3. **HTTPS 强制**
   - 所有 API 请求使用 HTTPS
   - 配置 HSTS 头部

### 内容安全

1. **XSS 防护**
   - 所有用户输入已转义
   - 使用 CSP 头部

2. **CSRF 保护**
   - 使用 SameSite cookie
   - 重要操作需要验证

## 🚨 故障排除

### 常见问题

1. **分析数据未显示**
   - 检查 API 密钥是否正确
   - 查看浏览器控制台错误
   - 确认域名已添加到白名单

2. **Service Worker 错误**
   - 清除浏览器缓存
   - 检查 sw.js 路径
   - 验证 HTTPS 证书

3. **音频加载失败**
   - 检查 Archive.org URL
   - 验证文件权限
   - 查看网络选项卡

4. **PWA 安装失败**
   - 检查 manifest.json 语法
   - 验证图标路径
   - 确认 Service Worker 注册

## 📚 相关文档

- [项目架构文档](ARCHITECTURE.md)
- [API 参考文档](API-REFERENCE.md)
- [性能优化指南](PERFORMANCE-OPTIMIZATION.md)
- [故障排除指南](TROUBLESHOOTING.md)

## 🆘 获取帮助

如果遇到问题：

1. 查看相关文档
2. 检查 GitHub Issues
3. 联系技术支持：support@soundflows.app

---

**最后更新**：2025年1月23日
**版本**：v3.0.0