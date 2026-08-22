// src/app/api/admin/analytics/route.ts
// Admin: Aggregate analytics data from all orders via GSI

import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME, ADMIN_ORDER_INDEX } from '@/lib/dynamodb';
import { requireAdmin } from '@/lib/auth-middleware';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Fetch all orders via GSI
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: ADMIN_ORDER_INDEX,
      KeyConditionExpression: 'GSI_PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ALL_ORDERS' },
      ScanIndexForward: false,
    })
  );

  const orders = result.Items ?? [];

  // Monthly aggregation
  const monthlyMap: Record<string, { orders: number; revenue: number }> = {};
  const locationMap: Record<string, { orders: number; revenue: number }> = {};

  for (const order of orders) {
    if (order.status === 'CANCELLED') continue;

    const month = format(new Date(order.createdAt), 'MMM yyyy');
    if (!monthlyMap[month]) monthlyMap[month] = { orders: 0, revenue: 0 };
    monthlyMap[month].orders += 1;
    if (order.status === 'DELIVERED') {
      monthlyMap[month].revenue += order.total ?? 0;
    }

    const loc = order.locationName || 'Unknown';
    if (!locationMap[loc]) locationMap[loc] = { orders: 0, revenue: 0 };
    locationMap[loc].orders += 1;
    if (order.status === 'DELIVERED') {
      locationMap[loc].revenue += order.total ?? 0;
    }
  }

  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ month, ...data }))
    .slice(-12); // Last 12 months

  const locationBreakdown = Object.entries(locationMap)
    .map(([locationName, data]) => ({ locationName, ...data }))
    .sort((a, b) => b.orders - a.orders);

  const totalOrders = orders.filter((o) => o.status !== 'CANCELLED').length;
  
  // Total Revenue: STRICTLY orders that have been DELIVERED
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const dispatchedOrders = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const pendingDispatchOrders = orders.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status)).length;
  const unclaimedOrders = orders.filter((o) => o.status === 'UNCLAIMED').length;

  return NextResponse.json({
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    dispatchedOrders,
    pendingDispatchOrders,
    unclaimedOrders,
    monthlyData,
    locationBreakdown,
    rawOrders: orders,
  });
}
