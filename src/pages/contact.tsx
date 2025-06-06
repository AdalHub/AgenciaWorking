import styled from 'styled-components';
import ContactMap from '../components/Contact/ContactMap';
import ContactBlock from '../components/Contact/ContactBlock';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';
/* page-level wrapper */
const Page = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;      /* ⬅️ centers every direct child */
  width: 100%;


   h1 {
     font-family: ${({ theme }) => theme.fonts.heading};
     font-size: clamp(2rem, 5vw, 2.75rem);
     margin: 0 0 2.5rem;
     color: ${({ theme }) => theme.colors.primary};
   }
`;


export default function ContactPage() {
  return (
    <Page>
      <h1>Contact&nbsp;Us</h1>
      <Header/>
      <ContactBlock />
      <ContactMap />
      <Footer/>
    </Page>
  );
}
