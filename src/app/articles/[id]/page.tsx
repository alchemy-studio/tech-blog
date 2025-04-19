import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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
    console.log('Starting article page render...');
    console.log('Article ID:', params?.id);

    // Validate article ID
    const articleId = params?.id;
    if (!articleId || typeof articleId !== 'string') {
      console.log('Invalid article ID');
      notFound();
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    console.log('Checking session...');
    const session = await getServerSession(authOptions);
    console.log('Session details:', {
      exists: !!session,
      user: session?.user,
      role: session?.user?.role,
      id: session?.user?.id
    });

    console.log('Fetching article...');
    const article = await Article.findById(articleId)
      .populate({
        path: 'author',
        select: 'username'
      })
      .populate({
        path: 'versions.editor',
        select: 'username',
        model: 'User'
      });

    if (!article) {
      console.log('Article not found');
      notFound();
    }

    if (article.status !== 'published') {
      console.log('Article not published');
      notFound();
    }

    // Check if user can edit the article
    const canEdit = session?.user && (
      session.user.role === 'editor' || 
      article.author.toString() === session.user.id
    );
    console.log('Edit permissions:', {
      canEdit,
      userRole: session?.user?.role,
      userId: session?.user?.id,
      authorId: article.author.toString()
    });

    // Convert markdown to HTML
    console.log('Converting markdown to HTML...');
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const markdownContent = article.content as string;
    const htmlContent = marked.parse(markdownContent) as string;
    const cleanHtml = purify.sanitize(htmlContent);
    console.log('Markdown conversion complete');

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

          {article.versions && article.versions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">版本历史</h2>
              <div className="space-y-4">
                {article.versions.map((version: {
                  content: string;
                  editor: any;
                  editedAt: Date;
                  changeDescription?: string;
                }, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          版本 {index + 1} - {new Date(version.editedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          编辑者: {version.editor?.username || '未知用户'}
                        </p>
                        <p className="text-sm text-gray-600">
                          修改说明: {version.changeDescription || '无修改说明'}
                        </p>
                      </div>
                      {index === article.currentVersion && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          当前版本
                        </span>
                      )}
                    </div>
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
  } catch (error: unknown) {
    console.error('Error in article page:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    notFound();
  }
} 