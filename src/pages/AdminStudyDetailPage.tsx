import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

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

function sectionTabs(formData: FormDataBySection): string[] {
  const keys = Object.keys(formData);
  const ordered = PREFERRED_SECTIONS.filter((s) => keys.some((k) => k.toLowerCase() === s.toLowerCase() || k === s));
  const rest = keys.filter((k) => !PREFERRED_SECTIONS.some((s) => s.toLowerCase() === k.toLowerCase() || s === k));
  return [...ordered, ...rest];
}

type Study = { id: number; company_name: string; study_type: string; status: string; show_verdict_to_company?: number; deletion_scheduled_at?: string | null; [k: string]: any };
type Invitation = { id: number; candidate_name?: string; candidate_email?: string; candidate_phone?: string; status: string; unique_code?: string; code_expires_at?: string; completed_at?: string; [k: string]: any };
type FormDataBySection = Record<string, Record<string, string>>;

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(d);
  }
}

function completionPct(formData: FormDataBySection): number {
  let total = 0;
  let filled = 0;
  for (const section of Object.values(formData)) {
    for (const v of Object.values(section)) {
      total++;
      if (v != null && String(v).trim() !== '') filled++;
    }
  }
  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

function openPrintCandidateData(inv: Invitation, formData: FormDataBySection, companyName?: string) {
  const sections = sectionTabs(formData);
  const lines: string[] = [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Estudio socioeconómico</title>',
    '<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 16px;color:#111;}',
    'h1{font-size:1.25rem;margin:0 0 8px;} .meta{color:#6b7280;font-size:14px;margin-bottom:24px;}',
    'section{margin-bottom:24px;break-inside:avoid;} h2{font-size:1rem;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}',
    '.row{display:flex;gap:12px;margin:6px 0;} .key{min-width:200px;font-weight:500;} .val{flex:1;}',
    '@media print{.no-print{display:none;} body{margin:16px;}}</style></head><body>',
  ];
  lines.push('<p class="no-print" style="margin-bottom:16px;"><button onclick="window.print()" style="padding:10px 20px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;cursor:pointer;">Imprimir o Guardar como PDF</button></p>');
  lines.push(`<h1>Estudio socioeconómico</h1>`);
  lines.push(`<div class="meta">${companyName ? `Empresa: ${escapeHtml(companyName)} · ` : ''}Candidato: ${escapeHtml(inv.candidate_name?.trim() || '—')} · ${escapeHtml(inv.candidate_email || '—')} · Estado: ${inv.status}</div>`);
  for (const sec of sections) {
    const data = formData[sec] || {};
    const entries = Object.entries(data).filter(([, v]) => v != null && String(v).trim() !== '');
    if (entries.length === 0) continue;
    lines.push(`<section><h2>${escapeHtml(sec)}</h2>`);
    for (const [k, v] of entries) {
      lines.push(`<div class="row"><span class="key">${escapeHtml(formatFieldLabel(k))}</span><span class="val">${escapeHtml(String(v))}</span></div>`);
    }
    lines.push('</section>');
  }
  lines.push('</body></html>');
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(lines.join(''));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFieldLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function downloadCandidatePdf(inv: Invitation, formData: FormDataBySection, companyName?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;
  const lineHeight = 7;
  const sectionGap = 4;

  doc.setFontSize(16);
  doc.text('Estudio socioeconómico', margin, y);
  y += lineHeight + 2;
  doc.setFontSize(10);
  doc.text([companyName ? `Empresa: ${companyName}` : '', `Candidato: ${inv.candidate_name?.trim() || '—'} · ${inv.candidate_email || '—'}`, `Estado: ${inv.status}`].filter(Boolean).join(' · '), margin, y);
  y += lineHeight + sectionGap;

  const sections = sectionTabs(formData);
  for (const sec of sections) {
    const data = formData[sec] || {};
    const entries = Object.entries(data).filter(([, v]) => v != null && String(v).trim() !== '');
    if (entries.length === 0) continue;
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(sec, margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const [k, v] of entries) {
      if (y > 275) { doc.addPage(); y = margin; }
      const label = formatFieldLabel(k) + ': ';
      const value = String(v);
      const lines = doc.splitTextToSize(label + value, 170);
      doc.text(lines, margin, y);
      y += lineHeight * lines.length;
    }
    y += sectionGap;
  }

  doc.save(`Estudio-invitacion-${inv.id}.pdf`);
}

export default function AdminStudyDetailPage() {
  const { id: studyIdParam } = useParams<{ id: string }>();
  const studyId = studyIdParam ? parseInt(studyIdParam, 10) : 0;
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [study, setStudy] = useState<Study | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvId, setSelectedInvId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataBySection>({});
  const [formDataLoading, setFormDataLoading] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [, setConclusion] = useState<any>(null);
  const [, setDomiciliary] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Admin-only form state
  const [domPhotoUrl, setDomPhotoUrl] = useState('');
  const [domVisitDate, setDomVisitDate] = useState('');
  const [domVisitType, setDomVisitType] = useState<'presencial' | 'referenciada'>('presencial');
  const [domNotes, setDomNotes] = useState('');
  const [concNotes, setConcNotes] = useState('');
  const [concVerdict, setConcVerdict] = useState<string | null>(null);
  const [savingDom, setSavingDom] = useState(false);
  const [savingConc, setSavingConc] = useState(false);

  // Study actions
  const [statusChanging, setStatusChanging] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [extendSaving, setExtendSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  useEffect(() => {
    fetch('/api/auth.php?action=me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(!!(d.user || d.username));
      })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!isAdmin || !studyId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/studies.php?action=get_study&id=${studyId}`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/studies.php?action=list_invitations&study_id=${studyId}`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([studyRes, invRes]) => {
        if (studyRes.error) {
          navigate('/admin/studies');
          return;
        }
        setStudy(studyRes);
        setInvitations(invRes.invitations || []);
      })
      .catch(() => navigate('/admin/studies'))
      .finally(() => setLoading(false));
  }, [isAdmin, studyId, navigate]);

  useEffect(() => {
    setDetailTab(0);
  }, [selectedInvId]);

  useEffect(() => {
    if (!selectedInvId) {
      setFormData({});
      setFormDataLoading(false);
      setConclusion(null);
      setDomiciliary(null);
      return;
    }
    setFormDataLoading(true);
    const formUrl = `/api/studies.php?action=get_form_data&invitation_id=${selectedInvId}`;
    const concUrl = `/api/studies.php?action=get_conclusion&invitation_id=${selectedInvId}`;
    const domUrl = `/api/studies.php?action=get_domiciliary&invitation_id=${selectedInvId}`;
    Promise.all([
      fetch(formUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => ({})) : {})),
      isAdmin ? fetch(concUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)) : Promise.resolve(null),
      isAdmin ? fetch(domUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)) : Promise.resolve(null),
    ]).then(([formRes, concRes, domRes]) => {
      setFormData(typeof formRes === 'object' && formRes !== null && !formRes.error ? formRes : {});
      setConclusion(concRes && !concRes?.error ? concRes : null);
      setDomiciliary(domRes && !domRes?.error ? domRes : null);
      if (concRes && concRes.analyst_notes != null) setConcNotes(concRes.analyst_notes);
      if (concRes && concRes.verdict) setConcVerdict(concRes.verdict);
      if (domRes && domRes.photo_url != null) setDomPhotoUrl(domRes.photo_url);
      if (domRes && domRes.visit_date) setDomVisitDate(domRes.visit_date.slice(0, 10));
      if (domRes && domRes.visit_type) setDomVisitType(domRes.visit_type === 'referenciada' ? 'referenciada' : 'presencial');
      if (domRes && domRes.analyst_notes != null) setDomNotes(domRes.analyst_notes);
    }).finally(() => setFormDataLoading(false));
  }, [selectedInvId, isAdmin]);

  const selectedInv = invitations.find((i) => i.id === selectedInvId);
  const completedCount = invitations.filter((i) => i.status === 'completed').length;
  const totalCount = invitations.length;
  const pct = completionPct(formData);
  const canCloseStudy = study?.status !== 'concluido' && invitations.some((i) => i.status === 'completed');

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'cancelado' && !window.confirm('¿Confirmar cambio a Cancelado?')) return;
    setStatusChanging(true);
    fetch('/api/studies.php?action=update_study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: studyId, status: newStatus }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else if (d.id) setStudy((s) => (s ? { ...s, status: d.status } : null));
      })
      .finally(() => setStatusChanging(false));
  };

  const handleCloseStudy = () => {
    setStatusChanging(true);
    fetch('/api/studies.php?action=close_study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ study_id: studyId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setStudy((s) => (s ? { ...s, status: 'concluido', concluded_at: d.concluded_at, deletion_scheduled_at: d.deletion_scheduled_at } : null));
          setShowCloseConfirm(false);
          setToast('Estudio cerrado correctamente');
        }
      })
      .finally(() => setStatusChanging(false));
  };

  const handleVerdictToggle = () => {
    const next = study?.show_verdict_to_company ? 0 : 1;
    fetch('/api/studies.php?action=update_study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: studyId, show_verdict_to_company: !!next }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.id) setStudy((s) => (s ? { ...s, show_verdict_to_company: next } : null));
      });
  };

  const handleSaveDomiciliary = () => {
    if (!selectedInvId) return;
    setSavingDom(true);
    fetch('/api/studies.php?action=create_domiciliary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        study_invitation_id: selectedInvId,
        photo_url: domPhotoUrl,
        visit_date: domVisitDate || null,
        visit_type: domVisitType,
        analyst_notes: domNotes,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setDomiciliary(d);
          setToast('Verificación guardada');
        }
      })
      .finally(() => setSavingDom(false));
  };

  const handleSaveConclusion = () => {
    if (!selectedInvId) return;
    setSavingConc(true);
    fetch('/api/studies.php?action=create_conclusion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        study_invitation_id: selectedInvId,
        analyst_notes: concNotes,
        verdict: concVerdict,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setConclusion(d);
          setToast('Conclusión guardada');
        }
      })
      .finally(() => setSavingConc(false));
  };

  const handleExtendRetention = () => {
    if (!extendDate || !extendReason.trim()) {
      setToast('Fecha y motivo son requeridos');
      return;
    }
    setExtendSaving(true);
    fetch('/api/studies.php?action=create_retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ study_id: studyId, new_expiry_date: extendDate + 'T23:59:59Z', reason: extendReason }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setToast(d.error);
        else {
          setToast('Retención extendida');
          setShowExtendModal(false);
          setExtendDate('');
          setExtendReason('');
          if (study) setStudy({ ...study, deletion_scheduled_at: extendDate });
        }
      })
      .finally(() => setExtendSaving(false));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.url) setDomPhotoUrl(d.url);
      });
    e.target.value = '';
  };

  const copyCode = () => {
    if (selectedInv?.unique_code) {
      navigator.clipboard.writeText(selectedInv.unique_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSeedDemo = () => {
    setSeedingDemo(true);
    fetch(`/api/studies.php?action=seed_study_demo&study_id=${studyId}`, { method: 'POST', credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setToast(d.message || 'Estudio de prueba rellenado. Recarga la lista de candidatos.');
          return fetch(`/api/studies.php?action=list_invitations&study_id=${studyId}`, { credentials: 'include' }).then((r) => r.json());
        }
        setToast(d.error || 'Error al rellenar');
      })
      .then((invRes) => {
        if (invRes?.invitations) {
          setInvitations(invRes.invitations);
          const firstCompleted = invRes.invitations.find((i: Invitation) => i.status === 'completed');
          if (firstCompleted) setSelectedInvId(firstCompleted.id);
        }
      })
      .finally(() => setSeedingDemo(false));
  };

  if (checking || !isAdmin) {
    if (!checking && !isAdmin) navigate('/admin');
    return <p style={{ textAlign: 'center', padding: 24 }}>Comprobando…</p>;
  }

  if (loading || !study) {
    return <p style={{ textAlign: 'center', padding: 24 }}>Cargando…</p>;
  }

  const statusStyle = STATUS_COLORS[study.status] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <>
        <div style={{ maxWidth: 1400, width: '100%', boxSizing: 'border-box', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Two columns: list (30%) + detail (70%) */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 24 }}>
            {/* Left: candidate list */}
            <div style={{ width: '30%', flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: '0 0 4px' }}>{study.company_name}</h3>
                <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontSize: 12 }}>{STATUS_LABELS[study.status]}</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>{completedCount} de {totalCount} candidatos completados</p>
              {study.study_type === 'public' && (
                <div style={{ padding: 10, background: '#fef3c7', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>Estudio público — los candidatos acceden con el enlace compartido, no con códigos individuales.</div>
              )}
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
                      {selectedInvId === inv.id && Object.keys(formData).length > 0 && (
                        <span style={{ marginLeft: 8 }}>{completionPct(formData)}%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: candidate detail */}
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
                    {selectedInv.unique_code && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Código: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{selectedInv.unique_code}</code>
                        <button onClick={copyCode} style={{ padding: '2px 8px', fontSize: 12 }}>{copiedCode ? '¡Copiado!' : 'Copiar'}</button>
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Vence: {formatDate(selectedInv.code_expires_at)}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => downloadCandidatePdf(selectedInv, formData, study?.company_name)}
                        disabled={formDataLoading || Object.keys(formData).length === 0}
                        style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: formDataLoading ? 'not-allowed' : 'pointer', fontSize: 13 }}
                      >
                        Descargar PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => openPrintCandidateData(selectedInv, formData, study?.company_name)}
                        disabled={formDataLoading || Object.keys(formData).length === 0}
                        style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: formDataLoading ? 'not-allowed' : 'pointer', fontSize: 13 }}
                      >
                        Ver en pantalla / Imprimir
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const tabs = sectionTabs(formData);
                    if (tabs.length === 0) tabs.push('Datos');
                    return (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                        {tabs.map((label, idx) => (
                          <button key={label} onClick={() => setDetailTab(idx)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: detailTab === idx ? '#111' : '#fff', color: detailTab === idx ? '#fff' : '#111', cursor: 'pointer', fontSize: 13 }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginBottom: 16 }}>
                    <div style={{ height: '100%', width: formDataLoading ? '0%' : `${pct}%`, background: '#16a34a', borderRadius: 3 }} />
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 13 }}>
                    {formDataLoading ? 'Cargando datos…' : Object.keys(formData).length === 0 ? 'Sin datos del formulario' : `${pct}% completado`}
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    {formDataLoading ? (
                      <p style={{ color: '#6b7280' }}>Cargando…</p>
                    ) : (() => {
                      const tabs = sectionTabs(formData);
                      if (tabs.length === 0) return <p style={{ color: '#9ca3af' }}>No hay datos del candidato aún.</p>;
                      const sectionKey = tabs[detailTab] || tabs[0];
                      const sectionData = formData[sectionKey] || {};
                      const entries = Object.entries(sectionData);
                      if (entries.length === 0) return <p style={{ color: '#9ca3af' }}>—</p>;
                      return (
                        <div style={{ display: 'grid', gap: 8 }}>
                          {entries.map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: 8 }}>
                              <span style={{ fontWeight: 500, minWidth: 140 }}>{formatFieldLabel(k)}:</span>
                              <span>{v != null && String(v).trim() !== '' ? String(v) : '—'}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Admin-only: Verificación Domiciliaria + Conclusiones */}
                  {isAdmin && (
                    <>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                        <h4 style={{ margin: '0 0 12px' }}>Verificación Domiciliaria (uso interno)</h4>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4 }}>Foto</label>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ marginBottom: 4 }} />
                          {domPhotoUrl && <p style={{ margin: 0, fontSize: 12 }}>URL: {domPhotoUrl}</p>}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4 }}>Fecha de visita</label>
                          <input type="date" value={domVisitDate} onChange={(e) => setDomVisitDate(e.target.value)} style={{ padding: 8, width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4 }}>Tipo de visita</label>
                          <label><input type="radio" name="visitType" checked={domVisitType === 'presencial'} onChange={() => setDomVisitType('presencial')} /> Presencial</label>
                          <label style={{ marginLeft: 16 }}><input type="radio" name="visitType" checked={domVisitType === 'referenciada'} onChange={() => setDomVisitType('referenciada')} /> Referenciada</label>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4 }}>Observaciones del analista</label>
                          <textarea value={domNotes} onChange={(e) => setDomNotes(e.target.value)} rows={3} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                        </div>
                        <button onClick={handleSaveDomiciliary} disabled={savingDom} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Guardar verificación</button>
                      </div>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
                        <h4 style={{ margin: '0 0 12px' }}>Conclusiones del Analista</h4>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4 }}>Notas internas del analista</label>
                          <textarea value={concNotes} onChange={(e) => setConcNotes(e.target.value)} rows={3} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                          {[
                            { value: 'recomendable', label: '✅ Recomendable', border: '#16a34a' },
                            { value: 'recomendable_con_observaciones', label: '⚠️ Recomendable con observaciones', border: '#eab308' },
                            { value: 'no_recomendable', label: '❌ No recomendable', border: '#dc2626' },
                          ].map(({ value, label, border }) => (
                            <button key={value} type="button" onClick={() => setConcVerdict(value)} style={{ padding: 12, border: `2px solid ${concVerdict === value ? border : '#e5e7eb'}`, borderRadius: 8, background: concVerdict === value ? `${border}20` : '#fff', cursor: 'pointer', flex: 1, minWidth: 140 }}>
                              {label}
                            </button>
                          ))}
                        </div>
                        <button onClick={handleSaveConclusion} disabled={savingConc} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Guardar conclusión</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Study actions panel - sticky right */}
          <div style={{ position: 'sticky', top: 96, width: 280, flexShrink: 0 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <h4 style={{ margin: '0 0 12px' }}>Acciones del estudio</h4>
              <p style={{ margin: '0 0 8px', fontSize: 14 }}>
                <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text }}>{STATUS_LABELS[study.status] || study.status}</span>
              </p>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Cambiar estado</label>
              <select value={study.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={statusChanging} style={{ width: '100%', padding: 8, marginBottom: 12 }}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button
                onClick={handleSeedDemo}
                disabled={seedingDemo}
                style={{ width: '100%', padding: 10, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: seedingDemo ? 'not-allowed' : 'pointer', marginBottom: 10, fontSize: 13 }}
              >
                {seedingDemo ? 'Rellenando…' : 'Rellenar estudio de prueba (demo)'}
              </button>
              <button
                onClick={() => setShowCloseConfirm(true)}
                disabled={study.status === 'concluido' || !canCloseStudy}
                style={{ width: '100%', padding: 12, background: study.status === 'concluido' ? '#e5e7eb' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: study.status === 'concluido' ? 'not-allowed' : 'pointer', marginBottom: 12 }}
              >
                Cerrar estudio / Generar PDF
              </button>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!study.show_verdict_to_company} onChange={handleVerdictToggle} />
                  Compartir dictamen con empresa
                </label>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>Activo: el PDF de la empresa incluirá el resultado de la evaluación</p>
              </div>
              <button onClick={() => setShowExtendModal(true)} style={{ width: '100%', padding: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Extender retención</button>
            </div>
          </div>
        </div>

        {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>{toast}</div>}

        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/admin/studies')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>← Volver a estudios</button>
        </div>

      {/* Close study confirmation */}
      {showCloseConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 400 }}>
            <p>¿Estás seguro de cerrar este estudio? Se generará el PDF final y no podrá editarse.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => setShowCloseConfirm(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleCloseStudy} disabled={statusChanging} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Extend retention modal */}
      {showExtendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 400 }}>
            <h4 style={{ margin: '0 0 16px' }}>Extender retención</h4>
            <label style={{ display: 'block', marginBottom: 4 }}>Nueva fecha límite</label>
            <input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 12, boxSizing: 'border-box' }} />
            <label style={{ display: 'block', marginBottom: 4 }}>Motivo (requerido)</label>
            <textarea value={extendReason} onChange={(e) => setExtendReason(e.target.value)} rows={3} style={{ width: '100%', padding: 8, boxSizing: 'border-box', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowExtendModal(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleExtendRetention} disabled={extendSaving || !extendDate || !extendReason.trim()} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Confirmar extensión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
