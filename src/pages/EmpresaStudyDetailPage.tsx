import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import CompanyStudyDetailView from '../components/Company/CompanyStudyDetailView';

export default function EmpresaStudyDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const studyId = useMemo(() => {
    const raw = params.id ?? '';
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [params.id]);

  return (
    <>
      <Header />
      <CompanyStudyDetailView
        studyId={studyId}
        token={null}
        backLink={
          <button
            type="button"
            onClick={() => navigate('/empresa/dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ← Back to dashboard
          </button>
        }
      />
      <Footer />
    </>
  );
}

