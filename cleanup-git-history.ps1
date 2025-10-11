# Git历史清理脚本 (PowerShell)
# 警告：此操作不可逆！会重写Git历史

Write-Host "⚠️  警告：此操作将重写Git历史，不可逆！" -ForegroundColor Red
Write-Host "建议先备份当前仓库" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "确认继续？(输入 YES 继续)"

if ($confirm -ne "YES") {
    Write-Host "已取消" -ForegroundColor Green
    exit 1
}

Write-Host "`n🧹 开始清理Git历史..." -ForegroundColor Cyan

# 查找大文件
Write-Host "`n📋 正在查找大文件..." -ForegroundColor Yellow
git rev-list --objects --all | `
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | `
  Where-Object { $_ -match '^blob' } | `
  ForEach-Object {
      $parts = $_ -split '\s+'
      if ([int]$parts[2] -gt 1048576) {
          "$($parts[2]) $($parts[3..$parts.Length] -join ' ')"
      }
  } | Sort-Object -Descending | Out-File large-files.txt

Write-Host "发现大文件（已保存到 large-files.txt）" -ForegroundColor Green
Get-Content large-files.txt -Head 30

# 逐步清理
Write-Host "`n🗑️  清理文件..." -ForegroundColor Yellow

# 清理音频文件夹
Write-Host "清理 assets/audio/..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch -r assets/audio/' --prune-empty --tag-name-filter cat -- --all

# 清理视频文件夹
Write-Host "清理 背景/..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch -r 背景/' --prune-empty --tag-name-filter cat -- --all

# 清理大文件
Write-Host "清理安装包..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch node-installer.msi npm.zip' --prune-empty --tag-name-filter cat -- --all

# 清理 node_modules
Write-Host "清理 node_modules/..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch -r node_modules/' --prune-empty --tag-name-filter cat -- --all

# 清理 package
Write-Host "清理 package/..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch -r package/' --prune-empty --tag-name-filter cat -- --all

# 最终清理
Write-Host "`n🧽 执行垃圾回收..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 显示结果
Write-Host "`n📊 清理结果:" -ForegroundColor Cyan
$gitSize = (Get-ChildItem .git -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "清理后 .git 文件夹大小: $([math]::Round($gitSize, 2)) GB" -ForegroundColor Green

Write-Host "`n✅ 清理完成！" -ForegroundColor Green
Write-Host "`n⚠️  下一步：" -ForegroundColor Yellow
Write-Host "1. 强制推送到远程仓库："
Write-Host "   git push origin --force --all"
Write-Host "   git push origin --force --tags"
Write-Host ""
Write-Host "2. 通知所有协作者重新克隆仓库" -ForegroundColor Red
