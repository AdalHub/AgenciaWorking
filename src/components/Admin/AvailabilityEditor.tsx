// src/components/Admin/AvailabilityEditor.tsx
import React, { useEffect, useState } from 'react';
import type { AdminService } from './ServicesList';

type AvailabilityBlock = {
  id?: number;
  service_id: number;
  start_utc: string;
  end_utc: string;
};

interface Props {
  service: AdminService;
}

export default function AvailabilityEditor({ service }: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      // try to get raw (with ids); if it fails, fall back
      let res = await fetch(`/api/availability.php?action=list&service_id=${service.id}&raw=1`, {
        credentials: 'include',
      });
      if (!res.ok) {
        // fallback to public list
        res = await fetch(`/api/availability.php?action=list&service_id=${service.id}`, {
          credentials: 'include',
        });
      }
      const data = await res.json();
      // data may not have id; that's ok for display
      setBlocks(data);
    } catch (err) {
      console.error('Failed to load availability', err);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [service.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) {
      alert('Start and end required');
      return;
    }
    try {
      await fetch('/api/availability.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: service.id,
          start_utc: start,
          end_utc: end,
        }),
      });
      setStart('');
      setEnd('');
      loadBlocks();
    } catch (err) {
      console.error('Failed to add availability', err);
      alert('Failed to add availability');
    }
  };

  const handleRemove = async (id?: number) => {
    if (!id) {
      alert('This block has no id from server; update PHP to return id if you want to delete it.');
      return;
    }
    if (!window.confirm('Remove this availability block?')) return;
    try {
      await fetch('/api/availability.php?action=remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      loadBlocks();
    } catch (err) {
      console.error('Failed to remove availability', err);
    }
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
      <h4 style={{ marginTop: 0 }}>Availability</h4>
      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}
      >
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          style={{
            padding: '0.75rem 1rem',
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: 8,
            fontSize: '1rem',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#063591';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          style={{
            padding: '0.75rem 1rem',
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: 8,
            fontSize: '1rem',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#063591';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <div>Loading availability…</div>
      ) : blocks.length === 0 ? (
        <div>No availability yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {blocks.map((b, idx) => (
            <li
              key={b.id ?? idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb',
                padding: '6px 0',
              }}
            >
              <span>
                {b.start_utc} → {b.end_utc}
              </span>
              <button onClick={() => handleRemove(b.id)} style={{ background: '#fee2e2' }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
