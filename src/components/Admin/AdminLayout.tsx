// Shared admin layout: auth check, side menu (desktop) / hamburger (mobile), Outlet for child routes.
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../header/header';
import Footer from '../Footer/Footer';
import ForgotPassword from './ForgotPassword';

const SIDEBAR_WIDTH = 220;
const MOBILE_BREAK = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAK : false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAK);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const navItems: { to: string; label: string }[] = [
  { to: '/admin/jobs', label: 'Job postings' },
  { to: '/admin/services', label: 'Services & scheduling' },
  { to: '/admin/calendar', label: 'Calendar' },
  { to: '/admin/blogs', label: 'Post Blog' },
  { to: '/admin/studies', label: 'Estudios' },
  { to: '/admin/email-queue', label: 'Cola de correo' },
];

const linkStyle = (isActive: boolean) => ({
  display: 'block',
  padding: '10px 14px',
  borderRadius: 8,
  color: isActive ? '#fff' : '#374151',
  background: isActive ? '#111' : 'transparent',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  marginBottom: 4,
});

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth.php?action=me', { credentials: 'include' });
      const data = await res.json();
      setIsAdmin(!!(res.ok && (data.user || data.username)));
    } catch {
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  if (checking) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, textAlign: 'center' }}>
          <p>Checking admin session…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, width: '100%', boxSizing: 'border-box' }}>
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
                if (res.ok) checkAdmin();
                else alert(data.error || 'Login failed');
              }}
            >
              <input
                name="username"
                placeholder="Admin username"
                style={{
                  width: '100%',
                  marginBottom: 8,
                  padding: '0.75rem 1rem',
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
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
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
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
        </main>
        <Footer />
      </>
    );
  }

  const sidebarContent = (
    <nav style={{ padding: '12px 0' }}>
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to !== '/admin/studies'}
          style={({ isActive }) => linkStyle(isActive)}
          onClick={closeMenu}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '65vh',
          paddingTop: 80,
          paddingBottom: 48,
          width: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 1400,
            margin: '0 auto',
            padding: isMobile ? '0 12px' : '0 20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Desktop sidebar */}
          {!isMobile && (
            <aside
              style={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                borderRight: '1px solid #e5e7eb',
                paddingRight: 16,
                marginRight: 24,
              }}
            >
              <h2 style={{ marginBottom: 12, fontSize: '1.25rem' }}>Admin</h2>
              {sidebarContent}
            </aside>
          )}

          {/* Mobile: hamburger + overlay */}
          {isMobile && (
            <>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Toggle menu"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'block', width: 20, height: 2, background: '#111', marginBottom: 4 }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: '#111', marginBottom: 4 }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: '#111' }} />
                </button>
                <span style={{ fontWeight: 600 }}>Admin</span>
              </div>
              {menuOpen && (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={closeMenu}
                    onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      zIndex: 9998,
                      top: 80,
                    }}
                  />
                  <aside
                    style={{
                      position: 'fixed',
                      top: 80,
                      left: 0,
                      bottom: 0,
                      width: 260,
                      maxWidth: '85vw',
                      background: '#fff',
                      borderRight: '1px solid #e5e7eb',
                      zIndex: 9999,
                      padding: '16px',
                      overflowY: 'auto',
                    }}
                  >
                    <h2 style={{ marginBottom: 12, fontSize: '1.25rem' }}>Admin</h2>
                    {sidebarContent}
                  </aside>
                </>
              )}
            </>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
