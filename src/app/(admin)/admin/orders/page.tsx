'use client';
// src/app/(admin)/admin/orders/page.tsx — Real-time order management with date + status filters

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'UNCLAIMED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  OUT_FOR_DELIVERY: 'badge-outfordelivery',
  DELIVERED: 'badge-delivered',
  CANCELLED: 'badge-cancelled',
  UNCLAIMED: 'badge-cancelled',
};

const STATUS_LABELS: Record<string, string> = {
  ALL: 'All',
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

export default function AdminOrdersPage() {
  const { user, isAdmin, isDelivery, loading, idToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (isDelivery && !isAdmin) router.push('/delivery');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, isDelivery, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!idToken || !isAdmin) return;
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${idToken}` } });
    const d = await res.json();
    setOrders(d.orders || []);
    setFetching(false);
    setLastRefresh(new Date());
  }, [idToken, isAdmin]);

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

  // Combined filter + search + date
  const displayOrders = useMemo(() => {
    let result = [...orders];

    // Status tab
    if (activeTab !== 'ALL') {
      result = result.filter(o => o.status === activeTab);
    }

    // Date from
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }

    // Date to
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(o =>
        o.orderId?.toLowerCase().includes(q) ||
        o.userName?.toLowerCase().includes(q) ||
        o.userPhone?.toLowerCase().includes(q) ||
        o.locationName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeTab, dateFrom, dateTo, searchQuery]);

  const hasActiveFilters = dateFrom || dateTo || searchQuery.trim();

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
  };

  // Quick date shortcuts
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateFrom(today);
    setDateTo(today);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().split('T')[0];
    setDateFrom(y);
    setDateTo(y);
  };

  const setThisWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    setDateFrom(monday.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
  };

  if (loading || !isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main className="admin-main">
        <div className="animate-fade-in">

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '24px', marginBottom: '2px' }}>📋 Order Management</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                Auto-refreshes every 10s · Last: {lastRefresh.toLocaleTimeString('en-IN')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-ghost"
                style={{
                  padding: '8px 14px', fontSize: '13px',
                  background: showFilters || hasActiveFilters ? 'var(--color-royal-blue)' : undefined,
                  color: showFilters || hasActiveFilters ? '#fff' : undefined,
                  borderColor: showFilters || hasActiveFilters ? 'var(--color-royal-blue)' : undefined,
                }}
              >
                🗓️ Filters {hasActiveFilters ? '●' : ''}
              </button>
              <button onClick={fetchOrders} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Date Filter Panel — collapsible */}
          {showFilters && (
            <div className="sap-card animate-scale-in" style={{ padding: '16px 20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)' }}>📅 DATE FILTER</span>
                {/* Quick shortcuts */}
                {[
                  { label: 'Today', fn: setToday },
                  { label: 'Yesterday', fn: setYesterday },
                  { label: 'This Week', fn: setThisWeek },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={s.fn}
                    style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)', background: '#f8fafc',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      color: 'var(--color-royal-blue)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', border: 'none', background: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#bb0000' }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              <div className="filter-grid">
                <div>
                  <div className="form-label" style={{ marginBottom: '4px' }}>FROM DATE</div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="input"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <div className="form-label" style={{ marginBottom: '4px' }}>TO DATE</div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="input"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="form-label" style={{ marginBottom: '4px' }}>SEARCH (ID · NAME · PHONE · LOCATION)</div>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Active filter summary */}
              {hasActiveFilters && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {dateFrom && (
                    <span style={{ padding: '3px 10px', background: '#e8f3ff', color: '#005a9e', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                      From: {new Date(dateFrom).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {dateTo && (
                    <span style={{ padding: '3px 10px', background: '#e8f3ff', color: '#005a9e', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                      To: {new Date(dateTo).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  {searchQuery && (
                    <span style={{ padding: '3px 10px', background: '#fff8e5', color: '#9c6800', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                      "{searchQuery}"
                    </span>
                  )}
                  <span style={{ padding: '3px 10px', background: '#e5f9ed', color: '#107e3e', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
                    {displayOrders.length} result{displayOrders.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Status Tabs */}
          <div className="scroll-pills" style={{ marginBottom: '20px' }}>
            {STATUS_TABS.map(tab => {
              const count = tab === 'ALL' ? orders.length : orders.filter(o => o.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid',
                    borderColor: activeTab === tab ? 'var(--color-royal-blue)' : 'var(--color-border)',
                    background: activeTab === tab ? 'var(--color-royal-blue)' : '#ffffff',
                    color: activeTab === tab ? '#ffffff' : 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.18s ease',
                    minHeight: '36px',
                  }}
                >
                  {STATUS_ICONS[tab]} {STATUS_LABELS[tab]} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Results count */}
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px', fontWeight: 600 }}>
            Showing {displayOrders.length} of {orders.length} orders
          </div>

          {/* Order Cards */}
          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : displayOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>No orders match the current filters.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost" style={{ marginTop: '16px', fontSize: '13px' }}>
                  ✕ Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="sap-card"
                  style={{ padding: '18px 20px' }}
                >
                  {/* Order Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '2px' }}>
                        #{order.orderId?.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                        {order.userName} · {order.userPhone}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📍 {order.locationName}</span>
                        <span>🕐 {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={STATUS_COLORS[order.status]} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, display: 'inline-block', marginBottom: '4px' }}>
                        {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-royal-gold)' }}>₹{order.total?.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', padding: '8px 14px', marginBottom: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {order.status === 'PENDING' && (
                      <button onClick={() => handleStatusUpdate(order, 'CONFIRMED')} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px', color: '#005a9e', borderColor: 'rgba(0,90,158,0.3)' }}>
                        👨‍🍳 Confirm
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button onClick={() => handleStatusUpdate(order, 'OUT_FOR_DELIVERY')} className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px', color: '#6b21a8', borderColor: 'rgba(107,33,168,0.3)' }}>
                        🛵 Dispatch
                      </button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <div style={{ fontSize: '13px', color: '#6b21a8', background: '#f3e8ff', padding: '8px 12px', borderRadius: '6px', fontWeight: 600 }}>
                        🛵 Dispatched · OTP verification in Delivery Portal
                      </div>
                    )}
                    {!['DELIVERED', 'CANCELLED', 'UNCLAIMED'].includes(order.status) && (
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
