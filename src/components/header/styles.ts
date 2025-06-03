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
export const MenuItem = styled(Link)<{ scrolled: boolean }>`
  position: relative;
  font-size: 0.9rem;               /* ≈14 px — small enough to fit    */
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
  color: ${({ scrolled }) => (scrolled ? '#ffffff' : '#0f172a')};

  &::after {                       /* simple underline grow effect   */
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
