'use client';
// src/app/(admin)/admin/locations/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Location } from '@/lib/types';

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div className="animate-scale-in" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '28px', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function AdminLocationsPage() {
  const { user, isAdmin, loading, idToken } = useAuth();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [form, setForm] = useState({ name: '', building: '', floor: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, loading, router]);

  const fetchLocations = () => {
    if (!idToken) return;
    fetch('/api/admin/locations', { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => { setLocations(d.locations || []); setFetching(false); });
  };

  useEffect(() => { fetchLocations(); }, [idToken]);

  const openCreate = () => { setEditTarget(null); setForm({ name: '', building: '', floor: '', isActive: true }); setError(''); setShowModal(true); };
  const openEdit = (loc: Location) => { setEditTarget(loc); setForm({ name: loc.name, building: loc.building, floor: loc.floor, isActive: loc.isActive }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Location name is required.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(editTarget ? { ...form, locationId: editTarget.locationId } : form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setShowModal(false);
      fetchLocations();
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (loc: Location) => {
    if (!confirm(`Delete location "${loc.name}"? This cannot be undone.`)) return;
    await fetch('/api/admin/locations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ locationId: loc.locationId }),
    });
    fetchLocations();
  };

  if (loading || !isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '26px', marginBottom: '4px' }}>📍 Campus Locations</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Manage delivery zones across SRM Trichy campus</p>
            </div>
            <button id="add-location-btn" onClick={openCreate} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              + Add Location
            </button>
          </div>

          {fetching ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : locations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No locations yet. Add your first campus delivery zone.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {locations.map(loc => (
                <div key={loc.locationId} style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: '16px',
                }}>
                  <div style={{ fontSize: '24px' }}>📍</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{loc.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {[loc.building, loc.floor].filter(Boolean).join(', ') || 'No additional details'}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600,
                    ...(loc.isActive
                      ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                      : { background: 'rgba(163,163,163,0.15)', color: '#a3a3a3', border: '1px solid rgba(163,163,163,0.3)' }),
                  }}>
                    {loc.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => openEdit(loc)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => handleDelete(loc)} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <Modal title={editTarget ? 'Edit Location' : 'Add New Location'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Location Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Main Canteen" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Building</label>
              <input className="input" value={form.building} onChange={e => setForm(p => ({ ...p, building: e.target.value }))} placeholder="e.g., Admin Block" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Floor / Area</label>
              <input className="input" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} placeholder="e.g., Ground Floor" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="loc-active" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="loc-active" style={{ fontSize: '14px', cursor: 'pointer' }}>Active (visible to users)</label>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>❌ {error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                {submitting ? 'Saving...' : editTarget ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
