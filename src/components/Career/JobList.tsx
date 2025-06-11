import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import jobs from './jobData';
import type { JobPosting } from './jobData';
import styled from 'styled-components';
import type { FilterState } from './FilterPanel';

import JobDetailsPage from './JobDetailsPage';

const ListWrap = styled.div`
  flex: 1;
  min-width: 0;   /* fix overflow flexbox bug in Firefox */
`;

// PHP_SCRIPT_URL is no longer needed since we are using mailto:
// const PHP_SCRIPT_URL = 'https://www.agenciaworking.com/send_email.php';

export default function JobList({ filters }: { filters: FilterState }) {
  const [selectedJobSlug, setSelectedJobSlug] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    let out: JobPosting[] = jobs;

    if (filters.q)
      out = out.filter(
        (j) =>
          j.title.toLowerCase().includes(filters.q.toLowerCase()) ||
          j.description.toLowerCase().includes(filters.q.toLowerCase()) ||
          j.team.toLowerCase().includes(filters.q.toLowerCase()) ||
          j.location.toLowerCase().includes(filters.q.toLowerCase())
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

  const selectedJob = useMemo(() => {
    return jobs.find(job => job.slug === selectedJobSlug) || null;
  }, [selectedJobSlug]);


  const handleJobClick = (slug: string) => {
    setSelectedJobSlug(slug);
  };

  const handleBackToJobListings = () => {
    setSelectedJobSlug(null);
  };

  return (
    <ListWrap>
      {selectedJob ? (
        <JobDetailsPage
          job={selectedJob}
          onBack={handleBackToJobListings}
          // phpScriptUrl={PHP_SCRIPT_URL} // Removed: No longer needed
        />
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((j, idx) => (
              <JobCard key={j.id} j={j} idx={idx} onJobClick={handleJobClick} />
            ))
          ) : (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#505864' }}>No job postings match your criteria.</p>
          )}
        </AnimatePresence>
      )}
    </ListWrap>
  );
}