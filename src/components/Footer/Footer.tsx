import { Wrapper, Note, ContactCard } from './styles';

export default function Footer() {
  return (
    <Wrapper>
      {/* floating contact card */}
      <ContactCard>
        <h3>Contact Us</h3>
        <p>
          +1 (512) 555-0123<br />
          info@agenciaworking.com
        </p>
      </ContactCard>

      {/* centred legal note */}
      <Note>
        Permission from the Secretary of Labor and Social Welfare STPS:
        2023-A-01234-ABC1
      </Note>
    </Wrapper>
  );
}
