// src/components/WhyChoose/Card.tsx
import styled from 'styled-components';

interface CardProps {
  text: string;
}

const Wrapper = styled.div`
  /* visual shell */
  background: ${({ theme }) => theme.colors.textLight};          /* pure white */
  border-radius: 12px;
  padding: 2rem 1.5rem;
  max-width: 28rem;
  margin-inline: auto;

  /* shadow + hover “lift” */
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
    }
  }

  /* text style */
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(0.95rem, 1.5vw, 1.125rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Card = ({ text }: CardProps) => <Wrapper>{text}</Wrapper>;

export default Card;
