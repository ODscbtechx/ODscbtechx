// src/components/RetrospectiveColumn.tsx
'use client';

import { useState } from 'react';
import { RetrospectiveItem as ItemType } from '@/lib/db'; // Use alias. Note: RetrospectiveItem interface is also imported but not directly used here, ItemType is.
import RetrospectiveItemComponent from './RetrospectiveItem';

interface RetrospectiveColumnProps {
  title: string;
  items: ItemType[];
  columnKey: 'went-well' | 'can-be-improved' | 'action-item';
  onAddItem: (text: string, column: string) => Promise<void>;
  onVoteItem: (id: string) => Promise<void>;
  canVoteGlobal: boolean;
}

export default function RetrospectiveColumn({ title, items, columnKey, onAddItem, onVoteItem, canVoteGlobal }: RetrospectiveColumnProps) {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = async () => {
    if (newItemText.trim()) {
      await onAddItem(newItemText, columnKey);
      setNewItemText('');
    }
  };

  return (
    <div className="flex-1 p-4 bg-gray-100 rounded-xl shadow-md min-w-[300px]">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">{title}</h2>
      <div className="mb-4">
        <textarea
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add new item..."
          rows={3}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddItem}
          className="mt-2 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Item
        </button>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
        {items.map(item => (
          <RetrospectiveItemComponent
            key={item.id}
            item={item}
            onVote={onVoteItem}
            canVote={canVoteGlobal}
          />
        ))}
      </div>
    </div>
  );
}
