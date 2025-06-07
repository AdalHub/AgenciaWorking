import { useParams, Navigate } from 'react-router-dom';
import services from '../ServicesGrid/data';
import Header from '../header/header';
import Footer from '../Footer/Footer';
import {
  Hero,
  Wrapper,
  Title,
  SubTitle,
  Body,
} from './ServiceTemplateStyles';

export default function ServiceTemplate() {
  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);

  if (!service) return <Navigate to="/" replace />;

  return (
    <>
      <Header />

      <Hero $img={service.img}>
        <h1>{service.title}</h1>
      </Hero>

      <Wrapper>
        <Title>{service.title}</Title>
        <SubTitle>{service.subtitle}</SubTitle>

        {service.body.map((paragraph) => (
          <Body key={paragraph}>{paragraph}</Body>
        ))}
      </Wrapper>

      <Footer />
    </>
  );
}
