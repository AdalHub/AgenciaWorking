import { Features, Heading, SubHeading, Wrapper, RightImage } from './styles';
import { Briefcase, ShieldCheck, TrendingUp, Users } from 'lucide-react'; // Updated icons
import heroPic from '../../assets/mission.jpg'; // Ensure this image is relevant to HR/business
import type { ReactElement } from 'react';

interface Item {
  icon: ReactElement;
  title: string;
  blurb: string;
}

const items: Item[] = [
  {
    icon: <Briefcase size={36} strokeWidth={2.2} />,
    title: 'Tailored Solutions',
    blurb:
      'We provide fast, reliable, and fully customized HR solutions tailored to your company’s unique needs and goals. ',
  },
  {
    icon: <ShieldCheck size={36} strokeWidth={2.2} />,
    title: 'Trusted & Compliant',
    blurb:
      'Operating since 1999, we ensure a legally compliant approach with REPSE certification and official registration with Mexico’s Ministry of Labor and Social Welfare. ',
  },
  {
    icon: <TrendingUp size={36} strokeWidth={2.2} />,
    title: 'Driving Business Growth',
    blurb:
      'We focus on human development that drives value and profitability for your company, maximizing human potential as a strategic engine for business growth. ',
  },
  {
    icon: <Users size={36} strokeWidth={2.2} />,
    title: 'Expert Team',
    blurb:
      'Our highly qualified professionals are dedicated to advancing Human Development through effective talent and workforce solutions. ',
  },
];

export default function OurMission() {
  return (
    <Wrapper>
      {/* headings */}
      <Heading>Your Strategic Partner in Human Capital</Heading>
      <SubHeading>
        Discover how Agencia Working provides comprehensive human resources solutions to empower your workforce and drive organizational success.<br />
      </SubHeading>

      {/* two-column layout */}
      <Features>
        {/* left column – 4 items */}
        <ul>
          {items.map(({ icon, title, blurb }) => (
            <li key={title}>
              <span className="icon">{icon}</span>
              <div>
                <h4>{title}</h4>
                <p>{blurb}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* right column – animated picture */}
        <RightImage
          src={heroPic}
          alt="Agencia Working Team"
          whileInView={{ x: 0, opacity: 1 }}
          initial={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </Features>
    </Wrapper>
  );
}