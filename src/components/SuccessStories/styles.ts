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

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 1rem;
`;

export const Copy = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textDark};
`;
