// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/contact.tsx';
import Career from './pages/career';
import DetailTemplate from './components/DetailTemplate/DetailTemplate';
import ScrollToTop from './ScrollToTop.tsx';
import AdminLayout from './components/Admin/AdminLayout';
import AdminTabContent from './pages/admin';
import ScheduleList from './components/Public/ScheduleList';
import ServiceDetail from './components/Public/ServiceDetail';
import PaymentSuccess from './components/Public/PaymentSuccess';
import PaymentFailed from './components/Public/PaymentFailed';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Account from './pages/Account';
import MySchedule from './pages/MySchedule';
import IntercomMessenger from './components/IntercomMessenger';
import BlogListPage from './pages/BlogList';
import BlogDetailPage from './pages/BlogDetail';
import EmpresaOnboarding from './pages/EmpresaOnboarding';
import EmpresaDashboard from './pages/EmpresaDashboard';
import EmpresaSetupPage from './pages/EmpresaSetupPage.tsx';
import EmpresaResetPasswordPage from './pages/EmpresaResetPasswordPage.tsx';
import EstudioPage from './pages/EstudioPage';
import EstudioPublicoPage from './pages/EstudioPublicoPage';
import EstudiosViewPage from './pages/EstudiosViewPage';
import AdminStudiesPage from './pages/AdminStudiesPage';
import AdminStudyDetailPage from './pages/AdminStudyDetailPage';
import AdminEmailQueuePage from './pages/AdminEmailQueuePage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <IntercomMessenger />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services/:slug" element={<DetailTemplate />} />
        <Route path="/about-us" element={<DetailTemplate />} />
        <Route path="/career" element={<Career />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/jobs" replace />} />
          <Route path="jobs" element={<AdminTabContent tab="jobs" />} />
          <Route path="services" element={<AdminTabContent tab="services" />} />
          <Route path="calendar" element={<AdminTabContent tab="calendar" />} />
          <Route path="blogs" element={<AdminTabContent tab="blogs" />} />
          <Route path="studies" element={<AdminStudiesPage />} />
          <Route path="studies/:id" element={<AdminStudyDetailPage />} />
          <Route path="email-queue" element={<AdminEmailQueuePage />} />
        </Route>
        <Route path="/schedule" element={<ScheduleList />} />
        <Route path="/schedule/:id" element={<ServiceDetail />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/account" element={<Account />} />
        <Route path="/my-schedule" element={<MySchedule />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/empresa/onboarding" element={<EmpresaOnboarding />} />
        <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
        <Route path="/empresa/setup" element={<EmpresaSetupPage />} />
        <Route path="/empresa/reset-password" element={<EmpresaResetPasswordPage />} />
        <Route path="/reset-password" element={<EmpresaResetPasswordPage />} />
        <Route path="/estudio" element={<EstudioPage />} />
        <Route path="/estudio/publico" element={<EstudioPublicoPage />} />
        <Route path="/estudios/view" element={<EstudiosViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
