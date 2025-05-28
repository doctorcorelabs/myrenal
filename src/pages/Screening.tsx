import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Book, ClipboardList, Bot, Computer, Brain, Calculator } from 'lucide-react'; // Import necessary icons

// Define a type for the screening feature data
interface ScreeningFeatureData {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const screeningFeaturesData: ScreeningFeatureData[] = [
  {
    id: 1,
    title: 'Perpustakaan Penyakit',
    description: 'Cari informasi komprehensif tentang berbagai penyakit ginjal dan kondisi terkait.',
    icon: Book,
    path: '/tools/disease-library',
  },
  {
    id: 2,
    title: 'Pusat Penilaian Klinis',
    description: 'Akses alat penilaian klinis khusus untuk fungsi ginjal dan risiko penyakit ginjal.',
    icon: ClipboardList,
    path: '/tools/clinical-scoring-hub',
  },
  {
    id: 3,
    title: 'Jelajahi DeepSeek',
    description: 'Manfaatkan AI DeepSeek untuk analisis mendalam tentang data dan penelitian terkait ginjal.',
    icon: Bot,
    path: '/tools/explore-deepseek',
  },
  {
    id: 4,
    title: 'Jelajahi GEMINI',
    description: 'Gunakan AI GEMINI untuk mendapatkan wawasan dan dukungan dalam manajemen penyakit ginjal.',
    icon: Computer,
    path: '/tools/explore-gemini',
  },
  {
    id: 5,
    title: 'Chatbot AI',
    description: 'Dapatkan bantuan dan informasi cepat tentang kesehatan ginjal dan pertanyaan terkait.',
    icon: Brain,
    path: '/tools/ai-chatbot',
  },
  {
    id: 6,
    title: 'Kalkulator Medis',
    description: 'Gunakan berbagai kalkulator medis untuk membantu penilaian klinis dan perhitungan dosis obat.',
    icon: Calculator,
    path: '/tools/medical-calculator',
  },
];

// --- ScreeningCard Component ---
interface ScreeningCardProps {
  feature: ScreeningFeatureData;
}

const ScreeningCard: React.FC<ScreeningCardProps> = ({ feature }) => {
  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <feature.icon className="h-8 w-8 text-medical-teal" />
        </div>
        <CardTitle className="mt-2">{feature.title}</CardTitle>
        <CardDescription className="text-justify">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Optional: Add more content here if needed */}
      </CardContent>
      <CardFooter>
        <Link to={feature.path} className="w-full">
          <Button className="w-full bg-medical-teal hover:bg-medical-blue">
            Gunakan
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
// --- End ScreeningCard Component ---


const Screening = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Skrining dan Diagnosis</h1>
      <p className="text-lg text-gray-600 mb-8">Jelajahi berbagai fitur skrining dan diagnosis.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {screeningFeaturesData.map((feature) => (
          <ScreeningCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default Screening;
