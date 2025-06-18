import { useEffect, useRef, useState } from 'react';
import {
  Wrapper,
  Logo,
  Nav,
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

import logo from '../../assets/header_logo.jpg';
import logoInverse from '../../../public/header_logo_inverse.png';
import services from '../ServicesGrid/data';

/* top-level links */
const links = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '#' },
  { label: 'Contact', to: '/contact' },
  { label: 'Careers', to: '/careers' },
  { label: 'About Us', to: '/about-us' },
];

export default function Header() {
  /* scroll colour change (desktop & mobile) */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
        <Logo src={scrolled ? logoInverse : logo} alt="Working Agencia" />

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
                  to="#"            // 👈 satisfies LinkProps
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

            
          </Panel>

          {/* services sub-panel */}
          <Panel>
            <BackBtn onClick={() => setLevel(0)}>Services</BackBtn>
            {(['Communication', 'Life Style', 'Business'] as const).map(
              (cat) => (
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
              ),
            )}
          </Panel>
        </PanelWrap>
      </Overlay>
    </>
  );
}
