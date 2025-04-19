import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Article, { IArticle } from '@/models/Article';

interface Props {
  params: {
    id: string;
  };
}

interface ArticleWithAuthor extends Omit<IArticle, 'author'> {
  author: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await Promise.resolve(params);
  
  if (!mongoose.isValidObjectId(id)) {
    notFound();
  }

  await connectDB();

  const article = await Article.findById(id)
    .populate('author', 'username')
    .lean() as ArticleWithAuthor | null;

  if (!article || article.status !== 'published') {
    notFound();
  }

  const htmlContent = DOMPurify.sanitize(marked.parse(article.content).toString());

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-gray-600 mb-8">
          <span>作者: {article.author.username}</span>
          <span className="mx-2">&bull;</span>
          <time dateTime={article.createdAt.toString()}>
            {format(new Date(article.createdAt), 'yyyy-MM-dd')}
          </time>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
} 