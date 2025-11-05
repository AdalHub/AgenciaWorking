// src/components/Admin/BookedTable.tsx
import React, { useEffect, useState } from 'react';

type BookingRow = {
  id: number;
  start_utc: string;
  end_utc: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  note?: string;
};

interface Props {
  serviceId: number;
}

export default function BookedTable({ serviceId }: Props) {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bookings.php?action=list_for_admin&service_id=${serviceId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [serviceId]);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: 0 }}>Booked slots</h4>
      </div>
      {loading ? (
        <div style={{ padding: 12 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ padding: 12 }}>No bookings yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={th}>Start</th>
              <th style={th}>End</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.start_utc}</td>
                <td style={td}>{r.end_utc}</td>
                <td style={td}>{r.customer_name || r.customer_email || ''}</td>
                <td style={td}>{r.customer_email}</td>
                <td style={td}>{r.customer_phone}</td>
                <td style={td}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  fontSize: 13,
  borderBottom: '1px solid #e5e7eb',
};

const td: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: 13,
  borderBottom: '1px solid #e5e7eb',
};
