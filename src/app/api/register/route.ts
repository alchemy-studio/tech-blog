import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // 验证请求数据
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请提供所有必需的字段' },
        { status: 400 }
      );
    }

    await connectDB();

    try {
      // 创建新用户
      const user = await User.create({
        username,
        email,
        password,
        role: 'user',
      });

      // 返回成功响应，不包含密码
      return NextResponse.json(
        {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      // 处理验证错误
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(
          (err: any) => err.message
        );
        return NextResponse.json(
          { error: validationErrors.join(', ') },
          { status: 400 }
        );
      }

      // 处理重复键错误
      if (error.name === 'MongoServerError' && error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return NextResponse.json(
          { error: `${field === 'username' ? '用户名' : '邮箱'}已被使用` },
          { status: 400 }
        );
      }

      // 其他错误
      console.error('注册错误:', error);
      return NextResponse.json(
        { error: '注册过程中发生错误' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('注册请求处理错误:', error);
    return NextResponse.json(
      { error: '处理注册请求时发生错误' },
      { status: 500 }
    );
  }
} 