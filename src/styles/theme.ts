export const theme = {
  colors: {
    primary:   '#002b8c',
    secondary: '#cfd1e6',
    accent:    '#00828e',
    textDark:  '#0f172a',
    textLight: '#ffffff',
  },
  fonts: {
    heading: `'Playfair Display', serif`,
    body:    `'Inter', sans-serif`,
  },
  breakpoints: {
    md: '768px',
    lg: '1024px',
  },
} as const;

export type ThemeType = typeof theme; // export shape
