import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import './index.css';


import { GlobalStyles } from './styles/GlobalStyles';   


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> 
      <GlobalStyles /> 
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
