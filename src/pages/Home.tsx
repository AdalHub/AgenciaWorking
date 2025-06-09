import Header from '../components/header/header';
import Hero from '../components/hero/hero';
import SuccessStories from '../components/SuccessStories/SuccessStories';
import ServicesGrid from '../components/ServicesGrid/ServicesGrid';
import OurMission from '../components/OurMission/OurMission';
import NonDiscrimination from '../components/NonDiscrimination/NonDiscrimination';
import Footer from '../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main>
        <OurMission/>
        <SuccessStories />
        <ServicesGrid />
        <NonDiscrimination />
      </main>
      <Footer />
    </>
  );
}
