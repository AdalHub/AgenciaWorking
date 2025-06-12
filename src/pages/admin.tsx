// ✅ src/pages/admin.tsx
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import AdminPanel from '../components/Admin/AdminPanel';

export default function AdminPage() {
  return (
    <>
      <Header />
      <AdminPanel />
      <Footer />
    </>
  );
}
