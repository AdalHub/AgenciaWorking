import styled from 'styled-components';

/* sidebar container */
export const Panel = styled.aside<{ open: boolean }>`
  width: 260px;
  flex: 0 0 260px;
  padding-right: 2rem;
  border-right: 1px solid #e5e7eb;

  @media (max-width: 920px) {
    position: fixed;
    top: 64px;            /* below header */
    left: 0;
    height: calc(100vh - 64px);
    background: #ffffff;
    padding: 2rem 1.5rem 3rem;
    box-shadow: 2px 0 16px rgba(0, 0, 0, 0.12);
    transform: ${({ open }) =>
      open ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 280ms ease;
    z-index: 9980;
  }
`;

export const Group = styled.div`
  & + & {
    margin-top: 2.25rem;
  }
`;

export const GroupLabel = styled.h5`
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: ${({ theme }) => theme.colors.textDark};
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block: 0.35rem;
  font-size: 0.93rem;
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const Chip = styled.button<{ active: boolean }>`
  border: 1px solid #c7ccd6;
  border-radius: 20px;
  padding: 0.3rem 0.9rem;
  font-size: 0.87rem;
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : '#fff'};
  color: ${({ active, theme }) =>
    active ? '#fff' : theme.colors.textDark};
  cursor: pointer;
  transition: background 0.2s;
`;

export const SearchInputWrap = styled.div`
  position: relative;
  margin-bottom: 0.75rem;
  input {
    width: 100%;
    padding: 0.55rem 2.5rem 0.55rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #c7ccd6;
    border-radius: 6px;
  }
  svg {
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #6c7480;
  }
`;

export const ButtonsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

export const ApplyBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 0.55rem 1.6rem;
  border-radius: 22px;
  cursor: pointer;
`;

export const ClearBtn = styled.button`
  background: #fff;
  border: 1px solid #c7ccd6;
  color: ${({ theme }) => theme.colors.textDark};
  padding: 0.55rem 1.3rem;
  border-radius: 22px;
  cursor: pointer;
`;
