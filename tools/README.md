# 🛠️ 音频管理工具集

本目录包含了管理 Archive.org CDN 音频文件的自动化工具。

## 📦 工具列表

### 1. **backup-audio-from-archive.js** - 音频备份工具
从 Archive.org 下载所有音频文件到本地备份。

**功能：**
- ✅ 自动下载213+音频文件
- ✅ 断点续传（跳过已存在文件）
- ✅ 智能重试机制
- ✅ 完整性验证
- ✅ 详细统计报告

**使用方法：**
```bash
# 下载到默认目录
node tools/backup-audio-from-archive.js

# 下载到指定目录
node tools/backup-audio-from-archive.js ./my-backup
```

**预期输出：**
```
🎵 开始备份 Archive.org 音频文件...

📁 分类: Animal sounds (26 个文件)
✅ 下载成功: SPA音乐疗馆 1 - 减压疗程.mp3
✅ 下载成功: SPA音乐疗馆 4 - 冥想疗程.mp3
...

==================================================
📊 备份统计:
总文件数: 213
✅ 成功下载: 213
⏭️  已跳过: 0
❌ 失败: 0
==================================================

🎉 备份完成！
```

---

### 2. **generate-audio-manifest.js** - 清单生成工具
生成音频文件清单（JSON/CSV/Markdown格式）。

**功能：**
- ✅ 多格式导出（JSON/CSV/MD）
- ✅ 完整统计信息
- ✅ 包含所有文件URL
- ✅ 分类汇总

**使用方法：**
```bash
# 生成 JSON 格式
node tools/generate-audio-manifest.js json

# 生成 CSV 格式
node tools/generate-audio-manifest.js csv

# 生成 Markdown 格式
node tools/generate-audio-manifest.js markdown

# 生成所有格式
node tools/generate-audio-manifest.js all
```

**输出文件：**
- `audio-manifest.json` - 机器可读格式，用于程序处理
- `audio-manifest.csv` - 表格格式，可用Excel打开
- `audio-manifest.md` - 文档格式，可读性强

**JSON 示例：**
```json
{
  "generatedAt": "2025-01-10T10:00:00.000Z",
  "baseUrl": "https://archive.org/download/sound-healing-collection/",
  "stats": {
    "totalCategories": 9,
    "totalFiles": 213
  },
  "files": [...]
}
```

---

### 3. **verify-archive-links.js** - 链接验证工具
验证 Archive.org 上所有音频链接的可用性。

**功能：**
- ✅ HEAD 请求验证（轻量级，不下载）
- ✅ 超时检测（10秒）
- ✅ 详细报告生成
- ✅ 快速健康检查（采样模式）
- ✅ 自动保存无效链接列表

**使用方法：**
```bash
# 完整验证（所有213个链接）
node tools/verify-archive-links.js

# 详细模式（显示每个文件状态）
node tools/verify-archive-links.js --verbose

# 快速健康检查（随机采样10个）
node tools/verify-archive-links.js --quick

# 自定义采样数量（20个）
node tools/verify-archive-links.js --quick 20
```

**预期输出：**
```
🔗 开始验证 Archive.org 链接...

📁 验证分类: Animal sounds (26 个文件)
  进度: 26/26 文件 ✓

📁 验证分类: Chakra (7 个文件)
  进度: 7/7 文件 ✓

============================================================
📊 验证报告:
============================================================
总链接数: 213
✅ 有效: 213 (100.0%)
❌ 无效: 0 (0.0%)
⏱️  超时: 0
============================================================

🎉 所有链接都有效！
```

**失败时输出：**
如果有链接失效，会生成 `invalid-links-report.json`:
```json
{
  "generatedAt": "2025-01-10T10:00:00.000Z",
  "stats": {
    "total": 213,
    "valid": 210,
    "invalid": 3
  },
  "invalidLinks": [
    {
      "url": "https://archive.org/download/...",
      "status": 404
    }
  ]
}
```

---

## 🚀 快速开始

### 1. 首次备份
```bash
# 步骤1：验证链接
node tools/verify-archive-links.js --quick

# 步骤2：生成清单
node tools/generate-audio-manifest.js all

# 步骤3：下载备份
node tools/backup-audio-from-archive.js ./audio-backup

# 步骤4：压缩备份
zip -r audio-backup.zip ./audio-backup
```

### 2. 定期维护
```bash
# 每日快速检查（1分钟）
node tools/verify-archive-links.js --quick

# 每周完整验证（15分钟）
node tools/verify-archive-links.js --verbose

# 每月完整备份（30-60分钟）
node tools/backup-audio-from-archive.js ./monthly-backup-$(date +%Y-%m)
```

---

## 📋 常见任务

### 任务1：检查 CDN 健康状况
```bash
node tools/verify-archive-links.js --quick 20
```
**预期结果：** 健康分数应为 100%

### 任务2：验证备份完整性
```bash
# 下载备份
node tools/backup-audio-from-archive.js ./test-backup

# 检查文件数量
find ./test-backup -name "*.mp3" | wc -l
# 应该显示: 213
```

### 任务3：生成文档清单
```bash
node tools/generate-audio-manifest.js markdown
# 生成: audio-manifest.md
```

### 任务4：查找失效链接
```bash
node tools/verify-archive-links.js --verbose > link-check.log
# 检查 link-check.log 和 invalid-links-report.json
```

---

## ⚙️ 高级配置

### 修改重试次数
编辑 `backup-audio-from-archive.js`:
```javascript
// 默认延迟200ms
await new Promise(resolve => setTimeout(resolve, 200));

// 加速到50ms（需要稳定网络）
await new Promise(resolve => setTimeout(resolve, 50));
```

### 修改超时时间
编辑 `verify-archive-links.js`:
```javascript
// 默认10秒超时
const timeout = setTimeout(() => { ... }, 10000);

// 延长到30秒
const timeout = setTimeout(() => { ... }, 30000);
```

### 自定义输出格式
编辑 `generate-audio-manifest.js` 中的导出函数：
- `exportJSON()` - JSON格式
- `exportCSV()` - CSV格式
- `exportMarkdown()` - Markdown格式

---

## 🔧 故障排除

### 问题1：备份下载失败
**症状：** 大量文件显示 "❌ 下载失败"

**解决方案：**
1. 检查网络连接
2. 验证 Archive.org 是否可访问
3. 增加重试次数和延迟时间
4. 分批下载（按分类）

### 问题2：链接验证超时
**症状：** 显示 "⏱️ 超时" 错误

**解决方案：**
1. 延长超时时间（修改代码）
2. 检查网络速度
3. 使用快速模式减少测试数量

### 问题3：清单生成失败
**症状：** 运行时出错

**解决方案：**
1. 确保 `audio-config.js` 格式正确
2. 检查文件路径是否正确
3. 验证 Node.js 版本（建议 v14+）

---

## 📚 相关文档

- [音频管理指南](../assets/AUDIO-MANAGEMENT.md) - 音频文件管理策略
- [备份完整指南](../AUDIO-BACKUP-GUIDE.md) - 详细备份和恢复流程
- [音频配置](../assets/js/audio-config.js) - 音频配置文件

---

## 💡 最佳实践

1. **定期验证** - 每天快速检查，每周完整验证
2. **多重备份** - 云存储 + 本地外置硬盘
3. **版本控制** - 备份文件命名包含日期
4. **测试恢复** - 定期测试从备份恢复流程
5. **文档更新** - 及时更新清单和文档

---

## 🤝 贡献

发现问题或有改进建议？
1. 提交 GitHub Issue
2. 创建 Pull Request
3. 联系项目维护者

---

**最后更新**: 2025-01-10
**工具版本**: 1.0.0
