'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { use } from 'react';

interface Answer {
  _id: string;
  content: string;
  author: {
    username: string;
  };
  votes: number;
  isAccepted: boolean;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  tags: string[];
  answers: Answer[];
  votes: number;
  views: number;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuestionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/questions/${resolvedParams.id}`);
        if (!res.ok) {
          throw new Error('Question not found');
        }
        const data = await res.json();
        setQuestion(data);
      } catch (error) {
        setError('Failed to load question');
        console.error('Error fetching question:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [resolvedParams.id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      const res = await fetch(`/api/questions/${resolvedParams.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newAnswer }),
      });

      if (!res.ok) {
        throw new Error('Failed to post answer');
      }

      const updatedQuestion = await res.json();
      setQuestion(updatedQuestion);
      setNewAnswer('');
    } catch (error) {
      setError('Failed to post answer');
      console.error('Error posting answer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Question not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>提问者: {question.author?.username || 'Unknown Author'}</span>
          <span className="mx-2">&bull;</span>
          <time dateTime={question.createdAt}>
            {format(new Date(question.createdAt), 'yyyy-MM-dd')}
          </time>
        </div>
        <div className="prose max-w-none mb-6">
          {question.content}
        </div>
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                href={`/questions?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </article>

      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">回答 ({question.answers.length})</h2>
        {question.answers.length === 0 ? (
          <p className="text-gray-500">还没有回答，快来抢沙发吧！</p>
        ) : (
          <div className="space-y-6">
            {question.answers.map((answer) => (
              <div
                key={answer._id}
                className={`border rounded-lg p-4 ${
                  answer.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{answer.author?.username || 'Unknown Author'}</span>
                    <span className="mx-2">&bull;</span>
                    <time dateTime={answer.createdAt}>
                      {format(new Date(answer.createdAt), 'yyyy-MM-dd')}
                    </time>
                  </div>
                  {answer.isAccepted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      已采纳
                    </span>
                  )}
                </div>
                <div className="prose max-w-none">
                  {answer.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {session ? (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">发表回答</h2>
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="写下你的回答..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              提交回答
            </button>
          </form>
        </section>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">登录后才能回答问题</p>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            去登录 →
          </Link>
        </div>
      )}
    </div>
  );
} 