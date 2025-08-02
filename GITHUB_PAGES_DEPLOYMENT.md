# GitHub Pages 部署指南

本项目已配置为自动部署到 GitHub Pages。

## 自动部署设置

### 1. GitHub Actions 工作流

项目包含 `.github/workflows/deploy.yml` 文件，该文件配置了自动构建和部署流程：

- **触发条件**: 推送到 `main` 分支时自动触发
- **构建环境**: Ubuntu 最新版本，Node.js 18
- **部署目标**: GitHub Pages

### 2. Vite 配置

`vite.config.js` 已配置正确的基础路径：
```javascript
base: '/hrb_caigou/'
```

## 部署步骤

### 1. 在 GitHub 上创建仓库

1. 登录 GitHub
2. 创建新仓库，命名为 `hrb_caigou`
3. 不要初始化 README、.gitignore 或 license

### 2. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/你的用户名/hrb_caigou.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 推送到 main 分支
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 保存设置

### 4. 等待部署完成

- 推送代码后，GitHub Actions 会自动开始构建
- 可以在 **Actions** 标签页查看构建进度
- 构建成功后，网站将在几分钟内可用

## 访问网站

部署完成后，可以通过以下地址访问：
```
https://你的用户名.github.io/hrb_caigou/
```

## 更新网站

每次推送到 `main` 分支时，网站会自动重新构建和部署。

## 故障排除

### 构建失败
1. 检查 **Actions** 标签页的错误日志
2. 确保所有依赖都在 `package.json` 中正确声明
3. 本地运行 `npm run build` 确保构建成功

### 页面显示空白
1. 检查浏览器控制台的错误信息
2. 确认 `vite.config.js` 中的 `base` 路径正确
3. 确认 GitHub Pages 设置正确

### 静态资源加载失败（404 错误）
1. 检查网络标签页的 404 错误
2. 确认资源路径是否正确
3. 清除浏览器缓存后重试
4. 如果看到类似 `GET https://用户名.github.io/src/main.jsx net::ERR_ABORTED 404` 的错误：
   - 这通常是 `vite.config.js` 中的路径配置问题
   - 确保 `resolve.alias` 使用正确的路径解析
   - 重新构建并部署项目

## 注意事项

- GitHub Pages 有使用限制（每月 100GB 带宽，1GB 存储）
- 部署可能需要几分钟时间生效
- 确保仓库是公开的（私有仓库需要 GitHub Pro）