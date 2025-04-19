import Link from 'next/link';
import { format } from 'date-fns';

interface Article {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  } | null;
  tags: string[];
  createdAt: string;
}

interface ArticleListProps {
  articles: Article[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="space-y-8">
      {articles.map((article) => {
        // Parse the date string to a Date object
        const date = new Date(article.createdAt);
        // Format the date in a consistent way
        const formattedDate = format(date, 'yyyy-MM-dd');
        const dateTimeString = date.toISOString();

        return (
          <article key={article._id} className="bg-white p-6 rounded-lg shadow">
            <Link href={`/articles/${article._id}`}>
              <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-600">
                {article.title}
              </h2>
            </Link>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>作者: {article.author?.username || '未知作者'}</span>
              <span className="mx-2">&bull;</span>
              <time dateTime={dateTimeString}>
                {formattedDate}
              </time>
            </div>
            {article.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
            <p className="mt-3 text-gray-600 line-clamp-3">
              {article.content?.replace(/[#*`]/g, '') || ''}
            </p>
            <div className="mt-4">
              <Link
                href={`/articles/${article._id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                阅读全文 &rarr;
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
} 