import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Card = styled(motion.div)`
  padding: 1.3rem 1.6rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer; /* Makes the entire card clickable */
  transition: background-color 0.2s ease; /* Smooth hover effect */

  &:hover {
    background-color: #f8f8f8; /* Light background on hover */
  }

  h4 {
    font-size: 1rem;
    margin: 0 0 0.4rem;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none; /* Ensure no default underline */
    &:hover {
      text-decoration: underline; /* Add underline on title hover */
    }
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