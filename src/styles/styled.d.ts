// src/styles/styled.d.ts
import 'styled-components';
import { theme } from './theme';   // ← path is now ./theme (same folder)

type AppTheme = typeof theme;

declare module 'styled-components' {
  /* every ({ theme }) in styled-components now has this shape */
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface DefaultTheme extends AppTheme {}
}
