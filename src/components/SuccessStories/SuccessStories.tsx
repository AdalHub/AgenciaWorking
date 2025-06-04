import { Section, TwoCol } from '../container/styles';
import { Title, Copy, Image } from './styles';
import plant from '../../assets/customer_pic.jpg';

export default function SuccessStories() {
  return (
    <Section style={{ background: 'var(--lavender)' }}>
      <TwoCol>
        <Image src={plant} alt="" />
        <div>
          <Title>Success Stories</Title>
          <Copy>
            {/* Paste the long paragraph you showed */}
          </Copy>
        </div>
      </TwoCol>
    </Section>
  );
}
