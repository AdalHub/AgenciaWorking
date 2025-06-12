import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebaseConfig';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Logged in as:', result.user.displayName);
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return <button onClick={handleLogin}>Login with Google</button>;
}
