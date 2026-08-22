'use client';
// src/app/(admin)/admin/delivery-staff/page.tsx — Admin Delivery Personnel Management

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';

export default function AdminDeliveryStaffPage() {
  const { user, isAdmin, loading, idToken } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, loading, router]);

  const fetchStaff = useCallback(async () => {
    if (!idToken || !isAdmin) return;
    try {
      const res = await fetch('/api/admin/delivery-staff', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } finally {
      setFetching(false);
    }
  }, [idToken, isAdmin]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/delivery-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add delivery staff.');
        return;
      }
      setEmails(data.emails || []);
      setNewEmail('');
      setSuccess(`Added "${newEmail.trim()}" as Delivery Staff!`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (emailToRemove: string) => {
    if (!confirm(`Are you sure you want to remove "${emailToRemove}" from Delivery Staff?`)) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/delivery-staff?email=${encodeURIComponent(emailToRemove)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to remove delivery staff.');
        return;
      }
      setEmails(data.emails || []);
      setSuccess(`Removed "${emailToRemove}".`);
    } catch {
      setError('Failed to remove delivery staff.');
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '24px', borderBottom: '2px solid var(--color-royal-gold)', paddingBottom: '12px' }}>
            <h1 className="font-royal" style={{ fontSize: '26px', color: 'var(--color-royal-blue)', fontWeight: 700 }}>
              🛵 Delivery Personnel Management
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Assign Gmail IDs of delivery personnel. Authorized staff can access the Delivery Portal (`/delivery`) to verify OTPs and handle order dispatches.
            </p>
          </div>

          {/* Add Form Card */}
          <div className="sap-card" style={{ padding: '24px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '12px' }}>
              ➕ Add New Delivery Staff (Gmail ID)
            </h3>
            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '13px', marginBottom: '14px' }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '13px', marginBottom: '14px' }}>
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="email"
                className="input"
                placeholder="Enter Gmail address (e.g. delivery1@gmail.com)"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                style={{ flex: 1, minWidth: '260px' }}
              />
              <button
                type="submit"
                disabled={adding}
                className="btn btn-primary"
                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                {adding ? 'Adding...' : '➕ Assign Delivery Role'}
              </button>
            </form>
          </div>

          {/* Active Delivery Staff List */}
          <div className="sap-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-royal-blue)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 Assigned Delivery Personnel ({emails.length})</span>
              <button onClick={fetchStaff} className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
                🔄 Refresh
              </button>
            </h3>

            {fetching ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '6px' }} />
                ))}
              </div>
            ) : emails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛵</div>
                <p>No delivery staff assigned yet. Add a Gmail ID above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {emails.map((staffEmail) => (
                  <div
                    key={staffEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🛵</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-royal-blue)' }}>
                          {staffEmail}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
                          Authorized Delivery Personnel
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(staffEmail)}
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      🗑️ Remove Access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
