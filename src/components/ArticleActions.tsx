'use client';

import { useRouter } from 'next/navigation';
import DeleteButton from './DeleteButton';

interface ArticleActionsProps {
  articleId: string;
}

export default function ArticleActions({ articleId }: ArticleActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/articles');
      } else {
        const data = await res.json();
        alert(data.error || '删除文章失败');
      }
    } catch (error) {
      console.error('删除文章时出错:', error);
      alert('删除文章失败');
    }
  };

  return <DeleteButton onDelete={handleDelete} />;
} 