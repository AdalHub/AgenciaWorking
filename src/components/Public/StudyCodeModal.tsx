// StudyCodeModal — Access study by unique code (candidate)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export default function StudyCodeModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState(false);

  const handleAcceder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Ingresa tu código único.');
      return;
    }
    // If user entered only digits, treat as study ID: public study → open public link; private → ask for real code
    if (/^\d+$/.test(trimmed)) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/studies.php?action=get_public_study_invitation&study_id=${encodeURIComponent(trimmed)}`,
          { credentials: 'include' }
        );
        if (res.status === 403) {
          setError('Este estudio es privado. Ingresa el código único que te enviamos por correo (no el número de estudio).');
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data?.unique_code) {
            onClose();
            navigate(`/estudio?codigo=${encodeURIComponent(data.unique_code)}`, { replace: true });
          } else {
            onClose();
            navigate(`/estudio/publico?estudio=${trimmed}`);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('No se pudo verificar el estudio. Intenta con tu código único.');
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/studies.php?action=get_invitation_by_code&code=${encodeURIComponent(trimmed)}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError('Código inválido o expirado. Verifica que lo escribiste correctamente.');
        return;
      }
      if (data.id) {
        onClose();
        navigate(`/estudio?codigo=${encodeURIComponent(trimmed)}`);
      } else {
        setError('Código inválido o expirado. Verifica que lo escribiste correctamente.');
      }
    } catch (err) {
      setError('Código inválido o expirado. Verifica que lo escribiste correctamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverLoading(true);
    setRecoverSuccess(false);
    try {
      const res = await fetch('/api/studies.php?action=resend_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email_or_phone: recoverEmail.trim() }),
      });
      const data = await res.json();
      if (data.ok !== false) {
        setRecoverSuccess(true);
      }
    } catch (err) {
      setRecoverSuccess(true); // stub shows success anyway
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 'min(400px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Acceder a mi Estudio</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
        </div>
        <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '0.9rem' }}>
          Ingresa el código único que recibiste por correo. Si tu estudio es público, puedes ingresar el número de estudio (ej. 2).
        </p>

        <form onSubmit={handleAcceder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Código único"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
          {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1rem',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Verificando…' : 'Acceder'}
          </button>
        </form>

        <div style={{ height: 1, background: '#e5e7eb', margin: '20px 0' }} />

        <button
          type="button"
          onClick={() => setShowRecover(!showRecover)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.9rem',
            padding: 0,
          }}
        >
          ¿No encuentras tu código? Recupéralo aquí
        </button>

        {showRecover && (
          <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
            <input
              type="text"
              placeholder="Correo electrónico o teléfono registrado"
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginBottom: 8,
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={handleResendCode}
              disabled={recoverLoading}
              style={{
                padding: '0.5rem 1rem',
                background: '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: recoverLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {recoverLoading ? 'Enviando…' : 'Reenviar código'}
            </button>
            {recoverSuccess && (
              <p style={{ margin: '8px 0 0', color: '#059669', fontSize: '0.875rem' }}>
                Si el dato es correcto, recibirás tu código pronto.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
