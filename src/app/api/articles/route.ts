import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';

    await connectDB();

    const query: any = { status: 'published' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;
    const articles = await Article.find(query)
      .populate({
        path: 'author',
        select: 'username',
        model: User
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ensure each article has an author with a username
    const processedArticles = articles.map(article => ({
      ...article,
      author: {
        username: article.author?.username || 'Unknown Author'
      }
    }));

    const total = await Article.countDocuments(query);

    return NextResponse.json({
      articles: processedArticles,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, tags } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const article = await Article.create({
      title,
      content,
      tags: tags || [],
      author: new mongoose.Types.ObjectId(session.user.id),
      versions: [{
        content,
        editor: new mongoose.Types.ObjectId(session.user.id),
        editedAt: new Date(),
        changeDescription: 'Initial version',
      }],
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 