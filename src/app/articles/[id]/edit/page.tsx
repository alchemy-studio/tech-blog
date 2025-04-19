import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import ArticleForm from '@/components/ArticleForm';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditArticlePage({ params }: Props) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      notFound();
    }

    const article = await Article.findById(params.id);

    if (!article) {
      notFound();
    }

    // Check if user is author or editor
    if (
      article.author.toString() !== session.user.id &&
      session.user.role !== 'editor'
    ) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">编辑文章</h1>
          <ArticleForm 
            initialData={{
              title: article.title,
              content: article.content,
              tags: article.tags,
            }}
            articleId={article._id.toString()}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
} 