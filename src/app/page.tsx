'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';

interface Article {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  tags: string[];
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  answers: any[];
}

export default function Home() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [hotQuestions, setHotQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, questionsRes] = await Promise.all([
          fetch('/api/articles?limit=5'),
          fetch('/api/questions?limit=5')
        ]);

        const articlesData = await articlesRes.json();
        const questionsData = await questionsRes.json();

        setLatestArticles(articlesData.articles || []);
        setHotQuestions(questionsData.questions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
                <Link
                  href="/articles"
                  className="text-blue-600 hover:text-blue-800"
                >
                  查看全部 →
                </Link>
              </div>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {latestArticles.map((article) => (
                    <article
                      key={article._id}
                      className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                    >
                      <Link href={`/articles/${article._id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.author.username}</span>
                        <span className="mx-2">•</span>
                        <time dateTime={article.createdAt}>
                          {format(new Date(article.createdAt), 'yyyy-MM-dd')}
                        </time>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">热门问答</h2>
                <Link
                  href="/questions"
                  className="text-blue-600 hover:text-blue-800"
                >
                  更多 →
                </Link>
              </div>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {hotQuestions.map((question) => (
                    <div
                      key={question._id}
                      className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                    >
                      <Link href={`/questions/${question._id}`}>
                        <h3 className="text-base font-medium text-gray-900 hover:text-blue-600 mb-2">
                          {question.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{question.answers.length} 个回答</span>
                        <time dateTime={question.createdAt}>
                          {format(new Date(question.createdAt), 'MM-dd')}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-4">
                <Link
                  href="/articles/new"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  发布文章
                </Link>
                <Link
                  href="/questions/new"
                  className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  提问
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
