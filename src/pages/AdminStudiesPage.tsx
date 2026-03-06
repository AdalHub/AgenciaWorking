import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNewStudyModal from '../components/Admin/AdminNewStudyModal';

const STATUS_LABELS: Record<string, string> = {
  pendiente_captura: 'Pendiente captura',
  en_proceso: 'En proceso',
  en_validacion: 'En validación',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pendiente_captura: { bg: '#f3f4f6', text: '#374151' },
  en_proceso: { bg: '#dbeafe', text: '#1d4ed8' },
  en_validacion: { bg: '#fef3c7', text: '#b45309' },
  concluido: { bg: '#d1fae5', text: '#065f46' },
  cancelado: { bg: '#fee2e2', text: '#991b1b' },
};

type Study = {
  id: number;
  company_name: string;
  study_type: string;
  status: string;
  created_at: string;
  deletion_scheduled_at: string | null;
  total_invitations?: number;
  completed_count?: number;
  concluded_at?: string | null;
};

export default function AdminStudiesPage() {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'all' | 'ongoing'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Filters (Todos tab)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');

  // PDF drawer
  const [drawerStudyId, setDrawerStudyId] = useState<number | null>(null);
  const [drawerStudyName, setDrawerStudyName] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const loadStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/studies.php?action=list_studies', { credentials: 'include' });
      const data = await res.json();
      if (data.studies) setStudies(data.studies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudies();
  }, []);

  useEffect(() => {
    if (drawerStudyId) {
      setDrawerLoading(true);
      fetch(`/api/studies.php?action=list_invitations&study_id=${drawerStudyId}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (d.invitations) setInvitations(d.invitations);
        })
        .finally(() => setDrawerLoading(false));
    }
  }, [drawerStudyId]);

  const filteredAll = studies.filter((s) => {
    if (search && !s.company_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (typeFilter !== 'all' && s.study_type !== typeFilter) return false;
    if (createdFrom && s.created_at < createdFrom) return false;
    if (createdTo && s.created_at > createdTo + 'T23:59:59') return false;
    return true;
  });

  const ongoingStudies = studies.filter((s) => (Number(s.completed_count) || 0) > 0);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCreatedFrom('');
    setCreatedTo('');
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: active ? '2px solid #111' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
        <div style={{ maxWidth: 1200, width: '100%', boxSizing: 'border-box' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Estudios Socioeconómicos</h1>
            <button onClick={() => setShowNewModal(true)} style={{ padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Nuevo Estudio</button>
          </div>

          {toast && <div style={{ marginBottom: 16, padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8 }}>{toast}</div>}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button style={tabStyle(mainTab === 'all')} onClick={() => setMainTab('all')}>Todos los estudios</button>
            <button style={tabStyle(mainTab === 'ongoing')} onClick={() => setMainTab('ongoing')}>Estudios en curso</button>
          </div>

          {mainTab === 'all' && (
            <>
              {/* Filter bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <input type="text" placeholder="Buscar por empresa" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, minWidth: 180 }} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <option value="all">Todos los estados</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                  <option value="all">All</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
                <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }} />
                <button type="button" onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>Limpiar filtros</button>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Empresa</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Tipo</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Candidatos</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Fecha de creación</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Eliminación programada</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>Cargando…</td></tr>
                    ) : (
                      filteredAll.map((s) => {
                        const colors = STATUS_COLORS[s.status] || { bg: '#f3f4f6', text: '#374151' };
                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 12 }}>{s.id}</td>
                            <td style={{ padding: 12 }}>{s.company_name}</td>
                            <td style={{ padding: 12 }}>
                              <span style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid', ...(s.study_type === 'private' ? { borderColor: '#3b82f6', color: '#1d4ed8', background: 'transparent' } : { borderColor: '#16a34a', color: '#16a34a', background: 'transparent' } ) }}>{s.study_type === 'private' ? 'Private' : 'Public'}</span>
                            </td>
                            <td style={{ padding: 12 }}>
                              <span style={{ padding: '4px 8px', borderRadius: 6, background: colors.bg, color: colors.text }}>{STATUS_LABELS[s.status] || s.status}</span>
                            </td>
                            <td style={{ padding: 12 }}>{Number(s.completed_count) ?? 0} / {Number(s.total_invitations) ?? 0} completados</td>
                            <td style={{ padding: 12 }}>{formatDate(s.created_at)}</td>
                            <td style={{ padding: 12 }}>{formatDate(s.deletion_scheduled_at)}</td>
                            <td style={{ padding: 12 }}>
                              <button onClick={() => navigate(`/admin/studies/${s.id}`)} style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', marginRight: 8 }}>Ver</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {mainTab === 'ongoing' && (
            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Empresa</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Tipo</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Completados / Total</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Fecha de conclusión</th>
                    <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e5e7eb' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>Cargando…</td></tr>
                  ) : (
                    ongoingStudies.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: 12 }}>{s.company_name}</td>
                        <td style={{ padding: 12 }}>{s.study_type === 'private' ? 'Private' : 'Public'}</td>
                        <td style={{ padding: 12 }}>{Number(s.completed_count) ?? 0} / {Number(s.total_invitations) ?? 0}</td>
                        <td style={{ padding: 12 }}>{s.concluded_at ? formatDate(s.concluded_at) : 'En progreso'}</td>
                        <td style={{ padding: 12 }}>
                          <button onClick={() => { setDrawerStudyId(s.id); setDrawerStudyName(s.company_name); }} style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Ver PDFs</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* PDF drawer */}
      {drawerStudyId !== null && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: 'min(400px, 100vw)', height: '100%', background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', zIndex: 150, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>PDFs — {drawerStudyName}</h3>
            <button onClick={() => { setDrawerStudyId(null); setDrawerStudyName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
          <button onClick={() => setToast('Función disponible próximamente')} style={{ marginBottom: 16, padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Descargar todos (ZIP)</button>
          {drawerLoading ? <p>Cargando…</p> : (
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: 8 }}>Candidato</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Fecha completado</th>
                  <th style={{ textAlign: 'left', padding: 8 }}>Descargar</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{inv.candidate_name || inv.candidate_email || '—'}</td>
                    <td style={{ padding: 8 }}>{inv.status}</td>
                    <td style={{ padding: 8 }}>{inv.completed_at ? formatDate(inv.completed_at) : '—'}</td>
                    <td style={{ padding: 8 }}>
                      {inv.status === 'completed' ? (
                        <a href={`/api/studies.php?action=download_pdf&invitation_id=${inv.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Descargar PDF</a>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>PDF no generado aún</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showNewModal && (
        <AdminNewStudyModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => { loadStudies(); setToast('Estudio creado correctamente'); }}
        />
      )}
    </>
  );
}