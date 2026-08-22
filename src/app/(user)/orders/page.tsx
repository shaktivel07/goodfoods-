'use client';
// src/app/(user)/orders/page.tsx — Order History (Royal Light SAP Fiori Theme)

import { useState, useEffect } from 'react';
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
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending Confirmation',
  CONFIRMED: 'Kitchen Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const { user, isDelivery, isAdmin, idToken, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

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
      .then(d => { setOrders(d.orders || []); setFetching(false); });
  }, [idToken]);

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
        <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 className="font-royal animate-fade-in" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', marginBottom: '20px', fontWeight: 700 }}>
            📦 MY ORDER HISTORY
          </h1>

          {orders.length === 0 ? (
            <div className="sap-card animate-fade-in" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
              <h2 style={{ fontSize: '18px', color: 'var(--color-royal-blue)', marginBottom: '8px', fontWeight: 700 }}>No orders found</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                You haven&apos;t placed any campus food orders yet.
              </p>
              <Link href="/menu" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                Order Fresh Food
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map((order, idx) => (
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
                    <div>
                      <span className={STATUS_COLORS[order.status]} style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 700 }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
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
