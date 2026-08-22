'use client';
// src/app/(admin)/admin/page.tsx — Admin Dashboard (Royal Enterprise Light Theme)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  dispatchedOrders: number;
  pendingDispatchOrders: number;
  unclaimedOrders: number;
  recentOrders: Array<{ orderId: string; userName: string; total: number; status: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const { user, isAdmin, isDelivery, loading, idToken } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (isDelivery && !isAdmin) router.push('/delivery');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, isDelivery, loading, router]);

  useEffect(() => {
    if (!idToken || !isAdmin) return;
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => {
        setStats({
          totalOrders: d.totalOrders ?? 0,
          totalRevenue: d.totalRevenue ?? 0,
          dispatchedOrders: d.dispatchedOrders ?? 0,
          pendingDispatchOrders: d.pendingDispatchOrders ?? 0,
          unclaimedOrders: d.unclaimedOrders ?? 0,
          recentOrders: (d.rawOrders || []).slice(0, 5),
        });
        setFetching(false);
      });
  }, [idToken, isAdmin]);

  if (loading || !isAdmin) return null;

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', sub: 'All non-cancelled', icon: '📋', color: 'var(--color-royal-blue)' },
    { label: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toFixed(2)}` : '—', sub: 'Delivered Orders Only', icon: '💰', color: 'var(--color-royal-gold)' },
    { label: 'Dispatched Orders', value: stats?.dispatchedOrders ?? '—', sub: 'Out for delivery', icon: '🛵', color: '#8b5cf6' },
    { label: 'Pending Dispatch', value: stats?.pendingDispatchOrders ?? '—', sub: 'Kitchen / Preparing', icon: '⏳', color: '#f59e0b' },
    { label: 'Unclaimed Orders', value: stats?.unclaimedOrders ?? '—', sub: 'Customer uncollected', icon: '⚠️', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '24px 20px 80px', overflow: 'auto' }}>
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px', borderBottom: '2px solid var(--color-royal-gold)', paddingBottom: '12px' }}>
            <h1 className="font-royal" style={{ fontSize: '26px', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              ADMIN DASHBOARD
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              SAP Portal Control Center • SRM Tiruchirappalli Canteen Operations
            </p>
          </div>

          {/* Metric KPI Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`sap-card stagger-${i + 1}`}
                style={{
                  padding: '20px',
                  borderTop: `4px solid ${card.color}`,
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{card.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: card.color, marginBottom: '4px' }}>
                  {fetching ? <div className="skeleton" style={{ height: '28px', width: '80px' }} /> : card.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Action Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { href: '/admin/orders', label: 'Manage Orders', desc: 'View live orders & verify OTP delivery', icon: '📋' },
              { href: '/admin/delivery-staff', label: 'Delivery Staff', desc: 'Assign Gmail IDs for delivery personnel', icon: '🛵' },
              { href: '/admin/menu', label: 'Manage Menu', desc: 'Add, edit or disable canteen food items', icon: '🍽️' },
              { href: '/admin/locations', label: 'Manage Locations', desc: 'Configure campus delivery blocks & hostels', icon: '📍' },
              { href: '/admin/analytics', label: 'Analytics & Reports', desc: 'Revenue insights & CSV order exports', icon: '📈' },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="sap-card"
                style={{
                  textDecoration: 'none',
                  padding: '20px',
                  display: 'block',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{action.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '4px' }}>{action.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{action.desc}</div>
              </Link>
            ))}
          </div>

          {/* Recent Orders Table Container */}
          <div className="sap-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)' }}>Recent Orders</h3>
              <Link href="/admin/orders" style={{ fontSize: '13px', color: 'var(--color-royal-blue)', fontWeight: 600, textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            {fetching ? (
              <div style={{ padding: '20px' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '40px', marginBottom: '8px', borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            ) : (
              <div>
                {(stats?.recentOrders || []).map(order => (
                  <Link
                    key={order.orderId}
                    href="/admin/orders"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      textDecoration: 'none',
                      color: 'var(--color-text-primary)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-royal-blue)' }}>{order.userName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#{order.orderId?.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-royal-gold)' }}>₹{order.total?.toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{order.status}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
