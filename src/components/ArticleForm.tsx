'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MDEditor from '@uiw/react-md-editor';

interface ArticleFormProps {
  initialData?: {
    title: string;
    content: string;
    tags: string[];
  };
  articleId?: string;
}

export default function ArticleForm({ initialData, articleId }: ArticleFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [changeDescription, setChangeDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Submitting form...');
      const payload = {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        changeDescription: changeDescription || 'Updated article content',
        author: session?.user?.id,
      };
      console.log('Payload:', payload);

      const response = await fetch(
        articleId 
          ? `/api/articles/${articleId}`
          : '/api/articles',
        {
          method: articleId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      router.push(`/articles/${data._id}`);
      router.refresh();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          标题
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          内容
        </label>
        <div className="mt-1">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || '')}
            height={500}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          标签 (用逗号分隔)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="例如: JavaScript, React, Next.js"
        />
      </div>

      <div>
        <label htmlFor="changeDescription" className="block text-sm font-medium text-gray-700">
          修改说明
        </label>
        <input
          type="text"
          id="changeDescription"
          value={changeDescription}
          onChange={(e) => setChangeDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="简要说明本次修改的内容"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存文章'}
        </button>
      </div>
    </form>
  );
} 