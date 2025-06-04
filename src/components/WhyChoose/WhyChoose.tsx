// src/components/WhyChoose/WhyChoose.tsx
import styled from 'styled-components';
import { Section } from '../container/styles';
import bgImg from '../../assets/whychoose_bg.png';   // ← your photo here

/* ——————————————————————————————————————————
   1.  Section with the hero-style background
   —————————————————————————————————————————— */
const StorySection = styled(Section)`
  /* override whatever Section supplies */
  background: url(${bgImg}) center / cover no-repeat fixed; /* fills width */
  display: flex;               /* centres the white box */
  justify-content: center;
  align-items: center;

  /* height can be as tall as you like; 70 vh matches screenshot */
  min-height: 70vh;
  padding: 4rem 1.5rem;        /* top/bottom breathing room */

  

`;

/* ——————————————————————————————————————————
   2.  White content box
   —————————————————————————————————————————— */
const Box = styled.div`
  background: ${({ theme }) => theme.colors.textLight};  /* pure white */
  max-width: 850px;
  width: 100%;
  padding: 3rem 2.5rem;
  text-align: center;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 4px;

  h2 {
    font-family: ${({ theme }) => theme.fonts.heading ?? theme.fonts.body};
    font-size: clamp(1.8rem, 3vw, 2.25rem);
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1.5rem;
  }

  p {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(1rem, 1.4vw, 1.125rem);
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.textDark};
    margin: 0 auto;
    max-width: 40rem;
  }
`;

/* ——————————————————————————————————————————
   3.  Component
   —————————————————————————————————————————— */
export default function WhyChoose() {
  return (
    <StorySection>
      <Box>
        <h2>Our Story</h2>
        <p>
          Agencia Working is a solid and reliable company that has been operating since
          1999. We are driven by a team of highly qualified professionals dedicated to
          advancing Human Development through effective talent and workforce solutions.
        </p>
        <p>
          Our main office is located in Tamaulipas, Mexico, and we have representatives
          across various states throughout the country. In&nbsp;2007, we expanded into
          the U.S. market by opening our office in San&nbsp;Antonio, Texas.
        </p>
      </Box>
    </StorySection>
  );
}
