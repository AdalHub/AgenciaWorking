// src/components/Hero/styles.ts
import styled from 'styled-components';



export const Section = styled.section`
  width: 100%;
  max-width: 100vw;      /* 🔑 never wider than the viewport */
  overflow-x: hidden;    /* hides any rogue child that still insists */
  padding: 2rem 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 3rem 2rem;
  }
`;

interface WrapperProps {
  /** full URL produced by Vite’s import */
  $bg: string;
}
export const Wrapper = styled(Section)<WrapperProps>`
  max-width: 100vw;                      /* belt -and- braces */
  min-height: 60vh;

  background: 
              url(${({ $bg }) => $bg}) center / cover no-repeat;

  display: flex;
  align-items: center;
  gap: 2.5rem;
`;

export const Headline = styled.h1`
  background: ${({ theme }) => theme.colors.primary};   /* blue rectangle */
  color: ${({ theme }) => theme.colors.textLight};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  margin: 0;
  padding: 1rem 1.5rem;
  max-width: 14ch;
`;

export const CTA = styled.a`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textLight};
  padding: 0.8rem 1.8rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
`;
