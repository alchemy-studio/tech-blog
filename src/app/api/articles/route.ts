import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 临时返回模拟数据
    const mockArticles = Array.from({ length: limit }, (_, i) => ({
      _id: `article-${i + 1}`,
      title: `示例文章 ${i + 1}`,
      content: '这是一篇示例文章的内容，展示了文章的基本格式和样式。这里可以包含很多技术相关的内容...',
      author: {
        username: '示例作者'
      },
      createdAt: new Date().toISOString(),
      tags: ['技术', 'Web开发', 'Next.js']
    }));

    return NextResponse.json({
      articles: mockArticles,
      total: mockArticles.length,
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