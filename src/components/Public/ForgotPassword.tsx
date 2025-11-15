import { useState } from 'react';

interface ForgotPasswordProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'email' | 'code' | 'password';

export default function ForgotPassword({ onClose, onSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/user_auth.php?action=request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset code');
      } else {
        setSuccess(data.message || 'Reset code sent to your email');
        setStep('code');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/user_auth.php?action=verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired code');
      } else {
        setSuccess('Code verified. Please set your new password.');
        setStep('password');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user_auth.php?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setSuccess('Password reset successfully! You can now login.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    fontSize: '1rem',
    color: '#111827',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '0.5rem',
  };

  const linkStyle: React.CSSProperties = {
    color: '#063591',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    display: 'inline-block',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          maxWidth: 420,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>
            {step === 'email' && 'Forgot Password'}
            {step === 'code' && 'Enter Reset Code'}
            {step === 'password' && 'Set New Password'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: 0,
              width: 24,
              height: 24,
            }}
          >
            ✕
          </button>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              Enter your email address and we'll send you a reset code.
            </p>
            <input
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#063591';
                e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <a style={linkStyle} onClick={onClose}>
                Back to Login
              </a>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              Check your email for the 6-digit reset code. Enter it below.
            </p>
            <input
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#063591';
                e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              maxLength={6}
              required
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <a
                style={linkStyle}
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                  setSuccess(null);
                }}
              >
                Resend Code
              </a>
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              Enter your new password. Make sure it's at least 6 characters.
            </p>
            <input
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#063591';
                e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <input
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = '#063591';
                e.target.style.boxShadow = '0 0 0 3px rgba(6, 53, 145, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {error && (
          <div style={{ color: 'red', marginTop: 12, fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: 'green', marginTop: 12, fontSize: '0.9rem', textAlign: 'center' }}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

