import styled from 'styled-components';
import footerBg from '../../assets/floor.png';

/* ——————————————————————————————————————————
   Full-bleed footer with background image
   —————————————————————————————————————————— */
export const Wrapper = styled.footer`
  position: relative;
  width: 100vw;
  left: 50%;                        /* full-bleed trick */
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  /* background photo + dark overlay */
  background: url(${footerBg}) center / cover no-repeat;
  isolation: isolate;               /* so ::before stays behind content */

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5); /* darken photo a bit */
    z-index: -1;
  }





  /* give breathing room so card doesn’t overlap content above */
  padding: 6rem 1rem 3rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textLight};
`;

/* ——————————————————————————————————————————
   Floating contact card
   —————————————————————————————————————————— */
export const ContactCard = styled.div`
  position: absolute;
  top: 0;                           /* sit at the very top of wrapper */
  left: 50%;
  transform: translate(-50%, -50%); /* pull up by half its own height */

  width: clamp(240px, 50vw, 360px);

  background: ${({ theme }) => theme.colors.textLight};
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

/* ——————————————————————————————————————————
   Legal note
   —————————————————————————————————————————— */
export const Note = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  line-height: 1.4;
`;
