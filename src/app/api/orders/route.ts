// src/app/api/orders/route.ts
// GET user's own orders

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const claims = requireAuth(req);
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${claims.email}`,
        ':prefix': 'ORDER#',
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return NextResponse.json({ orders: result.Items ?? [] });
}
