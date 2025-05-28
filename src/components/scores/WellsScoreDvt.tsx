import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface WellsDvtState {
  activeCancer: boolean;
  paralysisParesisImmobilization: boolean;
  bedriddenRecently: boolean;
  localizedTenderness: boolean;
  entireLegSwollen: boolean;
  calfSwellingDifference: boolean;
  pittingEdema: boolean;
  collateralSuperficialVeins: boolean;
  previousDvt: boolean;
  alternativeDiagnosisLikely: boolean; // This subtracts points
}

const WellsScoreDvt: React.FC = () => {
  const [criteria, setCriteria] = useState<WellsDvtState>({
    activeCancer: false,
    paralysisParesisImmobilization: false,
    bedriddenRecently: false,
    localizedTenderness: false,
    entireLegSwollen: false,
    calfSwellingDifference: false,
    pittingEdema: false,
    collateralSuperficialVeins: false,
    previousDvt: false,
    alternativeDiagnosisLikely: false,
  });

  const handleCheckboxChange = (id: keyof WellsDvtState) => {
    setCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const score = useMemo(() => {
    let calculatedScore = 0;
    if (criteria.activeCancer) calculatedScore += 1;
    if (criteria.paralysisParesisImmobilization) calculatedScore += 1;
    if (criteria.bedriddenRecently) calculatedScore += 1;
    if (criteria.localizedTenderness) calculatedScore += 1;
    if (criteria.entireLegSwollen) calculatedScore += 1;
    if (criteria.calfSwellingDifference) calculatedScore += 1;
    if (criteria.pittingEdema) calculatedScore += 1;
    if (criteria.collateralSuperficialVeins) calculatedScore += 1;
    if (criteria.previousDvt) calculatedScore += 1;
    if (criteria.alternativeDiagnosisLikely) calculatedScore -= 2; // Subtract 2 points

    return calculatedScore;
  }, [criteria]);

  const interpretation = useMemo(() => {
    // Interpretation based on original Wells criteria stratification
    if (score >= 3) return `Score ${score}: High Probability of DVT (~75%)`;
    if (score >= 1 && score <= 2) return `Score ${score}: Moderate Probability of DVT (~17%)`;
    if (score <= 0) return `Score ${score}: Low Probability of DVT (~3%)`;
    return "Score calculation pending"; // Fallback
  }, [score]);

  const resetCalculator = () => {
    setCriteria({
      activeCancer: false,
      paralysisParesisImmobilization: false,
      bedriddenRecently: false,
      localizedTenderness: false,
      entireLegSwollen: false,
      calfSwellingDifference: false,
      pittingEdema: false,
      collateralSuperficialVeins: false,
      previousDvt: false,
      alternativeDiagnosisLikely: false,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-6"> {/* Added margin top */}
      <CardHeader>
        <CardTitle>Kalkulator Skor Wells untuk DVT</CardTitle>
        <CardDescription className="text-justify">Untuk Penilaian Probabilitas Trombosis Vena Dalam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(Object.keys(criteria) as Array<keyof WellsDvtState>).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={criteria[key]}
                onCheckedChange={() => handleCheckboxChange(key)}
              />
              <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-justify">
                {key === 'activeCancer' && 'Kanker aktif (pengobatan dalam 6 bulan, atau paliatif) (+1 pt)'}
                {key === 'paralysisParesisImmobilization' && 'Paralisis, paresis, atau imobilisasi gips baru-baru ini pada ekstremitas bawah (+1 pt)'}
                {key === 'bedriddenRecently' && 'Baru-baru ini tirah baring >3 hari atau operasi besar dalam 12 minggu yang memerlukan anestesi umum/regional (+1 pt)'}
                {key === 'localizedTenderness' && 'Nyeri tekan terlokalisasi di sepanjang distribusi sistem vena dalam (+1 pt)'}
                {key === 'entireLegSwollen' && 'Seluruh kaki bengkak (+1 pt)'}
                {key === 'calfSwellingDifference' && 'Perbedaan pembengkakan betis >3 cm dibandingkan kaki asimtomatik (diukur 10 cm di bawah tuberositas tibia) (+1 pt)'}
                {key === 'pittingEdema' && 'Edema pitting (terbatas pada kaki yang bergejala) (+1 pt)'}
                {key === 'collateralSuperficialVeins' && 'Vena superfisial kolateral (non-varises) (+1 pt)'}
                {key === 'previousDvt' && 'Riwayat DVT yang didokumentasikan sebelumnya (+1 pt)'}
                {key === 'alternativeDiagnosisLikely' && 'Diagnosis alternatif setidaknya sama mungkinnya dengan DVT (-2 pt)'}
              </Label>
            </div>
          ))}
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Skor Terhitung: {score}</AlertTitle>
          <AlertDescription className="text-justify">
            {interpretation}
          </AlertDescription>
        </Alert>
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Penyangkalan</AlertTitle>
           <AlertDescription className="text-justify">
             Alat ini hanya untuk tujuan pendidikan dan tidak menggantikan penilaian klinis atau tes diagnostik (misalnya, D-dimer, USG). Konsultasikan panduan terkini.
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

export default WellsScoreDvt;
