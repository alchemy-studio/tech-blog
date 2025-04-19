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
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'editor',
    });

    const user1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123',
      role: 'user',
    });

    // Create articles
    const articles = await Article.create([
      {
        title: 'Getting Started with Next.js',
        content: '# Getting Started with Next.js\n\nNext.js is a powerful React framework...',
        author: admin._id,
        tags: ['Next.js', 'React', 'Web Development'],
        status: 'published',
        versions: [{
          content: '# Getting Started with Next.js\n\nNext.js is a powerful React framework...',
          editor: admin._id,
          editedAt: new Date(),
          changeDescription: 'Initial version',
        }],
      },
      {
        title: 'Understanding TypeScript',
        content: '# Understanding TypeScript\n\nTypeScript adds static typing to JavaScript...',
        author: admin._id,
        tags: ['TypeScript', 'JavaScript', 'Programming'],
        status: 'published',
        versions: [{
          content: '# Understanding TypeScript\n\nTypeScript adds static typing to JavaScript...',
          editor: admin._id,
          editedAt: new Date(),
          changeDescription: 'Initial version',
        }],
      },
    ]);

    // Create questions
    const questions = await Question.create([
      {
        title: 'How to handle authentication in Next.js?',
        content: 'I am building a Next.js application and need help with authentication...',
        author: user1._id,
        tags: ['Next.js', 'Authentication', 'Web Development'],
      },
      {
        title: 'Best practices for TypeScript interfaces',
        content: 'What are the best practices for creating and using TypeScript interfaces?',
        author: admin._id,
        tags: ['TypeScript', 'Programming', 'Best Practices'],
      },
    ]);

    // Create answers
    await Answer.create([
      {
        content: 'You can use NextAuth.js for easy authentication integration...',
        author: admin._id,
        question: questions[0]._id,
      },
      {
        content: 'For TypeScript interfaces, you should follow these principles...',
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