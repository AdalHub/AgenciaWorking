import styled from 'styled-components';
import { Link } from 'react-router-dom';

/* — Header bar — */
export const Wrapper = styled.header<{ scrolled: boolean }>`
  position: fixed;                 /* always on top of page          */
  top: 0;
  left: 0;
  right: 0;
  height: 64px;                    /* lock-in height so nothing spills */
  padding: 0 1.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: ${({ scrolled, theme }) =>
    scrolled ? theme.colors.primary : theme.colors.textLight};

  z-index: 9999;                   /* beats any hero/slider behind it */
`;

/* — Logo — */
export const Logo = styled.img`
  height: 48px;                    /* fits cleanly inside 64-px bar   */
  flex-shrink: 0;
`;

/* — Nav container — */
export const Nav = styled.nav`
  display: flex;
  gap: 1.25rem;
  flex-wrap: nowrap;               /* never wraps                    */
  align-items: center;
`;

/* — Individual link — */
export const MenuItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== '$scrolled', // ⬅️ don’t push to DOM
})<{ $scrolled: boolean }>`
  position: relative;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;

  color: ${({ $scrolled }) => ($scrolled ? '#ffffff' : '#0f172a')};

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -0.25rem;
    width: 0;
    height: 2px;
    background: currentColor;
    transform: translateX(-50%);
    transition: width 0.25s ease;
  }
  &:hover::after {
    width: 100%;
  }
`;

/* ========================================================================
   MEGA MENU STYLES – new open/close transitions + staggered items
   ===================================================================== */

import { css, keyframes } from 'styled-components';


/* —————————————————— panel slide animations ——————————————— */
const slideIn  = css`opacity: 1; transform: translateY(0);`;
const slideOut = css`opacity: 0; transform: translateY(-12px);`;

/* ——— panel (no opacity changes) ——————————————— */
export const MegaWrap = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 9998;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 2.5rem clamp(1rem, 5vw, 4rem) 3rem;

  transform: ${({ $open }) =>
    $open ? 'translateY(0)' : 'translateY(-110%)'};
  transition: transform 550ms cubic-bezier(0.23, 1, 0.32, 1);

  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
`;

/* — three-column grid — */
export const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const ColTitle = styled.h4`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin: 0 0 1rem;
  color: #8f95a3;
`;



/* ────────────────────────────────────────────────────────────────── */
/*  link animations                                                  */
/* ────────────────────────────────────────────────────────────────── */
const dropIn = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0);     }
`;
const dropOut = keyframes`
  from { opacity: 1; transform: translateY(0);     }
  to   { opacity: 0; transform: translateY(-14px); }
`;

/* Service links with transition-based stagger */
export const ServiceLink = styled(Link)<{
  $open: boolean;
  $delay: number;
}>`
  display: block;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  margin: 0.35rem 0;

  /* initial (closed) state */
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? 'translateY(0)' : 'translateY(-12px)'};

  /* smooth fade/slide with individual delay */
  transition:
    opacity 260ms ease ${({ $delay }) => $delay}ms,
    transform 260ms ease ${({ $delay }) => $delay}ms;
    opacity   480ms ease ${({ $delay }) => $delay}ms,
    transform 480ms ease ${({ $delay }) => $delay}ms;

  &:hover {
    text-decoration: underline;
  }
`;
