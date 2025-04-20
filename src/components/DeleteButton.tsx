import { TrashIcon } from '@heroicons/react/24/outline';

interface DeleteButtonProps {
  onDelete: () => void;
}

export default function DeleteButton({ onDelete }: DeleteButtonProps) {
  return (
    <button
      onClick={onDelete}
      className="text-red-600 hover:text-red-800"
      title="删除"
    >
      <TrashIcon className="h-6 w-6" />
    </button>
  );
} 