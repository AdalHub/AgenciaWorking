import { useEffect, useState } from 'react';

interface Job {
  id: number;
  title: string;
  description: string;
  team: string;
  employmentType: string;
  location: string;
  posted: string;
}

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const load = async () => {
    const res = await fetch('/api/jobs.php');
    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job?')) return;
    await fetch(`/api/jobs.php?id=${id}`, { method: 'DELETE' });
    load();
  };

  const [showApplied, setShowApplied] = useState<Record<number, any[]>>({});

  const loadApplied = async (jobId: number) => {
    const res = await fetch(`/api/applications.php?job_id=${jobId}`);
    const apps = await res.json();
    setShowApplied(s => ({...s, [jobId]: apps}));
  };

  return (
    <div style={{ marginTop:'2rem' }}>
      <h3>Job Postings</h3>
      {jobs.map(job => (
        <div key={job.id} style={{ border:'1px solid #ccc', padding:'1rem', marginBottom:'1rem' }}>
          <h4>{job.title}</h4>
          <p><strong>Team:</strong> {job.team}</p>
          <p><strong>Type:</strong> {job.employmentType}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Posted:</strong> {job.posted}</p>
          <div style={{display:'flex', gap:8}}>
            <button onClick={() => handleDelete(job.id)}>Delete</button>
            <button onClick={() => loadApplied(job.id)}>See Applied</button>
          </div>

          {showApplied[job.id] && (
            <div style={{marginTop:12, background:'#f7f7f7', padding:12, borderRadius:8}}>
              <h5>Applications</h5>
              {showApplied[job.id].length === 0 && <div>No submissions yet.</div>}
              {showApplied[job.id].map((a:any) => (
                <div key={a.id} style={{borderBottom:'1px solid #ddd', padding:'8px 0'}}>
                  <div><b>{a.full_name}</b> — {a.email} — {a.phone}</div>
                  <div style={{whiteSpace:'pre-wrap'}}>{a.why_apply}</div>
                  {a.resume_path && <div><a href={a.resume_path} target="_blank" rel="noreferrer">Download resume</a></div>}
                  <div style={{fontSize:12, color:'#666'}}>Submitted: {a.created_at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
