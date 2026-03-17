import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

type Invitation = {
  id: number;
  study_id: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  status: string;
  unique_code?: string;
  code_expires_at?: string;
};

type FormDataBySection = Record<string, Record<string, string>>;

const DOCUMENT_FIELD_KEYS = ['ine_identificacion', 'curp_documento', 'comprobante_domicilio', 'ultimo_recibo_nomina', 'otros_documentos'];

function documentDownloadApiUrl(filePath: string): string {
  const v = (filePath || '').trim();
  if (!v || /^https?:\/\//i.test(v)) return '';
  const path = v.startsWith('uploads/') ? v : `uploads/${v.replace(/^\/+/, '')}`;
  return `/api/studies.php?action=download_document&file_path=${encodeURIComponent(path)}`;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(d);
  }
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

function buildTabs(formData: FormDataBySection, includeInternal: boolean): string[] {
  const keys = Object.keys(formData || {});
  const preferred = [
    'Datos Personales y de Contacto',
    'Autorización Actualización',
    'Domicilio',
    'Información del Cónyuge, Familiares y Contacto',
    'Referencias Personales',
    'Escolaridad y Capacitación',
    'Datos Generales e Identificación',
    'Historia Laboral',
    'Ingresos y Situación Económica',
    'Información Legal y Trámite de Carta de No Antecedentes Penales',
    'Bienestar y Antecedentes Legales',
    'Entorno Social y Condiciones de Vivienda',
    'Documentos',
  ];
  const ordered = preferred.filter((s) => keys.some((k) => k.toLowerCase() === s.toLowerCase() || k === s));
  const rest = keys.filter((k) => !preferred.some((s) => s.toLowerCase() === k.toLowerCase() || s === k));
  const out = [...ordered, ...rest];
  if (includeInternal) out.push('Uso interno (analista)');
  return out.length ? out : includeInternal ? ['Uso interno (analista)'] : ['Datos'];
}

export default function AdminCandidateStudyViewPage() {
  const navigate = useNavigate();
  const { id: studyIdParam, invitationId: invitationIdParam } = useParams<{ id: string; invitationId: string }>();
  const studyId = studyIdParam ? parseInt(studyIdParam, 10) : 0;
  const invitationId = invitationIdParam ? parseInt(invitationIdParam, 10) : 0;
  const [searchParams] = useSearchParams();
  const back = searchParams.get('back') || '';

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authDebug, setAuthDebug] = useState<{ status: number | null; hasUser: boolean; raw?: any }>({ status: null, hasUser: false });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [inv, setInv] = useState<Invitation | null>(null);
  const [formData, setFormData] = useState<FormDataBySection>({});
  const [formLoading, setFormLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);

  // Internal admin state (existing functionality moved here)
  const [domPhotoUrl, setDomPhotoUrl] = useState('');
  const [domVisitDate, setDomVisitDate] = useState('');
  const [domVisitType, setDomVisitType] = useState<'presencial' | 'referenciada'>('presencial');
  const [domNotes, setDomNotes] = useState('');
  const [savingDom, setSavingDom] = useState(false);

  const [concNotes, setConcNotes] = useState('');
  const [concVerdict, setConcVerdict] = useState<string | null>(null);
  const [concResultado, setConcResultado] = useState<string | null>(null);
  const [concObsRel, setConcObsRel] = useState('');
  const [concFechaCierre, setConcFechaCierre] = useState('');
  const [concAnalista, setConcAnalista] = useState('');
  const [savingConc, setSavingConc] = useState(false);

  // Historia laboral admin notes
  const [hlAdminOpen, setHlAdminOpen] = useState(true);
  const [hlAdminFields, setHlAdminFields] = useState<Record<string, string>>({});
  const [hlAdminSaving, setHlAdminSaving] = useState(false);
  const [hlAdminUploadingKey, setHlAdminUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    setChecking(true);
    // Match existing admin pages: session is validated via /api/auth.php
    fetch('/api/auth.php?action=me', { credentials: 'include' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        const hasUser = !!(data?.user || data?.username);
        setAuthDebug({ status: r.status, hasUser, raw: data });
        return data;
      })
      .then((d) => {
        setIsAdmin(!!(d?.user || d?.username));
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!studyId || !invitationId) {
      navigate('/admin/studies');
      return;
    }
    setLoading(true);
    // Load invitation list to pick this invitation (keeps API surface minimal)
    fetch(`/api/studies.php?action=list_invitations&study_id=${studyId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const found = (d?.invitations || []).find((x: Invitation) => x.id === invitationId) || null;
        setInv(found);
      })
      .catch(() => setInv(null))
      .finally(() => setLoading(false));
  }, [checking, isAdmin, studyId, invitationId, navigate]);

  const tabs = useMemo(() => buildTabs(formData, true), [formData]);
  const currentTab = tabs[tabIdx] || tabs[0];

  // When switching sections in admin view, start at top
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [tabIdx]);

  const loadAll = () => {
    if (!invitationId) return;
    setFormLoading(true);
    const formUrl = `/api/studies.php?action=get_form_data&invitation_id=${invitationId}`;
    const concUrl = `/api/studies.php?action=get_conclusion&invitation_id=${invitationId}`;
    const domUrl = `/api/studies.php?action=get_domiciliary&invitation_id=${invitationId}`;
    Promise.all([
      fetch(formUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => ({})) : {})),
      fetch(concUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)),
      fetch(domUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)),
    ])
      .then(([formRes, concRes, domRes]) => {
        setFormData(typeof formRes === 'object' && formRes !== null && !formRes.error ? formRes : {});

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

        // Prefill admin-only Historia Laboral fields
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
      .finally(() => setFormLoading(false));
  };

  useEffect(() => {
    if (!invitationId || !isAdmin || checking) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, isAdmin, checking]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d.url) setDomPhotoUrl(d.url);
      });
    e.target.value = '';
  };

  const handleSaveDomiciliary = () => {
    if (!invitationId) return;
    setSavingDom(true);
    fetch('/api/studies.php?action=create_domiciliary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        study_invitation_id: invitationId,
        photo_url: domPhotoUrl,
        visit_date: domVisitDate || null,
        visit_type: domVisitType,
        analyst_notes: domNotes,
      }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => setToast(d.error || 'Verificación guardada'))
      .finally(() => setSavingDom(false));
  };

  const handleSaveConclusion = () => {
    if (!invitationId) return;
    setSavingConc(true);
    fetch('/api/studies.php?action=create_conclusion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        study_invitation_id: invitationId,
        analyst_notes: concNotes,
        verdict: concVerdict,
        resultado_actualizacion: concResultado,
        observaciones_relevantes: concObsRel,
        fecha_cierre_estudio: concFechaCierre || null,
        analista_responsable: concAnalista,
      }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => setToast(d.error || 'Conclusión guardada'))
      .finally(() => setSavingConc(false));
  };

  const saveHistoriaLaboralAdmin = () => {
    if (!invitationId) return;
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
      body: JSON.stringify({ study_invitation_id: invitationId, fields }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => setToast(d?.error || 'Notas de historia laboral guardadas'))
      .then(() => loadAll())
      .finally(() => setHlAdminSaving(false));
  };

  const uploadHistoriaLaboralAttachment = (file: File, key: string) => {
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

  if (checking) return <p style={{ textAlign: 'center', padding: 24 }}>Comprobando…</p>;
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 18px 80px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
          <h2 style={{ margin: '0 0 10px' }}>Sesión de admin no detectada</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Esto debería funcionar si estás logueado en Admin. Debug: status <strong>{authDebug.status ?? '—'}</strong>, hasUser{' '}
            <strong>{authDebug.hasUser ? 'true' : 'false'}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 14px', background: '#111827', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800 }}>
              Reintentar
            </button>
            <button type="button" onClick={() => navigate('/admin')} style={{ padding: '10px 14px', background: '#e2e8f0', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
              Ir al panel
            </button>
          </div>
          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: 'pointer', color: '#2563eb' }}>Ver respuesta de auth</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
{JSON.stringify(authDebug.raw ?? {}, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
  if (loading) return <p style={{ textAlign: 'center', padding: 24 }}>Cargando…</p>;

  const backTo = () => {
    if (back === 'study') navigate(`/admin/studies/${studyId}`);
    else navigate(`/admin/studies/${studyId}`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 18px 80px' }}>
      <button onClick={backTo} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}>
        ← Volver
      </button>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{inv?.candidate_name?.trim() || inv?.candidate_email || `Invitación #${invitationId}`}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {inv?.candidate_email || '—'} · {inv?.candidate_phone || '—'} · Estado: {inv?.status || '—'} · Vence: {formatDate(inv?.code_expires_at)}
            </div>
          </div>
          <button type="button" onClick={loadAll} disabled={formLoading} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', cursor: formLoading ? 'not-allowed' : 'pointer' }}>
            {formLoading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
          {tabs.map((t, idx) => (
            <button
              key={t}
              onClick={() => setTabIdx(idx)}
              style={{
                padding: '8px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                background: tabIdx === idx ? '#111' : '#fff',
                color: tabIdx === idx ? '#fff' : '#111',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          {currentTab === 'Uso interno (analista)' ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ border: '2px solid #1e3a5f', borderRadius: 12, padding: 16, background: '#f8fafc' }}>
                <h3 style={{ margin: '0 0 4px', color: '#1e3a5f', fontSize: 16 }}>USO INTERNO – AGENCIA / EMPRESA</h3>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>No visible para el colaborador</p>

                <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>CONCLUSIONES Y SEMÁFORO</h4>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Conclusiones del analista</label>
                  <textarea value={concNotes} onChange={(e) => setConcNotes(e.target.value)} rows={4} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 13 }}>Resultado de la actualización</p>
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
                <p style={{ margin: '8px 0 12px', fontSize: 12, color: '#475569', fontStyle: 'italic', padding: 10, background: '#e0f2fe', borderRadius: 10 }}>
                  El estatus «Información pendiente de complementar» se refiere exclusivamente a documentación o información administrativa en proceso y no constituye observación negativa sobre el colaborador.
                </p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Observaciones relevantes (si aplica)</label>
                  <textarea value={concObsRel} onChange={(e) => setConcObsRel(e.target.value)} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: 13 }}>Fecha de cierre del estudio</label>
                    <input type="date" value={concFechaCierre} onChange={(e) => setConcFechaCierre(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: 13 }}>Analista responsable</label>
                    <input type="text" value={concAnalista} onChange={(e) => setConcAnalista(e.target.value)} placeholder="Nombre del analista" style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleSaveConclusion} disabled={savingConc} style={{ padding: '10px 14px', background: savingConc ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: savingConc ? 'not-allowed' : 'pointer', fontWeight: 800 }}>
                    {savingConc ? 'Guardando…' : 'Guardar conclusiones'}
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '16px 0' }} />

                <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>VERIFICACIÓN DOMICILIARIA</h4>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Fotografía exterior del domicilio</label>
                  <input type="file" accept="image/*,.pdf,application/pdf" onChange={handlePhotoUpload} />
                  {domPhotoUrl ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{domPhotoUrl.replace(/^.*[/\\]/, '')}</span>
                      <a href={documentDownloadApiUrl(domPhotoUrl)} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 10px', background: '#059669', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>
                        Descargar / Ver
                      </a>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: 13 }}>Fecha de visita</label>
                    <input type="date" value={domVisitDate} onChange={(e) => setDomVisitDate(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: 13 }}>Tipo</label>
                    <select value={domVisitType} onChange={(e) => setDomVisitType(e.target.value === 'referenciada' ? 'referenciada' : 'presencial')} style={{ width: '100%', marginTop: 6, padding: 8, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                      <option value="presencial">Presencial</option>
                      <option value="referenciada">Referenciada</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Notas</label>
                  <textarea value={domNotes} onChange={(e) => setDomNotes(e.target.value)} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={handleSaveDomiciliary} disabled={savingDom} style={{ padding: '10px 14px', background: savingDom ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, cursor: savingDom ? 'not-allowed' : 'pointer', fontWeight: 800 }}>
                    {savingDom ? 'Guardando…' : 'Guardar verificación'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {formLoading ? (
                <p style={{ color: '#6b7280' }}>Cargando…</p>
              ) : (() => {
                const sectionData = formData[currentTab] || {};
                const entries = Object.entries(sectionData);
                if (entries.length === 0) return <p style={{ color: '#9ca3af' }}>—</p>;
                const isDocumentosSection = currentTab.toLowerCase() === 'documentos';
                return (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {entries.map(([k, v]) => {
                      const valueStr = v != null && String(v).trim() !== '' ? String(v) : '';
                      const isDocField = isDocumentosSection && DOCUMENT_FIELD_KEYS.includes(k);
                      const isStoredPdf =
                        valueStr &&
                        (k.endsWith('_pdf') || k === 'identificacion_oficial_pdf' || /^cap_doc_/.test(k)) &&
                        !/^https?:\/\//i.test(valueStr);
                      const isStoredImage = valueStr && k === 'foto_participante' && !/^https?:\/\//i.test(valueStr);
                      const isStoredAttachment = valueStr && /_admin_respaldo$/.test(k) && !/^https?:\/\//i.test(valueStr);
                      const downloadUrl = (isDocField && valueStr) || isStoredPdf || isStoredImage || isStoredAttachment ? documentDownloadApiUrl(valueStr) : '';
                      return (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, minWidth: 220 }}>{formatFieldLabel(k)}:</span>
                          {downloadUrl ? (
                            <>
                              <span style={{ color: '#6b7280', fontSize: 13 }}>{valueStr.replace(/^.*[/\\]/, '')}</span>
                              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download style={{ padding: '6px 12px', background: '#059669', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>
                                Descargar
                              </a>
                            </>
                          ) : (
                            <span>{valueStr || '—'}</span>
                          )}
                        </div>
                      );
                    })}

                    {currentTab === 'Historia Laboral' && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: 14 }}>Notas del analista (referencias laborales)</h4>
                          <button type="button" onClick={() => setHlAdminOpen((s) => !s)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                            {hlAdminOpen ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        {hlAdminOpen && (
                          <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                            {(() => {
                              const hl = sectionData as Record<string, string>;
                              const filled = (prefix: string): boolean => {
                                const candidates = Object.entries(hl).filter(([k, v]) => k.startsWith(prefix) && v != null && String(v).trim() !== '');
                                // ignore admin-only fields if present in sectionData
                                return candidates.some(([k]) => !/_admin_/.test(k));
                              };
                              const antCount = Math.max(
                                1,
                                Math.min(
                                  3,
                                  parseInt(String(hl['hl_ant_count'] || ''), 10) ||
                                    // fallback: infer by checking if each block has at least one value
                                    ([0, 1, 2].filter((i) => filled(`hl_ant_${i}_`)).length || 1)
                                )
                              );
                              const showActual = filled('hl_actual_');
                              const showAdic = String(hl['hl_empleos_adicionales'] || '').trim() === 'si';
                              const adicCount = showAdic ? Math.max(1, Math.min(3, [0, 1, 2].filter((i) => filled(`hl_adic_${i}_`)).length || 1)) : 0;

                              const blocks: { label: string; prefix: string }[] = [];
                              if (showActual) blocks.push({ label: 'Empleo actual', prefix: 'hl_actual' });
                              for (let i = 0; i < antCount; i++) blocks.push({ label: `Empleo anterior ${i + 1}`, prefix: `hl_ant_${i}` });
                              for (let i = 0; i < adicCount; i++) blocks.push({ label: `Empleo adicional ${i + 1}`, prefix: `hl_adic_${i}` });

                              // If no data at all, don't show any blocks (avoid clutter)
                              return blocks;
                            })().map(({ label, prefix }) => {
                              const k1 = `${prefix}_admin_comentarios_entrevistado`;
                              const k2 = `${prefix}_admin_observaciones_internas`;
                              const k3 = `${prefix}_admin_respaldo`;
                              return (
                                <div key={prefix} style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>{label}</div>
                                  <div style={{ display: 'grid', gap: 10 }}>
                                    <div>
                                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: 12 }}>ESPACIO 1: Comentarios del entrevistado</label>
                                      <textarea value={hlAdminFields[k1] ?? ''} onChange={(e) => setHlAdminFields((p) => ({ ...p, [k1]: e.target.value }))} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: 12 }}>ESPACIO 2: Observaciones internas Working</label>
                                      <textarea value={hlAdminFields[k2] ?? ''} onChange={(e) => setHlAdminFields((p) => ({ ...p, [k2]: e.target.value }))} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 12 }}>SUBIR IMAGEN O PDF</label>
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
                                          <span style={{ display: 'inline-block', padding: '8px 12px', background: hlAdminUploadingKey === k3 ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 10, fontSize: 12, fontWeight: 800 }}>
                                            {hlAdminUploadingKey === k3 ? 'Subiendo…' : 'Adjuntar'}
                                          </span>
                                        </label>
                                        {hlAdminFields[k3] ? (
                                          <a href={documentDownloadApiUrl(hlAdminFields[k3])} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#059669', fontWeight: 800, textDecoration: 'none' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button type="button" onClick={saveHistoriaLaboralAdmin} disabled={hlAdminSaving} style={{ padding: '10px 14px', background: hlAdminSaving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: hlAdminSaving ? 'not-allowed' : 'pointer', fontWeight: 900 }}>
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
          )}
        </div>
      </div>

      {toast ? (
        <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: 12, fontSize: 13 }}>
          {toast}
          <button onClick={() => setToast(null)} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}

