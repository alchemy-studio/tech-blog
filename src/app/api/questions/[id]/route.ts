import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get single question
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const _params = await params;
    const questionId = await _params.id;

    const question = await Question.findById(questionId)
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .lean();

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error: any) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update question
export async function PUT(
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

    const { title, content, tags } = await request.json();
    const _params = await params;
    const questionId = await _params.id;

    await connectDB();

    const question = await Question.findById(questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if user is author or editor
    if (
      question.author.toString() !== session.user.id &&
      session.user.role !== 'editor'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update question
    if (title) question.title = title;
    if (content) question.content = content;
    if (tags) question.tags = tags;

    await question.save();

    const updatedQuestion = await Question.findById(questionId)
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .lean();

    return NextResponse.json(updatedQuestion);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete question
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    await question.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
