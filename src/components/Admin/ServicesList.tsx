// src/components/Admin/ServicesList.tsx


export type AdminService = {
  id: number;
  title: string;
  description?: string;
  hourly_rate: number;
  hourly_rate_cents?: number;
  is_active?: number;
};

interface Props {
  services: AdminService[];
  loading?: boolean;
  selectedId: number | null;
  onSelect: (svc: AdminService) => void;
  onEdit: (svc: AdminService) => void;
  onDelete: (svc: AdminService) => void;
}

export default function ServicesList({
  services,
  loading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  if (loading) return <div>Loading services…</div>;
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
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
            gap: 8,
            padding: '10px 12px',
            background: selectedId === svc.id ? '#eff6ff' : '#fff',
            borderBottom: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{svc.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              ${svc.hourly_rate.toFixed(2)}/hr {svc.is_active === 0 ? '(inactive)' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(svc); }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(svc); }}
              style={{ background: '#fee2e2' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
