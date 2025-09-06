// src/components/Admin/AdminPanel.tsx
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react'; // <- type-only import fixes the error

import Login from './Login';
import JobForm from './JobForm';
import JobList from './JobList';

const container: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '80px 16px 32px',
  boxSizing: 'border-box',
};

const headerRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1rem',
};

const titleStyle: CSSProperties = { margin: 0, fontSize: 24 };

const card: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

const toolbar: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 12,
};

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetch('/api/auth.php?action=me')
      .then(r => r.json())
      .then(d => setIsLoggedIn(!!d.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth.php?action=logout', { method: 'POST' });
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <main style={container}>
      <div style={headerRow}>
        <h2 style={titleStyle}>Admin Panel</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <section style={card}>
        <div style={toolbar}>
          <button onClick={() => setFormVisible(v => !v)}>
            {formVisible ? 'Close Form' : 'Add Job'}
          </button>
        </div>

        {formVisible && (
          <div style={{ marginTop: 8 }}>
            <JobForm onClose={() => setFormVisible(false)} />
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <JobList />
        </div>
      </section>
    </main>
  );
}
