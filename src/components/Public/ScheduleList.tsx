// src/components/Public/ScheduleList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/header';
import Footer from '../../components/Footer/Footer';

type Service = {
  id: number;
  title: string;
  description: string;
  hourly_rate_cents: number;
  // optional: if later you add this to the DB, UI will pick it up
  category?: string;
};

type PriceFilter = 'all' | 'lt50' | '50to100' | 'gt100';
type SortFilter = 'low' | 'high';

const pageWrap: React.CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
};

const mainWrap: React.CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
  padding: '6rem 1.5rem 4rem',
  display: 'flex',
  gap: '2rem',
};

const leftPanel: React.CSSProperties = {
  width: 230,
  flex: '0 0 230px',
};

const rightPanel: React.CSSProperties = {
  flex: 1,
};

const searchBarWrap: React.CSSProperties = {
  maxWidth: 720,
  margin: '0 auto 2.5rem',
  position: 'relative',
};

const searchInput: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 3rem 0.85rem 1rem',
  background: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: 32,
  fontSize: '1rem',
  color: '#111827',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const listCard: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(0,0,0,0.04)',
  borderRadius: 16,
  padding: '1.25rem 1.5rem 1.25rem',
  marginBottom: '1rem',
  boxShadow: '0 5px 22px rgba(0,0,0,0.03)',
};

export default function ScheduleList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sort, setSort] = useState<SortFilter>('low');
  const [category, setCategory] = useState<string>('all');

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services.php?action=list');
        const data = await res.json();
        // make sure hourly_rate_cents is number
        setServices(
          Array.isArray(data)
            ? data.map((s: any) => ({
                ...s,
                hourly_rate_cents: Number(s.hourly_rate_cents || 0),
              }))
            : [],
        );
      } catch (err) {
        console.error('Failed to load services', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // build category list from services that actually have category
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category && s.category.trim()) {
        set.add(s.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [services]);

  const filtered = useMemo(() => {
    let list = [...services];

    // search
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          (s.description ?? '').toLowerCase().includes(term),
      );
    }

    // category
    if (category !== 'all') {
      list = list.filter((s) => (s.category || '').toLowerCase() === category.toLowerCase());
    }

    // price
    list = list.filter((s) => {
      const price = s.hourly_rate_cents / 100;
      switch (priceFilter) {
        case 'lt50':
          return price < 50;
        case '50to100':
          return price >= 50 && price <= 100;
        case 'gt100':
          return price > 100;
        default:
          return true;
      }
    });

    // sort
    list.sort((a, b) => {
      const pa = a.hourly_rate_cents;
      const pb = b.hourly_rate_cents;
      if (sort === 'low') return pa - pb;
      return pb - pa;
    });

    return list;
  }, [services, q, priceFilter, sort, category]);

  return (
    <div style={pageWrap}>
      <Header />

      <h1 style={{ textAlign: 'center', marginTop: '4.5rem', marginBottom: '1rem' }}>
        Search Services
      </h1>

      <div style={searchBarWrap}>
        <input
          style={searchInput}
          placeholder="Search by service name, description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = '#063591';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            right: '1.15rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c7480',
            pointerEvents: 'none',
          }}
        >
          <path
            fill="currentColor"
            d="M21 20.3 15.8 15a7.4 7.4 0 1 0-1 1l5.3 5.3a.7.7 0 1 0 1-1ZM4 10.4a6.3 6.3 0 1 1 12.6 0A6.3 6.3 0 0 1 4 10.4Z"
          />
        </svg>
      </div>

      <section style={mainWrap}>
        {/* LEFT FILTERS */}
        <aside style={leftPanel}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: 6 }}>Category</h4>
            <button
              onClick={() => setCategory('all')}
              style={{
                display: 'block',
                marginBottom: 6,
                background: category === 'all' ? '#063591' : '#edf0f7',
                color: category === 'all' ? '#fff' : '#182b4d',
                border: 'none',
                borderRadius: 999,
                padding: '4px 12px',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  display: 'block',
                  marginBottom: 6,
                  background: category === cat ? '#063591' : '#edf0f7',
                  color: category === cat ? '#fff' : '#182b4d',
                  border: 'none',
                  borderRadius: 999,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: 6 }}>Price per hour</h4>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="price"
                checked={priceFilter === 'all'}
                onChange={() => setPriceFilter('all')}
              />{' '}
              Any
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="price"
                checked={priceFilter === 'lt50'}
                onChange={() => setPriceFilter('lt50')}
              />{' '}
              &lt; $50
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="price"
                checked={priceFilter === '50to100'}
                onChange={() => setPriceFilter('50to100')}
              />{' '}
              $50 – $100
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="price"
                checked={priceFilter === 'gt100'}
                onChange={() => setPriceFilter('gt100')}
              />{' '}
              &gt; $100
            </label>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: 6 }}>Sort by</h4>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="sort"
                checked={sort === 'low'}
                onChange={() => setSort('low')}
              />{' '}
              Lowest price
            </label>
            <label style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="radio"
                name="sort"
                checked={sort === 'high'}
                onChange={() => setSort('high')}
              />{' '}
              Highest price
            </label>
          </div>

          <button
            onClick={() => {
              setQ('');
              setPriceFilter('all');
              setSort('low');
              setCategory('all');
            }}
            style={{
              marginTop: 10,
              background: '#fff',
              border: '1px solid #dde1ea',
              borderRadius: 999,
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        </aside>

        {/* RIGHT LIST */}
        <div style={rightPanel}>
          {loading ? (
            <p>Loading services…</p>
          ) : filtered.length === 0 ? (
            <p>No services found.</p>
          ) : (
            filtered.map((svc) => {
              const price = (svc.hourly_rate_cents || 0) / 100;
              return (
                <div key={svc.id} style={listCard}>
                  <h3 style={{ marginBottom: 4 }}>{svc.title}</h3>
                  <p style={{ marginBottom: 4, color: '#6a6f77' }}>
                    ${price.toFixed(2)}/hr
                    {svc.category ? ` • ${svc.category}` : ''}
                  </p>
                  <p style={{ marginBottom: 12, maxWidth: 680 }}>
                    {svc.description || 'No description.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => navigate(`/schedule/${svc.id}`)}
                      style={{
                        background: '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      View details
                    </button>
                    <button
                      onClick={() => navigate(`/schedule/${svc.id}`)}
                      style={{
                        background: '#0b5bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
