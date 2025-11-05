// src/components/Admin/Services.tsx
import React, { useEffect, useState } from 'react';
import ServicesList from './ServicesList';
import type { AdminService } from './ServicesList';
import ServiceForm from './ServiceForm';
import AvailabilityEditor from './AvailabilityEditor';
import BookedTable from './BookedTable';

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '80px 16px 32px',
  boxSizing: 'border-box',
};

const flexRow: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'flex-start',
};

export default function Services() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [selected, setSelected] = useState<AdminService | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [loading, setLoading] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services.php?action=list', {
        credentials: 'include',
      });
      const data = await res.json();
      // data is array of active services; admin may want to see all
      setServices(data);
      if (!selected && data.length > 0) {
        setSelected(data[0]);
      }
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleCreatedOrUpdated = () => {
    setShowForm(false);
    setEditing(null);
    loadServices();
  };

  return (
    <main style={containerStyle}>
      <h2 style={{ marginBottom: '1rem' }}>Admin – Services</h2>
      <p style={{ marginBottom: '1.5rem', maxWidth: 700 }}>
        Create services, manage availability windows, and view bookings for each service.
      </p>

      <div style={flexRow}>
        {/* LEFT: services list + buttons */}
        <div style={{ flex: '0 0 300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Services</h3>
            <button onClick={() => { setShowForm(true); setEditing(null); }}>
              + New
            </button>
          </div>

          <ServicesList
            services={services}
            loading={loading}
            selectedId={selected?.id ?? null}
            onSelect={(svc) => setSelected(svc)}
            onEdit={(svc) => {
              setEditing(svc);
              setShowForm(true);
            }}
            onDelete={async (svc) => {
              if (!window.confirm(`Delete service "${svc.title}"?`)) return;
              try {
                await fetch('/api/services.php?action=delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ id: svc.id }),
                });
                if (selected?.id === svc.id) setSelected(null);
                loadServices();
              } catch (err) {
                console.error('Delete failed', err);
              }
            }}
          />

          {showForm && (
            <div style={{ marginTop: 16 }}>
              <ServiceForm
                initial={editing ?? undefined}
                onDone={handleCreatedOrUpdated}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          )}
        </div>

        {/* RIGHT: availability + bookings for selected service */}
        <div style={{ flex: 1 }}>
          {selected ? (
            <>
              <h3 style={{ marginBottom: 12 }}>
                {selected.title} – ${selected.hourly_rate.toFixed(2)}/hr
              </h3>
              <AvailabilityEditor service={selected} />
              <div style={{ marginTop: 24 }}>
                <BookedTable serviceId={selected.id} />
              </div>
            </>
          ) : (
            <p>Select a service to manage its availability and bookings.</p>
          )}
        </div>
      </div>
    </main>
  );
}
