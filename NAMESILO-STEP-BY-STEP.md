# 🎯 NameSilo DNS配置 - 分步骤图解指南

## 🚀 开始之前
**您需要的信息**：
- ✅ NameSilo账户用户名/密码
- ✅ 要配置的域名：`sounflows.app`
- ✅ Vercel IP地址：`76.76.19.19`
- ✅ CNAME目标：`cname.vercel-dns.com`

---

## 📋 第1步：打开NameSilo并登录

### 1.1 访问网站
在浏览器地址栏输入：`https://www.namesilo.com`

### 1.2 登录账户
1. 点击页面右上角的 **"Login"** 按钮
2. 输入您的用户名和密码
3. 点击 **"Login"** 完成登录

**🎯 成功标志**: 登录后会跳转到账户首页

---

## 📋 第2步：进入域名管理

### 2.1 找到域名管理
在顶部菜单栏找到并点击 **"Domain Manager"**

### 2.2 找到您的域名
在域名列表中找到 `sounflows.app`

### 2.3 进入DNS管理
**关键操作**: 点击 `sounflows.app` 左侧的 **蓝色球状图标** 🌐

**🎯 成功标志**: 页面标题变为 "DNS Records for sounflows.app"

---

## 📋 第3步：删除旧的DNS记录

### 3.1 识别需要删除的记录
找到以下类型的记录并删除：
- [ ] A记录指向 `216.198.79.1` 
- [ ] 旧的CNAME记录
- [ ] URL重定向记录
- [ ] 任何其他错误的记录

### 3.2 删除操作
对于每个要删除的记录：
1. 找到记录行
2. 点击该行右侧的红色 **"Delete"** 按钮
3. 在弹出的确认框中点击 **"Yes"** 确认删除

**🎯 完成标志**: 旧记录已从列表中消失

---

## 📋 第4步：添加新的DNS记录

### 4.1 找到添加记录区域
滚动到页面底部，找到 **"Add/Edit a Resource Record"** 区域

### 4.2 添加A记录（主域名）

**填写表单**：
```
1. Type: 选择 "A" 
2. Hostname: 留空（不填任何内容）
3. IPv4 Address: 76.76.19.19
4. TTL: 3600
```

**提交记录**：
点击 **"SUBMIT"** 按钮

**🎯 成功标志**: A记录出现在DNS记录列表中

### 4.3 添加CNAME记录（www子域名）

**填写表单**：
```
1. Type: 选择 "CNAME"
2. Hostname: www
3. Target Hostname: cname.vercel-dns.com
4. TTL: 3600
```

**提交记录**：
点击 **"SUBMIT"** 按钮

**🎯 成功标志**: CNAME记录出现在DNS记录列表中

---

## 📋 第5步：验证配置结果

### 5.1 检查DNS记录列表
确认页面上显示以下记录：

```
Type     Hostname    Target/Value              TTL
A        (空白)      76.76.19.19              3600
CNAME    www         cname.vercel-dns.com      3600
```

### 5.2 等待DNS传播
- **NameSilo更新**: 立即生效（1-5分钟）
- **全球DNS传播**: 5分钟-2小时

---

## 📋 第6步：测试验证

### 6.1 运行测试脚本
在您的电脑上双击运行：`dns-test.bat`

### 6.2 检查测试结果
**成功的结果应该显示**：
```
✅ DNS解析: sounflows.app → 76.76.19.19
✅ HTTP连接: 200 OK 响应
✅ HTTPS连接: 200 OK 响应
✅ www子域名: 正常工作
```

### 6.3 访问网站
在浏览器中访问：`https://sounflows.app`

**🎯 最终成功标志**: 声音疗愈网站正常加载并可以播放音频

---

## 🚨 常见问题快速解决

### Q1: 找不到蓝色球状图标 🌐
**解决**: 
- 确保在 "Domain Manager" 页面
- 蓝色图标在域名左侧，可能需要水平滚动才能看到

### Q2: 提示"Record already exists"
**解决**: 
- 先删除冲突的旧记录
- 确保没有重复添加相同类型的记录

### Q3: DNS测试仍然失败
**解决**: 
```cmd
# 清除本地DNS缓存
ipconfig /flushdns

# 等待30分钟后重新测试
```

### Q4: 只能访问www.sounflows.app但不能访问sounflows.app
**检查**: A记录的Hostname是否留空

---

## 📞 紧急联系

如果遇到技术问题：
- **NameSilo客服**: https://www.namesilo.com/support/
- **DNS检测工具**: https://whatsmydns.net
- **Vercel域名文档**: https://vercel.com/docs/concepts/projects/domains

---

## ✅ 完成检查单

配置完成后请确认：
- [ ] 已删除所有旧的DNS记录
- [ ] A记录: (空) → 76.76.19.19 ✓
- [ ] CNAME记录: www → cname.vercel-dns.com ✓  
- [ ] DNS测试脚本通过 ✓
- [ ] https://sounflows.app 可正常访问 ✓
- [ ] 音频播放功能正常 ✓

**🎉 完成后，您的声音疗愈网站将重新上线！**