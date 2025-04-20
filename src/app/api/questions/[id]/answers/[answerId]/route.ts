import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'editor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const answerIndex = question.answers.findIndex(
      (answer: any) => answer._id.toString() === params.answerId
    );

    if (answerIndex === -1) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }

    question.answers.splice(answerIndex, 1);
    await question.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 