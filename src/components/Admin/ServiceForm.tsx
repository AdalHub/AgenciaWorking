// src/components/Admin/ServiceForm.tsx
import React, { useState } from 'react';
import type { AdminService } from './ServicesList';

interface Props {
  initial?: AdminService; // may also contain initial.notify_emails (comma-separated string)
  onDone: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ initial, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  // AdminService uses dollars in UI (selected.hourly_rate.toFixed(2) elsewhere), keep consistent:
  const [rate, setRate] = useState(initial ? String(initial.hourly_rate ?? 0) : '0');
  // Existing flag name in your UI is is_active:
  const [active, setActive] = useState<boolean>(initial?.is_active !== 0);
  // NEW: comma-separated emails (accepts any string; server stores verbatim)
  const [notifyEmails, setNotifyEmails] = useState<string>(initial?.notify_emails ?? '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsed = parseFloat(rate || '0');
      if (Number.isNaN(parsed) || parsed < 0) {
        alert('Please enter a valid hourly rate (e.g., 49.99).');
        setSaving(false);
        return;
      }
      // API expects cents:
      const hourly_rate_cents = Math.round(parsed * 100);

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
            notify_emails: notifyEmails, // NEW
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
            active: 1,
            notify_emails: notifyEmails, // NEW
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
        rows={4}
      />

      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="Hourly rate (e.g., 49.99)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
      />

      {/* Notify emails (comma-separated) */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Notify Emails (comma-separated)</span>
        <textarea
          placeholder="e.g. admin@agenciaworking.com, ops@agenciaworking.com"
          value={notifyEmails}
          onChange={(e) => setNotifyEmails(e.target.value)}
          rows={2}
        />
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          These emails will receive notifications when a booking is made for this service.
        </span>
      </label>

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
