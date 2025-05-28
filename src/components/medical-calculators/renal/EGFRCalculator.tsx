import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EGFRCalculator = () => {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [race, setRace] = useState('non-black'); // For CKD-EPI 2009
  const [formula, setFormula] = useState('CKD-EPI 2021'); // Default to 2021
  const [eGFR, setEGFR] = useState<number | null>(null);
  const [ckdStage, setCkdStage] = useState<string | null>(null);

  const calculateEGFR = () => {
    const cr = parseFloat(creatinine);
    const a = parseInt(age);

    if (isNaN(cr) || isNaN(a) || cr <= 0 || a <= 0) {
      setEGFR(null);
      setCkdStage(null);
      alert('Mohon masukkan nilai yang valid untuk Kreatinin dan Usia.');
      return;
    }

    let egfrValue: number;

    if (formula === 'CKD-EPI 2021') {
      // CKD-EPI 2021 formula (without race)
      const kappa = gender === 'female' ? 0.7 : 0.9;
      const alpha = gender === 'female' ? -0.241 : -0.302;
      const minCrOverKappa = Math.min(cr / kappa, 1);
      const maxCrOverKappa = Math.max(cr / kappa, 1);
      egfrValue = 142 * Math.pow(minCrOverKappa, alpha) * Math.pow(maxCrOverKappa, -1.200) * Math.pow(1.013, a);
      if (gender === 'female') {
        egfrValue *= 1.012; // Gender factor for females
      }
    } else {
      // CKD-EPI 2009 formula (with race)
      const kappa = gender === 'female' ? 0.7 : 0.9;
      const alpha = gender === 'female' ? -0.329 : -0.411;
      const minCrOverKappa = Math.min(cr / kappa, 1);
      const maxCrOverKappa = Math.max(cr / kappa, 1);
      egfrValue = 141 * Math.pow(minCrOverKappa, alpha) * Math.pow(maxCrOverKappa, -1.209) * Math.pow(0.993, a);
      if (gender === 'female') {
        egfrValue *= 1.018; // Gender factor for females
      }
      if (race === 'black') {
        egfrValue *= 1.159; // Race factor for black individuals
      }
    }

    setEGFR(egfrValue);
    determineCkdStage(egfrValue);
  };

  const determineCkdStage = (egfr: number) => {
    if (egfr >= 90) {
      setCkdStage('G1: Normal atau Tinggi');
    } else if (egfr >= 60) {
      setCkdStage('G2: Sedikit Menurun');
    } else if (egfr >= 45) {
      setCkdStage('G3a: Ringan-Sedang Menurun');
    } else if (egfr >= 30) {
      setCkdStage('G3b: Sedang-Berat Menurun');
    } else if (egfr >= 15) {
      setCkdStage('G4: Berat Menurun');
    } else {
      setCkdStage('G5: Gagal Ginjal');
    }
  };

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case 'G1: Normal atau Tinggi': return 'bg-green-500';
      case 'G2: Sedikit Menurun': return 'bg-blue-500';
      case 'G3a: Ringan-Sedang Menurun': return 'bg-yellow-500';
      case 'G3b: Sedang-Berat Menurun': return 'bg-orange-500';
      case 'G4: Berat Menurun': return 'bg-red-500';
      case 'G5: Gagal Ginjal': return 'bg-purple-700'; // Darker red/purple for G5
      default: return 'bg-gray-300';
    }
  };

  const getStageDescription = (stage: string | null) => {
    switch (stage) {
      case 'G1: Normal atau Tinggi': return 'Fungsi ginjal normal atau tinggi. Lanjutkan pemantauan rutin.';
      case 'G2: Sedikit Menurun': return 'Fungsi ginjal sedikit menurun. Perhatikan faktor risiko dan gaya hidup.';
      case 'G3a: Ringan-Sedang Menurun': return 'Penurunan fungsi ginjal ringan hingga sedang. Perlu pemantauan dan manajemen lebih lanjut.';
      case 'G3b: Sedang-Berat Menurun': return 'Penurunan fungsi ginjal sedang hingga berat. Konsultasi dengan nefrologis direkomendasikan.';
      case 'G4: Berat Menurun': return 'Penurunan fungsi ginjal berat. Persiapan untuk terapi pengganti ginjal mungkin diperlukan.';
      case 'G5: Gagal Ginjal': return 'Gagal ginjal. Terapi pengganti ginjal (dialisis atau transplantasi) diperlukan.';
      default: return 'Masukkan nilai untuk melihat interpretasi.';
    }
  };

  return (
    <>
      <PageHeader
        title="Kalkulator eGFR"
        subtitle="Perkirakan Laju Filtrasi Glomerulus untuk menilai fungsi ginjal dan stadium Penyakit Ginjal Kronis (PGK)."
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
              <div>
                <Label htmlFor="formula">Formula eGFR</Label>
                <Select value={formula} onValueChange={setFormula}>
                  <SelectTrigger id="formula">
                    <SelectValue placeholder="Pilih Formula" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CKD-EPI 2021">CKD-EPI 2021 (Tanpa Ras)</SelectItem>
                    <SelectItem value="CKD-EPI 2009">CKD-EPI 2009 (Dengan Ras)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formula === 'CKD-EPI 2009' && (
                <div>
                  <Label htmlFor="race">Ras</Label>
                  <Select value={race} onValueChange={setRace}>
                    <SelectTrigger id="race">
                      <SelectValue placeholder="Pilih Ras" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-black">Non-Black</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={calculateEGFR} className="w-full">Hitung eGFR</Button>
          </CardContent>
        </Card>

        {eGFR !== null && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hasil eGFR</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold text-primary mb-4">{eGFR.toFixed(2)} mL/min/1.73m²</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative overflow-hidden">
                {/* Gauge Meter Visualization - Simplified for now, can be replaced with actual chart */}
                <div
                  className={`h-full rounded-full absolute transition-all duration-500 ${getStageColor(ckdStage)}`}
                  style={{ width: `${Math.min(100, Math.max(0, eGFR / 120 * 100))}%` }} // Simple linear scale for width
                ></div>
                <div className="absolute inset-0 flex justify-between items-center px-2 text-xs text-gray-700">
                  <span>0</span>
                  <span>30</span>
                  <span>60</span>
                  <span>90</span>
                  <span>120+</span>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getStageColor(ckdStage)} text-white`}>
                <h3 className="text-xl font-semibold mb-2">{ckdStage}</h3>
                <p>{getStageDescription(ckdStage)}</p>
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

export default EGFRCalculator;
