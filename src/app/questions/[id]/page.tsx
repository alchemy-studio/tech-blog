'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';
import { use } from 'react';
import CustomMDEditor from '@/components/CustomMDEditor';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import QuestionActions from '@/components/QuestionActions';

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
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data);
      } else {
        console.error('获取问题失败');
      }
    } catch (error) {
      console.error('获取问题时出错:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${resolvedParams.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: answer }),
      });

      if (res.ok) {
        setAnswer('');
        await fetchQuestion();
      } else {
        const data = await res.json();
        alert(data.error || '提交回答失败');
      }
    } catch (error) {
      console.error('提交回答时出错:', error);
      alert('提交回答失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('确定要删除这个问题吗？此操作不可恢复。')) {
      return;
    }

    try {
      const res = await fetch(`/api/questions/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/questions');
      } else {
        const data = await res.json();
        alert(data.error || '删除问题失败');
      }
    } catch (error) {
      console.error('删除问题时出错:', error);
      alert('删除问题失败');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('确定要删除这个回答吗？此操作不可恢复。')) {
      return;
    }

    try {
      const res = await fetch(`/api/questions/${resolvedParams.id}/answers/${answerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchQuestion();
      } else {
        const data = await res.json();
        alert(data.error || '删除回答失败');
      }
    } catch (error) {
      console.error('删除回答时出错:', error);
      alert('删除回答失败');
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {question && (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {question.title}
                </h1>
                {session?.user?.role === 'editor' && (
                  <QuestionActions questionId={question._id} />
                )}
              </div>
              <div className="prose max-w-none mb-6">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked.parse(question.content))
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>提问者：{question.author.username}</span>
                <span>
                  {formatDistanceToNow(new Date(question.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">回答</h2>
              {question.answers.length === 0 ? (
                <p className="text-gray-500">暂无回答</p>
              ) : (
                <div className="space-y-6">
                  {question.answers.map((answer) => (
                    <div key={answer._id} className="border-b border-gray-200 pb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="prose max-w-none">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(marked.parse(answer.content))
                            }}
                          />
                        </div>
                        {session?.user?.role === 'editor' && (
                          <QuestionActions
                            questionId={question._id}
                            answerId={answer._id}
                            onDeleteAnswer={handleDeleteAnswer}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>回答者：{answer.author.username}</span>
                        <span>
                          {formatDistanceToNow(new Date(answer.createdAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {session?.user && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">发表回答</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="mt-1">
                      <CustomMDEditor
                        value={answer}
                        onChange={(value) => setAnswer(value || '')}
                        height={200}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '提交中...' : '提交回答'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 