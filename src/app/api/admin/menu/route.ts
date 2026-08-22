// src/app/api/admin/menu/route.ts
// Admin CRUD for menu items (with soft-delete via HIDDEN status)

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/auth-middleware';
import { v4 as uuidv4 } from 'uuid';

// GET — list all menu items (including HIDDEN)
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'MENU' },
    })
  );
  return NextResponse.json({ items: result.Items ?? [] });
}

// POST — create a new menu item
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, description, price, imageUrl, category } = body;

  if (!name || !price) {
    return NextResponse.json({ error: 'Name and price are required.' }, { status: 400 });
  }

  const itemId = uuidv4();
  const now = new Date().toISOString();

  const item = {
    PK: 'MENU',
    SK: `ITEM#${itemId}`,
    itemId,
    name,
    description: description || '',
    price: Number(price),
    imageUrl: imageUrl || '',
    category: category || 'General',
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return NextResponse.json({ item }, { status: 201 });
}

// PUT — full update of a menu item
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { itemId, name, description, price, imageUrl, category } = body;

  if (!itemId) return NextResponse.json({ error: 'itemId is required.' }, { status: 400 });

  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK: 'MENU', SK: `ITEM#${itemId}` } })
  );
  if (!existing.Item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });

  const updated = {
    ...existing.Item,
    name: name ?? existing.Item.name,
    description: description ?? existing.Item.description,
    price: price != null ? Number(price) : existing.Item.price,
    imageUrl: imageUrl ?? existing.Item.imageUrl,
    category: category ?? existing.Item.category,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
  return NextResponse.json({ item: updated });
}

// PATCH — toggle item status (AVAILABLE <-> HIDDEN)
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { itemId, status } = body;

  if (!itemId || !['AVAILABLE', 'HIDDEN'].includes(status)) {
    return NextResponse.json({ error: 'itemId and valid status (AVAILABLE|HIDDEN) required.' }, { status: 400 });
  }

  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK: 'MENU', SK: `ITEM#${itemId}` } })
  );
  if (!existing.Item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });

  const updated = { ...existing.Item, status, updatedAt: new Date().toISOString() };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
  return NextResponse.json({ item: updated });
}

// DELETE — hard delete of a menu item
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: 'itemId is required.' }, { status: 400 });

  await docClient.send(
    new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: 'MENU', SK: `ITEM#${itemId}` } })
  );
  return NextResponse.json({ success: true });
}
