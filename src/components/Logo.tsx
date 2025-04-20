import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xl">
        T
      </div>
      <span className="text-xl font-bold text-gray-900">Tech Blog</span>
    </Link>
  );
} 