import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get single article
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const article = await Article.findById(params.id)
      .populate('author', 'username')
      .populate('versions.editor', 'username')
      .lean();

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Error fetching article:', error);
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, tags, changeDescription, locked } = await request.json();

    await connectDB();

    const article = await Article.findById(params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if article is locked and user is not an editor
    if (article.locked && session.user.role !== 'editor') {
      return NextResponse.json(
        { error: 'This article is locked and can only be edited by editors' },
        { status: 403 }
      );
    }

    // Check if user has permission to edit
    const isAuthor = article.author.toString() === session.user.id;
    const isEditor = session.user.role === 'editor';

    if (!isAuthor && !isEditor) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this article' },
        { status: 403 }
      );
    }

    // Update article
    if (title) article.title = title;
    if (content) {
      article.content = content;
      article.set('editor', session.user.id);
      article.set('changeDescription', changeDescription);
    }
    if (tags) article.tags = tags;

    // Only editors can lock/unlock articles
    if (typeof locked === 'boolean' && isEditor) {
      article.locked = locked;
    }

    await article.save();

    const updatedArticle = await Article.findById(params.id)
      .populate('author', 'username')
      .populate('versions.editor', 'username')
      .lean();

    return NextResponse.json(updatedArticle);
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
    if (!session?.user) {
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

    // Check if user has permission to delete
    const isAuthor = article.author.toString() === session.user.id;
    const isEditor = session.user.role === 'editor';

    if (!isAuthor && !isEditor) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this article' },
        { status: 403 }
      );
    }

    await article.deleteOne();

    return NextResponse.json(
      { message: 'Article deleted successfully' }
    );
  } catch (error: any) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 