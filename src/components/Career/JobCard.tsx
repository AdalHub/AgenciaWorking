import React from 'react';
import type { JobPosting } from './types';

export interface JobCardProps {
  job: JobPosting;
  onOpen?: (job: JobPosting) => void;   // open details
  onApply?: (job: JobPosting) => void;  // open modal directly (optional)
}

const JobCard: React.FC<JobCardProps> = ({ job, onOpen, onApply }) => {
  return (
    <div
      onClick={() => onOpen?.(job)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        cursor: 'pointer',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen?.(job)}
    >
      <h3 style={{ margin: '0 0 6px' }}>{job.title}</h3>
      <div style={{ color: '#6b7280', fontSize: 14 }}>
        {job.team} • {job.employmentType} • {job.location}
      </div>
      <div style={{ fontSize: 14, marginTop: 8, color: '#374151' }}>
        {job.description}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        Posted: {job.posted}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen?.(job); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #d1d5db' }}
        >
          View details
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onApply?.(job); }}
          style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff' }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default JobCard;
