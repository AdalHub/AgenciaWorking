// career.tsx
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import FilterPanel from '../components/Career/FilterPanel';
import type { FilterState } from '../components/Career/FilterPanel';
import JobList from '../components/Career/JobList';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Page = styled.main`
  padding: 6rem 1.5rem 4rem;
`;
/* career.tsx – styles inside the component file  */
const SearchBar = styled.div`
  max-width: 720px;
  margin: 0 auto 2.5rem;
  position: relative;

  input {
    width: 100%;
    padding: 0.85rem 3rem 0.85rem 1rem;
    border: 1px solid #c7ccd6;
    border-radius: 32px;
    font-size: 1rem;
    box-sizing: border-box;   /* ← NEW: keeps padding + border inside 100% */
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

export default function CareerPage() {
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    sort: 'Relevance',
    employment: '',
    teams: [],
  });

  const [panelOpen, setPanelOpen] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'jobs'));
        const teamSet = new Set<string>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (typeof data.team === 'string') {
            teamSet.add(data.team);
          }
        });
        setAvailableTeams(Array.from(teamSet).sort());
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    fetchTeams();
  }, []);

  return (
    <>
      <Header />

      <Page>
        <h1 style={{ textAlign: 'center' }}>Search Careers</h1>

        <SearchBar>
          <input
            type="text"
            placeholder="Search by technology, team, location…"
            value={filters.q}
            onChange={(e) =>
              setFilters((f) => ({ ...f, q: e.target.value }))
            }
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
          <FilterPanel
            open={panelOpen}
            applied={filters}
            onApply={setFilters}
            onClose={() => setPanelOpen(false)}
            availableTeams={availableTeams}
          />

          <JobList filters={filters} />
        </Body>
      </Page>

      <Footer />
    </>
  );
}
