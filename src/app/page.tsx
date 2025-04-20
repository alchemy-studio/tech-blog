'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Article {
  _id: string;
  title: string;
  summary: string;
  author: {
    username: string;
  };
  createdAt: string;
  viewCount: number;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  createdAt: string;
  answerCount: number;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, questionsRes] = await Promise.all([
          fetch('/api/articles'),
          fetch('/api/questions')
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

    fetchData();
  }, []);

  if (loading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文章列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">最新文章</h2>
              <div className="space-y-6">
                {articles.map((article) => (
                  <div key={article._id} className="border-b border-gray-200 pb-6">
                    <Link href={`/articles/${article._id}`} className="block">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-gray-600">{article.summary}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            作者：{article.author.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(article.createdAt), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">{article.viewCount}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/articles"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  查看所有文章 →
                </Link>
              </div>
            </div>
          </div>

          {/* 问答列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">热门问答</h2>
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question._id} className="border-b border-gray-200 pb-4">
                    <Link href={`/questions/${question._id}`} className="block">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {question.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {question.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            提问者：{question.author.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(question.createdAt), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">{question.answerCount}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/questions"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  查看所有问答 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
