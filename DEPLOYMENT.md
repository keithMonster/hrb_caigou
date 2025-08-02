# 部署到 Vercel 指南

本项目已配置好 Vercel 部署所需的文件，可以通过以下方式部署：

## 方法一：通过 Vercel 网站部署（推荐）

1. 访问 [Vercel 官网](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入此 GitHub 仓库
5. Vercel 会自动检测到这是一个 Vite 项目并配置构建设置
6. 点击 "Deploy" 开始部署

## 方法二：通过 Vercel CLI 部署

1. 确保已安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```

2. 登录 Vercel：
   ```bash
   vercel login
   ```

3. 在项目根目录运行：
   ```bash
   vercel
   ```

4. 按照提示完成部署配置

## 项目配置说明

- `vercel.json`：Vercel 部署配置文件
- `package.json`：包含 `build` 脚本用于构建项目
- 构建输出目录：`dist`

## 构建命令

```bash
npm run build
```

构建完成后，`dist` 目录包含所有静态文件，可以部署到任何静态托管服务。

## 注意事项

- 项目使用 Vite 构建工具
- 支持 React 18 和 Ant Design 5
- 所有路由都会重定向到 `index.html`（SPA 配置）