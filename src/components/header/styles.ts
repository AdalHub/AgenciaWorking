import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

/* ───────────────── HEADER BAR ───────────────── */
export const Wrapper = styled.header<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme, $scrolled }) =>
    $scrolled ? theme.colors.primary : theme.colors.textLight};
  z-index: 9999;
`;

export const Logo = styled.img`
  height: 48px;
  flex-shrink: 0;
`;

/* ───────────────── DESKTOP NAV ───────────────── */
export const Nav = styled.nav`
  display: flex;
  gap: 1.25rem;
  align-items: center;

  @media (max-width: 899px) {
    display: none;
  }
`;

export const MenuItem = styled(Link)<{
  $scrolled: boolean;
  $hassub?: boolean;
}>`
  position: relative;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  color: ${({ $scrolled }) => ($scrolled ? '#fff' : '#0f172a')};

  ${({ $hassub }) =>
    $hassub &&
    css`
      &::after {
        content: '';
        border: solid currentColor;
        border-width: 0 2px 2px 0;
        display: inline-block;
        padding: 3px;
        margin-left: 4px;
        transform: rotate(-45deg) translateY(-1px);
        opacity: 0;
        transition: opacity 0.2s;
      }
      &:hover::after {
        opacity: 1;
      }
    `}
`;

/* ───────────────── MOBILE HAMBURGER ───────────────── */
export const Burger = styled.button<{
  $scrolled: boolean;
  $open: boolean;
}>`
  display: none;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 899px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  &:hover,
  &:active {
    background: rgba(0, 0, 0, 0.08);
  }

  span,
  span::before,
  span::after {
    content: '';
    display: block;
    width: 26px;
    height: 3px;
    border-radius: 1.5px;
    background: ${({ $scrolled }) => ($scrolled ? '#fff' : '#0f172a')};
    transition: transform 0.25s, opacity 0.25s, background 0.25s;
  }
  span {
    position: relative;
  }
  span::before {
    position: absolute;
    top: -8px;
  }
  span::after {
    position: absolute;
    top: 8px;
  }

  ${({ $open }) =>
    $open &&
    css`
      span {
        background: transparent;
      }
      span::before {
        transform: rotate(45deg);
        top: 0;
      }
      span::after {
        transform: rotate(-45deg);
        top: 0;
      }
    `}
`;

/* ───────────────── MOBILE OVERLAY ───────────────── */
export const Overlay = styled.div<{ $open: boolean }>`
  @media (min-width: 900px) {
    display: none;
  }
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 9998;
  overflow-y: auto;
  transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
  transition: transform 550ms cubic-bezier(0.23, 1, 0.32, 1);
`;

/* panel wrapper slides root <-> services */
export const PanelWrap = styled.div<{ $level: 0 | 1 }>`
  width: 200%;
  display: flex;
  transition: transform 550ms cubic-bezier(0.23, 1, 0.32, 1);
  transform: translateX(${({ $level }) => ($level === 0 ? '0' : '-50%')});
`;

export const Panel = styled.div`
  padding-top:0.50rem;
  width: 50%;
  padding: 2.5rem 1.75rem 4rem;
`;

/* ───────────────── MOBILE LINKS ───────────────── */
export const MobileLink = styled(Link)`
  display: flex;                 /* keeps arrow & text inline-centre */
  align-items: center;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0.75rem 0;
  color: #0f172a;
  text-decoration: none;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

export const SmallLink = styled(MobileLink)`
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 2rem;
`;

export const RightArrow = styled.span`
  width: 8px;
  height: 8px;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  transform: rotate(-45deg);
  margin-left: 0.75rem;  /* nice gap from text */
  flex-shrink: 0;        /* never collapse     */
`;

/* back chevron */
export const BackBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1.50rem;      /* keeps arrow away from viewport edge */
  font-size: 1.5rem;
  color: #0f172a;
  cursor: pointer;
  margin-bottom: 2rem;

  &::before {
    content: '';
    border: solid currentColor;
    border-width: 0 2px 2px 0;
    padding: 6px;
    transform: rotate(135deg);
  }
`;

/* ───────────────── DESKTOP MEGA MENU ───────────────── */
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
  transform: translateY(${({ $open }) => ($open ? '0' : '-110%')});
  transition: transform 550ms cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};

  @media (max-width: 899px) {
    display: none;
  }
`;

export const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ColTitle = styled.h4`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem;
  color: #8f95a3;
`;

export const ServiceLink = styled(Link)<{ $open: boolean; $delay: number }>`
  display: block;
  font-size: 1.05rem;
  margin: 0.35rem 0;
  color: ${({ theme }) => theme.colors.textDark};
  text-decoration: none;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: translateY(${({ $open }) => ($open ? '0' : '-12px')});
  transition:
    opacity 260ms ease ${({ $delay }) => $delay}ms,
    transform 260ms ease ${({ $delay }) => $delay}ms;
`;
