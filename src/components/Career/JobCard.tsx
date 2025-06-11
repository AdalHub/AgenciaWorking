import { Card } from './JobCardStyles'; // Corrected import
import type { JobPosting } from './jobData'; // Corrected import

/* fade-drop variants */
const variants = {
  hidden: { opacity: 0, y: -14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' },
  }),
};

interface Props {
  j: JobPosting;
  idx: number;          // received from JobList for the stagger
  onJobClick: (slug: string) => void; // New prop for click handler
}

export default function JobCard({ j, idx, onJobClick }: Props) {
  return (
    <Card
      variants={variants}
      initial="hidden"
      animate="show"
      exit="hidden"
      custom={idx}
      layout
      onClick={() => onJobClick(j.slug)} // Make the whole card clickable
    >
      <h4>{j.title}</h4>

      {/* meta line */}
      <div className="meta">
        {j.location} · {j.team}
      </div>

      {/* chip row */}
      <div className="chips">
        <span className="chip">{j.employmentType}</span>
      </div>
    </Card>
  );
}