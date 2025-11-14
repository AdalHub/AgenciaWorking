// src/components/Public/AuthModal.tsx
import React, { useState } from 'react';

type PublicUser = {
  id: number;
  email: string;
  name?: string;
  phone?: string;
};

interface Props {
  onClose: () => void;
  onAuthSuccess: (user: PublicUser) => void;
}

export default function AuthModal({ onClose, onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: any = { email, password };
      if (mode === 'signup') {
        body.name = name;
        body.phone = phone;
      }
      const res = await fetch(`/api/user_auth.php?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
      } else {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
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
          padding: 20,
          width: 'min(400px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>
            {mode === 'login' ? 'Login' : 'Create account'}
          </h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              background: mode === 'login' ? '#1d4ed8' : '#e5e7eb',
              color: mode === 'login' ? '#fff' : '#111827',
              border: 'none',
              borderRadius: 6,
              padding: '4px 0',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              background: mode === 'signup' ? '#1d4ed8' : '#e5e7eb',
              color: mode === 'signup' ? '#fff' : '#111827',
              border: 'none',
              borderRadius: 6,
              padding: '4px 0',
            }}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              fontSize: '1rem',
              color: '#111827',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#063591';
              e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <input
            required
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              fontSize: '1rem',
              color: '#111827',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#063591';
              e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          {mode === 'signup' && (
            <>
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#063591';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#063591';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </>
          )}

          {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
