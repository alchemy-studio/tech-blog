import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Add answer to question
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Answer content is required' },
        { status: 400 }
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

    question.answers.push({
      content,
      author: session.user.id,
      votes: 0,
      isAccepted: false,
    });

    await question.save();

    const updatedQuestion = await Question.findById(params.id)
      .populate('author', 'username')
      .populate('answers.author', 'username');

    return NextResponse.json(updatedQuestion, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 