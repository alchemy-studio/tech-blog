import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('Starting GET /api/articles');
    const { searchParams } = new URL(request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

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

    console.log('Executing query:', query);
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

    console.log(`Found ${articles.length} articles`);

    // Ensure each article has an author with a username
    const processedArticles = articles.map(article => ({
      ...article,
      author: {
        username: article.author?.username || 'Unknown Author'
      }
    }));

    const total = await Article.countDocuments(query);
    console.log(`Total articles: ${total}`);

    return NextResponse.json({
      articles: processedArticles,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error in GET /api/articles:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST /api/articles');
    console.log('Checking session...');
    const session = await getServerSession(authOptions);
    console.log('Session details:', {
      exists: !!session,
      user: session?.user,
      role: session?.user?.role,
      id: session?.user?.id
    });
    
    if (!session?.user) {
      console.log('No session found, returning unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { title, content, tags } = body;

    if (!title || !content) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    console.log('Creating new article...');
    const article = await Article.create({
      title,
      content,
      tags: tags || [],
      author: new mongoose.Types.ObjectId(session.user.id),
      status: 'published',
      versions: [{
        content,
        editor: new mongoose.Types.ObjectId(session.user.id),
        editedAt: new Date(),
        changeDescription: 'Initial version',
      }],
    });
    console.log('Article created successfully:', article._id);

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/articles:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 