import {
  Panel,
  Group,
  GroupLabel,
  CheckboxRow,
  Chips,
  Chip,
  ApplyBtn,
  ClearBtn,
  ButtonsRow,
} from './FilterPanelStyles';
import { useState } from 'react';

export interface FilterState {
  q: string;
  employment?: 'Full-time' | 'Remote';
  teams: ('Support Services' | 'Software')[];
  sort: 'Relevance' | 'Newest';
}

interface Props {
  open: boolean;
  applied: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

export default function FilterPanel({
  open,
  applied,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<FilterState>(applied);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const clear = () =>
    setDraft({ q: '', teams: [], sort: 'Relevance' });

  const toggleTeam = (t: 'Support Services' | 'Software') =>
    setDraft((d) => ({
      ...d,
      teams: d.teams.includes(t)
        ? d.teams.filter((x) => x !== t)
        : [...d.teams, t],
    }));

  return (
    <Panel open={open}>
      {/* SEARCH */}
      <Group>
        <GroupLabel>Teams</GroupLabel>
        <Chips>
          {(['Support Services', 'Software'] as const).map((t) => (
            <Chip
              key={t}
              active={draft.teams.includes(t)}
              onClick={() => toggleTeam(t)}
            >
              {t}
            </Chip>
          ))}
        </Chips>
      </Group>

      {/* EMPLOYMENT TYPE */}
      <Group>
        <GroupLabel>Employment Type</GroupLabel>
        {(['Full-time', 'Remote'] as const).map((et) => (
          <CheckboxRow key={et}>
            <input
              type="radio"
              checked={draft.employment === et}
              onChange={() =>
                setDraft((d) => ({ ...d, employment: et }))
              }
            />
            {et}
          </CheckboxRow>
        ))}
      </Group>

      {/* SORT */}
      <Group>
        <GroupLabel>Sort by</GroupLabel>
        {(['Relevance', 'Newest'] as const).map((s) => (
          <CheckboxRow key={s}>
            <input
              type="radio"
              checked={draft.sort === s}
              onChange={() =>
                setDraft((d) => ({ ...d, sort: s }))
              }
            />
            {s}
          </CheckboxRow>
        ))}
      </Group>

      {/* ACTION BUTTONS */}
      <ButtonsRow>
        <ApplyBtn onClick={handleApply}>Apply Filters</ApplyBtn>
        <ClearBtn onClick={clear}>Clear Filters</ClearBtn>
      </ButtonsRow>
    </Panel>
  );
}
