import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await context.params;
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // 检查用户是否已经投过票
    if (question.voters?.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'You have already voted for this question' },
        { status: 400 }
      );
    }

    // 更新投票
    question.votes = (question.votes || 0) + 1;
    question.voters = question.voters || [];
    question.voters.push(session.user.id);
    await question.save();

    return NextResponse.json({ success: true, votes: question.votes });
  } catch (error) {
    console.error('Error voting for question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 