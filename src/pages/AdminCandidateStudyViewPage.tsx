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
const BOOLEAN_FIELD_PREFIXES = ['vivi_serv_', 'ie_buro_', 'ie_dep_'];
const BOOLEAN_FIELD_KEYS = new Set([
  'al_legal',
  'bw_tabaco',
  'bw_sustancia_prohibida',
  'dom_autorizacion_verificacion',
  'esc_documentacion',
  'hl_actual_imss_registro',
]);

type FieldOption = { value: string; label: string };

const FIELD_OPTIONS: Record<string, FieldOption[]> = {
  dp_estado_civil: [
    { value: 'soltero', label: 'Soltero(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'union_libre', label: 'Unión libre' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viudo', label: 'Viudo(a)' },
  ],
  dp_genero: [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
  ],
  dp_id_presentada: [
    { value: 'ine', label: 'INE' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'cedula_profesional', label: 'Cédula profesional' },
  ],
  dom_tipo_vivienda: [
    { value: 'propia', label: 'Propia' },
    { value: 'rentada', label: 'Rentada' },
    { value: 'familiar', label: 'Familiar' },
    { value: 'prestada', label: 'Prestada' },
    { value: 'otro', label: 'Otro' },
  ],
  dom_tiempo_residencia: [
    { value: 'menos6', label: 'Menos de 1 año' },
    { value: '6m_1a', label: 'De 1 año a 2 años' },
    { value: '1a_2a', label: 'De 2 años a 5 años' },
    { value: 'mas1a', label: 'Más de 5 años' },
  ],
  dom_autorizacion_verificacion: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  esc_documentacion: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  esc_estatus: [
    { value: 'trunca', label: 'Trunca' },
    { value: 'concluido', label: 'Concluido' },
    { value: 'en_proceso', label: 'En proceso' },
  ],
  esc_estudiando_actual: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  esc_nivel: [
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'bachillerato', label: 'Bachillerato' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'licenciatura', label: 'Licenciatura' },
    { value: 'ingenieria', label: 'Ingeniería' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
  ],
  esc_posgrado_estatus: [
    { value: 'trunca', label: 'Trunca' },
    { value: 'concluido', label: 'Concluido' },
    { value: 'en_proceso', label: 'En proceso' },
  ],
  esc_posgrado_tipo: [
    { value: 'especialidad', label: 'Especialidad' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
  ],
  ie_rango: [
    { value: 'menos10k', label: 'Menos de $10,000' },
    { value: '10_15', label: '$10,001 a $15,000' },
    { value: '15_20', label: '$15,001 a $20,000' },
    { value: '20_30', label: '$20,001 a $30,000' },
    { value: '30_40', label: '$30,001 a $40,000' },
    { value: '40_50', label: '$40,001 a $50,000' },
    { value: 'mas50', label: 'Más de $50,000' },
  ],
  ie_ingresos_adicionales: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  al_legal: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  cap_tramite: [
    { value: 'autorizo', label: 'Autorizo el trámite' },
    { value: 'no_autorizo', label: 'No autorizo el trámite' },
  ],
  bw_alcohol: [
    { value: 'no', label: 'No' },
    { value: 'ocasional', label: 'Ocasional' },
    { value: 'frecuente', label: 'Frecuente' },
  ],
  bw_tabaco: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  bw_sustancia_prohibida: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ],
  vivi_zona: [
    { value: 'residencial', label: 'Residencial' },
    { value: 'popular', label: 'Popular' },
    { value: 'campestre', label: 'Campestre' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'turistica', label: 'Turística' },
    { value: 'otro', label: 'Otro' },
  ],
  vivi_tipo: [
    { value: 'casa', label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'condominio', label: 'Condominio' },
    { value: 'unidad', label: 'Unidad habitacional (Infonavit / Fovissste)' },
  ],
  vivi_colonia_tipo: [
    { value: 'privado', label: 'Privado' },
    { value: 'abierto', label: 'Abierto' },
    { value: 'seguridad', label: 'Con sistema de seguridad' },
    { value: 'otro', label: 'Otro' },
  ],
  vivi_actividad_vecinal: [
    { value: 'industrial', label: 'Industrial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'ejidal', label: 'Ejidal / Rural' },
    { value: 'otro', label: 'Otro' },
  ],
  transporte_medio: [
    { value: 'publico', label: 'Transporte público' },
    { value: 'propio', label: 'Vehículo propio' },
    { value: 'empresa', label: 'Transporte de la empresa' },
    { value: 'pie', label: 'A pie' },
    { value: 'otro', label: 'Otro' },
  ],
  transporte_tiempo: [
    { value: 'menos30', label: 'Menos de 30 min' },
    { value: '30_60', label: '30–60 min' },
    { value: 'mas60', label: 'Más de 60 min' },
  ],
};

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

function buildHistoriaLaboralAdminBlocks(sectionData: Record<string, string>): Array<{ label: string; prefix: string }> {
  const filled = (prefix: string): boolean =>
    Object.entries(sectionData).some(
      ([key, value]) => key.startsWith(`${prefix}_`) && String(value ?? '').trim() !== '' && !/_admin_/.test(key)
    );

  const blocks: Array<{ label: string; prefix: string }> = [];
  const antCountRaw = parseInt(String(sectionData.hl_ant_count || ''), 10);
  const configuredCount = Number.isFinite(antCountRaw) ? Math.max(0, Math.min(10, antCountRaw)) : 0;
  const detectedIndexes = Array.from({ length: 10 }, (_, i) => i).filter((i) => filled(`hl_ant_${i}`));
  const lastDetectedIndex = detectedIndexes.length > 0 ? Math.max(...detectedIndexes) : -1;
  const totalAntBlocks = Math.max(configuredCount, lastDetectedIndex + 1, 1);

  if (filled('hl_actual')) {
    blocks.push({ label: 'Empleo actual', prefix: 'hl_actual' });
  }

  for (let i = 0; i < totalAntBlocks; i += 1) {
    const prefix = `hl_ant_${i}`;
    const isActual = ['1', 'si', 'true'].includes(String(sectionData[`${prefix}_a_actual`] || sectionData[`${prefix}_actual`] || '').trim().toLowerCase());
    blocks.push({ label: isActual ? `Empleo ${i + 1} (actual)` : `Empleo ${i + 1}`, prefix });
  }

  for (let i = 0; i < 10; i += 1) {
    const prefix = `hl_adic_${i}`;
    if (filled(prefix)) {
      blocks.push({ label: `Empleo adicional ${i + 1}`, prefix });
    }
  }

  return blocks;
}

function formatFieldLabel(key: string): string {
  const explicitLabels: Record<string, string> = {
    dp_id_cedula_profesional: 'Identificacion oficial - Cedula Profesional',
    dom_comprobante_domicilio_pdf: 'Comprobante de domicilio (no mayor a 3 meses)',
    hl_constancia_imss_pdf: 'Constancia de semanas cotizadas (IMSS)',
    hl_documentacion_adicional_pdf: 'Documentacion adicional',
    al_legal: 'Antecedente legal declarado',
    al_legal_texto: 'Detalle declarado',
    cap_tramite: 'Autorizacion para tramite',
    cap_doc_acta: 'Acta de nacimiento',
    cap_doc_ine: 'Credencial para votar (INE)',
    cap_doc_foto: 'Fotografia reciente con fondo blanco',
    cap_doc_domicilio: 'Comprobante de domicilio',
    bw_alcohol: '¿Consume alcohol?',
    bw_tabaco: '¿Fuma?',
    bw_sustancia_prohibida: '¿Consume alguna sustancia prohibida?',
    vivi_zona: 'Zona de la vivienda',
    vivi_zona_otro: 'Zona de la vivienda (otro)',
    vivi_tipo: 'Tipo de vivienda',
    vivi_colonia_tipo: 'Colonia / tipo de fraccionamiento',
    vivi_colonia_otro: 'Colonia / tipo de fraccionamiento (otro)',
    vivi_actividad_vecinal: 'Actividad vecinal predominante',
    vivi_actividad_vecinal_otro: 'Actividad vecinal (otro)',
    vivi_serv_agua: 'Servicio de agua',
    vivi_serv_luz: 'Servicio de luz',
    vivi_serv_alumbrado: 'Alumbrado publico',
    vivi_serv_drenaje: 'Drenaje',
    vivi_serv_pavimentacion: 'Pavimentacion',
    vivi_serv_transporte: 'Transporte publico',
    vivi_serv_areas_verdes_cuidadas: 'Areas verdes cuidadas',
    vivi_serv_areas_verdes_descuidadas: 'Areas verdes descuidadas',
    transporte_medio: 'Medio principal de transporte',
    transporte_tiempo: 'Tiempo aproximado de traslado',
  };
  if (explicitLabels[key]) return explicitLabels[key];
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
  const removedSection = 'datos generales e identificación';
  const keys = Object.keys(formData || {}).filter((k) => k.toLowerCase() !== removedSection);
  const preferred = [
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
    'Documentos',
  ];
  const ordered = preferred.filter((s) => keys.some((k) => k.toLowerCase() === s.toLowerCase() || k === s));
  const rest = keys.filter((k) => !preferred.some((s) => s.toLowerCase() === k.toLowerCase() || s === k));
  const out = [...ordered, ...rest];
  if (includeInternal) out.push('Uso interno (analista)');
  return out.length ? out : includeInternal ? ['Uso interno (analista)'] : ['Datos'];
}

function normalizeText(v: unknown): string {
  return v != null ? String(v).trim() : '';
}

function isAdminOnlyHistoriaLaboralKey(key: string): boolean {
  return /^hl_(actual|ant_\d+|adic_\d+)_admin_/.test(key);
}

function getCandidateSectionEntries(sectionName: string, sectionData: Record<string, string>): Array<[string, string]> {
  return Object.entries(sectionData).filter(([key]) => !(sectionName === 'Historia Laboral' && isAdminOnlyHistoriaLaboralKey(key)));
}

function getFieldOptions(key: string): FieldOption[] | null {
  if (FIELD_OPTIONS[key]) return FIELD_OPTIONS[key];
  if (/^hl_(actual|ant_\d+|adic_\d+)_a_actual$/.test(key)) {
    return [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ];
  }
  if (/^hl_(actual|ant_\d+|adic_\d+)_imss_registro$/.test(key)) {
    return [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ];
  }
  return null;
}

function isBooleanCheckboxField(key: string, value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (BOOLEAN_FIELD_KEYS.has(key)) return false;
  if (BOOLEAN_FIELD_PREFIXES.some((prefix) => key.startsWith(prefix))) return true;
  return normalized === '1' || normalized === '0';
}

function isYesNoField(key: string, value: string): boolean {
  if (BOOLEAN_FIELD_KEYS.has(key)) return true;
  if (/^hl_(actual|ant_\d+|adic_\d+)_a_actual$/.test(key)) return true;
  if (/^hl_(actual|ant_\d+|adic_\d+)_imss_registro$/.test(key)) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === 'si' || normalized === 'no';
}

function isFileField(key: string, value: string): boolean {
  if (key === 'foto_participante') return true;
  if (/_pdf$/i.test(key) || /^cap_doc_/i.test(key)) return true;
  if (value.trim() && /^uploads\//i.test(value.trim())) return true;
  return false;
}

function getFileFieldConfig(key: string): { accept: string; help: string } {
  if (key === 'foto_participante') {
    return { accept: '.png,.jpg,.jpeg,image/png,image/jpeg', help: 'Imagen JPG o PNG. Máximo 5 MB.' };
  }
  if (key === 'dom_comprobante_domicilio_pdf' || key === 'cap_doc_foto') {
    return { accept: '.pdf,application/pdf,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp', help: 'PDF o imagen JPG/PNG/WEBP. Máximo 5 MB.' };
  }
  if (/_admin_respaldo$/i.test(key)) {
    return { accept: '.pdf,application/pdf,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp', help: 'PDF o imagen JPG/PNG/WEBP. Máximo 5 MB.' };
  }
  return { accept: '.pdf,application/pdf', help: 'PDF. Máximo 5 MB.' };
}

function isMultilineField(key: string, value: string): boolean {
  if (value.includes('\n') || value.length > 90) return true;
  return /(observ|nota|coment|descripcion|detalle|declaracion|resumen|texto|domicilio|actividad|empresa|institucion|otro)/i.test(key);
}

function isDateField(key: string, value: string): boolean {
  return /fecha|periodo_(de|a)$/i.test(key) && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function sectionsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return keys.every((key) => String(a[key] ?? '') === String(b[key] ?? ''));
}

function renderConyugeFamiliaContactoTable(sectionData: Record<string, string>) {
  const spouseRows: Array<{ label: string; key: string }> = [
    { label: 'Nombre completo', key: 'conyuge_nombre_completo' },
    { label: 'Edad', key: 'conyuge_edad' },
    { label: 'Fecha de nacimiento', key: 'conyuge_fecha_nacimiento' },
    { label: 'Lugar de nacimiento', key: 'conyuge_lugar_nacimiento' },
    { label: 'Actividad actual', key: 'conyuge_actividad_actual' },
    { label: 'Empresa donde labora', key: 'conyuge_empresa' },
    { label: 'Puesto o actividad', key: 'conyuge_puesto_actividad' },
    { label: 'Negocio propio - actividad', key: 'conyuge_negocio_propio_actividad' },
    { label: 'Ingreso mensual que aporta', key: 'conyuge_ingreso_mensual_aporta' },
  ];

  const familyColumns: Array<{ key: string; label: string }> = [
    { key: 'nombre_completo', label: 'Nombre completo' },
    { key: 'parentesco', label: 'Parentesco' },
    { key: 'edad', label: 'Edad' },
    { key: 'estado_civil', label: 'Estado civil' },
    { key: 'ocupacion', label: 'Ocupación / profesión' },
    { key: 'domicilio_ciudad_estado', label: 'Domicilio (ciudad y estado)' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'observaciones', label: 'Observaciones' },
  ];

  const familyRows = Array.from({ length: 6 }, (_, idx) => {
    const row: Record<string, string> = {};
    familyColumns.forEach((c) => {
      const primary = normalizeText(sectionData[`${idx}_fam_${c.key}`]);
      const legacyOcup =
        c.key === 'ocupacion' ? normalizeText(sectionData[`${idx}_fam_ocupacion_profesion`]) : '';
      row[c.key] = primary || legacyOcup;
    });
    const hasData = familyColumns.some((c) => row[c.key] !== '');
    return { idx, row, hasData };
  }).filter((r) => r.hasData);

  const contactRows: Array<{ label: string; key: string }> = [
    { label: 'Telefono celular personal', key: 'contacto_telefono_celular' },
    { label: 'Telefono alterno', key: 'contacto_telefono_alterno' },
    { label: 'Correo personal', key: 'contacto_correo_personal' },
    { label: 'Contacto emergencia - Nombre', key: 'contacto_emergencia_nombre' },
    { label: 'Contacto emergencia - Parentesco', key: 'contacto_emergencia_parentesco' },
    { label: 'Contacto emergencia - Telefono', key: 'contacto_emergencia_telefono' },
  ];

  const renderedKeys = new Set<string>();
  spouseRows.forEach((r) => renderedKeys.add(r.key));
  contactRows.forEach((r) => renderedKeys.add(r.key));
  for (let i = 0; i < 6; i++) {
    familyColumns.forEach((c) => renderedKeys.add(`${i}_fam_${c.key}`));
  }
  const extraEntries = Object.entries(sectionData).filter(([k, v]) => !renderedKeys.has(k) && normalizeText(v) !== '');

  const thStyle = {
    textAlign: 'left' as const,
    padding: '8px 10px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    fontSize: 12,
    fontWeight: 800,
    color: '#0f172a',
  };
  const tdStyle = {
    padding: '8px 10px',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    fontSize: 13,
    color: '#111827',
    verticalAlign: 'top' as const,
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', background: '#f1f5f9', fontWeight: 800, fontSize: 13 }}>1.4.3 Informacion del conyuge o pareja</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {spouseRows
              .map(({ label, key }) => ({ label, value: normalizeText(sectionData[key]) }))
              .filter((r) => r.value !== '')
              .map((row) => (
                <tr key={row.label}>
                  <th style={{ ...thStyle, width: '36%' }}>{row.label}</th>
                  <td style={{ ...tdStyle, borderRight: 'none' }}>{row.value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflowX: 'auto' }}>
        <div style={{ padding: '10px 12px', background: '#f1f5f9', fontWeight: 800, fontSize: 13 }}>1.4.4 Familiares del participante</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              {familyColumns.map((c) => (
                <th key={c.key} style={thStyle}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {familyRows.length ? (
              familyRows.map(({ idx, row }) => (
                <tr key={idx}>
                  <td style={tdStyle}>{idx + 1}</td>
                  {familyColumns.map((c, ci) => (
                    <td key={c.key} style={{ ...tdStyle, borderRight: ci === familyColumns.length - 1 ? 'none' : tdStyle.borderRight }}>{row[c.key] || '—'}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={familyColumns.length + 1} style={{ ...tdStyle, borderRight: 'none', color: '#6b7280' }}>Sin familiares capturados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', background: '#f1f5f9', fontWeight: 800, fontSize: 13 }}>1.5 Datos de contacto y emergencia</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {contactRows
              .map(({ label, key }) => ({ label, value: normalizeText(sectionData[key]) }))
              .filter((r) => r.value !== '')
              .map((row) => (
                <tr key={row.label}>
                  <th style={{ ...thStyle, width: '36%' }}>{row.label}</th>
                  <td style={{ ...tdStyle, borderRight: 'none' }}>{row.value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {extraEntries.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>Otros campos capturados</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {extraEntries.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700 }}>{formatFieldLabel(k)}:</span>
                <span>{normalizeText(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderEconomicSituationSection(sectionData: Record<string, string>) {
  const normalize = (v: unknown) => (v != null ? String(v).trim() : '');
  const yn = (v: string) => (v === 'si' ? 'Sí' : v === 'no' ? 'No' : '—');
  const rangoMap: Record<string, string> = {
    menos10k: 'Menos de $10,000',
    '10_15': '$10,001 – $15,000',
    '15_20': '$15,001 – $20,000',
    '20_30': '$20,001 – $30,000',
    '30_40': '$30,001 – $40,000',
    '40_50': '$40,001 – $50,000',
    mas50: 'Más de $50,000',
  };
  const parseMonto = (s: string): number => {
    const cleaned = String(s || '')
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const gastos: Array<{ key: string; label: string }> = [
    { key: 'gasto_renta', label: 'Renta' },
    { key: 'gasto_hipoteca', label: 'Hipoteca' },
    { key: 'gasto_alimentos', label: 'Alimentos / despensa' },
    { key: 'gasto_agua', label: 'Agua' },
    { key: 'gasto_luz', label: 'Luz' },
    { key: 'gasto_gas', label: 'Gas' },
    { key: 'gasto_tel_casa', label: 'Teléfono de casa / Internet' },
    { key: 'gasto_tel_celular', label: 'Teléfono celular' },
    { key: 'gasto_internet_tv', label: 'Suscripciones de streaming' },
    { key: 'gasto_mantenimiento', label: 'Mantenimiento del hogar' },
    { key: 'gasto_cuotas_condominio', label: 'Cuotas / condominio' },
    { key: 'gasto_limpieza', label: 'Limpieza / artículos del hogar' },
    { key: 'gasto_gasolina', label: 'Gasolina' },
    { key: 'gasto_transporte', label: 'Transporte público' },
    { key: 'gasto_esparcimiento', label: 'Esparcimiento / entretenimiento' },
    { key: 'gasto_ropa', label: 'Ropa y calzado' },
    { key: 'gasto_escolares', label: 'Gastos escolares' },
    { key: 'gasto_medicos', label: 'Gastos médicos' },
    { key: 'gasto_seguro_vida', label: 'Seguro de vida' },
    { key: 'gasto_seguro_medico', label: 'Seguro médico' },
    { key: 'gasto_aplicaciones', label: 'Apps / plataformas digitales' },
    { key: 'gasto_apoyo_pension', label: 'Apoyo o pensión familiar' },
    { key: 'gasto_guarderia', label: 'Guardería / cuidado infantil' },
    { key: 'gasto_otros', label: 'Otros gastos' },
  ];
  const prestamos: Array<{ base: string; label: string }> = [
    { base: 'credito_nomina', label: 'Crédito de nómina' },
    { base: 'prestamo_personal', label: 'Préstamo personal' },
    { base: 'credito_automotriz', label: 'Crédito automotriz' },
    { base: 'tarjetas_credito', label: 'Tarjetas de crédito' },
    { base: 'credito_tiendas', label: 'Crédito en tiendas / mueblerías' },
    { base: 'otros_creditos', label: 'Otros créditos' },
  ];

  const totalGastos = gastos.reduce((sum, g) => sum + parseMonto(normalize(sectionData[g.key])), 0);
  const totalPrestamoPago = prestamos.reduce((sum, p) => sum + parseMonto(normalize(sectionData[`${p.base}_pago`])), 0);
  const totalPrestamoSaldo = prestamos.reduce((sum, p) => sum + parseMonto(normalize(sectionData[`${p.base}_saldo`])), 0);
  const tipoDependientes = [
    sectionData.ie_dep_hijos === '1' ? 'Hijos' : '',
    sectionData.ie_dep_conyuge === '1' ? 'Cónyuge' : '',
    sectionData.ie_dep_padres === '1' ? 'Padres' : '',
    sectionData.ie_dep_otros === '1' ? 'Otros' : '',
  ]
    .filter(Boolean)
    .join(', ');
  const buroChecks = [
    sectionData.ie_buro_atrasos === '1' ? 'Atrasos de pago' : '',
    sectionData.ie_buro_reestructura === '1' ? 'Reestructura / convenio' : '',
    sectionData.ie_buro_liquidado === '1' ? 'Adeudo liquidado' : '',
    sectionData.ie_buro_otro === '1' ? 'Otro' : '',
  ]
    .filter(Boolean)
    .join(', ');

  const thStyle = {
    textAlign: 'left' as const,
    padding: '8px 10px',
    background: '#f1f5f9',
    borderBottom: '1px solid #cbd5e1',
    fontSize: 12,
    fontWeight: 800,
    color: '#0f172a',
  };
  const tdStyle = {
    padding: '8px 10px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#111827',
    verticalAlign: 'top' as const,
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 16, color: '#334155' }}>4.1 Ingresos mensuales aproximados</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Ingreso mensual aproximado:</strong> {rangoMap[normalize(sectionData.ie_rango)] || '—'}</div>
          <div><strong>Cuenta con ingresos adicionales:</strong> {yn(normalize(sectionData.ie_ingresos_adicionales))}</div>
          {normalize(sectionData.ie_ingresos_adicionales_tipo) !== '' && (
            <div><strong>Tipo de ingreso adicional:</strong> {normalize(sectionData.ie_ingresos_adicionales_tipo)}</div>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 6px', fontSize: 16, color: '#334155' }}>4.2 Gastos mensuales generales</h4>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
          (Realizados por el participante y las personas que dependen económicamente de él)
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px 14px' }}>
          {gastos.map((g) => (
            <div key={g.key} style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: '#334155' }}>{g.label}</div>
              <div style={{ fontSize: 13, color: '#111827', wordBreak: 'break-word' }}>{normalize(sectionData[g.key]) || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc', overflowX: 'auto' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 16, color: '#334155' }}>4.3 Préstamos o compromisos financieros</h4>
        <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Tipo de compromiso</th>
              <th style={thStyle}>Pago mensual</th>
              <th style={thStyle}>Saldo pendiente</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((p) => (
              <tr key={p.base}>
                <td style={tdStyle}>{p.label}</td>
                <td style={tdStyle}>{normalize(sectionData[`${p.base}_pago`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`${p.base}_saldo`]) || '—'}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...tdStyle, fontWeight: 800 }}>TOTALES (suma)</td>
              <td style={{ ...tdStyle, fontWeight: 800 }}>
                ${totalPrestamoPago.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </td>
              <td style={{ ...tdStyle, fontWeight: 800 }}>
                ${totalPrestamoSaldo.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ padding: 14, background: '#ecfdf5', borderRadius: 12, border: '2px solid #10b981' }}>
        <div style={{ fontWeight: 800, color: '#065f46', fontSize: 15 }}>TOTAL DE GASTOS MENSUALES APROXIMADOS</div>
        <div style={{ marginTop: 6, fontWeight: 900, color: '#047857', fontSize: 20 }}>
          Total estimado: ${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
          Los montos indicados son aproximados y se registran con fines de análisis socioeconómico del hogar.
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc', overflowX: 'auto' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 16, color: '#334155' }}>4.4 Personas que dependen económicamente</h4>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          <div><strong>Número de dependientes:</strong> {normalize(sectionData.ie_num_dependientes) || '—'}</div>
          <div><strong>Tipo de dependientes:</strong> {tipoDependientes || '—'}</div>
        </div>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Nombre completo</th>
              <th style={thStyle}>Parentesco</th>
              <th style={thStyle}>Edad</th>
              <th style={thStyle}>Estado civil</th>
              <th style={thStyle}>Ocupación o grado escolar</th>
              <th style={thStyle}>Institución pública / privada</th>
              <th style={thStyle}>Empresa o actividad laboral</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3].map((idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_nombre_completo`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_parentesco`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_edad`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_estado_civil`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_ocupacion_grado`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_institucion`]) || '—'}</td>
                <td style={tdStyle}>{normalize(sectionData[`ie_dep_${idx}_empresa_actividad`]) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {normalize(sectionData.ie_dep_mas_texto) !== '' && (
          <div style={{ marginTop: 10 }}><strong>Información adicional de dependientes:</strong> {normalize(sectionData.ie_dep_mas_texto)}</div>
        )}
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>4.5 Observaciones del evaluado</h4>
        <div>{normalize(sectionData.ie_obs_evaluado) || '—'}</div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>4.6 Situación crediticia</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Buró de crédito (problema relevante):</strong> {yn(normalize(sectionData.ie_buro_problema))}</div>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>4.7 Detalle general del historial crediticio (opcional)</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Detalle declarativo:</strong> {normalize(sectionData.ie_buro_problema) === 'si' ? buroChecks || '—' : '—'}</div>
          {normalize(sectionData.ie_buro_problema) === 'si' && normalize(sectionData.ie_buro_otro_texto) !== '' && <div><strong>Otro:</strong> {normalize(sectionData.ie_buro_otro_texto)}</div>}
          <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
            Esta información es de carácter declarativo y no implica consulta a sociedades de información crediticia.
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLegalSection(sectionData: Record<string, string>) {
  const normalize = (v: unknown) => (v != null ? String(v).trim() : '');
  const yn = (v: string) => (v === 'si' ? 'Sí' : v === 'no' ? 'No' : '—');
  const tramite = normalize(sectionData.cap_tramite) === 'autorizo'
    ? 'Autorizo el trámite'
    : normalize(sectionData.cap_tramite) === 'no_autorizo'
      ? 'No autorizo el trámite'
      : '—';
  const docs = [
    { key: 'cap_doc_acta', label: 'Acta de nacimiento' },
    { key: 'cap_doc_ine', label: 'Credencial para votar (INE)' },
    { key: 'cap_doc_foto', label: 'Fotografía reciente con fondo blanco' },
    { key: 'cap_doc_domicilio', label: 'Comprobante de domicilio (no mayor a 3 meses)' },
  ].filter((doc) => normalize(sectionData[doc.key]) !== '');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>5.1 Antecedentes legales (declarativo)</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Antecedente legal declarado:</strong> {yn(normalize(sectionData.al_legal))}</div>
          {normalize(sectionData.al_legal_texto) !== '' && (
            <div><strong>Detalle declarado:</strong> {normalize(sectionData.al_legal_texto)}</div>
          )}
          <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
            La presente información es de carácter declarativo, no constituye dictamen legal y no sustituye documentos oficiales emitidos por autoridad competente.
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>5.2 Trámite de carta de no antecedentes penales</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Autorización para trámite:</strong> {tramite}</div>
        </div>
      </div>

      {docs.length > 0 && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>Documentación adjunta</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {docs.map((doc) => {
              const filePath = normalize(sectionData[doc.key]);
              const url = documentDownloadApiUrl(filePath);
              return (
                <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <strong style={{ minWidth: 260 }}>{doc.label}:</strong>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{filePath.replace(/^.*[/\\]/, '')}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" download style={{ padding: '6px 12px', background: '#059669', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>
                      Descargar
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function renderHabitosSection(sectionData: Record<string, string>) {
  const normalize = (v: unknown) => (v != null ? String(v).trim() : '');
  const yn = (v: string) => (v === 'si' ? 'Sí' : v === 'no' ? 'No' : '—');
  const alcoholMap: Record<string, string> = {
    no: 'No',
    ocasional: 'Ocasional',
    frecuente: 'Frecuente',
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>Hábitos generales</h4>
      <div style={{ display: 'grid', gap: 8 }}>
        <div><strong>¿Consume alcohol?:</strong> {alcoholMap[normalize(sectionData.bw_alcohol)] || '—'}</div>
        <div><strong>¿Fuma?:</strong> {yn(normalize(sectionData.bw_tabaco))}</div>
        <div><strong>¿Consume alguna sustancia prohibida?:</strong> {yn(normalize(sectionData.bw_sustancia_prohibida))}</div>
      </div>
    </div>
  );
}

function renderEntornoViviendaSection(sectionData: Record<string, string>) {
  const normalize = (v: unknown) => (v != null ? String(v).trim() : '');
  const ynBool = (v: string) => (['1', 'si', 'true'].includes(v.toLowerCase()) ? 'Sí' : ['0', 'no', 'false'].includes(v.toLowerCase()) ? 'No' : '—');
  const zonaMap: Record<string, string> = {
    residencial: 'Residencial',
    popular: 'Popular',
    campestre: 'Campestre',
    industrial: 'Industrial',
    turistica: 'Turística',
    otro: 'Otro',
  };
  const tipoMap: Record<string, string> = {
    casa: 'Casa',
    departamento: 'Departamento',
    condominio: 'Condominio',
    unidad: 'Unidad habitacional (Infonavit / Fovissste)',
  };
  const coloniaMap: Record<string, string> = {
    privado: 'Privado',
    abierto: 'Abierto',
    seguridad: 'Con sistema de seguridad',
    otro: 'Otro',
  };
  const actividadMap: Record<string, string> = {
    industrial: 'Industrial',
    comercial: 'Comercial',
    ejidal: 'Ejidal / Rural',
    otro: 'Otro',
  };
  const transporteMap: Record<string, string> = {
    publico: 'Transporte público',
    propio: 'Vehículo propio',
    empresa: 'Transporte de la empresa',
    pie: 'A pie',
    otro: 'Otro',
  };
  const tiempoMap: Record<string, string> = {
    menos30: 'Menos de 30 min',
    '30_60': '30–60 min',
    mas60: 'Más de 60 min',
  };
  const servicios = [
    ['vivi_serv_agua', 'Agua'],
    ['vivi_serv_luz', 'Luz'],
    ['vivi_serv_alumbrado', 'Alumbrado público'],
    ['vivi_serv_drenaje', 'Drenaje'],
    ['vivi_serv_pavimentacion', 'Pavimentación'],
    ['vivi_serv_transporte', 'Transporte público'],
    ['vivi_serv_areas_verdes_cuidadas', 'Áreas verdes cuidadas'],
    ['vivi_serv_areas_verdes_descuidadas', 'Áreas verdes descuidadas'],
  ] as const;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>7.1 Entorno de la vivienda</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Zona de la vivienda:</strong> {zonaMap[normalize(sectionData.vivi_zona)] || '—'}</div>
          {normalize(sectionData.vivi_zona) === 'otro' && normalize(sectionData.vivi_zona_otro) !== '' && <div><strong>Zona de la vivienda (otro):</strong> {normalize(sectionData.vivi_zona_otro)}</div>}
          <div><strong>Tipo de vivienda:</strong> {tipoMap[normalize(sectionData.vivi_tipo)] || '—'}</div>
          <div><strong>Colonia / tipo de fraccionamiento:</strong> {coloniaMap[normalize(sectionData.vivi_colonia_tipo)] || '—'}</div>
          {normalize(sectionData.vivi_colonia_tipo) === 'otro' && normalize(sectionData.vivi_colonia_otro) !== '' && <div><strong>Colonia / tipo de fraccionamiento (otro):</strong> {normalize(sectionData.vivi_colonia_otro)}</div>}
          <div><strong>Actividad vecinal predominante:</strong> {actividadMap[normalize(sectionData.vivi_actividad_vecinal)] || '—'}</div>
          {normalize(sectionData.vivi_actividad_vecinal) === 'otro' && normalize(sectionData.vivi_actividad_vecinal_otro) !== '' && <div><strong>Actividad vecinal (otro):</strong> {normalize(sectionData.vivi_actividad_vecinal_otro)}</div>}
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>7.1 Servicios públicos de la zona</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {servicios.map(([key, label]) => (
            <div key={key}><strong>{label}:</strong> {ynBool(normalize(sectionData[key]))}</div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
          Esta información es de carácter declarativo y podrá ser complementada con la verificación domiciliaria, en caso de que haya sido autorizada por el evaluado.
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#334155' }}>7.2 Medios de transporte y traslado al trabajo</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          <div><strong>Medio principal de transporte:</strong> {transporteMap[normalize(sectionData.transporte_medio)] || '—'}</div>
          <div><strong>Tiempo aproximado de traslado:</strong> {tiempoMap[normalize(sectionData.transporte_tiempo)] || '—'}</div>
        </div>
      </div>
    </div>
  );
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
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [pageDrafts, setPageDrafts] = useState<FormDataBySection>({});
  const [pageSaving, setPageSaving] = useState(false);
  const [pageUploadingKey, setPageUploadingKey] = useState<string | null>(null);

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
  const [concImageUrl, setConcImageUrl] = useState('');
  const [concFechaCierre, setConcFechaCierre] = useState('');
  const [concAnalista, setConcAnalista] = useState('');
  const [savingConc, setSavingConc] = useState(false);
  const [uploadingConcImage, setUploadingConcImage] = useState(false);

  // Historia laboral admin notes
  const [hlAdminOpen, setHlAdminOpen] = useState(true);
  const [hlAdminFields, setHlAdminFields] = useState<Record<string, string>>({});
  const [hlAdminSaving, setHlAdminSaving] = useState(false);
  const [hlAdminUploadingKey, setHlAdminUploadingKey] = useState<string | null>(null);

  const [showVerdictToCompany, setShowVerdictToCompany] = useState(false);

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

  useEffect(() => {
    if (!currentTab || currentTab === 'Uso interno (analista)' || formLoading) return;
    setEditingTab(currentTab);
    setPageDrafts((prev) => {
      if (prev[currentTab]) return prev;
      return {
        ...prev,
        [currentTab]: { ...originalSectionData },
      };
    });
  }, [currentTab, formLoading]);

  const loadAll = () => {
    if (!invitationId) return;
    setFormLoading(true);
    const formUrl = `/api/studies.php?action=get_form_data&invitation_id=${invitationId}`;
    const concUrl = `/api/studies.php?action=get_conclusion&invitation_id=${invitationId}`;
    const domUrl = `/api/studies.php?action=get_domiciliary&invitation_id=${invitationId}`;
    const studyUrl = `/api/studies.php?action=get_study&id=${studyId}`;
    Promise.all([
      fetch(formUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => ({})) : {})),
      fetch(concUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)),
      fetch(domUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => null) : null)),
      fetch(studyUrl, { credentials: 'include' }).then(async (r) => (r.ok ? r.json().catch(() => ({})) : {})),
    ])
      .then(([formRes, concRes, domRes, studyRes]) => {
        setFormData(typeof formRes === 'object' && formRes !== null && !formRes.error ? formRes : {});
        setEditingTab(null);
        setPageDrafts({});

        setConcNotes(concRes?.analyst_notes ?? '');
        setConcVerdict(concRes?.verdict ?? null);
        setConcResultado(concRes?.resultado_actualizacion ?? null);
        setConcObsRel(concRes?.observaciones_relevantes ?? '');
        setConcImageUrl(concRes?.analyst_image_url ?? '');
        setConcFechaCierre(concRes?.fecha_cierre_estudio ? String(concRes.fecha_cierre_estudio).slice(0, 10) : '');
        setConcAnalista(concRes?.analista_responsable ?? '');

        setDomPhotoUrl(domRes?.photo_url ?? '');
        setDomVisitDate(domRes?.visit_date ? String(domRes.visit_date).slice(0, 10) : '');
        setDomVisitType(domRes?.visit_type === 'referenciada' ? 'referenciada' : 'presencial');
        setDomNotes(domRes?.analyst_notes ?? '');

        setShowVerdictToCompany(!!studyRes?.show_verdict_to_company);

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

  const originalSectionData = useMemo<Record<string, string>>(
    () => (currentTab && formData[currentTab] ? Object.fromEntries(getCandidateSectionEntries(currentTab, formData[currentTab] || {})) : {}),
    [currentTab, formData]
  );
  const draftSectionData = pageDrafts[currentTab] || originalSectionData;
  const sectionDirty = !sectionsEqual(originalSectionData, draftSectionData);
  const isEditingCurrentTab = editingTab === currentTab;

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
        analyst_image_url: concImageUrl,
        fecha_cierre_estudio: concFechaCierre || null,
        analista_responsable: concAnalista,
      }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => setToast(d.error || 'Conclusión guardada'))
      .finally(() => setSavingConc(false));
  };

  const handleConclusionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const max = 5 * 1024 * 1024;
    const lower = file.name.toLowerCase();
    const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(lower);
    if (!isImage) {
      setToast('Solo se permiten imÃ¡genes JPG, PNG o WebP');
      e.target.value = '';
      return;
    }
    if (file.size > max) {
      setToast('La imagen no debe superar 5 MB');
      e.target.value = '';
      return;
    }
    setUploadingConcImage(true);
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d?.url) {
          setConcImageUrl(String(d.url));
          setToast('Imagen cargada. Recuerda guardar las conclusiones.');
        } else {
          setToast('No se pudo subir la imagen');
        }
      })
      .finally(() => {
        setUploadingConcImage(false);
        e.target.value = '';
      });
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

  const cancelEditingCurrentTab = () => {
    if (!currentTab) return;
    setPageDrafts((prev) => {
      const next = { ...prev };
      delete next[currentTab];
      return next;
    });
    setEditingTab((prev) => (prev === currentTab ? null : prev));
    setPageUploadingKey(null);
  };

  const updateDraftField = (fieldKey: string, fieldValue: string) => {
    if (!currentTab) return;
    if (editingTab !== currentTab) {
      setEditingTab(currentTab);
    }
    setPageDrafts((prev) => ({
      ...prev,
      [currentTab]: {
        ...(prev[currentTab] || originalSectionData),
        [fieldKey]: fieldValue,
      },
    }));
  };

  const uploadEditableFieldFile = (file: File, fieldKey: string) => {
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      setToast('El archivo no debe superar 5 MB');
      return;
    }
    const config = getFileFieldConfig(fieldKey);
    const lower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf');
    const isImage = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(lower);
    if (fieldKey === 'foto_participante' && !isImage) {
      setToast('Solo se permiten imágenes JPG o PNG para la fotografía');
      return;
    }
    if (fieldKey !== 'foto_participante' && config.accept.includes('application/pdf') && !config.accept.includes('image/') && !isPdf) {
      setToast('Solo se permiten archivos PDF para este campo');
      return;
    }
    if (config.accept.includes('image/') && !isPdf && !isImage) {
      setToast('Solo se permiten PDF o imágenes compatibles para este campo');
      return;
    }
    setPageUploadingKey(fieldKey);
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd })
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d?.url) {
          updateDraftField(fieldKey, String(d.url));
          setToast('Archivo cargado. Recuerda guardar los cambios de esta página.');
        } else {
          setToast('No se pudo subir el archivo');
        }
      })
      .finally(() => setPageUploadingKey(null));
  };

  const saveCurrentTabEdits = () => {
    if (!invitationId || !currentTab || !sectionDirty) return;
    setPageSaving(true);
    const draft = pageDrafts[currentTab] || {};
    const fields = Object.entries(draft).map(([field_key, field_value]) => ({
      section: currentTab,
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
      .then((d) => {
        if (d?.error) {
          setToast(d.error);
          return;
        }
        setFormData((prev) => ({
          ...prev,
          [currentTab]: {
            ...(prev[currentTab] || {}),
            ...draft,
          },
        }));
        setToast('Cambios guardados');
        setPageDrafts((prev) => {
          const next = { ...prev };
          delete next[currentTab];
          return next;
        });
        setEditingTab((prev) => (prev === currentTab ? null : prev));
      })
      .finally(() => setPageSaving(false));
  };

  const renderEditableSection = (sectionName: string, sectionData: Record<string, string>) => {
    const entries = getCandidateSectionEntries(sectionName, sectionData);
    if (entries.length === 0) {
      return <p style={{ color: '#9ca3af' }}>No hay campos editables en esta página.</p>;
    }

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ padding: 14, borderRadius: 12, background: '#eff6ff', color: '#1e3a5f', border: '1px solid #bfdbfe', fontSize: 13 }}>
          Modo edición activo. Los cambios que guardes aquí se reflejarán en el panel de empresa y en el PDF final regenerado del estudio.
        </div>

        {entries.map(([fieldKey, rawValue]) => {
          const value = String(rawValue ?? '');
          const options = getFieldOptions(fieldKey);
          const fileField = isFileField(fieldKey, value);
          const checkboxField = isBooleanCheckboxField(fieldKey, value);
          const yesNoField = !checkboxField && isYesNoField(fieldKey, value);
          const multilineField = !fileField && !options && isMultilineField(fieldKey, value);
          const dateField = !fileField && !options && isDateField(fieldKey, value);
          const downloadUrl = fileField && value ? documentDownloadApiUrl(value) : '';
          const fileConfig = fileField ? getFileFieldConfig(fieldKey) : null;

          return (
            <div key={fieldKey} style={{ padding: 14, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 800, color: '#0f172a', fontSize: 14 }}>
                {formatFieldLabel(fieldKey)}
              </label>

              {fileField && fileConfig ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{fileConfig.help}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <label style={{ cursor: pageUploadingKey === fieldKey ? 'wait' : 'pointer' }}>
                      <input
                        type="file"
                        accept={fileConfig.accept}
                        style={{ display: 'none' }}
                        disabled={pageUploadingKey !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          uploadEditableFieldFile(file, fieldKey);
                          e.target.value = '';
                        }}
                      />
                      <span style={{ display: 'inline-block', padding: '10px 16px', background: pageUploadingKey === fieldKey ? '#64748b' : '#1e40af', color: '#fff', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>
                        {pageUploadingKey === fieldKey ? 'Subiendo…' : 'Adjuntar archivo'}
                      </span>
                    </label>
                    {value ? <span style={{ color: '#6b7280', fontSize: 13 }}>{value.replace(/^.*[/\\]/, '')}</span> : <span style={{ color: '#94a3b8', fontSize: 13 }}>Sin archivo</span>}
                    {downloadUrl ? (
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#059669', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                        Descargar actual
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : options ? (
                <select
                  value={value}
                  onChange={(e) => updateDraftField(fieldKey, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="">Selecciona una opción</option>
                  {options.map((option) => (
                    <option key={`${fieldKey}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : checkboxField ? (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={['1', 'si', 'true'].includes(value.trim().toLowerCase())}
                    onChange={(e) => updateDraftField(fieldKey, e.target.checked ? '1' : '0')}
                  />
                  Marcar como Sí
                </label>
              ) : yesNoField ? (
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {[
                    { value: 'si', label: 'Sí' },
                    { value: 'no', label: 'No' },
                  ].map((option) => (
                    <label key={`${fieldKey}-${option.value}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="radio"
                        name={fieldKey}
                        checked={value.trim().toLowerCase() === option.value}
                        onChange={() => updateDraftField(fieldKey, option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              ) : multilineField ? (
                <textarea
                  value={value}
                  onChange={(e) => updateDraftField(fieldKey, e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              ) : (
                <input
                  type={dateField ? 'date' : fieldKey.includes('correo') ? 'email' : fieldKey.includes('telefono') ? 'tel' : 'text'}
                  value={value}
                  onChange={(e) => updateDraftField(fieldKey, e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              )}
            </div>
          );
        })}

        {sectionDirty ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={cancelEditingCurrentTab}
              disabled={pageSaving}
              style={{ padding: '10px 14px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 10, cursor: pageSaving ? 'not-allowed' : 'pointer', fontWeight: 800 }}
            >
              Cancelar cambios
            </button>
            <button
              type="button"
              onClick={saveCurrentTabEdits}
              disabled={pageSaving}
              style={{ padding: '10px 14px', background: pageSaving ? '#9ca3af' : '#059669', color: '#fff', border: 'none', borderRadius: 10, cursor: pageSaving ? 'not-allowed' : 'pointer', fontWeight: 900 }}
            >
              {pageSaving ? 'Guardando…' : 'Guardar cambios de esta página'}
            </button>
          </div>
        ) : null}

        {sectionName === 'Historia Laboral' && (
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Notas del analista (referencias laborales)</h4>
              <button type="button" onClick={() => setHlAdminOpen((s) => !s)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                {hlAdminOpen ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {hlAdminOpen && (
              <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                {buildHistoriaLaboralAdminBlocks(sectionData as Record<string, string>).map(({ label, prefix }) => {
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
  };

  const renderReadOnlySection = (sectionName: string, sectionData: Record<string, string>) => {
    const entries = getCandidateSectionEntries(sectionName, sectionData);
    if (entries.length === 0) {
      return <p style={{ color: '#9ca3af' }}>â€”</p>;
    }
    if (sectionName === 'InformaciÃ³n del CÃ³nyuge, Familiares y Contacto') {
      return renderConyugeFamiliaContactoTable(sectionData as Record<string, string>);
    }
    if (sectionName === 'Ingresos y SituaciÃ³n EconÃ³mica') {
      return renderEconomicSituationSection(sectionData as Record<string, string>);
    }
    if (sectionName === 'InformaciÃ³n Legal y TrÃ¡mite de Carta de No Antecedentes Penales') {
      return renderLegalSection(sectionData as Record<string, string>);
    }
    if (sectionName === 'Bienestar y Antecedentes Legales') {
      return renderHabitosSection(sectionData as Record<string, string>);
    }
    if (sectionName === 'Entorno Social y Condiciones de Vivienda') {
      return renderEntornoViviendaSection(sectionData as Record<string, string>);
    }
    const isDocumentosSection = sectionName.toLowerCase() === 'documentos';
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
                <span>{valueStr || 'â€”'}</span>
              )}
            </div>
          );
        })}

        {sectionName === 'Historia Laboral' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Notas del analista (referencias laborales)</h4>
              <button type="button" onClick={() => setHlAdminOpen((s) => !s)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                {hlAdminOpen ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {hlAdminOpen && (
              <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
                {buildHistoriaLaboralAdminBlocks(sectionData as Record<string, string>).map(({ label, prefix }) => {
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
                                {hlAdminUploadingKey === k3 ? 'Subiendoâ€¦' : 'Adjuntar'}
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
                    {hlAdminSaving ? 'Guardandoâ€¦' : 'Guardar notas de historia laboral'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '18px 18px 80px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 96 }}>
          <button onClick={backTo} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', marginBottom: 12, fontSize: 14 }}>
            ← Volver
          </button>

          <div style={{ display: 'grid', gap: 8 }}>
            {tabs.map((t, idx) => (
              <button
                key={t}
                onClick={() => setTabIdx(idx)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: tabIdx === idx ? '#111' : '#fff',
                  color: tabIdx === idx ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: 13,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {t}
                {pageDrafts[t] && !sectionsEqual(Object.fromEntries(getCandidateSectionEntries(t, formData[t] || {})), pageDrafts[t]) ? ' *' : ''}
              </button>
            ))}
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
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
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Imagen de analista</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handleConclusionImageUpload} disabled={uploadingConcImage} />
                  {concImageUrl ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{concImageUrl.replace(/^.*[/\\]/, '')}</span>
                      <a href={documentDownloadApiUrl(concImageUrl)} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 10px', background: '#059669', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12 }}>
                        Descargar / Ver
                      </a>
                      <span style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>
                        {uploadingConcImage ? 'Subiendo imagen…' : 'Puedes adjuntar nueva imagen para reemplazarla'}
                      </span>
                    </div>
                  ) : (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#475569', fontWeight: 700 }}>
                      {uploadingConcImage ? 'Subiendo imagen…' : 'Suba y guarde para poder descargar despuÃ©s'}
                    </p>
                  )}
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
                {/* Guardado de conclusiones al final (incluye semáforo) */}

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
                  ) : (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#475569', fontWeight: 700 }}>
                      Suba y guarde para poder descargar después
                    </p>
                  )}
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
                    {savingDom ? 'Guardando…' : 'Guardar verificación domiciliaria'}
                  </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '16px 0' }} />

                <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 13 }}>
                  Semáforo (opcional – visibilidad empresa según configuración)
                </p>
                {showVerdictToCompany ? (
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
                            fontWeight: 900,
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
                ) : (
                  <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                    El semáforo no está visible para la empresa (configuración del estudio).
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleSaveConclusion}
                    disabled={savingConc}
                    style={{
                      padding: '10px 14px',
                      background: savingConc ? '#9ca3af' : '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: savingConc ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    {savingConc ? 'Guardando…' : 'Guardar conclusiones y cierre'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                {isEditingCurrentTab ? (
                  <span style={{ padding: '8px 12px', borderRadius: 999, background: '#dbeafe', color: '#1d4ed8', fontSize: 12, fontWeight: 800 }}>
                    Edición directa habilitada en esta página
                  </span>
                ) : null}
                {isEditingCurrentTab && !sectionDirty ? (
                  <button type="button" onClick={cancelEditingCurrentTab} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                    Cancelar
                  </button>
                ) : null}
              </div>
              {formLoading ? (
                <p style={{ color: '#6b7280' }}>Cargando…</p>
              ) : (() => {
                const sectionData = formData[currentTab] || {};
                const entries = getCandidateSectionEntries(currentTab, sectionData);
                if (entries.length === 0) return <p style={{ color: '#9ca3af' }}>—</p>;
                if (currentTab === 'Información del Cónyuge, Familiares y Contacto') {
                  return isEditingCurrentTab
                    ? renderEditableSection(currentTab, draftSectionData)
                    : renderReadOnlySection(currentTab, sectionData);
                }
                if (currentTab === 'Ingresos y Situación Económica') {
                  return isEditingCurrentTab
                    ? renderEditableSection(currentTab, draftSectionData)
                    : renderEconomicSituationSection(sectionData as Record<string, string>);
                }
                if (currentTab === 'Información Legal y Trámite de Carta de No Antecedentes Penales') {
                  return isEditingCurrentTab
                    ? renderEditableSection(currentTab, draftSectionData)
                    : renderLegalSection(sectionData as Record<string, string>);
                }
                if (currentTab === 'Bienestar y Antecedentes Legales') {
                  return isEditingCurrentTab
                    ? renderEditableSection(currentTab, draftSectionData)
                    : renderHabitosSection(sectionData as Record<string, string>);
                }
                if (currentTab === 'Entorno Social y Condiciones de Vivienda') {
                  return isEditingCurrentTab
                    ? renderEditableSection(currentTab, draftSectionData)
                    : renderEntornoViviendaSection(sectionData as Record<string, string>);
                }
                if (isEditingCurrentTab) {
                  return renderEditableSection(currentTab, draftSectionData);
                }
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
                            {buildHistoriaLaboralAdminBlocks(sectionData as Record<string, string>).map(({ label, prefix }) => {
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
