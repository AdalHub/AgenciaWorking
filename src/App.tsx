// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/contact.tsx';
import Career from './pages/career';
import DetailTemplate from './components/DetailTemplate/DetailTemplate';
import ScrollToTop from './ScrollToTop.tsx';
import AdminPage from './pages/admin';

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
      </Routes>
    </BrowserRouter>
  );
}
