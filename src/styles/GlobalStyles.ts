// src/styles/GlobalStyles.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;   /* stop any stray 1-pixel jiggle */
    margin: 0; overflow-x: hidden; 
    color: ${({ theme }) => theme.colors.textDark};
  }

`;
