import styled from 'styled-components';
import { Link } from 'react-router-dom';
import footerBg from '../../assets/floor.png';

/* ——————————————————————————————————————————
   Full-bleed footer background
   —————————————————————————————————————————— */
export const Wrapper = styled.footer`
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 7rem;      /* space for floating card */
  padding-bottom: 4rem;
  color: ${({ theme }) => theme.colors.textDark};

  background: rgb(235, 235, 237);
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    z-index: -1;
  }
`;

/* — floating card — */
export const ContactCard = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(240px, 50vw, 360px);

  background: #fff;
  color: ${({ theme }) => theme.colors.textDark};
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

  h3 {
    margin: 0 0 0.5rem;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  p {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

/* ————————————————————————————————
   Link grid
   ———————————————————————————————— */
export const Grid = styled.div`
  max-width: 1200px;
  margin: 4rem auto 3rem;
  display: grid;
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

export const GroupTitle = styled.h5`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 1rem;
  opacity: 0.8;
`;
/*service category titles*/
export const FooterLink = styled(Link)`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

/* — social row — */
export const SocialRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

export const SocialBtn = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid #c0c6d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c6d0;
  transition: background 0.25s, color 0.25s;

  &:hovDark    background: #fff;
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

/* — notes — */
export const Note = styled.p`
  max-width: 900px;
  margin: 0.8rem auto;
  font-size: 0.85rem;
  line-height: 1.55;
`;
/* — contact line — */
export const ContactRow = styled.p`
  max-width: 1200px;      /* ⬅️ same container width as Grid */
  margin: 2rem auto 0;    /* ⬅️ centres the whole row */
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  text-align: left;       /* ⬅️ left-aligns inside the centred block */

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;
