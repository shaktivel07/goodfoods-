// src/app/api/admin/orders/deliver/route.ts
// Admin & Delivery: Verify OTP and mark order status (DELIVERED, UNCLAIMED, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireDelivery } from '@/lib/auth-middleware';

export async function POST(req: NextRequest) {
  if (!(await requireDelivery(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { orderId, userEmail, enteredOtp } = body;

  if (!orderId || !userEmail || !enteredOtp) {
    return NextResponse.json(
      { error: 'orderId, userEmail, and enteredOtp are required.' },
      { status: 400 }
    );
  }

  // Fetch the order
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userEmail}`,
        ':sk': `ORDER#${orderId}`,
      },
    })
  );

  const order = result.Items?.[0];
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  if (order.status === 'DELIVERED') {
    return NextResponse.json({ error: 'Order is already delivered.' }, { status: 409 });
  }

  // Strict OTP validation
  if (order.otp !== String(enteredOtp).trim()) {
    return NextResponse.json({ error: 'Invalid OTP. Please check with the customer.' }, { status: 400 });
  }

  // Update status to DELIVERED
  const updated = {
    ...order,
    status: 'DELIVERED',
    deliveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
  return NextResponse.json({ success: true, order: updated });
}

// Update order status manually (CONFIRMED, OUT_FOR_DELIVERY, UNCLAIMED, CANCELLED)
export async function PATCH(req: NextRequest) {
  if (!(await requireDelivery(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { orderId, userEmail, status } = body;

  const allowedStatuses = ['CONFIRMED', 'OUT_FOR_DELIVERY', 'UNCLAIMED', 'CANCELLED'];
  if (!orderId || !userEmail || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userEmail}`,
        ':sk': `ORDER#${orderId}`,
      },
    })
  );

  const order = result.Items?.[0];
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const updated = { ...order, status, updatedAt: new Date().toISOString() };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: updated }));
  return NextResponse.json({ success: true, order: updated });
}
