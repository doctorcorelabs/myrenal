import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FENaCalculator = () => {
  const [urineSodium, setUrineSodium] = useState('');
  const [serumSodium, setSerumSodium] = useState('');
  const [urineCreatinine, setUrineCreatinine] = useState('');
  const [serumCreatinine, setSerumCreatinine] = useState('');
  const [fena, setFENa] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretationColor, setInterpretationColor] = useState<string | null>(null);
  const [interpretationIcon, setInterpretationIcon] = useState<React.ReactNode | null>(null);

  const calculateFENa = () => {
    const uNa = parseFloat(urineSodium);
    const sNa = parseFloat(serumSodium);
    const uCr = parseFloat(urineCreatinine);
    const sCr = parseFloat(serumCreatinine);

    if (isNaN(uNa) || isNaN(sNa) || isNaN(uCr) || isNaN(sCr) || uNa < 0 || sNa <= 0 || uCr <= 0 || sCr <= 0) {
      setFENa(null);
      setInterpretation(null);
      setInterpretationColor(null);
      setInterpretationIcon(null);
      alert('Mohon masukkan nilai yang valid untuk semua input.');
      return;
    }

    const fenaValue = (uNa * sCr * 100) / (sNa * uCr);
    setFENa(fenaValue);
    determineInterpretation(fenaValue);
  };

  const determineInterpretation = (fenaValue: number) => {
    if (fenaValue < 1) {
      setInterpretation('AKI Pre-renal');
      setInterpretationColor('bg-green-500');
      setInterpretationIcon(<CheckCircle className="h-6 w-6" />);
    } else if (fenaValue > 2) {
      setInterpretation('AKI Intrinsik (ATN)');
      setInterpretationColor('bg-red-500');
      setInterpretationIcon(<XCircle className="h-6 w-6" />);
    } else {
      setInterpretation('Area abu-abu, pertimbangkan faktor lain');
      setInterpretationColor('bg-yellow-500');
      setInterpretationIcon(<AlertCircle className="h-6 w-6" />);
    }
  };

  return (
    <>
      <PageHeader
        title="Kalkulator Fractional Excretion of Sodium (FENa)"
        subtitle="Bantu bedakan penyebab Acute Kidney Injury (AKI) (pre-renal vs. intrinsic)."
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Data Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="urineSodium">Natrium Urin (mEq/L)</Label>
                <Input
                  id="urineSodium"
                  type="number"
                  value={urineSodium}
                  onChange={(e) => setUrineSodium(e.target.value)}
                  placeholder="e.g., 20"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="serumSodium">Natrium Serum (mEq/L)</Label>
                <Input
                  id="serumSodium"
                  type="number"
                  value={serumSodium}
                  onChange={(e) => setSerumSodium(e.target.value)}
                  placeholder="e.g., 140"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="urineCreatinine">Kreatinin Urin (mg/dL)</Label>
                <Input
                  id="urineCreatinine"
                  type="number"
                  value={urineCreatinine}
                  onChange={(e) => setUrineCreatinine(e.target.value)}
                  placeholder="e.g., 100"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="serumCreatinine">Kreatinin Serum (mg/dL)</Label>
                <Input
                  id="serumCreatinine"
                  type="number"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(e.target.value)}
                  placeholder="e.g., 1.0"
                  step="0.1"
                />
              </div>
            </div>
            <Button onClick={calculateFENa} className="w-full">Hitung FENa</Button>
          </CardContent>
        </Card>

        {fena !== null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hasil FENa</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-primary mb-4">{fena.toFixed(2)} %</p>
              <div className={`p-4 rounded-lg ${interpretationColor} text-white flex items-center justify-center space-x-4`}>
                {interpretationIcon}
                <div>
                  <h3 className="text-xl font-semibold mb-2">{interpretation}</h3>
                  {interpretation === 'AKI Pre-renal' && (
                    <p>FENa < 1%: Menunjukkan hipoperfusi ginjal (misalnya, dehidrasi, gagal jantung). Ginjal berusaha mempertahankan natrium.</p>
                  )}
                  {interpretation === 'AKI Intrinsik (ATN)' && (
                    <p>FENa > 2%: Menunjukkan kerusakan tubulus ginjal (misalnya, nekrosis tubulus akut). Ginjal tidak dapat mempertahankan natrium.</p>
                  )}
                  {interpretation === 'Area abu-abu, pertimbangkan faktor lain' && (
                    <p>FENa 1-2%: Interpretasi tidak jelas. Pertimbangkan penyebab lain AKI atau kondisi klinis pasien.</p>
                  )}
                </div>
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

export default FENaCalculator;
