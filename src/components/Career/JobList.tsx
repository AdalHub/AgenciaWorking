import { useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import jobs from './jobData';
import type { JobPosting } from './jobData';
import styled from 'styled-components';
import type { FilterState } from './FilterPanel';

const ListWrap = styled.div`
  flex: 1;
  min-width: 0;   /* fix overflow flexbox bug in Firefox */
`;

export default function JobList({ filters }: { filters: FilterState }) {
  const filtered = useMemo(() => {
    let out: JobPosting[] = jobs;

    if (filters.q)
      out = out.filter(
        (j) =>
          j.title.toLowerCase().includes(filters.q.toLowerCase()) ||
          j.description
            .toLowerCase()
            .includes(filters.q.toLowerCase()) ||
          j.team.toLowerCase().includes(filters.q.toLowerCase())
      );

    if (filters.employment)
      out = out.filter((j) => j.employmentType === filters.employment);

    if (filters.teams.length)
      out = out.filter((j) => filters.teams.includes(j.team));

    if (filters.sort === 'Newest')
      out = [...out].sort(
        (a, b) =>
          new Date(b.posted).getTime() - new Date(a.posted).getTime()
      );

    return out;
  }, [filters]);

  return (
    <ListWrap>
      <AnimatePresence mode="popLayout">
        {filtered.map((j, idx) => (
          <JobCard key={j.id} j={j} idx={idx} />
        ))}
      </AnimatePresence>
    </ListWrap>
  );
}
