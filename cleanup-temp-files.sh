#!/bin/bash

# 声音疗愈项目 - 临时文件清理脚本
echo "🧹 开始清理临时文件..."

# 要删除的临时文件类别
echo ""
echo "📋 将要删除的文件："
echo ""

# 1. 临时截图和图片
echo "1️⃣ 临时截图和图片："
ls *.png 2>/dev/null | grep -E "(auto-|seo-|vercel-|tweet_|index-preview)" || echo "  (无)"

# 2. 临时HTML测试文件  
echo ""
echo "2️⃣ 临时HTML测试文件："
ls *.html 2>/dev/null | grep -E "(audio-debug|auto-submit|quick-test|svg-to-jpg|social-media)" || echo "  (无)"

# 3. 临时JS脚本
echo ""
echo "3️⃣ 临时JS脚本："
ls *.js 2>/dev/null | grep -E "(automate-|auto-seo|complete-seo|convert-svg|quick-performance|vercel-)" || echo "  (无)"

# 4. Python脚本
echo ""
echo "4️⃣ Python脚本："
ls *.py 2>/dev/null || echo "  (无)"

# 5. 过时的Service Worker
echo ""
echo "5️⃣ 过时的Service Worker："
ls sw-*.js 2>/dev/null | grep -v "sw.js" || echo "  (无)"

# 6. 临时文档
echo ""
echo "6️⃣ 临时文档："
ls *.md *.txt 2>/dev/null | grep -E "(QUICK-|DEPLOYMENT-CHECKLIST|SEO-|trigger-vercel|修复GSC|已验证账号|社交媒体|海外社交)" || echo "  (无)"

echo ""
echo "---"
echo ""
read -p "❓ 确认删除以上文件？(y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🗑️ 开始删除..."
    
    # 删除临时截图
    rm -f auto-*.png seo-*.png vercel-*.png tweet_*.png index-preview.png 2>/dev/null
    
    # 删除临时HTML
    rm -f audio-debug.html auto-submit-guide.html quick-test.html svg-to-jpg-converter.html \
          social-media-*.html global-social-media-dashboard.html 2>/dev/null
    
    # 删除临时JS
    rm -f automate-*.js auto-seo-*.js complete-seo-*.js convert-svg-*.js \
          quick-performance-*.js vercel-auto-*.js vercel-deploy-*.js 2>/dev/null
    
    # 删除Python脚本
    rm -f *.py 2>/dev/null
    
    # 删除过时的SW
    rm -f sw-enhanced.js sw-enhanced-v2.js 2>/dev/null
    
    # 删除临时文档
    rm -f QUICK-*.md DEPLOYMENT-CHECKLIST.md SEO-*.md trigger-vercel-*.md \
          修复GSC*.md 已验证账号*.md 社交媒体*.md 海外社交*.md 社交媒体*.csv 社交媒体*.xlsx \
          twitter_*.md twitter_*.json deploy.log 2>/dev/null
    
    echo "✅ 清理完成！"
else
    echo "❌ 取消清理"
fi
