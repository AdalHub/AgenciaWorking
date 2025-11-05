// src/components/Admin/ServiceForm.tsx
import React, { useState } from 'react';
import type { AdminService } from './ServicesList';

interface Props {
  initial?: AdminService;
  onDone: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ initial, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [rate, setRate] = useState(initial ? initial.hourly_rate.toString() : '0');
  const [active, setActive] = useState(initial?.is_active !== 0);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const hourly_rate_cents = Math.round(parseFloat(rate || '0') * 100);
      if (isNaN(hourly_rate_cents)) {
        alert('Invalid rate');
        return;
      }

      if (isEdit) {
        await fetch('/api/services.php?action=update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: initial?.id,
            title,
            description,
            hourly_rate_cents,
            active: active ? 1 : 0,
          }),
        });
      } else {
        await fetch('/api/services.php?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            title,
            description,
            hourly_rate_cents,
          }),
        });
      }

      onDone();
    } catch (err) {
      console.error('Failed to save service', err);
      alert('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <h4 style={{ margin: 0 }}>{isEdit ? 'Edit service' : 'New service'}</h4>
      <input
        required
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        step="0.01"
        placeholder="Hourly rate"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
      />
      {isEdit && (
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
