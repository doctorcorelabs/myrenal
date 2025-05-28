import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface WellsPeState {
  clinicalSignsDvt: boolean;
  peMostLikelyDiagnosis: boolean;
  heartRateGreaterThan100: boolean;
  immobilizationOrSurgery: boolean;
  previousPeOrDvt: boolean;
  hemoptysis: boolean;
  malignancy: boolean;
}

const WellsScorePe: React.FC = () => {
  const [criteria, setCriteria] = useState<WellsPeState>({
    clinicalSignsDvt: false,
    peMostLikelyDiagnosis: false,
    heartRateGreaterThan100: false,
    immobilizationOrSurgery: false,
    previousPeOrDvt: false,
    hemoptysis: false,
    malignancy: false,
  });

  const handleCheckboxChange = (id: keyof WellsPeState) => {
    setCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const score = useMemo(() => {
    let calculatedScore = 0;
    if (criteria.clinicalSignsDvt) calculatedScore += 3;
    if (criteria.peMostLikelyDiagnosis) calculatedScore += 3;
    if (criteria.heartRateGreaterThan100) calculatedScore += 1.5;
    if (criteria.immobilizationOrSurgery) calculatedScore += 1.5;
    if (criteria.previousPeOrDvt) calculatedScore += 1.5;
    if (criteria.hemoptysis) calculatedScore += 1;
    if (criteria.malignancy) calculatedScore += 1;

    return calculatedScore;
  }, [criteria]);

  const interpretation = useMemo(() => {
    // Interpretation based on original Wells criteria for PE
    // Can also use simplified 2-level stratification (PE Likely > 4, PE Unlikely <= 4)
    if (score > 6) return `Score ${score}: High Probability of PE`;
    if (score >= 2 && score <= 6) return `Score ${score}: Moderate Probability of PE`;
    if (score < 2) return `Score ${score}: Low Probability of PE`;
    return "Score calculation pending"; // Fallback
  }, [score]);

   const simplifiedInterpretation = useMemo(() => {
    if (score > 4) return `Score ${score}: PE Likely`;
    if (score <= 4) return `Score ${score}: PE Unlikely`;
    return "Score calculation pending";
  }, [score]);


  const resetCalculator = () => {
    setCriteria({
      clinicalSignsDvt: false,
      peMostLikelyDiagnosis: false,
      heartRateGreaterThan100: false,
      immobilizationOrSurgery: false,
      previousPeOrDvt: false,
      hemoptysis: false,
      malignancy: false,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-6"> {/* Added margin top */}
      <CardHeader>
        <CardTitle>Kalkulator Skor Wells untuk PE</CardTitle>
        <CardDescription className="text-justify">Untuk Penilaian Probabilitas Emboli Paru</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(Object.keys(criteria) as Array<keyof WellsPeState>).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={criteria[key]}
                onCheckedChange={() => handleCheckboxChange(key)}
              />
              <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-justify">
                {key === 'clinicalSignsDvt' && 'Tanda dan gejala klinis DVT (minimal pembengkakan kaki dan nyeri saat palpasi vena dalam) (+3 pt)'}
                {key === 'peMostLikelyDiagnosis' && 'PE adalah diagnosis #1 ATAU sama mungkinnya (+3 pt)'}
                {key === 'heartRateGreaterThan100' && 'Denyut jantung > 100 bpm (+1.5 pt)'}
                {key === 'immobilizationOrSurgery' && 'Imobilisasi minimal 3 hari ATAU operasi dalam 4 minggu sebelumnya (+1.5 pt)'}
                {key === 'previousPeOrDvt' && 'Riwayat PE atau DVT yang didiagnosis secara objektif sebelumnya (+1.5 pt)'}
                {key === 'hemoptysis' && 'Hemoptisis (+1 pt)'}
                {key === 'malignancy' && 'Keganasan dengan pengobatan dalam 6 bulan atau paliatif (+1 pt)'}
              </Label>
            </div>
          ))}
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Skor Terhitung: {score}</AlertTitle>
          <AlertDescription className="text-justify">
            Tradisional: {interpretation} <br />
            Sederhana (2-Level): {simplifiedInterpretation}
          </AlertDescription>
        </Alert>
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Penyangkalan</AlertTitle>
           <AlertDescription className="text-justify">
             Alat ini membantu dalam stratifikasi risiko tetapi tidak menggantikan penilaian klinis atau tes diagnostik (misalnya, D-dimer, CTPA). Konsultasikan panduan terkini.
           </AlertDescription>
         </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={resetCalculator} variant="outline" className="w-full">
          Atur Ulang
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WellsScorePe;
