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

const PREFERRED_SECTIONS = [
  'Datos Personales y de Contacto',
  'Autorización Actualización',
  'Domicilio',
  'Información del Cónyuge, Familiares y Contacto',
  'Referencias Personales',
  'Escolaridad y Capacitación',
  'Historia Laboral',
  'Datos Generales e Identificación',
  'Ingresos y Situación Económica',
  'Información Legal y Trámite de Carta de No Antecedentes Penales',
  'Bienestar y Antecedentes Legales',
  'Entorno Social y Condiciones de Vivienda',
  'Datos Personales',
  'Datos de Contacto',
  'Domicilio Actual',
  'Historial Académico',
  'Historial Laboral',
  'Situación Económica',
  'Referencias Familiares',
  'Documentos',
];

/** Document type keys that store file paths; show download button in admin. */
const DOCUMENT_FIELD_KEYS = ['ine_identificacion', 'curp_documento', 'comprobante_domicilio', 'ultimo_recibo_nomina', 'otros_documentos'];

/** Build API URL to download document (streams file with correct Content-Type and filename). */
function documentDownloadApiUrl(filePath: string): string {
  const v = (filePath || '').trim();
  if (!v || /^https?:\/\//i.test(v)) return '';
  // Backend expects path relative to api/ (e.g. uploads/filename.pdf)
  const path = v.startsWith('uploads/') ? v : `uploads/${v.replace(/^\/+/, '')}`;
  return `/api/studies.php?action=download_document&file_path=${encodeURIComponent(path)}`;
}

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
  const refMatch = key.match(/^(\d+)_ref_(.+)$/);
  if (refMatch) {
    const num = parseInt(refMatch[1], 10) + 1;
    const sub = refMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Referencia ${num} – ${sub}`;
  }
  const famMatch = key.match(/^(\d+)_fam_(.+)$/);
  if (famMatch) {
    const num = parseInt(famMatch[1], 10) + 1;
    const sub = famMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Familiar ${num} – ${sub}`;
  }
  if (key.startsWith('conyuge_')) {
    const sub = key.slice(7).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Cónyuge/Pareja – ${sub}`;
  }
  const ieDepMatch = key.match(/^ie_dep_(\d+)_(.+)$/);
  if (ieDepMatch) {
    const num = parseInt(ieDepMatch[1], 10) + 1;
    const sub = ieDepMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Dependiente ${num} – ${sub}`;
  }
  if (key.startsWith('gasto_')) {
    const sub = key.slice(6).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Gasto – ${sub}`;
  }
  if (key.startsWith('contacto_emergencia_')) {
    const sub = key.slice(19).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Contacto emergencia – ${sub}`;
  }
  if (key.startsWith('contacto_')) {
    const sub = key.slice(9).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Contacto – ${sub}`;
  }
  const hlAntMatch = key.match(/^hl_ant_(\d+)_(.+)$/);
  if (hlAntMatch) {
    const num = parseInt(hlAntMatch[1], 10) + 1;
    const sub = hlAntMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Empleo anterior ${num} – ${sub}`;
  }
  const hlAdicMatch = key.match(/^hl_adic_(\d+)_(.+)$/);
  if (hlAdicMatch) {
    const num = parseInt(hlAdicMatch[1], 10) + 1;
    const sub = hlAdicMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Empleo adicional ${num} – ${sub}`;
  }
  const hlNomMatch = key.match(/^hl_nom_(\d+)_(.+)$/);
  if (hlNomMatch) {
    const num = parseInt(hlNomMatch[1], 10) + 1;
    const sub = hlNomMatch[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Empleo no mencionado ${num} – ${sub}`;
  }
  if (key.startsWith('hl_actual_')) {
    const sub = key.slice(10).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `Empleo actual – ${sub}`;
  }
  if (key.startsWith('hl_periodo_sin_')) {
    const m = key.match(/^hl_periodo_sin_(\d+)_(.+)$/);
    if (m) {
      const num = parseInt(m[1], 10) + 1;
      const sub = m[2].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `Periodo sin empleo ${num} – ${sub}`;
    }
  }
  if (key.startsWith('hl_periodos_sin_empleo')) {
    const sub = key.slice(21).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
    return sub ? `Periodos sin empleo – ${sub}` : 'Periodos sin empleo';
  }
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
  const [concResultado, setConcResultado] = useState<string | null>(null);
  const [concObsRel, setConcObsRel] = useState('');
  const [concFechaCierre, setConcFechaCierre] = useState('');
  const [concAnalista, setConcAnalista] = useState('');
  const [savingDom, setSavingDom] = useState(false);
  const [savingConc, setSavingConc] = useState(false);
  const [serverPdfLoading, setServerPdfLoading] = useState(false);
  const [hlAdminOpen, setHlAdminOpen] = useState(false);
  const [hlAdminFields, setHlAdminFields] = useState<Record<string, string>>({});
  const [hlAdminSaving, setHlAdminSaving] = useState(false);
  const [hlAdminUploadingKey, setHlAdminUploadingKey] = useState<string | null>(null);

  // Study actions
  const [statusChanging, setStatusChanging] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [extendSaving, setExtendSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [resendingCompanyInvite, setResendingCompanyInvite] = useState(false);
  const [sendingCompanyReset, setSendingCompanyReset] = useState(false);
  const [downloadFinalPdfLoading, setDownloadFinalPdfLoading] = useState(false);

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

  const reloadInvitations = () => {
    if (!studyId) return;
    fetch(`/api/studies.php?action=list_invitations&study_id=${studyId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.invitations) setInvitations(d.invitations);
      });
  };

  useEffect(() => {
    if (!isAdmin || !studyId) return;
    const onFocus = () => reloadInvitations();
    const t = setInterval(reloadInvitations, 45000);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAdmin, studyId]);

  useEffect(() => {
    setDetailTab(0);
  }, [selectedInvId]);

  useEffect(() => {
    if (!selectedInvId) {
      setFormData({});
      setFormDataLoading(false);
      setConclusion(null);
      setDomiciliary(null);
      setConcNotes('');
      setConcVerdict(null);
      setConcResultado(null);
      setConcObsRel('');
      setConcFechaCierre('');
      setConcAnalista('');
      setDomPhotoUrl('');
      setDomVisitDate('');
      setDomVisitType('presencial');
      setDomNotes('');
      return;
    }
    // Clear domiciliary/conclusion form state immediately so we don't show previous candidate's data while loading
    setConclusion(null);
    setDomiciliary(null);
    setConcNotes('');
    setConcVerdict(null);
    setConcResultado(null);
    setConcObsRel('');
    setConcFechaCierre('');
    setConcAnalista('');
    setDomPhotoUrl('');
    setDomVisitDate('');
    setDomVisitType('presencial');
    setDomNotes('');
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
      // Prefill admin-only Historia Laboral fields (notes + attachments)
      try {
        const hl = (formRes && typeof formRes === 'object' && formRes['Historia Laboral']) ? formRes['Historia Laboral'] : {};
        const out: Record<string, string> = {};
        if (hl && typeof hl === 'object') {
          Object.entries(hl).forEach(([k, v]) => {
            if (!/^hl_(actual|ant_\d+|adic_\d+)_admin_/.test(k)) return;
            out[k] = v != null ? String(v) : '';
          });
        }
        setHlAdminFields(out);
      } catch {
        setHlAdminFields({});
      }
      setConclusion(concRes && !concRes?.error ? concRes : null);
      setDomiciliary(domRes && !domRes?.error ? domRes : null);
      // Always set form fields from response so candidate with no data shows empty (not previous candidate's data)
      setConcNotes(concRes?.analyst_notes ?? '');
      setConcVerdict(concRes?.verdict ?? null);
      setConcResultado(concRes?.resultado_actualizacion ?? null);
      setConcObsRel(concRes?.observaciones_relevantes ?? '');
      setConcFechaCierre(concRes?.fecha_cierre_estudio ? String(concRes.fecha_cierre_estudio).slice(0, 10) : '');
      setConcAnalista(concRes?.analista_responsable ?? '');
      setDomPhotoUrl(domRes?.photo_url ?? '');
      setDomVisitDate(domRes?.visit_date ? String(domRes.visit_date).slice(0, 10) : '');
      setDomVisitType(domRes?.visit_type === 'referenciada' ? 'referenciada' : 'presencial');
      setDomNotes(domRes?.analyst_notes ?? '');
    }).finally(() => setFormDataLoading(false));
  }, [selectedInvId, isAdmin]);

  const reloadFormData = () => {
    if (!selectedInvId) return Promise.resolve();
    setFormDataLoading(true);
    const formUrl = `/api/studies.php?action=get_form_data&invitation_id=${selectedInvId}`;
    return fetch(formUrl, { credentials: 'include' })
      .then(async (r) => (r.ok ? r.json().catch(() => ({})) : {}))
      .then((formRes) => {
        setFormData(typeof formRes === 'object' && formRes !== null && !formRes.error ? formRes : {});
        const hl = (formRes && typeof formRes === 'object' && formRes['Historia Laboral']) ? formRes['Historia Laboral'] : {};
        const out: Record<string, string> = {};
        if (hl && typeof hl === 'object') {
          Object.entries(hl).forEach(([k, v]) => {
            if (!/^hl_(actual|ant_\d+|adic_\d+)_admin_/.test(k)) return;
            out[k] = v != null ? String(v) : '';
          });
        }
        setHlAdminFields(out);
      })
      .finally(() => setFormDataLoading(false));
  };

  const saveHistoriaLaboralAdmin = () => {
    if (!selectedInvId) return;
    setHlAdminSaving(true);
    const fields = Object.entries(hlAdminFields).map(([field_key, field_value]) => ({
      section: 'Historia Laboral',
      field_key,
      field_value: field_value ?? '',
    }));
    fetch('/api/studies.php?action=save_admin_form_data_batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ study_invitation_id: selectedInvId, fields }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d?.error) setToast(d.error);
        else setToast('Notas de historia laboral guardadas');
      })
      .then(() => reloadFormData())
      .finally(() => setHlAdminSaving(false));
  };

  const uploadHistoriaLaboralAttachment = (file: File, key: string) => {
    if (!file) return;
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      setToast('El archivo no debe superar 5 MB');
      return;
    }
    const okPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const okImg = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!okPdf && !okImg) {
      setToast('Sube un PDF o una imagen (JPG/PNG/WebP)');
      return;
    }
    setHlAdminUploadingKey(key);
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d?.url) {
          setHlAdminFields((prev) => ({ ...prev, [key]: String(d.url) }));
          setToast('Archivo cargado. Recuerda guardar.');
        } else {
          setToast('No se pudo subir el archivo');
        }
      })
      .finally(() => setHlAdminUploadingKey(null));
  };

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
          setToast(d.pdf_generated ? 'Estudio cerrado correctamente. PDF final generado.' : 'Estudio cerrado. Si el PDF final no aparece, haz clic en "Descargar PDF final del estudio" para generarlo.');
        }
      })
      .finally(() => setStatusChanging(false));
  };

  const handleDownloadStudyFinalPdf = () => {
    if (!studyId) return;
    setDownloadFinalPdfLoading(true);
    fetch(`/api/studies.php?action=download_study_final_pdf&study_id=${studyId}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) {
          if (r.headers.get('content-type')?.includes('application/json')) return r.json().then((d: { error?: string }) => setToast(d.error || 'PDF no disponible'));
          setToast('PDF final no disponible');
          return;
        }
        return r.blob().then((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `estudio-${studyId}-final.pdf`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
      })
      .finally(() => setDownloadFinalPdfLoading(false));
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
        resultado_actualizacion: concResultado,
        observaciones_relevantes: concObsRel,
        fecha_cierre_estudio: concFechaCierre || null,
        analista_responsable: concAnalista,
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

  const handleResendCompanyInvite = () => {
    if (!studyId) return;
    setResendingCompanyInvite(true);
    fetch('/api/studies.php?action=resend_company_invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ study_id: studyId }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setToast(d.error || 'No se pudo reenviar la invitación');
          return;
        }
        setToast('Invitación de empresa reenviada correctamente');
      })
      .finally(() => setResendingCompanyInvite(false));
  };

  const handleDownloadServerPdf = () => {
    if (!selectedInvId) return;
    setServerPdfLoading(true);
    window.open(`/api/studies.php?action=download_pdf&invitation_id=${selectedInvId}`, '_blank');
    setTimeout(() => setServerPdfLoading(false), 1500);
  };

  const handleDownloadAdminPdfForInvitation = async (inv: Invitation) => {
    setServerPdfLoading(true);
    try {
      const res = await fetch(`/api/studies.php?action=download_pdf&invitation_id=${inv.id}`, { credentials: 'include' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setToast(d?.error || 'No se pudo descargar el PDF del candidato.');
        return;
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `estudio-${inv.id}-formato-completo.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setToast('No se pudo descargar el PDF del candidato.');
    } finally {
      setTimeout(() => setServerPdfLoading(false), 500);
    }
  };

  const domPhotoDownloadUrl =
    domPhotoUrl && !/^https?:\/\//i.test(domPhotoUrl) ? documentDownloadApiUrl(domPhotoUrl) : '';

  const handleSendCompanyReset = () => {
    const email = String(study?.invited_company_email || '').trim();
    if (!email) {
      setToast('Este estudio no tiene correo de empresa configurado.');
      return;
    }
    setSendingCompanyReset(true);
    fetch('/api/user_auth.php?action=admin-trigger-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setToast(d.error || 'No se pudo enviar el reset de contraseña');
          return;
        }
        setToast('Correo de reset de contraseña enviado a la empresa');
      })
      .finally(() => setSendingCompanyReset(false));
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
          {/* Main: candidate list */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 24, flexDirection: 'column' }}>
            <div>
              <button onClick={() => navigate('/admin/studies')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}>
                ← Volver a estudios
              </button>
            </div>

            <div style={{ width: '100%', flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: '0 0 4px' }}>{study.company_name}</h3>
                <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontSize: 12 }}>{STATUS_LABELS[study.status]}</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6b7280' }}>{completedCount} de {totalCount} candidatos completados</p>
              {study.study_type === 'public' && (
                <div style={{ padding: 10, background: '#fef3c7', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>Estudio público — los candidatos acceden con el enlace compartido, no con códigos individuales.</div>
              )}

              {/* Acciones del estudio (arriba, en vez de panel lateral) */}
              <div style={{ marginBottom: 16, padding: 14, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontSize: 12, fontWeight: 800 }}>
                    {STATUS_LABELS[study.status] || study.status}
                  </span>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: '#111827' }}>Cambiar estado</label>
                    <select
                      value={study.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={statusChanging}
                      style={{ padding: 8, borderRadius: 10, border: '1px solid #e5e7eb', minWidth: 210, background: '#fff' }}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button
                    onClick={handleSeedDemo}
                    disabled={seedingDemo}
                    style={{ padding: '10px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, cursor: seedingDemo ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 13 }}
                  >
                    {seedingDemo ? 'Rellenando…' : 'Rellenar estudio de prueba (demo)'}
                  </button>

                  {study.invited_company_email && (
                    <button
                      onClick={handleResendCompanyInvite}
                      disabled={resendingCompanyInvite}
                      style={{ padding: '10px 14px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, cursor: resendingCompanyInvite ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 13 }}
                    >
                      {resendingCompanyInvite ? 'Reenviando invitación…' : 'Reenviar invitación empresa'}
                    </button>
                  )}

                  {study.invited_company_email && (
                    <button
                      onClick={handleSendCompanyReset}
                      disabled={sendingCompanyReset}
                      style={{ padding: '10px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: sendingCompanyReset ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 13 }}
                    >
                      {sendingCompanyReset ? 'Enviando reset…' : 'Enviar reset contraseña empresa'}
                    </button>
                  )}

                  <button
                    onClick={() => setShowExtendModal(true)}
                    style={{ padding: '10px 14px', background: '#f3f4f6', color: '#0f172a', border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 900, fontSize: 13 }}
                  >
                    Extender retención
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 260 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 900, color: '#111827' }}>
                      <input type="checkbox" checked={!!study.show_verdict_to_company} onChange={handleVerdictToggle} />
                      Compartir dictamen con empresa
                    </label>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>Activo: el PDF de la empresa incluirá el resultado de la evaluación</p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowCloseConfirm(true)}
                      disabled={study.status === 'concluido' || !canCloseStudy}
                      style={{
                        padding: '10px 14px',
                        background: study.status === 'concluido' || !canCloseStudy ? '#f3f4f6' : '#1d4ed8',
                        color: study.status === 'concluido' || !canCloseStudy ? '#6b7280' : '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: study.status === 'concluido' || !canCloseStudy ? 'not-allowed' : 'pointer',
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      Cerrar estudio / Generar PDF
                    </button>

                    {study.status === 'concluido' && (
                      <button
                        type="button"
                        onClick={handleDownloadStudyFinalPdf}
                        disabled={downloadFinalPdfLoading}
                        style={{ padding: '10px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: downloadFinalPdfLoading ? 'not-allowed' : 'pointer', fontWeight: 900, fontSize: 13 }}
                      >
                        {downloadFinalPdfLoading ? 'Descargando…' : 'Descargar PDF final del estudio'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: 12,
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.candidate_name?.trim() || inv.candidate_email || 'Anónimo'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: inv.status === 'completed' ? '#d1fae5' : inv.status === 'in_progress' ? '#dbeafe' : '#f3f4f6' }}>{inv.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/studies/${studyId}/candidates/${inv.id}/view?back=study`)}
                        style={{ padding: '8px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
                      >
                        Ver
                      </button>
                      {inv.status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleDownloadAdminPdfForInvitation(inv)}
                          disabled={serverPdfLoading}
                          style={{ padding: '8px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: serverPdfLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 800 }}
                        >
                          {serverPdfLoading ? 'Descargando…' : 'Descargar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate detail intentionally hidden in this redesigned flow.
                Click "Ver" to open the full multi-page candidate view. */}
            <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'none' }}>
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
                        onClick={() => navigate(`/admin/studies/${studyId}/candidates/${selectedInv.id}/view?back=study`)}
                        style={{ padding: '8px 14px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
                      >
                        Ver estudio
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadServerPdf}
                        disabled={selectedInv.status !== 'completed'}
                        style={{
                          padding: '8px 14px',
                          background: selectedInv.status === 'completed' ? '#0f766e' : '#9ca3af',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          cursor: selectedInv.status === 'completed' ? 'pointer' : 'not-allowed',
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {serverPdfLoading ? 'Abriendo…' : 'PDF candidato (servidor)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadCandidatePdf(selectedInv, formData, study?.company_name)}
                        disabled={formDataLoading || Object.keys(formData).length === 0}
                        style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, cursor: formDataLoading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
                      >
                        PDF rápido (navegador)
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
                      const isDocumentosSection = sectionKey.toLowerCase() === 'documentos';
                      return (
                        <div style={{ display: 'grid', gap: 12 }}>
                          {entries.map(([k, v]) => {
                            const valueStr = v != null && String(v).trim() !== '' ? String(v) : '';
                            const isDocField = isDocumentosSection && DOCUMENT_FIELD_KEYS.includes(k);
                            const isStoredPdf =
                              valueStr &&
                              (k.endsWith('_pdf') ||
                                k === 'identificacion_oficial_pdf' ||
                                /^cap_doc_/.test(k)) &&
                              !/^https?:\/\//i.test(valueStr);
                            const isStoredImage = valueStr && k === 'foto_participante' && !/^https?:\/\//i.test(valueStr);
                            const isStoredAttachment = valueStr && /_admin_respaldo$/.test(k) && !/^https?:\/\//i.test(valueStr);
                            const downloadUrl =
                              (isDocField && valueStr) || isStoredPdf || isStoredImage || isStoredAttachment ? documentDownloadApiUrl(valueStr) : '';
                            return (
                              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 500, minWidth: 180 }}>{formatFieldLabel(k)}:</span>
                                {downloadUrl ? (
                                  <>
                                    <span style={{ color: '#6b7280', fontSize: 13 }}>{valueStr.replace(/^.*[/\\]/, '')}</span>
                                    <a
                                      href={downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      style={{ padding: '6px 12px', background: '#059669', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}
                                    >
                                      Descargar
                                    </a>
                                  </>
                                ) : (
                                  <span>{valueStr || '—'}</span>
                                )}
                              </div>
                            );
                          })}

                          {sectionKey === 'Historia Laboral' && (
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <h4 style={{ margin: 0, fontSize: 14 }}>Notas del analista (solo admin)</h4>
                                <button type="button" onClick={() => setHlAdminOpen((s) => !s)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                                  {hlAdminOpen ? 'Ocultar' : 'Mostrar'}
                                </button>
                              </div>
                              {hlAdminOpen && (
                                <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                                  {[
                                    { label: 'Empleo actual', prefix: 'hl_actual' },
                                    { label: 'Empleo anterior 1', prefix: 'hl_ant_0' },
                                    { label: 'Empleo anterior 2', prefix: 'hl_ant_1' },
                                    { label: 'Empleo anterior 3', prefix: 'hl_ant_2' },
                                    { label: 'Empleo adicional 1', prefix: 'hl_adic_0' },
                                    { label: 'Empleo adicional 2', prefix: 'hl_adic_1' },
                                    { label: 'Empleo adicional 3', prefix: 'hl_adic_2' },
                                  ].map(({ label, prefix }) => {
                                    const k1 = `${prefix}_admin_comentarios_entrevistado`;
                                    const k2 = `${prefix}_admin_observaciones_internas`;
                                    const k3 = `${prefix}_admin_respaldo`;
                                    return (
                                      <div key={prefix} style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{label}</div>
                                        <div style={{ display: 'grid', gap: 10 }}>
                                          <div>
                                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>ESPACIO 1: Comentarios del entrevistado</label>
                                            <textarea
                                              value={hlAdminFields[k1] ?? ''}
                                              onChange={(e) => setHlAdminFields((p) => ({ ...p, [k1]: e.target.value }))}
                                              rows={3}
                                              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                              placeholder="Notas de la referencia…"
                                            />
                                          </div>
                                          <div>
                                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 12 }}>ESPACIO 2: Observaciones internas Working</label>
                                            <textarea
                                              value={hlAdminFields[k2] ?? ''}
                                              onChange={(e) => setHlAdminFields((p) => ({ ...p, [k2]: e.target.value }))}
                                              rows={3}
                                              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                              placeholder="Observaciones internas…"
                                            />
                                          </div>
                                          <div>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 12 }}>SUBIR IMAGEN O PDF</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                              <label style={{ cursor: hlAdminUploadingKey === k3 ? 'wait' : 'pointer' }}>
                                                <input
                                                  type="file"
                                                  accept=".pdf,application/pdf,image/*"
                                                  style={{ display: 'none' }}
                                                  disabled={hlAdminUploadingKey !== null}
                                                  onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (!f) return;
                                                    uploadHistoriaLaboralAttachment(f, k3);
                                                    e.target.value = '';
                                                  }}
                                                />
                                                <span style={{ display: 'inline-block', padding: '8px 12px', background: hlAdminUploadingKey === k3 ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                                                  {hlAdminUploadingKey === k3 ? 'Subiendo…' : 'Adjuntar'}
                                                </span>
                                              </label>
                                              {hlAdminFields[k3] ? (
                                                <a
                                                  href={documentDownloadApiUrl(hlAdminFields[k3])}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ fontSize: 12, color: '#059669', fontWeight: 700, textDecoration: 'none' }}
                                                >
                                                  Ver archivo
                                                </a>
                                              ) : (
                                                <span style={{ fontSize: 12, color: '#6b7280' }}>Sin archivo</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={saveHistoriaLaboralAdmin}
                                      disabled={hlAdminSaving}
                                      style={{ padding: '10px 14px', background: hlAdminSaving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: hlAdminSaving ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 13 }}
                                    >
                                      {hlAdminSaving ? 'Guardando…' : 'Guardar notas de historia laboral'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Admin-only: 11. Uso interno + verificación + semáforo */}
                  {isAdmin && (
                    <div style={{ border: '2px solid #1e3a5f', borderRadius: 12, padding: 20, marginTop: 24, background: '#f8fafc' }}>
                      <h3 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: 16 }}>11. USO INTERNO – AGENCIA / EMPRESA</h3>
                      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>No visible para el colaborador</p>

                      <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>CONCLUSIONES Y RESULTADO DE LA ACTUALIZACIÓN</h4>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Conclusiones del analista</label>
                        <textarea value={concNotes} onChange={(e) => setConcNotes(e.target.value)} rows={4} placeholder="Conclusiones…" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                      </div>
                      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>Resultado de la actualización</p>
                      {[
                        { value: 'sin_observaciones', label: 'Información actualizada sin observaciones' },
                        { value: 'con_observaciones', label: 'Información actualizada con observaciones' },
                        { value: 'pendiente_complementar', label: 'Información pendiente de complementar' },
                      ].map(({ value, label }) => (
                        <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, cursor: 'pointer', fontSize: 14 }}>
                          <input type="radio" name="concResultado" checked={concResultado === value} onChange={() => setConcResultado(value)} style={{ marginTop: 3 }} />
                          <span>{label}</span>
                        </label>
                      ))}
                      <p style={{ margin: '8px 0 12px', fontSize: 12, color: '#475569', fontStyle: 'italic', padding: 10, background: '#e0f2fe', borderRadius: 8 }}>
                        El estatus «Información pendiente de complementar» se refiere exclusivamente a documentación o información administrativa en proceso y no constituye observación negativa sobre el colaborador.
                      </p>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Observaciones relevantes (si aplica)</label>
                        <textarea value={concObsRel} onChange={(e) => setConcObsRel(e.target.value)} rows={3} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: 13 }}>Fecha de cierre del estudio</label>
                          <input type="date" value={concFechaCierre} onChange={(e) => setConcFechaCierre(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, fontSize: 13 }}>Analista responsable</label>
                          <input type="text" value={concAnalista} onChange={(e) => setConcAnalista(e.target.value)} placeholder="Nombre del analista" style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '16px 0' }} />
                      <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>VERIFICACIÓN DOMICILIARIA – USO INTERNO</h4>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Fotografía exterior del domicilio</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                          {domPhotoDownloadUrl ? (
                            <a
                              href={domPhotoDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              style={{ padding: '10px 16px', background: '#166534', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
                            >
                              Descargar foto guardada
                            </a>
                          ) : (
                            <span style={{ fontSize: 13, color: '#64748b' }}>Suba y guarde para poder descargar después</span>
                          )}
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha de visita</label>
                        <input type="date" value={domVisitDate} onChange={(e) => setDomVisitDate(e.target.value)} style={{ padding: 8, width: '100%', maxWidth: 280, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Tipo de visita</label>
                        <label style={{ marginRight: 16 }}><input type="radio" name="visitType" checked={domVisitType === 'presencial'} onChange={() => setDomVisitType('presencial')} /> Presencial</label>
                        <label><input type="radio" name="visitType" checked={domVisitType === 'referenciada'} onChange={() => setDomVisitType('referenciada')} /> Referenciada</label>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Observaciones del analista (visita)</label>
                        <textarea value={domNotes} onChange={(e) => setDomNotes(e.target.value)} rows={3} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                      </div>
                      <button onClick={handleSaveDomiciliary} disabled={savingDom} style={{ padding: '10px 18px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                        Guardar verificación domiciliaria
                      </button>

                      <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '20px 0' }} />
                      <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>Semáforo (opcional – visibilidad empresa según configuración)</p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                        {[
                          { value: 'recomendable', label: 'Recomendable', bg: '#15803d', activeBg: '#166534' },
                          { value: 'recomendable_con_observaciones', label: 'Recomendable c/ obs.', bg: '#ca8a04', activeBg: '#a16207' },
                          { value: 'no_recomendable', label: 'No recomendable', bg: '#b91c1c', activeBg: '#991b1b' },
                        ].map(({ value, label, bg, activeBg }) => {
                          const on = concVerdict === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setConcVerdict(value)}
                              style={{
                                padding: '12px 16px',
                                border: on ? `3px solid ${activeBg}` : '2px solid #334155',
                                borderRadius: 8,
                                background: on ? activeBg : bg,
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: 13,
                                textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                                boxShadow: on ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={handleSaveConclusion} disabled={savingConc} style={{ padding: '10px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                        Guardar conclusiones y cierre
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Acciones del estudio se renderizan arriba (moved from right panel). */}
        </div>

        {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: '#111', color: '#fff', borderRadius: 8 }}>{toast}</div>}

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
