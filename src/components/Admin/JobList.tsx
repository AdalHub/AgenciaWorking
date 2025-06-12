// ✅ src/components/admin/JobList.tsx
import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Job {
  id: string;
  title: string;
  description: string;
  team: string;
  employment: string;
}

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(jobData);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Job Postings</h3>
      {jobs.map((job) => (
        <div key={job.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h4>{job.title}</h4>
          <p><strong>Team:</strong> {job.team}</p>
          <p><strong>Type:</strong> {job.employment}</p>
          <p>{job.description}</p>


          <button onClick={() => handleDelete(job.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
