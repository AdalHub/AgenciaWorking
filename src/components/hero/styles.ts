import styled from 'styled-components';
import { Section } from '../container/styles';  // the 1200-px grid

/* ———————————————————————————————
   OUTER full-width banner
   ——————————————————————————————— */
/* src/components/hero/styles.ts */
export const Banner = styled.section<{ $bg: string }>`
  padding-top: 64px;            /* room for the fixed header          */
  min-height: calc(60vh);       /* keep your existing min-height      */

  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  margin-left: -50vw;
  margin-right: -50vw;

  background: url(${({ $bg }) => $bg}) center / cover no-repeat;
  display: flex;
  align-items: center;
  overflow: hidden;
`;
/* ———————————————————————————————
   INNER grid – stays max-width 1200 px
   ——————————————————————————————— */
export const Inner = styled(Section)`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  /* ← NEW: responsive gutter so inner content is never flush */
  padding: 0 clamp(1rem, 5vw, 2rem);
`;

/* headline unchanged */

/* — CTA — */
export const CTA = styled.a`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textLight};
  padding: 0.8rem 1.8rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;

  /* ← NEW: keeps a comfy gap between button & right wall */
  margin-right: auto;
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
