// src/components/ServicesGrid/data.ts
interface Service {
  title: string;
  blurb: string;
  img: string;   // path relative to /src or remote URL
  slug: string;
}

const services: Service[] = [
  {
    title: 'Talent Recruitment & Selection',
    blurb: 'Pre-screened, background-checked candidates delivered fast—ready to start when you are.',
    img: 'src/assets/bg.jpg',
    slug: 'nearshore-staffing',
  },
  {
    title: 'High-Volume Executive and Operational Recruitment',
    blurb: 'Scalable hiring campaigns that brand under your name, vet top talent, and fill dozens of roles on deadline.',
    img: 'src/assets/mass-recruitment.jpg',
    slug: 'mass-recruitment',
  },
  {
    title: 'Background Check Reports ',
    blurb: 'Reg-compliant employment, socioeconomic, and criminal record verification for new and existing staff.',
    img: 'src/assets/reports.jpg',
    slug: 'payroll-compliance',
  },
  {
    title: 'Labor Surveys and Studies',
    blurb: 'Work-climate, NOM-035, turnover, and structure studies with action plans that turn data into measurable change',
    img: '/assets/on-site-hr.jpg',
    slug: 'on-site-hr',
  },
  {
    title: 'Training & Upskilling',
    blurb: 'Customized courses—from leadership and negotiation to customer service—that boost skills, motivation, and productivity.',
    img: 'src/assets/training.jpg',
    slug: 'training-upskilling',
  },
  {
    title: 'Labor Competency Tests and Managerial Competency Development Programs',
    blurb: 'Role-specific assessments and guided upskilling paths that align employee competencies with business goals.',
    img: 'src/assets/tests.jpg',
    slug: 'executive-search',
  },
    {
    title: 'Specialized Services',
    blurb: 'REPSE-certified outsourcing across administration, logistics, finance, and other key functions—custom-tailored to your operation.',
    img: 'src/assets/executive-search.jpg',
    slug: 'executive-search',
  },
    {
    title: 'HR Soft Landing in Mexico',
    blurb: 'End-to-end HR support that recruits, pays, and integrates your Mexico team in full legal and cultural compliance',
    img: 'src/assets/executive-search.jpg',
    slug: 'executive-search',
  },
];

export default services;
