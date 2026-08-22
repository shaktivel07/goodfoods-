// src/app/api/admin/delivery-staff/route.ts
// Admin: CRUD management of delivery staff Gmail addresses

import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAdmin, getDeliveryStaffEmails } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const emails = await getDeliveryStaffEmails();
  return NextResponse.json({ emails });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email } = await req.json();
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid Gmail address is required.' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const currentStaff = await getDeliveryStaffEmails();

  if (currentStaff.includes(normalized)) {
    return NextResponse.json({ error: 'This email is already added as delivery staff.' }, { status: 409 });
  }

  const updatedStaff = Array.from(new Set([...currentStaff, normalized]));

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: 'SYSTEM#CONFIG',
        SK: 'DELIVERY_STAFF',
        emails: updatedStaff,
        updatedAt: new Date().toISOString(),
      },
    })
  );

  return NextResponse.json({ success: true, emails: updatedStaff });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const emailToRemove = searchParams.get('email');

  if (!emailToRemove) {
    return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
  }

  const normalized = emailToRemove.trim().toLowerCase();
  const currentStaff = await getDeliveryStaffEmails();
  const updatedStaff = currentStaff.filter((e) => e !== normalized);

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: 'SYSTEM#CONFIG',
        SK: 'DELIVERY_STAFF',
        emails: updatedStaff,
        updatedAt: new Date().toISOString(),
      },
    })
  );

  return NextResponse.json({ success: true, emails: updatedStaff });
}
