import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import CompanyProfileForm from '../components/Company/CompanyProfileForm';
import type { CompanyProfileData } from '../components/Company/CompanyProfileForm';

type User = { id: number; email: string; account_type?: string; is_profile_complete?: boolean } | null;

export default function EmpresaOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
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
        const pr = await fetch('/api/studies.php?action=company_profile', { credentials: 'include' });
        const prData = await pr.json();
        if (prData.id != null) setProfile(prData);
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSave = async (formData: CompanyProfileData) => {
    const res = await fetch('/api/studies.php?action=company_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al guardar');
    }
    const required = [
      formData.legal_name, formData.rfc, formData.industry, formData.company_size,
      formData.contact_name, formData.contact_title, formData.contact_email, formData.contact_phone,
      formData.address_street, formData.address_neighborhood, formData.address_city,
      formData.address_state, formData.address_zip, formData.address_country,
      formData.notification_email, formData.deletion_warning_email,
    ];
    const allFilled = required.every(Boolean);
    if (allFilled) {
      await fetch('/api/user_auth.php?action=set_profile_complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_profile_complete: true }),
      });
    }
    navigate('/empresa/dashboard');
  };

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
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => navigate('/empresa/dashboard')}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              Completar más tarde
            </button>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>Paso actual</div>
              <div style={{ fontWeight: 600 }}>Perfil de empresa</div>
            </div>
            <CompanyProfileForm
              initialData={profile}
              onSave={handleSave}
              onCancel={() => navigate('/empresa/dashboard')}
              cancelLabel="Cancelar"
              saveLabel="Guardar perfil"
              stickyBar
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
