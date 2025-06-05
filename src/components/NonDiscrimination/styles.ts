import styled from 'styled-components';

/* ——————————————————————————————————————————
   Outer 50 / 50 split
   —————————————————————————————————————————— */
export const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 80vh;                   /* similar proportion to screenshot */
`;

/* ——————————————————————————————————————————
   Left blue column
   —————————————————————————————————————————— */
export const Left = styled.div`
  background: #001a93;                /* deep brand blue */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 6vw;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.6rem, 6vw, 4rem);
  line-height: 1.05;
  margin: 0 0 3rem 0;
`;

export const Dash = styled.span`
  display: block;
  width: 28px;
  height: 2px;
  background: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1.75rem;
`;

export const ReadMore = styled.a`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.textLight};
  width: max-content;
`;

/* ——————————————————————————————————————————
   Right white column
   —————————————————————————————————————————— */
export const Right = styled.div`
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 6vw;
`;

export const PolicyText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.15vw, 1.05rem);
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0;
  max-width: 38rem;
`;
