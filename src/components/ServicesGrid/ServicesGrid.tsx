// src/components/ServicesGrid/ServicesGrid.tsx
import { Section } from '../container/styles';
import { Grid, Card, Title } from './styles';
import { Link } from 'react-router-dom';
import services from './data';

export default function ServicesGrid() {
  // skip any item whose slug is "about-us"
  const serviceCards = services.filter((s) => s.slug !== 'about-us');

  return (
    <Section style={{ background: '#F7FBFF' }}>
      <Title>
        <h2 style={{ textAlign: 'center' }}>Services</h2>
      </Title>

      <Grid>
        {serviceCards.map((s) => (
          <Card key={s.slug} img={s.img}>
            <h3>{s.title}</h3>
            <p>{s.blurb}</p>
            <Link to={`/services/${s.slug}`}>Read&nbsp;More</Link>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
