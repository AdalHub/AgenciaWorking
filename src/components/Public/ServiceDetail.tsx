// src/components/Public/ServiceDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/header/header';
import Footer from '../../components/Footer/Footer';
import { markdownToHtml } from '../../utils/markdownToHtml';

type PublicUser = {
  id: number;
  email: string;
} | null;

type PublicService = {
  id: number;
  title: string;
  description?: string;
  hourly_rate: number;
};

type AvailabilityBlock = {
  service_id: number;
  start_utc: string;
  end_utc: string;
};

type BookingIntent = {
  intent_id: string;
  service_id: number;
  start_utc: string;
  end_utc: string;
  total_cents: number;
  currency: string;
  hours_billed?: number;
  note?: string;
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const serviceId = Number(id);
  const [service, setService] = useState<PublicService | null>(null);
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PublicUser>(null);
  const [loginRequiredMsg, setLoginRequiredMsg] = useState('');
  const [note, setNote] = useState('');
  const [bookingIntent, setBookingIntent] = useState<BookingIntent | null>(null);
  const [intentError, setIntentError] = useState('');
  const [paypalError, setPaypalError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!serviceId) return;
      setLoading(true);
      try {
        const [svcRes, avRes, meRes] = await Promise.all([
          fetch(`/api/services.php?action=get&id=${serviceId}`),
          fetch(`/api/availability.php?action=list&service_id=${serviceId}`),
          fetch('/api/user_auth.php?action=me', { credentials: 'include' }),
        ]);
        const svcData = await svcRes.json();
        const avData = await avRes.json();
        const meData = await meRes.json();
        setService(svcData);
        setAvailability(avData);
        setUser(meData.user);
      } catch (err) {
        console.error('load service detail failed', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [serviceId]);

  const handlePickSlot = async (slot: AvailabilityBlock) => {
    setIntentError('');
    setPaypalError('');
    setBookingIntent(null);

    if (!user) {
      setLoginRequiredMsg(
        'You need to login or signup from the header before scheduling this slot.'
      );
      return;
    }
    setLoginRequiredMsg('');

    try {
      const res = await fetch('/api/booking_intents.php?action=create_intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: serviceId,
          start_utc: slot.start_utc,
          end_utc: slot.end_utc,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIntentError(data.error || 'Failed to create booking intent');
      } else {
        setBookingIntent(data);
      }
    } catch (err) {
      console.error('intent failed', err);
      setIntentError('Network error');
    }
  };

  const handlePaypalCheckout = async () => {
    if (!bookingIntent) return;
    setPaypalError('');
    try {
      const res = await fetch('/api/paypal.php?action=create_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ intent_id: bookingIntent.intent_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaypalError(data.error || 'Failed to start PayPal checkout');
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error('paypal create order failed', err);
      setPaypalError('Network error');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 1rem 2rem' }}>
          Loading…
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 1rem 2rem' }}>
          <button
            onClick={() => navigate('/schedule')}
            style={{
              marginBottom: '1rem',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ← Back to Schedule
          </button>
          Service not found.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 1rem 2rem' }}>
        <button
          onClick={() => navigate('/schedule')}
          style={{
            marginBottom: '1.5rem',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ← Back to Schedule
        </button>
        <h1>{service.title}</h1>
      {service.description && (
        <>
          <style>{`
            .service-description h1 {
              font-size: 2rem;
              font-weight: 700;
              margin: 1.5rem 0 1rem;
              color: #111827;
            }
            .service-description h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 1.25rem 0 0.75rem;
              color: #111827;
            }
            .service-description h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 1rem 0 0.5rem;
              color: #1f2937;
            }
            .service-description p {
              margin: 0.75rem 0;
              line-height: 1.7;
              color: #374151;
            }
            .service-description ul,
            .service-description ol {
              margin: 0.75rem 0;
              padding-left: 1.5rem;
              color: #374151;
            }
            .service-description li {
              margin: 0.5rem 0;
              line-height: 1.6;
            }
            .service-description a {
              color: #063591;
              text-decoration: underline;
              transition: color 0.2s;
            }
            .service-description a:hover {
              color: #0b5bff;
            }
            .service-description strong {
              font-weight: 600;
              color: #111827;
            }
            .service-description em {
              font-style: italic;
            }
          `}</style>
          <div
            className="service-description"
            style={{
              color: '#374151',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(service.description),
            }}
          />
        </>
      )}
      <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '2rem' }}>
        ${service.hourly_rate.toFixed(2)}/hr
      </p>

      <h3 style={{ marginTop: '2rem' }}>Available time slots</h3>
      {availability.length === 0 ? (
        <p>No available slots right now. Please check back later.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
          {availability.map((slot, idx) => (
            <li
              key={idx}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>
                {slot.start_utc} → {slot.end_utc}
              </span>
              <button onClick={() => handlePickSlot(slot)}>Schedule this slot</button>
            </li>
          ))}
        </ul>
      )}

      {/* note field (optional) */}
      <div style={{ marginTop: '1rem' }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          Note for this booking (optional):
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="anything your team should know"
          style={{
            width: '100%',
            minHeight: 80,
            padding: '0.75rem 1rem',
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: 8,
            fontSize: '1rem',
            color: '#111827',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            resize: 'vertical',
            fontFamily: 'inherit',
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
      </div>

      {loginRequiredMsg && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef9c3' }}>
          {loginRequiredMsg}
        </div>
      )}

      {intentError && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2' }}>
          {intentError}
        </div>
      )}

      {bookingIntent && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#ecfdf3' }}>
          <div>
            Booking intent created for {bookingIntent.start_utc} → {bookingIntent.end_utc}
          </div>
          <div>
            Total: ${(bookingIntent.total_cents / 100).toFixed(2)} {bookingIntent.currency}
            {bookingIntent.hours_billed
              ? ` (billed ${bookingIntent.hours_billed.toFixed(2)} hrs)`
              : null}
          </div>
          <button style={{ marginTop: '0.75rem' }} onClick={handlePaypalCheckout}>
            Proceed to Payment
          </button>
          {paypalError && (
            <div style={{ marginTop: '0.5rem', background: '#fee2e2', padding: '0.5rem' }}>
              {paypalError}
            </div>
          )}
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}
