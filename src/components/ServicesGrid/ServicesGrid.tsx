import { Section } from '../container/styles';
import { Grid, Card } from './styles';
import services from './data';

export default function ServicesGrid() {
  return (
    <Section style={{ background: '#F7FBFF' }}>
      <h2 style={{ textAlign: 'center' }}>Services</h2>

      <Grid>
        {services.map((s) => (
          <Card key={s.title} img={s.img}>
            <h3>{s.title}</h3>
            <p>{s.blurb}</p>
            <a href={`/services/${s.slug}`}>Read&nbsp;More</a>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
