// src/app/api/checkout/route.ts
// Creates a new order with a cryptographically secure OTP

import { NextRequest, NextResponse } from 'next/server';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth-middleware';
import { v4 as uuidv4 } from 'uuid';

function generateOTP(): string {
  // Cryptographically secure 6-digit OTP
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

export async function POST(req: NextRequest) {
  const claims = requireAuth(req);
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { items, locationId, locationName } = body;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }

  // Fetch user profile to verify it is complete
  const profileResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${claims.email}`, SK: 'PROFILE' },
    })
  );

  const profile = profileResult.Item;
  if (!profile || !profile.phone || !profile.locationId) {
    return NextResponse.json(
      { error: 'Profile incomplete. Please set your phone number and delivery location.' },
      { status: 403 }
    );
  }

  const orderId = uuidv4();
  const otp = generateOTP();
  const now = new Date().toISOString();

  // Calculate total
  const total = items.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0
  );

  const order = {
    PK: `USER#${claims.email}`,
    SK: `ORDER#${orderId}`,
    GSI_PK: 'ALL_ORDERS',
    GSI_SK: now,
    orderId,
    userEmail: claims.email,
    userName: profile.name,
    userPhone: profile.phone,
    items,
    total: Math.round(total * 100) / 100,
    locationId: locationId || profile.locationId,
    locationName: locationName || profile.locationName,
    status: 'PENDING',
    otp,
    paymentMethod: 'COD',
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: order }));

  // TODO: PAYMENT_GATEWAY_INJECTION_POINT
  // When integrating an online payment gateway (e.g., Razorpay, Stripe):
  // 1. Create a payment order/session here before writing to DynamoDB
  // 2. Pass the payment session ID/link back in the response
  // 3. Change order status to 'AWAITING_PAYMENT' until webhook confirms payment
  // 4. The webhook handler should then update status to 'PENDING' and proceed with OTP

  return NextResponse.json({ orderId, total: order.total });
}
