// CompanyProfileForm — shared between /empresa/onboarding and Account "Mi Empresa" tab
import React, { useState, useRef, useEffect } from 'react';

const INDUSTRIES = ['Manufactura', 'Comercio', 'Servicios', 'Tecnología', 'Salud', 'Educación', 'Construcción', 'Transporte', 'Finanzas', 'Otro'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export type CompanyProfileData = {
  legal_name?: string;
  trade_name?: string;
  rfc?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  logo_url?: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  contact_phone?: string;
  address_street?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  notification_email?: string;
  deletion_warning_email?: string;
};

const defaultCountry = 'México';

type Props = {
  initialData?: CompanyProfileData | null;
  onSave: (data: CompanyProfileData) => Promise<void>;
  onCancel: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  stickyBar?: boolean;
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.5rem',
};

export default function CompanyProfileForm({
  initialData,
  onSave,
  onCancel,
  cancelLabel = 'Cancelar',
  saveLabel = 'Guardar perfil',
  stickyBar = true,
}: Props) {
  const [form, setForm] = useState<CompanyProfileData>({
    legal_name: initialData?.legal_name ?? '',
    trade_name: initialData?.trade_name ?? '',
    rfc: initialData?.rfc ?? '',
    industry: initialData?.industry ?? '',
    company_size: initialData?.company_size ?? '',
    website: initialData?.website ?? '',
    logo_url: initialData?.logo_url ?? '',
    contact_name: initialData?.contact_name ?? '',
    contact_title: initialData?.contact_title ?? '',
    contact_email: initialData?.contact_email ?? '',
    contact_phone: initialData?.contact_phone ?? '',
    address_street: initialData?.address_street ?? '',
    address_neighborhood: initialData?.address_neighborhood ?? '',
    address_city: initialData?.address_city ?? '',
    address_state: initialData?.address_state ?? '',
    address_zip: initialData?.address_zip ?? '',
    address_country: initialData?.address_country ?? defaultCountry,
    notification_email: initialData?.notification_email ?? '',
    deletion_warning_email: initialData?.deletion_warning_email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        legal_name: initialData.legal_name ?? '',
        trade_name: initialData.trade_name ?? '',
        rfc: initialData.rfc ?? '',
        industry: initialData.industry ?? '',
        company_size: initialData.company_size ?? '',
        website: initialData.website ?? '',
        logo_url: initialData.logo_url ?? '',
        contact_name: initialData.contact_name ?? '',
        contact_title: initialData.contact_title ?? '',
        contact_email: initialData.contact_email ?? '',
        contact_phone: initialData.contact_phone ?? '',
        address_street: initialData.address_street ?? '',
        address_neighborhood: initialData.address_neighborhood ?? '',
        address_city: initialData.address_city ?? '',
        address_state: initialData.address_state ?? '',
        address_zip: initialData.address_zip ?? '',
        address_country: initialData.address_country ?? defaultCountry,
        notification_email: initialData.notification_email ?? '',
        deletion_warning_email: initialData.deletion_warning_email ?? '',
      });
    }
  }, [initialData]);

  const update = (key: keyof CompanyProfileData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setSaveError(null);
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload.php', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (data.url) update('logo_url', data.url);
    } catch (err) {
      setSaveError('Error al subir el logo');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      await onSave(form);
    } catch (err: any) {
      setSaveError(err?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1 */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Información de la empresa</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Razón social *</label>
            <input
              required
              type="text"
              value={form.legal_name}
              onChange={(e) => update('legal_name', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Nombre comercial</label>
            <input type="text" value={form.trade_name} onChange={(e) => update('trade_name', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>RFC *</label>
            <input
              required
              type="text"
              value={form.rfc}
              onChange={(e) => update('rfc', e.target.value.toUpperCase().slice(0, 13))}
              maxLength={13}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Giro / Industria *</label>
            <select required value={form.industry} onChange={(e) => update('industry', e.target.value)} style={inputStyle}>
              <option value="">Selecciona</option>
              {INDUSTRIES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tamaño de empresa *</label>
            <select required value={form.company_size} onChange={(e) => update('company_size', e.target.value)} style={inputStyle}>
              <option value="">Selecciona</option>
              {COMPANY_SIZES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sitio web</label>
            <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Logo de la empresa</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              style={{ ...inputStyle, padding: '0.5rem' }}
            />
            {form.logo_url && <p style={{ marginTop: 4, fontSize: '0.875rem', color: '#6b7280' }}>URL: {form.logo_url}</p>}
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Contacto principal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nombre del contacto *</label>
            <input required type="text" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Puesto / Cargo *</label>
            <input required type="text" value={form.contact_title} onChange={(e) => update('contact_title', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo de contacto *</label>
            <input required type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Teléfono de contacto *</label>
            <input required type="tel" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Dirección</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Calle y número *</label>
            <input required type="text" value={form.address_street} onChange={(e) => update('address_street', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Colonia *</label>
            <input required type="text" value={form.address_neighborhood} onChange={(e) => update('address_neighborhood', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ciudad *</label>
            <input required type="text" value={form.address_city} onChange={(e) => update('address_city', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Estado *</label>
            <input required type="text" value={form.address_state} onChange={(e) => update('address_state', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>C.P. *</label>
            <input required type="text" value={form.address_zip} onChange={(e) => update('address_zip', e.target.value.slice(0, 5))} maxLength={5} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>País *</label>
            <input required type="text" value={form.address_country} onChange={(e) => update('address_country', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Notificaciones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Correo para notificaciones de estudios *</label>
            <input required type="email" value={form.notification_email} onChange={(e) => update('notification_email', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo para avisos de eliminación *</label>
            <input required type="email" value={form.deletion_warning_email} onChange={(e) => update('deletion_warning_email', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </section>

      {saveError && <div style={{ color: '#dc2626', marginBottom: 12 }}>{saveError}</div>}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid #e5e7eb',
          ...(stickyBar ? { position: 'sticky' as const, bottom: 0, background: '#fff', paddingBottom: 8 } : {}),
        }}
      >
        <button type="button" onClick={onCancel} style={{ padding: '0.75rem 1.5rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>
          {cancelLabel}
        </button>
        <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.5rem', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Guardando…' : saveLabel}
        </button>
      </div>
    </form>
  );
}
