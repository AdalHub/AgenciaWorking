// src/components/Public/PaymentSuccess.tsx
// src/components/Public/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);

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
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setDetails(data);
        } else {
          setStatus('ok');
          setDetails(data);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    confirm();
  }, [sessionId]);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      {status === 'loading' && <p>Finalizing your booking…</p>}
      {status === 'ok' && (
        <>
          <h1>Payment successful 🎉</h1>
          <p>Your booking has been created.</p>
          <pre
            style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: 8,
              overflowX: 'auto',
            }}
          >
            {JSON.stringify(details, null, 2)}
          </pre>
          <p>You can close this window.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1>We couldn’t confirm the payment</h1>
          <p>Please contact support with your payment receipt.</p>
          {details && (
            <pre
              style={{
                background: '#f3f4f6',
                padding: '1rem',
                borderRadius: 8,
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
