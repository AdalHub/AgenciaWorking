import { useParams, Navigate, Link } from 'react-router-dom';
import services from '../ServicesGrid/data';
import Header from '../header/header';
import Footer from '../Footer/Footer';
import placeholderImg from '../../assets/bg.jpg';
import careersImg from '../../assets/solutions1.jpg'; // any 16:9 photo
import { CareersBanner } from './DetailTemplateStyles';

import {
  Hero,
  Wrapper,
  Kicker,
  MainTitle,
  SubTitle,
  ButtonsRow,
  Btn,
  ContentBlock,
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
        {service.body.map((html, idx) => (
          <ContentBlock key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </Wrapper>
      <CareersBanner>
        <img className="photo" src={careersImg} alt="HR solutions" />

        <div className="content">
          <h5>Get a quote today</h5>
          <h2>Ready to start?</h2>
          <p>
            Simplify your HR strategy with custom solutions, tailor-made for your
            business—fast, compliant, and stress-free.
          </p>
          <Link to="/contact">Request quote</Link>
        </div>
      </CareersBanner>

      <Footer />
    </>
  );
}
