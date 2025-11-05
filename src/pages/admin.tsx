// ✅ src/pages/admin.tsx
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import AdminPanel from '../components/Admin/AdminPanel';
import Services from '../components/Admin/Services';
export default function AdminPage() {
  return (
    <>
      <Header />
      <Services />
      <AdminPanel />
      <Footer />
    </>
  );
}
