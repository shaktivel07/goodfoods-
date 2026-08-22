// src/app/api/locations/route.ts
// Public GET endpoint for all active campus locations

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '@/lib/dynamodb';

export async function GET(_req: NextRequest) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'LOCATION' },
    })
  );

  const locations = (result.Items ?? []).filter((loc) => loc.isActive !== false);
  return NextResponse.json({ locations });
}
