'use client';
// src/app/(admin)/admin/analytics/page.tsx — Revenue charts + CSV export (Royal Light SAP Theme)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { AnalyticsSummary } from '@/lib/types';

const CHART_COLORS = ['#0f2b46', '#c59b27', '#005a9e', '#107e3e', '#6b21a8', '#9c6800'];

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="sap-card" style={{ padding: '20px', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { user, isAdmin, loading, idToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [rawOrders, setRawOrders] = useState<Array<Record<string, unknown>>>([]);
  const [fetching, setFetching] = useState(true);
  const [exportMonth, setExportMonth] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (!idToken || !isAdmin) return;
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => {
        setData({
          totalOrders: d.totalOrders ?? 0,
          totalRevenue: d.totalRevenue ?? 0,
          dispatchedOrders: d.dispatchedOrders ?? 0,
          pendingDispatchOrders: d.pendingDispatchOrders ?? 0,
          unclaimedOrders: d.unclaimedOrders ?? 0,
          monthlyData: d.monthlyData || [],
          locationBreakdown: d.locationBreakdown || [],
        });
        setRawOrders(d.rawOrders || []);
        setFetching(false);
      });
  }, [idToken, isAdmin]);

  const downloadCSV = () => {
    const filtered = exportMonth
      ? rawOrders.filter(o => new Date(o.createdAt as string).toLocaleString('en-US', { month: 'short', year: 'numeric' }) === exportMonth)
      : rawOrders;

    const headers = ['OrderID', 'UserName', 'UserEmail', 'UserPhone', 'Location', 'Items', 'Total', 'Status', 'PaymentMethod', 'CreatedAt'];
    const rows = filtered.map(o => [
      (o.orderId as string)?.slice(0, 8).toUpperCase(),
      o.userName,
      o.userEmail,
      o.userPhone,
      o.locationName,
      (o.items as Array<{name:string;quantity:number}>)?.map(i => `${i.name}(${i.quantity})`).join(' | '),
      `₹${(o.total as number)?.toFixed(2)}`,
      o.status,
      o.paymentMethod,
      new Date(o.createdAt as string).toLocaleString('en-IN'),
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(String).map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `srm_goodfoods_orders_${exportMonth || 'all'}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const tooltipStyle = { background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#1e293b', boxShadow: 'var(--shadow-card)' };

  if (loading || !isAdmin) return null;

  const monthOptions = Array.from(new Set(rawOrders.map(o => new Date(o.createdAt as string).toLocaleString('en-US', { month: 'short', year: 'numeric' })))).sort();

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '24px 20px 80px', overflow: 'auto' }}>
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', borderBottom: '2px solid var(--color-royal-gold)', paddingBottom: '12px' }}>
            <h1 className="font-royal" style={{ fontSize: '26px', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              ANALYTICS & REPORTS
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Revenue insights, order trends, and exportable financial data
            </p>
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {fetching ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />)
            ) : (
              <>
                <StatCard label="Total Orders" value={data?.totalOrders ?? 0} icon="📋" color="var(--color-royal-blue)" />
                <StatCard label="Total Revenue" value={`₹${(data?.totalRevenue ?? 0).toFixed(2)}`} icon="💰" color="var(--color-royal-gold)" />
                <StatCard label="Avg Order Value" value={data?.totalOrders ? `₹${((data.totalRevenue) / data.totalOrders).toFixed(2)}` : '₹0'} icon="📊" color="var(--color-info)" />
              </>
            )}
          </div>

          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-md)' }} />)}
            </div>
          ) : (
            <>
              {/* Monthly Orders Bar Chart */}
              <div className="sap-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px' }}>📊 Monthly Orders Volume</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data?.monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="orders" fill="var(--color-royal-blue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Line Chart */}
              <div className="sap-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px' }}>💰 Monthly Revenue Trend (₹)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data?.monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(val: unknown) => [`₹${Number(val || 0).toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-royal-gold)" strokeWidth={3} dot={{ fill: 'var(--color-royal-gold)', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Location Breakdown Pie & Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="sap-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px' }}>📍 Orders by Location</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data?.locationBreakdown}
                        dataKey="orders"
                        nameKey="locationName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {(data?.locationBreakdown || []).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="sap-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px' }}>Top Delivery Zones</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(data?.locationBreakdown || []).slice(0, 5).map((loc, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span style={{ fontWeight: 600, color: 'var(--color-royal-blue)' }}>{loc.locationName}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--color-royal-gold)' }}>₹{loc.revenue.toFixed(0)} · {loc.orders} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CSV Export Box */}
              <div className="royal-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>📥 Export Orders Transaction Ledger (CSV)</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Download official order details for auditing and accounting reports.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    className="input"
                    style={{ maxWidth: '220px' }}
                    value={exportMonth}
                    onChange={e => setExportMonth(e.target.value)}
                  >
                    <option value="">All months</option>
                    {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button id="export-csv-btn" onClick={downloadCSV} className="btn btn-gold" style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}>
                    📥 Download CSV {exportMonth ? `(${exportMonth})` : '(All)'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
