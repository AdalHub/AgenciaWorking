import { Banner, Inner, Headline, CTA } from './styles';
import heroBg from '../../assets/training.jpg';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <Banner $bg={heroBg}>
      <Inner>
        <Headline>
          Cross-Border HR<br />
          Solutions That<br />
          Power Growth
        </Headline>
        <CTA as={Link} to="/contact">
           Talk to a Talent Agent
        </CTA>
      </Inner>
    </Banner>
  );
}
