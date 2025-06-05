import styled from 'styled-components';

export const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;   /* trim vertical space */
  
  /* auto-fit trick makes it responsive */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

export const Card = styled.article<{ img: string }>`
  background: ${({ img }) => `url(${img}) center/cover no-repeat`};
  border-radius: 12px;
  min-height: 220px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
  }

  /* overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 43, 140, 0.55);  /* theme.colors.primary @ 55 % */
    transition: opacity 0.2s ease;
    opacity: 0;
  }
  &:hover::before {
    opacity: 1;
  }

  /* inner content */
  h3,
  p,
  a {
    position: relative; /* sit above the ::before overlay */
    z-index: 1;
    margin: 0;
    padding: 0 1.25rem;
    color: ${({ theme }) => theme.colors.textLight};
  }

  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.35rem;
    margin-top: 1.25rem;
  }

  p {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.95rem;
    margin: 0.75rem 0 2.5rem;
  }

  a {
    font-weight: 600;
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  
`;  