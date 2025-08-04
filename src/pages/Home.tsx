import Header from '../components/header/header';
import Hero from '../components/hero/hero';
import SuccessStories from '../components/SuccessStories/SuccessStories';
import ServicesGrid from '../components/ServicesGrid/ServicesGrid';
import OurMission from '../components/OurMission/OurMission';
import Footer from '../components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main>
        <OurMission/>
        <ServicesGrid />
        <SuccessStories />

      </main>
      <Footer />
    </>
  );
}
