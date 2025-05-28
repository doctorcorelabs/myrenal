import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MedicalCalculator = () => {
  const renalCalculators = [
    {
      name: 'Kalkulator eGFR',
      description: 'Perkirakan Laju Filtrasi Glomerulus untuk menilai fungsi ginjal dan stadium PGK.',
      path: '/tools/medical-calculator/egfr',
    },
    {
      name: 'Kalkulator Rasio Albumin-Kreatinin Urin (UACR)',
      description: 'Deteksi dan kategorikan albuminuria, tanda awal kerusakan ginjal.',
      path: '/tools/medical-calculator/uacr',
    },
    {
      name: 'Kalkulator Klirens Kreatinin (Cockcroft-Gault)',
      description: 'Perkirakan klirens kreatinin untuk penyesuaian dosis obat.',
      path: '/tools/medical-calculator/cockcroft-gault',
    },
    {
      name: 'Kalkulator Fractional Excretion of Sodium (FENa)',
      description: 'Bantu bedakan penyebab Acute Kidney Injury (AKI).',
      path: '/tools/medical-calculator/fena',
    },
    {
      name: 'Kalkulator Anion Gap',
      description: 'Bantu diagnosis gangguan asam-basa, khususnya asidosis metabolik.',
      path: '/tools/medical-calculator/anion-gap',
    },
  ];

  return (
    <>
      <PageHeader
        title="Kalkulator Medis"
        subtitle="Gunakan berbagai kalkulator medis untuk membantu penilaian klinis dan perhitungan dosis obat."
      />
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Kalkulator Ginjal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renalCalculators.map((calculator) => (
            <Link to={calculator.path} key={calculator.name}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>{calculator.name}</CardTitle>
                  <CardDescription>{calculator.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Gunakan Kalkulator</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Back Button Section */}
      <div className="flex justify-center mt-8 mb-12">
        <Link to="/screening">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
      </div>
    </>
  );
};

export default MedicalCalculator;
