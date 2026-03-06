// Admin tab content for jobs, services, calendar, blogs (used inside AdminLayout).
import AdminPanel from '../components/Admin/AdminPanel';
import Services from '../components/Admin/Services';
import Calendar from '../components/Admin/Calendar';
import Blogs from '../components/Admin/Blogs';

export type AdminTab = 'jobs' | 'services' | 'calendar' | 'blogs';

type Props = { tab: AdminTab };

export default function AdminTabContent({ tab }: Props) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div
      style={{
        padding: isMobile ? '0 0 24px' : '0 0 48px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {tab === 'jobs' && <AdminPanel />}
      {tab === 'services' && <Services />}
      {tab === 'calendar' && <Calendar />}
      {tab === 'blogs' && <Blogs />}
    </div>
  );
}
