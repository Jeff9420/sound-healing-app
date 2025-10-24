# 正常运行时间监控配置指南

## 概述
为 SoundFlows 应用配置正常运行时间监控，确保网站可用性得到实时监控。

## 推荐服务

### 1. Uptime Robot（推荐 - 免费）
- **免费额度**: 50个监控器
- **监控间隔**: 5分钟
- **通知方式**: 邮件、短信、Webhook
- **网址**: https://uptimerobot.com

### 2. Pingdom（备选）
- **免费额度**: 1个监控器
- **监控间隔**: 1分钟
- **通知方式**: 邮件、短信
- **网址**: https://pingdom.com

## Uptime Robot 配置步骤

### 步骤1：注册账户
1. 访问 https://uptimerobot.com
2. 点击 "Sign Up"
3. 填写邮箱和密码
4. 验证邮箱

### 步骤2：添加监控器
1. 登录后点击 "Add New Monitor"
2. 填写以下信息：
   - **Monitor Type**: HTTP(s)
   - **Monitor Name**: SoundFlows Main Site
   - **URL (or IP)**: https://soundflows.app
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: 选择你的邮箱

### 步骤3：配置高级设置（可选）
- **Timeout**: 30秒
- **Monitor Locations**: 选择多个地区
- **HTTP Status Codes**: 200-302
- **Notification Threshold**: 连续失败2次后通知

### 步骤4：创建状态页面（可选）
可以创建一个公开的状态页面：
1. 进入 "My Settings" > "Status Pages"
2. 点击 "Create New Status Page"
3. 添加所有监控器
4. 获取状态页面链接

## 监控目标清单

### 主要服务
- [ ] https://soundflows.app（主站点）
- [ ] https://soundflows.app/index.html（首页）
- [ ] https://archive.org/download/sound-healing-collection/（音频资源）

### API端点（如果有）
- [ ] 健康检查端点

### CDN资源
- [ ] https://media.soundflows.app/（视频资源）
- [ ] 关键CSS文件
- [ ] 关键JS文件

## 告警配置

### 邮件通知
- 主要邮箱：your-email@example.com
- 备用邮箱：backup-email@example.com

### 短信通知（可选）
- 需要升级到付费计划

### Webhook通知（高级）
可以配置通知到：
- Slack 频道
- Discord 频道
- 钉钉群
- 企业微信群

## 状态页面配置

创建公开状态页后，可以添加到网站：
```html
<a href="/status" target="_blank">系统状态</a>
```

## 监控指标解读

### 可用性
- 目标：99.9% 或更高
- 计算：(正常运行时间 / 总时间) × 100%

### 响应时间
- 目标：< 2秒
- 优秀：< 500ms
- 可接受：500ms - 2秒
- 需要优化：> 2秒

## 故障处理流程

### 1. 收到告警
- 检查邮箱/短信
- 确认故障类型

### 2. 初步诊断
- 尝试访问网站
- 检查控制台错误
- 查看 Vercel 状态

### 3. 快速修复
- 如果是 Vercel 问题：
  - 检查最近部署
  - 回滚到上一个版本
- 如果是资源问题：
  - 检查 Archive.org 状态
  - 检查 Cloudflare R2 状态

### 4. 通知用户
如故障持续超过5分钟，在网站显示通知。

## 月度报告

每月生成监控报告：
- 总体可用性
- 平均响应时间
- 故障次数和时长
- 性能趋势

## 自动化脚本

可以使用 GitHub Actions 自动记录可用性：

```yaml
# .github/workflows/uptime-check.yml
name: Uptime Check
on:
  schedule:
    - cron: '0 */6 * * *'  # 每6小时检查一次
jobs:
  check-uptime:
    runs-on: ubuntu-latest
    steps:
      - uses: srt32/uptime-monitor-action@v0
        with:
          url: https://soundflows.app
          check-interval: 300  # 5分钟
```

## 成本估算

### Uptime Robot（推荐）
- **免费版**: $0/月（50个监控器）
- **Pro版**: $7/月（100个监控器，短信通知）

### Pingdom
- **免费版**: $0/月（1个监控器）
- **基础版**: $14.90/月（10个监控器）

## 完成检查清单

- [ ] 注册 Uptime Robot 账户
- [ ] 添加主站点监控
- [ ] 配置告警通知
- [ ] 设置监控间隔为5分钟
- [ ] 测试告警是否正常工作
- [ ] 创建状态页面（可选）
- [ ] 将状态链接添加到网站页脚
- [ ] 设置月度报告邮件
- [ ] 记录监控仪表板访问信息

## 联系信息保存

```
Uptime Robot 登录信息：
- 网址: https://uptimerobot.com
- 邮箱: [你的邮箱]
- 密码: [你的密码]

监控仪表板:
- 直接访问: https://uptimerobot.com/dashboard
```

---

**预计完成时间**: 30分钟
**难度等级**: ⭐⭐ (简单)
**需要技术能力**: 基础网页操作