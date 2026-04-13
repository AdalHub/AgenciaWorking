import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

type User = { id: number; email: string; account_type?: string; is_profile_complete?: boolean } | null;
type Study = {
  id: number;
  company_name: string;
  status: string;
  concluded_at?: string | null;
  total_invitations?: number;
  completed_count?: number;
};

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

function formatDate(d?: string | null): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export default function EmpresaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);
  const [tab, setTab] = useState<'ongoing' | 'previous'>('ongoing');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user_auth.php?action=me', { credentials: 'include' });
        const data = await res.json();
        if (!data.user) {
          navigate('/');
          return;
        }
        if (data.user.account_type !== 'company') {
          navigate('/');
          return;
        }
        setUser(data.user);
        const studiesRes = await fetch('/api/studies.php?action=list_studies', { credentials: 'include' });
        const studiesData = await studiesRes.json();
        setStudies(Array.isArray(studiesData.studies) ? studiesData.studies : []);
      } catch (err) {
        setError('No fue posible cargar tus estudios.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const ongoingStudies = useMemo(() => studies.filter((s) => s.status !== 'concluido'), [studies]);
  const previousStudies = useMemo(() => studies.filter((s) => s.status === 'concluido'), [studies]);
  const visibleStudies = tab === 'ongoing' ? ongoingStudies : previousStudies;

  const handleDownloadFinalPdf = async (studyId: number) => {
    setDownloadLoadingId(studyId);
    setToast(null);
    try {
      const statusRes = await fetch(`/api/studies.php?action=pdf_status_study&study_id=${studyId}`, { credentials: 'include' });
      const statusData = await statusRes.json().catch(() => ({}));
      if (!statusData?.available) {
        setToast('El PDF final aún no está disponible para este estudio.');
        return;
      }

      const pdfRes = await fetch(`/api/studies.php?action=download_study_final_pdf&study_id=${studyId}&_ts=${Date.now()}`, { credentials: 'include', cache: 'no-store' });
      if (!pdfRes.ok) {
        const ct = pdfRes.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const e = await pdfRes.json().catch(() => ({}));
          setToast(e.error || 'No se pudo descargar el PDF.');
        } else {
          setToast('No se pudo descargar el PDF.');
        }
        return;
      }

      const blob = await pdfRes.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `estudio-${studyId}-final-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setToast('Error de red al descargar el PDF.');
    } finally {
      setDownloadLoadingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, textAlign: 'center' }}><p>Cargando…</p></main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          {user.is_profile_complete === false && (
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                background: '#fef9c3',
                border: '1px solid #facc15',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>Completa el perfil de tu empresa para acceder a todas las funciones.</span>
              <Link
                to="/empresa/onboarding"
                style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}
              >
                Completar ahora
              </Link>
            </div>
          )}

          <h1 style={{ marginBottom: 20, fontSize: '1.75rem' }}>Company Dashboard</h1>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <aside style={{ width: 260, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              <button
                type="button"
                onClick={() => setTab('ongoing')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: tab === 'ongoing' ? '#111827' : '#fff',
                  color: tab === 'ongoing' ? '#fff' : '#111827',
                  marginBottom: 6,
                }}
              >
                View ongoing studies
              </button>
              <button
                type="button"
                onClick={() => setTab('previous')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: tab === 'previous' ? '#111827' : '#fff',
                  color: tab === 'previous' ? '#fff' : '#111827',
                }}
              >
                View previous studies
              </button>
            </aside>

            <section style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
                {tab === 'ongoing' ? 'Ongoing studies' : 'Previous studies'}
              </h2>
              {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
              {visibleStudies.length === 0 ? (
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {tab === 'ongoing' ? 'No tienes estudios en curso.' : 'No tienes estudios concluidos.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: 10, fontSize: 13, color: '#4b5563' }}>Estudio</th>
                        <th style={{ textAlign: 'left', padding: 10, fontSize: 13, color: '#4b5563' }}>Progreso</th>
                        <th style={{ textAlign: 'left', padding: 10, fontSize: 13, color: '#4b5563' }}>Estado</th>
                        <th style={{ textAlign: 'left', padding: 10, fontSize: 13, color: '#4b5563' }}>Concluido</th>
                        <th style={{ textAlign: 'left', padding: 10, fontSize: 13, color: '#4b5563' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudies.map((study) => {
                        const statusStyle = STATUS_COLORS[study.status] || { bg: '#f3f4f6', text: '#374151' };
                        const total = Number(study.total_invitations || 0);
                        const completed = Number(study.completed_count || 0);
                        return (
                          <tr key={study.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: 10 }}>
                              <div style={{ fontWeight: 600 }}>{study.company_name || `Estudio #${study.id}`}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {study.id}</div>
                            </td>
                            <td style={{ padding: 10 }}>{completed} / {total}</td>
                            <td style={{ padding: 10 }}>
                              <span style={{ padding: '4px 8px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text, fontSize: 12 }}>
                                {STATUS_LABELS[study.status] || study.status}
                              </span>
                            </td>
                            <td style={{ padding: 10 }}>{formatDate(study.concluded_at)}</td>
                            <td style={{ padding: 10 }}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/empresa/studies/${study.id}`)}
                                  style={{
                                    background: '#111827',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Ver candidatos
                                </button>
                                {study.status === 'concluido' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFinalPdf(study.id)}
                                    disabled={downloadLoadingId === study.id}
                                    style={{
                                      background: '#1d4ed8',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 6,
                                      padding: '8px 12px',
                                      cursor: downloadLoadingId === study.id ? 'not-allowed' : 'pointer',
                                    }}
                                  >
                                    {downloadLoadingId === study.id ? 'Descargando...' : 'Descargar PDF'}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
        {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>{toast}</div>}
      </main>
      <Footer />
    </>
  );
}
