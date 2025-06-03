import styled from 'styled-components';

export const Wrapper = styled.header<{ scrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem 2rem;

  /* ⬇️  White when at top, brand-blue once scrolled */
  background: ${({ scrolled, theme }) =>
    scrolled ? theme.colors.primary : theme.colors.textLight};

  transition: background 0.3s ease;
`;

export const Logo = styled.img`
  height: 48px;
`;

/* ─ Menu ───────────────────────────────────────────── */

export const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

export const MenuItem = styled.a<{ scrolled: boolean }>`
  /* dark text on white bar, light text on blue bar */
  color: ${({ scrolled, theme }) =>
    scrolled ? theme.colors.textLight : theme.colors.textDark};

  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
