// src/components/header/header.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrapper,
  Logo,
  Nav,
  DesktopOnly,
  MenuItem,
  Burger,
  Overlay,
  PanelWrap,
  Panel,
  MobileLink,
  BackBtn,
  RightArrow,
  MegaWrap,
  Columns,
  ColTitle,
  ServiceLink,
} from './styles';

import logo from '../../assets/header_logo.png';
import logoInverse from '../../assets/header_logo_inverse.png';
import services from '../ServicesGrid/data';
import AuthModal from '../Public/AuthModal';
import StudyCodeModal from '../Public/StudyCodeModal';
import LoginGatewayModal from '../Public/LoginGatewayModal';

type PublicUser = {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  account_type?: string;
  is_profile_complete?: boolean;
} | null;

/* top-level links */
const links = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '#' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
  { label: 'Careers', to: '/career' }, // your file is pages/career.tsx
  { label: 'About Us', to: '/about-us' },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  /* scroll colour change (desktop & mobile) */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ————— user auth (public user) ————— */
  const [user, setUser] = useState<PublicUser>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authAccountContext, setAuthAccountContext] = useState<'default' | 'company'>('default');
  const [showStudyCodeModal, setShowStudyCodeModal] = useState(false);
  const [showLoginGateway, setShowLoginGateway] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isCompanyUser = !!user && user.account_type === 'company';

  const openLoginGateway = () => {
    setShowAuth(false);
    setShowStudyCodeModal(false);
    setShowUserMenu(false);
    setShowLoginGateway(true);
  };

  const openAuth = (context: 'default' | 'company') => {
    setShowLoginGateway(false);
    setShowStudyCodeModal(false);
    setShowUserMenu(false);
    setAuthAccountContext(context);
    setShowAuth(true);
  };

  const openStudyCode = () => {
    setShowLoginGateway(false);
    setShowAuth(false);
    setShowUserMenu(false);
    setShowStudyCodeModal(true);
  };

  const loadMe = async () => {
    try {
      const res = await fetch('/api/user_auth.php?action=me', {
        credentials: 'include',
      });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('header me failed', err);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await fetch('/api/user_auth.php?action=logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('logout failed', err);
    }
  };

  /* ————— DESKTOP MEGA ————— */
  const [megaOpen, setMegaOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMega = () => {
    if (timer.current) clearTimeout(timer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    timer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  /* ————— MOBILE OVERLAY ————— */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [level, setLevel] = useState<0 | 1>(0); // 0=root, 1=services

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  /* group services once */
  const grouped = services.reduce<Record<string, typeof services>>((acc, s) => {
    if (s.slug === 'about-us') return acc;
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  /* ————————————————— render ————————————————— */
  return (
    <>
      <Wrapper $scrolled={scrolled}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Logo
            src={scrolled ? logoInverse : logo}
            alt="Working Agencia"
            style={{ display: 'block' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: scrolled ? '#fff' : '#03479A', letterSpacing: '0.02em' }}>Working</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: scrolled ? '#fff' : '#0082C6', letterSpacing: '0.02em' }}>
              Agencia<span style={{ fontSize: '0.85em', fontWeight: 600, color: scrolled ? '#fff' : '#03479A', marginLeft: 2 }}>®</span>
            </span>
          </div>
        </div>

        {/* Right side container: Nav + Schedule + Auth controls grouped together */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}>
          {/* desktop nav */}
          <Nav>
            {links.map(({ label, to }) => (
              <MenuItem
                key={label}
                to={to}
                $scrolled={scrolled}
                $hassub={label === 'Services'}
                onMouseEnter={label === 'Services' ? openMega : undefined}
                onMouseLeave={label === 'Services' ? closeMega : undefined}
              >
                {label}
              </MenuItem>
            ))}
          </Nav>

          <DesktopOnly>
            {/* Schedule button */}
            <button
              onClick={() => navigate('/schedule')}
              style={{
                background: location.pathname.startsWith('/schedule')
                  ? '#1d4ed8'
                  : '#eff6ff',
                color: location.pathname.startsWith('/schedule') ? '#fff' : '#1d4ed8',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Schedule
            </button>

            {isCompanyUser && (
              <button
                onClick={() => navigate('/empresa/dashboard')}
                style={{
                  background: location.pathname.startsWith('/empresa/dashboard') ? '#1d4ed8' : '#eff6ff',
                  color: location.pathname.startsWith('/empresa/dashboard') ? '#fff' : '#1d4ed8',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Dashboard
              </button>
            )}

            {/* auth controls */}
            {user ? (
          <div
            ref={userMenuRef}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={scrolled ? '#fff' : '#1f2937'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '180px',
                    zIndex: 10000,
                    animation: 'fadeInDown 0.2s ease',
                  }}
              >
                <button
                  onClick={() => {
                    navigate(isCompanyUser ? '/empresa/dashboard' : '/account');
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#111827',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {isCompanyUser ? 'Dashboard' : 'Account'}
                </button>
                <button
                  onClick={() => {
                    navigate(isCompanyUser ? '/empresa/onboarding' : '/my-schedule');
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#111827',
                    borderTop: '1px solid #e5e7eb',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  {isCompanyUser ? 'Perfil de empresa' : 'My Schedule'}
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    borderTop: '1px solid #e5e7eb',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openLoginGateway}
            style={{
              display: isCompanyUser ? 'none' : undefined,
              background: 'transparent',
              color: scrolled ? '#fff' : '#0f172a',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Login / Signup
          </button>
        )}
          </DesktopOnly>
        </div>

        {/* hamburger */}
        <Burger
          aria-label="Toggle menu"
          $scrolled={scrolled}
          $open={mobileOpen}
          onClick={() => {
            setMobileOpen((p) => !p);
            setLevel(0);
          }}
        >
          <span />
        </Burger>
      </Wrapper>

      {/* desktop mega */}
      <MegaWrap
        $open={megaOpen}
        onMouseEnter={openMega}
        onMouseLeave={closeMega}
      >
        <Columns>
          {(['Communication', 'Life Style', 'Business'] as const).map((cat) => (
            <div key={cat}>
              <ColTitle>{cat}</ColTitle>
              {grouped[cat]?.map((s, i, arr) => {
                const openDelay = i * 170;
                const closeDelay = (arr.length - 1 - i) * 170;
                return (
                  <ServiceLink
                    key={s.slug}
                    to={`/services/${s.slug}`}
                    $open={megaOpen}
                    $delay={megaOpen ? openDelay : closeDelay}
                    onClick={() => setMegaOpen(false)}
                  >
                    {s.title}
                  </ServiceLink>
                );
              })}
            </div>
          ))}
        </Columns>
      </MegaWrap>

      {/* mobile overlay */}
      <Overlay $open={mobileOpen}>
        <PanelWrap $level={level}>
          {/* root panel */}
          <Panel>
            {links.map(({ label, to }) =>
              label === 'Services' ? (
                <MobileLink
                  as="button"
                  to="#"
                  key={label}
                  onClick={() => setLevel(1)}
                >
                  {label}
                  <RightArrow />
                </MobileLink>
              ) : (
                <MobileLink
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </MobileLink>
              ),
            )}

            {/* mobile: schedule */}
            <MobileLink
              to="/schedule"
              onClick={() => setMobileOpen(false)}
            >
              Schedule
            </MobileLink>

            {isCompanyUser && (
              <>
                <MobileLink
                  to="/empresa/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Dashboard
                </MobileLink>
                <MobileLink
                  to="/empresa/onboarding"
                  onClick={() => setMobileOpen(false)}
                >
                  Perfil de empresa
                </MobileLink>
              </>
            )}

            {/* mobile: auth */}
            {user ? (
              <>
                {!isCompanyUser && (
                  <>
                    <MobileLink
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      style={{ marginTop: '1rem' }}
                    >
                      Account
                    </MobileLink>
                    <MobileLink
                      to="/my-schedule"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Schedule
                    </MobileLink>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  style={{ marginTop: '1rem', color: '#ef4444' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  openLoginGateway();
                  setMobileOpen(false);
                }}
                style={{ marginTop: '1rem' }}
              >
                Login / Signup
              </button>
            )}
          </Panel>

          {/* services sub-panel */}
          <Panel>
            <BackBtn onClick={() => setLevel(0)}>Services</BackBtn>
            {(['Communication', 'Life Style', 'Business'] as const).map((cat) => (
              <div key={cat} style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', opacity: 0.7 }}>{cat}</h4>
                {grouped[cat]?.map((s) => (
                  <MobileLink
                    key={s.slug}
                    to={`/services/${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ fontSize: '1.3rem', fontWeight: 500 }}
                  >
                    {s.title}
                  </MobileLink>
                ))}
              </div>
            ))}
          </Panel>
        </PanelWrap>
      </Overlay>

      {showLoginGateway && (
        <LoginGatewayModal
          onClose={() => setShowLoginGateway(false)}
          onForCustomers={() => { setShowLoginGateway(false); openAuth('default'); }}
          onForCompanies={() => { setShowLoginGateway(false); openAuth('company'); }}
          onIngresarEstudio={() => { setShowLoginGateway(false); openStudyCode(); }}
        />
      )}

      {showAuth && (
        <AuthModal
          accountContext={authAccountContext}
          onClose={() => setShowAuth(false)}
          onAuthSuccess={(u) => {
            setUser(u);
            setShowAuth(false);
          }}
        />
      )}

      {showStudyCodeModal && (
        <StudyCodeModal onClose={() => setShowStudyCodeModal(false)} />
      )}

      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}
