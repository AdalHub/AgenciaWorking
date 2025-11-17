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

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function AvailabilityEditor({ service }: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

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
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <h4 style={{ marginTop: 0 }}>Availability</h4>
      <form
        onSubmit={handleAdd}
        style={{ 
          display: 'flex', 
          gap: 8, 
          flexWrap: 'wrap', 
          marginBottom: 12,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
          placeholder="Start date & time"
          style={{
            padding: '0.75rem 1rem',
            background: '#f9fafb',
            border: '2px solid #d1d5db',
            borderRadius: 8,
            fontSize: '1rem',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'all 0.2s',
            width: isMobile ? '100%' : 'auto',
            flex: isMobile ? '1 1 100%' : '1 1 auto',
            minWidth: isMobile ? 'auto' : 240,
            cursor: 'pointer',
            pointerEvents: 'auto',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.background = '#ffffff';
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.background = '#f9fafb';
            }
          }}
          onClick={(e) => {
            // Ensure the input receives focus and opens the picker
            e.currentTarget.focus();
            e.currentTarget.showPicker?.();
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#063591';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.background = '#f9fafb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          placeholder="End date & time"
          style={{
            padding: '0.75rem 1rem',
            background: '#f9fafb',
            border: '2px solid #d1d5db',
            borderRadius: 8,
            fontSize: '1rem',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'all 0.2s',
            width: isMobile ? '100%' : 'auto',
            flex: isMobile ? '1 1 100%' : '1 1 auto',
            minWidth: isMobile ? 'auto' : 240,
            cursor: 'pointer',
            pointerEvents: 'auto',
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.background = '#ffffff';
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.background = '#f9fafb';
            }
          }}
          onClick={(e) => {
            // Ensure the input receives focus and opens the picker
            e.currentTarget.focus();
            e.currentTarget.showPicker?.();
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#063591';
            e.target.style.background = '#ffffff';
            e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.background = '#f9fafb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button 
          type="submit"
          style={{
            width: isMobile ? '100%' : 'auto',
            flex: isMobile ? '1 1 100%' : '0 0 auto',
            padding: '0.75rem 1.5rem',
            whiteSpace: 'nowrap',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s, opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#111';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Add
        </button>
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
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span style={{ 
                flex: '1 1 auto',
                wordBreak: 'break-word',
                minWidth: 0,
                fontSize: isMobile ? '0.875rem' : '1rem',
              }}>
                {b.start_utc} → {b.end_utc}
              </span>
              <button 
                onClick={() => handleRemove(b.id)} 
                style={{ 
                  background: '#fee2e2',
                  flexShrink: 0,
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
