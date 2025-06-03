// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    overflow-x: hidden;        /* ← stops sideways scroll */
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.textDark};
  }

  img, video {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;
