import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import mongoose from 'mongoose';

const DEFAULT_CHANGE_DESCRIPTION = 'Updated article content';

// Get single article
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const _params = await params;
    const articleId = await _params.id;

    const article = await Article.findById(articleId)
      .populate('author', 'username')
      .populate('versions.editor', 'username');
    console.log("find article: ", article);
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
    const _params = await params;
    const articleId = await _params.id;
    console.log('Article ID:', articleId);

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

    const article = await Article.findById(articleId);
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


    // Add new version if content changed
    if (content && content !== article.content) {
      console.log('Content changed, creating new version');
      const newVersion = {
        content,
        editor: new mongoose.Types.ObjectId(session.user.id),
        editedAt: new Date(),
        changeDescription: changeDescription || DEFAULT_CHANGE_DESCRIPTION,
      };
      console.log('New version:', newVersion);
      article.versions.push(newVersion);
      article.currentVersion = article.versions.length - 1;
    }

    // Update article
    if (title) article.title = title;
    if (content) article.content = content;
    if (tags) article.tags = tags;

    // Ensure all versions have editor information
    article.versions = article.versions.map((version: {
      content: string;
      editor: mongoose.Types.ObjectId | null;
      editedAt: Date;
      changeDescription?: string;
    }) => {
      if (!version.editor) {
        console.log('Found version with null editor, setting to current user:', session.user.id);
        return {
          ...version,
          editor: new mongoose.Types.ObjectId(session.user.id),
        };
      }
      return version;
    });

    // Populate editor information before saving
    await article.populate('versions.editor', 'username');

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
    const _params = await params;
    const articleId = await _params.id;

    const article = await Article.findById(articleId);

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