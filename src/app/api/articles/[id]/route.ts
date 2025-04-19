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
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const article = await Article.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if user is author or editor
    if (article.author.toString() !== session.user.id && session.user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, tags, changeDescription } = await req.json();

    // Only create a new version if content has changed
    if (content !== article.content) {
      // Create new version
      const newVersion = {
        content: article.content,
        editor: session.user.id,
        editedAt: new Date(),
        changeDescription: changeDescription || 'Updated article content'
      };

      // Add new version to the beginning of the array
      article.versions.unshift(newVersion);

      // Update article content
      article.content = content;
    }

    // Update other fields
    if (title) article.title = title;
    if (tags) article.tags = tags;

    await article.save();

    // Populate author and editor information
    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'username')
      .populate('versions.editor', 'username');

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
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