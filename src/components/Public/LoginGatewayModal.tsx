import { useState } from 'react';

interface Props {
  onClose: () => void;
  onForCustomers: () => void;
  onForCompanies: () => void;
  onIngresarEstudio: () => void;
}

type GatewayCard = {
  id: 'customers' | 'companies' | 'code';
  title: string;
  subtitle: string;
  onClick: () => void;
  accent: string;
  accentSoft: string;
  text: string;
};

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1" />
    <circle cx="20" cy="20" r="1" />
    <path d="M1 1h4l2.7 12.4A2 2 0 0 0 9.66 15H19a2 2 0 0 0 1.95-1.57L23 6H6" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4v18" />
    <path d="M19 21V11l-6-4" />
    <path d="M9 9h1" />
    <path d="M9 13h1" />
    <path d="M9 17h1" />
    <path d="M14 13h1" />
    <path d="M14 17h1" />
  </svg>
);

const KeyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l1.5 1.5" />
    <path d="M18 5l1 1" />
  </svg>
);

function GatewayIcon({ id }: { id: GatewayCard['id'] }) {
  if (id === 'customers') return <CartIcon />;
  if (id === 'companies') return <BuildingIcon />;
  return <KeyIcon />;
}

export default function LoginGatewayModal({ onClose, onForCustomers, onForCompanies, onIngresarEstudio }: Props) {
  const [hoveredCard, setHoveredCard] = useState<GatewayCard['id'] | null>(null);

  const cards: GatewayCard[] = [
    {
      id: 'customers',
      title: 'Comprar un servicio',
      subtitle: 'Para personas o empresas que desean adquirir su estudio u otro servicio y pagar en línea con PayPal.',
      onClick: onForCustomers,
      accent: '#1d4ed8',
      accentSoft: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)',
      text: '#1e3a8a',
    },
    {
      id: 'companies',
      title: 'Portal para empresas',
      subtitle: 'Para clientes empresariales con convenio, pago por transferencia o crédito autorizado.',
      onClick: onForCompanies,
      accent: '#0f766e',
      accentSoft: 'linear-gradient(160deg, #ecfeff 0%, #ccfbf1 100%)',
      text: '#115e59',
    },
    {
      id: 'code',
      title: 'Ingresar con código',
      subtitle: 'Para candidatos o usuarios que recibieron un código para iniciar o continuar su proceso.',
      onClick: onIngresarEstudio,
      accent: '#15803d',
      accentSoft: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#166534',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.46)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
        animation: 'awFadeIn 180ms ease-out both',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 22,
          padding: 28,
          width: 'min(1040px, 96vw)',
          border: '1px solid rgba(148, 163, 184, 0.22)',
          boxShadow: '0 32px 90px rgba(15, 23, 42, 0.22)',
          animation: 'awModalIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: '#0f172a' }}>Selecciona tu acceso</h3>
            <p style={{ margin: '8px 0 0', fontSize: '0.98rem', color: '#64748b', lineHeight: 1.6 }}>
              Elige la opción que mejor corresponda a tu tipo de acceso dentro de Agencia Working.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#334155',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="aw-login-gateway-grid">
          {cards.map((card) => {
            const isHovered = hoveredCard === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={card.onClick}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard((current) => (current === card.id ? null : current))}
                onFocus={() => setHoveredCard(card.id)}
                onBlur={() => setHoveredCard((current) => (current === card.id ? null : current))}
                className={`aw-login-gateway-card${isHovered ? ' is-hovered' : ''}`}
                style={{
                  ['--aw-card-accent' as string]: card.accent,
                  ['--aw-card-soft' as string]: card.accentSoft,
                  ['--aw-card-text' as string]: card.text,
                }}
              >
                <span className="aw-login-gateway-icon">
                  <GatewayIcon id={card.id} />
                </span>
                <span className="aw-login-gateway-title">{card.title}</span>
                <span className="aw-login-gateway-subtitle" aria-hidden={!isHovered}>
                  {card.subtitle}
                </span>
                <span className="aw-login-gateway-cta">Continuar</span>
              </button>
            );
          })}
        </div>
      </div>

      <style>
        {`
          @keyframes awFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes awModalIn {
            from { opacity: 0; transform: translateY(10px) scale(0.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .aw-login-gateway-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .aw-login-gateway-card {
            position: relative;
            min-height: 236px;
            padding: 22px 20px 18px;
            border-radius: 20px;
            border: 1px solid rgba(148, 163, 184, 0.28);
            background: var(--aw-card-soft);
            color: #0f172a;
            text-align: left;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 14px;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
            overflow: hidden;
          }
          .aw-login-gateway-card::after {
            content: '';
            position: absolute;
            inset: auto 0 0 0;
            height: 4px;
            background: var(--aw-card-accent);
            opacity: 0.92;
          }
          .aw-login-gateway-card:hover,
          .aw-login-gateway-card:focus-visible,
          .aw-login-gateway-card.is-hovered {
            transform: translateY(-4px);
            box-shadow: 0 22px 44px rgba(15, 23, 42, 0.14);
            border-color: color-mix(in srgb, var(--aw-card-accent) 34%, #cbd5e1);
            outline: none;
          }
          .aw-login-gateway-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--aw-card-accent);
            background: rgba(255,255,255,0.72);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
          }
          .aw-login-gateway-title {
            font-size: 1.14rem;
            font-weight: 800;
            line-height: 1.35;
            color: var(--aw-card-text);
          }
          .aw-login-gateway-subtitle {
            font-size: 0.95rem;
            line-height: 1.65;
            color: #475569;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity 160ms ease, transform 160ms ease;
            min-height: 78px;
            pointer-events: none;
          }
          .aw-login-gateway-card:hover .aw-login-gateway-subtitle,
          .aw-login-gateway-card:focus-visible .aw-login-gateway-subtitle,
          .aw-login-gateway-card.is-hovered .aw-login-gateway-subtitle {
            opacity: 1;
            transform: translateY(0);
          }
          .aw-login-gateway-cta {
            margin-top: auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            align-self: flex-start;
            padding: 10px 14px;
            border-radius: 999px;
            background: rgba(255,255,255,0.82);
            color: var(--aw-card-text);
            font-size: 0.88rem;
            font-weight: 700;
            box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
          }
          @media (max-width: 960px) {
            .aw-login-gateway-grid {
              grid-template-columns: 1fr;
            }
            .aw-login-gateway-card {
              min-height: 184px;
            }
            .aw-login-gateway-subtitle {
              opacity: 1;
              transform: none;
              min-height: auto;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .aw-login-gateway-card,
            .aw-login-gateway-subtitle,
            * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
