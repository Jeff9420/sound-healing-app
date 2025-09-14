# 🔄 GitHub to Vercel 自动部署集成设置指南

## 📋 **当前状态**

✅ **已完成的配置:**
- Vercel项目已创建并链接
- GitHub仓库已连接到Vercel
- 本地.vercel配置已生成
- GitHub Actions工作流已创建

## 🔧 **需要在GitHub中设置的Secrets**

为了启用GitHub Actions自动部署，需要在GitHub仓库中添加以下secrets：

### 🔑 **必需的Secrets**

在GitHub仓库设置中添加以下secrets (`Settings` -> `Secrets and variables` -> `Actions`):

1. **VERCEL_TOKEN**
   - 获取方式: 访问 [Vercel Token设置页面](https://vercel.com/account/tokens)
   - 创建一个新的token，命名如: "GitHub Actions Deploy"
   - 复制生成的token

2. **VERCEL_ORG_ID**
   - 值: `team_mFuK3Tf4gAoTZOZBOh6nbll2`
   - (从.vercel/project.json中的orgId获取)

3. **VERCEL_PROJECT_ID**
   - 值: `prj_ShUhdayMdkLyDAfVbFGqkpMTVpII`
   - (从.vercel/project.json中的projectId获取)

## 🚀 **自动部署工作流**

已创建的GitHub Actions工作流 (`.github/workflows/vercel-deploy.yml`) 将:

### 📥 **触发条件**
- ✅ Push到main分支 → 自动部署到生产环境
- ✅ 创建Pull Request → 自动部署到预览环境
- ✅ 合并Pull Request → 自动部署到生产环境

### 🔄 **部署流程**
1. 检出代码 (checkout)
2. 设置Node.js环境
3. 安装Vercel CLI
4. 根据触发事件部署到对应环境:
   - **Main分支**: 生产环境部署
   - **Pull Request**: 预览环境部署

## 🌐 **Vercel自动部署 (推荐)**

除了GitHub Actions，Vercel本身也提供内置的Git集成：

### ✅ **已启用的功能**
- **自动检测**: Vercel检测到GitHub推送后自动构建
- **分支部署**: 不同分支自动部署到不同环境
- **预览部署**: Pull Request自动生成预览链接

### 🔧 **Vercel Dashboard设置**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `sound-healing-app` 项目
3. 进入 `Settings` -> `Git`
4. 确认以下设置:
   - ✅ **Production Branch**: `main`
   - ✅ **Auto-deploy**: 启用
   - ✅ **Preview Deployments**: 启用

## 📱 **部署域名**

### 🌍 **当前可用域名**
- **主域名**: https://sound-healing-app.vercel.app
- **自定义域名**: https://soundflows.app (DNS传播中)

### 🔄 **部署流程示例**

```bash
# 本地开发完成后
git add .
git commit -m "Feature: Add new functionality"
git push origin main

# 自动触发:
# 1. GitHub Actions (如果配置了secrets)
# 2. Vercel自动部署 (内置Git集成)
```

## ✅ **验证自动部署**

### 🧪 **测试步骤**

1. **本地修改**: 对项目做一个小改动
2. **提交推送**: `git commit` + `git push`
3. **检查部署**:
   - GitHub Actions tab查看工作流状态
   - Vercel Dashboard查看部署日志
   - 访问域名验证更新

## 🔍 **故障排除**

### ❌ **常见问题**

1. **GitHub Actions失败**
   - 检查Secrets是否正确设置
   - 验证VERCEL_TOKEN是否有效

2. **Vercel部署失败**
   - 检查vercel.json配置
   - 查看Vercel Dashboard中的构建日志

3. **域名访问问题**
   - DNS传播可能需要24-72小时
   - 临时使用.vercel.app域名

## 📈 **优势**

### 🚀 **自动化部署的好处**
- ✅ **零手动操作**: Push代码即自动部署
- ✅ **多环境支持**: 生产/预览环境自动管理
- ✅ **即时反馈**: 部署状态实时通知
- ✅ **回滚支持**: 快速回滚到之前版本
- ✅ **团队协作**: 多人开发无冲突部署

### 📊 **当前状态**
- **GitHub仓库**: Jeff9420/sound-healing-app
- **Vercel项目**: sound-healing-app
- **集成状态**: ✅ 已连接并配置
- **下次推送**: 将自动触发部署

---

## 🎯 **下一步操作**

1. **设置GitHub Secrets** (按照上述指南)
2. **测试自动部署** (做一个小改动并推送)
3. **验证部署结果** (检查网站更新)

**配置完成后，每次推送到GitHub都会自动部署到Vercel！** 🎉<!-- Auto-deploy test: 2025年09月14日 20:08:26 -->
