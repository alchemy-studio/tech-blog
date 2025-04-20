'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon, DocumentTextIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface Article {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, questionsRes] = await Promise.all([
          fetch('/api/articles/my'),
          fetch('/api/questions/my')
        ]);

        if (articlesRes.ok) {
          const { articles } = await articlesRes.json();
          setArticles(articles);
        }

        if (questionsRes.ok) {
          const { questions } = await questionsRes.json();
          setQuestions(questions);
        }
      } catch (error) {
        console.error('获取数据时出错:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            欢迎回来，{session?.user?.name || session?.user?.username || '用户'}！
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                我的文章
              </h2>
              {articles.length === 0 ? (
                <p className="text-gray-500">您还没有发表任何文章。</p>
              ) : (
                <ul className="space-y-3">
                  {articles.map((article) => (
                    <li key={article._id}>
                      <Link
                        href={`/articles/${article._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {article.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Link
                  href="/articles/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  撰写新文章
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                我的问题
              </h2>
              {questions.length === 0 ? (
                <p className="text-gray-500">您还没有提出任何问题。</p>
              ) : (
                <ul className="space-y-3">
                  {questions.map((question) => (
                    <li key={question._id}>
                      <Link
                        href={`/questions/${question._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {question.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Link
                  href="/questions/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  提出新问题
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 