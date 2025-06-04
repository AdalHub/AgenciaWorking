// src/components/container/styles.ts
import styled, { css } from 'styled-components';

/* ──────────────────────────────────────────
   Section
   • By default: centred, max-width 1200 px.
   • With $full: stretches 100 vw edge-to-edge.
   ────────────────────────────────────────── */
export const Section = styled.section<{ $full?: boolean }>`
  width: 100%;
  padding-block: 1.5rem;

  ${({ $full }) =>
    $full
      ? css`
          max-width: none;
          margin: 0;
        `
      : css`
          max-width: 1200px;
          margin-inline: auto;
        `}
`;

/* ──────────────────────────────────────────
   Two-column helper (unchanged)
   ────────────────────────────────────────── */
export const TwoCol = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
  
  
`;
