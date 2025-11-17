// src/components/Public/ScheduleList.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/header/header';
import Footer from '../../components/Footer/Footer';
import ScheduleFilterPanel, { type ScheduleFilterState } from './ScheduleFilterPanel';

type Service = {
  id: number;
  title: string;
  description: string;
  hourly_rate_cents: number;
  // optional: if later you add this to the DB, UI will pick it up
  category?: string;
};

const Page = styled.main`
  padding: 6rem 1.5rem 4rem;
  min-height: 100vh;
  background: #fff;
`;

const SearchBar = styled.div`
  max-width: 720px;
  margin: 0 auto 2.5rem;
  position: relative;
  input {
    width: 100%;
    padding: 0.85rem 3rem 0.85rem 1rem;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    border-radius: 32px;
    font-size: 1rem;
    color: #111827;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus {
      outline: none;
      border-color: #063591;
      box-shadow: 0 0 0 3px rgba(6, 53, 145, 0.1);
    }
  }
  svg {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c7480;
    pointer-events: none;
  }
`;

const Body = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
`;

const Toggle = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0.55rem 1.3rem;
  border-radius: 22px;
  cursor: pointer;
  margin-bottom: 1.5rem;
  display: none;
  @media (max-width: 920px) {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
`;

const ServiceCard = styled.div`
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 5px 22px rgba(0, 0, 0, 0.03);

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  .price {
    margin-bottom: 0.5rem;
    color: #6a6f77;
    font-size: 0.95rem;
  }

  .description {
    margin-bottom: 12px;
    color: #374151;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }

  .buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    
    button {
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 0.9;
      }
      
      @media (max-width: 768px) {
        flex: 1;
        min-width: 120px;
        padding: 10px 16px;
      }
    }
  }
`;

const Backdrop = styled.div<{ open: boolean }>`
  display: none;
  @media (max-width: 920px) {
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9979;
  }
`;

export default function ScheduleList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilterState>({
    q: '',
    priceFilter: 'all',
    sort: 'low',
    category: 'all',
  });

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
    const term = filters.q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          (s.description ?? '').toLowerCase().includes(term),
      );
    }

    // category
    if (filters.category !== 'all') {
      list = list.filter(
        (s) => (s.category || '').toLowerCase() === filters.category.toLowerCase(),
      );
    }

    // price
    list = list.filter((s) => {
      const price = s.hourly_rate_cents / 100;
      switch (filters.priceFilter) {
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
      if (filters.sort === 'low') return pa - pb;
      return pb - pa;
    });

    return list;
  }, [services, filters]);

  return (
    <>
      <Header />
      <Page>
        <h1 style={{ textAlign: 'center' }}>Search Services</h1>

        <SearchBar>
          <input
            type="text"
            placeholder="Search by service name, description…"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21 20.3 15.8 15a7.4 7.4 0 1 0-1 1l5.3 5.3a.7.7 0 1 0 1-1ZM4 10.4a6.3 6.3 0 1 1 12.6 0A6.3 6.3 0 0 1 4 10.4Z"
            />
          </svg>
        </SearchBar>

        <Toggle onClick={() => setPanelOpen(true)}>Show filters</Toggle>

        <Body>
          <Backdrop open={panelOpen} onClick={() => setPanelOpen(false)} />
          <ScheduleFilterPanel
            open={panelOpen}
            applied={filters}
            onApply={setFilters}
            onClose={() => setPanelOpen(false)}
            availableCategories={categories}
          />
          <div style={{ flex: 1 }}>
            {loading ? (
              <p>Loading services…</p>
            ) : filtered.length === 0 ? (
              <p>No services found.</p>
            ) : (
              filtered.map((svc, index) => {
                const price = (svc.hourly_rate_cents || 0) / 100;
                const delay = index * 170; // 170ms stagger like header
                // Create a filter signature to force re-animation when filters change
                const filterKey = `${filters.q}-${filters.priceFilter}-${filters.sort}-${filters.category}`;
                return (
                  <ServiceCard
                    key={`${filterKey}-${svc.id}`}
                    style={{
                      opacity: 0,
                      transform: 'translateY(-12px)',
                      animation: `fadeInDrop 260ms ease ${delay}ms forwards`,
                    }}
                  >
                    <h3>{svc.title}</h3>
                    <p className="price">
                      ${price.toFixed(2)}/hr
                      {svc.category ? ` • ${svc.category}` : ''}
                    </p>
                    <div className="buttons">
                      <button
                        onClick={() => navigate(`/schedule/${svc.id}`)}
                        style={{
                          background: '#111',
                          color: '#fff',
                        }}
                      >
                        View details
                      </button>
                      <button
                        onClick={() => navigate(`/schedule/${svc.id}`)}
                        style={{
                          background: '#0b5bff',
                          color: '#fff',
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </ServiceCard>
                );
              })
            )}
          </div>
        </Body>
      </Page>
      <Footer />
    </>
  );
}
