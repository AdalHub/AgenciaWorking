import { useEffect, useState } from 'react';
import { Wrapper, Nav, MenuItem, Logo } from './styles';
import logo from '../../assets/header_logo.jpg';

const navLinks = [
  { label: 'Home',     to: '/' },
  { label: 'Contact',  to: '/contact' },
  { label: 'Careers',  to: '/careers' },
  { label: 'About Us', to: '/about-us' },
  { label: 'More',     to: '/more' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <Wrapper scrolled={scrolled}>
      <Logo src={logo} alt="Working Agencia" />

      <Nav>
        {navLinks.map(({ label, to }) => (
          <MenuItem key={label} to={to} scrolled={scrolled}>
            {label}
          </MenuItem>
        ))}
      </Nav>
    </Wrapper>
  );
}
