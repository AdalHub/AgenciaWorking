// src/pages/admin.tsx
import { useEffect, useState } from 'react';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

// your OLD jobs admin (the one you had originally)
import AdminPanel from '../components/Admin/AdminPanel';

// our NEW services admin
import Services from '../components/Admin/Services';
import ForgotPassword from '../components/Admin/ForgotPassword';
import Calendar from '../components/Admin/Calendar';
import Blogs from '../components/Admin/Blogs';

type AdminTab = 'jobs' | 'services' | 'calendar' | 'blogs';

// Hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<AdminTab>('jobs');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const isMobile = useIsMobile();

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
      <main style={{ 
        minHeight: '65vh', 
        paddingTop: '80px',
        width: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
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
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
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
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#063591',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </button>
            </div>
            {showForgotPassword && (
              <ForgotPassword
                onClose={() => setShowForgotPassword(false)}
                onSuccess={() => {
                  setShowForgotPassword(false);
                  checkAdmin();
                }}
              />
            )}
          </div>
        ) : (
          // logged in → show tabs
          <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            padding: isMobile ? '0 12px 48px' : '0 16px 48px',
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: isMobile ? '1.5rem' : '2rem' }}>Admin</h2>
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 20,
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setTab('jobs')}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'jobs' ? '#111' : '#e7e8ec',
                  color: tab === 'jobs' ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
              >
                Job postings
              </button>
              <button
                onClick={() => setTab('services')}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'services' ? '#111' : '#e7e8ec',
                  color: tab === 'services' ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
              >
                Services & scheduling
              </button>
              <button
                onClick={() => setTab('calendar')}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'calendar' ? '#111' : '#e7e8ec',
                  color: tab === 'calendar' ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
              >
                Calendar
              </button>
              <button
                onClick={() => setTab('blogs')}
                style={{
                  padding: isMobile ? '8px 12px' : '6px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: tab === 'blogs' ? '#111' : '#e7e8ec',
                  color: tab === 'blogs' ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  whiteSpace: 'nowrap',
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
              >
                Post Blog
              </button>
            </div>

            {tab === 'jobs' ? (
              // your original admin screen
              <AdminPanel />
            ) : tab === 'services' ? (
              // our new one
              <Services />
            ) : tab === 'calendar' ? (
              // calendar view
              <Calendar />
            ) : (
              // blogs view
              <Blogs />
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
