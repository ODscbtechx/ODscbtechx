// src/components/RetrospectiveItem.tsx
'use client';

import { RetrospectiveItem as ItemType } from '@/lib/db'; // Use alias

interface RetrospectiveItemProps {
  item: ItemType;
  onVote: (id: string) => Promise<void>;
  canVote: boolean; // To disable button if user has no votes left or already voted (simplification: just total votes)
}

export default function RetrospectiveItem({ item, onVote, canVote }: RetrospectiveItemProps) {
  return (
    <div className="border p-3 mb-2 rounded-lg shadow bg-white">
      <p className="text-gray-700 mb-1">{item.text}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600">
          Votes: {item.votes}
        </span>
        <button
          onClick={() => onVote(item.id)}
          disabled={!canVote}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm disabled:bg-gray-300"
        >
          Vote
        </button>
      </div>
    </div>
  );
}
