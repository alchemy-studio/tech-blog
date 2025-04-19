import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 临时返回模拟数据
    const mockQuestions = Array.from({ length: limit }, (_, i) => ({
      _id: `question-${i + 1}`,
      title: `示例问题 ${i + 1}`,
      content: '这是一个示例问题的内容，描述了一个技术相关的问题...',
      author: {
        username: '示例用户'
      },
      createdAt: new Date().toISOString(),
      answers: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
        _id: `answer-${i}-${j}`,
        content: '这是一个示例回答...',
        author: {
          username: `回答者 ${j + 1}`
        },
        createdAt: new Date().toISOString()
      }))
    }));

    return NextResponse.json({
      questions: mockQuestions,
      total: mockQuestions.length,
      currentPage: 1,
      totalPages: 1
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 