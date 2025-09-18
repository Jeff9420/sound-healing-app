# 声音疗愈项目开发命令

## Git 操作
```bash
# 检查状态
git status

# 提交更改
git add .
git commit -m "描述修改内容"
git push origin main
```

## 部署命令
**推荐方式**: 通过 GitHub 自动部署
```bash
# 部署到生产环境 (通过GitHub触发Vercel自动部署)
git push origin main
# 访问: https://soundflows.app (2-3分钟后生效)
```

**注意**: 不要使用 `vercel --prod --yes` 直接部署，这会创建临时URL

## 开发测试
```bash
# 在Windows系统中打开测试文件
start quick-audio-test.html          # 快速音频测试
start browser-audio-test.html        # 浏览器兼容性测试
start test-english-filenames.html    # 文件名验证工具
```

## 文件操作 (Windows)
```bash
# 列出目录内容
dir                    # 列出当前目录
dir /s                 # 递归列出子目录
tree /f               # 树状显示文件结构

# 查找文件
findstr /s "搜索内容" *.js    # 在JS文件中搜索文本
dir /s *.mp3               # 查找所有MP3文件
```

## 项目结构维护
```bash
# 更新音频配置 (当音频文件发生变化时)
python update_config.py    # 扫描音频文件夹并重新生成 audio-config.js

# 批量重命名文件
python rename_files.py     # 批量移除前缀等
```

## 浏览器测试
- **Chrome**: 主要测试目标
- **Firefox**: 音频兼容性测试
- **Safari**: 特别是音频自动播放策略
- **Edge**: WMA格式兼容性测试

## 性能监控
项目内置性能监控，通过以下方式查看：
- 浏览器开发者工具 Console
- 应用内置的 PerformanceMonitor 组件
- Memory usage tracking for audio instances