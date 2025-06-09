import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, RetrospectiveItem, Database } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    if (!itemId) {
      return NextResponse.json({ message: 'Item ID is missing' }, { status: 400 });
    }

    const db = await readDb();
    const itemIndex = db.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    // For now, we're not checking user's total votes here on the server-side
    // as per the plan (3 votes per user, managed client-side).
    // If server-side vote limit enforcement was needed, logic would go here.
    db.items[itemIndex].votes += 1;
    await writeDb(db);

    return NextResponse.json(db.items[itemIndex]);
  } catch (error) {
    console.error('Failed to vote for item:', error);
    return NextResponse.json({ message: 'Failed to vote for item' }, { status: 500 });
  }
}
