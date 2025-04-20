import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Link from 'next/link';
import VersionHistory from '@/components/VersionHistory';
import { Types } from 'mongoose';

interface Props {
  params: {
    id: string;
  };
}

export default async function ArticlePage({ params }: Props) {
  try {
    // Validate article ID
    const _params = await params;
    const articleId = await _params.id;
    if (!articleId || typeof articleId !== 'string') {
      notFound();
    }

    await connectDB();

    const session = await getServerSession(authOptions);

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
      notFound();
    }

    if (article.status !== 'published') {
      notFound();
    }

    console.log("find article: ", article);

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
    const cleanHtml = purify.sanitize(htmlContent, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'scrolling', 'src', 'style']
    });

    // Prepare versions data for client component
    const versions = article.versions.map((version: {
      content: string;
      editor: {
        _id: Types.ObjectId;
        username: string;
      } | null;
      editedAt: Date;
      changeDescription?: string;
    }) => ({
      content: version.content,
      editor: version.editor ? {
        _id: version.editor._id.toString(),
        username: version.editor.username
      } : null,
      editedAt: version.editedAt,
      changeDescription: version.changeDescription
    })).reverse(); // Reverse to show latest version first

    // Also convert article author ID to string
    const articleData = {
      ...article.toObject(),
      _id: article._id.toString(),
      author: {
        _id: article.author._id.toString(),
        username: article.author.username
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="prose prose-lg max-w-none">
          <h1>{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <span>作者: {article.author?.username || '未知作者'}</span>
            <span>发布于: {format(new Date(article.createdAt), 'yyyy-MM-dd HH:mm')}</span>
            {article.updatedAt && (
              <span>最后更新: {format(new Date(article.updatedAt), 'yyyy-MM-dd HH:mm')}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags?.map((tag: string) => (
              <Link
                key={tag}
                href={`/articles?tag=${tag}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: cleanHtml
            }}
          />
        </article>

        {canEdit && (
          <div className="mt-8">
            <Link
              href={`/articles/${article._id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              编辑文章
            </Link>
          </div>
        )}

        {versions.length > 1 && <VersionHistory versions={versions} />}
      </div>
    );
  } catch (error: unknown) {
    console.error('Error in article page:', error);
    notFound();
  }
} 