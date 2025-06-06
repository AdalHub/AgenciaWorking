import styled from 'styled-components';

/* keeps 16:9 aspect ratio responsively */
export const MapWrapper = styled.section`
  position: relative;
  width: 100%;
  padding-top: 56.25%;        /* 16 : 9 */
  margin-bottom: 3rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
`;

/* fills the wrapper */
export const Frame = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
`;
