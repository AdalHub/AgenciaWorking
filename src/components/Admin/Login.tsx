// src/components/Admin/Login.tsx
import { useState, useEffect } from 'react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth.php?action=me')
      .then(r => r.json())
      .then(d => { if (d.user) onLogin(); })
      .catch(() => {});
  }, [onLogin]);

  const handleLogin = async () => {
    setErr(null);
    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Bad creds');
      onLogin();
    } catch (e) {
      setErr('Invalid username or password.');
    }
  };

  return (
    <div style={{maxWidth: 360, margin: '4rem auto', display:'grid', gap:12}}>
      <h2>Admin Login</h2>
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {err && <div style={{color:'crimson'}}>{err}</div>}
    </div>
  );
}
