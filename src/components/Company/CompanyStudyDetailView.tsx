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
const PREFERRED_SECTIONS = ['Datos Personales', 'Datos de Contacto', 'Domicilio Actual', 'Historial Académico', 'Historial Laboral', 'Situación Económica', 'Referencias Familiares', 'Documentos'];

type Study = { id: number; company_name: string; status: string; format_version?: string; show_verdict_to_company?: number };
type Invitation = { id: number; candidate_name?: string; candidate_email?: string; candidate_phone?: string; status: string; completed_at?: string };
type FormDataBySection = Record<string, Record<string, string>>;

function sectionTabs(formData: FormDataBySection): string[] {
  const keys = Object.keys(formData);
  const ordered = PREFERRED_SECTIONS.filter((s) => keys.some((k) => k.toLowerCase() === s.toLowerCase() || k === s));
  const rest = keys.filter((k) => !PREFERRED_SECTIONS.some((s) => s.toLowerCase() === k.toLowerCase() || s === k));
  return [...ordered, ...rest];
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(d);
  }
}

function completionPct(formData: FormDataBySection): number {
  let total = 0,
    filled = 0;
  for (const section of Object.values(formData)) {
    for (const v of Object.values(section)) {
      total++;
      if (v != null && String(v).trim() !== '') filled++;
    }
  }
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

type Props = { studyId: number; token?: string | null; backLink?: React.ReactNode; isMagicLink?: boolean };

export default function CompanyStudyDetailView({ studyId, token, backLink }: Props) {
  const navigate = useNavigate();
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  const creds = { credentials: 'include' as RequestCredentials };

  const [study, setStudy] = useState<Study | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataBySection>({});
  const [detailTab, setDetailTab] = useState(0);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [pdfAvailable, setPdfAvailable] = useState(false);
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

  // When study is concluded, check if the study-level final PDF is available
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
      setFormData({});
      setVerdict(null);
      setPdfAvailable(false);
      return;
    }
    const invId = selectedInvId;
    Promise.all([
      fetch(`${API}/studies.php?action=get_form_data&invitation_id=${invId}${tokenParam}`, creds).then((r) => r.json()),
      fetch(`${API}/studies.php?action=get_conclusion_verdict&invitation_id=${invId}${tokenParam}`, creds).then((r) => r.json()),
      fetch(`${API}/studies.php?action=pdf_status&invitation_id=${invId}${tokenParam}`, creds).then((r) => r.json()),
    ]).then(([formRes, verdictRes, pdfRes]) => {
      setFormData(typeof formRes === 'object' && formRes !== null && !formRes.error ? formRes : {});
      setVerdict(verdictRes.verdict ?? null);
      setPdfAvailable(!!(pdfRes && pdfRes.available));
    });
  }, [selectedInvId, tokenParam]);

  const selectedInv = invitations.find((i) => i.id === selectedInvId);
  const completedCount = invitations.filter((i) => i.status === 'completed').length;
  const totalCount = invitations.length;
  const pct = completionPct(formData);
  const statusStyle = study ? STATUS_COLORS[study.status] || { bg: '#f3f4f6', text: '#374151' } : { bg: '#f3f4f6', text: '#374151' };

  const handleDownloadPdf = () => {
    if (!selectedInvId) return;
    const url = `${API}/studies.php?action=download_pdf&invitation_id=${selectedInvId}${token ? '&token=' + encodeURIComponent(token) : ''}`;
    fetch(url, creds)
      .then((r) => {
        if (r.status === 404 || !r.ok) {
          const ct = r.headers.get('content-type');
          if (ct && ct.includes('application/json')) return r.json().then((d: { error?: string }) => setToast(d.error || 'El PDF no está disponible aún'));
          setToast('El PDF estará disponible cuando el analista cierre el estudio');
          return;
        }
        return r.blob().then((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `estudio-${selectedInvId}.pdf`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
      });
  };

  const handleDownloadFinalPdf = () => {
    if (!studyId) return;
    const url = `${API}/studies.php?action=download_study_final_pdf&study_id=${studyId}${token ? '&token=' + encodeURIComponent(token) : ''}`;
    fetch(url, creds)
      .then((r) => {
        if (r.status === 404 || !r.ok) {
          const ct = r.headers.get('content-type');
          if (ct && ct.includes('application/json')) return r.json().then((d: { error?: string }) => setToast(d.error || 'El PDF final no está disponible'));
          setToast('El PDF final no está disponible');
          return;
        }
        return r.blob().then((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `estudio-${studyId}-final.pdf`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
      });
  };

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
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            {backLink}
          </div>
        )}
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: '0 0 4px' }}>{study.company_name}{study.format_version ? ` · ${study.format_version}` : ''}</h2>
          <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontSize: 12 }}>{STATUS_LABELS[study.status]}</span>
          {study.status === 'concluido' && (
            finalPdfAvailable ? (
              <button type="button" onClick={handleDownloadFinalPdf} style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Descargar PDF final del estudio</button>
            ) : (
              <span style={{ padding: '8px 12px', background: '#f3f4f6', color: '#6b7280', borderRadius: 6, fontSize: 13 }}>PDF final en preparación…</span>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: '30%', flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>{completedCount} de {totalCount} candidatos completados</p>
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
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: inv.status === 'completed' ? '#d1fae5' : inv.status === 'in_progress' ? '#dbeafe' : '#f3f4f6' }}>{inv.status}</span>
                    {selectedInvId === inv.id && Object.keys(formData).length > 0 && <span style={{ marginLeft: 8 }}>{completionPct(formData)}%</span>}
                    {inv.completed_at && <span style={{ marginLeft: 8 }}>{formatDate(inv.completed_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            {!selectedInv ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Selecciona un candidato de la lista para ver su información</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
                  <div><strong>Nombre:</strong> {selectedInv.candidate_name?.trim() || '—'}</div>
                  <div><strong>Correo:</strong> {selectedInv.candidate_email || '—'}</div>
                  <div><strong>Teléfono:</strong> {selectedInv.candidate_phone || '—'}</div>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: selectedInv.status === 'completed' ? '#d1fae5' : '#dbeafe', fontSize: 12 }}>{selectedInv.status}</span>
                  {selectedInv.status === 'completed' && (
                    <span style={{ marginLeft: 'auto' }}>
                      {pdfAvailable ? (
                        <button onClick={handleDownloadPdf} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Descargar PDF</button>
                      ) : (
                        <span title="El PDF estará disponible cuando el analista cierre el estudio" style={{ padding: '8px 12px', background: '#f3f4f6', color: '#6b7280', borderRadius: 6, fontSize: 13, cursor: 'help' }}>Descargar PDF (no disponible aún)</span>
                      )}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(() => {
                    const tabs = sectionTabs(formData);
                    if (tabs.length === 0) tabs.push('Datos');
                    return tabs.map((label, idx) => (
                      <button key={label} onClick={() => setDetailTab(idx)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: detailTab === idx ? '#111' : '#fff', color: detailTab === idx ? '#fff' : '#111', cursor: 'pointer', fontSize: 13 }}>{label}</button>
                    ));
                  })()}
                </div>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 8 }}><div style={{ height: '100%', width: `${pct}%`, background: '#16a34a', borderRadius: 3 }} /></div>
                <p style={{ margin: '0 0 16px', fontSize: 13 }}>{pct}% completado</p>

                <div style={{ marginBottom: 24 }}>
                  {(() => {
                    const tabs = sectionTabs(formData);
                    if (tabs.length === 0) return null;
                    const sectionKey = tabs[detailTab] || tabs[0];
                    const sectionData = formData[sectionKey] || {};
                    const entries = Object.entries(sectionData);
                    if (entries.length === 0) return <p style={{ color: '#9ca3af' }}>—</p>;
                    return (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {entries.map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 500, minWidth: 140 }}>{k}:</span>
                            <span>{v != null && String(v).trim() !== '' ? String(v) : '—'}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {study.show_verdict_to_company && verdict !== null && (
                  <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', background: verdict === 'recomendable' ? '#f0fdf4' : verdict === 'recomendable_con_observaciones' ? '#fefce8' : '#f3f4f6' }}>
                    {verdict === 'recomendable' && <p style={{ margin: 0, fontSize: 16, color: '#166534' }}>✅ Recomendable</p>}
                    {verdict === 'recomendable_con_observaciones' && <p style={{ margin: 0, fontSize: 16, color: '#854d0e' }}>⚠️ Recomendable con observaciones</p>}
                    {verdict === 'no_recomendable' && (
                      <p style={{ margin: 0, fontSize: 14, color: '#4b5563' }}>Para conocer el resultado de esta evaluación, contacta directamente a HR Capital Working.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>{toast}</div>}
    </main>
  );
}
