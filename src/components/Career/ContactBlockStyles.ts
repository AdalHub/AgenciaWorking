import styled, { css, keyframes } from 'styled-components';

/* --- LAYOUT CONTAINERS (Existing) ----------------------------------------------- */

export const Wrapper = styled.section`
  width: 100%;
  background: ${({ theme }) => theme.colors.secondary};
  padding: 4rem 1rem;
`;

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

/* --- LEFT COLUMN (Existing) ------------------------------------------------------ */

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

/* --- RIGHT COLUMN: FORM (Existing) ---------------------------------------------- */

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const Row = styled.div`
  display: grid;
  column-gap: 1rem;
  row-gap: 0.75rem;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// NEW: Define an interface for shared input props, including the custom $error prop
interface FieldProps {
  $error?: boolean;
}

/* shared field mix-in */
const field = css<FieldProps>` // Use FieldProps here
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

export const Input = styled.input<FieldProps>` // Apply FieldProps
  ${field}
`;

export const TextArea = styled.textarea<FieldProps>` // Apply FieldProps
  ${field}
  resize: vertical;
`;

/* --- SUBMIT BUTTON (Existing - updated for loading) ------------------------------------ */

// Define the loading animation
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

  // Loading Spinner styles
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

/* --- Reusable Pop-up & Modal Styles (Existing) ---------------------------------------- */

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

export const PopupBox = styled.div` /* Used for Contact success & Application success */
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  height: 300px;
  max-height: 90vh;
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


/* --- Application Modal Specific Styles (Existing) ---------------------------------------- */

export const ApplicationModalContent = styled.div`
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  width: 600px; /* Wider for application form */
  max-width: 95%; /* Max width for responsiveness */
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto; /* Enable scrolling if content exceeds height */
  max-height: 90vh; /* Prevent modal from exceeding viewport height */

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const ModalTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(1.5rem, 3vw, 2rem);
  text-align: center;
  margin-bottom: 1rem;
`;

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Reusing the 'field' css mixin for ModalInput and ModalTextArea
export const ModalInput = styled.input<FieldProps>` // Applied FieldProps here
  ${field}
`;

export const ModalTextArea = styled.textarea<FieldProps>` // Applied FieldProps here
  ${field}
  resize: vertical;
`;

export const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.textDark};
    font-size: 1rem;
    font-weight: 600;
  }

  input[type="file"] {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    background: #ffffff;
    color: ${({ theme }) => theme.colors.textDark};
    cursor: pointer;

    &::file-selector-button {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.textLight};
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-right: 1rem;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: ${({ theme }) => theme.colors.accent};
      }
    }
  }
`;

export const ModalButton = styled(Button)`
  align-self: center;
  margin-top: 1.5rem;
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
`;

export const ModalStatusMessage = styled.p<{ $isSuccess: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  text-align: center;
  margin-top: 1rem;
  color: ${({ $isSuccess }) => ($isSuccess ? 'green' : 'red')};
  font-weight: 500;
`;