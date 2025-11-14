// src/components/Admin/Login.tsx
import { useState } from 'react';

interface AdminLoginProps {
  onLogin?: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        // logged in!
        if (onLogin) onLogin();
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={{
            width: '100%',
            marginBottom: 8,
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
          placeholder="admin username / email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{
            width: '100%',
            marginBottom: 8,
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
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.6rem',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {error && (
          <p style={{ color: 'red', marginTop: 8 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
