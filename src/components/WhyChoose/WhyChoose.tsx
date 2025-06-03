// components/WhyChoose/WhyChoose.tsx
import { Section } from '../container/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Card from './Card';

const slides = [
  'Over 25 years of binational experience (Mexico–U.S.)',
  'Personalised and legally compliant approach (REPSE certified)',
  'Proven success in large-scale recruitment',
  'Comprehensive Human Resources solutions',
  'Commitment to ethics and non-discrimination',
];

export default function WhyChoose() {
  return (
    <Section style={{ background: 'var(--lavender)' }}>
      <Swiper spaceBetween={50} slidesPerView={1} pagination={{ clickable: true }}>
        {slides.map((text) => (
          <SwiperSlide key={text}><Card text={text} /></SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}
