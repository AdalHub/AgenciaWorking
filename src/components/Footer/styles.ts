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

/* ————————————————————————————————
   Main Footer Grid
   ———————————————————————————————— */
export const FooterGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
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

export const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
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

/* ————————————————————————————————
   Bottom Section
   ———————————————————————————————— */
export const BottomGrid = styled.div`
  max-width: 1200px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
`;

export const ContactInfo = styled.div``;

export const SocialSection = styled.div`
  text-align: right;
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
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
`;