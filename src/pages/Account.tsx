import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

type PublicUser = {
  id: number;
  email: string;
  name?: string;
  phone?: string;
};

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/user_auth.php?action=me', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          // Not logged in, redirect to home
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load user', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: '80px', textAlign: 'center' }}>
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '65vh',
          paddingTop: '80px',
          maxWidth: 800,
          margin: '0 auto',
          padding: '80px 20px 48px',
        }}
      >
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>My Account</h1>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Email Address
              </label>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  color: '#111827',
                  fontSize: '1rem',
                }}
              >
                {user.email}
              </div>
            </div>

            <div
              style={{
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Full Name
              </label>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  color: user.name ? '#111827' : '#9ca3af',
                  fontSize: '1rem',
                }}
              >
                {user.name || 'Not provided'}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Phone Number
              </label>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  color: user.phone ? '#111827' : '#9ca3af',
                  fontSize: '1rem',
                }}
              >
                {user.phone || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/my-schedule')}
            style={{
              padding: '0.75rem 2rem',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            View My Schedule
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

