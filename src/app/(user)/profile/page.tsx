'use client';
// src/app/(user)/profile/page.tsx — Mandatory profile setup & settings

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Location } from '@/lib/types';

export default function ProfilePage() {
  const { user, profile, isDelivery, isAdmin, idToken, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return; }
      if (isDelivery && !isAdmin) { router.push('/delivery'); return; }
    }
  }, [user, isDelivery, isAdmin, loading, router]);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '');
      setLocationId(profile.locationId || '');
    }
  }, [profile]);

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(d => setLocations(d.locations || []));
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6–9.');
      return;
    }
    if (!locationId) {
      setError('Please select a delivery location.');
      return;
    }

    setSaving(true);
    try {
      const selectedLoc = locations.find(l => l.locationId === locationId);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ phone, locationId, locationName: selectedLoc?.name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save profile.'); return; }

      await refreshProfile();
      setSuccess('Profile saved successfully! Redirecting...');
      setTimeout(() => router.push('/menu'), 1200);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="animate-spin-custom" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-royal-blue)', borderRadius: '50%' }} />
    </div>
  );

  return (
    <>
      {user && <Navbar />}
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '32px 16px 90px' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <div className="royal-card animate-fade-in" style={{ padding: '32px 24px' }}>
            {/* User Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid var(--color-royal-gold)', marginBottom: '12px' }} />
              ) : (
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>👤</div>
              )}
              <h1 className="font-royal" style={{ fontSize: '22px', color: 'var(--color-royal-blue)', marginBottom: '4px', fontWeight: 700 }}>
                MY PROFILE & LOCATION
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                Set your primary phone number and preferred campus delivery block.
              </p>
            </div>

            {/* Incomplete profile notice */}
            {!profile?.phone && (
              <div style={{ background: '#fff8e5', border: '1px solid #ffe699', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚠️</span>
                <p style={{ fontSize: '13px', color: '#9c6800', fontWeight: 600 }}>
                  Please complete your details below before placing orders.
                </p>
              </div>
            )}

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                className="input"
                value={profile?.name || user?.displayName || ''}
                readOnly
                style={{ background: '#f8fafc', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Synced from your Google account</p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                className="input"
                value={user?.email || ''}
                readOnly
                style={{ background: '#f8fafc', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
              />
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
                Mobile Number <span style={{ color: '#bb0000' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600 }}>+91</span>
                <input
                  id="phone-input"
                  className={`input${error && !phone ? ' input-error' : ''}`}
                  style={{ paddingLeft: '48px' }}
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="9876543210"
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                10-digit mobile number for order delivery confirmation
              </p>
            </div>

            {/* Location Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '6px' }}>
                Delivery Campus Location <span style={{ color: '#bb0000' }}>*</span>
              </label>
              <select
                id="location-select"
                className={`input${error && !locationId ? ' input-error' : ''}`}
                value={locationId}
                onChange={e => { setLocationId(e.target.value); setError(''); }}
              >
                <option value="">— Select a delivery location —</option>
                {locations.map(loc => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.name}{loc.building ? ` – ${loc.building}` : ''}{loc.floor ? `, ${loc.floor}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div style={{ background: '#ffebeb', border: '1px solid #ffb3b3', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#bb0000', fontWeight: 600 }}>
                ❌ {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#e5f9ed', border: '1px solid #bcf0cf', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#107e3e', fontWeight: 600 }}>
                ✅ {success}
              </div>
            )}

            <button
              id="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-gold"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
            >
              {saving ? '⏳ Saving Profile...' : '💾 Save Profile & Proceed'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
