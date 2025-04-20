import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const questions = await Question.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .select('title createdAt')
      .lean();

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error fetching user questions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 