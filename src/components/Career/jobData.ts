export interface JobPosting {
  id: string;
  title: string;
  team: 'Support Services' | 'Software';
  location: string;
  employmentType: 'Full-time' | 'Remote';
  posted: string;            // ISO date
  description: string;
}

const jobs: JobPosting[] = [
  {
    id: 'SW-001',
    title: 'Software Engineer, Infrastructure',
    team: 'Software',
    location: 'Austin, TX',
    employmentType: 'Full-time',
    posted: '2024-05-04',
    description:
      'Design and maintain high-scalability infrastructure for micro-services that power our HR SaaS platform.',
  },
  {
    id: 'SW-002',
    title: 'Software Engineer, Machine Learning',
    team: 'Software',
    location: 'Remote (USA)',
    employmentType: 'Remote',
    posted: '2024-05-20',
    description:
      'Build and deploy ML models that match talent with open positions across the Americas.',
  },
  {
    id: 'SS-010',
    title: 'Client Support Specialist',
    team: 'Support Services',
    location: 'Monterrey, NL',
    employmentType: 'Full-time',
    posted: '2024-06-01',
    description:
      'Serve as first point of contact for enterprise clients, resolving payroll and compliance inquiries.',
  },
  {
    id: 'SS-012',
    title: 'Implementation Project Manager',
    team: 'Support Services',
    location: 'Remote (Mexico)',
    employmentType: 'Remote',
    posted: '2024-04-15',
    description:
      'Lead cross-functional launches of HR solutions for new customers in LATAM.',
  },
];

export default jobs;
