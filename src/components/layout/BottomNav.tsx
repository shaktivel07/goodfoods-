'use client';
// src/components/layout/BottomNav.tsx — Mobile Bottom Navigation Bar

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, isDelivery, isAdmin } = useAuth();

  if (!user) return null;

  if (isDelivery && !isAdmin) {
    return (
      <div
        className="mobile-only-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#ffffff',
          borderTop: '2px solid var(--color-royal-gold)',
          boxShadow: '0 -4px 16px rgba(15, 43, 70, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '0 8px',
        }}
      >
        <Link
          href="/delivery"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flex: 1,
            height: '100%',
            color: 'var(--color-royal-blue)',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          <span style={{ fontSize: '22px', marginBottom: '2px' }}>🛵</span>
          <span>Delivery Portal</span>
        </Link>
      </div>
    );
  }

  const navItems = [
    { href: '/menu', label: 'Menu', icon: '🍽️' },
    { href: '/cart', label: 'Cart', icon: '🛒', badge: totalItems },
    { href: '/orders', label: 'Orders', icon: '📦' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: '⚙️', badge: 0 });
  }

  return (
    <div
      className="mobile-only-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: '#ffffff',
        borderTop: '2px solid var(--color-royal-gold)',
        boxShadow: '0 -4px 16px rgba(15, 43, 70, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 999,
        padding: '0 8px',
      }}
    >
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/menu' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flex: 1,
              height: '100%',
              position: 'relative',
              color: isActive ? 'var(--color-royal-blue)' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '11px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
            <span>{item.label}</span>
            
            {/* Active Indicator Line */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  background: 'var(--color-royal-gold)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}

            {/* Cart Badge */}
            {item.badge && item.badge > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: 'calc(50% - 18px)',
                  background: 'var(--color-royal-gold)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
