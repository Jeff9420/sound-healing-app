@echo off
chcp 65001 >nul
echo ========================================
echo SRI 哈希生成脚本
echo ========================================
echo.

echo 正在生成 SRI 哈希...
echo.

node scripts/generate-sri.js

echo.
echo ========================================
echo 生成完成！
echo ========================================
echo.
echo 请将上面输出的 SRI 哈希添加到以下文件：
echo - index.html
echo - en/index.html
echo.
echo 示例：
echo ^<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"
echo         integrity="sha384-[生成的哈希值]"
echo         crossorigin="anonymous"^>^</script^>
echo.
pause
