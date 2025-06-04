import styled from 'styled-components';

export const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-block: 1.5rem;
`;

export const TwoCol = styled.div`
  display: grid;
  gap: 2rem;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;
