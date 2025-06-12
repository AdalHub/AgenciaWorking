import { useMemo, useState, useEffect } from 'react'; // Added useEffect
import { AnimatePresence } from 'framer-motion';
import JobCard from './JobCard';
import styled from 'styled-components';
import type { FilterState } from './FilterPanel';

import JobDetailsPage from './JobDetailsPage';

// Import Firestore functions
import { collection, getDocs, orderBy, query } from "firebase/firestore"; // Added query for ordering
import { db } from '../../firebaseConfig'; // Import your Firestore instance
import type { JobPosting } from './types';

const ListWrap = styled.div`
  flex: 1;
  min-width: 0;   /* fix overflow flexbox bug in Firefox */
`;

export default function JobList({ filters }: { filters: FilterState }) {
  const [selectedJobSlug, setSelectedJobSlug] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]); // State to store jobs fetched from Firestore
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch jobs from Firestore on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsCollectionRef = collection(db, "jobs");
        // Optional: Order by 'posted' date in descending order
        const q = query(jobsCollectionRef, orderBy("posted", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedJobs: JobPosting[] = querySnapshot.docs.map(doc => ({
          id: doc.id, // Use Firestore's document ID
          ...doc.data() as Omit<JobPosting, 'id'> // Cast data and omit 'id' as it's already set
        }));
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Error fetching jobs from Firestore:", err);
        setError("Failed to load job listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

  const filteredJobs = useMemo(() => {
    let out: JobPosting[] = jobs; // Use the fetched jobs

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

    if (filters.sort === 'Newest') {
      // Sort by the 'posted' string in descending order
      out = [...out].sort(
        (a, b) => b.posted.localeCompare(a.posted)
      );
    }


    return out;
  }, [filters, jobs]); // Add 'jobs' to dependency array

  const selectedJob = useMemo(() => {
    return jobs.find(job => job.slug === selectedJobSlug) || null;
  }, [selectedJobSlug, jobs]); // Add 'jobs' to dependency array


  const handleJobClick = (slug: string) => {
    setSelectedJobSlug(slug);
  };

  const handleBackToJobListings = () => {
    setSelectedJobSlug(null);
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '2rem', color: '#505864' }}>Loading job listings...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>{error}</p>;
  }


  return (
    <ListWrap>
      {selectedJob ? (
        <JobDetailsPage
          job={selectedJob}
          onBack={handleBackToJobListings}
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