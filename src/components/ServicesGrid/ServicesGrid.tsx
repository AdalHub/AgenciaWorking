// src/components/ServicesGrid/ServicesGrid.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import services from './data';
import {
  SectionWrap,
  Kicker,
  BigTitle,
  FilterRow,
  Pill,
  Grid,
  Card,
  Icon,
  More,
} from './styles';

const categories = ['All', 'Communication', 'Life Style', 'Business'] as const;

export default function ServicesGrid() {
  const [active, setActive] = useState<(typeof categories)[number]>('All');

  const visible = active === 'All'
    ? services
    : services.filter((s) => s.category === active);

  return (
    <SectionWrap>
      <Kicker>Services</Kicker>
      <BigTitle>Elevate Every Experience, Simplify Your Everyday Needs.</BigTitle>

      <FilterRow>
        {categories.map((c) => (
          <Pill
            key={c}
            $active={active === c}
            onClick={() => setActive(c)}
          >
            {c}
          </Pill>
        ))}
      </FilterRow>

      <Grid>
        {visible.map((s) => (
          <Card key={s.slug}>
            <Icon src={s.thumb} alt="" />
            <h3>{s.title}</h3>
            <p>{s.blurb}</p>
            <More to={`/services/${s.slug}`}>More details</More>
          </Card>
        ))}
      </Grid>
    </SectionWrap>
  );
}
