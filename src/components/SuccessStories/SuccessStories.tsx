import { Section, TwoCol } from '../container/styles';
import { Title, Copy, Image, Quote, TextBox } from './styles';
import plant from '../../assets/customer_pic.jpg';

export default function SuccessStories() {
  return (
    <Section style={{ background: 'var(--lavender)' }}>
      <TwoCol>
        <Image src={plant} alt="Customer smiling next to plants" />
        <div>

          {/* White text box containing the testimonial */}
          <TextBox>
            <Title>Success Stories</Title>
            <Copy>
              "As an HR Lead for a major conglomerate in the United States, I have had the
              opportunity to work closely with Working Agency over the past few years across a wide
              range of recruitment efforts in Mexico. From hiring skilled laborers to placing key
              leadership roles such as General Managers. Their team has consistently demonstrated
              exceptional professionalism, efficiency, and a deep understanding of the Mexican labor
              market.
              <br /><br />
              In addition to providing highly qualified candidates, the agency has offered valuable
              guidance on critical matters such as competitive salary benchmarks, Mexican labor
              laws, and best hiring practices. Their insight has been instrumental in the success of
              our operations in Mexico.
              <br /><br />
              I highly recommend Working Agency as a trusted and strategic partner for any company
              seeking relocating to Mexico."
            </Copy>
            <Quote>- Adrian Zapata</Quote>
          </TextBox>
        </div>
      </TwoCol>
    </Section>
  );
}
