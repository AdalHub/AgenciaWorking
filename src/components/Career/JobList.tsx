import { useEffect, useMemo, useState } from 'react';
import JobCard from './JobCard';
import JobDetailsPage from './JobDetailsPage';
import { ApplicationModal } from './ApplicationModal';
import type { FilterState } from './FilterPanel';
import type { JobPosting } from './types';

export default function JobList({ filters }: { filters: FilterState }) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW: selection state
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [applyFor, setApplyFor] = useState<JobPosting | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/jobs.php?public=1');
        const data = await res.json();
        setJobs(data);
      } catch (e) {
        console.error('Failed to load jobs', e);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...jobs];
    const q = filters.q.trim().toLowerCase();
    if (q) {
      list = list.filter(j =>
        [j.title, j.description, j.location, j.team].join(' ').toLowerCase().includes(q)
      );
    }
    if (filters.teams?.length) {
      const set = new Set(filters.teams);
      list = list.filter(j => set.has(j.team));
    }
    if (filters.employment) {
      list = list.filter(j => j.employmentType === filters.employment);
    }
    if (filters.sort === 'Newest') list.sort((a,b)=> (a.posted < b.posted ? 1 : -1));
    if (filters.sort === 'Oldest') list.sort((a,b)=> (a.posted > b.posted ? 1 : -1));
    return list;
  }, [jobs, filters]);

  if (loading) return <div>Loading jobs…</div>;

  // If a job is selected, show the details page (it has its own Apply button)
  if (selected) {
    return (
      <div style={{ flex: 1 }}>
        <JobDetailsPage job={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1 }}>
      {filtered.length === 0 && <div>No jobs found.</div>}
      {filtered.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onOpen={(j) => setSelected(j)}
          onApply={(j) => setApplyFor(j)}
        />
      ))}

      {/* Direct apply from card (optional) */}
      {applyFor && (
        <ApplicationModal
          jobTitle={applyFor.title}
          jobId={applyFor.id}
          onClose={() => setApplyFor(null)}
        />
      )}
    </div>
  );
}
