// src/app/api/admin/orders/route.ts
// Admin: fetch all orders across all users via GSI

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, ADMIN_ORDER_INDEX } from '@/lib/dynamodb';
import { requireDelivery } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  if (!(await requireDelivery(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // optional filter

  let result;

  if (status) {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: ADMIN_ORDER_INDEX,
        KeyConditionExpression: 'GSI_PK = :pk',
        FilterExpression: '#st = :status',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: {
          ':pk': 'ALL_ORDERS',
          ':status': status,
        },
        ScanIndexForward: false,
      })
    );
  } else {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: ADMIN_ORDER_INDEX,
        KeyConditionExpression: 'GSI_PK = :pk',
        ExpressionAttributeValues: { ':pk': 'ALL_ORDERS' },
        ScanIndexForward: false,
      })
    );
  }

  return NextResponse.json({ orders: result.Items ?? [] });
}
