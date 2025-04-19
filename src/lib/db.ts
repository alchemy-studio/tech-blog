import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('请在环境变量中设置 MONGODB_URI');
}

export async function connectDB() {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI);
    
    if (connection.readyState === 1) {
      console.log('MongoDB 连接成功');
      return;
    }
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    throw error;
  }
} 