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
    thumb: '/icons/hireicon.svg',
    kicker: 'Staffing',
    title: 'Talent Recruitment & Selection',
    subtitle: 'Swift hires, zero compromise on quality.',
    img: '/epic.jpg',
    detailImg: '/epic.jpg',
    blurb:
      'Pre-screened, background-checked candidates delivered fast—ready to start when you are.',
    body: [
  /* ───── intro paragraph ─────────────────────────── */
  'Finding the right candidate doesn’t have to be time-consuming or complicated. At <strong>Agencia Working</strong>, we provide a fast, reliable, and fully customised <strong>Recruitment &amp; Selection</strong> service tailored to your company’s needs.',

  /* ───── mini-subtitle + list ─────────────────────── */
  '<h3>Our service includes:</h3>',
  `<ul>
      <li><strong>Delivery of qualified candidates</strong> ready to fill your open positions.</li>
      <li>We handle all <strong>pre-screening, assessments, and background checks</strong>, so you can focus on strategic priorities.</li>
      <li>Access to our <strong>free corporate job board</strong>—just send us your open roles and we’ll start recruiting immediately.</li>
    </ul>`,

  /* ───── fee model ───────────────────────────────── */
  '<h3>Performance-based fee model:</h3>',
  'You’ll only be charged <strong>if you decide to hire a candidate presented by our team</strong>. This ensures transparency, quality, and peace of mind.',

  /* ───── closing line ─────────────────────────────── */
  'Let us take care of finding the right talent—so you can take care of growing your business.',
    ],
  },
  {
    slug: 'background-checks',
    category: 'Life Style',
    thumb: '/icons/placeholder.svg',
    kicker: 'Compliance',
    title: 'Background Check Reports',
    subtitle: 'Hire with confidence—and stay compliant.',
    img: '/reports.jpg',
    detailImg: '/reports.jpg',
    blurb:
      'Employment, socioeconomic and criminal-record verification that meets Mexican and U.S. regulations.',
    body: [
      /* ─── intro ──────────────────────────────────────────── */
      'At <strong>Agencia Working</strong>, we offer a comprehensive service for <strong>Background Check Reports</strong> and socioeconomic studies for your new hires, fully compliant with <strong>Mexican regulations, privacy standards</strong>, and ethical guidelines.',

      /* ─── subtitle + list ───────────────────────────────── */
      '<h3>Our service includes:</h3>',
      `<ul>
          <li><strong>Employment history verification:</strong> We investigate the professional background and references of candidates to ensure they meet your company’s processes.</li>
          <li><strong>Employee file creation:</strong> We help build comprehensive social, economic, and labor-related files for your employees, essential for both internal and external certifications.</li>
          <li><strong>Current employee data updates:</strong> We assist in updating the information of your existing staff to ensure compliance with legal and regulatory requirements.</li>
          <li><strong>Processing of criminal background certificates:</strong> We facilitate the process of obtaining criminal background check certificates for your new hires or current employees.</li>
        </ul>`,

      /* ─── closing paragraph ─────────────────────────────── */
      'This service not only provides <strong>peace of mind</strong> regarding the suitability of your workforce but also ensures compliance with legal requirements for hiring and certification processes.',
    ],
  },
  {
    slug: 'high-volume-recruitment',
    category: 'Business',
    thumb: 'icons/highemp.svg',
    kicker: 'Scaling',
    title: 'High-Volume Executive & Operational Recruitment',
    subtitle: 'When you need dozens of hires—yesterday.',
    img: '/mass-recruitment.jpg',
    detailImg: '/mass-recruitment.jpg',
    blurb:
      'Scalable hiring campaigns that fill entire teams under your brand and on your deadline.',
    body: [
      /* ─── intro ──────────────────────────────────────────── */
      'At <strong>Agencia Working</strong>, we have the experience and infrastructure to manage <strong>high-volume hiring processes</strong> for both <strong>executive and operational roles</strong>, delivering fast, efficient, and results-driven solutions.',

      /* ─── responsibility subtitle + list ─────────────────── */
      '<h3>We take full responsibility for your recruitment process:</h3>',
      `<ul>
          <li>We promote and advertise your job openings under your company’s name across multiple media channels.</li>
          <li>We conduct candidate interviews and evaluations in alignment with your internal procedures, enriched by our proven expertise.</li>
        </ul>`,

      /* ─── dedicated team paragraph ───────────────────────── */
      'If needed, we can assign a <strong>dedicated recruitment team</strong> to work exclusively on your hiring campaign, ensuring precision, speed, and quality.',

      /* ─── closing line ───────────────────────────────────── */
      '<p><strong>Focus on your business—we’ll take care of the talent.</strong></p>',
    ],
  },
  {
    slug: 'labor-surveys',
    category: 'Communication',
    thumb: '/icons/labor.svg',
    kicker: 'Diagnostics',
    title: 'Labor Surveys & Studies',
    subtitle: 'Data-driven insights, actionable results.',
    img: '/survey.jpg',
    detailImg: '/survey.jpg',
    blurb:
      'Work-climate, NOM-035, turnover, and structure studies that turn raw data into measurable change.',
    body: [
      /* ─── intro ──────────────────────────────────────────── */
      'At <strong>Agencia Working</strong>, we have extensive experience in conducting <strong>labor surveys and studies</strong> that provide key insights into your team and internal processes. But we don’t stop at just gathering data—we also design <strong>action plans and follow-up processes</strong> to implement the necessary improvements based on those studies, ensuring that changes result in <strong>tangible benefits</strong> for your organization.',

      /* ─── subtitle + list ───────────────────────────────── */
      '<h3>Our studies include:</h3>',
      `<ul>
          <li><strong>Workplace Climate:</strong> We evaluate the work environment within your company to identify areas for improvement and strengthen organizational culture.</li>
          <li><strong>NOM 035 STPS Compliance:</strong> We assist in complying with <strong>NOM 035</strong> regulations regarding psychosocial risk factors, promoting a healthier and more productive work environment.</li>
          <li><strong>Employee Turnover Study:</strong> We analyze the reasons behind employee turnover and provide practical recommendations to reduce it and enhance talent retention.</li>
          <li><strong>Organizational Structure:</strong> We develop or review your company’s organizational chart, create <em>job descriptions</em>, design <em>job profile formats</em>, and other essential HR tools to ensure each role aligns with strategic goals.</li>
          <li><strong>Career Path Development:</strong> We craft personalised career development plans that boost professional growth, motivation, and retention.</li>
          <li><strong>Performance Evaluations:</strong> We conduct studies focused on evaluating employee performance, fostering continuous improvement and professional development.</li>
          <li><strong>Employee Satisfaction Surveys:</strong> We assess employees’ perceptions of their work, leadership, and growth opportunities within the company.</li>
        </ul>`,

      /* ─── follow-up section ─────────────────────────────── */
      '<h3>Follow-Up and Continuous Improvement</h3>',
      'What sets us apart is our ability to <strong>track the results</strong> of our studies and implement improvement plans that create real impact. We ensure that recommendations are translated into actionable steps and that your company can measure progress over time.',
    ],
  },
  {
    slug: 'training-upskilling',
    category: 'Life Style',
    thumb: '/icons/training.svg',
    kicker: 'Development',
    title: 'Training & Upskilling',
    subtitle: 'Equip your team for tomorrow’s challenges.',
    img: '/training.jpg',
    detailImg: '/training.jpg',
    blurb:
      'Customized courses—from leadership and negotiation to customer service—that boost skills and motivation.',
    body: [
      /* ─── intro paragraphs ─────────────────────────────── */
      'At <strong>Agencia Working</strong>, we understand that <strong>training</strong> should not only be seen as a legal obligation but also as a <strong>strategic opportunity for growth and success</strong>. Training is essential to foster a more productive work environment, enhance team skills, and promote innovation and change within the organization.',

      'Through our <strong>training programs</strong>, we aim to <strong>empower human talent</strong>, providing the necessary tools to face workplace challenges and adapt to the ever-changing market demands. Our experience in <strong>human resources</strong> allows us to design and implement <strong>practical and applicable courses</strong> for every type of company.',

      /* ─── first subtitle + list ─────────────────────────── */
      '<h3>Types of Courses and Diplomas:</h3>',
      `<ul>
          <li><strong>Human Relations:</strong> We enhance interpersonal skills, effective communication, and collaboration within teams.</li>
          <li><strong>Negotiation:</strong> We develop the skills necessary to manage conflicts and reach mutually beneficial agreements.</li>
          <li><strong>Leadership:</strong> We provide tools to strengthen strategic and operational leadership, fostering inspiring and effective leaders.</li>
          <li><strong>Human Resources Development:</strong> Specialized diplomas in talent management, strategy development, succession planning, and more.</li>
        </ul>`,

      /* ─── additional course list (shown after the grey bar) ── */
      `<ul>
          <li><strong>Change Management:</strong> We help companies navigate organizational changes, ensuring a smooth and effective transition.</li>
          <li><strong>Teamwork and Motivation:</strong> Practical courses to promote group cohesion and increase employee motivation.</li>
          <li><strong>Performance Management:</strong> Techniques and methodologies to evaluate and improve individual and group performance within the organization.</li>
          <li><strong>Emotional Intelligence at Work:</strong> Training to improve emotional self-management and empathy within the workplace.</li>
          <li><strong>Customer Service Excellence:</strong> Training focused on enhancing customer service skills, both in operational and executive areas.</li>
        </ul>`,

      /* ─── benefits subtitle + list ──────────────────────── */
      '<h3>Benefits of Our Courses:</h3>',
      `<ul>
          <li><strong>Tailored to client needs:</strong> Training programs are customized to fit each company’s specific goals and challenges.</li>
          <li><strong>Continuous improvement:</strong> We prepare your employees to be better equipped to face market changes and organizational challenges.</li>
          <li><strong>Increased motivation and productivity:</strong> Training your employees not only improves their skills but also boosts their commitment and motivation.</li>
        </ul>`,
    ],
  },
  {
    slug: 'competency-programs',
    category: 'Business',
    thumb: '/icons/comptesti.svg',
    kicker: 'Assessment',
    title: 'Competency Tests & Managerial Development',
    subtitle: 'Measure skills, close gaps, accelerate growth.',
    img: '/tests.jpg',
    detailImg: '/tests.jpg',
    blurb:
      'Role-specific assessments plus guided upskilling paths that align employee competencies with business goals.',
    body: [
      /* ─── intro ──────────────────────────────────────────── */
      'At <strong>Agencia Working</strong>, we understand that <strong>competency development</strong> is crucial for the success and sustainability of organizations. That’s why we offer <strong>Labor Competency Tests</strong> and <strong>Managerial Competency Development Programs</strong> designed to improve employee performance at all levels.',

      /* ─── labor competency block ─────────────────────────── */
      '<h3>Labor Competency Tests</h3>',
      'Our <strong>Labor Competency Tests</strong> are designed to identify employees\' skills and abilities, providing a clear assessment of their strengths and areas for improvement. Through specialized evaluation tools for each role, we help companies better understand their team’s capabilities and make informed decisions regarding their professional development.',

      /* ─── managerial program block ───────────────────────── */
      '<h3>Managerial Competency Development Programs</h3>',
      'Our <strong>Managerial Competency Development Programs</strong> are targeted at leaders and potential leaders within the organization. We guide the <strong>competency-based learning process</strong> with the goal of <strong>developing and updating</strong> management, leadership, and decision-making skills. The programs are designed to provide <strong>effective tools</strong> that enable participants to achieve their organizational goals, aligning personal growth with the <strong>company’s vision</strong>.',

      /* ─── how we do it ───────────────────────────────────── */
      '<h3>How We Do It?</h3>',
      `<ul>
          <li><strong>Identifying Strengths and Areas for Improvement</strong></li>
          <li><strong>Constructive Feedback</strong></li>
          <li><strong>Alignment with Company Vision</strong></li>
        </ul>`,

      /* ─── grey bar / visual break ───────────────────────── */
      '<hr />',

      /* ─── single-item bullet after break ─────────────────── */
      `<ul>
          <li><strong>Personal and Professional Development</strong></li>
        </ul>`,

      /* ─── closing paragraph ─────────────────────────────── */
      'With <strong>Agencia Working</strong>, you don’t just develop competencies—you strengthen your company’s <strong>human capital</strong>, ensuring long-term success and competitiveness.',
    ],
  },
  {
    /* ------------- Team Building ------------- */
    slug: 'team-building',                      // URL = /services/team-building
    category: 'Business',                       // or 'Life Style' if you prefer
    thumb: '/icons/team.svg',  // 32–48 px icon (add or change path)
    kicker: 'Cohesion',
    title: 'Team Building Programs',
    subtitle: 'Create a unified, motivated workforce.',
    img: '/godly2.jpg',   // wide hero used on cards
    detailImg: '/godly2.jpg', // full-width image in detail page
    blurb: 'Fun, high-impact dynamics that strengthen communication, innovation, and shared vision.',
    body: [
      /* ─── intro paragraphs ─────────────────────────── */
      'At <strong>Agencia Working</strong>, we have extensive experience in designing <strong>Team Building</strong> dynamics tailored to each company’s <strong>specific needs</strong>. We understand that one of the biggest challenges in teamwork is the <strong>unification</strong> of the different ways each employee understands, communicates, and commits personally, in order to consolidate a <strong>shared group vision</strong>.',
      'Our approach is based on <strong>fun and engaging activities</strong>, both in the classroom and outdoors, that allow participants to discover <strong>unexpected truths</strong> about themselves and their team, while having fun and strengthening their work competencies.',

      /* ─── examples of activities ───────────────────── */
      '<h3>Examples of Activities:</h3>',
      `<ul>
          <li><strong>Filming a Movie:</strong> Participants work together to create and film their own movie, promoting collaboration, creativity, and role coordination within the team.</li>
          <li><strong>Starting a Fast Food Business:</strong> We simulate the process of launching a business from scratch, fostering innovation, decision-making, and shared responsibility.</li>
          <li><strong>Outdoor Challenges:</strong> Practical activities designed to enhance communication and problem-solving in real and dynamic settings.</li>
        </ul>`,

      /* ─── benefits ─────────────────────────────────── */
      '<h3>Benefits:</h3>',
      `<ul>
          <li><strong>Improved Communication:</strong> The dynamics allow teams to share ideas, resolve conflicts, and learn how to communicate more effectively.</li>
          <li><strong>Strengthening Key Work Competencies:</strong> Skills such as <strong>teamwork, decision-making, leadership, and responsibility</strong> are developed in a practical and fun way.</li>
          <li><strong>Team Integration:</strong> Through group activities, employees strengthen their bonds, enhancing cohesion and a sense of belonging within the organization.</li>
        </ul>`,

      /* ─── closing paragraph ───────────────────────── */
      'With our <strong>Team Building</strong> activities, we don’t just aim to improve relationships within teams; we also create a <strong>more efficient, harmonious, and aligned work environment</strong> that drives business objectives forward.',
    ],
  },
  {
    slug: 'specialized-services',
    category: 'Communication',
    thumb: '/icons/greygear.svg',
    kicker: 'Outsourcing',
    title: 'Specialized Services',
    subtitle: 'REPSE-certified outsourcing—done right.',
    img: '/specialserv.jpg',
    detailImg: '/specialserv.jpg',
    blurb:
      'Administration, logistics, finance, and other functions delivered by dedicated teams under full legal compliance.',
    body: [
      /* ─── compliance intro ─────────────────────────────── */
      '<h3>Legal Compliance & Service Excellence</h3>',
      ' <strong>Working BPO</strong> and <strong>ISW Working Specialized Services</strong> are prepared to comply with the legal guidelines and regulations in Mexico, including compliance with <strong>REPSE</strong> (Registry of Specialized Service Providers), ensuring quality and excellence in every area of service we provide. We have a trained and committed team to meet your company’s specific needs with a personalized and adaptable approach.',

      /* ─── service areas list ───────────────────────────── */
      '<h3>Specialized Service Areas:</h3>',
      `<ul>
          <li><strong>Administrative:</strong> Efficient management of administrative tasks and processes, focusing on productivity and organization.</li>
          <li><strong>Logistics:</strong> Comprehensive logistical solutions, ensuring the proper distribution of resources and process optimization.</li>
          <li><strong>Consulting:</strong> Professional advice in various areas, tailored to the specific needs of each company.</li>
          <li><strong>Financial:</strong> Accounting, auditing, and financial management services, ensuring compliance with fiscal regulations.</li>
          <li><strong>Purchasing Management:</strong> Administration and optimization of purchasing processes, achieving better conditions and operational efficiency.</li>
          <li><strong>Promotion:</strong> Customized strategies to promote products and services, maximizing commercial impact.</li>
          <li><strong>Sales:</strong> Trained sales teams focused on delivering tangible results, aligned with business objectives.</li>
          <li><strong>General Engineering:</strong> Solutions for engineering projects, focusing on practical and efficient development of works and operations.</li>
          <li><strong>IT and Communication Support:</strong> Specialized services in IT and communication, optimizing the company’s technological systems.</li>
          <li><strong>Translation and Interpretation:</strong> Professional translation and interpretation services in various languages, ensuring accuracy and clarity in communication.</li>
          <li><strong>Health, Prevention, Environmental, and Labor Risk:</strong> Consulting and management in occupational health, risk prevention, and compliance with environmental regulations.</li>
          <li><strong>Food Preparation:</strong> Catering and food preparation services for businesses, focusing on quality and health.</li>
          <li><strong>Executive Drivers:</strong> Highly trained drivers providing high-quality executive transportation services.</li>
          <li><strong>Cleaning:</strong> Professional cleaning services, ensuring workspaces are always spotless and healthy.</li>
          <li><strong>Security Guards:</strong> Trained personnel for the security and protection of your company’s premises and employees, providing peace of mind and control.</li>
          <li><strong>General Services:</strong> Any other necessary service for the daily operation of the company, with a focus on efficiency and quality.</li>
        </ul>`,

      /* ─── closing paragraph ────────────────────────────── */
      'Each of our services is designed to provide effective solutions tailored to the unique needs of each client, ensuring that all processes are carried out under a framework of <strong>legality, ethics, and operational excellence</strong>.',
    ],
  },
  {
    slug: 'hr-soft-landing',
    category: 'Business',
    thumb: '/icons/mexico.svg',
    kicker: 'Expansion',
    title: 'HR Soft Landing in Mexico',
    subtitle: 'Your launchpad for cross-border growth.',
    img: '/window.jpg',
    detailImg: '/window.jpg',
    blurb:
      'End-to-end HR support that recruits, pays, and integrates your Mexico team in full legal and cultural compliance.',
    body: [
      /* ─── subtitle + opening paragraph ─────────────────── */
      '<h3>Seamless Entry into Mexico</h3>',
      'Expanding your operations into a new country can be a complex challenge—especially when it comes to understanding local labor regulations, cultural dynamics, and talent acquisition practices. Our <strong>HR Soft Landing Service</strong> is designed specifically to support international companies as they establish and grow their teams in Mexico.',

      /* ─── visual break (grey bar) ──────────────────────── */
      '<hr />',

      /* ─── overview paragraph ───────────────────────────── */
      'We provide comprehensive human capital solutions tailored to the specific needs of foreign enterprises, ensuring full compliance with Mexican labor laws while helping you build a strong, efficient, and culturally aligned workforce from day one.',

      /* ─── service list ─────────────────────────────────── */
      '<h3>Our services include:</h3>',
      `<ul>
          <li>Talent acquisition and recruitment tailored to your industry</li>
          <li>Local payroll administration and employee benefits management</li>
          <li>Compliance with Mexican labor legislation and HR policy development</li>
          <li>Onboarding and integration of local teams</li>
          <li>Specialized Services (as defined by Mexican labor law), including acting as a registered provider under <strong>REPSE</strong></li>
          <li>Cultural alignment and strategic HR consulting</li>
          <li>Assistance in locating and securing office spaces or industrial facilities</li>
        </ul>`,

      /* ─── closing paragraphs ───────────────────────────── */
      'With our expertise, your company can focus on strategic growth while we handle the critical human and operational aspects of your landing in Mexico.',
      'Let us be your trusted partner in building a successful and sustainable presence in the Mexican market.',
    ],
  },
  /* ------------- About-Us (excluded from grid by filter) ------------- */
  {
    slug: 'about-us',
    category: 'Business',
    thumb: '/icons/placeholder.svg',
    kicker: 'Company',
    title: 'About Us',
    subtitle:
      'Agencia Working empowers organizations through people-centric HR solutions.',
    img: 'ehepic.jpg',
    detailImg: '/ehepic.jpg',
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
