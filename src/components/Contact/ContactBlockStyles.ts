import styled, { css } from 'styled-components';

/* --- LAYOUT CONTAINERS ----------------------------------------------- */

/* full-width lavender bar */
export const Wrapper = styled.section`
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  padding: 4rem 1rem;
`;

/* centred inner container (replaces previous max-width on Wrapper) */
export const Inner = styled.div`
  max-width: 1150px;
  margin-inline: auto;
`;

export const TwoCol = styled.div`
  display: grid;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

/* --- LEFT COLUMN ------------------------------------------------------ */

export const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.3rem, 2.2vw, 1.75rem);
  margin-bottom: 1rem;
`;

export const Details = styled.address`
  font-style: normal;
  line-height: 1.6;
  padding-left: 0.25rem;

  p {
    margin: 0 0 0.4rem;
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1rem;
  }
`;

/* --- RIGHT COLUMN: FORM ---------------------------------------------- */

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const Row = styled.div`
  display: grid;
  column-gap: 1rem;               /* horizontal space */
  row-gap: 0.75rem;               /* small vertical gap for wrap */

  /* three equal columns on desktop; stacks automatically below */
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/* shared field mix-in */
const field = css<{ $error?: boolean }>`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid
    ${({ $error, theme }) => ($error ? 'crimson' : theme.colors.primary)};
  background: #ffffff;
  color: ${({ theme }) => theme.colors.textDark};

  &::placeholder {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 0.7;
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
`;

export const Input = styled.input<{ $error?: boolean }>`
  ${field}
`;

export const TextArea = styled.textarea<{ $error?: boolean }>`
  ${field}
  resize: vertical;
`;

/* --- SUBMIT BUTTON ---------------------------------------------------- */

export const Button = styled.button`
  align-self: start;
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border-radius: 6px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
