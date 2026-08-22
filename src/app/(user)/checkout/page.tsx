'use client';
// src/app/(user)/checkout/page.tsx — Royal Checkout Page

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { user, profile, isDelivery, isAdmin, idToken, loading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [locations, setLocations] = useState<Array<{ locationId: string; name: string; building: string; floor: string }>>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return; }
      if (isDelivery && !isAdmin) { router.push('/delivery'); return; }
      if (!profile?.phone) { router.push('/profile'); return; }
      if (items.length === 0) { router.push('/menu'); return; }
    }
  }, [user, profile, isDelivery, isAdmin, loading, items, router]);

  useEffect(() => {
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        const list = d.locations || [];
        setLocations(list);
        if (profile?.locationId) {
          setSelectedLocationId(profile.locationId);
          const found = list.find((l: { locationId: string }) => l.locationId === profile.locationId);
          setSelectedLocationName(found ? found.name : profile.locationName || '');
        } else if (list.length > 0) {
          setSelectedLocationId(list[0].locationId);
          setSelectedLocationName(list[0].name);
        }
      });
  }, [profile]);

  const handleLocationChange = (locId: string) => {
    setSelectedLocationId(locId);
    const found = locations.find((l) => l.locationId === locId);
    setSelectedLocationName(found ? found.name : '');
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!selectedLocationId) {
      setError('Please select a delivery location for this order.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          items,
          locationId: selectedLocationId,
          locationName: selectedLocationName,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Order placement failed.'); return; }
      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px 16px 90px' }}>
        <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 className="font-royal animate-fade-in" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', marginBottom: '6px', fontWeight: 700 }}>
            🧾 CHECKOUT & REVIEW
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Confirm delivery details and submit your campus food order.
          </p>

          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Delivery Location Selector Card */}
            <div className="royal-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)' }}>📍 Delivery Destination for this Order</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-royal-gold-dark)', fontWeight: 600 }}>Defaulted from account</span>
              </div>

              <div style={{ display: 'grid', gap: '12px', fontSize: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Customer Name</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{profile?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Contact Mobile</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>+91 {profile?.phone}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
                  Select / Change Campus Delivery Block for this Order:
                </label>
                <select
                  className="input"
                  value={selectedLocationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  style={{ fontWeight: 600, color: 'var(--color-royal-blue)' }}
                >
                  <option value="">— Select Delivery Location —</option>
                  {locations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationId}>
                      📍 {loc.name}{loc.building ? ` (${loc.building})` : ''}{loc.floor ? ` - ${loc.floor}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="sap-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '14px' }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map(item => (
                  <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-royal-blue)' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-royal-blue)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '17px', color: 'var(--color-royal-blue)' }}>
                <span>Total Amount Due</span>
                <span style={{ color: 'var(--color-royal-gold)' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="sap-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '14px' }}>Payment Option</h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--color-royal-gold)',
                  background: '#fffdf5',
                }}
              >
                <span style={{ fontSize: '24px' }}>💵</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-royal-blue)', fontSize: '14px' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Pay in cash directly upon campus block delivery</div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: '#ffebeb', border: '1px solid #ffb3b3', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '13px', color: '#bb0000', fontWeight: 600 }}>
                ❌ {error}
              </div>
            )}

            {/* Submit Action */}
            <button
              id="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="btn btn-gold"
              style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700 }}
            >
              {submitting ? '⏳ Submitting Order...' : `✅ Confirm Order — ₹${totalPrice.toFixed(2)}`}
            </button>

            <button onClick={() => router.push('/cart')} className="btn btn-ghost" style={{ width: '100%' }}>
              ← Return to Cart
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
