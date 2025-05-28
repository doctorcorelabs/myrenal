import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CockcroftGaultCalculator = () => {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [creatinineClearance, setCreatinineClearance] = useState<number | null>(null);
  const [doseAdjustmentSuggestion, setDoseAdjustmentSuggestion] = useState<string | null>(null);

  const calculateCockcroftGault = () => {
    const cr = parseFloat(creatinine);
    const a = parseInt(age);
    const w = parseFloat(weight);

    if (isNaN(cr) || isNaN(a) || isNaN(w) || cr <= 0 || a <= 0 || w <= 0) {
      setCreatinineClearance(null);
      setDoseAdjustmentSuggestion(null);
      alert('Mohon masukkan nilai yang valid untuk Kreatinin, Usia, dan Berat Badan.');
      return;
    }

    let ccValue: number;
    // Cockcroft-Gault formula
    if (gender === 'male') {
      ccValue = ((140 - a) * w) / (cr * 72);
    } else {
      ccValue = (((140 - a) * w) / (cr * 72)) * 0.85;
    }

    setCreatinineClearance(ccValue);
    determineDoseAdjustment(ccValue);
  };

  const determineDoseAdjustment = (cc: number) => {
    if (cc >= 60) {
      setDoseAdjustmentSuggestion('Dosis normal');
    } else if (cc >= 30 && cc < 60) {
      setDoseAdjustmentSuggestion('Pertimbangkan penyesuaian dosis (misalnya, kurangi dosis atau perpanjang interval)');
    } else if (cc >= 15 && cc < 30) {
      setDoseAdjustmentSuggestion('Perlu penyesuaian dosis signifikan atau hindari obat tertentu');
    } else {
      setDoseAdjustmentSuggestion('Gagal ginjal. Penyesuaian dosis yang ketat atau hindari sebagian besar obat yang diekskresikan ginjal.');
    }
  };

  const getSuggestionColor = (suggestion: string | null) => {
    switch (suggestion) {
      case 'Dosis normal': return 'bg-green-500';
      case 'Pertimbangkan penyesuaian dosis (misalnya, kurangi dosis atau perpanjang interval)': return 'bg-yellow-500';
      case 'Perlu penyesuaian dosis signifikan atau hindari obat tertentu': return 'bg-orange-500';
      case 'Gagal ginjal. Penyesuaian dosis yang ketat atau hindari sebagian besar obat yang diekskresikan ginjal.': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <>
      <PageHeader
        title="Kalkulator Klirens Kreatinin (Cockcroft-Gault)"
        subtitle="Perkirakan klirens kreatinin untuk penyesuaian dosis obat pada pasien dengan gangguan ginjal."
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Data Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="creatinine">Kreatinin Serum (mg/dL)</Label>
                <Input
                  id="creatinine"
                  type="number"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  placeholder="e.g., 1.0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="age">Usia (tahun)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <Label htmlFor="weight">Berat Badan (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 70"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Pria</SelectItem>
                    <SelectItem value="female">Wanita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={calculateCockcroftGault} className="w-full">Hitung Klirens Kreatinin</Button>
          </CardContent>
        </Card>

        {creatinineClearance !== null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hasil Klirens Kreatinin</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-primary mb-4">{creatinineClearance.toFixed(2)} mL/min</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative overflow-hidden flex">
                {/* Simplified Dose Adjustment Indicator */}
                <div className="h-full bg-green-500" style={{ width: '33.3%' }}></div> {/* >=60 */}
                <div className="h-full bg-yellow-500" style={{ width: '33.3%' }}></div> {/* 30-59 */}
                <div className="h-full bg-orange-500" style={{ width: '33.4%' }}></div> {/* <30 */}
                <div
                  className="absolute h-full w-1 bg-black transform -translate-x-1/2"
                  style={{ left: `${Math.min(100, Math.max(0, (creatinineClearance / 120) * 100))}%` }} // Simple linear scale for position
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-700 mb-4">
                <span>0</span>
                <span>30</span>
                <span>60</span>
                <span>{'>'}60</span>
              </div>
              <div className={`p-4 rounded-lg ${getSuggestionColor(doseAdjustmentSuggestion)} text-white`}>
                <h3 className="text-xl font-semibold mb-2">Rekomendasi Penyesuaian Dosis:</h3>
                <p>{doseAdjustmentSuggestion}</p>
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

export default CockcroftGaultCalculator;
