// components/NonDiscrimination/NonDiscrimination.tsx
import { Section, TwoCol } from '../container/styles';
import { Heading, ReadMore } from './styles';
import tiles from '../../assets/tiles.jpg';

export default function NonDiscrimination() {
  return (
    <>
      <Section style={{ background: '#001a93', color: 'white', paddingBottom: 0 }}>
        <TwoCol>
          <div>
            <Heading>Non-Discrimination Policy</Heading>
            <ReadMore href="/non-discrimination">Read More</ReadMore>
          </div>
          <p>
            {/* Copy the policy paragraph you posted */}
          </p>
        </TwoCol>
      </Section>
      <img src={tiles} alt="" style={{ width: 296, display: 'block' }} />
    </>
  );
}
