'use client';
// src/app/(user)/cart/page.tsx — Royal Cart Page

import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';

export default function CartPage() {
  const { user, isDelivery, isAdmin, loading } = useAuth();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return; }
      if (isDelivery && !isAdmin) { router.push('/delivery'); return; }
    }
  }, [user, isDelivery, isAdmin, loading, router]);

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '24px 16px 90px' }}>
        <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 className="font-royal animate-fade-in" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', marginBottom: '20px', fontWeight: 700 }}>
            🛒 YOUR SHOPPING CART
          </h1>

          {items.length === 0 ? (
            <div className="sap-card animate-fade-in" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
              <h2 style={{ fontSize: '18px', color: 'var(--color-royal-blue)', marginBottom: '8px', fontWeight: 700 }}>Your cart is empty</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>
                Explore our gourmet campus menu and add your favorite dishes!
              </p>
              <button onClick={() => router.push('/menu')} className="btn btn-primary" style={{ padding: '12px 28px' }}>
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Item List */}
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, idx) => (
                  <div
                    key={item.itemId}
                    className={`sap-card stagger-${(idx % 4) + 1}`}
                    style={{
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#f1f5f9',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      ) : '🍽️'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '2px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-royal-gold-dark)', fontWeight: 600 }}>₹{item.price.toFixed(2)} each</div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#ffffff',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--color-royal-blue)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div style={{ minWidth: '76px', textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-royal-blue)' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(item.itemId)}
                        style={{ fontSize: '12px', color: '#bb0000', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Box */}
              <div className="royal-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px' }}>Order Breakdown</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  <span>Items ({totalItems})</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  <span>Campus Block Delivery</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                </div>
                
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '14px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--color-royal-blue)' }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--color-royal-gold)' }}>₹{totalPrice.toFixed(2)}</span>
                </div>

                <button
                  id="proceed-checkout-btn"
                  onClick={() => router.push('/checkout')}
                  className="btn btn-gold"
                  style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '20px', fontWeight: 700 }}
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  className="btn btn-ghost"
                  style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '8px' }}
                >
                  ← Add More Items
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
