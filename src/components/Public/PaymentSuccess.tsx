// src/components/Public/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../header/header';
import Footer from '../Footer/Footer';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const confirm = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      try {
        const res = await fetch(`/api/stripe.php?action=confirm&session_id=${encodeURIComponent(sessionId)}`, {
          credentials: 'include',
        });
        await res.json();
        if (!res.ok) {
          setStatus('error');
        } else {
          setStatus('ok');
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    confirm();
  }, [sessionId]);

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '65vh',
          paddingTop: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 48px',
        }}
      >
        <div
          style={{
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            animation: status === 'ok' ? 'fadeInUp 0.5s ease' : 'none',
          }}
        >
          {status === 'loading' && (
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #063591',
                  borderRadius: '50%',
                  margin: '0 auto 2rem',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <h1 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
                Finalizing your booking…
              </h1>
              <p style={{ color: '#6b7280' }}>Please wait while we process your payment.</p>
            </div>
          )}

          {status === 'ok' && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#10b981',
                  borderRadius: '50%',
                  margin: '0 auto 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Payment Successful! 🎉
              </h1>

              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 12,
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p
                      style={{
                        fontSize: '1rem',
                        color: '#065f46',
                        fontWeight: 600,
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      Email confirmation sent successfully
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#047857',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      We've sent a payment confirmation email to your registered email address.
                      Please check your inbox (and spam folder) for the confirmation details.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/schedule')}
                style={{
                  padding: '0.875rem 2rem',
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#111';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
                Return to Services
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  margin: '0 auto 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '1rem',
                }}
              >
                Payment Confirmation Failed
              </h1>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  marginBottom: '2rem',
                  lineHeight: 1.6,
                }}
              >
                We couldn't confirm your payment at this time. Please contact support with your
                payment receipt if you have any concerns.
              </p>

              <button
                onClick={() => navigate('/schedule')}
                style={{
                  padding: '0.875rem 2rem',
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#111';
                }}
              >
                Return to Services
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </>
  );
}
