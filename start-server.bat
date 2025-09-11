@echo off
echo =================================
echo     声音疗愈应用本地服务器
echo =================================
echo.
echo 正在启动本地HTTP服务器...
echo 服务器地址: http://localhost:8000
echo 按 Ctrl+C 停止服务器
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Python启动服务器...
    python -m http.server 8000
) else (
    REM 检查Node.js是否安装
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo Python未找到，检查是否有Node.js...
        npx --version >nul 2>&1
        if %errorlevel% equ 0 (
            echo 使用Node.js http-server启动服务器...
            npx http-server -p 8000
        ) else (
            echo 尝试安装并使用http-server...
            npm install -g http-server
            http-server -p 8000
        )
    ) else (
        echo.
        echo ❌ 错误: 未找到Python或Node.js
        echo.
        echo 请安装以下任一软件:
        echo 1. Python 3.x (推荐): https://python.org
        echo 2. Node.js: https://nodejs.org
        echo.
        echo 或者使用方法2直接修改HTML文件
        pause
    )
)