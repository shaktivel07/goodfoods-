'use client';
// src/components/layout/AdminSidebar.tsx — Royal Enterprise Admin Navigation

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📋' },
  { href: '/admin/delivery-staff', label: 'Delivery Staff', icon: '🛵' },
  { href: '/admin/menu', label: 'Menu Items', icon: '🍽️' },
  { href: '/admin/locations', label: 'Locations', icon: '📍' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut, user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar for Admin */}
      <div
        className="mobile-only-admin-nav"
        style={{
          display: 'none',
          background: 'var(--color-royal-blue)',
          borderBottom: '2px solid var(--color-royal-gold)',
          padding: '12px 16px',
          color: '#ffffff',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#ffffff' }}>
            <Image src="/goodfoods.PNG" alt="SRM" width={28} height={28} style={{ borderRadius: '4px', height: 'auto', objectFit: 'contain' }} />
            <span className="font-royal" style={{ fontSize: '15px', color: 'var(--color-royal-gold)', fontWeight: 700 }}>
              SRM Admin
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-royal-gold)',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? '✕ Close' : '☰ Navigation'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.8)',
                      background: isActive ? 'var(--color-royal-gold)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Link href="/menu" style={{ fontSize: '12px', color: 'var(--color-royal-gold)', textDecoration: 'none' }}>
                ← Store View
              </Link>
              <button
                onClick={signOut}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff8888',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside
        className="desktop-admin-sidebar"
        style={{
          width: '240px',
          minHeight: '100dvh',
          background: 'var(--color-royal-blue)',
          borderRight: '2px solid var(--color-royal-gold)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          color: '#ffffff',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Image src="/goodfoods.PNG" alt="SRM" width={36} height={36} style={{ borderRadius: '6px', height: 'auto', objectFit: 'contain' }} />
            <div>
              <div className="font-royal" style={{ fontSize: '14px', color: 'var(--color-royal-gold)', fontWeight: 700 }}>
                SRM GOOD FOODS
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>SAP ADMIN PORTAL</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.75)',
                  background: isActive ? 'var(--color-royal-gold)' : 'transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(197,155,39,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-royal-gold)' }} />
            ) : (
              <span style={{ fontSize: '20px' }}>👤</span>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || 'Admin'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.email}
              </div>
            </div>
          </div>
          <Link href="/menu" style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: 'var(--color-royal-gold)', textDecoration: 'none', marginBottom: '10px', fontWeight: 500 }}>
            ← Storefront View
          </Link>
          <button
            onClick={signOut}
            className="btn"
            style={{
              width: '100%',
              fontSize: '13px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ff9999',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              minHeight: '36px',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 767px) {
          .desktop-admin-sidebar {
            display: none !important;
          }
          .mobile-only-admin-nav {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
