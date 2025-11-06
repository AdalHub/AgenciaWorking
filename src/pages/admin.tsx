// src/pages/admin.tsx
import { useEffect, useState } from 'react';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import Services from '../components/Admin/Services';
import AdminLogin from '../components/Admin/Login';

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/auth.php?action=me', {
        credentials: 'include',
      });
      const data = await res.json();
      // adjust depending on your API shape
      if (res.ok && data && (data.user || data.username)) {
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
      <main style={{ minHeight: '60vh', paddingTop: '80px' }}>
        {checking ? (
          <p style={{ textAlign: 'center' }}>Checking admin session…</p>
        ) : isAdmin ? (
          <Services />
        ) : (
          <AdminLogin onLogin={checkAdmin} />
        )}
      </main>
      <Footer />
    </>
  );
}
