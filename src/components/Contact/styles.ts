import styled, { css } from 'styled-components';

// ContactBlockStyles.ts
export const Wrapper = styled.section`
  background: #cfd1e6;

  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin-inline: auto;   /* ⬅️ keeps it centered like the map */
`;


/* two-column grid */
export const TwoCol = styled.div`
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  gap: 3rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 2fr;
  }
`;

/* left side */
export const Details = styled.div`
  text-align: left;
  font-family: ${({ theme }) => theme.fonts.body};
  line-height: 1.55;

  p {
    margin: 0 0 0.3rem;
  }
`;

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  margin: 0 0 1.25rem;
`;

/* right side – form */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Row = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const fieldStyles = css<{ $error?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  padding: 0.65rem 0.75rem;
  border-radius: 4px;
  border: 2px solid
    ${({ $error, theme }) => ($error ? '#e11d48' : theme.colors.primary)};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Input = styled.input<{ $error?: boolean }>`
  ${fieldStyles};
`;

export const TextArea = styled.textarea<{ $error?: boolean }>`
  ${fieldStyles};
  resize: vertical;
`;

export const Button = styled.button`
  align-self: flex-end;
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: none;
  padding: 0.7rem 3rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
  }
`;
