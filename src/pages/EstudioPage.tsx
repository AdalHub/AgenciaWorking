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

/** Actualización de estudio socioeconómico (Personal Activo) */
const SECTIONS = [
  'Formato Actualización',
  'Autorización Actualización',
  'Datos Generales e Identificación',
  'Domicilio Actual Actualización',
  'Situación Laboral Actual',
  'Ingresos y Situación Económica',
  'Escolaridad y Capacitación',
  'Bienestar y Antecedentes Legales',
  'Carta Penal Observaciones y Declaración',
] as const;
const SECTION_COUNT = SECTIONS.length;

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

  // Success screen: user was scrolled down on long form — jump to top so header + message are visible
  useEffect(() => {
    if (!completed && !isInvitationCompleted) return;
    const goTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    goTop();
    const t = requestAnimationFrame(() => {
      goTop();
      setTimeout(goTop, 0);
    });
    return () => cancelAnimationFrame(t);
  }, [completed, isInvitationCompleted]);

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

  useEffect(() => {
    if (!privacyAccepted || !invitation) return;
    const day = new Date().toISOString().slice(0, 10);
    const s1 = 'Formato Actualización';
    const s2 = 'Autorización Actualización';
    setFormData((prev) => {
      const next = { ...prev };
      if (!next[s1]) next[s1] = {};
      if (!next[s2]) next[s2] = {};
      const c1 = { ...next[s1] };
      const c2 = { ...next[s2] };
      if (!c1.empresa?.trim() && invitation.study?.company_name) c1.empresa = invitation.study.company_name;
      if (!c1.nombre_colaborador?.trim() && invitation.candidate_name) c1.nombre_colaborador = invitation.candidate_name;
      if (!c1.fecha_actualizacion?.trim()) c1.fecha_actualizacion = day;
      if (!c2.auth_fecha?.trim()) c2.auth_fecha = day;
      if (!c2.auth_nombre_declaracion?.trim() && invitation.candidate_name) c2.auth_nombre_declaracion = invitation.candidate_name;
      if (!c2.auth_nombre_firma?.trim() && invitation.candidate_name) c2.auth_nombre_firma = invitation.candidate_name;
      next[s1] = c1;
      next[s2] = c2;
      return next;
    });
  }, [privacyAccepted, invitation?.id, invitation?.candidate_name, invitation?.study?.company_name]);

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

  const countSectionProgress = (sec: string): { filled: number; total: number } => {
    let filled = 0;
    let total = 0;
    const req = (k: string) => {
      total++;
      if ((getField(sec, k) ?? '').trim()) filled++;
    };
    const reqYn = (k: string) => {
      total++;
      const v = getField(sec, k);
      if (v === 'si' || v === 'no') filled++;
    };
    if (sec === 'Formato Actualización') {
      ['empresa', 'nombre_colaborador', 'puesto_actual', 'fecha_ingreso_empresa', 'fecha_actualizacion'].forEach(req);
    } else if (sec === 'Autorización Actualización') {
      ['auth_nombre_declaracion', 'auth_nombre_firma', 'auth_firma_texto', 'auth_fecha'].forEach(req);
    } else if (sec === 'Datos Generales e Identificación') {
      reqYn('dg_estado_civil_cambio');
      if (getField(sec, 'dg_estado_civil_cambio') === 'si') req('dg_estado_civil_actual');
      reqYn('dg_tel_cambio');
      if (getField(sec, 'dg_tel_cambio') === 'si') req('dg_tel_actual');
      reqYn('dg_correo_cambio');
      if (getField(sec, 'dg_correo_cambio') === 'si') req('dg_correo_actual');
      reqYn('dg_dependientes');
      if (getField(sec, 'dg_dependientes') === 'si') {
        req('dg_num_dependientes');
        total++;
        const anyDep =
          getField(sec, 'dg_dep_hijos') === '1' ||
          getField(sec, 'dg_dep_conyuge') === '1' ||
          getField(sec, 'dg_dep_padres') === '1' ||
          getField(sec, 'dg_dep_otros') === '1';
        if (anyDep) filled++;
        if (getField(sec, 'dg_dep_otros') === '1') req('dg_dep_otros_texto');
      }
      reqYn('dg_id_cambio');
      total++;
      const idOk =
        getField(sec, 'dg_id_ine') === '1' ||
        getField(sec, 'dg_id_pasaporte') === '1' ||
        (getField(sec, 'dg_id_otra') === '1' && (getField(sec, 'dg_id_otra_texto') ?? '').trim());
      if (idOk) filled++;
      if (getField(sec, 'dg_id_otra') === '1') req('dg_id_otra_texto');
      req('dg_id_numero');
      total++;
      if ((getField(sec, 'identificacion_oficial_pdf') ?? '').trim()) filled++;
    } else if (sec === 'Domicilio Actual Actualización') {
      reqYn('dom_mismo_estudio');
      if (getField(sec, 'dom_mismo_estudio') === 'no') {
        req('dom_completo');
        req('dom_fecha_cambio');
      }
      total++;
      const zonaOk =
        ['residencial', 'popular', 'campestre', 'industrial', 'turistica'].includes(getField(sec, 'dom_zona')) ||
        (getField(sec, 'dom_zona') === 'otro' && (getField(sec, 'dom_zona_otro') ?? '').trim());
      if (zonaOk) filled++;
      total++;
      if (['casa', 'depto', 'condominio', 'infonavit'].includes(getField(sec, 'dom_tipo_vivienda'))) filled++;
      total++;
      const colOk =
        ['privado', 'abierto', 'seguridad'].includes(getField(sec, 'dom_colonia')) ||
        (getField(sec, 'dom_colonia') === 'otro' && (getField(sec, 'dom_colonia_otro') ?? '').trim());
      if (colOk) filled++;
      total++;
      const actOk =
        ['industrial', 'comercial', 'ejidal'].includes(getField(sec, 'dom_actividad')) ||
        (getField(sec, 'dom_actividad') === 'otro' && (getField(sec, 'dom_actividad_otro') ?? '').trim());
      if (actOk) filled++;
      total++;
      const anySrv =
        getField(sec, 'dom_srv_agua') === '1' ||
        getField(sec, 'dom_srv_luz') === '1' ||
        getField(sec, 'dom_srv_alumbrado') === '1' ||
        getField(sec, 'dom_srv_drenaje') === '1' ||
        getField(sec, 'dom_srv_pavimento') === '1' ||
        getField(sec, 'dom_srv_transporte') === '1' ||
        getField(sec, 'dom_srv_verdes') === '1' ||
        getField(sec, 'dom_srv_sin_verdes') === '1';
      if (anySrv) filled++;
      total++;
      if (['publico', 'propio', 'empresa', 'pie', 'otro'].includes(getField(sec, 'dom_transporte'))) filled++;
      total++;
      if (['menos30', '30_60', 'mas60'].includes(getField(sec, 'dom_tiempo_traslado'))) filled++;
      reqYn('dom_cambio_relevante');
      if (getField(sec, 'dom_cambio_relevante') === 'si') req('dom_cambio_relevante_texto');
      total++;
      if (getField(sec, 'dom_visita') === 'autorizo' || getField(sec, 'dom_visita') === 'no_autorizo') filled++;
      if (getField(sec, 'dom_visita') === 'autorizo') {
        req('dom_visita_op1_fecha');
        req('dom_visita_op1_hora');
        req('dom_visita_op2_fecha');
        req('dom_visita_op2_hora');
      }
    } else if (sec === 'Situación Laboral Actual') {
      req('sl_puesto');
      req('sl_area');
      req('sl_antiguedad');
      reqYn('sl_cambios');
      if (getField(sec, 'sl_cambios') === 'si') req('sl_cambios_texto');
    } else if (sec === 'Ingresos y Situación Económica') {
      total++;
      if (['menos10k', '10_20', '20_30', '30_50', 'mas50'].includes(getField(sec, 'ie_rango'))) filled++;
      total++;
      const compNinguno = getField(sec, 'ie_comp_ninguno') === '1';
      const anyComp =
        compNinguno ||
        getField(sec, 'ie_comp_renta') === '1' ||
        getField(sec, 'ie_comp_hipo') === '1' ||
        getField(sec, 'ie_comp_auto') === '1' ||
        getField(sec, 'ie_comp_tc') === '1' ||
        getField(sec, 'ie_comp_prestamo') === '1' ||
        (getField(sec, 'ie_comp_otros_texto') ?? '').trim();
      if (anyComp) filled++;
      reqYn('ie_gastos_cambio');
      if (getField(sec, 'ie_gastos_cambio') === 'si') req('ie_gastos_texto');
      reqYn('ie_credito_problema');
      if (getField(sec, 'ie_credito_problema') === 'si') {
        total++;
        const credDet =
          getField(sec, 'ie_cred_atrasos') === '1' ||
          getField(sec, 'ie_cred_reestructura') === '1' ||
          getField(sec, 'ie_cred_liquidado') === '1' ||
          (getField(sec, 'ie_cred_otro') === '1' && (getField(sec, 'ie_cred_otro_texto') ?? '').trim());
        if (credDet) filled++;
        if (getField(sec, 'ie_cred_otro') === '1') req('ie_cred_otro_texto');
      }
    } else if (sec === 'Escolaridad y Capacitación') {
      reqYn('esc_nuevos');
      if (getField(sec, 'esc_nuevos') === 'si') {
        total++;
        if (['si', 'no', 'tramite'].includes(getField(sec, 'esc_doc'))) filled++;
        const n = Math.max(1, Math.min(20, parseInt(getField(sec, 'esc_num_rows') || '1', 10) || 1));
        total++;
        let okBlock = false;
        for (let i = 0; i < n; i++) {
          const curso = (getField(sec, `esc_${i}_curso`) ?? '').trim();
          const inst = (getField(sec, `esc_${i}_inst`) ?? '').trim();
          const anio = (getField(sec, `esc_${i}_anio`) ?? '').trim();
          const pdf = (getField(sec, `esc_${i}_pdf`) ?? '').trim();
          if (curso && inst && anio && pdf) okBlock = true;
        }
        if (okBlock) filled++;
      }
    } else if (sec === 'Bienestar y Antecedentes Legales') {
      total++;
      if (['no', 'ocasional', 'social'].includes(getField(sec, 'bw_alcohol'))) filled++;
      total++;
      if (['no', 'si'].includes(getField(sec, 'bw_tabaco'))) filled++;
      reqYn('bw_condicion');
      if (getField(sec, 'bw_condicion') === 'si') req('bw_condicion_texto');
      reqYn('al_legal');
      if (getField(sec, 'al_legal') === 'si') req('al_legal_texto');
    } else if (sec === 'Carta Penal Observaciones y Declaración') {
      total++;
      if (getField(sec, 'cap_tramite') === 'autorizo' || getField(sec, 'cap_tramite') === 'no_autorizo') filled++;
      if (getField(sec, 'cap_tramite') === 'autorizo') {
        req('cap_doc_acta');
        req('cap_doc_ine');
        req('cap_doc_foto');
        req('cap_doc_domicilio');
      }
      req('df_nombre');
      req('df_firma');
      req('df_fecha');
    }
    return { filled, total };
  };

  const getRequiredCount = (): { filled: number; total: number } =>
    countSectionProgress(SECTIONS[sectionIndex]);

  const currentSectionRequiredFilled = (): boolean => {
    const { filled, total } = getRequiredCount();
    return total === 0 || filled === total;
  };

  const progressPct = (): number => {
    let filled = 0;
    let total = 0;
    SECTIONS.forEach((sec) => {
      const c = countSectionProgress(sec);
      filled += c.filled;
      total += c.total;
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

  // Auto-save form data as user fills (debounced) so data is persisted even if they don't click "Guardar"
  useEffect(() => {
    if (!codigo || !invitation || !privacyAccepted || invitation.status === 'completed') return;
    const fields = buildBatchFields();
    if (fields.length === 0) return;
    const t = setTimeout(() => {
      fetch(`${API}/studies.php?action=save_form_data_batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unique_code: codigo, fields }),
      }).catch(() => {});
    }, 2500);
    return () => clearTimeout(t);
  }, [codigo, invitation, privacyAccepted, formData]);

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
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((data as { error?: string })?.error || 'Error al guardar');
        if ((data as { error?: string }).error) throw new Error((data as { error: string }).error);
        const saved = (data as { saved_count?: number }).saved_count ?? 0;
        if (fields.length > 0 && saved === 0) throw new Error('No se pudieron guardar los datos. Intenta de nuevo.');
        return data;
      })
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
      .catch((err) => {
        alert(err?.message || 'Error al enviar. Intenta de nuevo.');
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
        }).then(async (r) => {
          const text = await r.text();
          if (!r.ok) {
            let msg = r.status === 500 ? 'Error al guardar el documento. Intenta de nuevo.' : `Error ${r.status}`;
            try {
              const j = JSON.parse(text);
              if (j?.error) msg = j.error;
            } catch {
              // use default msg
            }
            throw new Error(msg);
          }
          if (!text.trim()) throw new Error('Respuesta vacía del servidor');
          try {
            JSON.parse(text);
          } catch {
            throw new Error('Error al procesar la respuesta del servidor');
          }
          return url;
        });
      });
  };

  const uploadPdfIdentificacion = (file: File): Promise<string> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return Promise.reject(new Error('Solo se permite archivo PDF.'));
    }
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('El PDF no debe superar 5 MB.'));
    return uploadFile(file, 'identificacion_oficial_actualizacion');
  };

  const uploadPdfEscolaridad = (file: File, rowIndex: number): Promise<string> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return Promise.reject(new Error('Solo se permite archivo PDF.'));
    }
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('El PDF no debe superar 5 MB.'));
    return uploadFile(file, `escolaridad_actualizacion_${rowIndex}`);
  };

  /** Carta penal: acta/INE/domicilio = PDF; foto = PDF o JPG/PNG (foto suele venir del teléfono). Máx. 5 MB. */
  const uploadCapFile = (file: File, kind: 'acta' | 'ine' | 'foto' | 'domicilio'): Promise<string> => {
    const max = 5 * 1024 * 1024;
    if (file.size > max) return Promise.reject(new Error('El archivo no debe superar 5 MB.'));
    const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const image = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (kind === 'foto') {
      if (!pdf && !image) return Promise.reject(new Error('Fotografía: suba JPG, PNG o PDF.'));
    } else {
      if (!pdf) return Promise.reject(new Error('Este documento debe ser PDF (escaneo legible).'));
    }
    const types = { acta: 'carta_penal_acta_nacimiento', ine: 'carta_penal_ine', foto: 'carta_penal_fotografia', domicilio: 'carta_penal_comprobante_domicilio' };
    return uploadFile(file, types[kind]);
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
              <span style={{ fontSize: 14, color: '#6b7280' }}>Paso {sectionIndex + 1} de {SECTION_COUNT}</span>
            </div>
            <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 8 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#16a34a', borderRadius: 3 }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{pct}% completado (campos requeridos)</p>
          </div>

          {/* Section content */}
          {sec === 'Formato Actualización' && (
            <div style={{ display: 'grid', gap: 18 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#111' }}>FORMATO DE ACTUALIZACIÓN DE ESTUDIO SOCIOECONÓMICO</h2>
              <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 600 }}>(Personal Activo)</p>
              <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Empresa *</label><input type="text" value={getField(sec, 'empresa')} onChange={(e) => updateField(sec, 'empresa', e.target.value)} placeholder="Nombre de la empresa" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre del colaborador *</label><input type="text" value={getField(sec, 'nombre_colaborador')} onChange={(e) => updateField(sec, 'nombre_colaborador', e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Puesto actual *</label><input type="text" value={getField(sec, 'puesto_actual')} onChange={(e) => updateField(sec, 'puesto_actual', e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha de ingreso a la empresa *</label><input type="date" value={getField(sec, 'fecha_ingreso_empresa')} onChange={(e) => updateField(sec, 'fecha_ingreso_empresa', e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha de actualización *</label><input type="date" value={getField(sec, 'fecha_actualizacion')} onChange={(e) => updateField(sec, 'fecha_actualizacion', e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
            </div>
          )}

          {sec === 'Autorización Actualización' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <h2 style={{ margin: 0, fontSize: 17, color: '#111', lineHeight: 1.35 }}>AUTORIZACIÓN PARA ACTUALIZACIÓN DE INFORMACIÓN SOCIOECONÓMICA</h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Yo,{' '}
                <input
                  type="text"
                  value={getField(sec, 'auth_nombre_declaracion')}
                  onChange={(e) => updateField(sec, 'auth_nombre_declaracion', e.target.value)}
                  placeholder="Escriba su nombre completo"
                  style={{ minWidth: 220, maxWidth: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
                />
                , manifiesto que he sido informado(a) de que la información que proporcionaré será utilizada exclusivamente para la actualización de mi expediente laboral, como parte de los procesos internos de la empresa en la que actualmente laboro.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Autorizo a <strong>HR Capital Working, S.A. de C.V.</strong>, para recopilar, revisar y actualizar mis datos personales, laborales, económicos y documentales, únicamente con el propósito de mantener vigente mi estudio socioeconómico previamente realizado.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Entiendo que esta actualización no constituye un nuevo estudio de ingreso, no implica investigación retroactiva, no sustituye documentos oficiales emitidos por autoridad competente y no representa dictamen legal ni certificación.
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'grid', gap: 14 }}>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre del colaborador *</label><input type="text" value={getField(sec, 'auth_nombre_firma')} onChange={(e) => updateField(sec, 'auth_nombre_firma', e.target.value)} style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Firma (escriba su nombre completo a modo de firma) *</label><input type="text" value={getField(sec, 'auth_firma_texto')} onChange={(e) => updateField(sec, 'auth_firma_texto', e.target.value)} placeholder="Firma manuscrita digital (nombre completo)" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha *</label><input type="date" value={getField(sec, 'auth_fecha')} onChange={(e) => updateField(sec, 'auth_fecha', e.target.value)} style={{ width: '100%', maxWidth: 280, padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              </div>
            </div>
          )}

          {sec === 'Datos Generales e Identificación' && (
            <SectionDatosGeneralesIdentificacion sec={sec} getField={getField} updateField={updateField} uploadPdfIdentificacion={uploadPdfIdentificacion} />
          )}

          {sec === 'Domicilio Actual Actualización' && (
            <SectionDomicilioActualActualizacion sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Situación Laboral Actual' && (
            <SectionSituacionLaboral sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Ingresos y Situación Económica' && (
            <SectionIngresosEconomicos sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Escolaridad y Capacitación' && (
            <SectionEscolaridadCapacitacion
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadPdfEscolaridad={uploadPdfEscolaridad}
            />
          )}

          {sec === 'Bienestar y Antecedentes Legales' && (
            <SectionBienestarAntecedentes sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Carta Penal Observaciones y Declaración' && (
            <SectionCartaObsDeclaracion
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadCapFile={uploadCapFile}
              defaultNombre={invitation?.candidate_name ?? ''}
            />
          )}

          {/* Bottom nav */}
          <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 0', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              {sectionIndex > 0 ? <button type="button" onClick={() => setSectionIndex((i) => i - 1)} style={{ padding: '8px 16px', background: '#e2e8f0', border: '2px solid #64748b', color: '#0f172a', fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>← Anterior</button> : null}
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
              <button onClick={() => setShowFinalConfirm(false)} style={{ padding: '8px 16px', background: '#e2e8f0', border: '2px solid #64748b', color: '#0f172a', fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>Revisar información</button>
              <button onClick={handleFinalSubmit} disabled={submitting} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Confirmar envío</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function ChoiceRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: on ? '2px solid #1e3a8a' : '2px solid #64748b',
                background: on ? '#1e40af' : '#f1f5f9',
                color: on ? '#ffffff' : '#0f172a',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: on ? 700 : 600,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionDomicilioActualActualizacion({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  const srv = (k: string) => getField(sec, k) === '1';
  const setSrv = (k: string, checked: boolean) => updateField(sec, k, checked ? '1' : '');
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>2. DOMICILIO ACTUAL</h2>

      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow
          label="¿Su domicilio actual es el mismo registrado en su estudio previo?"
          value={getField(sec, 'dom_mismo_estudio')}
          onChange={(v) => updateField(sec, 'dom_mismo_estudio', v)}
        />
        {getField(sec, 'dom_mismo_estudio') === 'no' && (
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Domicilio actual completo *</label>
              <textarea
                value={getField(sec, 'dom_completo')}
                onChange={(e) => updateField(sec, 'dom_completo', e.target.value)}
                rows={3}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Fecha del cambio de domicilio *</label>
              <input
                type="date"
                value={getField(sec, 'dom_fecha_cambio')}
                onChange={(e) => updateField(sec, 'dom_fecha_cambio', e.target.value)}
                style={{ width: '100%', maxWidth: 280, marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>
        )}
      </div>

      <ChoiceRow
        label="Zona de la vivienda (seleccione la que mejor describa)"
        value={getField(sec, 'dom_zona')}
        onChange={(v) => updateField(sec, 'dom_zona', v)}
        options={[
          { key: 'residencial', label: 'Residencial' },
          { key: 'popular', label: 'Popular' },
          { key: 'campestre', label: 'Campestre' },
          { key: 'industrial', label: 'Industrial' },
          { key: 'turistica', label: 'Turística' },
          { key: 'otro', label: 'Otro' },
        ]}
      />
      {getField(sec, 'dom_zona') === 'otro' && (
        <input
          type="text"
          placeholder="Especifique zona"
          value={getField(sec, 'dom_zona_otro')}
          onChange={(e) => updateField(sec, 'dom_zona_otro', e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
        />
      )}

      <ChoiceRow
        label="Tipo de vivienda"
        value={getField(sec, 'dom_tipo_vivienda')}
        onChange={(v) => updateField(sec, 'dom_tipo_vivienda', v)}
        options={[
          { key: 'casa', label: 'Casa' },
          { key: 'depto', label: 'Departamento' },
          { key: 'condominio', label: 'Condominio' },
          { key: 'infonavit', label: 'Unidad habitacional (Infonavit / Fovissste)' },
        ]}
      />

      <ChoiceRow
        label="Colonia / tipo de fraccionamiento"
        value={getField(sec, 'dom_colonia')}
        onChange={(v) => updateField(sec, 'dom_colonia', v)}
        options={[
          { key: 'privado', label: 'Privado' },
          { key: 'abierto', label: 'Abierto' },
          { key: 'seguridad', label: 'Con sistema de seguridad' },
          { key: 'otro', label: 'Otro' },
        ]}
      />
      {getField(sec, 'dom_colonia') === 'otro' && (
        <input
          type="text"
          placeholder="Especifique"
          value={getField(sec, 'dom_colonia_otro')}
          onChange={(e) => updateField(sec, 'dom_colonia_otro', e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
        />
      )}

      <ChoiceRow
        label="Actividad vecinal predominante"
        value={getField(sec, 'dom_actividad')}
        onChange={(v) => updateField(sec, 'dom_actividad', v)}
        options={[
          { key: 'industrial', label: 'Industrial' },
          { key: 'comercial', label: 'Comercial' },
          { key: 'ejidal', label: 'Ejidal / Rural' },
          { key: 'otro', label: 'Otro' },
        ]}
      />
      {getField(sec, 'dom_actividad') === 'otro' && (
        <input
          type="text"
          placeholder="Especifique"
          value={getField(sec, 'dom_actividad_otro')}
          onChange={(e) => updateField(sec, 'dom_actividad_otro', e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
        />
      )}

      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Servicios públicos de la zona (marque los que apliquen) *</p>
        {[
          ['dom_srv_agua', 'Agua'],
          ['dom_srv_luz', 'Luz'],
          ['dom_srv_alumbrado', 'Alumbrado público'],
          ['dom_srv_drenaje', 'Drenaje'],
          ['dom_srv_pavimento', 'Pavimentación'],
          ['dom_srv_transporte', 'Transporte público'],
          ['dom_srv_verdes', 'Áreas verdes'],
          ['dom_srv_sin_verdes', 'Sin áreas verdes cercanas'],
        ].map(([k, lab]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={srv(k)} onChange={(e) => setSrv(k, e.target.checked)} />
            {lab}
          </label>
        ))}
      </div>

      <h3 style={{ margin: '8px 0 0', fontSize: 15, color: '#334155' }}>2.2 Medios de transporte y traslado al trabajo</h3>
      <ChoiceRow
        label="Medio principal de transporte"
        value={getField(sec, 'dom_transporte')}
        onChange={(v) => updateField(sec, 'dom_transporte', v)}
        options={[
          { key: 'publico', label: 'Transporte público' },
          { key: 'propio', label: 'Vehículo propio' },
          { key: 'empresa', label: 'Transporte de la empresa' },
          { key: 'pie', label: 'A pie' },
          { key: 'otro', label: 'Otro' },
        ]}
      />
      <ChoiceRow
        label="Tiempo aproximado de traslado"
        value={getField(sec, 'dom_tiempo_traslado')}
        onChange={(v) => updateField(sec, 'dom_tiempo_traslado', v)}
        options={[
          { key: 'menos30', label: 'Menos de 30 min' },
          { key: '30_60', label: '30–60 min' },
          { key: 'mas60', label: 'Más de 60 min' },
        ]}
      />
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>¿Ha existido algún cambio relevante?</span>
          <button type="button" onClick={() => updateField(sec, 'dom_cambio_relevante', 'si')} style={{ padding: '10px 20px', borderRadius: 8, border: getField(sec, 'dom_cambio_relevante') === 'si' ? '2px solid #1e3a8a' : '2px solid #64748b', background: getField(sec, 'dom_cambio_relevante') === 'si' ? '#1e40af' : '#f1f5f9', color: getField(sec, 'dom_cambio_relevante') === 'si' ? '#fff' : '#0f172a', fontWeight: 700, fontSize: 15 }}>Sí</button>
          <button type="button" onClick={() => updateField(sec, 'dom_cambio_relevante', 'no')} style={{ padding: '10px 20px', borderRadius: 8, border: getField(sec, 'dom_cambio_relevante') === 'no' ? '2px solid #1e3a8a' : '2px solid #64748b', background: getField(sec, 'dom_cambio_relevante') === 'no' ? '#1e40af' : '#f1f5f9', color: getField(sec, 'dom_cambio_relevante') === 'no' ? '#fff' : '#0f172a', fontWeight: 700, fontSize: 15 }}>No</button>
        </div>
        {getField(sec, 'dom_cambio_relevante') === 'si' && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Especifique *</label>
            <input type="text" value={getField(sec, 'dom_cambio_relevante_texto')} onChange={(e) => updateField(sec, 'dom_cambio_relevante_texto', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
        <strong>Nota importante:</strong> Esta información es de carácter declarativo y podrá ser complementada con la verificación domiciliaria, en caso de que haya sido autorizada por el evaluado.
      </p>

      <h3 style={{ margin: 0, fontSize: 15, color: '#334155' }}>2.3 Autorización para visita domiciliaria</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          onClick={() => updateField(sec, 'dom_visita', 'autorizo')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: getField(sec, 'dom_visita') === 'autorizo' ? '2px solid #14532d' : '2px solid #64748b',
            background: getField(sec, 'dom_visita') === 'autorizo' ? '#15803d' : '#f1f5f9',
            color: getField(sec, 'dom_visita') === 'autorizo' ? '#ffffff' : '#0f172a',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Autorizo
        </button>
        <button
          type="button"
          onClick={() => updateField(sec, 'dom_visita', 'no_autorizo')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: getField(sec, 'dom_visita') === 'no_autorizo' ? '2px solid #7f1d1d' : '2px solid #64748b',
            background: getField(sec, 'dom_visita') === 'no_autorizo' ? '#b91c1c' : '#f1f5f9',
            color: getField(sec, 'dom_visita') === 'no_autorizo' ? '#ffffff' : '#0f172a',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          No autorizo
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
        En caso de autorizar, manifiesto mi consentimiento para que se realice una visita domiciliaria con fines de actualización de mi expediente laboral, incluyendo la toma de una fotografía del exterior del domicilio, exclusivamente para fines administrativos.
      </p>

      {getField(sec, 'dom_visita') === 'autorizo' && (
        <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac', display: 'grid', gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#14532d' }}>Disponibilidad para visita domiciliaria</p>
          <p style={{ margin: 0, fontSize: 13 }}>Indique al menos dos opciones de fecha y horario:</p>
          <div style={{ display: 'grid', gap: 10 }}>
            <strong style={{ fontSize: 13 }}>Opción 1</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Fecha *</label>
                <input type="date" value={getField(sec, 'dom_visita_op1_fecha')} onChange={(e) => updateField(sec, 'dom_visita_op1_fecha', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Horario aproximado *</label>
                <input type="text" placeholder="ej. 10:00–14:00" value={getField(sec, 'dom_visita_op1_hora')} onChange={(e) => updateField(sec, 'dom_visita_op1_hora', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <strong style={{ fontSize: 13 }}>Opción 2</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Fecha *</label>
                <input type="date" value={getField(sec, 'dom_visita_op2_fecha')} onChange={(e) => updateField(sec, 'dom_visita_op2_fecha', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Horario aproximado *</label>
                <input type="text" placeholder="ej. Sábado mañana" value={getField(sec, 'dom_visita_op2_hora')} onChange={(e) => updateField(sec, 'dom_visita_op2_hora', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label style={{ fontWeight: 600, fontSize: 13 }}>Señas adicionales para ubicación del domicilio (opcional)</label>
        <textarea
          value={getField(sec, 'dom_senas_opcional')}
          onChange={(e) => updateField(sec, 'dom_senas_opcional', e.target.value)}
          rows={2}
          style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}

function SectionSituacionLaboral({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>3. SITUACIÓN LABORAL ACTUAL</h2>
      <div>
        <label style={{ fontWeight: 600 }}>Puesto actual *</label>
        <input type="text" value={getField(sec, 'sl_puesto')} onChange={(e) => updateField(sec, 'sl_puesto', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>Área / Departamento *</label>
        <input type="text" value={getField(sec, 'sl_area')} onChange={(e) => updateField(sec, 'sl_area', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ fontWeight: 600 }}>Antigüedad en el puesto actual *</label>
        <input type="text" placeholder="ej. 2 años, 6 meses" value={getField(sec, 'sl_antiguedad')} onChange={(e) => updateField(sec, 'sl_antiguedad', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Ha tenido cambios relevantes en su situación laboral?" value={getField(sec, 'sl_cambios')} onChange={(v) => updateField(sec, 'sl_cambios', v)} />
        {getField(sec, 'sl_cambios') === 'si' && (
          <div>
            <label style={{ fontWeight: 600, fontSize: 13 }}>En caso afirmativo, describa brevemente *</label>
            <textarea value={getField(sec, 'sl_cambios_texto')} onChange={(e) => updateField(sec, 'sl_cambios_texto', e.target.value)} rows={3} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionIngresosEconomicos({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  const setComp = (key: string, on: boolean, exclusiveNinguno?: boolean) => {
    if (exclusiveNinguno && key === 'ie_comp_ninguno' && on) {
      ['ie_comp_renta', 'ie_comp_hipo', 'ie_comp_auto', 'ie_comp_tc', 'ie_comp_prestamo'].forEach((k) => updateField(sec, k, ''));
      updateField(sec, 'ie_comp_otros_texto', '');
    }
    if (exclusiveNinguno && key !== 'ie_comp_ninguno' && on) {
      updateField(sec, 'ie_comp_ninguno', '');
    }
    updateField(sec, key, on ? '1' : '');
  };
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>4. INGRESOS Y SITUACIÓN ECONÓMICA</h2>
      <ChoiceRow
        label="Rango aproximado de ingreso mensual actual *"
        value={getField(sec, 'ie_rango')}
        onChange={(v) => updateField(sec, 'ie_rango', v)}
        options={[
          { key: 'menos10k', label: 'Menos de $10,000' },
          { key: '10_20', label: '$10,001 – $20,000' },
          { key: '20_30', label: '$20,001 – $30,000' },
          { key: '30_50', label: '$30,001 – $50,000' },
          { key: 'mas50', label: 'Más de $50,000' },
        ]}
      />
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 700 }}>4.1 Compromisos económicos relevantes</p>
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>Cuenta actualmente con: (marque lo que aplique; &quot;Ninguno&quot; excluye los demás) *</p>
        {[
          ['ie_comp_renta', 'Renta de vivienda'],
          ['ie_comp_hipo', 'Crédito hipotecario'],
          ['ie_comp_auto', 'Crédito automotriz'],
          ['ie_comp_tc', 'Tarjetas de crédito'],
          ['ie_comp_prestamo', 'Préstamos personales'],
        ].map(([k, lab]) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={getField(sec, k) === '1'} onChange={(e) => setComp(k, e.target.checked, true)} />
            {lab}
          </label>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={getField(sec, 'ie_comp_ninguno') === '1'}
            onChange={(e) => setComp('ie_comp_ninguno', e.target.checked, true)}
          />
          Ninguno
        </label>
        <div style={{ marginTop: 10 }}>
          <label style={{ fontWeight: 600, fontSize: 13 }}>Otros (opcional)</label>
          <input type="text" value={getField(sec, 'ie_comp_otros_texto')} onChange={(e) => updateField(sec, 'ie_comp_otros_texto', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ padding: 14, background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>4.2 Observaciones del evaluado (obligatorio contestar)</p>
        <YnRow label="¿Existen cambios relevantes en gastos o compromisos económicos?" value={getField(sec, 'ie_gastos_cambio')} onChange={(v) => updateField(sec, 'ie_gastos_cambio', v)} />
        {getField(sec, 'ie_gastos_cambio') === 'si' && (
          <div>
            <label style={{ fontWeight: 600, fontSize: 13 }}>En caso afirmativo, especifique *</label>
            <textarea value={getField(sec, 'ie_gastos_texto')} onChange={(e) => updateField(sec, 'ie_gastos_texto', e.target.value)} rows={2} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>4.3 Situación crediticia (declarativa)</p>
        <YnRow label="¿Ha tenido o tiene actualmente algún problema relevante con su historial crediticio (Buró de Crédito)?" value={getField(sec, 'ie_credito_problema')} onChange={(v) => updateField(sec, 'ie_credito_problema', v)} />
        {getField(sec, 'ie_credito_problema') === 'si' && (
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>En caso afirmativo, indique (marque lo que corresponda) *</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><input type="checkbox" checked={getField(sec, 'ie_cred_atrasos') === '1'} onChange={(e) => updateField(sec, 'ie_cred_atrasos', e.target.checked ? '1' : '')} /> Atrasos de pago</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><input type="checkbox" checked={getField(sec, 'ie_cred_reestructura') === '1'} onChange={(e) => updateField(sec, 'ie_cred_reestructura', e.target.checked ? '1' : '')} /> Reestructura / convenio</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><input type="checkbox" checked={getField(sec, 'ie_cred_liquidado') === '1'} onChange={(e) => updateField(sec, 'ie_cred_liquidado', e.target.checked ? '1' : '')} /> Adeudo liquidado</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><input type="checkbox" checked={getField(sec, 'ie_cred_otro') === '1'} onChange={(e) => updateField(sec, 'ie_cred_otro', e.target.checked ? '1' : '')} /> Otro</label>
            {getField(sec, 'ie_cred_otro') === '1' && (
              <input type="text" placeholder="Especifique" value={getField(sec, 'ie_cred_otro_texto')} onChange={(e) => updateField(sec, 'ie_cred_otro_texto', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
            )}
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          Esta información es de carácter declarativo y no implica consulta a sociedades de información crediticia.
        </p>
      </div>
    </div>
  );
}

function SectionEscolaridadCapacitacion({
  sec,
  getField,
  updateField,
  uploadPdfEscolaridad,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadPdfEscolaridad: (f: File, i: number) => Promise<string>;
}) {
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const n = Math.max(1, Math.min(20, parseInt(getField(sec, 'esc_num_rows') || '1', 10) || 1));
  const addRow = () => updateField(sec, 'esc_num_rows', String(Math.min(20, n + 1)));
  const nuevosSi = getField(sec, 'esc_nuevos') === 'si';

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>5. ESCOLARIDAD Y CAPACITACIÓN</h2>
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Ha concluido nuevos estudios, cursos o certificaciones desde su ingreso?" value={getField(sec, 'esc_nuevos')} onChange={(v) => updateField(sec, 'esc_nuevos', v)} />
      </div>
      {nuevosSi && (
        <>
          <p style={{ margin: 0, fontWeight: 600 }}>En caso afirmativo, indique cada uno. Cada renglón completo requiere PDF de respaldo (máx. 5 MB). *</p>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} style={{ padding: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, display: 'grid', gap: 10 }}>
              <strong style={{ fontSize: 13, color: '#475569' }}>Estudio / curso {i + 1}</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Estudio / Curso</label>
                  <input type="text" value={getField(sec, `esc_${i}_curso`)} onChange={(e) => updateField(sec, `esc_${i}_curso`, e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Institución</label>
                  <input type="text" value={getField(sec, `esc_${i}_inst`)} onChange={(e) => updateField(sec, `esc_${i}_inst`, e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ maxWidth: 120 }}>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Año</label>
                <input type="text" placeholder="AAAA" value={getField(sec, `esc_${i}_anio`)} onChange={(e) => updateField(sec, `esc_${i}_anio`, e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>PDF comprobante *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                  <label style={{ cursor: uploadingIdx === i ? 'wait' : 'pointer' }}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploadingIdx !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploadingIdx(i);
                        uploadPdfEscolaridad(f, i)
                          .then((url) => updateField(sec, `esc_${i}_pdf`, url))
                          .catch((err) => alert(err?.message || 'Error al subir'))
                          .finally(() => {
                            setUploadingIdx(null);
                            e.target.value = '';
                          });
                      }}
                    />
                    <span style={{ display: 'inline-block', padding: '8px 14px', background: uploadingIdx === i ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                      {uploadingIdx === i ? 'Subiendo…' : 'Adjuntar PDF'}
                    </span>
                  </label>
                  {getField(sec, `esc_${i}_pdf`) ? <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ PDF cargado</span> : null}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow} style={{ padding: '10px 16px', background: '#e2e8f0', border: '2px solid #475569', borderRadius: 8, cursor: 'pointer', fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
            + Agregar un estudio / curso más
          </button>
          <div style={{ padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700 }}>Documentación académica *</p>
            <p style={{ margin: '0 0 10px', fontSize: 13 }}>¿Cuenta con documentación que respalde la actualización de sus estudios?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                ['si', 'Sí'],
                ['no', 'No'],
                ['tramite', 'En trámite'],
              ].map(([k, lab]) => {
                const on = getField(sec, 'esc_doc') === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => updateField(sec, 'esc_doc', k)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: on ? '2px solid #1e3a8a' : '2px solid #64748b',
                      background: on ? '#1e40af' : '#f1f5f9',
                      color: on ? '#ffffff' : '#0f172a',
                      cursor: 'pointer',
                      fontWeight: on ? 700 : 600,
                      fontSize: 14,
                    }}
                  >
                    {lab}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b' }}>Complete al menos un renglón (curso, institución, año y PDF). Puede agregar más renglones según necesite.</p>
          </div>
        </>
      )}
    </div>
  );
}

function SectionBienestarAntecedentes({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>6. CONDICIONES GENERALES DE BIENESTAR</h2>
      <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
        Con la finalidad de contar con información general para la integración de su expediente laboral, indique lo que corresponda:
      </p>
      <ChoiceRow label="Consumo de bebidas alcohólicas *" value={getField(sec, 'bw_alcohol')} onChange={(v) => updateField(sec, 'bw_alcohol', v)} options={[{ key: 'no', label: 'No' }, { key: 'ocasional', label: 'Ocasional' }, { key: 'social', label: 'Social' }]} />
      <ChoiceRow label="Consumo de tabaco *" value={getField(sec, 'bw_tabaco')} onChange={(v) => updateField(sec, 'bw_tabaco', v)} options={[{ key: 'no', label: 'No' }, { key: 'si', label: 'Sí' }]} />
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Existe alguna condición personal que considere relevante mencionar para efectos administrativos?" value={getField(sec, 'bw_condicion')} onChange={(v) => updateField(sec, 'bw_condicion', v)} />
        {getField(sec, 'bw_condicion') === 'si' && (
          <input type="text" placeholder="Describa brevemente (obligatorio si eligió Sí)" value={getField(sec, 'bw_condicion_texto')} onChange={(e) => updateField(sec, 'bw_condicion_texto', e.target.value)} style={{ width: '100%', marginTop: 8, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
        La información proporcionada en esta sección es de carácter declarativo y no será utilizada para emitir juicios ni evaluaciones médicas o legales.
      </p>

      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '8px 0' }} />

      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>7. ANTECEDENTES LEGALES (DECLARATIVO)</h2>
      <div style={{ padding: 14, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
        <YnRow label="¿Ha tenido o tiene actualmente algún antecedente legal que pudiera afectar su desempeño laboral?" value={getField(sec, 'al_legal')} onChange={(v) => updateField(sec, 'al_legal', v)} />
        {getField(sec, 'al_legal') === 'si' && (
          <div>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Indique de manera general *</label>
            <textarea value={getField(sec, 'al_legal_texto')} onChange={(e) => updateField(sec, 'al_legal_texto', e.target.value)} rows={3} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCartaObsDeclaracion({
  sec,
  getField,
  updateField,
  uploadCapFile,
  defaultNombre,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadCapFile: (f: File, k: 'acta' | 'ine' | 'foto' | 'domicilio') => Promise<string>;
  defaultNombre: string;
}) {
  const [up, setUp] = useState<string | null>(null);
  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    if (!getField(sec, 'df_fecha').trim()) updateField(sec, 'df_fecha', day);
    if (!getField(sec, 'df_nombre').trim() && defaultNombre.trim()) updateField(sec, 'df_nombre', defaultNombre.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefill once when opening
  }, []);

  const slot = (
    label: string,
    hint: string,
    fieldKey: 'cap_doc_acta' | 'cap_doc_ine' | 'cap_doc_foto' | 'cap_doc_domicilio',
    kind: 'acta' | 'ine' | 'foto' | 'domicilio',
    accept: string
  ) => (
    <div style={{ padding: 14, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14 }}>{label} *</p>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>{hint}</p>
      <label style={{ cursor: up === fieldKey ? 'wait' : 'pointer' }}>
        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          disabled={up !== null}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUp(fieldKey);
            uploadCapFile(f, kind)
              .then((url) => updateField(sec, fieldKey, url))
              .catch((err) => alert(err?.message || 'Error al subir'))
              .finally(() => {
                setUp(null);
                e.target.value = '';
              });
          }}
        />
        <span style={{ display: 'inline-block', padding: '8px 14px', background: up === fieldKey ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
          {up === fieldKey ? 'Subiendo…' : 'Seleccionar archivo'}
        </span>
      </label>
      {getField(sec, fieldKey) ? (
        <span style={{ marginLeft: 10, color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ Recibido</span>
      ) : null}
    </div>
  );

  const autoriza = getField(sec, 'cap_tramite') === 'autorizo';

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>8. CARTA DE NO ANTECEDENTES PENALES (SI APLICA)</h2>
      <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 700 }}>Autorización para trámite *</p>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer' }}>
          <input
            type="radio"
            name="cap_tramite"
            checked={autoriza}
            onChange={() => updateField(sec, 'cap_tramite', 'autorizo')}
            style={{ marginTop: 4 }}
          />
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>
            Autorizo a <strong>HR Capital Working, S.A. de C.V.</strong> a gestionar ante la autoridad correspondiente el trámite de mi Carta de No Antecedentes Penales, utilizando para ello la información y documentación que proporciono.
          </span>
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer' }}>
          <input
            type="radio"
            name="cap_tramite"
            checked={getField(sec, 'cap_tramite') === 'no_autorizo'}
            onChange={() => updateField(sec, 'cap_tramite', 'no_autorizo')}
            style={{ marginTop: 4 }}
          />
          <span style={{ fontSize: 14 }}>No autorizo el trámite.</span>
        </label>
        <p style={{ margin: 0, fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
          Entiendo que HR Capital Working actúa únicamente como gestor intermediario y no emite certificaciones legales.
        </p>
      </div>

      {autoriza && (
        <div style={{ padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 15 }}>Documentación requerida para el trámite</p>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
            Suba archivos <strong>escaneados, legibles y completos</strong>. Acta, INE y comprobante: <strong>solo PDF</strong>.{' '}
            <strong>Fotografía:</strong> puede subir <strong>JPG, PNG o PDF</strong> (lo habitual es una foto del celular en JPG/PNG; si ya la tiene en PDF también es válido). Máximo 5 MB por archivo.
          </p>
          <ul style={{ margin: '0 0 14px', paddingLeft: 18, fontSize: 13, color: '#475569' }}>
            <li>Acta de nacimiento</li>
            <li>Credencial para votar (INE)</li>
            <li>Fotografía reciente, fondo blanco, hombros hacia arriba, sin lentes u objetos que cubran el rostro</li>
            <li>Comprobante de domicilio (no mayor a 3 meses)</li>
          </ul>
          <div style={{ display: 'grid', gap: 12 }}>
            {slot('Acta de nacimiento', 'PDF del acta legible.', 'cap_doc_acta', 'acta', '.pdf,application/pdf')}
            {slot('Credencial INE', 'PDF por ambos lados si aplica.', 'cap_doc_ine', 'ine', '.pdf,application/pdf')}
            {slot(
              'Fotografía del ciudadano',
              'JPG, PNG o PDF. Fondo blanco, de hombros hacia arriba.',
              'cap_doc_foto',
              'foto',
              '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp'
            )}
            {slot('Comprobante de domicilio', 'PDF, no mayor a 3 meses.', 'cap_doc_domicilio', 'domicilio', '.pdf,application/pdf')}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
            El trámite se realiza conforme a los lineamientos de la autoridad competente y a la documentación proporcionada por el evaluado.
          </p>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: 0 }} />

      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>9. OBSERVACIONES O COMENTARIOS DEL COLABORADOR</h2>
      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Opcional.</p>
      <textarea
        value={getField(sec, 'obs_comentarios')}
        onChange={(e) => updateField(sec, 'obs_comentarios', e.target.value)}
        rows={5}
        placeholder="Escriba aquí cualquier comentario adicional…"
        style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
      />

      <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: 0 }} />

      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>10. DECLARACIÓN FINAL</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
        Declaro que la información proporcionada es verídica y corresponde a mi situación actual, y que forma parte del proceso de actualización de mi expediente laboral.
      </p>
      <div style={{ display: 'grid', gap: 14, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontWeight: 600 }}>Nombre *</label>
          <input type="text" value={getField(sec, 'df_nombre')} onChange={(e) => updateField(sec, 'df_nombre', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Firma (escriba su nombre completo a modo de firma) *</label>
          <input type="text" value={getField(sec, 'df_firma')} onChange={(e) => updateField(sec, 'df_firma', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Fecha *</label>
          <input type="date" value={getField(sec, 'df_fecha')} onChange={(e) => updateField(sec, 'df_fecha', e.target.value)} style={{ width: '100%', maxWidth: 280, marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
        </div>
      </div>
    </div>
  );
}

function YnRow({ label, value, onChange }: { label: string; value: string; onChange: (v: 'si' | 'no') => void }) {
  const btn = (v: 'si' | 'no', text: string) => {
    const on = value === v;
    return (
      <button
        type="button"
        onClick={() => onChange(v)}
        style={{
          padding: '10px 22px',
          borderRadius: 8,
          border: on ? '2px solid #1e3a8a' : '2px solid #64748b',
          background: on ? '#1e40af' : '#f1f5f9',
          color: on ? '#ffffff' : '#0f172a',
          cursor: 'pointer',
          fontWeight: on ? 700 : 600,
          fontSize: 15,
        }}
      >
        {text}
      </button>
    );
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <span style={{ flex: '1 1 200px', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{label}</span>
      <div style={{ display: 'flex', gap: 10 }}>
        {btn('si', 'Sí')}
        {btn('no', 'No')}
      </div>
    </div>
  );
}

function SectionDatosGeneralesIdentificacion({
  sec,
  getField,
  updateField,
  uploadPdfIdentificacion,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadPdfIdentificacion: (f: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    uploadPdfIdentificacion(f)
      .then((url) => {
        updateField(sec, 'identificacion_oficial_pdf', url);
      })
      .catch((err) => alert(err?.message || 'Error al subir el PDF.'))
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  };
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#111' }}>1. DATOS GENERALES (ACTUALIZACIÓN)</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Indique si ha existido algún cambio desde su último estudio o ingreso:</p>

      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Cambio en estado civil?" value={getField(sec, 'dg_estado_civil_cambio')} onChange={(v) => updateField(sec, 'dg_estado_civil_cambio', v)} />
        {getField(sec, 'dg_estado_civil_cambio') === 'si' && (
          <div style={{ marginLeft: 8, marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>En caso afirmativo, indique el actual *</label>
            <input type="text" value={getField(sec, 'dg_estado_civil_actual')} onChange={(e) => updateField(sec, 'dg_estado_civil_actual', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Cambio en teléfono?" value={getField(sec, 'dg_tel_cambio')} onChange={(v) => updateField(sec, 'dg_tel_cambio', v)} />
        {getField(sec, 'dg_tel_cambio') === 'si' && (
          <div style={{ marginLeft: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Teléfono actual *</label>
            <input type="tel" value={getField(sec, 'dg_tel_actual')} onChange={(e) => updateField(sec, 'dg_tel_actual', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Cambio en correo electrónico?" value={getField(sec, 'dg_correo_cambio')} onChange={(v) => updateField(sec, 'dg_correo_cambio', v)} />
        {getField(sec, 'dg_correo_cambio') === 'si' && (
          <div style={{ marginLeft: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Correo actual *</label>
            <input type="email" value={getField(sec, 'dg_correo_actual')} onChange={(e) => updateField(sec, 'dg_correo_actual', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>

      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <YnRow label="¿Cuenta actualmente con dependientes económicos?" value={getField(sec, 'dg_dependientes')} onChange={(v) => updateField(sec, 'dg_dependientes', v)} />
        {getField(sec, 'dg_dependientes') === 'si' && (
          <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <div>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Número de dependientes *</label>
              <input type="number" min={0} value={getField(sec, 'dg_num_dependientes')} onChange={(e) => updateField(sec, 'dg_num_dependientes', e.target.value)} style={{ width: 120, marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>Tipo de dependientes (marque los que apliquen) *</p>
              {[
                ['dg_dep_hijos', 'Hijos'],
                ['dg_dep_conyuge', 'Cónyuge / pareja'],
                ['dg_dep_padres', 'Padres'],
                ['dg_dep_otros', 'Otros (especifique)'],
              ].map(([k, lab]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={getField(sec, k) === '1'}
                    onChange={(e) => updateField(sec, k, e.target.checked ? '1' : '')}
                  />
                  {lab}
                </label>
              ))}
              {getField(sec, 'dg_dep_otros') === '1' && (
                <input type="text" placeholder="Especifique otros" value={getField(sec, 'dg_dep_otros_texto')} onChange={(e) => updateField(sec, 'dg_dep_otros_texto', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box', marginTop: 6 }} />
              )}
            </div>
          </div>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>Esta información se solicita únicamente para actualización del expediente laboral.</p>

      <h2 style={{ margin: '12px 0 0', fontSize: 17, color: '#111' }}>IDENTIFICACIÓN OFICIAL (ACTUALIZACIÓN)</h2>
      <YnRow label="¿Ha existido algún cambio en su identificación oficial desde su último estudio o ingreso?" value={getField(sec, 'dg_id_cambio')} onChange={(v) => updateField(sec, 'dg_id_cambio', v)} />
      <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Identificación oficial vigente (marque una o más) *</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><input type="checkbox" checked={getField(sec, 'dg_id_ine') === '1'} onChange={(e) => updateField(sec, 'dg_id_ine', e.target.checked ? '1' : '')} /> INE</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><input type="checkbox" checked={getField(sec, 'dg_id_pasaporte') === '1'} onChange={(e) => updateField(sec, 'dg_id_pasaporte', e.target.checked ? '1' : '')} /> Pasaporte</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><input type="checkbox" checked={getField(sec, 'dg_id_otra') === '1'} onChange={(e) => updateField(sec, 'dg_id_otra', e.target.checked ? '1' : '')} /> Otra</label>
        {getField(sec, 'dg_id_otra') === '1' && <input type="text" placeholder="Especifique" value={getField(sec, 'dg_id_otra_texto')} onChange={(e) => updateField(sec, 'dg_id_otra_texto', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box', marginBottom: 12 }} />}
        <label style={{ fontWeight: 600, fontSize: 13 }}>Número de identificación *</label>
        <input type="text" value={getField(sec, 'dg_id_numero')} onChange={(e) => updateField(sec, 'dg_id_numero', e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>

      <div style={{ padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#1e3a5f' }}>Identificación oficial en PDF (obligatorio)</p>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
          Adjunte en <strong>formato PDF</strong> su identificación oficial vigente, con o sin cambio respecto al último estudio, para la actualización de su expediente laboral. La documentación se utilizará únicamente para esa finalidad.
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Formato permitido: PDF únicamente. Peso máximo: 5 MB.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} disabled={uploading} onChange={handlePdf} />
            <span style={{ display: 'inline-block', padding: '10px 18px', background: uploading ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>{uploading ? 'Subiendo…' : 'Subir PDF'}</span>
          </label>
          {getField(sec, 'identificacion_oficial_pdf') ? (
            <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
          ) : (
            <span style={{ color: '#b45309', fontSize: 14, fontWeight: 600 }}>Archivo requerido</span>
          )}
        </div>
      </div>
    </div>
  );
}
