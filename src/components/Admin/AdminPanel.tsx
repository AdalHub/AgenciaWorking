import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Login from './Login';
import JobForm from './JobForm';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Admin Login</h2>
        <Login onLogin={() => setIsLoggedIn(true)} /> {/* ✅ Fix applied */}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Post a Job</h2>
      <JobForm />
    </div>
  );
}
