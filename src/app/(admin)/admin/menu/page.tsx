'use client';
// src/app/(admin)/admin/menu/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { MenuItem } from '@/lib/types';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts', 'General'];

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }} onClick={onClose}>
      <div className="animate-scale-in" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function AdminMenuPage() {
  const { user, isAdmin, loading, idToken } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', category: 'General' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'HIDDEN'>('ALL');

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/');
      else if (!isAdmin) router.push('/menu');
    }
  }, [user, isAdmin, loading, router]);

  const fetchItems = () => {
    if (!idToken) return;
    fetch('/api/admin/menu', { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setFetching(false); });
  };

  useEffect(() => { fetchItems(); }, [idToken]);

  const openCreate = () => { setEditTarget(null); setForm({ name: '', description: '', price: '', imageUrl: '', category: 'General' }); setError(''); setShowModal(true); };
  const openEdit = (item: MenuItem) => {
    setEditTarget(item);
    setForm({ name: item.name, description: item.description, price: String(item.price), imageUrl: item.imageUrl, category: item.category });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { setError('Name and price are required.'); return; }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) { setError('Enter a valid price.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/menu', {
        method: editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(editTarget ? { ...form, price: Number(form.price), itemId: editTarget.itemId } : { ...form, price: Number(form.price) }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setShowModal(false);
      fetchItems();
    } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (item: MenuItem) => {
    const newStatus = item.status === 'AVAILABLE' ? 'HIDDEN' : 'AVAILABLE';
    await fetch('/api/admin/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ itemId: item.itemId, status: newStatus }),
    });
    fetchItems();
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Permanently delete "${item.name}"? This CANNOT be undone and will remove all historical data.`)) return;
    await fetch('/api/admin/menu', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ itemId: item.itemId }),
    });
    fetchItems();
  };

  const filteredItems = items.filter(i => filter === 'ALL' || i.status === filter);

  if (loading || !isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '26px', marginBottom: '4px' }}>🍽️ Menu Management</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Add, edit, hide, or remove food items</p>
            </div>
            <button id="add-menu-item-btn" onClick={openCreate} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              + Add Item
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['ALL', 'AVAILABLE', 'HIDDEN'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 18px', borderRadius: 'var(--radius-full)', border: '1px solid',
                borderColor: filter === f ? 'var(--color-primary)' : 'var(--color-border)',
                background: filter === f ? 'linear-gradient(135deg, var(--color-primary), #dc2626)' : 'transparent',
                color: filter === f ? 'white' : 'var(--color-text-secondary)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}>{f} {filter === f ? `(${filteredItems.length})` : ''}</button>
            ))}
          </div>

          {fetching ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => (
                <div key={item.itemId} style={{
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  opacity: item.status === 'HIDDEN' ? 0.6 : 1,
                }}>
                  <div style={{ height: '140px', background: 'var(--color-bg-elevated)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    ) : '🍽️'}
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600,
                    }} className={item.status === 'AVAILABLE' ? 'badge-available' : 'badge-hidden'}>
                      {item.status}
                    </div>
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{item.category}</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '14px' }}>₹{item.price.toFixed(2)}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(item)} className="btn btn-ghost" style={{ flex: 1, fontSize: '12px', padding: '8px' }}>✏️ Edit</button>
                      <button onClick={() => handleToggleStatus(item)} className="btn btn-ghost" style={{ flex: 1, fontSize: '12px', padding: '8px', color: item.status === 'AVAILABLE' ? '#f59e0b' : '#22c55e' }}>
                        {item.status === 'AVAILABLE' ? '🙈 Hide' : '👁️ Show'}
                      </button>
                      <button onClick={() => handleDelete(item)} className="btn btn-danger" style={{ fontSize: '12px', padding: '8px' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <Modal title={editTarget ? 'Edit Menu Item' : 'Add New Item'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Item Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Masala Dosa" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Description</label>
              <textarea className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the dish..." rows={3} style={{ resize: 'vertical', minHeight: '80px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Price (₹) *</label>
                <input className="input" type="number" min="1" step="0.5" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Category</label>
                <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Image URL</label>
              <input className="input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://example.com/image.jpg" />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '8px' }} onError={e => e.currentTarget.style.display = 'none'} />
              )}
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>❌ {error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleSave} disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                {submitting ? 'Saving...' : editTarget ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
