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
} from './ScheduleFilterPanelStyles';
import { useState, useEffect } from 'react';

export interface ScheduleFilterState {
  q: string;
  priceFilter: 'all' | 'lt50' | '50to100' | 'gt100';
  sort: 'low' | 'high';
  category: string;
}

interface Props {
  open: boolean;
  applied: ScheduleFilterState;
  onApply: (f: ScheduleFilterState) => void;
  onClose: () => void;
  availableCategories: string[];
}

export default function ScheduleFilterPanel({
  open,
  applied,
  onApply,
  onClose,
  availableCategories,
}: Props) {
  const [draft, setDraft] = useState<ScheduleFilterState>(applied);

  // Sync draft when panel opens or applied filters change
  useEffect(() => {
    if (open) {
      setDraft(applied);
    }
  }, [open, applied]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const clear = () =>
    setDraft({
      q: '',
      priceFilter: 'all',
      sort: 'low',
      category: 'all',
    });

  const toggleCategory = (cat: string) =>
    setDraft((d) => ({
      ...d,
      category: d.category === cat ? 'all' : cat,
    }));

  return (
    <Panel open={open}>
      {/* CATEGORY FILTER */}
      <Group>
        <GroupLabel>Category</GroupLabel>
        <Chips>
          <Chip
            active={draft.category === 'all'}
            onClick={() => toggleCategory('all')}
          >
            All
          </Chip>
          {availableCategories.map((cat) => (
            <Chip
              key={cat}
              active={draft.category === cat}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </Chips>
      </Group>

      {/* PRICE FILTER */}
      <Group>
        <GroupLabel>Price per hour</GroupLabel>
        <CheckboxRow>
          <input
            type="radio"
            name="price"
            checked={draft.priceFilter === 'all'}
            onChange={() => setDraft((d) => ({ ...d, priceFilter: 'all' }))}
          />
          Any
        </CheckboxRow>
        <CheckboxRow>
          <input
            type="radio"
            name="price"
            checked={draft.priceFilter === 'lt50'}
            onChange={() => setDraft((d) => ({ ...d, priceFilter: 'lt50' }))}
          />
          &lt; $50
        </CheckboxRow>
        <CheckboxRow>
          <input
            type="radio"
            name="price"
            checked={draft.priceFilter === '50to100'}
            onChange={() => setDraft((d) => ({ ...d, priceFilter: '50to100' }))}
          />
          $50 – $100
        </CheckboxRow>
        <CheckboxRow>
          <input
            type="radio"
            name="price"
            checked={draft.priceFilter === 'gt100'}
            onChange={() => setDraft((d) => ({ ...d, priceFilter: 'gt100' }))}
          />
          &gt; $100
        </CheckboxRow>
      </Group>

      {/* SORT */}
      <Group>
        <GroupLabel>Sort by</GroupLabel>
        <CheckboxRow>
          <input
            type="radio"
            name="sort"
            checked={draft.sort === 'low'}
            onChange={() => setDraft((d) => ({ ...d, sort: 'low' }))}
          />
          Lowest price
        </CheckboxRow>
        <CheckboxRow>
          <input
            type="radio"
            name="sort"
            checked={draft.sort === 'high'}
            onChange={() => setDraft((d) => ({ ...d, sort: 'high' }))}
          />
          Highest price
        </CheckboxRow>
      </Group>

      {/* BUTTONS */}
      <ButtonsRow>
        <ApplyBtn onClick={handleApply}>Apply Filters</ApplyBtn>
        <ClearBtn onClick={clear}>Clear Filters</ClearBtn>
      </ButtonsRow>
    </Panel>
  );
}

