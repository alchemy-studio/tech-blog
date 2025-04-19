# 使用 Node.js 20 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖（包括开发依赖）
RUN pnpm install

# 复制其余文件
COPY . .

# 设置环境变量
ENV MONGODB_URI=mongodb://mongodb:27017/tech_blog
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=your-secret-key-here
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 设置默认命令为生产模式
CMD ["pnpm", "start"] 