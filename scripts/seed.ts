import mongoose from 'mongoose';
import User from '../src/models/User';
import Article from '../src/models/Article';
import Question from '../src/models/Question';
import Answer from '../src/models/Answer';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech_blog';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});

    // Create users
    const admin = await User.create({
      username: '管理员',
      email: 'admin@example.com',
      password: 'password123',
      role: 'editor',
    });

    const user1 = await User.create({
      username: '开发者小王',
      email: 'user1@example.com',
      password: 'password123',
      role: 'user',
    });

    // Create articles
    const articles = await Article.create([
      {
        title: 'Next.js 入门指南：从零开始构建现代 Web 应用',
        content: `Next.js 是一个强大的 React 框架，它提供了许多开箱即用的功能，让开发者能够快速构建现代化的 Web 应用。

## 为什么选择 Next.js？

1. 服务端渲染（SSR）支持
2. 静态站点生成（SSG）
3. 文件系统路由
4. API 路由
5. 内置 CSS 支持
6. 开发环境热重载

## 快速开始

1. 创建新项目：
\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

2. 运行开发服务器：
\`\`\`bash
cd my-app
npm run dev
\`\`\`

## 核心概念

- 页面（Pages）：基于文件系统的路由
- 组件（Components）：可复用的 UI 元素
- 数据获取：getStaticProps 和 getServerSideProps
- API 路由：创建后端 API 端点

## 最佳实践

1. 使用 TypeScript 进行类型检查
2. 实现响应式设计
3. 优化图片加载
4. 使用环境变量管理配置
5. 实现适当的错误处理

## 总结

Next.js 是一个功能强大且易于使用的框架，适合构建各种规模的 Web 应用。通过本文的介绍，你应该对 Next.js 有了基本的了解，可以开始构建你的第一个 Next.js 应用了。`,
        author: admin._id,
        tags: ['Next.js', 'React', 'Web开发', '前端'],
        status: 'published',
        versions: [{
          content: `Next.js 是一个强大的 React 框架，它提供了许多开箱即用的功能，让开发者能够快速构建现代化的 Web 应用。

## 为什么选择 Next.js？

1. 服务端渲染（SSR）支持
2. 静态站点生成（SSG）
3. 文件系统路由
4. API 路由
5. 内置 CSS 支持
6. 开发环境热重载

## 快速开始

1. 创建新项目：
\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

2. 运行开发服务器：
\`\`\`bash
cd my-app
npm run dev
\`\`\`

## 核心概念

- 页面（Pages）：基于文件系统的路由
- 组件（Components）：可复用的 UI 元素
- 数据获取：getStaticProps 和 getServerSideProps
- API 路由：创建后端 API 端点

## 最佳实践

1. 使用 TypeScript 进行类型检查
2. 实现响应式设计
3. 优化图片加载
4. 使用环境变量管理配置
5. 实现适当的错误处理

## 总结

Next.js 是一个功能强大且易于使用的框架，适合构建各种规模的 Web 应用。通过本文的介绍，你应该对 Next.js 有了基本的了解，可以开始构建你的第一个 Next.js 应用了。`,
          editor: admin._id,
          editedAt: new Date(),
          changeDescription: '初始版本',
        }],
      },
      {
        title: 'TypeScript 实战：从入门到精通',
        content: `TypeScript 是 JavaScript 的超集，它添加了静态类型检查，使代码更加健壮和可维护。

## TypeScript 的优势

1. 类型安全
2. 更好的 IDE 支持
3. 代码可读性更强
4. 更容易重构
5. 减少运行时错误

## 基础类型

\`\`\`typescript
// 基本类型
let name: string = '张三';
let age: number = 25;
let isStudent: boolean = true;

// 数组
let numbers: number[] = [1, 2, 3];
let names: string[] = ['张三', '李四'];

// 元组
let tuple: [string, number] = ['张三', 25];

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
\`\`\`

## 接口和类型

\`\`\`typescript
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
}

type Point = {
  x: number;
  y: number;
};
\`\`\`

## 泛型

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
\`\`\`

## 最佳实践

1. 使用严格的类型检查
2. 合理使用接口和类型
3. 避免使用 any 类型
4. 使用类型推断
5. 编写类型声明文件

## 总结

TypeScript 为 JavaScript 开发带来了类型安全，使代码更加健壮和可维护。通过本文的学习，你应该对 TypeScript 有了基本的了解，可以开始在实际项目中使用它了。`,
        author: admin._id,
        tags: ['TypeScript', 'JavaScript', '编程', '前端'],
        status: 'published',
        versions: [{
          content: `TypeScript 是 JavaScript 的超集，它添加了静态类型检查，使代码更加健壮和可维护。

## TypeScript 的优势

1. 类型安全
2. 更好的 IDE 支持
3. 代码可读性更强
4. 更容易重构
5. 减少运行时错误

## 基础类型

\`\`\`typescript
// 基本类型
let name: string = '张三';
let age: number = 25;
let isStudent: boolean = true;

// 数组
let numbers: number[] = [1, 2, 3];
let names: string[] = ['张三', '李四'];

// 元组
let tuple: [string, number] = ['张三', 25];

// 枚举
enum Color {
  Red,
  Green,
  Blue
}
\`\`\`

## 接口和类型

\`\`\`typescript
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
}

type Point = {
  x: number;
  y: number;
};
\`\`\`

## 泛型

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
\`\`\`

## 最佳实践

1. 使用严格的类型检查
2. 合理使用接口和类型
3. 避免使用 any 类型
4. 使用类型推断
5. 编写类型声明文件

## 总结

TypeScript 为 JavaScript 开发带来了类型安全，使代码更加健壮和可维护。通过本文的学习，你应该对 TypeScript 有了基本的了解，可以开始在实际项目中使用它了。`,
          editor: admin._id,
          editedAt: new Date(),
          changeDescription: '初始版本',
        }],
      },
    ]);

    // Create questions
    const questions = await Question.create([
      {
        title: '在 Next.js 中如何处理用户认证？',
        content: `我正在开发一个 Next.js 应用，需要实现用户认证功能。目前考虑使用 NextAuth.js，但不太确定具体如何实现。

主要需求：
1. 支持邮箱/密码登录
2. 支持第三方登录（如 GitHub、Google）
3. 保护特定路由
4. 管理用户会话

请问：
1. NextAuth.js 是否是最佳选择？
2. 如何配置和实现？
3. 有哪些需要注意的安全问题？
4. 如何处理 token 和 session？

希望能得到一些具体的实现建议和最佳实践。`,
        author: user1._id,
        tags: ['Next.js', '认证', 'Web开发', '安全'],
      },
      {
        title: 'TypeScript 接口的最佳实践是什么？',
        content: `我正在学习 TypeScript，对接口的使用有些困惑。想请教一下：

1. 什么时候应该使用接口而不是类型别名？
2. 如何设计良好的接口结构？
3. 如何处理可选属性和只读属性？
4. 接口继承和类型组合有什么区别？
5. 在实际项目中，如何平衡接口的灵活性和类型安全性？

希望能得到一些具体的例子和最佳实践建议。`,
        author: admin._id,
        tags: ['TypeScript', '编程', '最佳实践', '前端'],
      },
    ]);

    // Create answers
    await Answer.create([
      {
        content: `NextAuth.js 确实是 Next.js 应用认证的一个很好的选择。以下是一些具体建议：

1. 配置 NextAuth.js：
\`\`\`typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session(session, token) {
      session.user.id = token.id;
      return session;
    },
  },
});
\`\`\`

2. 保护路由：
\`\`\`typescript
// pages/protected.tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return <div>Protected Content</div>;
}
\`\`\`

3. 安全建议：
- 使用 HTTPS
- 设置适当的 session 过期时间
- 实现 CSRF 保护
- 使用安全的密码哈希算法
- 定期更新依赖包

4. 处理 token 和 session：
- 使用 JWT 存储用户信息
- 实现 token 刷新机制
- 在客户端安全存储 token
- 实现适当的错误处理

希望这些建议对你有所帮助！`,
        author: admin._id,
        question: questions[0]._id,
      },
      {
        content: `关于 TypeScript 接口的最佳实践，以下是一些建议：

1. 接口 vs 类型别名：
- 使用接口定义对象结构
- 使用类型别名定义联合类型、交叉类型等
- 接口支持声明合并，类型别名不支持

2. 接口设计原则：
\`\`\`typescript
// 好的接口设计
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 避免过度设计
interface User {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}
\`\`\`

3. 可选属性和只读属性：
\`\`\`typescript
interface Config {
  readonly apiKey: string;
  baseUrl: string;
  timeout?: number;
  retryCount?: number;
}
\`\`\`

4. 接口继承和类型组合：
\`\`\`typescript
// 接口继承
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 类型组合
type Pet = Animal & {
  owner: string;
};
\`\`\`

5. 平衡灵活性和类型安全：
- 使用泛型增加灵活性
- 使用类型守卫确保类型安全
- 避免过度使用 any 类型
- 使用类型推断减少冗余代码

希望这些建议对你有所帮助！`,
        author: user1._id,
        question: questions[1]._id,
      },
    ]);

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed(); 