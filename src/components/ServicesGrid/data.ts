// src/components/ServicesGrid/data.ts
interface Service {
  slug: string;
  kicker: string;
  title: string;
  subtitle: string;
  img: string;         // thumbnail for the grid (can be same as detailImg)
  detailImg?: string;  // large photo on the detail page
  blurb: string;
  body: string[];
}

const services: Service[] = [
  {
    slug: 'talent-recruitment',
    kicker: 'Staffing',
    title: 'Talent Recruitment & Selection',
    subtitle: 'Swift hires, zero compromise on quality.',
    img: 'src/assets/bg.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Pre-screened, background-checked candidates delivered fast—ready to start when you are.',
    body: [
      'Our sourcing team taps an active database of 20,000+ qualified professionals across Mexico and the United States.',
      'Each candidate is skills-tested, reference-checked, and fully vetted for cultural fit before you ever see a résumé.',
      'You receive a curated shortlist within seven business days, complete with compensation benchmarks and interview notes.',
    ],
  },
  {
    slug: 'high-volume-recruitment',
    kicker: 'Scaling',
    title: 'High-Volume Executive & Operational Recruitment',
    subtitle: 'When you need dozens of hires—yesterday.',
    img: 'src/assets/mass-recruitment.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Scalable hiring campaigns that fill entire teams under your brand and on your deadline.',
    body: [
      'From production operators to regional executives, we deliver 25–150 hires per month without sacrificing quality.',
      'A dedicated project manager supplies KPI dashboards so you can track time-to-fill, diversity ratios, and pipeline health in real time.',
    ],
  },
  {
    slug: 'background-checks',
    kicker: 'Compliance',
    title: 'Background Check Reports',
    subtitle: 'Hire with confidence—and stay compliant.',
    img: 'src/assets/reports.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Employment, socioeconomic and criminal-record verification that meets Mexican and U.S. regulations.',
    body: [
      'We partner with accredited labs and government registries to complete multi-jurisdiction searches in under 72 hours.',
      'Reports cover employment history, education validation, criminal and credit checks—formatted for REPSE and ISO audits.',
    ],
  },
  {
    slug: 'labor-surveys',
    kicker: 'Diagnostics',
    title: 'Labor Surveys & Studies',
    subtitle: 'Data-driven insights, actionable results.',
    img: 'src/assets/survey.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Work-climate, NOM-035, turnover, and structure studies that turn raw data into measurable change.',
    body: [
      'Our I-O psychologists design anonymous pulse surveys that surface the root causes of attrition, burnout, and disengagement.',
      'You receive a prioritized action plan, benchmarked against industry peers, to improve retention and productivity within 90 days.',
    ],
  },
  {
    slug: 'training-upskilling',
    kicker: 'Development',
    title: 'Training & Upskilling',
    subtitle: 'Equip your team for tomorrow’s challenges.',
    img: 'src/assets/training.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Customized courses—from leadership and negotiation to customer service—that boost skills and motivation.',
    body: [
      'We build modular learning paths that blend micro-learning, live workshops, and on-the-job coaching.',
      'Progress is tracked in a cloud LMS, giving HR insight into competency gains and certification status in real time.',
    ],
  },
  {
    slug: 'competency-programs',
    kicker: 'Assessment',
    title: 'Competency Tests & Managerial Development',
    subtitle: 'Measure skills, close gaps, accelerate growth.',
    img: 'src/assets/tests.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Role-specific assessments plus guided upskilling paths that align employee competencies with business goals.',
    body: [
      'Psychometric and practical assessments map individual gaps against ISO-9001 role matrices.',
      'Employees receive personalized development plans, while leadership gains cohort analytics for succession planning.',
    ],
  },
  {
    slug: 'specialized-services',
    kicker: 'Outsourcing',
    title: 'Specialized Services',
    subtitle: 'REPSE-certified outsourcing—done right.',
    img: 'src/assets/specialserv.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'Administration, logistics, finance, and other functions delivered by dedicated teams under full legal compliance.',
    body: [
      'We embed trained personnel on-site or nearshore, covering payroll, benefits, supervision, and performance reporting with one monthly invoice.',
      'You stay focused on core operations while we manage the rest.',
    ],
  },
  {
    slug: 'hr-soft-landing',
    kicker: 'Expansion',
    title: 'HR Soft Landing in Mexico',
    subtitle: 'Your launchpad for cross-border growth.',
    img: 'src/assets/softland.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb:
      'End-to-end HR support that recruits, pays, and integrates your Mexico team in full legal and cultural compliance.',
    body: [
      'We register your entity with IMSS, INFONAVIT, and SAT; onboard your first employees; and handle payroll, benefits, and statutory filings.',
      'Cultural-integration workshops ensure U.S. and Mexican teams collaborate smoothly from day one.',
    ],
  },
  /* ---------------------- About Us page ----------------------------- */
  {
    slug: 'about-us',
    kicker: 'Company',
    title: 'About Us',
    subtitle:
      'Agencia Working empowers organizations through people-centric HR solutions.',
    img: 'src/assets/about-banner.jpg',
    detailImg: 'src/assets/bg.jpg',
    blurb: '',
    body: [
      'Founded in 1999, Agencia Working began as a boutique recruitment firm in Tamaulipas, Mexico.',
      'Today we manage full-cycle HR, payroll and talent-development programs for 120+ cross-border clients.',
      'Our mission is to help companies grow by unlocking the potential of every employee—from the shop floor to the C-suite.',
    ],
  },
];

export default services;
