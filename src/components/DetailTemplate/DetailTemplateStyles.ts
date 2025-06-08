import styled from 'styled-components';

/* ─── Hero — no background image ──────────────────────────────────── */
export const Hero = styled.section`
  padding: 6rem 1rem 4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const Kicker = styled.span`
  display: block;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

export const MainTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.3rem, 6vw, 3.8rem);
  margin: 0.3rem 0 1rem;
`;

export const SubTitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1.1rem;
  max-width: 46rem;
  margin: 0 auto 2.5rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
`;

export const Btn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

/* ─── Content section ─────────────────────────────────────────────── */
export const Wrapper = styled.main`
  max-width: 1000px;
  margin: 0 auto 4rem;
  padding: 0 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textDark};

  img {
    width: 100%;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    margin-bottom: 2.5rem;
  }
`;

export const BodyP = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.7;
  font-size: 1.05rem;
  margin-bottom: 1.1rem;
`;
