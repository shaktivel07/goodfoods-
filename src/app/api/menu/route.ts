// src/app/api/menu/route.ts
// Public GET endpoint for AVAILABLE menu items

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';

export async function GET(_req: NextRequest) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      FilterExpression: '#st = :available',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: {
        ':pk': 'MENU',
        ':available': 'AVAILABLE',
      },
    })
  );

  return NextResponse.json({ items: result.Items ?? [] });
}
