// src/app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import RetrospectiveColumn from '@/components/RetrospectiveColumn'; // Use alias
import { RetrospectiveItem as ItemType } from '@/lib/db'; // Use alias

const MAX_VOTES = 3;
const VOTES_STORAGE_KEY = 'userTotalVotes';

export default function HomePage() {
  const [items, setItems] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTotalVotes, setUserTotalVotes] = useState<number>(0);

  // Load initial votes from localStorage
  useEffect(() => {
    const storedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
    if (storedVotes) {
      setUserTotalVotes(parseInt(storedVotes, 10));
    }
  }, []);

  // Effect to update localStorage when userTotalVotes changes
  useEffect(() => {
    localStorage.setItem(VOTES_STORAGE_KEY, userTotalVotes.toString());
  }, [userTotalVotes]);

  const canVoteGlobal = userTotalVotes < MAX_VOTES;

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      const data: ItemType[] = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchItems(); // Initial fetch
    const intervalId = setInterval(fetchItems, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchItems]);

  const handleAddItem = async (text: string, column: string) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, column }),
      });
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      await fetchItems(); // Re-fetch to update list
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleVoteItem = async (id: string) => {
    if (!canVoteGlobal) {
      alert('You have used all your votes!');
      return;
    }
    try {
      const response = await fetch(`/api/items/${id}/vote`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to vote for item');
      }
      setUserTotalVotes(prevVotes => prevVotes + 1);
      await fetchItems(); // Re-fetch to update votes
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) return <p className="text-center mt-10">Loading retrospective board...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  const wentWellItems = items.filter(item => item.column === 'went-well');
  const canBeImprovedItems = items.filter(item => item.column === 'can-be-improved');
  const actionItems = items.filter(item => item.column === 'action-item');

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 bg-gradient-to-br from-slate-900 to-slate-700">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white">Team Retrospective</h1>
        <p className="text-lg text-gray-300">
          You have {MAX_VOTES - userTotalVotes} vote(s) remaining.
        </p>
      </header>
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        <RetrospectiveColumn
          title="What Went Well 👍"
          items={wentWellItems}
          columnKey="went-well"
          onAddItem={handleAddItem}
          onVoteItem={handleVoteItem}
          canVoteGlobal={canVoteGlobal}
        />
        <RetrospectiveColumn
          title="What Can Be Improved 👎"
          items={canBeImprovedItems}
          columnKey="can-be-improved"
          onAddItem={handleAddItem}
          onVoteItem={handleVoteItem}
          canVoteGlobal={canVoteGlobal}
        />
        <RetrospectiveColumn
          title="Action Items 🚀"
          items={actionItems}
          columnKey="action-item"
          onAddItem={handleAddItem}
          onVoteItem={handleVoteItem}
          canVoteGlobal={canVoteGlobal}
        />
      </div>
    </main>
  );
}
