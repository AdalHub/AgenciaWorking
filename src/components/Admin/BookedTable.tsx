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

export default function BookedTable({ serviceId }: Props) {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      setRows([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ correct endpoint name + send cookies
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
    <div style={{ marginTop: '1rem' }}>
      <h3>Booked slots</h3>
      {rows.length === 0 ? (
        <div>No bookings yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 6 }}>Start</th>
              <th style={{ textAlign: 'left', padding: 6 }}>End</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Phone</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 6 }}>{r.start_utc}</td>
                <td style={{ padding: 6 }}>{r.end_utc}</td>
                <td style={{ padding: 6 }}>{r.customer_name || '—'}</td>
                <td style={{ padding: 6 }}>{r.customer_email || '—'}</td>
                <td style={{ padding: 6 }}>{r.customer_phone || '—'}</td>
                <td style={{ padding: 6, maxWidth: 200, whiteSpace: 'pre-wrap' }}>
                  {r.note || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
