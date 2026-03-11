// LoginGatewayModal — Choice panel: For Customers, For Companies, Ingresar a mi Estudio
interface Props {
  onClose: () => void;
  onForCustomers: () => void;
  onForCompanies: () => void;
  onIngresarEstudio: () => void;
}

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
  </svg>
);

export default function LoginGatewayModal({ onClose, onForCustomers, onForCompanies, onIngresarEstudio }: Props) {
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
        animation: 'awFadeIn 180ms ease-out both',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 'min(360px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          animation: 'awModalIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Acceder</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={onForCustomers}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: '#f1f5f9',
              color: '#0f172a',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            For Customers
          </button>

          <button
            type="button"
            onClick={onForCompanies}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: '#f1f5f9',
              color: '#0f172a',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            For Companies
          </button>

          <button
            type="button"
            onClick={onIngresarEstudio}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
          >
            <BookIcon />
            Ingresar a mi Estudio
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes awFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes awModalIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; }
          }
        `}
      </style>
    </div>
  );
}
