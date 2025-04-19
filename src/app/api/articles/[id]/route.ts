import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import mongoose from 'mongoose';

// Get single article
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const article = await Article.findById(params.id)
      .populate('author', 'username')
      .populate('versions.editor', 'username');

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update article
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting article update...');
    console.log('Article ID:', params.id);

    const session = await getServerSession(authOptions);
    console.log('Session in API route:', {
      exists: !!session,
      user: session?.user,
      role: session?.user?.role,
      id: session?.user?.id
    });

    if (!session?.user) {
      console.log('No valid session found in API route');
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    const { title, content, tags, changeDescription } = await request.json();
    console.log('Update data:', { title, content, tags, changeDescription });

    await connectDB();
    console.log('Database connected');

    const article = await Article.findById(params.id);
    console.log('Found article:', {
      id: article?._id,
      author: article?.author,
      title: article?.title
    });

    if (!article) {
      console.log('Article not found');
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if user is author or editor
    const isAuthor = article.author.toString() === session.user.id;
    const isEditor = session.user.role === 'editor';
    console.log('Permission check:', { 
      isAuthor, 
      isEditor, 
      userId: session.user.id, 
      authorId: article.author.toString(),
      userRole: session.user.role
    });

    if (!isAuthor && !isEditor) {
      console.log('User not authorized:', {
        userId: session.user.id,
        authorId: article.author.toString(),
        userRole: session.user.role
      });
      return NextResponse.json(
        { error: 'Unauthorized - Insufficient permissions' },
        { status: 401 }
      );
    }

    // Update article
    if (title) article.title = title;
    if (content) article.content = content;
    if (tags) article.tags = tags;

    // Add new version if content changed
    if (content && content !== article.content) {
      console.log('Content changed, creating new version');
      const newVersion = {
        content,
        editor: new mongoose.Types.ObjectId(session.user.id),
        editedAt: new Date(),
        changeDescription: changeDescription || 'Updated article content',
      };
      console.log('New version:', newVersion);
      article.versions.push(newVersion);
      article.currentVersion = article.versions.length - 1;
    }

    // Ensure all versions have editor information
    article.versions = article.versions.map((version: {
      content: string;
      editor: mongoose.Types.ObjectId | null;
      editedAt: Date;
      changeDescription?: string;
    }) => ({
      ...version,
      editor: version.editor || new mongoose.Types.ObjectId(session.user.id),
    }));

    console.log('Saving article...');
    await article.save();
    console.log('Article saved successfully');

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete article
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const article = await Article.findById(params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if user is author or editor
    const isAuthor = article.author.toString() === session.user.id;
    const isEditor = session.user.role === 'editor';

    if (!isAuthor && !isEditor) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await article.deleteOne();

    return NextResponse.json(
      { message: 'Article deleted successfully' }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 