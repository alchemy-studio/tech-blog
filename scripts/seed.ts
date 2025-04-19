import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Article from '../src/models/Article';
import Question from '../src/models/Question';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 清除现有数据
    await User.deleteMany({});
    await Article.deleteMany({});
    await Question.deleteMany({});

    // 创建用户
    const user = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'editor',
    });

    // 创建文章
    const articles = await Article.create([
      {
        title: '使用 Next.js 13 构建现代 Web 应用',
        content: `
# 使用 Next.js 13 构建现代 Web 应用

Next.js 13 带来了许多激动人心的新特性，包括：

- App Router
- React Server Components
- 改进的数据获取
- 内置的 SEO 优化

## 为什么选择 Next.js？

Next.js 提供了优秀的开发者体验和性能优化...`,
        author: user._id,
        tags: ['Next.js', 'React', 'Web开发'],
        status: 'published',
      },
      {
        title: 'MongoDB 最佳实践指南',
        content: `
# MongoDB 最佳实践指南

MongoDB 是一个流行的 NoSQL 数据库，本文将介绍一些最佳实践：

## 1. 正确的索引策略

- 为常用查询创建索引
- 避免过多索引
- 监控索引使用情况

## 2. 数据模型设计

选择适当的数据模型对性能至关重要...`,
        author: user._id,
        tags: ['MongoDB', '数据库', '性能优化'],
        status: 'published',
      },
      {
        title: 'TypeScript 高级技巧',
        content: `
# TypeScript 高级技巧

TypeScript 提供了强大的类型系统，让我们看看一些高级用法：

## 泛型

泛型是 TypeScript 最强大的特性之一...

## 条件类型

条件类型让我们能够基于类型关系创建新的类型...`,
        author: user._id,
        tags: ['TypeScript', '编程语言', '前端开发'],
        status: 'published',
      },
    ]);

    // 创建问题
    const questions = await Question.create([
      {
        title: '如何在 Next.js 中实现 SSR？',
        content: '我正在使用 Next.js 开发一个应用，想了解如何正确实现服务器端渲染...',
        author: user._id,
        tags: ['Next.js', 'React', 'SSR'],
      },
      {
        title: 'MongoDB 索引优化策略',
        content: '在处理大量数据时，MongoDB 的查询性能变得很慢，如何通过索引优化？',
        author: user._id,
        tags: ['MongoDB', '数据库', '性能优化'],
      },
    ]);

    console.log('Database seeded successfully');
    console.log(`Created ${articles.length} articles`);
    console.log(`Created ${questions.length} questions`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase(); 