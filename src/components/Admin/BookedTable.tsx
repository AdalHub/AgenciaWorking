// src/components/Admin/BookedTable.tsx
import { useEffect, useState } from 'react';

type BookingRow = {
  id: number;
  start_utc: string;
  end_utc: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  note: string | null;
};

interface Props {
  serviceId: number | null;
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

export default function BookedTable({ serviceId }: Props) {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!serviceId) {
      setRows([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // correct endpoint name + send cookies
        const res = await fetch(
          `/api/bookings.php?action=list_for_admin&service_id=${serviceId}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load bookings');
          setRows([]);
          return;
        }

        // defensive: make sure it's an array
        if (Array.isArray(data)) {
          setRows(data);
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error(err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [serviceId]);

  if (!serviceId) {
    return <div style={{ marginTop: '1rem' }}>Select a service to see bookings.</div>;
  }

  if (loading) {
    return <div style={{ marginTop: '1rem' }}>Loading bookings…</div>;
  }

  if (error) {
    return (
      <div style={{ marginTop: '1rem', color: 'red' }}>
        {error === 'Unauthorized'
          ? 'You must be logged in as admin to see bookings.'
          : error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem', width: '100%', overflowX: 'auto' }}>
      <h3>Booked slots</h3>
      {rows.length === 0 ? (
        <div>No bookings yet.</div>
      ) : isMobile ? (
        // Mobile: Card layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <div
              key={r.id}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
                  {r.start_utc} → {r.end_utc}
                </div>
                {r.customer_name && (
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>Name:</strong> {r.customer_name}
                  </div>
                )}
                {r.customer_email && (
                  <div style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                    <strong>Email:</strong> {r.customer_email}
                  </div>
                )}
                {r.customer_phone && (
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>Phone:</strong> {r.customer_phone}
                  </div>
                )}
                {r.note && (
                  <div style={{ fontSize: '0.875rem', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <strong>Note:</strong> {r.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop: Table layout
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>Start</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>End</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e5e7eb' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8 }}>{r.start_utc}</td>
                  <td style={{ padding: 8 }}>{r.end_utc}</td>
                  <td style={{ padding: 8 }}>{r.customer_name || '—'}</td>
                  <td style={{ padding: 8, wordBreak: 'break-word' }}>{r.customer_email || '—'}</td>
                  <td style={{ padding: 8 }}>{r.customer_phone || '—'}</td>
                  <td style={{ padding: 8, maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {r.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
