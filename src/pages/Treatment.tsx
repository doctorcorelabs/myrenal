import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Book, FlaskConical, FileText, Salad, Network } from 'lucide-react'; // Import necessary icons

// Define a type for the treatment feature data
interface TreatmentFeatureData {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const treatmentFeaturesData: TreatmentFeatureData[] = [
  {
    id: 1,
    title: 'Referensi Obat',
    description: 'Cari informasi komprehensif tentang berbagai obat dan penggunaannya.',
    icon: Book,
    path: '/tools/drug-reference',
  },
  {
    id: 2,
    title: 'Pemeriksa Interaksi',
    description: 'Periksa potensi interaksi antar obat untuk memastikan keamanan pasien.',
    icon: FlaskConical,
    path: '/tools/interaction-checker',
  },
  {
    id: 3,
    title: 'Panduan Klinis',
    description: 'Akses panduan klinis terbaru untuk praktik medis berbasis bukti.',
    icon: FileText,
    path: '/tools/clinical-guidelines',
  },
  {
    id: 4,
    title: 'Database Nutrisi',
    description: 'Jelajahi database nutrisi untuk informasi diet dan gizi.',
    icon: Salad,
    path: '/tools/nutrition-database',
  },
  {
    id: 5,
    title: 'Pembuat Mind Map',
    description: 'Buat mind map untuk mengatur ide dan informasi medis secara visual.',
    icon: Network,
    path: '/tools/mind-map-maker',
  },
];

// --- TreatmentCard Component ---
interface TreatmentCardProps {
  feature: TreatmentFeatureData;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({ feature }) => {
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
// --- End TreatmentCard Component ---


const Treatment = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Manajemen dan Terapi</h1>
      <p className="text-lg text-gray-600 mb-8">Jelajahi berbagai fitur manajemen dan terapi.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {treatmentFeaturesData.map((feature) => (
          <TreatmentCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default Treatment;
