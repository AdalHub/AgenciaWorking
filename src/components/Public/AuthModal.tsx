// src/components/Public/AuthModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

const GOOGLE_CLIENT_ID = '249999009032-3tvnrjvsr52akh1e363l456mt0pa8fds.apps.googleusercontent.com';

type PublicUser = {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  account_type?: string;
  is_profile_complete?: boolean;
};

interface Props {
  accountContext?: 'default' | 'company';
  onClose: () => void;
  onAuthSuccess: (user: PublicUser) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
        };
      };
    };
  }
}

export default function AuthModal({ accountContext = 'default', onClose, onAuthSuccess }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [companyLoginNotCompanyError, setCompanyLoginNotCompanyError] = useState(false);
  const [lastLoginUser, setLastLoginUser] = useState<PublicUser | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const finishCompanySignup = async (user: PublicUser) => {
    try {
      const res = await fetch('/api/user_auth.php?action=set_account_type', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account_type: 'company' }),
      });
      const data = await res.json();
      if (data.user) {
        onAuthSuccess(data.user);
      } else {
        onAuthSuccess(user);
      }
      onClose();
      navigate('/empresa/onboarding');
    } catch (err) {
      onAuthSuccess(user);
      onClose();
      navigate('/empresa/onboarding');
    }
  };

  const finishCompanyLogin = (user: PublicUser) => {
    onAuthSuccess(user);
    onClose();
    navigate('/empresa/dashboard');
  };

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setError(null);
            setCompanyLoginNotCompanyError(false);
            setLoading(true);
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ idToken: response.credential }),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error || 'Google login failed');
              } else {
                const u = data.user as PublicUser;
                if (accountContext === 'company') {
                  await finishCompanySignup(u);
                } else {
                  onAuthSuccess(u);
                  onClose();
                }
              }
            } catch (err) {
              console.error(err);
              setError('Network error');
            } finally {
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    };

    if (window.google) {
      initGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogleSignIn();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, [onAuthSuccess, accountContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCompanyLoginNotCompanyError(false);
    setLoading(true);
    try {
      const body: any = { email, password };
      if (mode === 'signup') {
        body.name = name;
        body.phone = phone;
      }
      const res = await fetch(`/api/user_auth.php?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
        setLoading(false);
        return;
      }
      const u = data.user as PublicUser;
        if (accountContext === 'company') {
        if (mode === 'signup') {
          await finishCompanySignup(u);
        } else {
          if (u.account_type !== 'company') {
            setLastLoginUser(u);
            setCompanyLoginNotCompanyError(true);
          } else {
            finishCompanyLogin(u);
          }
        }
      } else {
        onAuthSuccess(u);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          width: 'min(400px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>
            {mode === 'login' ? 'Login' : 'Create account'}
          </h3>
          <button onClick={onClose}>✕</button>
        </div>

        {accountContext === 'company' && mode === 'signup' && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 12px',
              background: '#dbeafe',
              color: '#1e40af',
              borderRadius: 8,
              fontSize: '0.9rem',
            }}
          >
            Estás creando una cuenta empresarial
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setCompanyLoginNotCompanyError(false); }}
            style={{
              flex: 1,
              background: mode === 'login' ? '#1d4ed8' : '#e5e7eb',
              color: mode === 'login' ? '#fff' : '#111827',
              border: 'none',
              borderRadius: 6,
              padding: '4px 0',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setCompanyLoginNotCompanyError(false); }}
            style={{
              flex: 1,
              background: mode === 'signup' ? '#1d4ed8' : '#e5e7eb',
              color: mode === 'signup' ? '#fff' : '#111827',
              border: 'none',
              borderRadius: 6,
              padding: '4px 0',
            }}
          >
            Signup
          </button>
        </div>

        {/* Google Sign-In Button */}
        <div 
          ref={googleButtonRef}
          style={{ 
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center',
          }}
        />

        <div style={{ 
          textAlign: 'center', 
          marginBottom: 16,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ padding: '0 12px', fontSize: '0.875rem', color: '#6b7280' }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              fontSize: '1rem',
              color: '#111827',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#063591';
              e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <input
            required
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              fontSize: '1rem',
              color: '#111827',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#063591';
              e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          {mode === 'signup' && (
            <>
              <input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#063591';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#ffffff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: '1rem',
                  color: '#111827',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#063591';
                  e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </>
          )}

          {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}
          {companyLoginNotCompanyError && (
            <div style={{ color: '#b45309', fontSize: 13 }}>
              Esta cuenta no está registrada como cuenta empresarial. ¿Deseas acceder como usuario regular?{' '}
              <button
                type="button"
                onClick={() => {
                  if (lastLoginUser) onAuthSuccess(lastLoginUser);
                  onClose();
                }}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Cerrar y continuar
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
          
          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#063591',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  padding: '0.5rem',
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}
        </form>
      </div>
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}
