'use client';

import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';

interface QuestionActionsProps {
  questionId: string;
  onDeleteAnswer?: (answerId: string) => Promise<void>;
  answerId?: string;
}

export default function QuestionActions({ 
  questionId, 
  onDeleteAnswer, 
  answerId 
}: QuestionActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('确定要删除吗？此操作不可恢复。')) {
      return;
    }

    try {
      if (answerId && onDeleteAnswer) {
        await onDeleteAnswer(answerId);
      } else {
        const res = await fetch(`/api/questions/${questionId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          router.push('/questions');
        } else {
          const data = await res.json();
          alert(data.error || '删除失败');
        }
      }
    } catch (error) {
      console.error('删除时出错:', error);
      alert('删除失败');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800"
      title="删除"
    >
      <TrashIcon className="h-6 w-6" />
    </button>
  );
} 