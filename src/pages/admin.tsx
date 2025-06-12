// src/pages/admin.tsx
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
import AdminPanel from '../components/Admin/AdminPanel'; // ✅ contains login + form logic

export default function AdminPage() {
  return (
    <>
      <Header />
      <AdminPanel />
      <Footer />
    </>
  );
}
