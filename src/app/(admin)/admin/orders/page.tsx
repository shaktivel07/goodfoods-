'use client';
// src/app/(admin)/admin/orders/page.tsx
// Real-time order management with OTP verification

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', OUT_FOR_DELIVERY: 'badge-outfordelivery',
  DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
};

function OTPVerifier({ order, idToken, onSuccess }: { order: Order; idToken: string | null; onSuccess: () => void }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const verify = async () => {
    if (!otp.trim()) { setError('Enter the OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderId: order.orderId, userEmail: order.userEmail, enteredOtp: otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
      setTimeout(onSuccess, 1000);
    } finally { setLoading(false); }
  };

  if (done) return <p style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>✅ Delivered!</p>;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '4px' }}>⚠️ {error}</p>}
        <input
          className="input"
          value={otp}
          onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          style={{ fontSize: '16px', letterSpacing: '4px', fontFamily: 'monospace', padding: '10px 12px' }}
        />
      </div>
      <button onClick={verify} disabled={loading} className="btn btn-primary" style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
        {loading ? '⏳' : '✓ Deliver'}
      </button>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { user, isAdmin, isDelivery, loading, idToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (isDelivery && !isAdmin) router.push('/delivery');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, isDelivery, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!idToken || !isAdmin) return;
    const url = activeTab !== 'ALL' ? `/api/admin/orders?status=${activeTab}` : '/api/admin/orders';
    const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
    const d = await res.json();
    setOrders(d.orders || []);
    setFetching(false);
    setLastRefresh(new Date());
  }, [idToken, isAdmin, activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (order: Order, status: string) => {
    await fetch('/api/admin/orders/deliver', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ orderId: order.orderId, userEmail: order.userEmail, status }),
    });
    fetchOrders();
  };

  if (loading || !isAdmin) return null;

  const displayOrders = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '26px', marginBottom: '4px' }}>📋 Order Management</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Auto-refreshes every 10s · Last: {lastRefresh.toLocaleTimeString('en-IN')}
              </p>
            </div>
            <button onClick={fetchOrders} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
              🔄 Refresh
            </button>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
            {STATUS_TABS.map(tab => {
              const count = tab === 'ALL' ? orders.length : orders.filter(o => o.status === tab).length;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid',
                  borderColor: activeTab === tab ? 'var(--color-primary)' : 'var(--color-border)',
                  background: activeTab === tab ? 'linear-gradient(135deg, var(--color-primary), #dc2626)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {tab.replace('_', ' ')} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : displayOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No orders in this status.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayOrders.map((order) => (
                <div key={order.orderId} style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '20px',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                        #{order.orderId?.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{order.userName} · {order.userPhone}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📍 {order.locationName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={STATUS_COLORS[order.status]} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, display: 'inline-block', marginBottom: '6px' }}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gold)' }}>₹{order.total?.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {order.status === 'PENDING' && (
                      <button onClick={() => handleStatusUpdate(order, 'CONFIRMED')} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' }}>
                        👨‍🍳 Confirm
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button onClick={() => handleStatusUpdate(order, 'OUT_FOR_DELIVERY')} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)' }}>
                        🛵 Dispatch
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <div style={{ fontSize: '13px', color: '#6b21a8', background: '#f3e8ff', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🛵 Dispatched to Delivery Personnel</span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>(OTP verification handled in Delivery Portal)</span>
                      </div>
                    )}
                    {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                      <button onClick={() => handleStatusUpdate(order, 'CANCELLED')} className="btn btn-danger" style={{ fontSize: '13px', padding: '8px 14px', marginLeft: 'auto' }}>
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
