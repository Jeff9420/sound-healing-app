#!/bin/bash
# BFG Git 历史清理自动化脚本

echo "🚀 开始 Git 历史清理流程..."

# 1. 创建备份
echo "📋 创建仓库备份..."
if [ ! -d "sound-healing-app-backup.git" ]; then
    git clone --mirror . sound-healing-app-backup.git
    echo "✅ 备份已创建：sound-healing-app-backup.git"
else
    echo "⚠️ 备份已存在，跳过创建"
fi

# 2. 下载 BFG Repo-Cleaner
echo "📥 下载 BFG Repo-Cleaner..."
BFG_JAR="bfg-1.14.0.jar"
if [ ! -f "$BFG_JAR" ]; then
    curl -L "https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar" -o "$BFG_JAR"
    echo "✅ BFG 下载完成"
else
    echo "⚠️ BFG 已存在，跳过下载"
fi

# 3. 显示当前仓库大小
echo "📊 清理前仓库大小："
du -sh .git/

# 4. 运行 BFG 清理
echo "🧹 开始清理大文件..."
java -jar "$BFG_JAR" --delete-files "*.mp3" --delete-files "*.wav" --delete-files "*.ogg" --delete-files "*.m4a" --delete-folders "assets/audio" --no-blob-protection

# 5. 彻底清理
echo "🗑️ 执行垃圾回收..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. 显示清理后大小
echo "📊 清理后仓库大小："
du -sh .git/

# 7. 生成清理报告
echo "📄 生成清理报告..."
cat > CLEANUP-REPORT.md << EOF
# Git 历史清理报告

**清理时间**: $(date)
**清理工具**: BFG Repo-Cleaner v1.14.0

## 清理内容
- ✅ 删除所有 .mp3 文件
- ✅ 删除所有 .wav 文件  
- ✅ 删除所有 .ogg 文件
- ✅ 删除所有 .m4a 文件
- ✅ 删除 assets/audio 文件夹

## 仓库大小变化
- **清理前**: $(du -sh sound-healing-app-backup.git/ | cut -f1)
- **清理后**: $(du -sh .git/ | cut -f1)

## 下一步操作
1. 验证应用功能正常
2. 强制推送到远程仓库：\`git push --force-with-lease origin main\`
3. 通知团队成员重新克隆仓库
4. 上传音频文件到 Archive.org

## 备注
- 原始仓库已备份至：sound-healing-app-backup.git
- 如需回滚，可从备份恢复
EOF

echo "✅ 清理完成！请查看 CLEANUP-REPORT.md 了解详情"
echo ""
echo "⚠️  重要提醒："
echo "   1. 请先在本地测试应用功能"
echo "   2. 确认无误后再推送到远程仓库"
echo "   3. 使用 'git push --force-with-lease origin main' 强制推送"
echo "   4. 通知团队成员需要重新克隆仓库"