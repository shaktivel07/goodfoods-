'use client';
// src/app/(user)/orders/[orderId]/page.tsx — Live order tracking with OTP display (Royal Light SAP Theme)

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

const STATUS_STEPS = [
  { key: 'PENDING',          label: 'Order Placed',      icon: '✅' },
  { key: 'CONFIRMED',        label: 'Confirmed',         icon: '👨‍🍳' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',  icon: '🛵' },
  { key: 'DELIVERED',        label: 'Delivered',         icon: '🎉' },
];

function StatusStepper({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '28px' }}>
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '60px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: done ? 'var(--color-royal-blue)' : '#f1f5f9',
                  border: done ? '2px solid var(--color-royal-gold)' : '1px solid var(--color-border)',
                  color: done ? '#ffffff' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: active ? '18px' : '15px',
                  boxShadow: active ? 'var(--shadow-glow-royal)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {step.icon}
              </div>
              <span style={{ fontSize: '11px', textAlign: 'center', color: done ? 'var(--color-royal-blue)' : 'var(--color-text-muted)', fontWeight: done ? 700 : 400 }}>
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '3px',
                  background: idx < currentIdx ? 'var(--color-royal-gold)' : 'var(--color-border)',
                  marginBottom: '20px',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { user, idToken, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!idToken) return;
    const res = await fetch(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    }
    setFetching(false);
  }, [idToken, orderId]);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading || fetching) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="animate-spin-custom" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-royal-blue)', borderRadius: '50%' }} />
    </div>
  );

  if (!order) return (
    <>
      <Navbar />
      <main style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>❓</div>
          <h2 style={{ marginBottom: '8px', color: 'var(--color-royal-blue)' }}>Order not found</h2>
          <Link href="/orders" className="btn btn-primary" style={{ padding: '12px 24px' }}>View All Orders</Link>
        </div>
      </main>
    </>
  );

  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <>
      <Navbar />
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px 16px 90px' }}>
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '6px' }}>
                {isDelivered ? '🎉' : isCancelled ? '❌' : '🛵'}
              </div>
              <h1 className="font-royal" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', marginBottom: '4px', fontWeight: 700 }}>
                {isDelivered ? 'Order Delivered!' : isCancelled ? 'Order Cancelled' : 'LIVE ORDER TRACKING'}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Order #{order.orderId.slice(0, 8).toUpperCase()} • {new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Stepper */}
            {!isCancelled && <StatusStepper status={order.status} />}

            {/* OTP Card */}
            {!isDelivered && !isCancelled && (
              <div
                className="gold-accent-card"
                style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  background: '#fffdf5',
                }}
              >
                <p style={{ fontSize: '12px', color: 'var(--color-royal-gold-dark)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Delivery Verification OTP
                </p>
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    letterSpacing: '10px',
                    color: 'var(--color-royal-blue)',
                    marginBottom: '8px',
                    fontFamily: 'monospace',
                  }}
                >
                  {order.otp}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
                  📢 Share this 6-digit PIN with the delivery executive upon receiving your package.
                </p>
              </div>
            )}

            {isDelivered && (
              <div style={{ background: '#e5f9ed', border: '1px solid #bcf0cf', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ color: '#107e3e', fontWeight: 700, fontSize: '14px' }}>✅ Delivered successfully! Thank you for ordering with SRM Good Foods.</p>
              </div>
            )}

            {/* Order Detail Summary */}
            <div className="sap-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '14px' }}>Order Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map(item => (
                  <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-royal-blue)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '16px', color: 'var(--color-royal-blue)' }}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--color-royal-gold)' }}>₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/orders" className="btn btn-ghost" style={{ flex: 1, padding: '12px' }}>
                📦 All Orders
              </Link>
              <Link href="/menu" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                🍽️ Order Again
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
