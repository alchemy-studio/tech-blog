import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function POST(
  request: Request,
  context: { params: { id: string; answerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id, answerId } = await context.params;
    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json(
        { error: '问题不存在' },
        { status: 404 }
      );
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return NextResponse.json(
        { error: '回答不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已经投过票
    const hasVoted = answer.voters?.some(voter => voter.toString() === session.user.id);
    if (hasVoted) {
      return NextResponse.json(
        { error: '您已经投过票了' },
        { status: 400 }
      );
    }

    // 更新投票
    answer.votes = (answer.votes || 0) + 1;
    answer.voters = answer.voters || [];
    answer.voters.push(session.user.id);
    await question.save();

    return NextResponse.json({ 
      success: true, 
      votes: answer.votes,
      message: '投票成功'
    });
  } catch (error) {
    console.error('Error voting for answer:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 