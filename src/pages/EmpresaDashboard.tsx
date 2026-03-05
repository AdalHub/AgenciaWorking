import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

type User = { id: number; email: string; account_type?: string; is_profile_complete?: boolean } | null;

export default function EmpresaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user_auth.php?action=me', { credentials: 'include' });
        const data = await res.json();
        if (!data.user) {
          navigate('/');
          return;
        }
        if (data.user.account_type !== 'company') {
          navigate('/');
          return;
        }
        setUser(data.user);
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: 80, textAlign: 'center' }}><p>Cargando…</p></main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          {user.is_profile_complete === false && (
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                background: '#fef9c3',
                border: '1px solid #facc15',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span>Completa el perfil de tu empresa para acceder a todas las funciones.</span>
              <Link
                to="/empresa/onboarding"
                style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}
              >
                Completar ahora
              </Link>
            </div>
          )}

          <h1 style={{ marginBottom: 24, fontSize: '1.75rem' }}>Panel de empresa</h1>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <p style={{ color: '#6b7280' }}>Bienvenido a tu panel. Aquí podrás gestionar tus estudios socioeconómicos.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
