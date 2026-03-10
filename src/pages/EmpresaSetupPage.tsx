import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

type StatusRes = {
  valid?: boolean;
  company_name?: string;
  email?: string;
  error?: string;
};

export default function EmpresaSetupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = (params.get('token') || '').trim();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusRes | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus({ error: 'invalid_token' });
      setLoading(false);
      return;
    }
    fetch(`/api/user_auth.php?action=company-invite-status&token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) return setStatus({ error: d?.error || 'invalid_token' });
        setStatus(d);
      })
      .catch(() => setStatus({ error: 'invalid_token' }))
      .finally(() => setLoading(false));
  }, [token]);

  const activate = async () => {
    setError(null);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/user_auth.php?action=company-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'No se pudo activar la cuenta');
        setSubmitting(false);
        return;
      }
      navigate('/empresa/dashboard');
    } catch {
      setError('Error de red');
      setSubmitting(false);
    }
  };

  const statusErrorText = (e?: string) => {
    if (e === 'token_expired') return 'Este enlace ha expirado. Solicita a Agencia que reenvíe la invitación.';
    if (e === 'token_used') return 'Este enlace ya fue utilizado. Si necesitas ayuda, contacta a Agencia.';
    if (e === 'email_mismatch') return 'El enlace no corresponde al correo invitado.';
    return 'El enlace es inválido. Contacta a Agencia.';
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 90, paddingBottom: 48 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Verificando invitación…</p>
          ) : status?.error || !status?.valid ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <h2 style={{ marginTop: 0 }}>No pudimos validar tu invitación</h2>
              <p style={{ color: '#6b7280' }}>{statusErrorText(status?.error)}</p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <h2 style={{ marginTop: 0 }}>Activa tu cuenta de empresa</h2>
              <p style={{ color: '#6b7280', marginTop: 0 }}>
                Empresa: <strong>{status.company_name || '—'}</strong><br />
                Correo invitado: <strong>{status.email || '—'}</strong>
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  type="password"
                  placeholder="Nueva contraseña (mínimo 8 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                {error && <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>}
                <button
                  type="button"
                  onClick={activate}
                  disabled={submitting}
                  style={{ padding: '10px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Activando…' : 'Activar cuenta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

