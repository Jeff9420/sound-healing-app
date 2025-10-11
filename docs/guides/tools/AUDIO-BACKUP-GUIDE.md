# 🎵 音频备份完整指南

## 📋 概述

本指南提供了完整的音频文件备份和恢复策略，确保即使 Archive.org CDN 出现问题，你的应用也能快速恢复。

---

## 🛠️ 备份工具

项目提供了3个自动化工具来管理音频备份：

### 1. **备份下载工具** (`tools/backup-audio-from-archive.js`)

从 Archive.org 下载所有音频文件到本地。

**使用方法：**
```bash
# 下载到默认目录 ./audio-backup
node tools/backup-audio-from-archive.js

# 下载到自定义目录
node tools/backup-audio-from-archive.js ./my-backup-folder
```

**功能：**
- ✅ 自动从 Archive.org 下载所有213+音频文件
- ✅ 断点续传（跳过已存在的文件）
- ✅ 智能重试机制
- ✅ 自动验证备份完整性
- ✅ 详细的进度和统计报告

### 2. **清单生成工具** (`tools/generate-audio-manifest.js`)

生成音频文件清单，用于验证和文档记录。

**使用方法：**
```bash
# 生成 JSON 清单
node tools/generate-audio-manifest.js json

# 生成 CSV 清单
node tools/generate-audio-manifest.js csv

# 生成 Markdown 清单
node tools/generate-audio-manifest.js markdown

# 生成所有格式
node tools/generate-audio-manifest.js all
```

**输出文件：**
- `audio-manifest.json` - 机器可读格式
- `audio-manifest.csv` - Excel/表格格式
- `audio-manifest.md` - 人类可读文档

### 3. **链接验证工具** (`tools/verify-archive-links.js`)

验证 Archive.org 上所有音频链接的可用性。

**使用方法：**
```bash
# 完整验证（所有213个链接）
node tools/verify-archive-links.js

# 详细模式（显示每个文件状态）
node tools/verify-archive-links.js --verbose

# 快速健康检查（随机采样10个）
node tools/verify-archive-links.js --quick

# 自定义采样数量
node tools/verify-archive-links.js --quick 20
```

**功能：**
- ✅ HEAD 请求验证（不下载文件内容）
- ✅ 超时检测（10秒）
- ✅ 生成详细报告
- ✅ 保存无效链接列表到 JSON

---

## 📅 推荐备份策略

### 每日任务
- [ ] **快速健康检查**（1分钟）
  ```bash
  node tools/verify-archive-links.js --quick
  ```
  如果健康分数 < 95%，立即运行完整验证

### 每周任务
- [ ] **完整链接验证**（15分钟）
  ```bash
  node tools/verify-archive-links.js --verbose
  ```
  检查是否有新的失效链接

### 每月任务
- [ ] **完整备份下载**（30-60分钟）
  ```bash
  node tools/backup-audio-from-archive.js ./monthly-backup-2025-01
  ```

- [ ] **验证备份完整性**
  - 检查文件数量：应为 213 个
  - 检查总大小：应为数百MB
  - 运行验证脚本确认

- [ ] **上传到云存储**
  - 压缩备份文件夹：
    ```bash
    # Windows
    Compress-Archive -Path ./monthly-backup-2025-01 -DestinationPath backup-2025-01.zip

    # macOS/Linux
    zip -r backup-2025-01.zip ./monthly-backup-2025-01
    ```
  - 上传到 Google Drive / OneDrive / Dropbox
  - 删除本地备份文件夹（保留压缩包）

### 每季度任务
- [ ] **备份审计**
  - 验证云存储备份完整性
  - 测试从备份恢复（抽样测试）
  - 更新备份文档

---

## 💾 备份存储方案

### 方案1：云存储备份（推荐）

**优点：**
- ✅ 自动同步
- ✅ 版本控制
- ✅ 跨设备访问
- ✅ 灾难恢复保护

**推荐服务：**
1. **Google Drive** (15GB 免费)
2. **OneDrive** (5GB 免费)
3. **Dropbox** (2GB 免费)

**操作步骤：**
```bash
# 1. 下载备份
node tools/backup-audio-from-archive.js ./audio-backup-$(date +%Y-%m)

# 2. 压缩
zip -r audio-backup-$(date +%Y-%m).zip ./audio-backup-$(date +%Y-%m)

# 3. 上传到云存储（使用各平台的同步文件夹）
mv audio-backup-*.zip ~/Google\ Drive/Sound-Healing-Backups/

# 4. 清理本地文件
rm -rf ./audio-backup-$(date +%Y-%m)
```

### 方案2：本地外置硬盘

**优点：**
- ✅ 完全控制
- ✅ 无存储限制
- ✅ 快速恢复

**操作步骤：**
```bash
# 直接备份到外置硬盘
node tools/backup-audio-from-archive.js /Volumes/ExternalDrive/Sound-Healing-Backup
```

### 方案3：NAS 网络存储

**优点：**
- ✅ 自动备份
- ✅ RAID 冗余
- ✅ 局域网快速访问

---

## 🚨 应急恢复方案

### 场景1：Archive.org 临时不可用

**症状：**
- 部分音频无法加载
- 加载超时
- 用户看到"⚠️ 音频加载失败"提示

**快速处理：**
1. **不要惊慌** - 应用已实现重试机制（3次）
2. **检查 Archive.org 状态**：https://archive.org
3. **运行快速验证**：
   ```bash
   node tools/verify-archive-links.js --quick 20
   ```
4. **通知用户** - 在应用中添加公告

**临时解决方案：**
- 使用缓存的音频（Service Worker 已缓存热门曲目）
- 引导用户播放其他可用音频

### 场景2：Archive.org 长期不可用

**症状：**
- 所有音频均无法加载
- 验证脚本显示 0% 健康分数

**恢复步骤：**

#### 步骤 1：从备份恢复音频文件
```bash
# 从云存储下载最新备份
# 解压到项目目录
unzip backup-2025-01.zip

# 移动到 assets/audio
mv audio-backup-2025-01/* assets/audio/
```

#### 步骤 2：修改配置指向本地文件
编辑 `assets/js/audio-config.js`:
```javascript
const AUDIO_CONFIG = {
    // 原来：
    // baseUrl: 'https://archive.org/download/sound-healing-collection/',

    // 改为（Vercel 部署）：
    baseUrl: 'https://soundflows.app/assets/audio/',

    // 或改为（本地开发）：
    // baseUrl: '/assets/audio/',

    categories: {
        // ... 保持不变
    }
};
```

#### 步骤 3：更新 .gitignore（临时）
注释掉音频文件排除规则：
```gitignore
# 临时允许音频文件提交（紧急恢复）
# assets/audio/**/*.mp3
# assets/audio/**/*.wav
# ...
```

#### 步骤 4：部署更新
```bash
git add assets/audio/
git add assets/js/audio-config.js
git commit -m "🚨 紧急恢复：使用本地音频文件"
git push origin main
```

**注意：**
- ⚠️ 这会大幅增加仓库大小
- ⚠️ Vercel 有 100MB 部署限制，可能需要升级计划
- ✅ 恢复后尽快寻找替代 CDN

### 场景3：切换到备用 CDN

**推荐备用 CDN：**
1. **Cloudinary** (免费10GB)
2. **imgix** (免费1000张图)
3. **Bunny CDN** (付费，性价比高)

**操作步骤：**
1. 上传备份到新 CDN
2. 修改 `audio-config.js` 中的 `baseUrl`
3. 测试验证：`node tools/verify-archive-links.js`
4. 部署更新

---

## 📊 监控和维护

### 自动化监控脚本

创建定时任务（cron job）：
```bash
# 每天早上8点验证链接健康度
0 8 * * * cd /path/to/project && node tools/verify-archive-links.js --quick >> logs/health-check.log 2>&1

# 每周日凌晨2点完整备份
0 2 * * 0 cd /path/to/project && node tools/backup-audio-from-archive.js ./weekly-backup && zip -r weekly-backup.zip ./weekly-backup && rm -rf ./weekly-backup
```

### 健康度指标

| 分数 | 状态 | 行动 |
|------|------|------|
| 100% | 🟢 健康 | 无需操作 |
| 95-99% | 🟡 良好 | 监控无效链接 |
| 85-94% | 🟠 警告 | 检查 Archive.org 状态 |
| < 85% | 🔴 紧急 | 启动应急恢复方案 |

---

## 📝 备份检查清单

### 备份前
- [ ] 确保网络连接稳定
- [ ] 确认有足够磁盘空间（至少 1GB）
- [ ] 运行链接验证确认源文件可用

### 备份中
- [ ] 监控下载进度
- [ ] 检查错误日志
- [ ] 验证下载文件的完整性

### 备份后
- [ ] 运行验证脚本确认所有文件已下载
- [ ] 生成清单文件（JSON/CSV/Markdown）
- [ ] 压缩备份文件夹
- [ ] 上传到云存储
- [ ] 更新备份记录（日期、文件数、大小）
- [ ] 测试恢复流程（抽样）

---

## 🔧 高级技巧

### 1. 增量备份
```bash
# 只下载新增或修改的文件
rsync -avz --progress \
  /path/to/archive-backup/ \
  /path/to/incremental-backup/
```

### 2. 并行下载加速
修改 `backup-audio-from-archive.js` 中的延迟：
```javascript
// 从 200ms 改为 50ms（需要稳定网络）
await new Promise(resolve => setTimeout(resolve, 50));
```

### 3. 分类备份
只备份特定分类：
```javascript
// 修改脚本只处理特定分类
const categoriesToBackup = ['meditation', 'Rain', 'Chakra'];
```

---

## ❓ 常见问题

**Q: 备份需要多长时间？**
A: 完整备份约30-60分钟（213个文件，取决于网络速度）

**Q: 备份占用多少空间？**
A: 约 500MB-1GB（未压缩），压缩后约 300-500MB

**Q: 多久备份一次？**
A: 建议每月完整备份一次，每周快速验证

**Q: 云存储免费空间不够怎么办？**
A:
1. 使用多个云服务分散存储
2. 定期删除旧备份（保留最近3个月）
3. 考虑付费升级或使用本地外置硬盘

**Q: 如何验证备份是否成功？**
A:
```bash
# 检查文件数量
find ./audio-backup -name "*.mp3" | wc -l
# 应该显示 213

# 运行验证脚本
node tools/backup-audio-from-archive.js ./audio-backup
# 查看统计报告
```

---

## 📞 支持

遇到问题？
1. 查看 `assets/AUDIO-MANAGEMENT.md` 了解音频管理详情
2. 检查 `invalid-links-report.json` 查看具体错误
3. 提交 GitHub Issue 寻求帮助

---

**最后更新**: 2025-01-10
**版本**: 1.0.0
