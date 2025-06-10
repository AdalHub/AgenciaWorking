import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
/* —— section wrapper —— */
export const SectionWrap = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
`;

/* small label */
export const Kicker = styled.span`
  display: block;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 0.5rem;
`;

/* big headline */
export const BigTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  max-width: 38rem;
  margin: 0 0 2rem 0;
  color: ${({ theme }) => theme.colors.textDark};
`;

/* —— filter pills —— */
export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

export const Pill = styled.button<{ $active: boolean }>`
  border: none;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  ${({ $active, theme }) =>
    $active
      ? css`
          background: ${theme.colors.primary};
          color: #fff;
        `
      : css`
          background: #f0f2f5;
          color: ${theme.colors.textDark};
        `}
`;

/* —— responsive grid —— */
export const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, 260px);
`;

/*   /  /  /           EL card           /  /  /   */
export const Card = styled(motion.article)`
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
  }

  h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.1rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textDark};
  }

  p {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.textDark};
    flex: 1 1 auto;
  }
`;

export const Icon = styled.img`
  width: 48px;
  height: 48px;
`;

export const More = styled(Link)`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &::after {
    content: '›';
    font-size: 1.1em;
    transition: transform 0.2s;
  }

  &:hover::after {
    transform: translateX(2px);
  }
`;
