import { Suspense } from 'react';
import ArticleList from '@/components/ArticleList';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';

export const revalidate = 60; // Revalidate every 60 seconds

async function getArticles() {
  try {
    await connectDB();

    const articles = await Article.find({ status: 'published' })
      .populate({
        path: 'author',
        select: 'username',
        model: User
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">技术文章</h1>
        <Suspense fallback={<div>Loading articles...</div>}>
          <ArticleList articles={articles} />
        </Suspense>
      </div>
    </div>
  );
} 