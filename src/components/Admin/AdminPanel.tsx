// ✅ src/components/admin/AdminPanel.tsx
import { useEffect, useState } from 'react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider, db } from '../../firebaseConfig';
import JobForm from './JobForm';
import JobList from './JobList';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {!isLoggedIn ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <h2>Admin Panel</h2>
          <button onClick={() => setFormVisible((v) => !v)}>
            {formVisible ? 'Close Form' : 'Add Job'}
          </button>
          {formVisible && <JobForm onClose={() => setFormVisible(false)} />}
          <JobList />
        </>
      )}
    </div>
  );
}
