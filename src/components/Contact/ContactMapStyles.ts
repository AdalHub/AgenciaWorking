// src/components/Contact/ContactMapStyles.ts
import styled from 'styled-components';

/* —— centered square frame ——————————————— */
export const MapWrapper = styled.section`
  position: relative;
  width: 100%;
  max-width: 1000px;     
  aspect-ratio: 1 / 1;   
  margin: 2.5rem auto;   /* centers the block */

  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

/* —— iframe fills the square ———————————— */
export const Frame = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
`;
