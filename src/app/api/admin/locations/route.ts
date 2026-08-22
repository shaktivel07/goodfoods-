// src/app/api/admin/locations/route.ts
// Admin CRUD for campus delivery locations

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/auth-middleware';
import { v4 as uuidv4 } from 'uuid';

// GET — list all locations (including inactive)
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'LOCATION' },
    })
  );
  return NextResponse.json({ locations: result.Items ?? [] });
}

// POST — create a new location
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, building, floor } = body;

  if (!name) return NextResponse.json({ error: 'Location name is required.' }, { status: 400 });

  const locationId = uuidv4();
  const now = new Date().toISOString();

  const location = {
    PK: 'LOCATION',
    SK: `LOC#${locationId}`,
    locationId,
    name,
    building: building || '',
    floor: floor || '',
    isActive: true,
    createdAt: now,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: location }));
  return NextResponse.json({ location }, { status: 201 });
}

// PUT — update a location
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { locationId, name, building, floor, isActive } = body;

  if (!locationId) return NextResponse.json({ error: 'locationId is required.' }, { status: 400 });

  const existing = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: { ':pk': 'LOCATION', ':sk': `LOC#${locationId}` },
    })
  );

  if (!existing.Items?.[0]) return NextResponse.json({ error: 'Location not found.' }, { status: 404 });

  const updated = {
    ...existing.Items[0],
    name: name ?? existing.Items[0].name,
    building: building ?? existing.Items[0].building,
    floor: floor ?? existing.Items[0].floor,
    isActive: isActive ?? existing.Items[0].isActive,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
  return NextResponse.json({ location: updated });
}

// DELETE — remove a location
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { locationId } = await req.json();
  if (!locationId) return NextResponse.json({ error: 'locationId is required.' }, { status: 400 });

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'LOCATION', SK: `LOC#${locationId}` },
    })
  );
  return NextResponse.json({ success: true });
}
