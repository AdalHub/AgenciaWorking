// src/components/ServicesGrid/data.ts
export interface Service {
  slug: string;
  category: 'Communication' | 'Life Style' | 'Business';
  thumb: string;      // 32-48 px icon
  title: string;
  blurb: string;
  kicker: string;
  subtitle: string;
  img: string;
  detailImg?: string;
  body: string[];
}

const services: Service[] = [
  {
    slug: 'talent-recruitment',
    category: 'Business',
    thumb: '/src/assets/icons/hireicon.svg',
    kicker: 'Staffing',
    title: 'Talent Recruitment & Selection',
    subtitle: 'Swift hires, zero compromise on quality.',
    img: '/src/assets/bg.jpg',
    detailImg: '/src/assets/bg.jpg',
    blurb:
      'Pre-screened, background-checked candidates delivered fast—ready to start when you are.',
    body: [
      "Finding the right candidate doesn’t have to be time-consuming or complicated. At Agencia. Working, we provide a fast, reliable, and fully customized Recruitment &amp; Selection service tailored to your company’s needs.",
      "Our service includes:",
      " Delivery of qualified candidates ready to fill your open positions.",
      " We handle all pre-screening, assessments, and background checks, so you can focus on strategic priorities.",
      " Access to our free corporate job board—just send us your open roles and we’ll start recruiting immediately.",
      "Performance-based fee model:",
      "You’ll only be charged if you decide to hire a candidate presented by our team. This ensures transparency, quality, and peace of mind.",
      "Let us take care of finding the right talent—so you can take care of growing your business.",
    ],
  },
  {
    slug: 'high-volume-recruitment',
    category: 'Business',
    thumb: '/src/assets/icons/highemp.svg',
    kicker: 'Scaling',
    title: 'High-Volume Executive & Operational Recruitment',
    subtitle: 'When you need dozens of hires—yesterday.',
    img: '/src/assets/mass-recruitment.jpg',
    detailImg: '/src/assets/mass-recruitment.jpg',
    blurb:
      'Scalable hiring campaigns that fill entire teams under your brand and on your deadline.',
    body: [
      "At Agencia Working, we have the experience and infrastructure to manage high-volume hiring processes for both executive and operational roles, delivering fast, efficient, and results-driven solutions.",
      "We take full responsibility for your recruitment process:",
      " We promote and advertise your job openings under your company’s name across multiple media channels.",
      " We conduct candidate interviews and evaluations in alignment with your internal procedures, enriched by our proven expertise.",
      "If needed, we can assign a dedicated recruitment team to work exclusively on your hiring campaign, ensuring precision, speed, and quality.",
      "Focus on your business—we’ll take care of the talent.",
    ],
  },
  {
    slug: 'background-checks',
    category: 'Life Style',
    thumb: '/src/assets/icons/placeholder.svg',
    kicker: 'Compliance',
    title: 'Background Check Reports',
    subtitle: 'Hire with confidence—and stay compliant.',
    img: '/src/assets/reports.jpg',
    detailImg: '/src/assets/reports.jpg',
    blurb:
      'Employment, socioeconomic and criminal-record verification that meets Mexican and U.S. regulations.',
    body: [
      'We partner with accredited labs and government registries to complete multi-jurisdiction searches in under 72 hours.',
      'Reports cover employment history, education validation, criminal and credit checks—formatted for REPSE and ISO audits.',
    ],
  },
  {
    slug: 'labor-surveys',
    category: 'Communication',
    thumb: '/src/assets/icons/labor.svg',
    kicker: 'Diagnostics',
    title: 'Labor Surveys & Studies',
    subtitle: 'Data-driven insights, actionable results.',
    img: '/src/assets/survey.jpg',
    detailImg: '/src/assets/survey.jpg',
    blurb:
      'Work-climate, NOM-035, turnover, and structure studies that turn raw data into measurable change.',
    body: [
      'Our I-O psychologists design anonymous pulse surveys that surface the root causes of attrition, burnout, and disengagement.',
      'You receive a prioritized action plan, benchmarked against industry peers, to improve retention and productivity within 90 days.',
    ],
  },
  {
    slug: 'training-upskilling',
    category: 'Life Style',
    thumb: '/src/assets/icons/training.svg',
    kicker: 'Development',
    title: 'Training & Upskilling',
    subtitle: 'Equip your team for tomorrow’s challenges.',
    img: '/src/assets/training.jpg',
    detailImg: '/src/assets/training.jpg',
    blurb:
      'Customized courses—from leadership and negotiation to customer service—that boost skills and motivation.',
    body: [
      'We build modular learning paths that blend micro-learning, live workshops, and on-the-job coaching.',
      'Progress is tracked in a cloud LMS, giving HR insight into competency gains and certification status in real time.',
    ],
  },
  {
    slug: 'competency-programs',
    category: 'Business',
    thumb: '/src/assets/icons/comptesti.svg',
    kicker: 'Assessment',
    title: 'Competency Tests & Managerial Development',
    subtitle: 'Measure skills, close gaps, accelerate growth.',
    img: '/src/assets/tests.jpg',
    detailImg: '/src/assets/tests.jpg',
    blurb:
      'Role-specific assessments plus guided upskilling paths that align employee competencies with business goals.',
    body: [
      'Psychometric and practical assessments map individual gaps against ISO-9001 role matrices.',
      'Employees receive personalized development plans, while leadership gains cohort analytics for succession planning.',
    ],
  },
  {
    slug: 'specialized-services',
    category: 'Communication',
    thumb: '/src/assets/icons/greygear.svg',
    kicker: 'Outsourcing',
    title: 'Specialized Services',
    subtitle: 'REPSE-certified outsourcing—done right.',
    img: '/src/assets/specialserv.jpg',
    detailImg: '/src/assets/specialserv.jpg',
    blurb:
      'Administration, logistics, finance, and other functions delivered by dedicated teams under full legal compliance.',
    body: [
      'We embed trained personnel on-site or nearshore, covering payroll, benefits, supervision, and performance reporting with one monthly invoice.',
      'You stay focused on core operations while we manage the rest.',
    ],
  },
  {
    slug: 'hr-soft-landing',
    category: 'Business',
    thumb: '/src/assets/icons/mexico.svg',
    kicker: 'Expansion',
    title: 'HR Soft Landing in Mexico',
    subtitle: 'Your launchpad for cross-border growth.',
    img: '/src/assets/softland.jpg',
    detailImg: '/src/assets/softland.jpg',
    blurb:
      'End-to-end HR support that recruits, pays, and integrates your Mexico team in full legal and cultural compliance.',
    body: [
      'We register your entity with IMSS, INFONAVIT, and SAT; onboard your first employees; and handle payroll, benefits, and statutory filings.',
      'Cultural-integration workshops ensure U.S. and Mexican teams collaborate smoothly from day one.',
    ],
  },
  /* ------------- About-Us (excluded from grid by filter) ------------- */
  {
    slug: 'about-us',
    category: 'Business',
    thumb: '/src/assets/icons/placeholder.svg',
    kicker: 'Company',
    title: 'About Us',
    subtitle:
      'Agencia Working empowers organizations through people-centric HR solutions.',
    img: '/src/assets/about-banner.jpg',
    detailImg: '/src/assets/bg.jpg',
    blurb: '',
    body: [
  /* ───── top section ─────────────────────────────── */
  '<h2>Our Story</h2>',
  'Agencia Working is a solid and reliable company that has been operating since 1999. We are driven by a team of highly qualified professionals dedicated to advancing <strong>Human Development</strong> through effective talent and workforce solutions.',
  'Our main office is located in <strong>Tamaulipas, Mexico</strong>, and we have representatives across various states throughout the country. In <strong>2007</strong>, we expanded into the U.S. market by opening our office in <strong>San Antonio, Texas</strong>.',

  /* ───── clients ─────────────────────────────────── */
  '<h3>Our Clients</h3>',
  'We proudly serve companies in the <strong>commercial, services, and manufacturing (maquiladora)</strong> sectors across <strong>Mexico</strong> and the <strong>United States</strong>. We work with dedication, innovation, and a strong ethical framework grounded in <strong>respect, honesty, teamwork, and loyalty</strong>.',
  '<p><strong>Our clients are our best references.</strong></p>',

  /* ───── compliance ──────────────────────────────── */
  '<h3>Compliance and Legal Authorization</h3>',
  'At <strong>Agencia Working</strong>, we stay fully aligned with all applicable laws and government regulations. Since <strong>2006</strong>, we have held an official <strong>registration with Mexico’s Ministry of Labor and Social Welfare (STPS)</strong>, authorising us to operate as a licensed placement agency. We strictly follow legal requirements, including the obligation to offer free job-search services for workers.',

  /* ───── mission / vision / values ───────────────── */
  '<h2>Our Mission</h2>',
  'To create meaningful change that fosters <strong>well-being and quality of life</strong>, through work rooted in <strong>warmth, collaboration, and determination</strong>, guided by <strong>ethics, resilience, respect, and legal compliance</strong>. Our mission is to promote human development that drives value and profitability for the companies that embrace it.',

  '<h2>Our Vision</h2>',
  'To be a trusted agency known for <strong>driving human development</strong> in individuals and organisations, through services that study, stimulate, and enhance talent—maximising human potential as a strategic engine for business growth.',

  '<h2>Our Values</h2>',
  'At <strong>Agencia Working</strong>, our values are not just principles—we live them every day.',
  `<ul>
      <li>Professional and personal ethics</li>
      <li>Passion for our work and client service</li>
      <li>Agility, creativity, and dynamism in everything we do</li>
      <li>Honesty and integrity as the foundation of trust</li>
      <li>Clarity and simplicity in our actions and processes</li>
    </ul>`,

    ],
  },
];

export default services;
