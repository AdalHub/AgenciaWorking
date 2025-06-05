import { Wrapper, Note, ContactCard } from './styles';

export default function Footer() {
  return (
    <Wrapper>
      {/* floating card */}
      <ContactCard>
        <h3>Contact&nbsp;Us</h3>
        <p>
          +1&nbsp;(512)&nbsp;555-0123<br />
          info@agenciaworking.com
        </p>
      </ContactCard>

      {/* legal note */}
      <Note>
        Permission from the Secretary of Labor and Social Welfare&nbsp;STPS:&nbsp;
        2023-A-01234-ABC1
      </Note>
    </Wrapper>
  );
}
