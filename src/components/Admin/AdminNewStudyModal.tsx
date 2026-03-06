// Multi-step New Study modal: Step 1 config, Step 2 private (CSV/Manual) or public (link)
import { useState } from 'react';

type CandidateRow = { name: string; email: string; phone: string };

function parseCSV(text: string): CandidateRow[] {
  const rows: CandidateRow[] = [];
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return rows;
  const first = lines[0]?.toLowerCase() ?? '';
  const hasHeader = first.includes('nombre') || first.includes('correo') || first.includes('email') || first.includes('name');
  const start = hasHeader ? 1 : 0;
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length === 1 && isValidEmail(parts[0])) {
      rows.push({ name: '', email: parts[0], phone: '' });
    } else {
      const name = parts[0] ?? '';
      const email = parts[1] ?? '';
      const phone = parts[2] ?? '';
      if (email) rows.push({ name, email, phone });
    }
  }
  return rows;
}

function parseManual(text: string): CandidateRow[] {
  const rows: CandidateRow[] = [];
  const lines = text.trim().split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const parts = t.split(',').map((p) => p.trim());
    if (parts.length === 1) {
      if (isValidEmail(parts[0])) rows.push({ name: '', email: parts[0], phone: '' });
      continue;
    }
    const name = parts[0] ?? '';
    const email = parts[1] ?? '';
    const phone = parts[2] ?? '';
    if (email) rows.push({ name, email, phone });
  }
  return rows;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminNewStudyModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [studyType, setStudyType] = useState<'private' | 'public'>('private');
  const [companyName, setCompanyName] = useState('');
  const [formatVersion, setFormatVersion] = useState('Formato 2025');
  const [inviteSectionOpen, setInviteSectionOpen] = useState(false);
  const [invitedCompanyEmail, setInvitedCompanyEmail] = useState('');
  const [showVerdictToCompany, setShowVerdictToCompany] = useState(false);
  const [manualTab, setManualTab] = useState<'csv' | 'manual'>('csv');
  const [csvText, setCsvText] = useState('');
  const [manualText, setManualText] = useState('');
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicStudyId, setPublicStudyId] = useState<number | null>(null);
  const [publicEmails, setPublicEmails] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteFilled = invitedCompanyEmail.trim() !== '';
  const showVerdictVisible = inviteFilled || inviteSectionOpen;

  const handlePreviewCSV = () => {
    const rows = parseCSV(csvText);
    setCandidates(rows);
  };

  const handlePreviewManual = () => {
    const rows = parseManual(manualText);
    setCandidates(rows);
  };

  const handleCreatePrivate = async (candidateList?: CandidateRow[]) => {
    const list = candidateList ?? candidates;
    if (list.length === 0) {
      setError('Agrega al menos un candidato. Pega el CSV o ingresa datos manualmente y haz clic en "Crear estudio y enviar correos".');
      return;
    }
    const validationErrors = list.map((c, i) => {
      const msg: string[] = [];
      if (!c.email) msg.push('Falta correo');
      else if (!isValidEmail(c.email)) msg.push('Correo inválido');
      return { row: i + 1, msg };
    }).filter((e) => e.msg.length > 0);
    if (validationErrors.length > 0) {
      setError(`Revisa los datos: ${validationErrors.map((e) => `Fila ${e.row}: ${e.msg.join(', ')}`).join('; ')}`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/studies.php?action=create_study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_name: companyName,
          study_type: 'private',
          format_version: formatVersion,
          invited_company_email: invitedCompanyEmail.trim() || null,
          show_verdict_to_company: showVerdictToCompany,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear estudio');
      const studyId = data.id;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const expiresStr = expiresAt.toISOString().slice(0, 19) + 'Z';

      for (const c of list) {
        const r = await fetch('/api/studies.php?action=create_invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            study_id: studyId,
            candidate_name: c.name,
            candidate_email: c.email,
            candidate_phone: c.phone || undefined,
            code_expires_at: expiresStr,
          }),
        });
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error || 'Error al crear invitación');
        }
      }

      const sendRes = await fetch('/api/studies.php?action=send_study_emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ study_id: studyId }),
      });
      if (!sendRes.ok) {
        const d = await sendRes.json();
        throw new Error(d.error || 'Error al enviar correos');
      }

      setToast(`Estudio creado y correos enviados a ${list.length} candidatos`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublic = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/studies.php?action=create_study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          company_name: companyName,
          study_type: 'public',
          format_version: formatVersion,
          invited_company_email: invitedCompanyEmail.trim() || null,
          show_verdict_to_company: showVerdictToCompany,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear estudio');
      setPublicStudyId(data.id);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}/estudio/publico?estudio=${publicStudyId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPublicNotification = async () => {
    const emails = publicEmails.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/studies.php?action=send_public_study_notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ study_id: publicStudyId, emails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setToast(`Notificación enviada a ${data.queued ?? emails.length} correos`);
      setPublicEmails('');
    } catch (err: any) {
      setError(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizePublic = () => {
    onSuccess();
    onClose();
  };

  const validationErrors = candidates.map((c, i) => {
    const msg: string[] = [];
    if (!c.email) msg.push('Falta correo');
    else if (!isValidEmail(c.email)) msg.push('Correo inválido');
    return { row: i + 1, msg };
  }).filter((e) => e.msg.length > 0);

  const csvTemplate = 'nombre,correo,telefono\n';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: '#fff', borderRadius: 12, maxWidth: 640, width: '95vw', maxHeight: '90vh', overflow: 'auto', padding: 24 }}>
        {toast && <div style={{ marginBottom: 12, padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 8 }}>{toast}</div>}
        {error && <div style={{ marginBottom: 12, padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8 }}>{error}</div>}

        {step === 1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Nuevo estudio</h3>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Paso 1 de 2</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nombre de la empresa *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nombre de la empresa"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>No es necesario que la empresa tenga una cuenta registrada</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Tipo de estudio</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStudyType('private')}
                  style={{
                    flex: 1,
                    padding: 16,
                    border: studyType === 'private' ? '2px solid #1d4ed8' : '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: studyType === 'private' ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 18 }}>🔒</span>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>Privado</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Envía el estudio a personas específicas. Cada persona recibe su propio código único por correo.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setStudyType('public')}
                  style={{
                    flex: 1,
                    padding: 16,
                    border: studyType === 'public' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: studyType === 'public' ? '#f0fdf4' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 18 }}>🌐</span>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>Público</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Cualquier persona con el enlace puede acceder. Comparte un solo enlace.</div>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Versión del formato</label>
              <input
                type="text"
                value={formatVersion}
                onChange={(e) => setFormatVersion(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }}
              />
            </div>

            {!inviteSectionOpen ? (
              <button type="button" onClick={() => setInviteSectionOpen(true)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', marginBottom: 16 }}>+ Invitar empresa</button>
            ) : (
              <div style={{ marginBottom: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Correo de la empresa (opcional)</label>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>La empresa recibirá un enlace para ver los resultados. No necesita tener cuenta.</p>
                <input
                  type="email"
                  value={invitedCompanyEmail}
                  onChange={(e) => setInvitedCompanyEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }}
                />
                {showVerdictVisible && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="showVerdict" checked={showVerdictToCompany} onChange={(e) => setShowVerdictToCompany(e.target.checked)} />
                    <label htmlFor="showVerdict">Permitir que la empresa vea el dictamen final</label>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
              <button type="button" onClick={() => { if (studyType === 'public') handleCreatePublic(); else setStep(2); }} disabled={!companyName.trim()} style={{ padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: companyName.trim() ? 'pointer' : 'not-allowed' }}>Siguiente</button>
            </div>
          </>
        )}

        {step === 2 && studyType === 'private' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Agregar candidatos</h3>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Paso 2 de 2</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={() => setManualTab('csv')} style={{ padding: '8px 16px', background: manualTab === 'csv' ? '#111' : '#e5e7eb', color: manualTab === 'csv' ? '#fff' : '#111', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Subir CSV</button>
              <button type="button" onClick={() => setManualTab('manual')} style={{ padding: '8px 16px', background: manualTab === 'manual' ? '#111' : '#e5e7eb', color: manualTab === 'manual' ? '#fff' : '#111', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Ingresar manualmente</button>
            </div>

            {manualTab === 'csv' && (
              <>
                <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplate)}`} download="plantilla_candidatos.csv" style={{ display: 'inline-block', marginBottom: 8, color: '#2563eb', fontSize: 14 }}>Descargar plantilla CSV</a>
                <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 12, textAlign: 'center' }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = () => { setCsvText(String(r.result)); };
                        r.readAsText(f);
                      }
                    }}
                    style={{ display: 'block', margin: '0 auto' }}
                  />
                  <p style={{ margin: 8, color: '#6b7280', fontSize: 14 }}>o pega el contenido CSV abajo</p>
                </div>
                <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="nombre,correo,telefono&#10;Juan,juan@mail.com,5551234567" rows={4} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box', marginBottom: 8 }} />
                <button type="button" onClick={handlePreviewCSV} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Previsualizar</button>
              </>
            )}

            {manualTab === 'manual' && (
              <>
                <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Un candidato por línea: Nombre, correo@ejemplo.com, teléfono (teléfono opcional)" rows={5} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box', marginBottom: 8 }} />
                <button type="button" onClick={handlePreviewManual} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Previsualizar</button>
              </>
            )}

            {candidates.length > 0 && (
              <>
                <p style={{ marginTop: 16, fontWeight: 600 }}>{candidates.length} candidatos en vista previa</p>
                {validationErrors.length > 0 && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>Revisa: {validationErrors.map((e) => `Fila ${e.row}: ${e.msg.join(', ')}`).join('; ')}</div>}
                <div style={{ overflowX: 'auto', marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead><tr><th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Nombre</th><th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Correo</th><th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Teléfono</th></tr></thead>
                    <tbody>
                      {candidates.map((c, i) => (
                        <tr key={i} style={{ backgroundColor: validationErrors.some((e) => e.row === i + 1) ? '#fef2f2' : undefined }}>
                          <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>{c.name}</td>
                          <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>{c.email}</td>
                          <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>{c.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const text = manualTab === 'csv' ? csvText : manualText;
                  if (!text.trim()) {
                    setError('Pega el contenido CSV o ingresa candidatos (uno por línea: nombre, correo, teléfono).');
                    return;
                  }
                  const parsed = manualTab === 'csv' ? parseCSV(text) : parseManual(text);
                  if (parsed.length === 0) {
                    setError('No se encontraron candidatos con correo. Usa el formato: nombre, correo@ejemplo.com, teléfono');
                    return;
                  }
                  setCandidates(parsed);
                  setError(null);
                  handleCreatePrivate(parsed);
                }}
                disabled={loading || !(csvText.trim() || manualText.trim())}
                style={{ padding: '12px 24px', background: (csvText.trim() || manualText.trim()) && !loading ? '#16a34a' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 8, cursor: loading || !(csvText.trim() || manualText.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {loading ? 'Creando y enviando…' : 'Crear estudio y enviar correos'}
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>← Anterior</button>
            </div>
          </>
        )}

        {step === 2 && studyType === 'public' && publicStudyId && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Estudio público generado</h3>
            </div>
            <p style={{ marginBottom: 8 }}>Comparte este enlace:</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input readOnly value={`${window.location.origin}/estudio/publico?estudio=${publicStudyId}`} style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
              <button type="button" onClick={handleCopyPublicLink} style={{ padding: '10px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>{copied ? '¡Copiado!' : 'Copiar enlace'}</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Correos adicionales (separados por coma)</label>
              <textarea value={publicEmails} onChange={(e) => setPublicEmails(e.target.value)} placeholder="correo1@ejemplo.com, correo2@ejemplo.com" rows={2} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }} />
              <button type="button" onClick={handleSendPublicNotification} disabled={loading || !publicEmails.trim()} style={{ marginTop: 8, padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>Enviar notificación</button>
            </div>
            <button type="button" onClick={handleFinalizePublic} style={{ padding: '12px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Finalizar</button>
          </>
        )}
      </div>
    </div>
  );
}
