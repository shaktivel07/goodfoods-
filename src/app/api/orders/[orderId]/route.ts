// src/app/api/orders/[orderId]/route.ts
// GET single order by orderId (for tracking page)

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const claims = requireAuth(req);
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await params;

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `USER#${claims.email}`,
        ':sk': `ORDER#${orderId}`,
      },
    })
  );

  const order = result.Items?.[0];
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ order });
}
