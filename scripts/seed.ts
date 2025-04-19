import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Article from '../src/models/Article';
import Question from '../src/models/Question';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seedUsers(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Question.deleteMany({});

    // Create users
    const users = await User.create([
      {
        username: 'editor',
        email: 'editor@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'editor',
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      },
    ]);

    // Create articles
    const articles = await Article.create([
      {
        title: '理解 React 中的状态管理',
        content: '# React 状态管理\n\nReact 中的状态管理是一个重要的概念...',
        author: users[0]._id,
        tags: ['React', 'JavaScript', '前端开发'],
        status: 'published',
        versions: [{
          content: '# React 状态管理\n\nReact 中的状态管理是一个重要的概念...',
          editor: users[0]._id,
          editedAt: new Date(),
          changeDescription: '初始版本',
        }],
      },
      {
        title: 'TypeScript 高级类型指南',
        content: '# TypeScript 高级类型\n\n本文将介绍 TypeScript 中的高级类型...',
        author: users[1]._id,
        tags: ['TypeScript', '编程语言'],
        status: 'published',
        versions: [{
          content: '# TypeScript 高级类型\n\n本文将介绍 TypeScript 中的高级类型...',
          editor: users[1]._id,
          editedAt: new Date(),
          changeDescription: '初始版本',
        }],
      },
    ]);

    // Create questions
    await Question.create([
      {
        title: '如何在 Next.js 中实现 SSR？',
        content: '我正在使用 Next.js 开发一个应用，想了解如何正确实现服务器端渲染...',
        author: users[1]._id,
        tags: ['Next.js', 'React', 'SSR'],
      },
      {
        title: 'MongoDB 索引优化策略',
        content: '在处理大量数据时，MongoDB 的查询性能变得很慢，如何通过索引优化？',
        author: users[0]._id,
        tags: ['MongoDB', '数据库', '性能优化'],
      },
    ]);

    console.log('Sample data created successfully');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUsers().catch(console.error); 