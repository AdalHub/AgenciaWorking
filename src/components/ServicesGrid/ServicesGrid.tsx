// src/components/ServicesGrid/ServicesGrid.tsx
import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
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

  const visible = useMemo(
    () =>
      active === 'All'
        ? services
        : services.filter((s) => s.category === active),
    [active]
  );

  return (
    <SectionWrap>
      <Kicker>Services</Kicker>
      <BigTitle>
        Elevate Every Experience, Simplify Your Everyday Needs.
      </BigTitle>

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
        <AnimatePresence mode="popLayout">
          {visible.map((s, idx) => (
            <Card
              key={s.slug}
              variants={{
                hidden: { opacity: 0, y: -14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: idx * 0.06,
                    duration: 0.4,
                    ease: 'easeOut',
                  },
                },
                exit: {
                  opacity: 0,
                  y: -14,
                  transition: { duration: 0.25, ease: 'easeIn' },
                },
              }}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
            >
              <Icon src={s.thumb} alt="" />
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <More to={`/services/${s.slug}`}>More details</More>
            </Card>
          ))}
        </AnimatePresence>
      </Grid>
    </SectionWrap>
  );
}
