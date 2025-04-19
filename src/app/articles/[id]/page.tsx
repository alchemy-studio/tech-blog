import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

interface Props {
  params: {
    id: string;
  };
}

export default async function ArticlePage({ params }: Props) {
  try {
    await connectDB();

    const article = await Article.findById(params.id)
      .populate('author', 'username')
      .populate('versions.editor', 'username');

    if (!article || article.status !== 'published') {
      notFound();
    }

    // Convert markdown to HTML
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const markdownContent = article.content as string;
    const htmlContent = marked.parse(markdownContent) as string;
    const cleanHtml = purify.sanitize(htmlContent);

    return (
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span>作者: {(article.author as any).username}</span>
            <span className="mx-2">&bull;</span>
            <time dateTime={article.createdAt.toString()}>
              {format(new Date(article.createdAt), 'yyyy-MM-dd')}
            </time>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </article>
      </div>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
} 