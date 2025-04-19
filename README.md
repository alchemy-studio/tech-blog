# Tech Blog

一个现代化的技术社区平台，提供技术文章发布和问答功能。

## 功能特点

- 📝 技术文章管理
  - 支持 Markdown 编辑
  - 文章版本控制
  - 标签分类
  - 搜索功能

- 💬 问答系统
  - 提问和回答
  - 最佳答案标记
  - 标签分类
  - 搜索功能

- 👥 用户系统
  - 用户注册和登录
  - 角色管理（普通用户/编辑）
  - 个人仪表盘

## 技术栈

- **前端框架**: Next.js 13+ (App Router)
- **UI 框架**: Tailwind CSS
- **数据库**: MongoDB
- **认证**: NextAuth.js
- **编辑器**: React MD Editor
- **包管理**: pnpm

## 系统要求

- Node.js >= 18.12
- MongoDB >= 4.4
- Docker (可选，用于运行数据库)

## 本地开发环境设置

### 1. Node.js 环境

确保你的系统安装了正确版本的 Node.js：

```bash
# 使用 nvm 安装并切换到 LTS 版本
nvm install --lts
nvm use --lts

# 验证 Node.js 版本 (需要 >= 18.12)
node --version
```

### 2. 安装依赖

```bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 数据库配置

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: tech_blog_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=tech_blog

volumes:
  mongodb_data:
```

启动 MongoDB：

```bash
# 启动数据库
docker-compose up -d

# 验证数据库状态
docker ps
```

### 4. 环境变量配置

创建 `.env` 文件：

```env
MONGODB_URI=mongodb://localhost:27017/tech_blog
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 5. 初始化示例数据

```bash
# 安装 tsx (如果尚未安装)
pnpm add -D tsx

# 运行数据库种子脚本
pnpm run seed
```

这将创建：
- 示例用户（普通用户和编辑）
- 示例文章
- 示例问答

### 6. 启动开发服务器

```bash
# 启动 Next.js 开发服务器
pnpm dev
```

现在你可以访问：
- 网站首页：http://localhost:3000
- 文章列表：http://localhost:3000/articles
- 问答页面：http://localhost:3000/questions

### 7. 停止服务

```bash
# 停止 Next.js 服务器
按 Ctrl+C

# 停止并移除 MongoDB 容器
docker-compose down
```

## 项目结构

```
src/
  ├── app/              # Next.js 13 App Router 目录
  │   ├── (auth)/      # 认证相关页面
  │   ├── (main)/      # 主要页面
  │   └── api/         # API 路由
  ├── components/       # React 组件
  ├── lib/             # 工具函数和配置
  ├── models/          # MongoDB 模型
  └── types/           # TypeScript 类型定义
```

## 开发指南

### 文章系统

- 文章支持版本控制，每次编辑都会创建新版本
- 编辑可以审核和管理所有文章
- 普通用户只能管理自己的文章

### 问答系统

- 用户可以提问和回答问题
- 问题作者可以标记最佳答案
- 支持按标签筛选和搜索

### 用户角色

- 普通用户：发布文章、提问和回答
- 编辑：额外具有内容审核权限

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT
