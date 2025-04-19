import Link from 'next/link';
import { format } from 'date-fns';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

interface ArticleType {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: {
    _id: Types.ObjectId;
    username: string;
  };
  tags: string[];
  createdAt: Date;
  status: string;
  __v: number;
}

async function getArticles(page = 1, limit = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;

    const articles = await Article.find({ status: 'published' })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as ArticleType[];

    const total = await Article.countDocuments({ status: 'published' });

    return {
      articles,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      articles: [] as ArticleType[],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { articles, totalPages, currentPage } = await getArticles(page);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">技术文章</h1>
        <Link
          href="/articles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          写文章
        </Link>
      </div>

      <div className="space-y-8">
        {articles.map((article) => (
          <article key={article._id.toString()} className="bg-white p-6 rounded-lg shadow">
            <Link href={`/articles/${article._id}`}>
              <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-600">
                {article.title}
              </h2>
            </Link>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>作者: {article.author.username}</span>
              <span className="mx-2">•</span>
              <time dateTime={article.createdAt.toString()}>
                {format(new Date(article.createdAt), 'yyyy-MM-dd')}
              </time>
            </div>
            {article.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-gray-600 line-clamp-3">
              {article.content.replace(/[#*`]/g, '')}
            </p>
            <div className="mt-4">
              <Link
                href={`/articles/${article._id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                阅读全文 →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/articles?page=${pageNum}`}
              className={`px-4 py-2 rounded-lg ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 