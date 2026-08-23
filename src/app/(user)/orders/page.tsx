'use client';
// src/app/(user)/orders/page.tsx — Order History with Filters

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  OUT_FOR_DELIVERY: 'badge-outfordelivery',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
  UNCLAIMED: 'badge-cancelled',
};

const STATUS_LABELS: Record<string, string> = {
  ALL: 'All Orders',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  UNCLAIMED: 'Unclaimed',
};

const STATUS_ICONS: Record<string, string> = {
  ALL: '📋',
  PENDING: '⏳',
  CONFIRMED: '✅',
  OUT_FOR_DELIVERY: '🛵',
  DELIVERED: '📦',
  CANCELLED: '❌',
  UNCLAIMED: '🚫',
};

export default function OrdersPage() {
  const { user, isDelivery, isAdmin, idToken, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return; }
      if (isDelivery && !isAdmin) { router.push('/delivery'); return; }
    }
  }, [user, isDelivery, isAdmin, loading, router]);

  useEffect(() => {
    if (!idToken) return;
    fetch('/api/orders', { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setFetching(false); })
      .catch(() => setFetching(false));
  }, [idToken]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Date from filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }

    // Date to filter
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }

    // Search by order ID
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.locationName?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest': return b.total - a.total;
        case 'lowest': return a.total - b.total;
        default: return 0;
      }
    });

    return result;
  }, [orders, statusFilter, dateFrom, dateTo, sortOrder, searchQuery]);

  const clearFilters = () => {
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSortOrder('newest');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'ALL' || dateFrom || dateTo || sortOrder !== 'newest' || searchQuery;

  if (loading || fetching) return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="animate-spin-custom" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-royal-blue)', borderRadius: '50%' }} />
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px 16px 90px' }}>
        <div className="page-container" style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h1 className="font-royal animate-fade-in" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              📦 MY ORDERS
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', background: '#f8fafc', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
              {filteredOrders.length} of {orders.length} orders
            </span>
          </div>

          {/* Filter Panel */}
          <div className="sap-card animate-fade-in" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)' }}>🔍 FILTERS</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{ fontSize: '11px', color: 'var(--color-royal-gold-dark)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                >
                  ✕ Clear All
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {Object.keys(STATUS_LABELS).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: statusFilter === s ? '2px solid var(--color-royal-blue)' : '1px solid var(--color-border)',
                    background: statusFilter === s ? 'var(--color-royal-blue)' : '#f8fafc',
                    color: statusFilter === s ? '#ffffff' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {STATUS_ICONS[s]} {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Date + Sort + Search Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>FROM DATE</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    background: '#fff',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>TO DATE</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    background: '#fff',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>SORT BY</label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    background: '#fff',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>SEARCH</label>
                <input
                  type="text"
                  placeholder="Order ID or location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '13px',
                    background: '#fff',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Order List */}
          {filteredOrders.length === 0 ? (
            <div className="sap-card animate-fade-in" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
              <h2 style={{ fontSize: '18px', color: 'var(--color-royal-blue)', marginBottom: '8px', fontWeight: 700 }}>
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                {orders.length === 0 ? "You haven&apos;t placed any food orders yet." : 'Try adjusting your filters above.'}
              </p>
              {orders.length === 0 ? (
                <Link href="/menu" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                  Order Fresh Food
                </Link>
              ) : (
                <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredOrders.map((order, idx) => (
                <Link
                  key={order.orderId}
                  href={`/orders/${order.orderId}`}
                  className={`sap-card animate-fade-in stagger-${(idx % 4) + 1}`}
                  style={{
                    textDecoration: 'none',
                    padding: '18px',
                    display: 'block',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '2px' }}>
                        Order #{order.orderId.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <span
                      className={STATUS_COLORS[order.status]}
                      style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700 }}
                    >
                      {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 📍 {order.locationName}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-royal-gold)' }}>
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
