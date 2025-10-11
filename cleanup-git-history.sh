#!/bin/bash

# Git历史清理脚本
# 警告：此操作不可逆！会重写Git历史
# 运行前请确保已备份重要数据

echo "⚠️  警告：此操作将重写Git历史，不可逆！"
echo "建议先备份：git clone . ../sound-healing-backup"
echo ""
read -p "确认继续？(输入 YES 继续): " confirm

if [ "$confirm" != "YES" ]; then
    echo "已取消"
    exit 1
fi

echo "🧹 开始清理Git历史..."

# 方法1：使用 git filter-branch 清理大文件
echo ""
echo "📋 正在查找大文件（>1MB）..."

# 查找所有大文件
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {if ($3 > 1048576) print $3, $4}' | \
  sort -rn > large-files.txt

echo "发现以下大文件："
head -30 large-files.txt

echo ""
echo "🗑️  清理特定文件类型..."

# 清理音频文件
echo "清理音频文件..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r assets/audio/' \
  --prune-empty --tag-name-filter cat -- --all

# 清理视频文件
echo "清理视频文件..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r 背景/' \
  --prune-empty --tag-name-filter cat -- --all

# 清理大的安装包
echo "清理安装包..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch node-installer.msi npm.zip' \
  --prune-empty --tag-name-filter cat -- --all

# 清理 node_modules（不应该在Git中）
echo "清理 node_modules..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r node_modules/' \
  --prune-empty --tag-name-filter cat -- --all

# 清理 .pnpm 缓存
echo "清理 .pnpm..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r .pnpm/' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "🧽 清理引用和垃圾回收..."

# 清理引用
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "📊 清理结果："
echo "清理前大小: 8.5GB"
echo "清理后大小: $(du -sh .git | cut -f1)"

echo ""
echo "✅ 清理完成！"
echo ""
echo "⚠️  重要：需要强制推送到远程仓库："
echo "git push origin --force --all"
echo "git push origin --force --tags"
echo ""
echo "⚠️  注意：所有协作者需要重新克隆仓库！"
