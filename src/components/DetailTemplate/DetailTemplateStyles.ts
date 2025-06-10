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


/* 👇 add below existing exports */
export const ContentBlock = styled.div`
  max-width: 640px;
  margin: 0 auto 1.4rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1.05rem;
  line-height: 1.7;

  /* NEW –– everything inside this column starts flush-left */
  text-align: left;

  /* keep the mini-titles centred */
  h2, h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: 700;
    margin: 2rem auto 1rem;
    text-align: left;
  }
  h2 { font-size: 1.55rem; background:rgba(255, 255, 255, 0); padding: 0 .35rem; display: inline-block; }
  h3 { font-size: 1.25rem; }

  /* list stays tidy and centred as a block */
  ul {
    list-style: disc;
    padding-left: 1.2rem;
    display: inline-block;
    text-align: left;
  }
  li { margin-bottom: .4rem; }
`;

/* ─── Careers CTA banner ────────────────────────────────────────── */
export const CareersBanner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  margin: 4rem auto 5rem;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.15);

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }

  /* left image pane */
  .photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* right text pane */
  .content {
    background: #12232f;          /* deep slate */
    color: #ffffff;
    padding: 4rem 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    justify-content: center;

    h5 {
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0;
      opacity: 0.7;
    }

    h2 {
      font-family: ${({ theme }) => theme.fonts.heading};
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      margin: 0;
    }

    p {
      font-family: ${({ theme }) => theme.fonts.body};
      font-size: 1rem;
      line-height: 1.6;
      opacity: 0.9;
      margin: 0;
      max-width: 32rem;
    }

    a {
      margin-top: 1.2rem;
      display: inline-block;
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
      padding: 0.6rem 1.8rem;
      border-radius: 28px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.25s;
    }

    a:hover {
      background: ${({ theme }) => theme.colors.accent};
    }
  }
`;
