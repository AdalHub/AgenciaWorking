import styled from 'styled-components';
import { Section } from '../container/styles';  // the 1200-px grid

/* ———————————————————————————————
   OUTER full-width banner
   ——————————————————————————————— */
export const Banner = styled.section<{ $bg: string }>`
  /* full-bleed trick */
  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  margin-left: -50vw;
  margin-right: -50vw;

  /* hero look */
  min-height: 60vh;
  background: url(${({ $bg }) => $bg}) center / cover no-repeat;
  display: flex;            /* centres the inner grid */
  align-items: center;
  overflow: hidden;         /* keep children inside banner height */
`;

/* ———————————————————————————————
   INNER grid – stays max-width 1200 px
   ——————————————————————————————— */
export const Inner = styled(Section)`
  display: flex;
  align-items: center;
  gap: 2.5rem;
`;

/* headline & CTA unchanged */
export const Headline = styled.h1`
  background: ${({ theme }) => theme.colors.primary};
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
