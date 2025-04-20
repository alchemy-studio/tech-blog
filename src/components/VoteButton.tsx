'use client';

import { useState } from 'react';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';

interface VoteButtonProps {
  votes: number;
  hasVoted: boolean;
  onVote: () => Promise<void>;
}

export default function VoteButton({ votes, hasVoted, onVote }: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (hasVoted || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={hasVoted || isVoting}
      className={`flex items-center gap-1 px-2 py-1 rounded-md ${
        hasVoted
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
    >
      <HandThumbUpIcon className="h-4 w-4" />
      <span>{votes}</span>
    </button>
  );
} 