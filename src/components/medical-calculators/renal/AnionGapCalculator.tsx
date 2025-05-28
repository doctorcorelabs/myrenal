import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnionGapCalculator = () => {
  const [sodium, setSodium] = useState('');
  const [chloride, setChloride] = useState('');
  const [bicarbonate, setBicarbonate] = useState('');
  const [anionGap, setAnionGap] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretationColor, setInterpretationColor] = useState<string | null>(null);
  const [interpretationIcon, setInterpretationIcon] = useState<React.ReactNode | null>(null);

  const calculateAnionGap = () => {
    const na = parseFloat(sodium);
    const cl = parseFloat(chloride);
    const hco3 = parseFloat(bicarbonate);

    if (isNaN(na) || isNaN(cl) || isNaN(hco3) || na <= 0 || cl <= 0 || hco3 <= 0) {
      setAnionGap(null);
      setInterpretation(null);
      setInterpretationColor(null);
      setInterpretationIcon(null);
      alert('Mohon masukkan nilai yang valid untuk semua input.');
      return;
    }

    const agValue = na - (cl + hco3);
    setAnionGap(agValue);
    determineInterpretation(agValue);
  };

  const determineInterpretation = (agValue: number) => {
    if (agValue > 12) { // Normal range typically 8-12 mEq/L
      setInterpretation('High Anion Gap Metabolic Acidosis (HAGMA)');
      setInterpretationColor('bg-red-500');
      setInterpretationIcon(<XCircle className="h-6 w-6" />);
    } else if (agValue < 8) {
      setInterpretation('Low Anion Gap');
      setInterpretationColor('bg-blue-500');
      setInterpretationIcon(<AlertCircle className="h-6 w-6" />);
    } else {
      setInterpretation('Normal Anion Gap');
      setInterpretationColor('bg-green-500');
      setInterpretationIcon(<CheckCircle className="h-6 w-6" />);
    }
  };

  return (
    <>
      <PageHeader
        title="Kalkulator Anion Gap"
        subtitle="Bantu diagnosis gangguan asam-basa, khususnya asidosis metabolik."
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Data Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="sodium">Natrium Serum (mEq/L)</Label>
                <Input
                  id="sodium"
                  type="number"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  placeholder="e.g., 140"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="chloride">Klorida Serum (mEq/L)</Label>
                <Input
                  id="chloride"
                  type="number"
                  value={chloride}
                  onChange={(e) => setChloride(e.target.value)}
                  placeholder="e.g., 100"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="bicarbonate">Bikarbonat Serum (mEq/L)</Label>
                <Input
                  id="bicarbonate"
                  type="number"
                  value={bicarbonate}
                  onChange={(e) => setBicarbonate(e.target.value)}
                  placeholder="e.g., 24"
                  step="0.1"
                />
              </div>
            </div>
            <Button onClick={calculateAnionGap} className="w-full">Hitung Anion Gap</Button>
          </CardContent>
        </Card>

        {anionGap !== null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hasil Anion Gap</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-primary mb-4">{anionGap.toFixed(2)} mEq/L</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative overflow-hidden flex">
                {/* Bar Indicator Visualization */}
                <div className="h-full bg-blue-500" style={{ width: '20%' }}></div> {/* Low */}
                <div className="h-full bg-green-500" style={{ width: '30%' }}></div> {/* Normal */}
                <div className="h-full bg-red-500" style={{ width: '50%' }}></div> {/* High */}
                <div
                  className="absolute h-full w-1 bg-black transform -translate-x-1/2"
                  style={{ left: `${Math.min(100, Math.max(0, (anionGap / 20) * 100))}%` }} // Simple linear scale for position
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mb-4">
                <span>0</span>
                <span>8</span>
                <span>12</span>
                <span>{'>'} 12</span>
              </div>
              <div className={`p-4 rounded-lg ${interpretationColor} text-white flex items-center justify-center space-x-4`}>
                {interpretationIcon}
                <div>
                  <h3 className="text-xl font-semibold mb-2">{interpretation}</h3>
                  {interpretation === 'High Anion Gap Metabolic Acidosis (HAGMA)' && (
                    <>
                      <p>Anion Gap {'>'} 12 mEq/L: Menunjukkan adanya asam yang tidak terukur dalam darah.</p>
                      <p className="mt-2 font-semibold">Penyebab Umum (MUDPILES):</p>
                      <ul className="list-disc list-inside text-left mx-auto w-fit">
                        <li>Methanol</li>
                        <li>Uremia</li>
                        <li>Diabetic Ketoacidosis (DKA)</li>
                        <li>Paraldehyde</li>
                        <li>Iron, Isoniazid</li>
                        <li>Lactic Acidosis</li>
                        <li>Ethylene Glycol</li>
                        <li>Salicylates</li>
                      </ul>
                    </>
                  )}
                  {interpretation === 'Low Anion Gap' && (
                    <p>Anion Gap {'<'} 8 mEq/L: Jarang terjadi, bisa disebabkan oleh hipoalbuminemia atau kelebihan kation yang tidak terukur.</p>
                  )}
                  {interpretation === 'Normal Anion Gap' && (
                    <p>Anion Gap 8-12 mEq/L: Normal. Jika ada asidosis metabolik, kemungkinan adalah Normal Anion Gap Metabolic Acidosis (NAGMA).</p>
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

export default AnionGapCalculator;
