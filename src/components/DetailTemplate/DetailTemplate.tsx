import { useParams, Navigate, Link } from 'react-router-dom';
import services from '../ServicesGrid/data';
import Header from '../header/header';
import Footer from '../Footer/Footer';
import {
  Hero,
  Wrapper,
  Kicker,
  MainTitle,
  SubTitle,
  ButtonsRow,
  Btn,
  BodyP,
} from './DetailTemplateStyles';

export default function DetailTemplate() {
  const { slug } = useParams<{ slug?: string }>();

  // if no slug (i.e., /about-us route), default to 'about-us'
  const service = services.find((s) => s.slug === (slug ?? 'about-us'));
  if (!service) return <Navigate to="/" replace />;

  // pick two other services for the buttons (exclude current item)
  const showButtons = slug === undefined;              /* ← only on about-us */
  const alternatives = showButtons
    ? services
        .filter((s) => s.slug !== service.slug && s.slug !== 'about-us')
        .slice(0, 2)
    : [];

  return (
    <>
      <Header />

      <Hero $img={service.img}>
        <Kicker>{service.kicker}</Kicker>
        <MainTitle>{service.title}</MainTitle>
        <SubTitle>{service.subtitle}</SubTitle>

        {showButtons && (
          <ButtonsRow>
            {alternatives.map((alt) => (
              <Btn as={Link} key={alt.slug} to={`/services/${alt.slug}`}>
                {alt.title}
              </Btn>
            ))}
          </ButtonsRow>
        )}
      </Hero>

      <Wrapper>
        <img src={service.img} alt={service.title} />
        {service.body.map((p) => (
          <BodyP key={p}>{p}</BodyP>
        ))}
      </Wrapper>

      <Footer />
    </>
  );
}
