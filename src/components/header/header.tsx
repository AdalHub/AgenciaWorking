// src/components/header/header.tsx
import { useEffect, useRef, useState } from 'react';
import {
  Wrapper,
  Nav,
  MenuItem,
  Logo,
  MegaWrap,
  Columns,
  ColTitle,
  ServiceLink,
} from './styles';
import logo from '../../assets/header_logo.jpg';
import services from '../ServicesGrid/data';

/* ---------- NAV LINKS ---------- */
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '#' }, // trigger for mega-menu
  { label: 'Contact', to: '/contact' },
  { label: 'Careers', to: '/careers' },
  { label: 'About Us', to: '/about-us' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* change header colour on scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* group services by category once */
  const grouped = services.reduce<Record<string, typeof services>>(
    (acc, s) => {
      if (s.slug === 'about-us') return acc; // skip about us
      (acc[s.category] ??= []).push(s);
      return acc;
    },
    {},
  );

  /* helpers for enter/leave with small delay */
  const handleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleDelayedClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  /* clean up timeout on unmount */
  useEffect(() => () => clearTimeout(closeTimer.current!), []);

  return (
    <>
      <Wrapper scrolled={scrolled}>
        <Logo src={logo} alt="Working Agencia" />

        <Nav>
          {navLinks.map(({ label, to }) => (
            <MenuItem
              key={label}
              to={to}
              $scrolled={scrolled}
              onMouseEnter={label === 'Services' ? handleOpen : undefined}
              onMouseLeave={label === 'Services' ? handleDelayedClose : undefined}
            >
              {label}
            </MenuItem>
          ))}
        </Nav>
      </Wrapper>

      {/* ---------- MEGA-MENU ---------- */}
      <MegaWrap
        $open={open}
        onMouseEnter={handleOpen}
        onMouseLeave={handleDelayedClose}
      >
        <Columns>
          {(['Communication', 'Life Style', 'Business'] as const).map(
            (cat) => (
              <div key={cat}>
                <ColTitle>{cat}</ColTitle>
                {grouped[cat]?.map((s, idx, arr) => {
                  /* delay: top→bottom on open, bottom→top on close */

                  const openDelay  = idx * 200;
                  const closeDelay = (arr.length - 1 - idx) * 200;

                  return (
                    <ServiceLink
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      $open={open}
                      $delay={open ? openDelay : closeDelay}
                      onClick={() => setOpen(false)}
                    >
                      {s.title}
                    </ServiceLink>
                  );
                })}
              </div>
            ),
          )}
        </Columns>
      </MegaWrap>
    </>
  );
}
