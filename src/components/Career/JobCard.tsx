import { Card } from './JobCardStyles';
import type { JobPosting } from './jobData';

/* fade-drop variants */
const variants = {
  hidden: { opacity: 0, y: -14 },
  show:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' },
  }),
};

interface Props {
  j: JobPosting;
  idx: number;          // received from JobList for the stagger
}

export default function JobCard({ j, idx }: Props) {
  return (
    <Card
      variants={variants}
      initial="hidden"
      animate="show"
      exit="hidden"
      custom={idx}
      layout          /* smooth re-ordering when sort changes */
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
