# 🔧 NameSilo DNS 配置详细操作指南

## 🎯 目标
将 sounflows.app 的DNS记录配置为正确指向 Vercel

## 📋 当前问题
- DNS查询返回 "Non-existent domain"
- 旧的DNS记录指向错误的IP地址: 216.198.79.1

## ✅ 正确的DNS配置
- **A记录**: @ → 76.76.19.19 (Vercel IP)  
- **CNAME记录**: www → cname.vercel-dns.com

---

## 🚀 操作步骤

### 步骤1: 登录NameSilo
1. 打开浏览器访问: https://www.namesilo.com
2. 点击右上角 **Login** 按钮
3. 输入您的用户名和密码登录

### 步骤2: 进入域名管理
1. 登录成功后，点击顶部菜单 **Domain Manager**
2. 在域名列表中找到 `sounflows.app`
3. 点击域名左侧的蓝色球状图标 🌐 (DNS管理)

### 步骤3: 进入DNS记录设置
1. 进入DNS管理页面后，您会看到当前的DNS记录列表
2. 页面标题应显示 "DNS Records for sounflows.app"

### 步骤4: 删除错误的DNS记录
**⚠️ 重要**: 删除以下所有现有记录：

**需要删除的记录类型**:
- [ ] 任何A记录指向 `216.198.79.1` 
- [ ] 旧的CNAME记录
- [ ] URL重定向记录  
- [ ] 任何其他指向错误地址的记录

**NameSilo删除方法**:
- 找到要删除的记录行
- 点击记录右侧的红色 **Delete** 按钮
- 在弹出确认框中点击 **Yes** 确认删除

### 步骤5: 添加正确的DNS记录

**记录1 - 主域名A记录**:
```
Type: A
Hostname: (留空 或 @)
IPv4 Address: 76.76.19.19
TTL: 3600 (1小时)
```

**记录2 - WWW子域名CNAME记录**:
```
Type: CNAME
Hostname: www
Target Hostname: cname.vercel-dns.com
TTL: 3600 (1小时)
```

**NameSilo添加方法**:
1. 在页面底部找到 **Add/Edit a Resource Record** 部分
2. 选择记录类型下拉菜单选择 **A** 
3. Hostname 留空（表示主域名@）
4. IPv4 Address 填入：`76.76.19.19`
5. TTL 选择：`3600`
6. 点击 **SUBMIT** 按钮添加记录
7. 重复步骤2-6，第二次选择 **CNAME** 类型，Hostname填 `www`，Target填 `cname.vercel-dns.com`

### 步骤6: 确认DNS记录生效
1. 添加完成后，在DNS记录列表中确认看到：
   - A记录：主域名 → 76.76.19.19
   - CNAME记录：www → cname.vercel-dns.com
2. NameSilo的DNS更改通常立即生效
3. DNS传播到全球需要5分钟-2小时

---

## 🔍 配置验证检查单

### ✅ 删除检查
- [ ] 已删除指向 216.198.79.1 的A记录
- [ ] 已删除所有旧的CNAME记录
- [ ] 已删除URL Redirect记录
- [ ] DNS记录列表已清空

### ✅ 添加检查  
- [ ] A记录: @ → 76.76.19.19 ✓
- [ ] CNAME记录: www → cname.vercel-dns.com ✓
- [ ] 两条记录状态显示正常
- [ ] 已点击Save Changes保存

### ✅ 最终配置应该显示为:
```
Type     Hostname    Target/Value              TTL
A        (空)        76.76.19.19              3600
CNAME    www         cname.vercel-dns.com      3600
```

---

## ⏰ DNS传播时间
- **NameSilo更新**: 立即生效（几分钟内）
- **全球DNS传播**: 5分钟-2小时
- **完全传播**: 最长24小时

---

## 🧪 测试和验证

### 在线DNS传播检查
1. 访问: https://whatsmydns.net
2. 输入: `sounflows.app` 
3. 选择: `A` 记录类型
4. 点击搜索
5. **成功标志**: 全球显示 `76.76.19.19`

### 本地命令行测试
打开命令提示符，运行以下命令:

```cmd
# 测试DNS解析
nslookup sounflows.app

# 期望结果: 显示 76.76.19.19
```

### 网站访问测试
1. 等待DNS传播完成后
2. 访问: https://sounflows.app
3. **成功标志**: 网站正常加载，显示声音疗愈应用

---

## 🚨 NameSilo常见问题排查

### Q1: 找不到DNS管理入口
**解决**: 
- 确保在 Domain Manager 页面
- 点击域名左侧的蓝色球状图标 🌐
- 或点击域名名称进入详情页

### Q2: DNS记录保存后仍显示旧IP
**解决**: 清除本地DNS缓存
```cmd
# Windows命令
ipconfig /flushdns
```

### Q3: 提示"无法添加记录"
**检查项**:
1. 确保已删除冲突的旧记录
2. IP地址格式正确: 76.76.19.19
3. CNAME目标不要包含协议 (只填 cname.vercel-dns.com)

### Q4: 只有主域名工作，www不工作
**解决**: 检查CNAME记录
- Type: `CNAME`
- Hostname: `www`  
- Target: `cname.vercel-dns.com`

---

## 📞 技术支持
如果遇到问题:
1. **NameSilo客服**: https://www.namesilo.com/support/
2. **Vercel文档**: https://vercel.com/docs/concepts/projects/domains
3. **DNS检测工具**: https://dnschecker.org/

---

## ✅ 完成确认

DNS配置完成后，请确认:
- [ ] sounflows.app 解析到 76.76.19.19
- [ ] www.sounflows.app 解析正常  
- [ ] 网站 https://sounflows.app 可以访问
- [ ] 音频播放功能正常

**🎉 配置成功后，您的声音疗愈网站将重新上线！**