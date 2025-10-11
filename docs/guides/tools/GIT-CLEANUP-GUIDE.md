# 🧹 Git 历史清理指南

## 📊 问题诊断

当前状态：
- **项目文件夹大小**: 8.6 GB
- **.git 文件夹大小**: 8.5 GB (99%的空间)
- **实际项目文件**: ~75 MB

**问题原因**: Git历史中包含了大量已删除的文件（音频、视频、node_modules等）

---

## ⚠️ 重要警告

**清理Git历史会：**
- ❌ 永久删除历史记录中的文件
- ❌ 改变所有 commit 的 SHA
- ❌ 需要所有协作者重新克隆仓库
- ❌ 需要强制推送到远程仓库

**在执行前务必：**
- ✅ 备份整个项目文件夹
- ✅ 确认所有重要更改已提交
- ✅ 通知所有协作者

---

## 🎯 推荐方案：使用 BFG Repo-Cleaner

BFG 是比 `git filter-branch` 更快、更安全的工具。

### 步骤 1: 安装 BFG

**方法 A: 使用 Chocolatey (推荐)**
```powershell
choco install bfg-repo-cleaner
```

**方法 B: 手动下载**
1. 访问：https://rtyley.github.io/bfg-repo-cleaner/
2. 下载 `bfg-1.14.0.jar`
3. 确保已安装 Java（运行 `java -version` 检查）

### 步骤 2: 备份仓库
```bash
# 克隆一份备份
cd ..
git clone --mirror "C:\Users\MI\Desktop\声音疗愈" sound-healing-backup

# 或直接复制文件夹
xcopy "C:\Users\MI\Desktop\声音疗愈" "C:\Users\MI\Desktop\声音疗愈-backup" /E /I /H
```

### 步骤 3: 创建新的干净克隆
```bash
# 在项目目录外创建镜像克隆
cd "C:\Users\MI\Desktop"
git clone --mirror "C:\Users\MI\Desktop\声音疗愈\.git" sound-healing.git
```

### 步骤 4: 清理大文件

**方法 A: 删除大于指定大小的文件**
```bash
cd "C:\Users\MI\Desktop"

# 删除所有大于 1MB 的文件
java -jar bfg.jar --strip-blobs-bigger-than 1M sound-healing.git
```

**方法 B: 删除特定文件夹（推荐）**
```bash
# 删除音频文件夹
java -jar bfg.jar --delete-folders "audio" sound-healing.git

# 删除视频文件夹
java -jar bfg.jar --delete-folders "背景" sound-healing.git

# 删除 node_modules
java -jar bfg.jar --delete-folders "node_modules" sound-healing.git

# 删除 package
java -jar bfg.jar --delete-folders "package" sound-healing.git
```

**方法 C: 删除特定文件类型**
```bash
# 创建文件列表
echo "node-installer.msi" > files-to-delete.txt
echo "npm.zip" >> files-to-delete.txt
echo "*.dll" >> files-to-delete.txt
echo "*.mp4" >> files-to-delete.txt

# 执行删除
java -jar bfg.jar --delete-files files-to-delete.txt sound-healing.git
```

### 步骤 5: 垃圾回收
```bash
cd sound-healing.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 步骤 6: 推回原仓库
```bash
# 进入原项目目录
cd "C:\Users\MI\Desktop\声音疗愈"

# 从清理后的镜像拉取
git remote add cleaned ../sound-healing.git
git fetch cleaned
git reset --hard cleaned/main
git remote remove cleaned

# 检查大小
git count-objects -vH
```

### 步骤 7: 强制推送到远程
```bash
# 强制推送所有分支
git push origin --force --all

# 强制推送标签
git push origin --force --tags
```

---

## 🚀 快速清理方案（一键脚本）

如果你只想快速清理，使用提供的 PowerShell 脚本：

```powershell
# 运行清理脚本
.\cleanup-git-history.ps1
```

---

## 📋 清理检查清单

执行前：
- [ ] 备份整个项目文件夹
- [ ] 确认所有更改已提交和推送
- [ ] 通知所有协作者
- [ ] 记录当前 .git 大小

执行后：
- [ ] 验证 .git 文件夹大小已减小
- [ ] 运行 `git log` 确认历史完整
- [ ] 测试应用功能正常
- [ ] 强制推送到远程仓库
- [ ] 通知协作者重新克隆

---

## 🔍 验证清理效果

### 检查 .git 大小
```bash
# Windows PowerShell
(Get-ChildItem .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB

# Git Bash
du -sh .git
```

### 查看大文件是否还在历史中
```bash
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {if ($3 > 1048576) print $3/1048576 "MB", $4}' | \
  sort -rn | head -20
```

### 预期结果
- .git 文件夹应从 8.5GB 降到 **< 100MB**
- 项目总大小应从 8.6GB 降到 **< 200MB**

---

## 🆘 故障排除

### 问题1: BFG 无法运行
**解决方案**:
```bash
# 检查 Java 版本
java -version

# 如果未安装，下载安装 JRE
# https://www.java.com/download/
```

### 问题2: 清理后仓库损坏
**解决方案**:
```bash
# 从备份恢复
rm -rf .git
xcopy "..\sound-healing-backup\.git" ".git" /E /I /H
```

### 问题3: 强制推送被拒绝
**解决方案**:
```bash
# 在 GitHub 临时关闭分支保护
# Settings > Branches > Edit main branch rule > Temporarily disable

# 推送后重新启用保护
```

---

## 📚 替代方案

### 方案1: 创建全新仓库（最简单）

如果不需要保留Git历史：

```bash
# 1. 删除 .git 文件夹
Remove-Item -Recurse -Force .git

# 2. 重新初始化
git init
git add .
git commit -m "🎉 全新开始 - 清理后的仓库"

# 3. 推送到新远程仓库
git remote add origin <新仓库URL>
git push -u origin main
```

### 方案2: 使用 git-filter-repo (高级)

更强大但需要 Python：
```bash
# 安装
pip install git-filter-repo

# 清理
git filter-repo --strip-blobs-bigger-than 1M
git filter-repo --path-glob '*.mp3' --invert-paths
git filter-repo --path-glob '*.wma' --invert-paths
```

---

## ✅ 清理后的最佳实践

### 1. 更新 .gitignore
确保这些文件夹被忽略：
```gitignore
# 大文件和缓存
node_modules/
package/
*.mp3
*.wma
*.wav
*.m4a
*.dll
*.msi
*.zip
```

### 2. 使用 Git LFS (大文件存储)
如果将来需要版本控制大文件：
```bash
# 安装 Git LFS
git lfs install

# 跟踪大文件类型
git lfs track "*.mp4"
git lfs track "*.zip"
```

### 3. 定期检查仓库大小
```bash
# 添加到每周任务
git count-objects -vH
```

---

## 📞 需要帮助？

如果遇到问题：
1. 检查备份是否完整
2. 参考 BFG 官方文档：https://rtyley.github.io/bfg-repo-cleaner/
3. 参考 Git 文档：https://git-scm.com/docs/git-filter-branch

---

**最后更新**: 2025-01-10
**难度**: ⭐⭐⭐ (中等，需谨慎操作)
