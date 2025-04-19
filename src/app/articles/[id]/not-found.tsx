import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">文章未找到</h2>
      <p className="text-gray-600 mb-8">
        抱歉，您要查看的文章不存在或已被删除。
      </p>
      <Link
        href="/articles"
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        返回文章列表
      </Link>
    </div>
  );
} 