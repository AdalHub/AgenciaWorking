import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import CompanyStudyDetailView from '../components/Company/CompanyStudyDetailView';

const API = '/api';

type TokenValidation = {
  valid: boolean;
  study_id: number;
  company_name: string;
  token_expires_at?: string;
} | null;

export default function EstudiosViewPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [tokenData, setTokenData] = useState<TokenValidation>(null);
  const [verified, setVerified] = useState(false);
  const [studyId, setStudyId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!token.trim()) {
      setInvalid(true);
      setLoading(false);
      return;
    }
    fetch(`${API}/studies.php?action=validate_company_token&token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (r.status === 404) {
          setInvalid(true);
          return null;
        }
        if (r.status === 410) {
          setExpired(true);
          return null;
        }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: TokenValidation) => {
        if (data && data.valid) {
          setTokenData(data);
          setStudyId(data.study_id);
          const stored = sessionStorage.getItem('estudios_view_token');
          const storedId = sessionStorage.getItem('estudios_view_study_id');
          if (stored === token && storedId === String(data.study_id)) setVerified(true);
        } else if (!invalid && !expired) setInvalid(true);
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleVerify = () => {
    if (!token || !email.trim()) return;
    setVerifySubmitting(true);
    setVerifyError(null);
    fetch(`${API}/studies.php?action=verify_company_token_email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email: email.trim() }),
    })
      .then((r) => r.json().catch(() => ({})))
      .then((data: { verified?: boolean; study_id?: number; error?: string }) => {
        if (data.verified && data.study_id) {
          sessionStorage.setItem('estudios_view_token', token);
          sessionStorage.setItem('estudios_view_study_id', String(data.study_id));
          setStudyId(data.study_id);
          setVerified(true);
        } else if (data.error === 'email_mismatch') {
          setVerifyError('El correo no coincide con el de este enlace');
          setAttempts((a) => a + 1);
        } else if (data.error === 'too_many_attempts') {
          setVerifyError('Demasiados intentos. Contacta a HR Capital Working.');
        } else {
          setVerifyError('El correo no coincide con el de este enlace');
          setAttempts((a) => a + 1);
        }
      })
      .finally(() => setVerifySubmitting(false));
  };

  if (loading) {
    return (
      <>
        <main style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Cargando…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (invalid) {
    return (
      <>
        <main style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 12px', color: '#1f2937' }}>Este enlace ha expirado o no es válido.</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Contacta a HR Capital Working: <a href="mailto:Socioeconomicos@agenciaworking.com">Socioeconomicos@agenciaworking.com</a></p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (expired) {
    return (
      <>
        <main style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 12px', color: '#1f2937' }}>Este enlace ha expirado o no es válido.</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Contacta a HR Capital Working: <a href="mailto:Socioeconomicos@agenciaworking.com">Socioeconomicos@agenciaworking.com</a></p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (tokenData && !verified) {
    return (
      <>
        <main style={{ minHeight: '100vh', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 480, padding: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Verifica tu identidad</h2>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14 }}>Ingresa el correo al que fue enviado este enlace</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" style={{ width: '100%', padding: 10, marginBottom: 12, boxSizing: 'border-box', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            {verifyError && <p style={{ margin: '0 0 12px', color: '#dc2626', fontSize: 13 }}>{verifyError}</p>}
            <button onClick={handleVerify} disabled={verifySubmitting || !email.trim() || attempts >= 3} style={{ width: '100%', padding: 12, background: attempts >= 3 ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, cursor: attempts >= 3 ? 'not-allowed' : 'pointer' }}>Verificar</button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (verified && studyId != null) {
    return (
      <>
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>HR Capital Working — Vista de resultados</h1>
        </div>
        <CompanyStudyDetailView studyId={studyId} token={token} backLink={null} isMagicLink />
        <Footer />
      </>
    );
  }

  return null;
}
