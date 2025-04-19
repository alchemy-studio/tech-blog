import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

interface ArticleVersion {
  content: string;
  editor: any;
  editedAt: Date;
  changeDescription?: string;
}

export default async function ArticlePage({ params }: Props) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    console.log('Fetching article with ID:', params.id);
    const article = await Article.findById(params.id)
      .populate('author', 'username')
      .populate('versions.editor', 'username');

    if (!article) {
      console.log('Article not found:', params.id);
      notFound();
    }

    if (article.status !== 'published') {
      console.log('Article not published:', params.id);
      notFound();
    }

    // Check if user can edit the article
    const canEdit = session?.user && (
      session.user.role === 'editor' || 
      article.author.toString() === session.user.id
    );

    // Convert markdown to HTML
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const markdownContent = article.content as string;
    const htmlContent = marked.parse(markdownContent) as string;
    const cleanHtml = purify.sanitize(htmlContent);

    return (
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold">{article.title}</h1>
            {canEdit && (
              <Link
                href={`/articles/${article._id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                编辑文章
              </Link>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span>作者: {article.author?.username || '未知作者'}</span>
            <span className="mx-2">&bull;</span>
            <time dateTime={article.createdAt.toString()}>
              {format(new Date(article.createdAt), 'yyyy-MM-dd')}
            </time>
            <span className="mx-2">&bull;</span>
            <span>版本: {article.currentVersion + 1}</span>
          </div>

          {article.versions?.length > 1 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">版本历史</h3>
              <div className="space-y-2">
                {article.versions.map((version: ArticleVersion, index: number) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        版本 {index + 1} - {format(new Date(version.editedAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                      <span className="text-gray-500">
                        编辑者: {version.editor?.username || '未知编辑者'}
                      </span>
                    </div>
                    {version.changeDescription && (
                      <p className="text-gray-500 mt-1">
                        修改说明: {version.changeDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags?.map((tag: string) => (
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