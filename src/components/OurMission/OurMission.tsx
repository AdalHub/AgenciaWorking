import { Features, Heading, SubHeading, Wrapper, RightImage } from './styles';
import { Award, Ticket, MapPin, User } from 'lucide-react'; // toy icons
import heroPic from '../../assets/mission.jpg';          // ← replace
import type { ReactElement } from 'react';

interface Item {
  icon: ReactElement;      // instead of JSX.Element
  title: string;
  blurb: string;
}
const items: Item[] = [
  {
    icon: <Ticket size={36} strokeWidth={2.2} />,
    title: 'Easy Booking',
    blurb:
      'Your ticket purchase with our hassle-free and speedy process, designed for your convenience and ease.',
  },
  {
    icon: <Award size={36} strokeWidth={2.2} />,
    title: '100 % Trusted',
    blurb:
      'We take pride in being 100 % trusted. Every step of the way, you can rely on us for honesty and reliability.',
  },
  {
    icon: <MapPin size={36} strokeWidth={2.2} />,
    title: 'Inform & Recommend',
    blurb:
      'Get personal recommendations to suit your interests and local tips for a more profitable trip.',
  },
  {
    icon: <User size={36} strokeWidth={2.2} />,
    title: 'Best Tour Guide',
    blurb:
      'Get personal recommendations to suit your interests and local tips for a more profitable trip.',
  },
];

export default function OurMission() {
  return (
    <Wrapper>
      {/* headings */}
      <Heading>Top-rated Best Service Present for you</Heading>
      <SubHeading>
        Discover incredible experiences around the world with the <br />
        highest-rated travel companions
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
          alt="Spectacular destination"
          whileInView={{ x: 0, opacity: 1 }}
          initial={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </Features>
    </Wrapper>
  );
}
