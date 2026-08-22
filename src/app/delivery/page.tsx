'use client';
// src/app/delivery/page.tsx — Mobile-First Delivery Staff Portal

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';

const STATUS_TABS = ['DISPATCHED', 'PENDING', 'DELIVERED', 'UNCLAIMED', 'ALL'];

export default function DeliveryPortalPage() {
  const { user, isDelivery, isAdmin, loading, idToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('DISPATCHED');
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [successMap, setSuccessMap] = useState<Record<string, string>>({});

  const canAccess = isDelivery || isAdmin;

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
    }
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!idToken || !canAccess) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setFetching(false);
    }
  }, [idToken, canAccess]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto refresh every 10 seconds for real-time order updates
  useEffect(() => {
    if (!canAccess) return;
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [canAccess, fetchOrders]);

  const handleVerifyOtp = async (order: Order) => {
    const enteredOtp = (otpInputs[order.orderId] || '').trim();
    if (!enteredOtp) {
      setErrorMap((prev) => ({ ...prev, [order.orderId]: 'Please enter the customer OTP' }));
      return;
    }

    setSubmittingId(order.orderId);
    setErrorMap((prev) => ({ ...prev, [order.orderId]: '' }));

    try {
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          userEmail: order.userEmail,
          enteredOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMap((prev) => ({ ...prev, [order.orderId]: data.error || 'Invalid OTP' }));
        return;
      }

      setSuccessMap((prev) => ({ ...prev, [order.orderId]: '✅ Delivered Successfully!' }));
      setTimeout(() => fetchOrders(), 1200);
    } catch {
      setErrorMap((prev) => ({ ...prev, [order.orderId]: 'Network error. Try again.' }));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleMarkUnclaimed = async (order: Order) => {
    if (!confirm(`Mark Order #${order.orderId.slice(0, 8).toUpperCase()} as "UNCLAIMED" (Customer did not pick up)?`)) return;

    setSubmittingId(order.orderId);
    setErrorMap((prev) => ({ ...prev, [order.orderId]: '' }));

    try {
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          userEmail: order.userEmail,
          status: 'UNCLAIMED',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMap((prev) => ({ ...prev, [order.orderId]: data.error || 'Failed to update status' }));
        return;
      }

      setSuccessMap((prev) => ({ ...prev, [order.orderId]: '⚠️ Marked as Unclaimed' }));
      setTimeout(() => fetchOrders(), 1200);
    } catch {
      setErrorMap((prev) => ({ ...prev, [order.orderId]: 'Network error. Try again.' }));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return null;

  if (!canAccess) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
        <Navbar />
        <main className="page-container" style={{ paddingTop: '60px', paddingBottom: '60px', textAlign: 'center' }}>
          <div className="sap-card" style={{ padding: '40px 20px', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 className="font-royal" style={{ color: 'var(--color-royal-blue)', fontSize: '20px', marginBottom: '8px' }}>
              Access Restricted
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Your Gmail address (<b>{user?.email}</b>) is not authorized as delivery personnel. Contact your SRM Good Foods Admin to request delivery role access.
            </p>
            <button onClick={() => router.push('/menu')} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              ← Return to Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'DISPATCHED') return o.status === 'OUT_FOR_DELIVERY';
    if (activeTab === 'PENDING') return o.status === 'PENDING' || o.status === 'CONFIRMED';
    if (activeTab === 'DELIVERED') return o.status === 'DELIVERED';
    if (activeTab === 'UNCLAIMED') return o.status === 'UNCLAIMED';
    return true; // ALL
  });

  const dispatchedCount = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const pendingCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const unclaimedCount = orders.filter((o) => o.status === 'UNCLAIMED').length;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="page-container" style={{ paddingTop: '24px', paddingBottom: '80px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-royal" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛵 DELIVERY PORTAL
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              SRM Campus Order Dispatch & OTP Verification
            </p>
          </div>
          <button onClick={fetchOrders} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>
            🔄 Refresh
          </button>
        </div>

        {/* Tab Badges */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
          {[
            { id: 'DISPATCHED', label: `🛵 Dispatched (${dispatchedCount})` },
            { id: 'PENDING', label: `⏳ Kitchen (${pendingCount})` },
            { id: 'DELIVERED', label: `✅ Delivered (${deliveredCount})` },
            { id: 'UNCLAIMED', label: `⚠️ Unclaimed (${unclaimedCount})` },
            { id: 'ALL', label: `📋 All (${orders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'var(--color-royal-gold)' : 'var(--color-border)',
                background: activeTab === tab.id ? 'var(--color-royal-blue)' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-primary)',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="sap-card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <p style={{ fontSize: '15px', fontWeight: 600 }}>No orders found under {activeTab}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => {
              const error = errorMap[order.orderId];
              const success = successMap[order.orderId];
              const isSubmitting = submittingId === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="sap-card"
                  style={{
                    padding: '20px',
                    borderLeft: order.status === 'OUT_FOR_DELIVERY' ? '5px solid #8b5cf6' : order.status === 'DELIVERED' ? '5px solid #22c55e' : order.status === 'UNCLAIMED' ? '5px solid #ef4444' : '5px solid var(--color-border)',
                  }}
                >
                  {/* Top Bar of Order Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-royal-blue)' }}>
                        #{order.orderId?.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                        👤 {order.userName}
                      </div>
                      <a href={`tel:${order.userPhone}`} style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: '2px' }}>
                        📞 {order.userPhone}
                      </a>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: order.status === 'OUT_FOR_DELIVERY' ? '#f3e8ff' : order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'UNCLAIMED' ? '#fee2e2' : '#f1f5f9',
                          color: order.status === 'OUT_FOR_DELIVERY' ? '#6b21a8' : order.status === 'DELIVERED' ? '#166534' : order.status === 'UNCLAIMED' ? '#991b1b' : '#334155',
                          marginBottom: '6px',
                        }}
                      >
                        {order.status === 'OUT_FOR_DELIVERY' ? '🛵 OUT FOR DELIVERY' : order.status}
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-royal-gold-dark)' }}>
                        ₹{order.total?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Location Highlight */}
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#fffbe6',
                      border: '1px solid #ffe58f',
                      borderRadius: '8px',
                      marginBottom: '14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#855900',
                    }}
                  >
                    📍 Delivery Location: {order.locationName}
                  </div>

                  {/* Order Items */}
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <b>Items:</b> {order.items?.map((item) => `${item.name} ×${item.quantity}`).join(' · ')}
                  </div>

                  {/* Action Section for Dispatched Orders */}
                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      {error && (
                        <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '12px', marginBottom: '10px' }}>
                          ⚠️ {error}
                        </div>
                      )}
                      {success && (
                        <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '12px', marginBottom: '10px' }}>
                          {success}
                        </div>
                      )}

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '4px' }}>
                          Enter Customer 4-Digit / 6-Digit OTP:
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="input"
                            placeholder="Enter OTP"
                            maxLength={6}
                            value={otpInputs[order.orderId] || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setOtpInputs((prev) => ({ ...prev, [order.orderId]: val }));
                              setErrorMap((prev) => ({ ...prev, [order.orderId]: '' }));
                            }}
                            style={{
                              fontSize: '18px',
                              letterSpacing: '4px',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              flex: 1,
                            }}
                          />
                          <button
                            onClick={() => handleVerifyOtp(order)}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ padding: '10px 18px', whiteSpace: 'nowrap', fontWeight: 700 }}
                          >
                            {isSubmitting ? '⏳ Verifying...' : '✅ Complete Delivery'}
                          </button>
                        </div>
                      </div>

                      {/* No One Picked Order Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          onClick={() => handleMarkUnclaimed(order)}
                          disabled={isSubmitting}
                          style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#dc2626',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ⚠️ No One Picked Order (Mark Unclaimed)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions for PENDING / CONFIRMED orders */}
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      ⏳ Order is currently being prepared in the kitchen. Once dispatched by kitchen staff, you will be able to deliver it.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
