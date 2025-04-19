import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
    console.log('Starting edit page...');
    console.log('Article ID:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session in edit page:', session);

    if (!session?.user?.id) {
      console.log('No valid session found, redirecting...');
      notFound();
    }

    await connectDB();
    console.log('Database connected');

    const article = await Article.findById(params.id);
    console.log('Found article:', article);

    if (!article) {
      console.log('Article not found');
      notFound();
    }

    // Check if user is author or editor
    const isAuthor = article.author.toString() === session.user.id;
    const isEditor = session.user.role === 'editor';
    console.log('Permission check:', { 
      isAuthor, 
      isEditor, 
      userId: session.user.id, 
      authorId: article.author.toString() 
    });

    if (!isAuthor && !isEditor) {
      console.log('User not authorized');
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
    console.error('Error in edit page:', error);
    notFound();
  }
} 