// /estudio/publico?estudio=ID — redirects to /estudio?codigo=... so the candidate can fill the form.
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = '/api';

export default function EstudioPublicoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studyId = searchParams.get('estudio') ?? '';
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!studyId.trim()) {
      setMessage('Falta el número de estudio en la URL.');
      setStatus('error');
      return;
    }
    fetch(`${API}/studies.php?action=get_public_study_invitation&study_id=${encodeURIComponent(studyId)}`, {
      credentials: 'include',
    })
      .then((r) => {
        if (r.ok) return r.json();
        if (r.status === 403) return { _forbidden: true };
        if (r.status === 404) throw new Error('Estudio no encontrado.');
        if (r.status === 410) throw new Error('Este estudio ha sido cancelado.');
        throw new Error('No se pudo cargar el estudio.');
      })
      .then((data: { unique_code?: string; _forbidden?: boolean }) => {
        if (data?._forbidden) {
          return fetch(`${API}/studies.php?action=get_study&id=${encodeURIComponent(studyId)}`, { credentials: 'include' })
            .then((r2) => {
              if (!r2.ok) throw new Error('Este estudio no es público. Si eres la empresa invitada, usa el enlace que recibiste por correo.');
              return r2.json();
            })
            .then((study: { company_access_token?: string }) => {
              if (study?.company_access_token) {
                navigate(`/estudios/view?token=${encodeURIComponent(study.company_access_token)}`, { replace: true });
              } else {
                setMessage('Este estudio no es público. Si eres la empresa invitada, usa el enlace que recibiste por correo.');
                setStatus('error');
              }
            });
        }
        const code = data?.unique_code;
        if (code) {
          navigate(`/estudio?codigo=${encodeURIComponent(code)}`, { replace: true });
        } else {
          setMessage('No se pudo obtener el enlace del estudio.');
          setStatus('error');
        }
      })
      .catch((err: Error) => {
        setMessage(err?.message || 'Error al cargar el estudio.');
        setStatus('error');
      });
  }, [studyId, navigate]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ fontSize: 18, color: '#374151' }}>Cargando estudio…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{ fontSize: 18, color: '#991b1b', marginBottom: 16 }}>{message}</p>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Volver al inicio</a>
      </div>
    </div>
  );
}
