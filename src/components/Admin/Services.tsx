// src/components/Admin/Services.tsx
import { useEffect, useState } from 'react';
import ServicesList from './ServicesList';
import type { AdminService } from './ServicesList';
import ServiceForm from './ServiceForm';
import AvailabilityEditor from './AvailabilityEditor';
import BookedTable from './BookedTable';

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

// Note: containerStyle will be created dynamically to handle mobile padding

export default function Services() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [selected, setSelected] = useState<AdminService | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services.php?action=list&include_inactive=1', {
        credentials: 'include',
      });
      const data = await res.json();
      // Admin view: include both active and inactive services
      console.log('Loaded services:', data);
      console.log('First service notify_emails:', data[0]?.notify_emails);
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

  const handleCreatedOrUpdated = async () => {
    const editedId = editing?.id; // Save the ID before clearing
    setShowForm(false);
    setEditing(null);
    
    // Reload services and update selected if it was edited
    setLoading(true);
    try {
      const res = await fetch('/api/services.php?action=list&include_inactive=1', {
        credentials: 'include',
      });
      const data = await res.json();
      setServices(data);
      
      // Update selected service if it was the one being edited
      if (editedId) {
        const updated = data.find((s: AdminService) => s.id === editedId);
        if (updated) {
          setSelected(updated);
        } else if (data.length > 0) {
          // If edited service not found, select first one
          setSelected(data[0]);
        }
      } else if (!selected && data.length > 0) {
        setSelected(data[0]);
      }
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: isMobile ? '0 0 32px' : '0 16px 32px',
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.5rem' : '2rem' }}>Admin – Services</h2>
      <p style={{ marginBottom: '1.5rem', maxWidth: 700, fontSize: isMobile ? '0.875rem' : '1rem' }}>
        Create services, manage availability windows, and view bookings for each service.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '1.5rem',
        alignItems: 'flex-start',
      }}>
        {/* LEFT: services list + buttons */}
        <div style={{ 
          flex: isMobile ? '1 1 100%' : '0 0 300px',
          width: isMobile ? '100%' : 'auto',
          minWidth: 0,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <h3 style={{ margin: 0 }}>Services</h3>
            <button 
              onClick={() => { setShowForm(true); setEditing(null); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
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
        </div>

        {/* RIGHT: edit form (when open) + availability + bookings for selected service */}
        <div style={{ 
          flex: isMobile ? '1 1 100%' : 1,
          width: isMobile ? '100%' : 'auto',
          minWidth: 0,
        }}>
          {showForm && (
            <div style={{ marginBottom: 24 }}>
              <ServiceForm
                initial={editing ?? undefined}
                onDone={handleCreatedOrUpdated}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          )}
          
          {selected ? (
            <>
              {!showForm && (
                <h3 style={{ marginBottom: 12, wordBreak: 'break-word' }}>
                  {selected.title} – ${selected.hourly_rate.toFixed(2)}/hr
                </h3>
              )}
              <AvailabilityEditor service={selected} />
              <div style={{ marginTop: 24 }}>
                <BookedTable serviceId={selected.id} />
              </div>
            </>
          ) : !showForm ? (
            <p>Select a service to manage its availability and bookings.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
