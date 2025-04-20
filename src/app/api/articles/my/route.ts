import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

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

    const articles = await Article.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .select('title status createdAt')
      .lean();

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Error fetching user articles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 