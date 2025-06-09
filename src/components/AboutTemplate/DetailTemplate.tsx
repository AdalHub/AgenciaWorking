import { useParams, Navigate, Link } from 'react-router-dom';
import services from '../ServicesGrid/data';
import Header from '../header/header';
import Footer from '../Footer/Footer';
import placeholderImg from '../../assets/bg.jpg';

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
  const key = slug ?? 'about-us';
  const service = services.find((s) => s.slug === key);

  if (!service) return <Navigate to="/" replace />;

  /* show buttons only on pages without a slug (about-us) */
  const showButtons = slug === undefined;

  const alternatives = showButtons
    ? services
        .filter((s) => s.slug !== service.slug && s.slug !== 'about-us')
        .slice(0, 2)
    : [];

  /* pick detailImg when provided, else fallback placeholder */
  // @ts-ignore – detailImg may or may not exist
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  const heroImg: string = (service as any).detailImg ?? placeholderImg;

  return (
    <>
      <Header />

      <Hero>
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
        <img src={heroImg} alt={service.title} />
        {service.body.map((p) => (
          <BodyP key={p}>{p}</BodyP>
        ))}
      </Wrapper>

      <Footer />
    </>
  );
}
