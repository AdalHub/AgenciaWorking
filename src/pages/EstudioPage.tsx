import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

const NOTICE_VERSION = 'v2025-1';
const API = '/api';

// Full AVISO DE PRIVACIDAD INTEGRAL — HR Capital Working (versión resumida para estudio socioeconómico)
const AVISO_PRIVACIDAD = `
AVISO DE PRIVACIDAD INTEGRAL — HR Capital Working

En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, HR Capital Working (en adelante “el Responsable”), con domicilio en [domicilio], pone a su disposición el presente Aviso de Privacidad Integral.

1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE
El responsable del tratamiento de sus datos personales es HR Capital Working, quien los recabará y tratará conforme a los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad.

2. DATOS PERSONALES QUE RECABAMOS
Para la realización de estudios socioeconómicos y verificación de antecedentes, recabamos: nombre completo, CURP, fecha y lugar de nacimiento, nacionalidad, estado civil, datos de contacto (correo, teléfono), domicilio, historial académico y laboral, situación económica, referencias personales y familiares, así como documentación de identificación y comprobantes. En visitas domiciliarias podremos recabar imágenes del domicilio cuando sea necesario.

3. FINALIDADES
Sus datos serán utilizados para: (a) realizar el estudio socioeconómico solicitado por la empresa que requiere la evaluación; (b) elaborar informes y dictámenes que serán entregados a dicha empresa; (c) dar cumplimiento a obligaciones legales y (d) en su caso, transferir sus datos a la empresa solicitante del estudio, con su consentimiento.

4. TRANSFERENCIAS
Con su consentimiento expreso, sus datos podrán ser transferidos a la empresa que solicitó el estudio socioeconómico, únicamente para los fines relacionados con la relación laboral o de contratación. No realizamos transferencias que requieran su consentimiento que no estén contempladas en este aviso.

5. MEDIDAS DE SEGURIDAD
Mantenemos medidas administrativas, técnicas y físicas para proteger sus datos contra daño, pérdida, alteración, destrucción o uso no autorizado.

6. DERECHOS ARCO
Usted tiene derecho a acceder, rectificar y cancelar sus datos personales, así como a oponerse al tratamiento de los mismos. Para ello deberá enviar una solicitud a [correo de contacto] con los requisitos previstos en la LFPDPPP. El Responsable contará con 20 días hábiles para atender su solicitud.

7. REVOCACIÓN DEL CONSENTIMIENTO
Usted puede revocar el consentimiento que nos ha otorgado en cualquier momento. Cabe señalar que no en todos los casos podremos atender su solicitud o concluir el uso de forma inmediata, por existir obligación legal de conservar sus datos.

8. MODIFICACIONES
Nos reservamos el derecho de modificar el presente Aviso de Privacidad. Cualquier cambio será notificado a través de nuestros canales habituales o en esta misma página.

Fecha de última actualización: 2025. Versión del aviso: ${NOTICE_VERSION}.
`;

type Invitation = {
  id: number;
  study_id: number;
  candidate_email?: string;
  candidate_name?: string;
  candidate_phone?: string;
  unique_code: string;
  code_expires_at?: string;
  status: string;
  study?: { id: number; company_name?: string; study_type?: string; status: string };
};

type FormDataBySection = Record<string, Record<string, string>>;

const SECTIONS = [
  'Datos Personales',
  'Datos de Contacto',
  'Domicilio Actual',
  'Historial Académico',
  'Historial Laboral',
  'Situación Económica',
  'Referencias Familiares',
  'Documentos',
];

export default function EstudioPage() {
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get('codigo') ?? '';

  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<'invalid' | 'cancelado' | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormDataBySection>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [privacyCheck1, setPrivacyCheck1] = useState(false);
  const [privacyCheck2, setPrivacyCheck2] = useState(false);
  const [privacySubmitting, setPrivacySubmitting] = useState(false);

  const isInvitationCompleted = invitation?.status === 'completed';

  // Load invitation by code
  useEffect(() => {
    if (!codigo.trim()) {
      setLoading(false);
      setErrorState('invalid');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErrorState(null);
    fetch(`${API}/studies.php?action=get_invitation_by_code&code=${encodeURIComponent(codigo)}`)
      .then((r) => {
        if (r.status === 404) {
          setErrorState('invalid');
          return null;
        }
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then((data: Invitation | null) => {
        if (cancelled) return;
        if (!data) {
          setInvitation(null);
          setLoading(false);
          return;
        }
        setInvitation(data);
        if (data.study?.status === 'cancelado') {
          setErrorState('cancelado');
          setLoading(false);
          return;
        }
        if (data.status === 'completed') {
          setCompleted(true);
          setLoading(false);
          return;
        }
        return fetch(`${API}/studies.php?action=check_privacy&invitation_id=${data.id}&code=${encodeURIComponent(codigo)}`).then((res) => ({ res, invId: data.id }));
      })
      .then((payload) => {
        if (cancelled || !payload) return;
        const { res: r, invId } = payload;
        if (!r.ok) throw new Error('Privacy check failed');
        return r.json().then((data: { accepted: boolean }) => ({ data, invId }));
      })
      .then((payload?: { data: { accepted: boolean }; invId: number }) => {
        if (cancelled) return;
        if (!payload) {
          setLoading(false);
          return;
        }
        setPrivacyAccepted(payload.data.accepted);
        if (payload.data.accepted) {
          return fetch(`${API}/studies.php?action=get_form_data&invitation_id=${payload.invId}&code=${encodeURIComponent(codigo)}`);
        }
        setLoading(false);
      })
      .then((r) => {
        if (cancelled) return;
        if (r && r.ok) return r.json();
        setLoading(false);
      })
      .then((data?: FormDataBySection) => {
        if (cancelled) return;
        if (data && typeof data === 'object') setFormData(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setErrorState('invalid');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [codigo]);

  // When privacy accepted, load form data (invitation already set)
  useEffect(() => {
    if (!privacyAccepted || !invitation || invitation.status === 'completed') return;
    fetch(`${API}/studies.php?action=get_form_data&invitation_id=${invitation.id}&code=${encodeURIComponent(codigo)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: FormDataBySection) => {
        if (data && typeof data === 'object') setFormData(data);
      })
      .catch(() => {});
  }, [privacyAccepted, invitation?.id, codigo]);

  const updateField = useCallback((section: string, key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  }, []);

  const getField = (section: string, key: string): string => {
    return formData[section]?.[key] ?? '';
  };

  const getRequiredCount = (): { filled: number; total: number } => {
    let filled = 0;
    let total = 0;
    const sec = SECTIONS[sectionIndex];
    if (sec === 'Datos Personales') {
      const keys = ['nombre_completo', 'curp', 'fecha_nacimiento', 'lugar_nacimiento', 'nacionalidad', 'estado_civil'];
      keys.forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
    } else if (sec === 'Datos de Contacto') {
      ['correo_personal', 'telefono_movil'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
    } else if (sec === 'Domicilio Actual') {
      ['domicilio_calle', 'domicilio_colonia', 'domicilio_ciudad', 'domicilio_estado', 'domicilio_cp', 'tiempo_residencia', 'tipo_vivienda'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
    } else if (sec === 'Historial Académico') {
      const acad = formData[sec] || {};
      const n = Math.max(1, Math.ceil(Object.keys(acad).filter((k) => k.startsWith('0_')).length / 6) || 1);
      for (let i = 0; i < n; i++) {
        total += 3;
        if ((acad[`${i}_nivel_educativo`] ?? '').trim()) filled++;
        if ((acad[`${i}_institucion`] ?? '').trim()) filled++;
        if ((acad[`${i}_fecha_inicio_edu`] ?? '').trim()) filled++;
      }
    } else if (sec === 'Historial Laboral') {
      const lab = formData[sec] || {};
      const keys = Object.keys(lab).filter((k) => k.endsWith('_empresa_nombre'));
      const n = Math.max(1, keys.length);
      for (let i = 0; i < n; i++) {
        total += 2;
        if ((lab[`${i}_empresa_nombre`] ?? '').trim()) filled++;
        if ((lab[`${i}_puesto`] ?? '').trim()) filled++;
        if ((lab[`${i}_fecha_inicio_lab`] ?? '').trim()) filled++;
        const actual = (lab[`${i}_empleo_actual`] ?? '') === '1' || (lab[`${i}_empleo_actual`] ?? '') === 'true';
        if (!actual) { total++; if ((lab[`${i}_nombre_supervisor`] ?? '').trim()) filled++; }
      }
    } else if (sec === 'Situación Económica') {
      ['ingreso_mensual', 'egresos_mensuales'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
    } else if (sec === 'Referencias Familiares') {
      const ref = formData[sec] || {};
      const n = Math.max(2, Math.ceil(Object.keys(ref).filter((k) => k.endsWith('_ref_nombre')).length) || 2);
      for (let i = 0; i < Math.min(n, 5); i++) {
        total += 3;
        if ((ref[`${i}_ref_nombre`] ?? '').trim()) filled++;
        if ((ref[`${i}_ref_parentesco`] ?? '').trim()) filled++;
        if ((ref[`${i}_ref_telefono`] ?? '').trim()) filled++;
      }
    } else if (sec === 'Documentos') {
      ['ine_identificacion', 'curp_documento', 'comprobante_domicilio'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
    }
    return { filled, total };
  };

  const currentSectionRequiredFilled = (): boolean => {
    const { filled, total } = getRequiredCount();
    return total === 0 || filled === total;
  };

  const progressPct = (): number => {
    let filled = 0;
    let total = 0;
    SECTIONS.forEach((sec) => {
      if (sec === 'Datos Personales') {
        ['nombre_completo', 'curp', 'fecha_nacimiento', 'lugar_nacimiento', 'nacionalidad', 'estado_civil'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
      } else if (sec === 'Datos de Contacto') {
        ['correo_personal', 'telefono_movil'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
      } else if (sec === 'Domicilio Actual') {
        ['domicilio_calle', 'domicilio_colonia', 'domicilio_ciudad', 'domicilio_estado', 'domicilio_cp', 'tiempo_residencia', 'tipo_vivienda'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
      } else if (sec === 'Historial Académico') {
        const acad = formData[sec] || {};
        const n = Math.max(1, Math.ceil(Object.keys(acad).filter((k) => k.startsWith('0_')).length / 6) || 1);
        for (let i = 0; i < n; i++) {
          total += 3;
          if ((acad[`${i}_nivel_educativo`] ?? '').trim()) filled++;
          if ((acad[`${i}_institucion`] ?? '').trim()) filled++;
          if ((acad[`${i}_fecha_inicio_edu`] ?? '').trim()) filled++;
        }
      } else if (sec === 'Historial Laboral') {
        const lab = formData[sec] || {};
        const keys = Object.keys(lab).filter((k) => k.endsWith('_empresa_nombre'));
        const n = Math.max(1, keys.length);
        for (let i = 0; i < n; i++) {
          total += 2;
          if ((lab[`${i}_empresa_nombre`] ?? '').trim()) filled++;
          if ((lab[`${i}_puesto`] ?? '').trim()) filled++;
          if ((lab[`${i}_fecha_inicio_lab`] ?? '').trim()) filled++;
          const actual = (lab[`${i}_empleo_actual`] ?? '') === '1' || (lab[`${i}_empleo_actual`] ?? '') === 'true';
          if (!actual) { total++; if ((lab[`${i}_nombre_supervisor`] ?? '').trim()) filled++; }
        }
      } else if (sec === 'Situación Económica') {
        ['ingreso_mensual', 'egresos_mensuales'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
      } else if (sec === 'Referencias Familiares') {
        const ref = formData[sec] || {};
        const n = Math.max(2, Math.ceil(Object.keys(ref).filter((k) => k.endsWith('_ref_nombre')).length) || 2);
        for (let i = 0; i < Math.min(n, 5); i++) {
          total += 3;
          if ((ref[`${i}_ref_nombre`] ?? '').trim()) filled++;
          if ((ref[`${i}_ref_parentesco`] ?? '').trim()) filled++;
          if ((ref[`${i}_ref_telefono`] ?? '').trim()) filled++;
        }
      } else if (sec === 'Documentos') {
        ['ine_identificacion', 'curp_documento', 'comprobante_domicilio'].forEach((k) => { total++; if ((getField(sec, k) ?? '').trim()) filled++; });
      }
    });
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  };

  const buildBatchFields = (): { section: string; field_key: string; field_value: string }[] => {
    const out: { section: string; field_key: string; field_value: string }[] = [];
    Object.entries(formData).forEach(([section, fields]) => {
      Object.entries(fields).forEach(([key, value]) => {
        out.push({ section, field_key: key, field_value: value ?? '' });
      });
    });
    return out;
  };

  const handleSaveDraft = useCallback(() => {
    if (!codigo || !invitation) return;
    setSaving(true);
    const fields = buildBatchFields();
    fetch(`${API}/studies.php?action=save_form_data_batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unique_code: codigo, fields }),
    })
      .then((r) => r.json())
      .then(() => {
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 3000);
      })
      .finally(() => setSaving(false));
  }, [codigo, invitation, formData]);

  const handlePrivacyAccept = useCallback(() => {
    if (!codigo || !privacyCheck1 || !privacyCheck2) return;
    setPrivacySubmitting(true);
    fetch(`${API}/studies.php?action=privacy_accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unique_code: codigo, notice_version: NOTICE_VERSION }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => setPrivacyAccepted(true))
      .finally(() => setPrivacySubmitting(false));
  }, [codigo, privacyCheck1, privacyCheck2]);

  const handleFinalSubmit = useCallback(() => {
    if (!codigo || !invitation) return;
    setSubmitting(true);
    const fields = buildBatchFields();
    fetch(`${API}/studies.php?action=save_form_data_batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unique_code: codigo, fields }),
    })
      .then((r) => r.json())
      .then(() =>
        fetch(`${API}/studies.php?action=update_invitation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unique_code: codigo, status: 'completed' }),
        })
      )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => {
        setShowFinalConfirm(false);
        setCompleted(true);
      })
      .finally(() => setSubmitting(false));
  }, [codigo, invitation, formData]);

  const uploadFile = (file: File, documentType: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${API}/upload.php`, { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((data) => {
        const url = data?.url ?? '';
        if (!url) throw new Error('No URL');
        return fetch(`${API}/studies.php?action=save_document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unique_code: codigo, document_type: documentType, file_path: url, file_size: file.size }),
        }).then((r) => r.json()).then(() => url);
      });
  };

  const uploadOnly = (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${API}/upload.php`, { method: 'POST', body: fd })
      .then((r) => r.json())
      .then((data) => data?.url ?? '');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (errorState === 'invalid') {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 12px', color: '#1f2937' }}>Código inválido o expirado</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Verifica que ingresaste el código correctamente o contacta a la empresa que solicitó tu evaluación.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (errorState === 'cancelado') {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 12px', color: '#1f2937' }}>Estudio cancelado</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Este estudio ha sido cancelado. Contacta a HR Capital Working para más información.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (completed || isInvitationCompleted) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 520, padding: 40, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32 }}>✓</div>
            <h2 style={{ margin: '0 0 12px', color: '#1f2937' }}>¡Información enviada exitosamente!</h2>
            <p style={{ margin: '0 0 24px', color: '#6b7280' }}>Tu estudio socioeconómico ha sido enviado. La empresa recibirá los resultados a través de HR Capital Working.</p>
            <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: 14 }}><strong>Guarda tu código por si necesitas consultarlo:</strong> <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 4 }}>{codigo}</code></p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (privacyAccepted === false) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 600, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 22 }}>HR Capital Working</h1>
            </div>
            <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Antes de comenzar</h2>
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20, whiteSpace: 'pre-wrap', fontSize: 13 }}>{AVISO_PRIVACIDAD}</div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={privacyCheck1} onChange={(e) => setPrivacyCheck1(e.target.checked)} />
              <span>He leído y acepto el Aviso de Privacidad Integral de HR Capital Working</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={privacyCheck2} onChange={(e) => setPrivacyCheck2(e.target.checked)} />
              <span>Consiento la transferencia de mis datos personales a la empresa solicitante del estudio</span>
            </label>
            <button onClick={handlePrivacyAccept} disabled={!privacyCheck1 || !privacyCheck2 || privacySubmitting} style={{ width: '100%', padding: 12, background: privacyCheck1 && privacyCheck2 ? '#1d4ed8' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 8, cursor: privacyCheck1 && privacyCheck2 ? 'pointer' : 'not-allowed' }}>Continuar</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const sec = SECTIONS[sectionIndex];
  getRequiredCount(); // used by currentSectionRequiredFilled()
  const pct = progressPct();

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 120 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
          {/* Sticky progress */}
          <div style={{ position: 'sticky', top: 72, zIndex: 10, background: '#fff', padding: '12px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{sec}</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>Paso {sectionIndex + 1} de 8</span>
            </div>
            <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#16a34a', borderRadius: 3 }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{pct}% completado (campos requeridos)</p>
          </div>

          {/* Section content */}
          {sec === 'Datos Personales' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Nombre completo *</label><input type="text" value={getField(sec, 'nombre_completo')} onChange={(e) => updateField(sec, 'nombre_completo', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>CURP *</label><input type="text" maxLength={18} value={getField(sec, 'curp')} onChange={(e) => updateField(sec, 'curp', e.target.value.toUpperCase())} style={{ width: '100%', padding: 8, boxSizing: 'border-box', textTransform: 'uppercase' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Fecha de nacimiento *</label><input type="date" value={getField(sec, 'fecha_nacimiento')} onChange={(e) => updateField(sec, 'fecha_nacimiento', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Lugar de nacimiento *</label><input type="text" value={getField(sec, 'lugar_nacimiento')} onChange={(e) => updateField(sec, 'lugar_nacimiento', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Nacionalidad *</label><input type="text" value={getField(sec, 'nacionalidad') || 'Mexicana'} onChange={(e) => updateField(sec, 'nacionalidad', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Estado civil *</label><select value={getField(sec, 'estado_civil')} onChange={(e) => updateField(sec, 'estado_civil', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}><option value="">Selecciona</option>{['Soltero/a', 'Casado/a', 'Unión libre', 'Divorciado/a', 'Viudo/a'].map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Número de dependientes económicos</label><input type="number" min={0} value={getField(sec, 'dependientes_economicos')} onChange={(e) => updateField(sec, 'dependientes_economicos', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            </div>
          )}

          {sec === 'Datos de Contacto' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Correo electrónico personal *</label><input type="email" value={getField(sec, 'correo_personal')} onChange={(e) => updateField(sec, 'correo_personal', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Teléfono móvil *</label><input type="tel" value={getField(sec, 'telefono_movil')} onChange={(e) => updateField(sec, 'telefono_movil', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Teléfono alterno</label><input type="tel" value={getField(sec, 'telefono_alterno')} onChange={(e) => updateField(sec, 'telefono_alterno', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            </div>
          )}

          {sec === 'Domicilio Actual' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Calle y número *</label><input type="text" value={getField(sec, 'domicilio_calle')} onChange={(e) => updateField(sec, 'domicilio_calle', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Colonia *</label><input type="text" value={getField(sec, 'domicilio_colonia')} onChange={(e) => updateField(sec, 'domicilio_colonia', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Ciudad *</label><input type="text" value={getField(sec, 'domicilio_ciudad')} onChange={(e) => updateField(sec, 'domicilio_ciudad', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Estado *</label><input type="text" value={getField(sec, 'domicilio_estado')} onChange={(e) => updateField(sec, 'domicilio_estado', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Código postal *</label><input type="text" maxLength={5} value={getField(sec, 'domicilio_cp')} onChange={(e) => updateField(sec, 'domicilio_cp', e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Tiempo viviendo en este domicilio (ej. 2 años) *</label><input type="text" value={getField(sec, 'tiempo_residencia')} onChange={(e) => updateField(sec, 'tiempo_residencia', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Tipo de vivienda *</label><select value={getField(sec, 'tipo_vivienda')} onChange={(e) => updateField(sec, 'tipo_vivienda', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}><option value="">Selecciona</option>{['Propia', 'Rentada', 'Familiar', 'Otro'].map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
              {getField(sec, 'tipo_vivienda') === 'Rentada' && <div><label style={{ display: 'block', marginBottom: 4 }}>Renta mensual (si aplica)</label><input type="number" value={getField(sec, 'renta_mensual')} onChange={(e) => updateField(sec, 'renta_mensual', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>}
            </div>
          )}

          {sec === 'Historial Académico' && <SectionAcademico formData={formData} section={sec} updateField={updateField} getField={getField} uploadOnly={uploadOnly} />}
          {sec === 'Historial Laboral' && <SectionLaboral formData={formData} section={sec} updateField={updateField} getField={getField} />}

          {sec === 'Situación Económica' && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Ingreso mensual aproximado *</label><input type="number" value={getField(sec, 'ingreso_mensual')} onChange={(e) => updateField(sec, 'ingreso_mensual', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Egresos mensuales aproximados *</label><input type="number" value={getField(sec, 'egresos_mensuales')} onChange={(e) => updateField(sec, 'egresos_mensuales', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>¿Tienes ahorros?</label><select value={getField(sec, 'ahorros')} onChange={(e) => updateField(sec, 'ahorros', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}><option value="">Selecciona</option>{['Sí', 'No', 'Prefiero no decir'].map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>¿Tienes deudas activas?</label><select value={getField(sec, 'deudas')} onChange={(e) => updateField(sec, 'deudas', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}><option value="">Selecciona</option>{['Sí', 'No', 'Prefiero no decir'].map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
              {getField(sec, 'deudas') === 'Sí' && <div><label style={{ display: 'block', marginBottom: 4 }}>Monto aproximado de deudas</label><input type="number" value={getField(sec, 'monto_deudas')} onChange={(e) => updateField(sec, 'monto_deudas', e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>}
            </div>
          )}

          {sec === 'Referencias Familiares' && <SectionReferencias formData={formData} section={sec} updateField={updateField} getField={getField} />}

          {sec === 'Documentos' && <SectionDocumentos getField={getField} updateField={updateField} section={sec} codigo={codigo} uploadFile={uploadFile} />}

          {/* Bottom nav */}
          <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 0', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              {sectionIndex > 0 ? <button type="button" onClick={() => setSectionIndex((i) => i - 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>← Anterior</button> : null}
            </div>
            <button type="button" onClick={handleSaveDraft} disabled={saving} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>{savedFeedback ? 'Guardado ✓' : 'Guardar y continuar después'}</button>
            <div>
              {sectionIndex < SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setSectionIndex((i) => i + 1)} disabled={!currentSectionRequiredFilled()} style={{ padding: '8px 16px', background: currentSectionRequiredFilled() ? '#1d4ed8' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 6, cursor: currentSectionRequiredFilled() ? 'pointer' : 'not-allowed' }}>Siguiente →</button>
              ) : (
                <button type="button" onClick={() => setShowFinalConfirm(true)} disabled={!currentSectionRequiredFilled()} style={{ padding: '8px 16px', background: currentSectionRequiredFilled() ? '#16a34a' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 6, cursor: currentSectionRequiredFilled() ? 'pointer' : 'not-allowed' }}>Finalizar y enviar</button>
              )}
            </div>
          </div>
        </div>
      </main>

      {showFinalConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px' }}>¿Listo para enviar?</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>Una vez que envíes tu información no podrás modificarla. Asegúrate de que todo esté correcto.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowFinalConfirm(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Revisar información</button>
              <button onClick={handleFinalSubmit} disabled={submitting} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Confirmar envío</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function SectionAcademico({ formData, section, updateField, getField, uploadOnly }: { formData: FormDataBySection; section: string; updateField: (s: string, k: string, v: string) => void; getField: (s: string, k: string) => string; uploadOnly: (file: File) => Promise<string> }) {
  const acad = formData[section] || {};
  const n = Math.max(1, Math.ceil(Object.keys(acad).filter((k) => /^\d+_nivel_educativo/.test(k)).length) || 1);
  const [count, setCount] = useState(n);
  const [uploadingCert, setUploadingCert] = useState<number | null>(null);
  const niveles = ['Primaria', 'Secundaria', 'Preparatoria/Bachillerato', 'Técnico', 'Licenciatura', 'Maestría', 'Doctorado', 'Otro'];

  const handleCertUpload = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.size > 5 * 1024 * 1024) return;
    setUploadingCert(i);
    uploadOnly(f).then((url) => { updateField(section, `${i}_certificado_upload`, url); setUploadingCert(null); }).catch(() => setUploadingCert(null));
    e.target.value = '';
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px' }}>Grado {i + 1}</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Nivel educativo *</label><select value={getField(section, `${i}_nivel_educativo`)} onChange={(e) => updateField(section, `${i}_nivel_educativo`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}><option value="">Selecciona</option>{niveles.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Institución educativa *</label><input type="text" value={getField(section, `${i}_institucion`)} onChange={(e) => updateField(section, `${i}_institucion`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label style={{ display: 'block', marginBottom: 4 }}>Fecha de inicio *</label><input type="date" value={getField(section, `${i}_fecha_inicio_edu`)} onChange={(e) => updateField(section, `${i}_fecha_inicio_edu`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div><div><label style={{ display: 'block', marginBottom: 4 }}>Fecha de término</label><input type="date" value={getField(section, `${i}_fecha_fin_edu`)} onChange={(e) => updateField(section, `${i}_fecha_fin_edu`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={(getField(section, `${i}_completado`) ?? '') === '1' || (getField(section, `${i}_completado`) ?? '') === 'true'} onChange={(e) => updateField(section, `${i}_completado`, e.target.checked ? '1' : '')} />Completado / Titulado</label>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Subir constancia o título (.pdf, .jpg, .png, máx 5MB)</label><input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleCertUpload(i, e)} disabled={uploadingCert !== null} /><span style={{ marginLeft: 8, fontSize: 12 }}>{getField(section, `${i}_certificado_upload`) ? 'Subido' : ''}</span></div>
          </div>
        </div>
      ))}
      {count < 10 && <button type="button" onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Agregar otro grado</button>}
    </div>
  );
}

function parseDate(s: string): number {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
  return new Date(s).getTime();
}

function SectionLaboral({ formData, section, updateField, getField }: { formData: FormDataBySection; section: string; updateField: (s: string, k: string, v: string) => void; getField: (s: string, k: string) => string }) {
  const lab = formData[section] || {};
  const n = Math.max(1, Math.ceil(Object.keys(lab).filter((k) => k.endsWith('_empresa_nombre')).length) || 1);
  const [count, setCount] = useState(n);

  const entries: { start: number; end: number; actual: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const start = parseDate(getField(section, `${i}_fecha_inicio_lab`));
    const endStr = getField(section, `${i}_fecha_fin_lab`);
    const actual = (getField(section, `${i}_empleo_actual`) ?? '') === '1' || (getField(section, `${i}_empleo_actual`) ?? '') === 'true';
    const end = actual ? Date.now() : parseDate(endStr);
    if (!isNaN(start)) entries.push({ start, end: isNaN(end) ? Date.now() : end, actual });
  }
  const now = Date.now();
  const yearsCovered = entries.length ? (now - Math.min(...entries.map((e) => e.start))) / (365.25 * 24 * 60 * 60 * 1000) : 0;

  let overlapWarning = false;
  for (let a = 0; a < entries.length; a++) {
    for (let b = a + 1; b < entries.length; b++) {
      if (entries[a].actual || entries[b].actual) continue;
      if (entries[a].start < entries[b].end && entries[b].start < entries[a].end) overlapWarning = true;
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Cubre al menos los últimos 10 años</p>
      {entries.length > 0 && (
        <p style={{ margin: 0, fontSize: 13 }}>
          {yearsCovered >= 10 ? <span style={{ color: '#16a34a' }}>✓ Cobertura: {yearsCovered.toFixed(1)} años</span> : <span style={{ color: '#d97706' }}>⚠ Cobertura: {yearsCovered.toFixed(1)} años (recomendado 10+)</span>}
        </p>
      )}
      {overlapWarning && (
        <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: 13 }}>Las fechas de estos empleos se superponen. Verifica que sean correctas.</div>
      )}
      {Array.from({ length: count }, (_, i) => {
        const actual = (getField(section, `${i}_empleo_actual`) ?? '') === '1' || (getField(section, `${i}_empleo_actual`) ?? '') === 'true';
        return (
          <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <h4 style={{ margin: '0 0 12px' }}>Empleo {i + 1}</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Nombre de la empresa *</label><input type="text" value={getField(section, `${i}_empresa_nombre`)} onChange={(e) => updateField(section, `${i}_empresa_nombre`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Puesto / Cargo *</label><input type="text" value={getField(section, `${i}_puesto`)} onChange={(e) => updateField(section, `${i}_puesto`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label style={{ display: 'block', marginBottom: 4 }}>Fecha de inicio *</label><input type="date" value={getField(section, `${i}_fecha_inicio_lab`)} onChange={(e) => updateField(section, `${i}_fecha_inicio_lab`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div><div style={{ display: actual ? 'none' : 'block' }}><label style={{ display: 'block', marginBottom: 4 }}>Fecha de término</label><input type="date" value={getField(section, `${i}_fecha_fin_lab`)} onChange={(e) => updateField(section, `${i}_fecha_fin_lab`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={actual} onChange={(e) => { updateField(section, `${i}_empleo_actual`, e.target.checked ? '1' : ''); if (e.target.checked) { updateField(section, `${i}_fecha_fin_lab`, ''); updateField(section, `${i}_motivo_salida`, ''); updateField(section, `${i}_nombre_supervisor`, ''); updateField(section, `${i}_telefono_supervisor`, ''); updateField(section, `${i}_correo_supervisor`, ''); } }} />Es mi empleo actual</label>
              <div style={{ display: actual ? 'none' : 'block' }}><label style={{ display: 'block', marginBottom: 4 }}>Salario mensual (aproximado)</label><input type="number" value={getField(section, `${i}_salario`)} onChange={(e) => updateField(section, `${i}_salario`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              <div style={{ display: actual ? 'none' : 'block' }}><label style={{ display: 'block', marginBottom: 4 }}>Motivo de salida</label><input type="text" value={getField(section, `${i}_motivo_salida`)} onChange={(e) => updateField(section, `${i}_motivo_salida`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
              {actual ? <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>No se solicitarán referencias de tu empleo actual</p> : <div><label style={{ display: 'block', marginBottom: 4 }}>Nombre del supervisor *</label><input type="text" value={getField(section, `${i}_nombre_supervisor`)} onChange={(e) => updateField(section, `${i}_nombre_supervisor`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>}
              <div style={{ display: actual ? 'none' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><div><label style={{ display: 'block', marginBottom: 4 }}>Teléfono del supervisor</label><input type="tel" value={getField(section, `${i}_telefono_supervisor`)} onChange={(e) => updateField(section, `${i}_telefono_supervisor`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div><div><label style={{ display: 'block', marginBottom: 4 }}>Correo del supervisor</label><input type="email" value={getField(section, `${i}_correo_supervisor`)} onChange={(e) => updateField(section, `${i}_correo_supervisor`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div></div>
              <div><label style={{ display: 'block', marginBottom: 4 }}>Observaciones</label><textarea value={getField(section, `${i}_observaciones_lab`)} onChange={(e) => updateField(section, `${i}_observaciones_lab`, e.target.value)} rows={2} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            </div>
          </div>
        );
      })}
      {count < 15 && <button type="button" onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Agregar otro empleo</button>}
    </div>
  );
}

function SectionReferencias({ formData, section, updateField, getField }: { formData: FormDataBySection; section: string; updateField: (s: string, k: string, v: string) => void; getField: (s: string, k: string) => string }) {
  const ref = formData[section] || {};
  const n = Math.max(2, Math.min(5, Math.ceil(Object.keys(ref).filter((k) => k.endsWith('_ref_nombre')).length) || 2));
  const [count, setCount] = useState(n);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <p style={{ margin: 0, fontSize: 13 }}>Mínimo 2 referencias. Máximo 5.</p>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h4 style={{ margin: '0 0 12px' }}>Referencia {i + 1}</h4>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Nombre completo *</label><input type="text" value={getField(section, `${i}_ref_nombre`)} onChange={(e) => updateField(section, `${i}_ref_nombre`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Parentesco o relación *</label><input type="text" value={getField(section, `${i}_ref_parentesco`)} onChange={(e) => updateField(section, `${i}_ref_parentesco`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Teléfono *</label><input type="tel" value={getField(section, `${i}_ref_telefono`)} onChange={(e) => updateField(section, `${i}_ref_telefono`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
            <div><label style={{ display: 'block', marginBottom: 4 }}>Años de conocerse</label><input type="number" value={getField(section, `${i}_ref_anos_conocido`)} onChange={(e) => updateField(section, `${i}_ref_anos_conocido`, e.target.value)} style={{ width: '100%', padding: 8, boxSizing: 'border-box' }} /></div>
          </div>
        </div>
      ))}
      {count < 5 && <button type="button" onClick={() => setCount((c) => c + 1)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Agregar otra referencia</button>}
    </div>
  );
}

const DOC_TYPES = [
  { key: 'ine_identificacion', label: 'INE / Identificación oficial *' },
  { key: 'curp_documento', label: 'CURP (documento) *' },
  { key: 'comprobante_domicilio', label: 'Comprobante de domicilio *' },
  { key: 'ultimo_recibo_nomina', label: 'Último recibo de nómina' },
  { key: 'otros_documentos', label: 'Otros documentos (opcional)' },
];

function SectionDocumentos({ getField, updateField, section, uploadFile }: { getField: (s: string, k: string) => string; updateField: (s: string, k: string, v: string) => void; section: string; codigo?: string; uploadFile: (file: File, docType: string) => Promise<string> }) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setUploading(docType);
    uploadFile(file, docType)
      .then((url) => updateField(section, docType, url))
      .finally(() => setUploading(null));
    e.target.value = '';
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {DOC_TYPES.map(({ key, label }) => {
        const value = getField(section, key);
        const isUploaded = (value ?? '').trim() !== '';
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ flex: '1 1 200px' }}>{label}</span>
            <span style={{ padding: '4px 8px', borderRadius: 6, background: isUploaded ? '#d1fae5' : '#f3f4f6', fontSize: 12 }}>{isUploaded ? 'Subido' : 'Pendiente'}</span>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={(e) => handleUpload(key, e)} disabled={!!uploading} />
              <span style={{ padding: '6px 12px', background: '#1d4ed8', color: '#fff', borderRadius: 6, fontSize: 14 }}>{uploading === key ? 'Subiendo...' : 'Subir'}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
