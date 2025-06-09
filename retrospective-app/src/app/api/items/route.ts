import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, RetrospectiveItem, Database } from '@/lib/db';
import crypto from 'crypto';

// GET handler to fetch all items
export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.items);
  } catch (error) {
    console.error('Failed to read database:', error);
    return NextResponse.json({ message: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST handler to create a new item
export async function POST(request: NextRequest) {
  try {
    const { text, column } = await request.json();

    if (!text || !column) {
      return NextResponse.json({ message: 'Missing text or column' }, { status: 400 });
    }

    if (!['went-well', 'can-be-improved', 'action-item'].includes(column)) {
      return NextResponse.json({ message: 'Invalid column value' }, { status: 400 });
    }

    const db = await readDb();
    const newItem: RetrospectiveItem = {
      id: crypto.randomUUID(),
      text,
      column,
      votes: 0,
    };

    db.items.push(newItem);
    await writeDb(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json({ message: 'Failed to create item' }, { status: 500 });
  }
}
