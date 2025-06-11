import styled from 'styled-components';
import { motion } from 'framer-motion';

/* ───────────────────  slider frame ─────────────────── */
export const SliderWrap = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 6rem; /* clears space for the floating avatar */
`;

/* ───────────────────  avatar  ─────────────────── */
export const Avatar = styled.img`
  position: absolute;
  top: -56px;
  left: 50%;
  transform: translateX(-50%);  
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  z-index: 2;
`;

/* ───────────────────  testimonial card ─────────── */
export const Card = styled(motion.div)`
  width: min(100%, 640px);
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  border-radius: 12px;
  padding: 4.5rem 3rem 3.25rem;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
`;

/* reused title / copy / quote from previous file */
export const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  margin: 0;
`;

export const Sub = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  opacity: 0.75;
  margin: 0.15rem 0 1.5rem;
`;

export const Quote = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0;
`;

/* ───────────────────  arrows (perfect circles) ─────────────────── */
export const ArrowButton = styled.button<{ dir: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ dir }) => (dir === 'left' ? 'left: -48px;' : 'right: -48px;')}
  transform: translateY(-50%);

  /* exact outer size, border counted in               */
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;

  /* reset browser defaults that distort shape         */
  padding: 0;
  line-height: 0;

  /* colours                                           */
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;

  /* glyph size & perfect centring                     */
  font-size: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: background 0.25s, color 0.25s;

  &:hover {
    background: #fff;
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 780px) {
    display: none;   /* hide arrows on very small screens */
  }
`;


/* ───────────────────  dots  ─────────────────── */
export const Dot = styled.button<{ active: boolean }>`
  /* exact visual size */
  width: 8px;               /* inner circle */
  height: 8px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;

  /* reset browser defaults that made it look bigger */
  padding: 0;
  line-height: 0;
  display: inline-block;

  background: ${({ active, theme }) =>
    active ? theme.colors.primary : 'transparent'};

  cursor: pointer;
  transition: background 0.25s;
`;


export const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;
