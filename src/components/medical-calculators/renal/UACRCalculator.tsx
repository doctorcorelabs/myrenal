import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UACRCalculator = () => {
  const [urineAlbumin, setUrineAlbumin] = useState('');
  const [urineCreatinine, setUrineCreatinine] = useState('');
  const [creatinineUnit, setCreatinineUnit] = useState('mg/dL'); // mg/dL or mmol/L
  const [uacr, setUACR] = useState<number | null>(null);
  const [albuminuriaCategory, setAlbuminuriaCategory] = useState<string | null>(null);

  const calculateUACR = () => {
    const ua = parseFloat(urineAlbumin);
    let uc = parseFloat(urineCreatinine);

    if (isNaN(ua) || isNaN(uc) || ua < 0 || uc <= 0) {
      setUACR(null);
      setAlbuminuriaCategory(null);
      alert('Mohon masukkan nilai yang valid untuk Albumin Urin dan Kreatinin Urin.');
      return;
    }

    // Convert urine creatinine to mg/dL if it's in mmol/L
    if (creatinineUnit === 'mmol/L') {
      uc = uc * 11.3; // 1 mmol/L creatinine = 11.3 mg/dL
    }

    const uacrValue = (ua / uc) * 1000; // Convert to mg/g (if ua is mg/L and uc is mg/dL)

    setUACR(uacrValue);
    determineAlbuminuriaCategory(uacrValue);
  };

  const determineAlbuminuriaCategory = (uacrValue: number) => {
    if (uacrValue < 30) {
      setAlbuminuriaCategory('A1: Normal hingga sedikit meningkat');
    } else if (uacrValue >= 30 && uacrValue <= 300) {
      setAlbuminuriaCategory('A2: Sedang meningkat (Mikroalbuminuria)');
    } else {
      setAlbuminuriaCategory('A3: Sangat meningkat (Makroalbuminuria)');
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'A1: Normal hingga sedikit meningkat': return 'bg-green-500';
      case 'A2: Sedang meningkat (Mikroalbuminuria)': return 'bg-yellow-500';
      case 'A3: Sangat meningkat (Makroalbuminuria)': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getCategoryDescription = (category: string | null) => {
    switch (category) {
      case 'A1: Normal hingga sedikit meningkat': return '< 30 mg/g: Tidak ada atau sedikit albuminuria. Risiko PGK rendah.';
      case 'A2: Sedang meningkat (Mikroalbuminuria)': return '30-300 mg/g: Mikroalbuminuria, indikasi awal kerusakan ginjal. Perlu pemantauan.';
      case 'A3: Sangat meningkat (Makroalbuminuria)': return '> 300 mg/g: Makroalbuminuria, kerusakan ginjal yang signifikan. Perlu intervensi.';
      default: return 'Masukkan nilai untuk melihat interpretasi.';
    }
  };

  return (
    <>
      <PageHeader
        title="Kalkulator Rasio Albumin-Kreatinin Urin (UACR)"
        subtitle="Deteksi dan kategorikan albuminuria, tanda awal kerusakan ginjal."
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Data Urin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="urineAlbumin">Albumin Urin (mg/L)</Label>
                <Input
                  id="urineAlbumin"
                  type="number"
                  value={urineAlbumin}
                  onChange={(e) => setUrineAlbumin(e.target.value)}
                  placeholder="e.g., 20"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="urineCreatinine">Kreatinin Urin</Label>
                <div className="flex space-x-2">
                  <Input
                    id="urineCreatinine"
                    type="number"
                    value={urineCreatinine}
                    onChange={(e) => setUrineCreatinine(e.target.value)}
                    placeholder="e.g., 100"
                    step="0.1"
                  />
                  <Select value={creatinineUnit} onValueChange={setCreatinineUnit}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="mmol/L">mmol/L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={calculateUACR} className="w-full">Hitung UACR</Button>
          </CardContent>
        </Card>

        {uacr !== null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hasil UACR</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-primary mb-4">{uacr.toFixed(2)} mg/g</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative overflow-hidden flex">
                {/* Bar Indicator Visualization */}
                <div className="h-full bg-green-500" style={{ width: '10%' }}></div> {/* A1: <30 */}
                <div className="h-full bg-yellow-500" style={{ width: '30%' }}></div> {/* A2: 30-300 */}
                <div className="h-full bg-red-500" style={{ width: '60%' }}></div> {/* A3: >300 */}
                <div
                  className="absolute h-full w-1 bg-black transform -translate-x-1/2"
                  style={{ left: `${Math.min(100, Math.max(0, (uacr / 500) * 100))}%` }} // Simple linear scale for position
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mb-4">
                <span>0</span>
                <span>30</span>
                <span>300</span>
                <span>{'>'}300</span>
              </div>
              <div className={`p-4 rounded-lg ${getCategoryColor(albuminuriaCategory)} text-white`}>
                <h3 className="text-xl font-semibold mb-2">{albuminuriaCategory}</h3>
                <p>{getCategoryDescription(albuminuriaCategory)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button Section */}
        <div className="flex justify-center mt-8 mb-12">
          <Link to="/tools/medical-calculator">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Kalkulator Medis
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UACRCalculator;
