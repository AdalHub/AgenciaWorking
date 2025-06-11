import styled, { css, keyframes  } from 'styled-components';

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

/* --- SUBMIT BUTTON (Existing - updated for loading) ------------------------------------ */

// Define the loading animation (optional, can be a simple spinner if preferred)
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
  position: relative; // For spinner positioning
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #cccccc; // Grey out when disabled
  }

  // Loading Spinner styles (optional, can be replaced with an SVG or other animation)
  &.loading::after {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-left: 8px;
  }
`;

/* --- NEW: Success Pop-up Styles ---------------------------------------- */

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7); /* Grey out effect */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top of everything */
`;

export const PopupBox = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px; /* Border radius */
  width: 500px; /* Fixed width */
  max-width: 90%; /* Max width for responsiveness */
  height: 300px; /* Fixed height */
  max-height: 90vh; /* Max height for responsiveness */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #a0a0a0; /* Grey color for the cross icon */
  font-size: 1.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #606060;
  }
`;

export const CheckIconContainer = styled.div`
  color: #28a745; /* Green color for checkmark */
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 80px; /* Big icon size */
    height: 80px;
  }
`;

export const SuccessMessage = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: #000000; /* Black text */
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
`;