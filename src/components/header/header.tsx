
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrapper, Nav, Logo, MenuItem } from './styles';
import logo from "../../assets/header_logo.jpg"

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Wrapper scrolled={scrolled}>
      <Logo src={logo} alt="Working Agencia" />
      <Nav>
        {['Home', 'Contact', 'Careers', 'About Us', 'More'].map((item) => (
          <MenuItem as={Link} key={item} to={`/${item.toLowerCase().replace(' ', '-')}`}>
            {item}
          </MenuItem>
        ))}
      </Nav>
    </Wrapper>
  );
}
