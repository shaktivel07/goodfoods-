// src/app/api/auth/sync-user/route.ts
// Creates or fetches user profile from DynamoDB on every sign-in

import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAuth, isAdminEmail, isDeliveryEmail } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  const claims = requireAuth(req);
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, name, photoURL } = await req.json();

  const PK = `USER#${email}`;
  const SK = 'PROFILE';

  const isDelivery = await isDeliveryEmail(email);
  const isAdmin = isAdminEmail(email);

  // Try to fetch existing profile
  const existing = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } })
  );

  if (existing.Item) {
    return NextResponse.json({
      profile: existing.Item,
      isAdmin,
      isDelivery,
      isNewUser: false,
    });
  }

  // Create new profile (phone & locationId will be empty until profile setup)
  const now = new Date().toISOString();
  const newProfile = {
    PK,
    SK,
    email,
    name: name || email,
    phone: '',
    locationId: '',
    locationName: '',
    photoURL: photoURL || '',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({ TableName: TABLE_NAME, Item: newProfile })
  );

  return NextResponse.json({
    profile: newProfile,
    isAdmin,
    isDelivery,
    isNewUser: true,
  });
}
