import styled from 'styled-components';

export const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const ReadMore = styled.a`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.accent};
  margin-top: 0.25rem;
`;

export const PolicyText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(0.95rem, 1.2vw, 1.05rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textLight};
  margin: 0;
`;
