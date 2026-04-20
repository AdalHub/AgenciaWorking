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
  'Datos Personales y de Contacto',
  'Autorización Actualización',
  'Domicilio',
  'Información del Cónyuge, Familiares y Contacto',
  'Referencias Personales',
  'Escolaridad y Capacitación',
  'Historia Laboral',
  'Ingresos y Situación Económica',
  'Información Legal y Trámite de Carta de No Antecedentes Penales',
  'Bienestar y Antecedentes Legales',
  'Entorno Social y Condiciones de Vivienda',
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
  const [fotoParticipanteUploading, setFotoParticipanteUploading] = useState(false);

  const isInvitationCompleted = invitation?.status === 'completed';

  // When moving between pages, always start at top
  useEffect(() => {
    if (!privacyAccepted) return;
    if (completed || isInvitationCompleted) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [sectionIndex, privacyAccepted, completed, isInvitationCompleted]);

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
    const s1 = 'Datos Personales y de Contacto';
    const s2 = 'Autorización Actualización';
    setFormData((prev) => {
      const next = { ...prev };
      if (!next[s1]) next[s1] = {};
      if (!next[s2]) next[s2] = {};
      const c1 = { ...next[s1] };
      const c2 = { ...next[s2] };
      if (!c1.dp_nombre_completo?.trim() && invitation.candidate_name) c1.dp_nombre_completo = invitation.candidate_name;
      if (!c2.auth_fecha?.trim()) c2.auth_fecha = day;
      if (!c2.auth_nombre_declaracion?.trim() && invitation.candidate_name) c2.auth_nombre_declaracion = invitation.candidate_name;
      if (!c2.auth_nombre_firma?.trim() && invitation.candidate_name) c2.auth_nombre_firma = invitation.candidate_name;
      if (!c2.auth_empresa_solicitante?.trim() && invitation.study?.company_name) c2.auth_empresa_solicitante = invitation.study.company_name;
      const s3 = 'Información del Cónyuge, Familiares y Contacto';
      if (!next[s3]) next[s3] = {};
      const c3 = { ...next[s3] };
      if (!c3.contacto_telefono_celular?.trim() && invitation.candidate_phone) c3.contacto_telefono_celular = invitation.candidate_phone;
      if (!c3.contacto_correo_personal?.trim() && invitation.candidate_email) c3.contacto_correo_personal = invitation.candidate_email;
      next[s3] = c3;
      next[s1] = c1;
      next[s2] = c2;
      return next;
    });
  }, [privacyAccepted, invitation?.id, invitation?.candidate_name, invitation?.candidate_email, invitation?.candidate_phone, invitation?.study?.company_name]);

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
    if (sec === 'Datos Personales y de Contacto') {
      ['dp_nombre_completo', 'dp_fecha_nacimiento', 'dp_lugar_nacimiento', 'dp_nacionalidad', 'dp_sexo', 'dp_estado_civil'].forEach(req);
      req('dp_curp');
      req('dp_rfc');
      total++;
      const idOk =
        getField(sec, 'dp_id_ine') === '1' ||
        getField(sec, 'dp_id_pasaporte') === '1' ||
        getField(sec, 'dp_id_cedula_profesional') === '1';
      if (idOk) filled++;
      req('dp_id_numero');
      req('dp_id_vigencia');
      total++;
      if ((getField(sec, 'dp_identificacion_pdf') ?? '').trim()) filled++;
    } else if (sec === 'Autorización Actualización') {
      ['auth_nombre_declaracion', 'auth_empresa_solicitante', 'auth_nombre_firma', 'auth_firma_texto', 'auth_fecha'].forEach(req);
    } else if (sec === 'Domicilio') {
      ['dom_calle_numero', 'dom_colonia', 'dom_codigo_postal', 'dom_municipio_ciudad', 'dom_estado', 'dom_pais'].forEach(req);
      total++;
      const tipoOk = ['propia', 'rentada', 'familiar', 'prestada', 'otro'].includes(getField(sec, 'dom_tipo_vivienda'));
      if (tipoOk) filled++;
      if (getField(sec, 'dom_tipo_vivienda') === 'otro') req('dom_tipo_vivienda_otro');
      total++;
      if (['menos6', '6m_1a', '1a_2a', 'mas1a'].includes(getField(sec, 'dom_tiempo_residencia'))) filled++;
      total++;
      if ((getField(sec, 'dom_comprobante_domicilio_pdf') ?? '').trim()) filled++;
      const tiempoMenor2 = ['menos6', '6m_1a'].includes(getField(sec, 'dom_tiempo_residencia'));
      if (tiempoMenor2) {
        req('dom_anterior_completo');
        req('dom_anterior_periodo_de');
        req('dom_anterior_periodo_a');
        total++;
        const motivoOk = ['cambio_laboral', 'cambio_familiar', 'renta_compra', 'otro'].includes(getField(sec, 'dom_anterior_motivo'));
        if (motivoOk) filled++;
        if (getField(sec, 'dom_anterior_motivo') === 'otro') req('dom_anterior_motivo_otro');
      }
      total++;
      if (getField(sec, 'dom_visita') === 'autorizo' || getField(sec, 'dom_visita') === 'no_autorizo') filled++;
      if (getField(sec, 'dom_visita') === 'autorizo') {
        req('dom_visita_op1_fecha');
        req('dom_visita_op1_hora');
        req('dom_visita_op2_fecha');
        req('dom_visita_op2_hora');
      }
    } else if (sec === 'Información del Cónyuge, Familiares y Contacto') {
      req('contacto_telefono_celular');
      req('contacto_correo_personal');
      req('contacto_emergencia_nombre');
      req('contacto_emergencia_parentesco');
      req('contacto_emergencia_telefono');
    } else if (sec === 'Historia Laboral') {
      // Single job section (3.1) uses hl_ant_* slots with an "Actual" toggle:
      // - When Actual is selected, end date (periodo_a) and motivo_termino are not required.
      const antCount = Math.max(1, Math.min(10, parseInt(getField(sec, 'hl_ant_count') || '1', 10) || 1));
      if (getField(sec, 'hl_periodos_sin_empleo') === 'si') {
        total++;
        if (['busqueda', 'estudios', 'familiar', 'salud', 'otro'].includes(getField(sec, 'hl_periodos_sin_empleo_motivo'))) filled++;
        if (getField(sec, 'hl_periodos_sin_empleo_motivo') === 'otro') req('hl_periodos_sin_empleo_otro');
      }
      for (let i = 0; i < antCount; i++) {
        req(`hl_ant_${i}_empresa`);
        req(`hl_ant_${i}_puesto`);
        req(`hl_ant_${i}_area`);
        req(`hl_ant_${i}_periodo_de`);

        const isActual = getField(sec, `hl_ant_${i}_a_actual`) === '1';
        if (!isActual) {
          req(`hl_ant_${i}_periodo_a`);
          req(`hl_ant_${i}_motivo_termino`);
        }

        total++;
        const imssValue = getField(sec, `hl_ant_${i}_imss_registro`);
        if (imssValue === 'si' || imssValue === 'no') filled++;

        // Reference fields are required only for previous employments.
        if (!isActual) {
          req(`hl_ant_${i}_ref_nombre`);
          req(`hl_ant_${i}_ref_puesto`);
          req(`hl_ant_${i}_ref_telefono`);
        }
      }
      total++;
      if ((getField(sec, 'hl_constancia_imss_pdf') ?? '').trim()) filled++;
    } else if (sec === 'Ingresos y Situación Económica') {
      total++;
      if (['menos10k', '10_15', '15_20', '20_30', '30_40', '40_50', 'mas50'].includes(getField(sec, 'ie_rango'))) filled++;
      reqYn('ie_ingresos_adicionales');
      reqYn('ie_buro_problema');
      if (getField(sec, 'ie_buro_otro') === '1') req('ie_buro_otro_texto');
    } else if (sec === 'Escolaridad y Capacitación') {
      total++;
      if (['primaria', 'secundaria', 'bachillerato', 'carrera_tecnica', 'licenciatura'].includes(getField(sec, 'esc_nivel'))) filled++;
      total++;
      if (['concluido', 'trunco', 'en_curso'].includes(getField(sec, 'esc_estatus'))) filled++;
      total++;
      if (['si', 'no', 'tramite'].includes(getField(sec, 'esc_documentacion'))) filled++;
      if (getField(sec, 'esc_estudiando_actual') === 'si') {
        req('esc_estudiando_que');
        req('esc_estudiando_institucion');
      }
    } else if (sec === 'Bienestar y Antecedentes Legales') {
      total++;
      if (['no', 'ocasional', 'frecuente'].includes(getField(sec, 'bw_alcohol'))) filled++;
      total++;
      if (['no', 'si'].includes(getField(sec, 'bw_tabaco'))) filled++;
      reqYn('bw_sustancia_prohibida');
    } else if (sec === 'Información Legal y Trámite de Carta de No Antecedentes Penales') {
      reqYn('al_legal');
      // al_legal_texto is optional when "si"
      total++;
      if (getField(sec, 'cap_tramite') === 'autorizo' || getField(sec, 'cap_tramite') === 'no_autorizo') filled++;
      if (getField(sec, 'cap_tramite') === 'autorizo') {
        req('cap_doc_acta');
        req('cap_doc_ine');
        req('cap_doc_foto');
      }
    } else if (sec === 'Entorno Social y Condiciones de Vivienda') {
      total++;
      if (['residencial', 'popular', 'campestre', 'industrial', 'turistica', 'otro'].includes(getField(sec, 'vivi_zona'))) filled++;
      if (getField(sec, 'vivi_zona') === 'otro') req('vivi_zona_otro');
      total++;
      if (['casa', 'departamento', 'condominio', 'unidad'].includes(getField(sec, 'vivi_tipo'))) filled++;
      total++;
      if (['privado', 'abierto', 'seguridad', 'otro'].includes(getField(sec, 'vivi_colonia_tipo'))) filled++;
      if (getField(sec, 'vivi_colonia_tipo') === 'otro') req('vivi_colonia_otro');
      total++;
      if (['industrial', 'comercial', 'ejidal', 'otro'].includes(getField(sec, 'vivi_actividad_vecinal'))) filled++;
      if (getField(sec, 'vivi_actividad_vecinal') === 'otro') req('vivi_actividad_vecinal_otro');
      total++;
      if (['publico', 'propio', 'empresa', 'pie', 'otro'].includes(getField(sec, 'transporte_medio'))) filled++;
      total++;
      if (['menos30', '30_60', 'mas60'].includes(getField(sec, 'transporte_tiempo'))) filled++;
    } else if (sec === 'Referencias Personales') {
      // Require 2 references: each must have nombre_completo, parentesco, telefono, vive_con_evaluado (si/no)
      for (const idx of [0, 1]) {
        req(`${idx}_ref_nombre_completo`);
        req(`${idx}_ref_parentesco`);
        req(`${idx}_ref_telefono`);
        total++;
        if (getField(sec, `${idx}_ref_vive_con_evaluado`) === 'si' || getField(sec, `${idx}_ref_vive_con_evaluado`) === 'no') filled++;
      }
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

  const uploadPhotoParticipante = (file: File): Promise<string> => {
    const ok = /^image\/(jpeg|jpg|png)$/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!ok) return Promise.reject(new Error('Solo se permiten imágenes PNG o JPG.'));
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('La imagen no debe superar 5 MB.'));
    return uploadFile(file, 'foto_participante');
  };

  const uploadPdfIdentificacionOficial = (file: File): Promise<string> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return Promise.reject(new Error('Solo se permite archivo PDF.'));
    }
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('El PDF no debe superar 5 MB.'));
    return uploadFile(file, 'identificacion_oficial');
  };

  const uploadPdfEscolaridadDocumentacion = (file: File): Promise<string> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return Promise.reject(new Error('Solo se permite archivo PDF.'));
    }
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('El PDF no debe superar 5 MB.'));
    return uploadFile(file, 'escolaridad_documentacion');
  };

  const uploadDomicilioComprobante = (file: File): Promise<string> => {
    const max = 5 * 1024 * 1024;
    if (file.size > max) return Promise.reject(new Error('El archivo no debe superar 5 MB.'));
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isPdf && !isImage) {
      return Promise.reject(new Error('Solo se permiten archivos PDF o imagenes JPG, PNG o WEBP.'));
    }
    return uploadFile(file, 'domicilio_comprobante_actual');
  };

  const uploadHistoriaLaboralPdf = (
    file: File,
    kind: 'referencia_laboral' | 'constancia_imss' | 'documentacion_adicional'
  ): Promise<string> => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return Promise.reject(new Error('Solo se permite archivo PDF.'));
    }
    if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('El PDF no debe superar 5 MB.'));
    const types = {
      referencia_laboral: 'historia_laboral_referencia_laboral',
      constancia_imss: 'historia_laboral_constancia_imss',
      documentacion_adicional: 'historia_laboral_documentacion_adicional',
    } as const;
    return uploadFile(file, types[kind]);
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
          {sec === 'Datos Personales y de Contacto' && (
            <SectionDatosPersonalesContacto
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadPdfIdentificacion={uploadPdfIdentificacionOficial}
              fotoParticipanteUploading={fotoParticipanteUploading}
              setFotoParticipanteUploading={setFotoParticipanteUploading}
              uploadPhotoParticipante={uploadPhotoParticipante}
            />
          )}

          {sec === 'Autorización Actualización' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#111', lineHeight: 1.35 }}>1.3. AUTORIZACIÓN Y CONSENTIMIENTO PARA VALIDACIÓN DE INFORMACIÓN</h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Yo,{' '}
                <input
                  type="text"
                  value={getField(sec, 'auth_nombre_declaracion')}
                  onChange={(e) => updateField(sec, 'auth_nombre_declaracion', e.target.value)}
                  placeholder="Nombre completo"
                  style={{ minWidth: 280, maxWidth: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
                />
                , manifiesto de manera libre y voluntaria que autorizo a HR Capital Working, S.A. de C.V. para que, con fines exclusivamente laborales, realice la recopilación, verificación y análisis de información relacionada con mi persona, como parte del proceso de evaluación y/o integración de mi estudio socioeconómico y laboral.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Autorizo que la información que podrá ser consultada y validada incluye, de manera enunciativa más no limitativa:
              </p>
              <ul style={{ margin: '0 0 16px 24px', padding: 0, lineHeight: 1.8, color: '#334155' }}>
                <li>Historial de empleo</li>
                <li>Información académica y educativa</li>
                <li>Información de carácter legal disponible mediante documentos oficiales</li>
                <li>Referencias personales y laborales proporcionadas por el evaluado y/o identificadas durante el proceso de verificación</li>
                <li>Revisión informativa en fuentes de acceso público</li>
              </ul>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Asimismo, libero de toda responsabilidad a HR Capital Working, S.A. de C.V., así como a las personas, empresas o instituciones que proporcionen información, respecto del uso y análisis de los datos obtenidos, los cuales serán utilizados exclusivamente con fines de evaluación laboral, conforme a los alcances del estudio y a la información disponible al momento de su integración.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Entiendo y acepto que la información recabada será utilizada únicamente para fines de evaluación laboral, como parte del proceso interno de la empresa solicitante del estudio, misma que podrá variar según el proceso en el que participe.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#334155' }}>
                Declaro que la información que proporcione es verídica y que conozco el alcance del presente consentimiento.
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'grid', gap: 14 }}>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Empresa solicitante del estudio: *</label><input type="text" value={getField(sec, 'auth_empresa_solicitante')} onChange={(e) => updateField(sec, 'auth_empresa_solicitante', e.target.value)} placeholder="Nombre de la empresa" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre completo del evaluado: *</label><input type="text" value={getField(sec, 'auth_nombre_firma')} onChange={(e) => updateField(sec, 'auth_nombre_firma', e.target.value)} placeholder="Nombre completo" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Firma: *</label><input type="text" value={getField(sec, 'auth_firma_texto')} onChange={(e) => updateField(sec, 'auth_firma_texto', e.target.value)} placeholder="Escriba su nombre completo a modo de firma" style={{ width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
                <div><label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Fecha: *</label><input type="date" value={getField(sec, 'auth_fecha')} onChange={(e) => updateField(sec, 'auth_fecha', e.target.value)} style={{ width: '100%', maxWidth: 280, padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
              </div>
            </div>
          )}

          {sec === 'Domicilio' && (
            <SectionDomicilio
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadDomicilioComprobante={uploadDomicilioComprobante}
            />
          )}

          {sec === 'Información del Cónyuge, Familiares y Contacto' && (
            <SectionInformacionConyugeFamiliaresContacto sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Historia Laboral' && (
            <SectionHistoriaLaboral
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadHistoriaLaboralPdf={uploadHistoriaLaboralPdf}
            />
          )}

          {sec === 'Ingresos y Situación Económica' && (
            <SectionIngresosEconomicos sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Escolaridad y Capacitación' && (
            <SectionEscolaridadCapacitacion
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadPdfEscolaridadDocumentacion={uploadPdfEscolaridadDocumentacion}
            />
          )}

          {sec === 'Bienestar y Antecedentes Legales' && (
            <SectionBienestarAntecedentes sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Información Legal y Trámite de Carta de No Antecedentes Penales' && (
            <SectionInformacionLegalCarta
              sec={sec}
              getField={getField}
              updateField={updateField}
              uploadCapFile={uploadCapFile}
            />
          )}

          {sec === 'Entorno Social y Condiciones de Vivienda' && (
            <SectionEntornoSocialVivienda sec={sec} getField={getField} updateField={updateField} />
          )}

          {sec === 'Referencias Personales' && (
            <SectionReferenciasPersonales sec={sec} getField={getField} updateField={updateField} />
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

function SectionDomicilio({
  sec,
  getField,
  updateField,
  uploadDomicilioComprobante,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadDomicilioComprobante: (f: File) => Promise<string>;
}) {
  const [domComprobanteUploading, setDomComprobanteUploading] = useState(false);
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14 };
  const tiempoMenor2 = ['menos6', '6m_1a'].includes(getField(sec, 'dom_tiempo_residencia'));

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>1.4. DOMICILIO</h2>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div><label style={labelStyle}>Calle y número *</label><input type="text" value={getField(sec, 'dom_calle_numero')} onChange={(e) => updateField(sec, 'dom_calle_numero', e.target.value)} placeholder="Calle y número" style={inputStyle} /></div>
          <div><label style={labelStyle}>Colonia *</label><input type="text" value={getField(sec, 'dom_colonia')} onChange={(e) => updateField(sec, 'dom_colonia', e.target.value)} placeholder="Colonia" style={inputStyle} /></div>
          <div><label style={labelStyle}>Código Postal *</label><input type="text" value={getField(sec, 'dom_codigo_postal')} onChange={(e) => updateField(sec, 'dom_codigo_postal', e.target.value)} placeholder="Código Postal" style={inputStyle} /></div>
          <div><label style={labelStyle}>Municipio / Ciudad *</label><input type="text" value={getField(sec, 'dom_municipio_ciudad')} onChange={(e) => updateField(sec, 'dom_municipio_ciudad', e.target.value)} placeholder="Municipio o ciudad" style={inputStyle} /></div>
          <div><label style={labelStyle}>Estado *</label><input type="text" value={getField(sec, 'dom_estado')} onChange={(e) => updateField(sec, 'dom_estado', e.target.value)} placeholder="Estado" style={inputStyle} /></div>
          <div><label style={labelStyle}>País *</label><input type="text" value={getField(sec, 'dom_pais')} onChange={(e) => updateField(sec, 'dom_pais', e.target.value)} placeholder="País" style={inputStyle} /></div>
        </div>
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>Tipo de vivienda: *</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          {[['propia', 'Propia'], ['rentada', 'Rentada'], ['familiar', 'Familiar'], ['prestada', 'Prestada'], ['otro', 'Otro']].map(([k, lab]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="dom_tipo_vivienda" checked={getField(sec, 'dom_tipo_vivienda') === k} onChange={() => updateField(sec, 'dom_tipo_vivienda', k)} />
              {lab}
            </label>
          ))}
        </div>
        {getField(sec, 'dom_tipo_vivienda') === 'otro' && (
          <input type="text" value={getField(sec, 'dom_tipo_vivienda_otro')} onChange={(e) => updateField(sec, 'dom_tipo_vivienda_otro', e.target.value)} placeholder="Especificar" style={{ ...inputStyle, marginTop: 8 }} />
        )}
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>Tiempo de residencia en el domicilio actual: *</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[['menos6', 'Menos de 1 año'], ['6m_1a', 'De 1 año a 2 años'], ['1a_2a', 'De 2 años a 5 años'], ['mas1a', 'Más de 5 años']].map(([k, lab]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="dom_tiempo_residencia" checked={getField(sec, 'dom_tiempo_residencia') === k} onChange={() => updateField(sec, 'dom_tiempo_residencia', k)} />
              {lab}
            </label>
          ))}
        </div>
      </div>

      <div style={{ padding: 20, background: '#eff6ff', borderRadius: 12, border: '1px solid #93c5fd' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#1e3a5f' }}>Comprobante de domicilio con una antiguedad no mayor de 3 meses. *</p>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Formato permitido: PDF o imagen. Peso máximo: 5 MB.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ cursor: domComprobanteUploading ? 'wait' : 'pointer' }}>
            <input
              type="file"
              accept=".pdf,application/pdf,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              disabled={domComprobanteUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setDomComprobanteUploading(true);
                uploadDomicilioComprobante(f)
                  .then((url) => updateField(sec, 'dom_comprobante_domicilio_pdf', url))
                  .catch((err) => alert(err?.message || 'Error al subir el archivo.'))
                  .finally(() => {
                    setDomComprobanteUploading(false);
                    e.target.value = '';
                  });
              }}
            />
            <span style={{ display: 'inline-block', padding: '10px 18px', background: domComprobanteUploading ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
              {domComprobanteUploading ? 'Subiendo…' : 'Subir archivo'}
            </span>
          </label>
          {getField(sec, 'dom_comprobante_domicilio_pdf') ? (
            <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
          ) : (
            <span style={{ color: '#b45309', fontSize: 14, fontWeight: 600 }}>Archivo requerido</span>
          )}
        </div>
      </div>

      {tiempoMenor2 && (
        <div style={{ padding: 20, background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>1.4.1 Domicilio Anterior</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>(Aplica cuando el tiempo en el domicilio actual es menor a 2 años)</p>
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label style={labelStyle}>Domicilio completo anterior: *</label><textarea value={getField(sec, 'dom_anterior_completo')} onChange={(e) => updateField(sec, 'dom_anterior_completo', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={labelStyle}>Periodo de residencia (de) *</label><input type="date" value={getField(sec, 'dom_anterior_periodo_de')} onChange={(e) => updateField(sec, 'dom_anterior_periodo_de', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Periodo de residencia (a) *</label><input type="date" value={getField(sec, 'dom_anterior_periodo_a')} onChange={(e) => updateField(sec, 'dom_anterior_periodo_a', e.target.value)} style={inputStyle} /></div>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>Motivo del cambio de domicilio: *</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                {[['cambio_laboral', 'Cambio laboral'], ['cambio_familiar', 'Cambio familiar'], ['renta_compra', 'Renta / compra de vivienda'], ['otro', 'Otro']].map(([k, lab]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name="dom_anterior_motivo" checked={getField(sec, 'dom_anterior_motivo') === k} onChange={() => updateField(sec, 'dom_anterior_motivo', k)} />
                    {lab}
                  </label>
                ))}
              </div>
              {getField(sec, 'dom_anterior_motivo') === 'otro' && (
                <input type="text" value={getField(sec, 'dom_anterior_motivo_otro')} onChange={(e) => updateField(sec, 'dom_anterior_motivo_otro', e.target.value)} placeholder="Especificar" style={{ ...inputStyle, marginTop: 8 }} />
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>1.4.2. AUTORIZACIÓN PARA VERIFICACIÓN DOMICILIARIA</h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#334155' }}>
          Autorizo a HR Capital Working, S.A. de C.V. a realizar una visita domiciliaria con fines de verificación socioeconómica, la cual consistirá únicamente en la toma de fotografía del exterior del domicilio señalado por mí, así como la validación del entorno habitacional inmediato.
        </p>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: '#334155' }}>
          Manifiesto que entiendo que esta visita no incluye acceso al interior del domicilio, entrevistas con vecinos, ni grabaciones audiovisuales adicionales, y que su finalidad es exclusivamente administrativa y laboral.
        </p>
        <p style={{ margin: '16px 0 8px', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Datos para programación de la visita (Indique al menos 2 opciones de fecha y horario)</p>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Días y horarios preferentes para la visita:</p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600 }}>Opción 1 – Fecha *</label><input type="date" value={getField(sec, 'dom_visita_op1_fecha')} onChange={(e) => updateField(sec, 'dom_visita_op1_fecha', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600 }}>Horario *</label><input type="text" placeholder="ej. 10:00–14:00" value={getField(sec, 'dom_visita_op1_hora')} onChange={(e) => updateField(sec, 'dom_visita_op1_hora', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600 }}>Opción 2 – Fecha *</label><input type="date" value={getField(sec, 'dom_visita_op2_fecha')} onChange={(e) => updateField(sec, 'dom_visita_op2_fecha', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600 }}>Horario *</label><input type="text" placeholder="ej. Sábado mañana" value={getField(sec, 'dom_visita_op2_hora')} onChange={(e) => updateField(sec, 'dom_visita_op2_hora', e.target.value)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }} /></div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Referencias o señas del domicilio (calles, puntos de referencia)</label>
          <textarea value={getField(sec, 'dom_senas_opcional')} onChange={(e) => updateField(sec, 'dom_senas_opcional', e.target.value)} rows={2} placeholder="Calles, puntos de referencia para ubicar el domicilio" style={{ ...inputStyle, marginTop: 4 }} />
        </div>
        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>Autorización:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" onClick={() => updateField(sec, 'dom_visita', 'autorizo')} style={{ padding: '10px 18px', borderRadius: 8, border: getField(sec, 'dom_visita') === 'autorizo' ? '2px solid #14532d' : '2px solid #64748b', background: getField(sec, 'dom_visita') === 'autorizo' ? '#15803d' : '#f1f5f9', color: getField(sec, 'dom_visita') === 'autorizo' ? '#ffffff' : '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Autorizo la visita domiciliaria</button>
          <button type="button" onClick={() => updateField(sec, 'dom_visita', 'no_autorizo')} style={{ padding: '10px 18px', borderRadius: 8, border: getField(sec, 'dom_visita') === 'no_autorizo' ? '2px solid #7f1d1d' : '2px solid #64748b', background: getField(sec, 'dom_visita') === 'no_autorizo' ? '#b91c1c' : '#f1f5f9', color: getField(sec, 'dom_visita') === 'no_autorizo' ? '#ffffff' : '#0f172a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>No autorizo la visita domiciliaria</button>
        </div>
      </div>
    </div>
  );
}

function SectionDatosPersonalesContacto({
  sec,
  getField,
  updateField,
  uploadPdfIdentificacion,
  fotoParticipanteUploading,
  setFotoParticipanteUploading,
  uploadPhotoParticipante,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadPdfIdentificacion: (f: File) => Promise<string>;
  fotoParticipanteUploading: boolean;
  setFotoParticipanteUploading: (v: boolean) => void;
  uploadPhotoParticipante: (f: File) => Promise<string>;
}) {
  const [pdfUploading, setPdfUploading] = useState(false);
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14 };

  const handlePdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPdfUploading(true);
    uploadPdfIdentificacion(f)
      .then((url) => updateField(sec, 'dp_identificacion_pdf', url))
      .catch((err) => alert(err?.message || 'Error al subir el PDF.'))
      .finally(() => {
        setPdfUploading(false);
        e.target.value = '';
      });
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>DATOS PERSONALES Y DE CONTACTO</h2>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>DATOS PERSONALES DEL EVALUADO</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre completo (sin abreviaturas) *</label>
            <input type="text" value={getField(sec, 'dp_nombre_completo')} onChange={(e) => updateField(sec, 'dp_nombre_completo', e.target.value)} placeholder="Nombre completo" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Fecha de nacimiento *</label>
            <input type="date" value={getField(sec, 'dp_fecha_nacimiento')} onChange={(e) => updateField(sec, 'dp_fecha_nacimiento', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Lugar de nacimiento (Estado / País) *</label>
            <input type="text" value={getField(sec, 'dp_lugar_nacimiento')} onChange={(e) => updateField(sec, 'dp_lugar_nacimiento', e.target.value)} placeholder="Ej. Ciudad de México, México" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nacionalidad *</label>
            <input type="text" value={getField(sec, 'dp_nacionalidad')} onChange={(e) => updateField(sec, 'dp_nacionalidad', e.target.value)} placeholder="Ej. Mexicana" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sexo *</label>
            <select value={getField(sec, 'dp_sexo')} onChange={(e) => updateField(sec, 'dp_sexo', e.target.value)} style={inputStyle}>
              <option value="">Seleccione</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estado civil *</label>
            <select value={getField(sec, 'dp_estado_civil')} onChange={(e) => updateField(sec, 'dp_estado_civil', e.target.value)} style={inputStyle}>
              <option value="">Seleccione</option>
              <option value="Soltero(a)">Soltero(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Unión libre">Unión libre</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viudo(a)">Viudo(a)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>1.2. DATOS DE IDENTIFICACIÓN OFICIAL</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>CURP *</label>
            <input type="text" value={getField(sec, 'dp_curp')} onChange={(e) => updateField(sec, 'dp_curp', e.target.value)} placeholder="Clave Única de Registro de Población" style={inputStyle} maxLength={18} />
          </div>
          <div>
            <label style={labelStyle}>RFC *</label>
            <input type="text" value={getField(sec, 'dp_rfc')} onChange={(e) => updateField(sec, 'dp_rfc', e.target.value)} placeholder="Registro Federal de Contribuyentes" style={inputStyle} />
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>Número de Identificación Oficial presentada *</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={getField(sec, 'dp_id_ine') === '1'} onChange={(e) => updateField(sec, 'dp_id_ine', e.target.checked ? '1' : '')} />
                INE
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={getField(sec, 'dp_id_pasaporte') === '1'} onChange={(e) => updateField(sec, 'dp_id_pasaporte', e.target.checked ? '1' : '')} />
                Pasaporte
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={getField(sec, 'dp_id_cedula_profesional') === '1'} onChange={(e) => updateField(sec, 'dp_id_cedula_profesional', e.target.checked ? '1' : '')} />
                Cedula Profesional
              </label>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Número de identificación *</label>
            <input type="text" value={getField(sec, 'dp_id_numero')} onChange={(e) => updateField(sec, 'dp_id_numero', e.target.value)} placeholder="Número del documento" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Vigencia del documento *</label>
            <input type="date" value={getField(sec, 'dp_id_vigencia')} onChange={(e) => updateField(sec, 'dp_id_vigencia', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#1e3a5f' }}>Subir archivo de identificación en PDF *</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Formato permitido: PDF únicamente. Peso máximo: 5 MB.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ cursor: pdfUploading ? 'wait' : 'pointer' }}>
                <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} disabled={pdfUploading} onChange={handlePdf} />
                <span style={{ display: 'inline-block', padding: '10px 18px', background: pdfUploading ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>{pdfUploading ? 'Subiendo…' : 'Subir PDF'}</span>
              </label>
              {getField(sec, 'dp_identificacion_pdf') ? (
                <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
              ) : (
                <span style={{ color: '#b45309', fontSize: 14, fontWeight: 600 }}>Archivo requerido</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 14 }}>Fotografía del empleado <span style={{ color: '#64748b', fontWeight: 500 }}>(opcional)</span></p>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Puede subir su fotografía en formato PNG o JPG. Peso máximo: 5 MB.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ cursor: fotoParticipanteUploading ? 'wait' : 'pointer' }}>
            <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" style={{ display: 'none' }} disabled={fotoParticipanteUploading} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setFotoParticipanteUploading(true); uploadPhotoParticipante(f).then((url) => { updateField(sec, 'foto_participante', url); }).catch((err) => alert(err?.message || 'Error al subir.')).finally(() => { setFotoParticipanteUploading(false); e.target.value = ''; }); }} />
            <span style={{ display: 'inline-block', padding: '10px 18px', background: fotoParticipanteUploading ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>{fotoParticipanteUploading ? 'Subiendo…' : 'Subir fotografía'}</span>
          </label>
          {getField(sec, 'foto_participante') ? (
            <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
          ) : (
            <span style={{ color: '#64748b', fontSize: 14 }}>Sin archivo</span>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionInformacionConyugeFamiliaresContacto({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14 };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>1.4.3. INFORMACIÓN DEL CÓNYUGE O PAREJA</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>(Completar únicamente si aplica)</p>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 14 }}>
        <div><label style={labelStyle}>Nombre completo</label><input type="text" value={getField(sec, 'conyuge_nombre_completo')} onChange={(e) => updateField(sec, 'conyuge_nombre_completo', e.target.value)} placeholder="Nombre completo" style={inputStyle} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Edad</label><input type="text" inputMode="numeric" value={getField(sec, 'conyuge_edad')} onChange={(e) => updateField(sec, 'conyuge_edad', e.target.value)} placeholder="Ej. 35" style={inputStyle} /></div>
          <div><label style={labelStyle}>Fecha de nacimiento</label><input type="date" value={getField(sec, 'conyuge_fecha_nacimiento')} onChange={(e) => updateField(sec, 'conyuge_fecha_nacimiento', e.target.value)} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Lugar de nacimiento</label><input type="text" value={getField(sec, 'conyuge_lugar_nacimiento')} onChange={(e) => updateField(sec, 'conyuge_lugar_nacimiento', e.target.value)} placeholder="Ciudad y estado" style={inputStyle} /></div>
      </div>

      <h3 style={{ margin: '8px 0 0', fontSize: 16, color: '#334155' }}>ACTIVIDAD ACTUAL</h3>
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 14 }}>
        <div><label style={labelStyle}>Actividad actual</label><input type="text" value={getField(sec, 'conyuge_actividad_actual')} onChange={(e) => updateField(sec, 'conyuge_actividad_actual', e.target.value)} placeholder="Ej. Empleado, Negocio propio" style={inputStyle} /></div>
        <div><label style={labelStyle}>Empresa donde labora</label><input type="text" value={getField(sec, 'conyuge_empresa')} onChange={(e) => updateField(sec, 'conyuge_empresa', e.target.value)} placeholder="Nombre de la empresa" style={inputStyle} /></div>
        <div><label style={labelStyle}>Puesto o actividad</label><input type="text" value={getField(sec, 'conyuge_puesto_actividad')} onChange={(e) => updateField(sec, 'conyuge_puesto_actividad', e.target.value)} placeholder="Puesto o actividad" style={inputStyle} /></div>
        <div><label style={labelStyle}>En caso de negocio propio, indicar actividad</label><input type="text" value={getField(sec, 'conyuge_negocio_propio_actividad')} onChange={(e) => updateField(sec, 'conyuge_negocio_propio_actividad', e.target.value)} placeholder="Descripción del negocio" style={inputStyle} /></div>
        <div><label style={labelStyle}>Ingreso aproximado que aporta al hogar (mensual)</label><input type="text" value={getField(sec, 'conyuge_ingreso_mensual_aporta')} onChange={(e) => updateField(sec, 'conyuge_ingreso_mensual_aporta', e.target.value)} placeholder="Monto aproximado en pesos" style={inputStyle} /></div>
      </div>

      <p style={{ margin: 0, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd', fontSize: 14, color: '#1e3a8a', lineHeight: 1.5 }}>
        <strong>Nota:</strong> Esta información es de carácter declarativo y se solicita únicamente para fines de integración del estudio socioeconómico.
      </p>

      <h2 style={{ margin: '16px 0 0', fontSize: 18, color: '#111' }}>1.4.4. DATOS GENERALES DE LOS FAMILIARES DEL PARTICIPANTE</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>(Padres y hermanos – información declarativa)</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, width: 80 }}>Familiar</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Nombre completo</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Parentesco</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, width: 60 }}>Edad</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Estado civil</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Ocupación / profesión</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Domicilio (ciudad y estado)</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Teléfono</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                <td style={{ padding: '8px', fontWeight: 600, color: '#475569' }}>{idx + 1}</td>
                {['nombre_completo', 'parentesco', 'edad', 'estado_civil', 'ocupacion', 'domicilio_ciudad_estado', 'telefono', 'observaciones'].map((key) => (
                  <td key={key} style={{ padding: '6px 8px' }}>
                    <input type="text" value={getField(sec, `${idx}_fam_${key}`)} onChange={(e) => updateField(sec, `${idx}_fam_${key}`, e.target.value)} placeholder={key === 'observaciones' ? 'Ej. Fallecido' : ''} style={{ width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, minWidth: key === 'nombre_completo' || key === 'domicilio_ciudad_estado' ? 140 : 80 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ margin: 0, padding: 14, background: '#fef3c7', borderRadius: 10, border: '1px solid #fcd34d', fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
        <strong>Nota:</strong> En caso de que alguno de los familiares haya fallecido, favor de indicarlo en la columna correspondiente de observaciones o parentesco.
      </p>

      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '24px 0' }} />
      <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 600 }}>Final del formulario</p>

      <h2 style={{ margin: '16px 0 0', fontSize: 18, color: '#111' }}>1.5 DATOS DE CONTACTO</h2>
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 14 }}>
        <div><label style={labelStyle}>Teléfono celular personal *</label><input type="tel" value={getField(sec, 'contacto_telefono_celular')} onChange={(e) => updateField(sec, 'contacto_telefono_celular', e.target.value)} placeholder="Teléfono celular" style={inputStyle} /></div>
        <div><label style={labelStyle}>Teléfono alterno</label><input type="tel" value={getField(sec, 'contacto_telefono_alterno')} onChange={(e) => updateField(sec, 'contacto_telefono_alterno', e.target.value)} placeholder="Teléfono alterno" style={inputStyle} /></div>
        <div><label style={labelStyle}>Correo electrónico personal *</label><input type="email" value={getField(sec, 'contacto_correo_personal')} onChange={(e) => updateField(sec, 'contacto_correo_personal', e.target.value)} placeholder="Correo electrónico" style={inputStyle} /></div>
      </div>

      <h3 style={{ margin: '16px 0 0', fontSize: 16, color: '#334155' }}>1.5.3. CONTACTO DE EMERGENCIA</h3>
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 14 }}>
        <div><label style={labelStyle}>Nombre completo *</label><input type="text" value={getField(sec, 'contacto_emergencia_nombre')} onChange={(e) => updateField(sec, 'contacto_emergencia_nombre', e.target.value)} placeholder="Nombre del contacto de emergencia" style={inputStyle} /></div>
        <div><label style={labelStyle}>Parentesco *</label><input type="text" value={getField(sec, 'contacto_emergencia_parentesco')} onChange={(e) => updateField(sec, 'contacto_emergencia_parentesco', e.target.value)} placeholder="Ej. Padre, Cónyuge, Hermano" style={inputStyle} /></div>
        <div><label style={labelStyle}>Teléfono *</label><input type="tel" value={getField(sec, 'contacto_emergencia_telefono')} onChange={(e) => updateField(sec, 'contacto_emergencia_telefono', e.target.value)} placeholder="Teléfono de contacto" style={inputStyle} /></div>
      </div>
    </div>
  );
}

function SectionHistoriaLaboral({
  sec,
  getField,
  updateField,
  uploadHistoriaLaboralPdf,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadHistoriaLaboralPdf: (f: File, kind: 'referencia_laboral' | 'constancia_imss' | 'documentacion_adicional') => Promise<string>;
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelReq = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14 };
  const labelOpt = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#64748b' };
  const antCount = Math.max(1, Math.min(10, parseInt(getField(sec, 'hl_ant_count') || '1', 10) || 1));
  const periodosSinSi = getField(sec, 'hl_periodos_sin_empleo') === 'si';
  const motivoOtro = getField(sec, 'hl_periodos_sin_empleo_motivo') === 'otro';

  const isJobActual = (i: number) => getField(sec, `hl_ant_${i}_a_actual`) === '1';
  const maybeClearIfHasValue = (k: string) => {
    if ((getField(sec, k) ?? '').trim()) updateField(sec, k, '');
  };

  const onToggleJobActual = (i: number, checked: boolean) => {
    updateField(sec, `hl_ant_${i}_a_actual`, checked ? '1' : '');
    // Keep DB/stored data consistent with the UI:
    // when Actual is selected, end date, termination reason, and reference contact data are not needed.
    if (checked) {
      maybeClearIfHasValue(`hl_ant_${i}_periodo_a`);
      maybeClearIfHasValue(`hl_ant_${i}_motivo_termino`);
      maybeClearIfHasValue(`hl_ant_${i}_ref_nombre`);
      maybeClearIfHasValue(`hl_ant_${i}_ref_puesto`);
      maybeClearIfHasValue(`hl_ant_${i}_ref_telefono`);
    }
  };

  const clearJobFields = (jobIndex: number) => {
    // Clear all stored fields for a given employment slot.
    const fields = [
      'empresa',
      'puesto',
      'area',
      'periodo_de',
      'a_actual',
      'periodo_a',
      'imss_registro',
      'motivo_termino',
      'jefe',
      'ref_nombre',
      'ref_puesto',
      'ref_telefono',
      'referencia_pdf',
      'observaciones',
    ];
    fields.forEach((f) => updateField(sec, `hl_ant_${jobIndex}_${f}`, ''));
  };

  const removeEmployment = (i: number) => {
    // Remove employment slots starting at index i (i>0 only).
    if (i <= 0) return;
    for (let j = i; j < 10; j++) clearJobFields(j);
    updateField(sec, 'hl_ant_count', String(i)); // keep slots [0..i-1]
  };

  const uploadPdfField = (
    file: File,
    fieldKey: string,
    kind: 'referencia_laboral' | 'constancia_imss' | 'documentacion_adicional'
  ) => {
    if (!file) return;
    setUploadingKey(fieldKey);
    uploadHistoriaLaboralPdf(file, kind)
      .then((url) => updateField(sec, fieldKey, url))
      .catch((err) => alert(err?.message || 'Error al subir el PDF.'))
      .finally(() => setUploadingKey(null));
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>HISTORIA LABORAL</h2>
      <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
        {'Favor de registrar su historial laboral iniciando por su empleo actual o el mas reciente, continuando hacia los anteriores.'}
      </p>
      <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
        {'Las referencias laborales de empleos anteriores podran ser contactadas como parte del proceso de validacion del estudio socioeconomico.'}
      </p>
      <div style={{ padding: 16, background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa', color: '#7c2d12', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 800 }}>Nota importante:</p>
        <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>
          {'"El empleo actual se registra unicamente con fines informativos y no sera contactado como referencia laboral."'}
        </p>
        <p style={{ margin: 0 }}>
          {'La omision de referencia laboral del empleo actual es una practica estandar para evitar afectaciones al evaluado.'}
        </p>
      </div>
      {false && (
        <>
      <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
        Favor de registrar su historial laboral iniciando por su empleo actual o el más reciente, continuando hacia los anteriores.
      </p>
      <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
        Las referencias laborales de empleos anteriores podrÃ¡n ser contactadas como parte del proceso de validaciÃ³n del estudio socioeconÃ³mico.
      </p>
      <div style={{ padding: 16, background: '#fff7ed', borderRadius: 12, border: '1px solid #fed7aa', color: '#7c2d12', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 6px', fontWeight: 800 }}>Nota importante:</p>
        <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>
          â€œEl empleo actual se registra Ãºnicamente con fines informativos y no serÃ¡ contactado como referencia laboral.â€
        </p>
        <p style={{ margin: 0 }}>
          La omisiÃ³n de referencia laboral del empleo actual es una prÃ¡ctica estÃ¡ndar para evitar afectaciones al evaluado.
        </p>
      </div>
        </>
      )}
      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Los campos marcados con (*) son obligatorios.</p>

      {/* 3.1 ÚNICO SECCIÓN DE EMPLEOS (incluye empleo actual vía toggle "Actual") */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>3.1 EMPLEOS ACTUAL O ANTERIORES CON ANTIGÜEDAD HASTA 10 AÑOS</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>Registrar al menos los últimos 3 empleos o 10 años, lo que ocurra primero.</p>

        {Array.from({ length: antCount }, (_, i) => (
          <div key={i} style={{ marginBottom: 20, padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: '#475569' }}>{`Empleo ${i + 1}`}</h4>
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => removeEmployment(i)}
                  style={{
                    padding: '8px 12px',
                    background: '#fee2e2',
                    border: '2px solid #fecaca',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 900,
                    color: '#991b1b',
                    fontSize: 13,
                  }}
                >
                  Quitar empleo
                </button>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div><label style={labelReq}>Empresa *</label><input type="text" value={getField(sec, `hl_ant_${i}_empresa`)} onChange={(e) => updateField(sec, `hl_ant_${i}_empresa`, e.target.value)} placeholder="Nombre de la empresa" style={inputStyle} /></div>
              <div><label style={labelReq}>Puesto *</label><input type="text" value={getField(sec, `hl_ant_${i}_puesto`)} onChange={(e) => updateField(sec, `hl_ant_${i}_puesto`, e.target.value)} placeholder="Puesto" style={inputStyle} /></div>
              <div><label style={labelReq}>Área / Departamento *</label><input type="text" value={getField(sec, `hl_ant_${i}_area`)} onChange={(e) => updateField(sec, `hl_ant_${i}_area`, e.target.value)} placeholder="Área" style={inputStyle} /></div>

              <div>
                <label style={labelReq}>Periodo laborado *</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>De</span>
                  <input
                    type="text"
                    value={getField(sec, `hl_ant_${i}_periodo_de`)}
                    onChange={(e) => updateField(sec, `hl_ant_${i}_periodo_de`, e.target.value)}
                    placeholder="Ej. 01/2018"
                    style={{ ...inputStyle, maxWidth: 160 }}
                  />

                  <span>a</span>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isJobActual(i)}
                      onChange={(e) => onToggleJobActual(i, e.target.checked)}
                    />
                    <span>Actual</span>
                  </label>

                  {!isJobActual(i) && (
                    <input
                      type="text"
                      value={getField(sec, `hl_ant_${i}_periodo_a`)}
                      onChange={(e) => updateField(sec, `hl_ant_${i}_periodo_a`, e.target.value)}
                      placeholder="Ej. 12/2020"
                      style={{ ...inputStyle, maxWidth: 160 }}
                    />
                  )}
                </div>
              </div>

              {!isJobActual(i) && (
                <div>
                  <label style={labelReq}>Motivo de término de la relación laboral *</label>
                  <input type="text" value={getField(sec, `hl_ant_${i}_motivo_termino`)} onChange={(e) => updateField(sec, `hl_ant_${i}_motivo_termino`, e.target.value)} placeholder="Motivo" style={inputStyle} />
                </div>
              )}

              <YnRow
                label={
                  isJobActual(i)
                    ? '\u00BFSu empleo actual cuenta con registros ante el Instituto Mexicano del Seguro Social (IMSS)? *'
                    : '\u00BFEste empleo conto con registros ante el Instituto Mexicano del Seguro Social (IMSS)? *'
                }
                value={getField(sec, `hl_ant_${i}_imss_registro`)}
                onChange={(v) => updateField(sec, `hl_ant_${i}_imss_registro`, v)}
              />

              {false && (
              <YnRow
                label={
                  isJobActual(i)
                    ? 'Â¿Su empleo actual cuenta con registros ante el Instituto Mexicano del Seguro Social (IMSS)? *'
                    : 'Â¿Este empleo contÃ³ con registros ante el Instituto Mexicano del Seguro Social (IMSS)? *'
                }
                value={getField(sec, `hl_ant_${i}_imss_registro`)}
                onChange={(v) => updateField(sec, `hl_ant_${i}_imss_registro`, v)}
              />

              )}

              <div>
                <label style={labelOpt}>Nombre del jefe inmediato</label>
                <input type="text" value={getField(sec, `hl_ant_${i}_jefe`)} onChange={(e) => updateField(sec, `hl_ant_${i}_jefe`, e.target.value)} placeholder="Jefe inmediato" style={inputStyle} />
              </div>

              {isJobActual(i) ? (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #cbd5e1', color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                  {'Para el empleo actual no se solicitan datos de referencia laboral de contacto.'}
                </div>
              ) : (
                <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 13 }}>Referencia laboral *</p>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div><label style={labelReq}>Nombre</label><input type="text" value={getField(sec, `hl_ant_${i}_ref_nombre`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_nombre`, e.target.value)} placeholder="Nombre del referente" style={inputStyle} /></div>
                    <div><label style={labelReq}>Puesto</label><input type="text" value={getField(sec, `hl_ant_${i}_ref_puesto`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_puesto`, e.target.value)} placeholder="Puesto del referente" style={inputStyle} /></div>
                    <div><label style={labelReq}>Telefono</label><input type="tel" value={getField(sec, `hl_ant_${i}_ref_telefono`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_telefono`, e.target.value)} placeholder="Telefono" style={inputStyle} /></div>
                  </div>
                </div>
              )}

              {false && (
              <div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 13 }}>Referencia laboral *</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div><label style={labelReq}>Nombre</label><input type="text" value={getField(sec, `hl_ant_${i}_ref_nombre`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_nombre`, e.target.value)} placeholder="Nombre del referente" style={inputStyle} /></div>
                  <div><label style={labelReq}>Puesto</label><input type="text" value={getField(sec, `hl_ant_${i}_ref_puesto`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_puesto`, e.target.value)} placeholder="Puesto del referente" style={inputStyle} /></div>
                  <div><label style={labelReq}>Teléfono</label><input type="tel" value={getField(sec, `hl_ant_${i}_ref_telefono`)} onChange={(e) => updateField(sec, `hl_ant_${i}_ref_telefono`, e.target.value)} placeholder="Teléfono" style={inputStyle} /></div>
                </div>
              </div>

              )}

              <div style={{ padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e3a5f' }}>Carta de referencia laboral (opcional)</p>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
                  Si cuenta con una carta de referencia laboral o constancia emitida por este empleo, puede adjuntarla en formato PDF. Peso mÃ¡ximo: 5 MB.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ cursor: uploadingKey === `hl_ant_${i}_referencia_pdf` ? 'wait' : 'pointer' }}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      disabled={uploadingKey !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        uploadPdfField(f, `hl_ant_${i}_referencia_pdf`, 'referencia_laboral');
                        e.target.value = '';
                      }}
                    />
                    <span style={{ display: 'inline-block', padding: '10px 18px', background: uploadingKey === `hl_ant_${i}_referencia_pdf` ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
                      {uploadingKey === `hl_ant_${i}_referencia_pdf` ? 'Subiendoâ€¦' : 'Subir PDF'}
                    </span>
                  </label>
                  {getField(sec, `hl_ant_${i}_referencia_pdf`) ? (
                    <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido âœ“</span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: 14 }}>Sin archivo</span>
                  )}
                </div>
              </div>

              <div><label style={labelOpt}>Observaciones</label><textarea value={getField(sec, `hl_ant_${i}_observaciones`)} onChange={(e) => updateField(sec, `hl_ant_${i}_observaciones`, e.target.value)} rows={2} style={inputStyle} placeholder="Opcional" /></div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => updateField(sec, 'hl_ant_count', String(Math.min(10, antCount + 1)))}
            disabled={antCount >= 10}
            style={{ padding: '10px 16px', background: antCount >= 10 ? '#9ca3af' : '#e2e8f0', border: '2px solid #475569', borderRadius: 8, cursor: antCount >= 10 ? 'not-allowed' : 'pointer', fontWeight: 800, color: '#0f172a', fontSize: 14 }}
          >
            + Agregar otro empleo
          </button>
        </div>
      </div>

      {/* 3.2 PERIODOS SIN EMPLEO */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>3.2 PERIODOS SIN EMPLEO</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>(Aplica únicamente si existieron periodos entre empleos)</p>
        <YnRow label="¿Hubo periodos sin empleo entre uno y otro trabajo?" value={getField(sec, 'hl_periodos_sin_empleo')} onChange={(v) => updateField(sec, 'hl_periodos_sin_empleo', v)} />
        {periodosSinSi && (
          <>
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>En caso afirmativo, indique el motivo general del(os) periodo(s):</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {[
                  ['busqueda', 'Búsqueda de empleo'],
                  ['estudios', 'Estudios'],
                  ['familiar', 'Situación familiar'],
                  ['salud', 'Problemas de salud'],
                  ['otro', 'Otro (especifique)'],
                ].map(([k, lab]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="hl_periodos_motivo" checked={getField(sec, 'hl_periodos_sin_empleo_motivo') === k} onChange={() => updateField(sec, 'hl_periodos_sin_empleo_motivo', k)} />
                    <span>{lab}</span>
                  </label>
                ))}
              </div>
              {motivoOtro && (
                <input
                  type="text"
                  value={getField(sec, 'hl_periodos_sin_empleo_otro')}
                  onChange={(e) => updateField(sec, 'hl_periodos_sin_empleo_otro', e.target.value)}
                  placeholder="Especifique"
                  style={{ ...inputStyle, marginTop: 10 }}
                />
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Especifique los periodos sin empleo:</p>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: '#64748b' }}>Periodo {j + 1}:</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                    <span>De</span>
                    <input type="text" value={getField(sec, `hl_periodo_sin_${j}_de`)} onChange={(e) => updateField(sec, `hl_periodo_sin_${j}_de`, e.target.value)} placeholder="Ej. 01/2019" style={{ ...inputStyle, maxWidth: 120 }} />
                    <span>a</span>
                    <input type="text" value={getField(sec, `hl_periodo_sin_${j}_a`)} onChange={(e) => updateField(sec, `hl_periodo_sin_${j}_a`, e.target.value)} placeholder="Ej. 06/2019" style={{ ...inputStyle, maxWidth: 120 }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>{'3.3 DOCUMENTACION DE RESPALDO / VALIDACION'}</h3>

        <div style={{ padding: 18, background: '#fff', borderRadius: 12, border: '1px solid #dbeafe', display: 'grid', gap: 14 }}>
          <h4 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{'Constancia de semanas cotizadas (IMSS)'}</h4>
          <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.8 }}>
            {'Con la finalidad de validar la informacion laboral proporcionada, le solicitamos amablemente obtener y adjuntar su Constancia de Semanas Cotizadas del IMSS, la cual puede descargarse en formato PDF desde el portal oficial.'}
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#111827' }}>Instrucciones:</p>
            <ol style={{ margin: 0, paddingLeft: 28, display: 'grid', gap: 10, color: '#334155', lineHeight: 1.7 }}>
              <li>
                <span>{'Ingrese a la pagina:'}</span>
                <div style={{ marginTop: 4 }}>
                  <a href="https://serviciosdigitales.imss.gob.mx/semanascotizadas-web/usuarios/IngresoAsegurado" target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8', wordBreak: 'break-all' }}>
                    https://serviciosdigitales.imss.gob.mx/semanascotizadas-web/usuarios/IngresoAsegurado
                  </a>
                </div>
              </li>
              <li>{'Capture su CURP, NSS y correo electronico.'}</li>
              <li>{'Descargue el archivo en formato PDF.'}</li>
              <li>{'Adjunte el documento a este estudio o envielo por el medio indicado.'}</li>
            </ol>
          </div>
          <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.7 }}>
            <strong>Nota:</strong>{' Este documento es confidencial y sera utilizado unicamente para fines de validacion laboral.'}
          </p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: getField(sec, 'hl_constancia_imss_pdf') ? '#166534' : '#92400e' }}>
            {getField(sec, 'hl_constancia_imss_pdf') ? '\u2611 Documento adjunto' : '\u2610 Documento adjunto *'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: uploadingKey === 'hl_constancia_imss_pdf' ? 'wait' : 'pointer' }}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                disabled={uploadingKey !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  uploadPdfField(f, 'hl_constancia_imss_pdf', 'constancia_imss');
                  e.target.value = '';
                }}
              />
              <span style={{ display: 'inline-block', padding: '10px 18px', background: uploadingKey === 'hl_constancia_imss_pdf' ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
                {uploadingKey === 'hl_constancia_imss_pdf' ? 'Subiendo...' : 'Subir PDF'}
              </span>
            </label>
            {getField(sec, 'hl_constancia_imss_pdf') ? (
              <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
            ) : (
              <span style={{ color: '#b45309', fontSize: 14, fontWeight: 600 }}>Archivo requerido</span>
            )}
          </div>
        </div>

        <div style={{ padding: 18, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gap: 14 }}>
          <h4 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{'Documentacion adicional (opcional)'}</h4>
          <p style={{ margin: 0, fontSize: 15, color: '#334155', lineHeight: 1.8 }}>
            {'Puede adjuntar documentos que respalden su experiencia laboral (cartas de recomendacion, constancias, reconocimientos, etc.).'}
          </p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: getField(sec, 'hl_documentacion_adicional_pdf') ? '#166534' : '#64748b' }}>
            {getField(sec, 'hl_documentacion_adicional_pdf') ? '\u2611 Documento adjunto' : '\u2610 Documento adjunto (opcional)'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: uploadingKey === 'hl_documentacion_adicional_pdf' ? 'wait' : 'pointer' }}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                disabled={uploadingKey !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  uploadPdfField(f, 'hl_documentacion_adicional_pdf', 'documentacion_adicional');
                  e.target.value = '';
                }}
              />
              <span style={{ display: 'inline-block', padding: '10px 18px', background: uploadingKey === 'hl_documentacion_adicional_pdf' ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
                {uploadingKey === 'hl_documentacion_adicional_pdf' ? 'Subiendo...' : 'Subir PDF'}
              </span>
            </label>
            {getField(sec, 'hl_documentacion_adicional_pdf') ? (
              <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Archivo recibido ✓</span>
            ) : (
              <span style={{ color: '#64748b', fontSize: 14 }}>Sin archivo</span>
            )}
          </div>
        </div>
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
  const inputStyle: React.CSSProperties = { width: '100%', padding: 8, boxSizing: 'border-box', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14 };
  const labelStyle = { display: 'block' as const, marginBottom: 2, fontWeight: 600, fontSize: 12 };

  // 4.2 Gastos mensuales – conceptos y keys
  const GASTOS = [
    ['gasto_renta', 'Renta'],
    ['gasto_hipoteca', 'Hipoteca'],
    ['gasto_alimentos', 'Alimentos / despensa'],
    ['gasto_agua', 'Agua'],
    ['gasto_luz', 'Luz'],
    ['gasto_gas', 'Gas'],
    ['gasto_tel_casa', 'Teléfono de casa / Internet'],
    ['gasto_tel_celular', 'Teléfono celular'],
    ['gasto_internet_tv', 'Suscripciones de streaming'],
    ['gasto_mantenimiento', 'Mantenimiento del hogar'],
    ['gasto_cuotas_condominio', 'Cuotas o mantenimiento (condominio)'],
    ['gasto_limpieza', 'Limpieza / artículos del hogar'],
    ['gasto_gasolina', 'Gasolina'],
    ['gasto_transporte', 'Transporte público'],
    ['gasto_esparcimiento', 'Esparcimiento / entretenimiento'],
    ['gasto_ropa', 'Ropa y calzado'],
    ['gasto_escolares', 'Gastos escolares'],
    ['gasto_medicos', 'Gastos médicos'],
    ['gasto_seguro_vida', 'Seguro de vida'],
    ['gasto_seguro_medico', 'Seguro médico'],
    ['gasto_aplicaciones', 'Aplicaciones / plataformas digitales (Netflix, Prime, etc.)'],
    ['gasto_apoyo_pension', 'Apoyo o pensión familiar'],
    ['gasto_guarderia', 'Guardería / cuidado infantil'],
    ['gasto_otros', 'Otros gastos'],
  ] as const;

  // 4.3 Préstamos
  const PRESTAMOS = [
    ['credito_nomina', 'Crédito de nómina'],
    ['prestamo_personal', 'Préstamo personal'],
    ['credito_automotriz', 'Crédito automotriz'],
    ['tarjetas_credito', 'Tarjetas de crédito'],
    ['credito_tiendas', 'Crédito en tiendas / mueblerías'],
    ['otros_creditos', 'Otros créditos'],
  ] as const;

  // Suma de gastos para total (acepta "1000", "1,000", "$ 1000", etc.)
  const parseMonto = (s: string): number => {
    const cleaned = String(s || '').replace(/,/g, '').replace(/\s/g, '').replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };
  const totalGastos = GASTOS.reduce((sum, [key]) => sum + parseMonto(getField(sec, key)), 0);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>SECCIÓN 4: SITUACIÓN ECONÓMICA GENERAL</h2>

      {/* 4.1 INGRESOS MENSUALES APROXIMADOS */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>4.1 INGRESOS MENSUALES APROXIMADOS</h3>
        <ChoiceRow
          label="Ingreso mensual aproximado del último empleo: *"
          value={getField(sec, 'ie_rango')}
          onChange={(v) => updateField(sec, 'ie_rango', v)}
          options={[
            { key: 'menos10k', label: 'Menos de $10,000' },
            { key: '10_15', label: '$10,001 – $15,000' },
            { key: '15_20', label: '$15,001 – $20,000' },
            { key: '20_30', label: '$20,001 – $30,000' },
            { key: '30_40', label: '$30,001 – $40,000' },
            { key: '40_50', label: '$40,001 – $50,000' },
            { key: 'mas50', label: 'Más de $50,000' },
          ]}
        />
        <YnRow label="Cuenta con ingresos adicionales: *" value={getField(sec, 'ie_ingresos_adicionales')} onChange={(v) => updateField(sec, 'ie_ingresos_adicionales', v)} />
        {getField(sec, 'ie_ingresos_adicionales') === 'si' && (
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>En caso afirmativo, indicar tipo (opcional)</label>
            <input type="text" value={getField(sec, 'ie_ingresos_adicionales_tipo')} onChange={(e) => updateField(sec, 'ie_ingresos_adicionales_tipo', e.target.value)} placeholder="Ej. Rentas, negocios, inversiones" style={{ ...inputStyle, marginTop: 4 }} />
          </div>
        )}
      </div>

      {/* 4.2 GASTOS MENSUALES GENERALES */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>4.2. GASTOS MENSUALES GENERALES</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>(Realizados por el participante y las personas que dependen económicamente de él)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {GASTOS.map(([key, label]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type="text" inputMode="decimal" value={getField(sec, key)} onChange={(e) => updateField(sec, key, e.target.value)} placeholder="$" style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* 4.3 PRÉSTAMOS O COMPROMISOS FINANCIEROS */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>4.3 PRÉSTAMOS O COMPROMISOS FINANCIEROS ACTUALES</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Tipo de compromiso</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, width: 120 }}>Pago mensual</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700, width: 120 }}>Saldo pendiente</th>
              </tr>
            </thead>
            <tbody>
              {PRESTAMOS.map(([key, label]) => (
                <tr key={key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>{label}</td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" inputMode="decimal" value={getField(sec, `${key}_pago`)} onChange={(e) => updateField(sec, `${key}_pago`, e.target.value)} placeholder="$" style={{ ...inputStyle, width: '100%' }} />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" inputMode="decimal" value={getField(sec, `${key}_saldo`)} onChange={(e) => updateField(sec, `${key}_saldo`, e.target.value)} placeholder="$" style={{ ...inputStyle, width: '100%' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOTAL DE GASTOS MENSUALES */}
      <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 12, border: '2px solid #10b981' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#065f46' }}>TOTAL DE GASTOS MENSUALES APROXIMADOS</p>
        <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 800, color: '#047857' }}>Total estimado: ${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>Los montos indicados son aproximados y se registran con fines de análisis socioeconómico del hogar.</p>
      </div>

      {/* 4.4 PERSONAS QUE DEPENDEN ECONÓMICAMENTE */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>4.4 PERSONAS QUE DEPENDEN ECONÓMICAMENTE DEL EVALUADO</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Número de dependientes económicos</label>
          <input type="number" min={0} value={getField(sec, 'ie_num_dependientes')} onChange={(e) => updateField(sec, 'ie_num_dependientes', e.target.value)} style={{ ...inputStyle, width: 100 }} />
        </div>
        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>Tipo de dependientes:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          {[['ie_dep_hijos', 'Hijos'], ['ie_dep_conyuge', 'Cónyuge'], ['ie_dep_padres', 'Padres'], ['ie_dep_otros', 'Otros']].map(([k, lab]) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={getField(sec, k) === '1'} onChange={(e) => updateField(sec, k, e.target.checked ? '1' : '')} />
              {lab}
            </label>
          ))}
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>En caso de existir dependientes económicos, favor de registrar la información disponible:</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700, width: 70 }}>Dependiente</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Nombre completo</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Parentesco</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700, width: 50 }}>Edad</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Estado civil</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Ocupación o grado escolar</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Institución pública / privada</th>
                <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Empresa o actividad laboral</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                  <td style={{ padding: '6px', fontWeight: 600, color: '#475569' }}>{idx + 1}</td>
                  {['nombre_completo', 'parentesco', 'edad', 'estado_civil', 'ocupacion_grado', 'institucion', 'empresa_actividad'].map((col) => (
                    <td key={col} style={{ padding: '4px 6px' }}>
                      <input type="text" value={getField(sec, `ie_dep_${idx}_${col}`)} onChange={(e) => updateField(sec, `ie_dep_${idx}_${col}`, e.target.value)} style={{ ...inputStyle, minWidth: 90 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Si existen más dependientes, favor de indicarlo aquí:</label>
          <textarea value={getField(sec, 'ie_dep_mas_texto')} onChange={(e) => updateField(sec, 'ie_dep_mas_texto', e.target.value)} rows={2} style={{ ...inputStyle, marginTop: 4 }} placeholder="Indique información adicional de otros dependientes" />
        </div>
      </div>

      {/* 4.5 OBSERVACIONES DEL EVALUADO */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>4.5 OBSERVACIONES DEL EVALUADO (OPCIONAL)</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
          Espacio para que el evaluado agregue información que considere relevante sobre su situación económica actual:
        </p>
        <textarea value={getField(sec, 'ie_obs_evaluado')} onChange={(e) => updateField(sec, 'ie_obs_evaluado', e.target.value)} rows={4} style={{ ...inputStyle }} placeholder="Opcional" />
      </div>

      {/* 4.6 SITUACIÓN CREDITICIA */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>4.6 SITUACIÓN CREDITICIA (DECLARATIVA)</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
          ¿Ha tenido o tiene actualmente algún problema relevante con su historial crediticio (Buró de Crédito)?
        </p>
        <YnRow label="Buró de crédito (problema relevante) *" value={getField(sec, 'ie_buro_problema')} onChange={(v) => updateField(sec, 'ie_buro_problema', v)} />
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          Esta información es de carácter declarativo y no implica consulta a sociedades de información crediticia.
        </p>
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>4.7 DETALLE GENERAL DEL HISTORIAL CREDITICIO (OPCIONAL)</h3>
        <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 13 }}>En caso afirmativo, indique de manera general (opcional):</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {[
            ['ie_buro_atrasos', 'Atrasos de pago'],
            ['ie_buro_reestructura', 'Reestructura / convenio'],
            ['ie_buro_liquidado', 'Adeudo liquidado'],
            ['ie_buro_otro', 'Otro'],
          ].map(([k, lab]) => {
            const selected = getField(sec, k) === '1';
            const disabled = getField(sec, 'ie_buro_problema') !== 'si';
            return (
            <label
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${selected ? '#60a5fa' : '#cbd5e1'}`,
                background: selected ? '#dbeafe' : '#fff',
                color: selected ? '#0f172a' : '#111827',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={(e) => updateField(sec, k, e.target.checked ? '1' : '')}
                style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontWeight: selected ? 700 : 500 }}>{lab}</span>
            </label>
          )})}
        </div>
        {getField(sec, 'ie_buro_otro') === '1' && (
          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>Otro:</label>
            <input
              type="text"
              value={getField(sec, 'ie_buro_otro_texto')}
              onChange={(e) => updateField(sec, 'ie_buro_otro_texto', e.target.value)}
              style={inputStyle}
              placeholder="Especifique"
              disabled={getField(sec, 'ie_buro_problema') !== 'si'}
            />
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          Esta información es de carácter declarativo y no implica consulta a sociedades de información crediticia.
        </p>
      </div>
    </div>
  );
}

function RadioGroup({ name, label, value, onChange, options }: { name: string; label: string; value: string; onChange: (v: string) => void; options: { key: string; label: string }[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {options.map((o) => (
          <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="radio" name={name} checked={value === o.key} onChange={() => onChange(o.key)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionEscolaridadCapacitacion({
  sec,
  getField,
  updateField,
  uploadPdfEscolaridadDocumentacion,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadPdfEscolaridadDocumentacion: (f: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block' as const, marginBottom: 4, fontWeight: 600, fontSize: 14 };
  const estudiandoSi = getField(sec, 'esc_estudiando_actual') === 'si';
  const cursosCount = Math.max(0, Math.min(15, parseInt(getField(sec, 'esc_cursos_count') || '0', 10) || 0));
  const addCurso = () => updateField(sec, 'esc_cursos_count', String(Math.min(15, cursosCount + 1)));
  const removeCurso = (idx: number) => {
    // Keep it simple: just decrement count if removing the last one
    if (idx !== cursosCount - 1) return;
    updateField(sec, 'esc_cursos_count', String(Math.max(0, cursosCount - 1)));
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>ESCOLARIDAD Y ESTUDIOS RECIENTES</h2>

      {/* 2.1 ESCOLARIDAD FORMAL */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>2.1. ESCOLARIDAD FORMAL</h3>
        <RadioGroup
          name="esc_nivel"
          label="Nivel máximo de estudios alcanzado:"
          value={getField(sec, 'esc_nivel')}
          onChange={(v) => updateField(sec, 'esc_nivel', v)}
          options={[
            { key: 'primaria', label: 'Primaria' },
            { key: 'secundaria', label: 'Secundaria' },
            { key: 'bachillerato', label: 'Bachillerato / Preparatoria' },
            { key: 'carrera_tecnica', label: 'Carrera técnica' },
            { key: 'licenciatura', label: 'Licenciatura / Ingeniería' },
          ]}
        />
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre de la carrera o especialidad:</label>
          <input type="text" value={getField(sec, 'esc_carrera_nombre')} onChange={(e) => updateField(sec, 'esc_carrera_nombre', e.target.value)} placeholder="Carrera o especialidad" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Institución educativa:</label>
          <input type="text" value={getField(sec, 'esc_institucion')} onChange={(e) => updateField(sec, 'esc_institucion', e.target.value)} placeholder="Nombre de la institución" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Periodo cursado:</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>De</span>
            <input type="text" value={getField(sec, 'esc_periodo_de')} onChange={(e) => updateField(sec, 'esc_periodo_de', e.target.value)} placeholder="Ej. 2015" style={{ ...inputStyle, maxWidth: 120 }} />
            <span>a</span>
            <input type="text" value={getField(sec, 'esc_periodo_a')} onChange={(e) => updateField(sec, 'esc_periodo_a', e.target.value)} placeholder="Ej. 2019" style={{ ...inputStyle, maxWidth: 120 }} />
          </div>
        </div>
        <RadioGroup
          name="esc_estatus"
          label="Estatus del último nivel cursado:"
          value={getField(sec, 'esc_estatus')}
          onChange={(v) => updateField(sec, 'esc_estatus', v)}
          options={[
            { key: 'concluido', label: 'Concluido' },
            { key: 'trunco', label: 'Trunco' },
            { key: 'en_curso', label: 'En curso' },
          ]}
        />
      </div>

      {/* 2.2 POSGRADO */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>2.2. EN CASO DE CONTAR CON ESTUDIOS DE POSGRADO ADICIONALES</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>(Solo si aplica)</p>
        <RadioGroup
          name="esc_posgrado_tipo"
          label="Tipo de posgrado:"
          value={getField(sec, 'esc_posgrado_tipo')}
          onChange={(v) => updateField(sec, 'esc_posgrado_tipo', v)}
          options={[
            { key: 'especialidad', label: 'Especialidad' },
            { key: 'maestria', label: 'Maestría' },
            { key: 'doctorado', label: 'Doctorado' },
          ]}
        />
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Nombre del estudio de posgrado:</label>
          <input type="text" value={getField(sec, 'esc_posgrado_nombre')} onChange={(e) => updateField(sec, 'esc_posgrado_nombre', e.target.value)} placeholder="Nombre del posgrado" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Institución:</label>
          <input type="text" value={getField(sec, 'esc_posgrado_institucion')} onChange={(e) => updateField(sec, 'esc_posgrado_institucion', e.target.value)} placeholder="Institución" style={inputStyle} />
        </div>
        <RadioGroup
          name="esc_posgrado_estatus"
          label="Estatus:"
          value={getField(sec, 'esc_posgrado_estatus')}
          onChange={(v) => updateField(sec, 'esc_posgrado_estatus', v)}
          options={[
            { key: 'concluido', label: 'Concluido' },
            { key: 'en_curso', label: 'En curso' },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Otros estudios de posgrado:</label>
          <input type="text" value={getField(sec, 'esc_posgrado_otros')} onChange={(e) => updateField(sec, 'esc_posgrado_otros', e.target.value)} placeholder="Otros estudios" style={inputStyle} />
        </div>
      </div>

      {/* 2.3 ESTUDIOS O CAPACITACIONES RECIENTES */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>2.3 ESTUDIOS O CAPACITACIONES RECIENTES</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>(Solo lo obtenido después del último grado formal o en los últimos 3–5 años)</p>
        <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Cursos, certificaciones o diplomados relevantes (opcional):</p>
        {Array.from({ length: cursosCount }, (_, i) => (
          <div key={i} style={{ marginBottom: 16, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Nombre del curso/certificación:</label>
              <input type="text" value={getField(sec, `esc_curso_${i}_nombre`)} onChange={(e) => updateField(sec, `esc_curso_${i}_nombre`, e.target.value)} placeholder="Nombre" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Institución:</label>
              <input type="text" value={getField(sec, `esc_curso_${i}_inst`)} onChange={(e) => updateField(sec, `esc_curso_${i}_inst`, e.target.value)} placeholder="Institución" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ maxWidth: 120 }}>
                <label style={labelStyle}>Año:</label>
                <input type="text" value={getField(sec, `esc_curso_${i}_anio`)} onChange={(e) => updateField(sec, `esc_curso_${i}_anio`, e.target.value)} placeholder="AAAA" style={inputStyle} />
              </div>
              {i === cursosCount - 1 ? (
                <button type="button" onClick={() => removeCurso(i)} style={{ padding: '10px 12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 700, color: '#991b1b' }}>
                  Quitar
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <button type="button" onClick={addCurso} style={{ padding: '10px 16px', background: '#e2e8f0', border: '2px solid #475569', borderRadius: 8, cursor: 'pointer', fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
          + Agregar curso / certificación
        </button>
      </div>

      {/* 2.4 ESTUDIOS ACTUALES */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>2.4 ESTUDIOS ACTUALES</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>(Si aplica)</p>
        <YnRow label="¿Actualmente se encuentra estudiando?" value={getField(sec, 'esc_estudiando_actual')} onChange={(v) => updateField(sec, 'esc_estudiando_actual', v)} />
        {estudiandoSi && (
          <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
            <div>
              <label style={labelStyle}>¿Qué estudia?:</label>
              <input type="text" value={getField(sec, 'esc_estudiando_que')} onChange={(e) => updateField(sec, 'esc_estudiando_que', e.target.value)} placeholder="Carrera o estudio" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Institución:</label>
              <input type="text" value={getField(sec, 'esc_estudiando_institucion')} onChange={(e) => updateField(sec, 'esc_estudiando_institucion', e.target.value)} placeholder="Institución" style={inputStyle} />
            </div>
            <RadioGroup
              name="esc_estudiando_modalidad"
              label="Modalidad:"
              value={getField(sec, 'esc_estudiando_modalidad')}
              onChange={(v) => updateField(sec, 'esc_estudiando_modalidad', v)}
              options={[
                { key: 'presencial', label: 'Presencial' },
                { key: 'en_linea', label: 'En línea' },
                { key: 'mixta', label: 'Mixta' },
              ]}
            />
            <div>
              <label style={labelStyle}>Horario aproximado:</label>
              <input type="text" value={getField(sec, 'esc_estudiando_horario')} onChange={(e) => updateField(sec, 'esc_estudiando_horario', e.target.value)} placeholder="Ej. 7:00 - 10:00" style={inputStyle} />
            </div>
          </div>
        )}
      </div>

      {/* 2.5 DOCUMENTACIÓN ACADÉMICA */}
      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>2.5. DOCUMENTACIÓN ACADÉMICA</h3>
        <ChoiceRow
          label="¿Cuenta con documentación que respalde su escolaridad?"
          value={getField(sec, 'esc_documentacion')}
          onChange={(v) => updateField(sec, 'esc_documentacion', v)}
          options={[
            { key: 'si', label: 'Sí' },
            { key: 'no', label: 'No' },
            { key: 'tramite', label: 'En trámite' },
          ]}
        />
        <div>
          <label style={labelStyle}>SUBIR ARCHIVO EN PDF</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <label style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploading(true);
                  uploadPdfEscolaridadDocumentacion(f)
                    .then((url) => updateField(sec, 'esc_documentacion_pdf', url))
                    .catch((err) => alert(err?.message || 'Error al subir'))
                    .finally(() => {
                      setUploading(false);
                      e.target.value = '';
                    });
                }}
              />
              <span style={{ display: 'inline-block', padding: '8px 14px', background: uploading ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                {uploading ? 'Subiendo…' : 'Adjuntar PDF'}
              </span>
            </label>
            {getField(sec, 'esc_documentacion_pdf') ? <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✓ PDF cargado</span> : null}
          </div>
        </div>
      </div>

      <p style={{ margin: 0, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd', fontSize: 14, color: '#1e3a8a', lineHeight: 1.5 }}>
        <strong>NOTA IMPORTANTE:</strong> La información académica será utilizada únicamente para fines laborales, como parte del proceso de evaluación y congruencia con el puesto solicitado.
      </p>
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
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>HÁBITOS GENERALES</h2>
      <ChoiceRow
        label="¿Consume alcohol? *"
        value={getField(sec, 'bw_alcohol')}
        onChange={(v) => updateField(sec, 'bw_alcohol', v)}
        options={[
          { key: 'no', label: 'No' },
          { key: 'ocasional', label: 'Ocasional' },
          { key: 'frecuente', label: 'Frecuente' },
        ]}
      />
      <ChoiceRow
        label="¿Fuma? *"
        value={getField(sec, 'bw_tabaco')}
        onChange={(v) => updateField(sec, 'bw_tabaco', v)}
        options={[
          { key: 'no', label: 'No' },
          { key: 'si', label: 'Sí' },
        ]}
      />
      <ChoiceRow
        label="¿Consume alguna sustancia prohibida? *"
        value={getField(sec, 'bw_sustancia_prohibida')}
        onChange={(v) => updateField(sec, 'bw_sustancia_prohibida', v)}
        options={[
          { key: 'si', label: 'Sí' },
          { key: 'no', label: 'No' },
        ]}
      />
      <p style={{ margin: 0, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd', fontSize: 14, color: '#1e3a8a', lineHeight: 1.5 }}>
        <strong>Nota importante:</strong> Información de carácter declarativo.
      </p>
    </div>
  );
}

function SectionInformacionLegalCarta({
  sec,
  getField,
  updateField,
  uploadCapFile,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
  uploadCapFile: (f: File, k: 'acta' | 'ine' | 'foto' | 'domicilio') => Promise<string>;
}) {
  const autoriza = getField(sec, 'cap_tramite') === 'autorizo';
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };

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
      <label style={{ cursor: 'pointer' }}>
        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            uploadCapFile(f, kind)
              .then((url) => updateField(sec, fieldKey, url))
              .catch((err) => alert(err?.message || 'Error al subir el archivo.'))
              .finally(() => {
                e.target.value = '';
              });
          }}
        />
        <span style={{ display: 'inline-block', padding: '8px 14px', background: '#1e40af', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
          Adjuntar archivo
        </span>
      </label>
      {getField(sec, fieldKey) ? <span style={{ marginLeft: 10, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>✓ Cargado</span> : null}
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>INFORMACIÓN LEGAL Y TRÁMITE DE CARTA DE NO ANTECEDENTES PENALES</h2>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#334155' }}>5.1 ANTECEDENTES LEGALES (DECLARATIVO)</h3>
        <YnRow
          label="¿Ha tenido o tiene actualmente algún antecedente legal que pudiera afectar su desempeño laboral o su permanencia en un empleo? *"
          value={getField(sec, 'al_legal')}
          onChange={(v) => updateField(sec, 'al_legal', v)}
        />
        {getField(sec, 'al_legal') === 'si' && (
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>En caso afirmativo, indique de manera general (opcional):</label>
            <textarea value={getField(sec, 'al_legal_texto')} onChange={(e) => updateField(sec, 'al_legal_texto', e.target.value)} rows={3} style={{ ...inputStyle }} />
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          La presente información es de carácter declarativo, no constituye dictamen legal y no sustituye documentos oficiales emitidos por autoridad competente.
        </p>
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#334155' }}>5.2 TRÁMITE DE CARTA DE NO ANTECEDENTES PENALES</h3>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>
          <strong>Objetivo:</strong> Gestionar, en caso de ser requerido por la empresa solicitante, la obtención de la Carta de No Antecedentes Penales emitida por la autoridad competente. El resultado del trámite será integrado al expediente del estudio.
        </p>

        <p style={{ margin: '12px 0 8px', fontWeight: 700 }}>Autorización para trámite *</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ display: 'flex', gap: 10, cursor: 'pointer' }}>
            <input type="radio" name="cap_tramite" checked={getField(sec, 'cap_tramite') === 'autorizo'} onChange={() => updateField(sec, 'cap_tramite', 'autorizo')} />
            <span>
              Autorizo a HR Capital Working, S.A. de C.V. a gestionar ante la autoridad correspondiente el trámite de mi Carta de No Antecedentes Penales, utilizando para ello la información y documentación que proporciono.
            </span>
          </label>
          <label style={{ display: 'flex', gap: 10, cursor: 'pointer' }}>
            <input type="radio" name="cap_tramite" checked={getField(sec, 'cap_tramite') === 'no_autorizo'} onChange={() => updateField(sec, 'cap_tramite', 'no_autorizo')} />
            <span>No autorizo el trámite.</span>
          </label>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b' }}>
          Entiendo que HR Capital Working actúa únicamente como gestor intermediario y no emite certificaciones legales.
        </p>

        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Documentación requerida</h4>
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>(Subir archivos escaneados, legibles y completos. PDF. Máx. 5 MB.)</p>
          {!autoriza ? (
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Para adjuntar documentación, seleccione “Autorizo el trámite”.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {slot('Acta de nacimiento', 'PDF escaneado y legible.', 'cap_doc_acta', 'acta', '.pdf,application/pdf')}
              {slot('Credencial para votar (INE)', 'PDF escaneado y legible.', 'cap_doc_ine', 'ine', '.pdf,application/pdf')}
              {slot('Fotografía reciente con fondo blanco', 'De hombros hacia arriba, legible, sin lentes u objetos que cubran el rostro. (PDF o imagen)', 'cap_doc_foto', 'foto', '.pdf,application/pdf,image/*')}
            </div>
          )}
        </div>

        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b' }}>
          El trámite se realiza conforme a los lineamientos de la autoridad competente y a la documentación proporcionada por el evaluado.
        </p>
      </div>
    </div>
  );
}

function SectionEntornoSocialVivienda({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelStyle = { display: 'block' as const, marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#0f172a' };

  const radio = (name: string, value: string, key: string, label: string) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="radio" name={name} checked={value === key} onChange={() => updateField(sec, name, key)} />
      <span>{label}</span>
    </label>
  );

  const checkbox = (key: string, label: string) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" checked={getField(sec, key) === '1'} onChange={(e) => updateField(sec, key, e.target.checked ? '1' : '')} />
      <span>{label}</span>
    </label>
  );

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>ENTORNO SOCIAL Y CONDICIONES DE VIVIENDA</h2>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>7.1. ENTORNO DE LA VIVIENDA</h3>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>ZONA DE LA VIVIENDA *</p>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>Seleccione la opción que mejor describa la zona donde se ubica su domicilio:</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'residencial', 'Residencial')}
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'popular', 'Popular')}
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'campestre', 'Campestre')}
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'industrial', 'Industrial')}
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'turistica', 'Turística')}
            {radio('vivi_zona', getField(sec, 'vivi_zona'), 'otro', 'Otro')}
          </div>
          {getField(sec, 'vivi_zona') === 'otro' && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Otro (especifique) *</label>
              <input type="text" value={getField(sec, 'vivi_zona_otro')} onChange={(e) => updateField(sec, 'vivi_zona_otro', e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>TIPO DE VIVIENDA *</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('vivi_tipo', getField(sec, 'vivi_tipo'), 'casa', 'Casa')}
            {radio('vivi_tipo', getField(sec, 'vivi_tipo'), 'departamento', 'Departamento')}
            {radio('vivi_tipo', getField(sec, 'vivi_tipo'), 'condominio', 'Condominio')}
            {radio('vivi_tipo', getField(sec, 'vivi_tipo'), 'unidad', 'Unidad habitacional (Infonavit / Fovissste)')}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>COLONIA / TIPO DE FRACCIONAMIENTO *</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('vivi_colonia_tipo', getField(sec, 'vivi_colonia_tipo'), 'privado', 'Privado')}
            {radio('vivi_colonia_tipo', getField(sec, 'vivi_colonia_tipo'), 'abierto', 'Abierto')}
            {radio('vivi_colonia_tipo', getField(sec, 'vivi_colonia_tipo'), 'seguridad', 'Con sistema de seguridad')}
            {radio('vivi_colonia_tipo', getField(sec, 'vivi_colonia_tipo'), 'otro', 'Otro')}
          </div>
          {getField(sec, 'vivi_colonia_tipo') === 'otro' && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Otro (especifique) *</label>
              <input type="text" value={getField(sec, 'vivi_colonia_otro')} onChange={(e) => updateField(sec, 'vivi_colonia_otro', e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>ACTIVIDAD VECINAL PREDOMINANTE *</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('vivi_actividad_vecinal', getField(sec, 'vivi_actividad_vecinal'), 'industrial', 'Industrial')}
            {radio('vivi_actividad_vecinal', getField(sec, 'vivi_actividad_vecinal'), 'comercial', 'Comercial')}
            {radio('vivi_actividad_vecinal', getField(sec, 'vivi_actividad_vecinal'), 'ejidal', 'Ejidal / Rural')}
            {radio('vivi_actividad_vecinal', getField(sec, 'vivi_actividad_vecinal'), 'otro', 'Otro')}
          </div>
          {getField(sec, 'vivi_actividad_vecinal') === 'otro' && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Otro (especifique) *</label>
              <input type="text" value={getField(sec, 'vivi_actividad_vecinal_otro')} onChange={(e) => updateField(sec, 'vivi_actividad_vecinal_otro', e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>SERVICIOS PÚBLICOS DE LA ZONA</p>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>(Marcar los que apliquen)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {checkbox('vivi_serv_agua', 'Agua')}
            {checkbox('vivi_serv_luz', 'Luz')}
            {checkbox('vivi_serv_alumbrado', 'Alumbrado público')}
            {checkbox('vivi_serv_drenaje', 'Drenaje')}
            {checkbox('vivi_serv_pavimentacion', 'Pavimentación')}
            {checkbox('vivi_serv_transporte', 'Transporte público')}
            {checkbox('vivi_serv_areas_verdes_cuidadas', 'Áreas verdes cuidadas')}
            {checkbox('vivi_serv_areas_verdes_descuidadas', 'Áreas verdes descuidadas')}
          </div>
        </div>

        <p style={{ margin: '16px 0 0', padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd', fontSize: 14, color: '#1e3a8a', lineHeight: 1.5 }}>
          <strong>NOTA IMPORTANTE:</strong> Esta información es de carácter declarativo y podrá ser complementada con la verificación domiciliaria, en caso de que haya sido autorizada por el evaluado.
        </p>
      </div>

      <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#334155' }}>7.2. MEDIOS DE TRANSPORTE Y TRASLADO AL TRABAJO</h3>

        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Medio principal de transporte *</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('transporte_medio', getField(sec, 'transporte_medio'), 'publico', 'Transporte público')}
            {radio('transporte_medio', getField(sec, 'transporte_medio'), 'propio', 'Vehículo propio')}
            {radio('transporte_medio', getField(sec, 'transporte_medio'), 'empresa', 'Transporte de la empresa')}
            {radio('transporte_medio', getField(sec, 'transporte_medio'), 'pie', 'A pie')}
            {radio('transporte_medio', getField(sec, 'transporte_medio'), 'otro', 'Otro')}
          </div>
        </div>

        <div>
          <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Tiempo aproximado de traslado *</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {radio('transporte_tiempo', getField(sec, 'transporte_tiempo'), 'menos30', 'Menos de 30 min')}
            {radio('transporte_tiempo', getField(sec, 'transporte_tiempo'), '30_60', '30–60 min')}
            {radio('transporte_tiempo', getField(sec, 'transporte_tiempo'), 'mas60', 'Más de 60 min')}
          </div>
        </div>
      </div>
    </div>
  );
}

// SectionCartaObsDeclaracion removed (replaced by SectionInformacionLegalCarta)

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

function SectionReferenciasPersonales({
  sec,
  getField,
  updateField,
}: {
  sec: string;
  getField: (s: string, k: string) => string;
  updateField: (s: string, k: string, v: string) => void;
}) {
  const inputStyle: React.CSSProperties = { width: '100%', padding: 10, boxSizing: 'border-box', borderRadius: 8, border: '1px solid #e2e8f0' };
  const labelReq = { display: 'block' as const, marginBottom: 4, fontWeight: 600 };
  const labelOpt = { display: 'block' as const, marginBottom: 4, fontWeight: 600, color: '#64748b' };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h2 style={{ margin: 0, fontSize: 18, color: '#111' }}>1.6 REFERENCIAS PERSONALES</h2>
      {[0, 1].map((idx) => (
        <div key={idx} style={{ padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#0f172a' }}>{`Referencia ${idx + 1}`}</h3>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={labelReq}>Nombre completo *</label>
              <input type="text" value={getField(sec, `${idx}_ref_nombre_completo`)} onChange={(e) => updateField(sec, `${idx}_ref_nombre_completo`, e.target.value)} placeholder="Nombre completo del referente" style={inputStyle} />
            </div>
            <div>
              <label style={labelReq}>Parentesco *</label>
              <input type="text" value={getField(sec, `${idx}_ref_parentesco`)} onChange={(e) => updateField(sec, `${idx}_ref_parentesco`, e.target.value)} placeholder="Ej. Amigo, Vecino, Familiar" style={inputStyle} />
            </div>
            <div>
              <label style={labelOpt}>Ocupación</label>
              <input type="text" value={getField(sec, `${idx}_ref_ocupacion`)} onChange={(e) => updateField(sec, `${idx}_ref_ocupacion`, e.target.value)} placeholder="Ocupación o actividad" style={inputStyle} />
            </div>
            <div>
              <label style={labelReq}>Teléfono *</label>
              <input type="tel" value={getField(sec, `${idx}_ref_telefono`)} onChange={(e) => updateField(sec, `${idx}_ref_telefono`, e.target.value)} placeholder="Teléfono de contacto" style={inputStyle} />
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>¿Vive con el evaluado? *</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`vive_${idx}`} checked={getField(sec, `${idx}_ref_vive_con_evaluado`) === 'si'} onChange={() => updateField(sec, `${idx}_ref_vive_con_evaluado`, 'si')} />
                  <span>Sí</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`vive_${idx}`} checked={getField(sec, `${idx}_ref_vive_con_evaluado`) === 'no'} onChange={() => updateField(sec, `${idx}_ref_vive_con_evaluado`, 'no')} />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div>
              <label style={labelOpt}>Tiempo de conocer al evaluado (años)</label>
              <input type="text" inputMode="numeric" value={getField(sec, `${idx}_ref_tiempo_conocer_anios`)} onChange={(e) => updateField(sec, `${idx}_ref_tiempo_conocer_anios`, e.target.value)} placeholder="Ej. 5" style={{ ...inputStyle, maxWidth: 120 }} />
            </div>
          </div>
        </div>
      ))}
      <p style={{ margin: 0, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #93c5fd', fontSize: 14, color: '#1e3a8a', lineHeight: 1.5 }}>
        <strong>Nota importante:</strong> La referencia se solicita únicamente como contacto de carácter personal para fines administrativos y de integración del expediente laboral.
      </p>
    </div>
  );
}
