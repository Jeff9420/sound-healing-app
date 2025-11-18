@echo off
echo ========================================
echo Firebase 安全规则部署脚本
echo ========================================
echo.

echo 步骤 1: 检查 Firebase CLI 是否已安装
call firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Firebase CLI 未安装
    echo 请运行: npm install -g firebase-tools
    pause
    exit /b 1
)

echo [成功] Firebase CLI 已安装
echo.

echo 步骤 2: 登录 Firebase
echo 即将打开浏览器进行登录...
call firebase login

echo.
echo 步骤 3: 部署安全规则
echo 正在部署 Firestore 和 Storage 规则...
call firebase deploy --only firestore:rules,storage:rules

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 请访问 Firebase Console 验证规则：
echo - Firestore: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
echo - Storage: https://console.firebase.google.com/project/YOUR_PROJECT/storage/rules
echo.
pause
