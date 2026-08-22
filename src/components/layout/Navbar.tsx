'use client';
// src/components/layout/Navbar.tsx — SAP Shell Bar / Royal Light Header

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, isAdmin, isDelivery, signOut } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '2px solid var(--color-royal-gold)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="page-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Brand Logo & Name */}
        <Link href={isDelivery && !isAdmin ? "/delivery" : "/menu"} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div
            style={{
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid var(--color-royal-gold)',
              background: 'var(--color-royal-gold-bg)',
            }}
          >
            <Image src="/goodfoods.PNG" alt="SRM Good Foods" width={34} height={34} style={{ borderRadius: '6px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <span
              className="font-royal"
              style={{
                fontSize: '18px',
                color: 'var(--color-royal-blue)',
                fontWeight: 700,
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              SRM GOOD FOODS
            </span>
          </div>
        </Link>

        {/* Location Badge (Mobile & Desktop) - Hidden for Delivery-only Staff */}
        {profile?.locationName && (!isDelivery || isAdmin) && (
          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: '#f8fafc',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              color: 'var(--color-royal-blue)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '14px' }}>📍</span>
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.locationName}
            </span>
          </Link>
        )}

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(isDelivery || isAdmin) && (
              <Link href="/delivery" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px', color: 'var(--color-royal-gold-dark)', fontWeight: 700 }}>
                🛵 Delivery Portal
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px' }}>
                ⚙️ Admin
              </Link>
            )}
            {(!isDelivery || isAdmin) && (
              <>
                <Link href="/menu" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px' }}>
                  🍽️ Menu
                </Link>
                <Link href="/cart" className="btn btn-ghost" style={{ position: 'relative', fontSize: '13px', padding: '8px 14px' }}>
                  🛒 Cart
                  {totalItems > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--color-royal-gold)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
                <Link href="/orders" className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 14px' }}>
                  📦 Orders
                </Link>
              </>
            )}
          </div>

          {/* Profile Dropdown Button */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontSize: '18px' }}>👤</span>
                )}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--color-royal-blue)',
                  }}
                >
                  {profile?.name?.split(' ')[0] || 'Profile'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>▾</span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  className="animate-scale-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderTop: '3px solid var(--color-royal-blue)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '200px',
                    boxShadow: 'var(--shadow-elevated)',
                    overflow: 'hidden',
                    zIndex: 200,
                  }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-royal-blue)' }}>{profile?.name || 'User'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user?.email}</div>
                  </div>

                  {(isDelivery || isAdmin) && (
                    <Link
                      href="/delivery"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: 'var(--color-royal-gold-dark)',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      🛵 Delivery Portal
                    </Link>
                  )}

                  {(!isDelivery || isAdmin) && (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        👤 My Profile & Delivery Address
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        📦 My Orders
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: 'var(--color-royal-blue)',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      ⚙️ Admin Portal
                    </Link>
                  )}

                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#bb0000',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#ffebeb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
