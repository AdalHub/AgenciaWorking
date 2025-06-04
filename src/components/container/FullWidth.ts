import styled from 'styled-components';

/**
 *  Use for hero banners, image stripes, etc.
 *  • Stretches the BACKGROUND across the viewport
 *  • Keeps inner content on the normal 1200-px grid
 */
export const FullWidth = styled.section`
  /* full-bleed shell — the trick */
  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  margin-left: -50vw;
  margin-right: -50vw;

  /* centre its children just like <Section> does */
  display: flex;
  justify-content: center;     /* horizontal */
  padding-block: 4rem;

  /* make sure we don’t cause sideways scroll */
  overflow-x: hidden;
`;
