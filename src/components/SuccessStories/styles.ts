import styled from 'styled-components';

export const Image = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    max-height: 360px;
  }
`;

/* ---------- TEXT ---------- */

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  
`;

export const TextBox = styled.div`
  background: #F7FBFF;                /* white box */
  padding: 1  rem;
  border-radius: 8px;
  box-shadow: 0 2px 6 px rgba(0, 0, 0, 0.08);
`;

export const Copy = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 1rem;
`;

export const Quote = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.primary}; /* dark blue */
  font-weight: 700;                              /* bold */
`;
