'use client';
// src/app/page.tsx — Login / Landing Page (Royal Light SAP Fiori Theme)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, profile, isDelivery, isAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (isDelivery && !isAdmin) {
        router.push('/delivery');
      } else if (!profile?.phone || !profile?.locationId) {
        router.push('/profile');
      } else {
        router.push('/menu');
      }
    }
  }, [user, profile, isDelivery, isAdmin, loading, router]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f4f6f9 0%, #fffdf5 50%, #ebf0f5 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Royal Subtle Decorative Accents */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 43, 70, 0.05), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197, 155, 39, 0.08), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Logo Card */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--color-royal-gold)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <Image src="/goodfoods.PNG" alt="SRM Good Foods" width={100} height={100} style={{ height: 'auto', objectFit: 'contain' }} priority />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-royal" style={{ fontSize: '32px', color: 'var(--color-royal-blue)', marginBottom: '8px', lineHeight: 1.2, fontWeight: 700 }}>
          SRM GOOD FOODS
        </h1>
        <div style={{ height: '3px', width: '60px', background: 'var(--color-royal-gold)', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>

        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '32px' }}>
          SRM Tiruchirappalli
        </p>



        {/* Sign In Card (SAP Structured Style) */}
        <div className="royal-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
            Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Sign in with your Google account
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <div
                className="animate-spin-custom"
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--color-border)',
                  borderTopColor: 'var(--color-royal-blue)',
                  borderRadius: '50%',
                }}
              />
            </div>
          ) : (
            <button
              id="google-signin-btn"
              onClick={signInWithGoogle}
              style={{
                width: '100%',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '12px 20px',
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-royal-blue)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,43,70,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google Sign-In
            </button>
          )}

          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '16px', lineHeight: 1.5 }}>

          </p>
        </div>
      </div>
    </main>
  );
}
