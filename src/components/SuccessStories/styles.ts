import styled from 'styled-components';
import { motion } from 'framer-motion';

/* ---------- IMAGE ---------- */

export const Image = styled(motion.img)`
  width: 100%;
  max-width: 360px;       /* keeps it tidy on large screens        */
  aspect-ratio: 1 / 1;    /* perfect square before rounding        */
  object-fit: cover;
  border-radius: 50%;     /* ⬅️ makes it a circle                   */
  flex-shrink: 0;         /* never squish in the 2-column layout    */
`;

/* ---------- TEXT ---------- */

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0 0 0.75rem;
`;

export const TextBox = styled.div`
  background: #f7fbff;
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

export const Copy = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0 0 1rem;
`;

export const Quote = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  margin: 0;
`;
