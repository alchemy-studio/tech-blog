import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 连接数据库
    await connectDB();

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: '用户名已被使用' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: '邮箱已被注册' },
        { status: 400 }
      );
    }

    // 创建新用户，直接存储明文密码
    const newUser = await User.create({
      username,
      email,
      password, // 直接存储明文密码
      role: 'user', // 默认角色
    });

    // 移除密码字段
    const user = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    return NextResponse.json(
      { message: '注册成功', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { message: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
} 