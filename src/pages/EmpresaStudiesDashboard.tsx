import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import CompanyStudiesDashboardPanel from '../components/Company/CompanyStudiesDashboardPanel';

export default function EmpresaStudiesDashboard() {
  return (
    <>
      <Header />
      <CompanyStudiesDashboardPanel showPortalBackLink />
      <Footer />
    </>
  );
}
