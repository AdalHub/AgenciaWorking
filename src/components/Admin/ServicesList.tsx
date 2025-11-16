// src/components/Admin/ServicesList.tsx
import { useEffect, useState } from 'react';

export type AdminService = {
  id: number;
  title: string;
  description?: string;
  hourly_rate: number;
  hourly_rate_cents?: number;
  is_active?: number;
  notify_emails?: string;
};

interface Props {
  services: AdminService[];
  loading?: boolean;
  selectedId: number | null;
  onSelect: (svc: AdminService) => void;
  onEdit: (svc: AdminService) => void;
  onDelete: (svc: AdminService) => void;
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

export default function ServicesList({
  services,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const isMobile = useIsMobile();
  
  if (loading) return <div>Loading services…</div>;
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', width: '100%' }}>
      {services.length === 0 && (
        <div style={{ padding: 12 }}>No services yet. Create one.</div>
      )}
      {services.map((svc) => (
        <div
          key={svc.id}
          onClick={() => onSelect(svc)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 8,
            padding: '10px 12px',
            background: selectedId === svc.id ? '#eff6ff' : '#fff',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>{svc.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              ${svc.hourly_rate.toFixed(2)}/hr {svc.is_active === 0 ? '(inactive)' : ''}
            </div>
            <div style={{ fontSize: 11, color: svc.notify_emails ? '#059669' : '#9ca3af', marginTop: 4, wordBreak: 'break-word' }}>
              📧 Notify: {svc.notify_emails ? svc.notify_emails : '(none)'}
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 4,
            flexShrink: 0,
            flexDirection: isMobile ? 'row' : 'row',
            width: isMobile ? '100%' : 'auto',
            marginTop: isMobile ? 8 : 0,
          }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(svc); }}
              style={{
                padding: isMobile ? '6px 10px' : '6px 12px',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? '1 1 50%' : '0 0 auto',
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(svc); }}
              style={{ 
                background: '#fee2e2',
                padding: isMobile ? '6px 10px' : '6px 12px',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? '1 1 50%' : '0 0 auto',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
