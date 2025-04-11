import MedicalNewsSection from '../components/MedicalNewsSection';
import { TechnologyStackSection } from '../components/TechnologyStackSection';
import HeroSection from '../components/HeroSection';
import Layout from '../components/Layout';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <MedicalNewsSection />
      <TechnologyStackSection />
    </Layout>
  );
};

export default Index;
