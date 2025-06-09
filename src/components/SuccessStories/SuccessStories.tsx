import { Section } from '../container/styles';
import {
  SliderWrap,
  Card,
  Avatar,
  Title,
  Sub,
  Quote,
  ArrowButton,
  Dots,
  Dot,
} from './styles';
import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

/* LOCAL IMAGES (use your own assets) */
import faceA from '../../assets/customer_pic.jpg';
import faceB from '../../assets/Hector.jpg'; // placeholder for 2nd slide

/* ─────────── testimonials data ─────────── */
const testimonials = [
  {
    img: faceA,
    name: 'Adrián Zapata',
    role: 'HR Lead, U.S. Conglomerate',
    quote:
      "As an HR Lead for a major conglomerate in the United States, I have had the opportunity to work closely with Working Agency over the past few years across a wide range of recruitment efforts in Mexico. From hiring skilled laborers to placing key leadership roles such as General Managers. Their team has consistently demonstrated exceptional professionalism, efficiency, and a deep understanding of the Mexican labor market. In addition to providing highly qualified candidates, the agency has offered valuable guidance on critical matters such as competitive salary benchmarks, Mexican labor laws, and best hiring practices. Their insight has been instrumental in the success of our operations in Mexico. I highly recommend Working Agency as a trusted and strategic partner for any company seeking relocating to Mexico.",
  },
  {
    img: faceB,
    name: 'Dr. Hector Gomez Macfarland',
    role: 'CEO, OHEL Technologies',
    quote:
      "Working Agency has transformed the way we manage recruitment and personnel administration. Thanks to their expertise, commitment, and personalized attention, we have successfully integrated key talent into our team and optimized our internal processes. Their ongoing support provides us with the confidence and peace of mind of having a reliable and highly professional partner.",
  },
];

/* ─────────── component ─────────── */
export default function SuccessStories() {
  const [index, setIndex] = useState(0);
  const direction = useRef(1); // 1 → next, -1 → prev

  const paginate = (dir: number) => {
    direction.current = dir;
    setIndex((p) => (p + dir + testimonials.length) % testimonials.length);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const t = testimonials[index];

  return (
    <Section style={{ background: 'transparent', paddingBottom: '6rem' }}>
      <SliderWrap>
        <ArrowButton dir="left" onClick={() => paginate(-1)}>
          ←
        </ArrowButton>

        <AnimatePresence mode="wait" custom={direction.current}>
          <Card
            key={index}
            custom={direction.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Avatar src={t.img} alt={t.name} />
            <Title>{t.name}</Title>
            <Sub>{t.role}</Sub>
            <Quote>“{t.quote}”</Quote>
          </Card>
        </AnimatePresence>

        <ArrowButton dir="right" onClick={() => paginate(1)}>
          →
        </ArrowButton>
      </SliderWrap>

      <Dots>
        {testimonials.map((_, i) => (
          <Dot
            key={i}
            active={i === index}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </Dots>
    </Section>
  );
}
