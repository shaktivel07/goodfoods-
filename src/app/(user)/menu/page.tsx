'use client';
// src/app/(user)/menu/page.tsx — Food menu with category filter & cart integration

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/lib/types';

function MenuCard({ item, onAdd, addedId }: { item: MenuItem; onAdd: (item: MenuItem) => void; addedId: string | null }) {
  const isAdded = addedId === item.itemId;
  return (
    <div
      className="sap-card animate-fade-in"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '60%', overflow: 'hidden', background: '#f1f5f9' }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>
            🍽️
          </div>
        )}
        {/* Category tag */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-royal-blue)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--color-royal-blue)' }}>
          {item.name}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.4, marginBottom: '16px' }}>
          {item.description || 'Freshly prepared campus special.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Price</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-royal-gold)' }}>
              ₹{item.price.toFixed(2)}
            </span>
          </div>
          <button
            id={`add-to-cart-${item.itemId}`}
            onClick={() => onAdd(item)}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              minHeight: '38px',
              background: isAdded ? 'var(--color-success)' : undefined,
              borderColor: isAdded ? 'var(--color-success)' : undefined,
            }}
          >
            {isAdded ? '✓ Added' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { user, profile, isDelivery, isAdmin, loading } = useAuth();
  const { addItem, totalItems } = useCart();
  const router = useRouter();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return; }
      if (isDelivery && !isAdmin) { router.push('/delivery'); return; }
      if (!profile?.phone || !profile?.locationId) { router.push('/profile'); return; }
    }
  }, [user, profile, isDelivery, isAdmin, loading, router]);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setFetching(false); })
      .catch(() => setFetching(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory;
    const matchSearch = !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem({ itemId: item.itemId, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl });
    setAddedId(item.itemId);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (loading || fetching) return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div className="page-container" style={{ paddingTop: '24px', paddingBottom: '80px' }}>
        <div className="menu-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="sap-card" style={{ height: '300px', padding: '16px' }}>
              <div className="skeleton" style={{ width: '100%', height: '55%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '14px', width: '100%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '44px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="mobile-bottom-padding" style={{ minHeight: '100dvh', background: 'var(--color-bg)', paddingBottom: '90px' }}>
        {/* Banner Section */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid var(--color-border)', padding: '24px 16px' }}>
          <div className="page-container">
            <h1 className="font-royal" style={{ fontSize: '24px', color: 'var(--color-royal-blue)', marginBottom: '4px', fontWeight: 700 }}>
              CANTEEN MENU
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Delivering to <strong style={{ color: 'var(--color-royal-blue)' }}>📍 {profile?.locationName || 'Select location'}</strong>
            </p>
          </div>
        </div>

        <div className="page-container" style={{ paddingTop: '20px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              className="input"
              style={{ paddingLeft: '44px' }}
              type="search"
              placeholder="Search dishes or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter Pills — horizontal scroll, no scrollbar on mobile */}
          <div className="scroll-pills" style={{ marginBottom: '20px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--color-royal-blue)' : 'var(--color-border)',
                  background: activeCategory === cat ? 'var(--color-royal-blue)' : '#ffffff',
                  color: activeCategory === cat ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '13px',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: activeCategory === cat ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  minHeight: '40px',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid — responsive CSS class */}
          {filteredItems.length === 0 ? (
            <div className="sap-card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
              <h3 style={{ fontSize: '16px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>No menu items found</h3>
              <p style={{ fontSize: '13px' }}>Try a different search or category.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item, idx) => (
                <div key={item.itemId} className={`stagger-${(idx % 4) + 1}`}>
                  <MenuCard item={item} onAdd={handleAddToCart} addedId={addedId} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Cart FAB — both mobile (above bottom nav) and desktop */}
        {totalItems > 0 && (
          <button
            onClick={() => router.push('/cart')}
            className="btn btn-gold animate-slide-right mobile-fab"
            style={{ padding: '13px 22px', fontSize: '15px', fontWeight: 700 }}
          >
            🛒 View Cart ({totalItems})
          </button>
        )}
      </main>
    </>
  );
}
