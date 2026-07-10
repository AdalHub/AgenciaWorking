import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ServiceWorkspacePanel from '../components/Company/ServiceWorkspacePanel';

export default function AdminClientServiceWorkspacePage() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = useMemo(() => String(params.slug || '').trim(), [params.slug]);
  const companyUserId = useMemo(() => {
    const raw = Number(params.companyUserId || 0);
    return Number.isFinite(raw) ? raw : 0;
  }, [params.companyUserId]);

  return (
    <div style={{ maxWidth: 1200, width: '100%', boxSizing: 'border-box' }}>
      <ServiceWorkspacePanel
        mode="admin"
        slug={slug}
        companyUserId={companyUserId}
        backLabel="Volver al cliente"
        onBack={() => navigate(`/admin/clients/${companyUserId}`)}
      />
    </div>
  );
}
