// src/pages/admin.tsx
import { useEffect, useState } from 'react';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

// your OLD jobs admin (the one you had originally)
import AdminPanel from '../components/Admin/AdminPanel';

// our NEW services admin
import Services from '../components/Admin/Services';

type AdminTab = 'jobs' | 'services';

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<AdminTab>('jobs');

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth.php?action=me', {
        credentials: 'include',
      });
      const data = await res.json();
      // adjust to your auth.php shape
      if (res.ok && (data.user || data.username)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('admin check failed', err);
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: '80px' }}>
        {checking ? (
          <p style={{ textAlign: 'center' }}>Checking admin session…</p>
        ) : !isAdmin ? (
          // show the admin login (the PHP one)
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Login</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const username = formData.get('username') as string;
                const password = formData.get('password') as string;

                const res = await fetch('/api/auth.php?action=login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ username, password }),
                });
                const data = await res.json();
                if (res.ok) {
                  checkAdmin();
                } else {
                  alert(data.error || 'Login failed');
                }
              }}
            >
              <input
                name="username"
                placeholder="Admin username"
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                style={{ width: '100%', marginBottom: 8, padding: 6 }}
              />
              <button
                type="submit"
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
                Login
              </button>
            </form>
          </div>
        ) : (
          // logged in → show tabs
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 48px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Admin</h2>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button
                onClick={() => setTab('jobs')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'jobs' ? '#111' : '#e7e8ec',
                  color: tab === 'jobs' ? '#fff' : '#111',
                  cursor: 'pointer',
                }}
              >
                Job postings
              </button>
              <button
                onClick={() => setTab('services')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'services' ? '#111' : '#e7e8ec',
                  color: tab === 'services' ? '#fff' : '#111',
                  cursor: 'pointer',
                }}
              >
                Services & scheduling
              </button>
            </div>

            {tab === 'jobs' ? (
              // your original admin screen
              <AdminPanel />
            ) : (
              // our new one
              <Services />
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
