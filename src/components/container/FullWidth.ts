import styled from 'styled-components';

/**
 *  Use for hero banners, image stripes, etc.
 *  • Stretches the BACKGROUND across the viewport
 *  • Keeps inner content on the normal 1200-px grid
 */
export const FullWidth = styled.section`
  position: relative;
  left: 50%;
  width: 100vw;
  margin-left: -50vw;   /* pull back exactly half the viewport */

  /* 👇 these two must be deleted or commented out
  right: 50%;
  margin-right: -50vw;
  */

  display: flex;
  justify-content: center;
  padding-block: 4rem;
  overflow-x: hidden;
`;

