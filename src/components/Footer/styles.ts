import styled from 'styled-components';
import { Link } from 'react-router-dom';
/* ——————————————————————————————————————————
   Full-bleed wrapper — make it responsive
   —————————————————————————————————————————— */
export const Wrapper = styled.footer`
  position: relative;

  /* full-bleed for desktop */
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);

  padding: 7rem clamp(1rem, 4vw, 3rem) 4rem;   /* side padding grows/shrinks */
  background: rgb(235, 235, 237);
  isolation: isolate;
  color: ${({ theme }) => theme.colors.textDark};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgba(0, 0, 0, 0);
  }

  /* —— MOBILE: turn off the translate trick & add padding —— */
  @media (max-width: 600px) {
    width: 100%;          /* no 100vw - it ignores the scrollbar */
    left: 0;
    transform: none;
    margin-left: 0;      /* NEW */
    margin-right: 0;     /* NEW */
    padding-left: 1rem;            /* safe gutter so text wraps */
    padding-right: 1rem;
    box-sizing: border-box;
  }
`;

/* ————————————————————————————————
   Main footer grid
   ———————————————————————————————— */
export const FooterGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 3fr;   /* logo   |  services */
  gap: 2rem;

  @media (max-width: 900px) {       /* tablet */
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {       /* phone  */
    grid-template-columns: 1fr;
  }
`;

/* collapse the three-column services grid */
export const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 900px) {  grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) {  grid-template-columns: 1fr; }
`;


export const SocialSection = styled.div`
  text-align: right;
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;
/* ————————————————————————————————
   Bottom strip (contacts + socials)
   ———————————————————————————————— */
export const BottomGrid = styled.div`
  max-width: 1200px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    text-align: center;

    /* helper tweaks so the icons sit in the middle */
    ${SocialSection} { text-align: center; }
    ${SocialRow}     { justify-content: center; }
  }
`;

export const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
`;

export const LogoLink = styled(Link)`
  display: block;
  /* --- MODIFICATION START --- */
  width: 160px;  /* Set your desired width */
  height: 165px; /* Set your desired height */
  margin-bottom: 1rem;
  

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Ensures the image fits within the box without stretching */
  }
  /* --- MODIFICATION END --- */
`;

export const MexicoLocation = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textDark};
  font-weight: 500;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const GroupTitle = styled.h5`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 1rem;
  opacity: 0.8;
`;

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



export const ContactInfo = styled.div``;



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

  &:hover {
    background: #fff;
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Note = styled.p`
  font-size: 0.85rem;
  line-height: 1.55;
  margin: 0.8rem 0;
`;

export const ContactRow = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  text-align: left;
  margin-top: 1.5rem;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  
    /* —— phones —— */
  @media (max-width: 600px) {
    text-align: center;
  }
`;