'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: {
    username: string;
  };
  tags: string[];
  answers: any[];
  votes: number;
  views: number;
  createdAt: string;
}

export default function QuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">问答</h1>
          {session && (
            <Link
              href="/questions/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              提问
            </Link>
          )}
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">问答</h1>
        {session && (
          <Link
            href="/questions/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            提问
          </Link>
        )}
      </div>
      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-center mr-6">
                <div className="text-2xl font-bold text-gray-700">{question.votes}</div>
                <div className="text-sm text-gray-500">投票</div>
                <div className="mt-2">
                  <div className="text-xl font-bold text-gray-700">{question.answers.length}</div>
                  <div className="text-sm text-gray-500">回答</div>
                </div>
                <div className="mt-2">
                  <div className="text-xl font-bold text-gray-700">{question.views}</div>
                  <div className="text-sm text-gray-500">浏览</div>
                </div>
              </div>
              <div className="flex-grow">
                <Link href={`/questions/${question._id}`}>
                  <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                    {question.title}
                  </h2>
                </Link>
                <div className="mt-2 text-gray-600 line-clamp-2">{question.content}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{question.author.username}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={question.createdAt}>
                    {format(new Date(question.createdAt), 'yyyy-MM-dd HH:mm')}
                  </time>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 