import { Wrapper, Headline, CTA } from './styles';
import heroBg from '../../assets/bg.jpg';

export default function Hero() {
  return (
    <Wrapper $bg={heroBg}>
      <Headline>
        Cross-Border HR<br />
        Solutions That<br />
        Power Growth
      </Headline>

      <CTA href="#contact">Talk to a Talent Agent</CTA>
    </Wrapper>
  );
}