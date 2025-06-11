export interface JobPosting {
  id: string;
  title: string;
  team: 'Support Services' | 'Software';
  location: string;
  employmentType: 'Full-time' | 'Remote';
  posted: string;         // ISO date
  description: string;
  slug: string; // New: Unique identifier for the URL
}

// Helper function to generate a URL-friendly slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')       // collapse whitespace and replace by -
    .replace(/-+/g, '-');        // collapse dashes
};

const jobs: JobPosting[] = [
  {
    id: 'HR-001', // Changed ID to be more HR-related for consistency
    title: 'Senior HR Specialist',
    team: 'Support Services', // Changed team to match agency's services
    location: 'Monterrey, NL', // Changed location to reflect agency presence
    employmentType: 'Full-time',
    posted: '2024-06-05', // Updated date
    description:
      'Lead HR initiatives, manage employee relations, and develop talent acquisition strategies. This role requires extensive experience in human resources, with a focus on binational (Mexico-U.S.) compliance and best practices.',
    slug: generateSlug('Senior HR Specialist'),
  },
  {
    id: 'REC-002', // Changed ID
    title: 'Recruitment Consultant',
    team: 'Support Services', // Changed team
    location: 'Remote (Mexico)', // Changed location
    employmentType: 'Remote',
    posted: '2024-06-01', // Updated date
    description:
      'Identify, attract, and onboard top talent for our diverse client base across Mexico and the United States. Strong communication, networking, and a proactive approach are essential for success in high-volume executive and operational recruitment.',
    slug: generateSlug('Recruitment Consultant'),
  },
  {
    id: 'TRAIN-003', // Changed ID
    title: 'Talent Development Trainer',
    team: 'Support Services', // Changed team
    location: 'Mexico City, MX', // Example location
    employmentType: 'Full-time',
    posted: '2024-05-28', // Updated date
    description:
      'Design and deliver engaging training programs to enhance employee skills and performance across various industries. Focus on human relations, leadership, and change management. Experience in corporate training and a passion for human development is key.',
    slug: generateSlug('Talent Development Trainer'),
  },
  {
    id: 'BPO-004', // Changed ID
    title: 'Specialized Services Coordinator',
    team: 'Support Services', // Changed team
    location: 'San Antonio, TX', // Changed location
    employmentType: 'Full-time',
    posted: '2024-05-20', // Updated date
    description:
      'Coordinate and manage specialized HR and administrative services for our U.S. clients, ensuring compliance with legal guidelines and delivering operational excellence. A strong understanding of cross-border business operations is preferred.',
    slug: generateSlug('Specialized Services Coordinator'),
  },
];

export default jobs;