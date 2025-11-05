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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services/:slug" element={<DetailTemplate />} />
        <Route path="/about-us" element={<DetailTemplate />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/schedule" element={<ScheduleList />} />
        <Route path="/schedule/:id" element={<ServiceDetail />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
      </Routes>
    </BrowserRouter>
  );
}
