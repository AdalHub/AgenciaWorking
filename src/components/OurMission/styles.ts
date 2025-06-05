import styled from 'styled-components';
import { motion } from 'framer-motion';

/* --- outer section --- */
export const Wrapper = styled.section`
  max-width: 1200px;
  margin-inline: auto;
  padding-block: 5rem 6rem;
  text-align: center;
`;

/* headings */
export const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  
`;  

export const SubHeading = styled.p`
  max-width: 38rem;
  margin: 0 auto 3rem;
  font-size: clamp(0.95rem, 1.3vw, 1.05rem);
  color: #6b7280; /* gray-500 */
`;

/* --- grid --- */
export const Features = styled.div`
  display: grid;
  gap: 2.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 420px; /* left text / right image */
    align-items: center;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2.25rem;
  }

  li {
    display: flex;
    gap: 1.1rem;
    text-align: left;
  }

  .icon {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
    margin-top: 0.2rem;
  }

  h4 {
    margin: 0 0 0.25rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

/* --- animated picture --- */
export const RightImage = styled(motion.img)`
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.15);
`;
