import styled from 'styled-components';

import { motion } from 'framer-motion';

export const Card = styled(motion.div)`
  padding: 1.3rem 1.6rem;
  border-bottom: 1px solid #e5e7eb;

  h4 {
    font-size: 1rem;
    margin: 0 0 0.4rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  .meta {
    font-size: 0.85rem;
    color: #505864;
    margin-bottom: 0.55rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.3rem;
  }

  .chip {
    background: #f1f5fa;
    font-size: 0.75rem;
    padding: 0.25rem 0.7rem;
    border-radius: 14px;
  }
`;
