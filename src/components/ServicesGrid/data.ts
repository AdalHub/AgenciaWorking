// src/components/ServicesGrid/data.ts
interface Service {
  title: string;
  blurb: string;
  img: string;   // path relative to /src or remote URL
  slug: string;
}

const services: Service[] = [
  {
    title: 'Nearshore Staffing',
    blurb: 'Build dedicated Mexico-based teams that operate in your time zone and reduce labor costs by up to 50 %.',
    img: '/assets/services/nearshore.jpg',
    slug: 'nearshore-staffing',
  },
  {
    title: 'Mass Recruitment',
    blurb: 'From 10 to 1 000 hires in manufacturing, retail, or customer support—on time, every time.',
    img: '/assets/services/mass-recruitment.jpg',
    slug: 'mass-recruitment',
  },
  {
    title: 'Payroll & Compliance',
    blurb: 'We handle REPSE registration, taxes, and local labor law so you can focus on growth.',
    img: '/assets/services/payroll.jpg',
    slug: 'payroll-compliance',
  },
  {
    title: 'On-site HR Support',
    blurb: 'An embedded HR specialist at your plant or office ensures high retention and quick conflict resolution.',
    img: '/assets/services/on-site-hr.jpg',
    slug: 'on-site-hr',
  },
  {
    title: 'Training & Upskilling',
    blurb: 'Custom curricula in safety, lean manufacturing, and soft skills delivered in Spanish or English.',
    img: '/assets/services/training.jpg',
    slug: 'training-upskilling',
  },
  {
    title: 'Executive Search',
    blurb: 'Our bi-national network surfaces leadership talent fluent in both cultures and regulatory landscapes.',
    img: '/assets/services/executive-search.jpg',
    slug: 'executive-search',
  },
];

export default services;
