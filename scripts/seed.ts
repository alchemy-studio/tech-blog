import { connect, disconnect } from 'mongoose';
import User from '../src/models/User';
import Article from '../src/models/Article';
import Question from '../src/models/Question';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seedUsers(): Promise<void> {
  try {
    await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Question.deleteMany({});

    // Create test users with plain text passwords
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'editor',
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
        role: 'user',
      },
    ]);

    console.log('Created test users');

    // Create test articles
    const articles = await Article.create([
      {
        title: '使用 Next.js 13 构建现代 Web 应用',
        content: '# Next.js 13 简介\n\nNext.js 13 带来了革命性的改变...',
        author: users[0]._id,
        tags: ['Next.js', 'React', 'Web Development'],
        status: 'published',
      },
      {
        title: 'MongoDB 最佳实践指南',
        content: '# MongoDB 性能优化\n\n本文将介绍 MongoDB 的各种优化技巧...',
        author: users[1]._id,
        tags: ['MongoDB', 'Database', 'Performance'],
        status: 'published',
      },
    ]);

    console.log('Created test articles');

    // Create test questions
    await Question.create([
      {
        title: '如何在 Next.js 中实现服务端渲染？',
        content: '我在使用 Next.js 开发项目时遇到了一些问题...',
        author: users[1]._id,
        tags: ['Next.js', 'SSR'],
        answers: [
          {
            content: '在 Next.js 13 中，你可以使用新的 App Router...',
            author: users[0]._id,
            votes: 5,
            isAccepted: true,
          },
        ],
      },
      {
        title: 'MongoDB 如何实现全文搜索？',
        content: '我需要在我的项目中实现一个搜索功能...',
        author: users[0]._id,
        tags: ['MongoDB', 'Search'],
        answers: [
          {
            content: 'MongoDB 提供了 $text 操作符来支持全文搜索...',
            author: users[1]._id,
            votes: 3,
            isAccepted: false,
          },
        ],
      },
    ]);

    console.log('Created test questions');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

seedUsers().catch(console.error); 