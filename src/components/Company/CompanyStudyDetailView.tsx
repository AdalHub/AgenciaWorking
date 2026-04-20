import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api';
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

type Study = { id: number; company_name: string; status: string; format_version?: string; show_verdict_to_company?: number };
type Invitation = { id: number; candidate_name?: string; candidate_email?: string; candidate_phone?: string; status: string; completed_at?: string };

type ClientReport = {
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  status?: string;
  resumen_actualizacion?: string;
  resultado_actualizacion?: string | null;
  observaciones_relevantes?: string;
  fecha_cierre?: string;
  analista?: string;
  verificacion_domiciliaria?: { fecha_visita?: string; tipo?: string; observaciones?: string } | null;
  candidate_sections?: Array<{
    title: string;
    blocks: Array<{
      title: string;
      entries?: Array<{ label: string; value: string }>;
      table?: { headers: string[]; rows: string[][] };
    }>;
  }>;
  supporting_documents?: Array<{ label: string; file_path: string; name: string }>;
  semaforo?: { color: string; label: string } | null;
  show_semaforo?: boolean;
};

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(d);
  }
}

type Props = { studyId: number; token?: string | null; backLink?: React.ReactNode; isMagicLink?: boolean };

export default function CompanyStudyDetailView({ studyId, token, backLink }: Props) {
  const navigate = useNavigate();
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  const creds = { credentials: 'include' as RequestCredentials };
  const companyDocumentDownloadUrl = (filePath: string): string => {
    const raw = String(filePath || '').trim();
    if (!raw || /^https?:\/\//i.test(raw)) return '';
    const normalized = raw.startsWith('uploads/') ? raw : `uploads/${raw.replace(/^\/+/, '')}`;
    return `${API}/studies.php?action=download_document&file_path=${encodeURIComponent(normalized)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  };

  const [study, setStudy] = useState<Study | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [finalPdfAvailable, setFinalPdfAvailable] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/studies.php?action=get_study&id=${studyId}${tokenParam}`, creds).then((r) => r.json()),
      fetch(`${API}/studies.php?action=list_invitations&study_id=${studyId}${tokenParam}`, creds).then((r) => r.json()),
    ])
      .then(([studyRes, invRes]) => {
        if (studyRes.error) {
          if (!token) navigate('/empresa/dashboard');
          return;
        }
        setStudy(studyRes);
        setInvitations(invRes.invitations || []);
      })
      .finally(() => setLoading(false));
  }, [studyId, tokenParam, token, navigate]);

  useEffect(() => {
    if (!studyId || !study || study.status !== 'concluido') {
      setFinalPdfAvailable(false);
      return;
    }
    fetch(`${API}/studies.php?action=pdf_status_study&study_id=${studyId}${tokenParam}`, creds)
      .then((r) => r.json())
      .then((data) => setFinalPdfAvailable(!!(data && data.available)))
      .catch(() => setFinalPdfAvailable(false));
  }, [studyId, study?.status, tokenParam]);

  useEffect(() => {
    if (!selectedInvId) {
      setReport(null);
      return;
    }
    setReportLoading(true);
    fetch(`${API}/studies.php?action=get_company_client_report&invitation_id=${selectedInvId}${tokenParam}`, creds)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setReport(null);
        else setReport(data);
      })
      .catch(() => setReport(null))
      .finally(() => setReportLoading(false));
  }, [selectedInvId, tokenParam]);

  const selectedInv = invitations.find((i) => i.id === selectedInvId);
  const completedCount = invitations.filter((i) => i.status === 'completed').length;
  const totalCount = invitations.length;
  const statusStyle = study ? STATUS_COLORS[study.status] || { bg: '#f3f4f6', text: '#374151' } : { bg: '#f3f4f6', text: '#374151' };

  const handleDownloadInformeCandidato = () => {
    if (!selectedInvId || selectedInv?.status !== 'completed') return;
    const url = `${API}/studies.php?action=download_pdf&invitation_id=${selectedInvId}&_ts=${Date.now()}${token ? '&token=' + encodeURIComponent(token) : ''}`;
    fetch(url, { ...creds, cache: 'no-store' }).then((r) => {
      if (!r.ok) {
        r.json().then((d: { error?: string }) => setToast(d.error || 'No disponible')).catch(() => setToast('No disponible'));
        return;
      }
      r.blob().then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `informe-cliente-${selectedInvId}-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    });
  };

  const handleDownloadInformeEstudio = () => {
    if (!studyId) return;
    const completedInvitations = invitations.filter((inv) => inv.status === 'completed');
    if (completedInvitations.length === 0) {
      setToast('No hay colaboradores completados para descargar.');
      return;
    }
    setToast(`Descargando ${completedInvitations.length} PDF${completedInvitations.length === 1 ? '' : 's'} por colaborador.`);
    completedInvitations.forEach((inv, idx) => {
      window.setTimeout(() => {
        const a = document.createElement('a');
        a.href = `${API}/studies.php?action=download_pdf&invitation_id=${inv.id}&_ts=${Date.now()}-${idx}${token ? '&token=' + encodeURIComponent(token) : ''}`;
        a.download = `informe-cliente-${inv.id}-${Date.now()}-${idx}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
  };

  const renderReportBlock = (block: { title: string; entries?: Array<{ label: string; value: string }>; table?: { headers: string[]; rows: string[][] } }, idx: number) => (
    <div key={`${block.title}-${idx}`} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: '#f8fafc' }}>
      <h4 style={{ margin: '0 0 10px', fontSize: 15, color: '#334155' }}>{block.title}</h4>
      {block.entries && block.entries.length > 0 ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {block.entries.map((entry, entryIdx) => (
            <div key={`${entry.label}-${entryIdx}`} style={{ fontSize: 14, color: '#334155' }}>
              <strong>{entry.label}:</strong> {entry.value || '—'}
            </div>
          ))}
        </div>
      ) : null}
      {block.table ? (
        <div style={{ overflowX: 'auto', marginTop: block.entries && block.entries.length > 0 ? 12 : 0 }}>
          <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {block.table.headers.map((header) => (
                  <th key={header} style={{ textAlign: 'left', padding: '8px 10px', background: '#e2e8f0', color: '#0f172a', fontSize: 12 }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={`${rowIdx}-${cellIdx}`} style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 13, color: '#334155', verticalAlign: 'top' }}>
                      {cell || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );

  if (loading || !study) {
    return (
      <main style={{ minHeight: '60vh', padding: 24, textAlign: 'center' }}>
        <p>Cargando…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '65vh', paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {backLink != null && (
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>{backLink}</div>
        )}
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: '0 0 4px' }}>
            {study.company_name}
            {study.format_version ? ` · ${study.format_version}` : ''}
          </h2>
          <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontSize: 12 }}>
            {STATUS_LABELS[study.status]}
          </span>
          {study.status === 'concluido' &&
            (finalPdfAvailable ? (
              <button
                type="button"
                onClick={handleDownloadInformeEstudio}
                style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >
                Descargar informe final para cliente (todo el estudio)
              </button>
            ) : (
              <span style={{ padding: '8px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 13 }}>
                Informe masivo disponible al cerrar el estudio con colaboradores completados
              </span>
            ))}
        </div>

        <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1e3a5f', border: '1px solid #93c5fd' }}>
          <strong>Portal empresa:</strong> aquí se muestra el <strong>informe final para el cliente</strong> junto con la información del candidato registrada en el estudio, en modo solo lectura.
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: '30%', flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>
              {completedCount} de {totalCount} colaboradores completados
            </p>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvId(inv.id)}
                  style={{
                    padding: 12,
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    background: selectedInvId === inv.id ? '#eff6ff' : undefined,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{inv.candidate_name?.trim() || inv.candidate_email || 'Anónimo'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: inv.status === 'completed' ? '#d1fae5' : inv.status === 'in_progress' ? '#dbeafe' : '#f3f4f6',
                      }}
                    >
                      {inv.status}
                    </span>
                    {inv.completed_at && <span style={{ marginLeft: 8 }}>{formatDate(inv.completed_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            {!selectedInv ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Selecciona un colaborador para ver el informe para cliente</p>
            ) : reportLoading ? (
              <p style={{ color: '#6b7280' }}>Cargando informe…</p>
            ) : !report ? (
              <p style={{ color: '#9ca3af' }}>No se pudo cargar el informe.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
                  <div>
                    <strong>Nombre:</strong> {report.candidate_name?.trim() || '—'}
                  </div>
                  <div>
                    <strong>Correo:</strong> {report.candidate_email || '—'}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {report.candidate_phone || '—'}
                  </div>
                  {selectedInv.status === 'completed' && (
                    <button
                      onClick={handleDownloadInformeCandidato}
                      style={{ marginLeft: 'auto', padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}
                    >
                      PDF informe cliente (este colaborador)
                    </button>
                  )}
                </div>

                <section style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>1. Resumen de actualización</h3>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.55 }}>
                    {report.resumen_actualizacion?.trim() || '—'}
                  </p>
                </section>

                <section style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>2. Resultado de la actualización</h3>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{report.resultado_actualizacion || '—'}</p>
                  {report.observaciones_relevantes?.trim() ? (
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: '#475569' }}>
                      <em>Observaciones relevantes:</em> {report.observaciones_relevantes}
                    </p>
                  ) : null}
                  {(report.fecha_cierre || report.analista) && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
                      {report.fecha_cierre ? <>Cierre: {report.fecha_cierre} · </> : null}
                      {report.analista ? <>Analista: {report.analista}</> : null}
                    </p>
                  )}
                </section>

                <section style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>3. Verificación domiciliaria</h3>
                  {report.verificacion_domiciliaria ? (
                    <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
                      <div>
                        <strong>Fecha de visita:</strong> {report.verificacion_domiciliaria.fecha_visita || '—'}
                      </div>
                      <div>
                        <strong>Tipo:</strong> {report.verificacion_domiciliaria.tipo || '—'}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <strong>Observaciones:</strong> {report.verificacion_domiciliaria.observaciones || '—'}
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#64748b' }}>Sin registro de visita.</p>
                  )}
                </section>

                {report.candidate_sections && report.candidate_sections.length > 0 ? (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#0f172a' }}>4. Respuestas del estudio</h3>
                    <div style={{ display: 'grid', gap: 14 }}>
                      {report.candidate_sections.map((section) => (
                        <div key={section.title} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
                          <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#0f172a' }}>{section.title}</h3>
                          <div style={{ display: 'grid', gap: 12 }}>
                            {section.blocks.map(renderReportBlock)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>5. Documentacion de respaldo / validacion</h3>
                  {report.supporting_documents && report.supporting_documents.length > 0 ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {report.supporting_documents.map((doc) => {
                        const url = companyDocumentDownloadUrl(doc.file_path);
                        return (
                          <div key={`${doc.file_path}-${doc.label}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                            <div style={{ flex: 1, minWidth: 220 }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.label}</div>
                              <div style={{ fontSize: 13, color: '#64748b' }}>{doc.name}</div>
                            </div>
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: '8px 14px', background: '#0f766e', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}
                              >
                                Descargar
                              </a>
                            ) : (
                              <span style={{ fontSize: 13, color: '#94a3b8' }}>No disponible</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: '#64748b' }}>Sin documentos adicionales registrados.</p>
                  )}
                </section>

                <section>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15, color: '#0f172a' }}>6. Semáforo</h3>
                  {report.show_semaforo && report.semaforo ? (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        background:
                          report.semaforo.color === 'verde' ? '#f0fdf4' : report.semaforo.color === 'amarillo' ? '#fefce8' : '#fef2f2',
                        border: `2px solid ${report.semaforo.color === 'verde' ? '#16a34a' : report.semaforo.color === 'amarillo' ? '#ca8a04' : '#dc2626'}`,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                        {report.semaforo.color === 'verde' ? '🟢' : report.semaforo.color === 'amarillo' ? '🟡' : '🔴'} {report.semaforo.label}
                      </p>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                      El semáforo no está habilitado para este estudio o aún no está asignado. Contacte a HR Capital Working si necesita el criterio cualitativo.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8, zIndex: 50 }}>
          {toast}
          <button type="button" onClick={() => setToast(null)} style={{ marginLeft: 12, color: '#93c5fd' }}>
            Cerrar
          </button>
        </div>
      )}
    </main>
  );
}
