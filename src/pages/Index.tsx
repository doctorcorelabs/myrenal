import MedicalNewsSection from '../components/MedicalNewsSection';
import { TechnologyStackSection } from '../components/TechnologyStackSection';
import HeroSection from '../components/HeroSection';
import Layout from '../components/Layout';
import NucleusSection from '../components/NucleusSection';
import WebsiteProjectSection from '../components/WebsiteProjectSection'; // Import new component
import MedicalToolsPreviewSection from '../components/MedicalToolsPreviewSection'; // Import new component
// Removed duplicate imports below


const Index = () => {
  return (
    <Layout>
      {/* Arranged sections in the requested order */}
      <HeroSection />
      <NucleusSection />
      <WebsiteProjectSection />
      <MedicalToolsPreviewSection />
      <MedicalNewsSection />
      <TechnologyStackSection />
    </Layout>
  );
};

export default Index;
