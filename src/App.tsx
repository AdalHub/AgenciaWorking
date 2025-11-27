// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/contact.tsx';
import Career from './pages/career';
import DetailTemplate from './components/DetailTemplate/DetailTemplate';
import ScrollToTop from './ScrollToTop.tsx';
import AdminPage from './pages/admin';
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
        <Route path="/admin" element={<AdminPage />} />
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
      </Routes>
    </BrowserRouter>
  );
}
