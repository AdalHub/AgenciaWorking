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
          style={{ width: '100%', marginBottom: 8, padding: 6 }}
          placeholder="admin username / email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{ width: '100%', marginBottom: 8, padding: 6 }}
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
