// src/components/Public/ScheduleList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type PublicService = {
  id: number;
  title: string;
  description?: string;
  hourly_rate: number;
};

export default function ScheduleList() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services.php?action=list');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Schedule a service</h1>
      <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
        Choose a service to see available time slots.
      </p>

      {loading ? (
        <div>Loading…</div>
      ) : services.length === 0 ? (
        <div>No services available right now.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '1rem',
                background: '#fff',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{svc.title}</h3>
              <p style={{ marginBottom: '0.5rem' }}>
                {svc.description || 'No description yet.'}
              </p>
              <p style={{ fontWeight: 500 }}>
                ${svc.hourly_rate.toFixed(2)}/hr
              </p>
              <Link to={`/schedule/${svc.id}`}>See availability →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
