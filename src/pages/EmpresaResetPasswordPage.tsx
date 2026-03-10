import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

export default function EmpresaResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = (params.get('token') || '').trim();

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValid(false);
      setChecking(false);
      return;
    }
    fetch(`/api/user_auth.php?action=reset-link-status&token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then((r) => r.json().catch(() => ({})).then((d) => ({ ok: r.ok, d })))
      .then(({ ok }) => setValid(ok))
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
      const res = await fetch('/api/user_auth.php?action=reset-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'No se pudo restablecer la contraseña.');
        setSubmitting(false);
        return;
      }
      setSuccess('Contraseña actualizada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/'), 1400);
    } catch {
      setError('Error de red.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 90, paddingBottom: 48 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px' }}>
          {checking ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Validando enlace…</p>
          ) : !valid ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <h2 style={{ marginTop: 0 }}>Enlace inválido o expirado</h2>
              <p style={{ color: '#6b7280' }}>
                Solicita un nuevo enlace desde “Forgot Password” o contacta a Agencia.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <h2 style={{ marginTop: 0 }}>Restablecer contraseña</h2>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
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
                {success && <p style={{ margin: 0, color: '#166534' }}>{success}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

