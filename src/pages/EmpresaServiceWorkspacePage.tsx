import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import ServiceWorkspacePanel from '../components/Company/ServiceWorkspacePanel';

export default function EmpresaServiceWorkspacePage() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = useMemo(() => String(params.slug || '').trim(), [params.slug]);

  return (
    <>
      <Header />
      <main style={{ minHeight: '65vh', paddingTop: 80, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <ServiceWorkspacePanel
            mode="company"
            slug={slug}
            backLabel="Volver al Portal Cliente"
            onBack={() => navigate('/empresa/dashboard')}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
