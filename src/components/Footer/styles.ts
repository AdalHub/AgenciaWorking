import styled from 'styled-components';
import { Section } from '../container/styles';

export const Wrapper = styled(Section)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
  position: relative;

  /* add top padding so the floating card doesn't overlap content above */
  padding-top: 4rem;
`;

export const Note = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const ContactCard = styled.div`
  position: absolute;
  top: -40px;                /* lift the card so it "floats" */
  left: 50%;
  transform: translateX(-50%);
  width: clamp(240px, 50vw, 360px);

  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textDark};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 0.5rem 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.9rem;
  }
`;
