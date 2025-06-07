import styled from 'styled-components';

export const Hero = styled.section<{ $img: string }>`
  height: 45vh;
  background: url(${({ $img }) => $img}) center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;

  h1 {
    color: #fff;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(2.2rem, 6vw, 3.5rem);
    text-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  }
`;

export const Wrapper = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1rem 5rem;
  text-align: center;
`;

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin: 0 0 0.6rem;
`;

export const SubTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  font-size: clamp(1.1rem, 2.4vw, 1.3rem);
  margin: 0 0 2rem;
`;

export const Body = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.7;
  font-size: 1rem;
  max-width: 55rem;
  margin: 0 auto 1.2rem;
`;
