@echo off
title DNS配置验证测试 - sounflows.app
color 0A
echo ================================================
echo 🔍 DNS修复验证测试 - sounflows.app
echo ================================================
echo.

echo 📡 步骤1: 检查主域名DNS解析...
echo ✅ 期望结果: 应该显示 76.76.19.19
nslookup sounflows.app
echo.
echo ------------------------------------------------

echo 📡 步骤2: 检查WWW子域名DNS解析...
echo ✅ 期望结果: 应该显示 CNAME 记录
nslookup www.sounflows.app
echo.
echo ------------------------------------------------

echo 📡 步骤3: 测试主域名HTTP连接...
echo ✅ 期望结果: HTTP 200 或重定向到HTTPS
curl -I http://sounflows.app --connect-timeout 10
echo.
echo ------------------------------------------------

echo 📡 步骤4: 测试主域名HTTPS连接...
echo ✅ 期望结果: HTTP 200 成功响应
curl -I https://sounflows.app --connect-timeout 10 -k
echo.
echo ------------------------------------------------

echo 📡 步骤5: 测试WWW子域名HTTPS连接...
echo ✅ 期望结果: HTTP 200 成功响应
curl -I https://www.sounflows.app --connect-timeout 10 -k
echo.
echo ------------------------------------------------

echo 📡 步骤6: 清除本地DNS缓存...
ipconfig /flushdns
echo DNS缓存已清除
echo.

echo ================================================
echo 🎯 DNS配置验证结果分析:
echo ================================================
echo ✅ 如果DNS解析显示 216.198.79.1 = 成功
echo ✅ 如果HTTP/HTTPS返回 200 状态 = 网站已恢复
echo ❌ 如果仍显示错误 = 需要等待DNS传播或重新检查配置
echo.
echo 📝 如果测试失败，请：
echo 1. 确认DNS记录已正确保存在Namecheap
echo 2. 等待30分钟后重新运行此测试
echo 3. 检查 DNS-CONFIG-GUIDE.md 获取详细指导
echo.
echo ================================================
pause