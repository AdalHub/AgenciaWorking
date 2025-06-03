import styled from 'styled-components';

// src/components/Container/styles.ts
export const Section = styled.section`
  padding-block: 1.5rem;      /*   ↓ Was 4–6 rem  */
  min-height: auto;           /*   Remove any vh   */
`;

export const TwoCol = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;
