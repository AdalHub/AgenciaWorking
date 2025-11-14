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

  /* Ensure all inputs and textareas have white backgrounds by default */
  input:not([type="checkbox"]):not([type="radio"]),
  textarea,
  select {
    background-color: #ffffff !important;
    color: #111827;
  }

  /* Date and datetime-local inputs */
  input[type="date"],
  input[type="datetime-local"],
  input[type="time"],
  input[type="month"],
  input[type="week"] {
    background-color: #ffffff !important;
    color: #111827;
  }

`;
