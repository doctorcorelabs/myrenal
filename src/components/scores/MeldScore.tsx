import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // For dialysis status
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface MeldState {
  bilirubin: string; // mg/dL
  creatinine: string; // mg/dL
  inr: string;
  sodium: string; // mEq/L (for MELD-Na)
  dialysisTwiceInWeek: boolean;
}

const MeldScore: React.FC = () => {
  const [values, setValues] = useState<MeldState>({
    bilirubin: '',
    creatinine: '',
    inr: '',
    sodium: '', // Initialize sodium for MELD-Na
    dialysisTwiceInWeek: false,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: keyof MeldState) => {
    setValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { meldScore, meldNaScore } = useMemo(() => {
    const bili = parseFloat(values.bilirubin);
    let creat = parseFloat(values.creatinine);
    const inr = parseFloat(values.inr);
    const sodium = parseFloat(values.sodium); // For MELD-Na
    const dialysis = values.dialysisTwiceInWeek;

    if (isNaN(bili) || isNaN(creat) || isNaN(inr)) {
      return { meldScore: null, meldNaScore: null }; // Need all core values
    }

    // Apply MELD calculation rules
    const biliCalc = Math.max(bili, 1.0);
    let creatCalc = Math.max(creat, 1.0);
    const inrCalc = Math.max(inr, 1.0);

    // If patient had dialysis twice within the last 7 days, creatinine is set to 4.0
    // Also, if creatinine is already > 4.0, it's capped at 4.0
    if (dialysis || creat > 4.0) {
      creatCalc = 4.0;
    }

    // MELD Score Calculation (Original 3-variable)
    let score =
      0.957 * Math.log(creatCalc) +
      0.378 * Math.log(biliCalc) +
      1.120 * Math.log(inrCalc) +
      0.643; // Constant factor

    score = Math.round(score * 10); // Multiply by 10 and round

    // MELD-Na Score Calculation
    let scoreNa: number | null = null;
    if (!isNaN(sodium)) {
        scoreNa = score; // Start with MELD score
        if (score > 11) { // MELD-Na adjustments only apply if MELD > 11
            // Apply Sodium adjustments based on UNOS policy (Jan 2016)
            let sodiumCalc = Math.max(sodium, 125); // Lower bound
            sodiumCalc = Math.min(sodiumCalc, 137); // Upper bound

            scoreNa = score + 1.32 * (137 - sodiumCalc) - (0.033 * score * (137 - sodiumCalc));
        }
         scoreNa = Math.round(scoreNa); // Round final MELD-Na
    }


    // Final score cannot be less than 6 (if calculated < 6, reported as 6)
    // MELD score is capped at 40
    const finalMeldScore = Math.min(Math.max(score, 6), 40);
    const finalMeldNaScore = scoreNa !== null ? Math.min(Math.max(scoreNa, finalMeldScore), 40) : null; // MELD-Na also capped at 40, cannot be lower than MELD

    return { meldScore: finalMeldScore, meldNaScore: finalMeldNaScore };

  }, [values]);

  const interpretation = useMemo(() => {
    if (meldScore === null) return "Enter Bilirubin, Creatinine, and INR values.";

    // General interpretation of 3-month mortality risk (approximate)
    let risk = '';
    if (meldScore >= 40) risk = '~71.3% mortality';
    else if (meldScore >= 30) risk = '~52.6% mortality';
    else if (meldScore >= 20) risk = '~19.6% mortality';
    else if (meldScore >= 10) risk = '~6.0% mortality';
    else risk = '<1.9% mortality'; // Score 6-9

    let naInterpretation = '';
    if (meldNaScore !== null) {
        naInterpretation = ` MELD-Na Score: ${meldNaScore}.`;
    }


    return `MELD Score: ${meldScore} (${risk}).${naInterpretation} Used for liver transplant allocation and prognostication.`;
  }, [meldScore, meldNaScore]);

  const resetCalculator = () => {
    setValues({
      bilirubin: '',
      creatinine: '',
      inr: '',
      sodium: '',
      dialysisTwiceInWeek: false,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-6">
      <CardHeader>
        <CardTitle>Kalkulator Skor MELD / MELD-Na</CardTitle>
        <CardDescription className="text-justify">Model untuk Prognosis Penyakit Hati Stadium Akhir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bilirubin">Bilirubin (mg/dL)</Label>
            <Input
              id="bilirubin"
              type="number"
              step="0.1"
              value={values.bilirubin}
              onChange={handleInputChange}
              placeholder="misalnya, 1.2"
            />
          </div>
          <div>
            <Label htmlFor="creatinine">Kreatinin (mg/dL)</Label>
            <Input
              id="creatinine"
              type="number"
              step="0.1"
              value={values.creatinine}
              onChange={handleInputChange}
              placeholder="misalnya, 1.0"
            />
          </div>
          <div>
            <Label htmlFor="inr">INR</Label>
            <Input
              id="inr"
              type="number"
              step="0.1"
              value={values.inr}
              onChange={handleInputChange}
              placeholder="misalnya, 1.1"
            />
          </div>
           <div>
            <Label htmlFor="sodium">Natrium (mEq/L)</Label>
            <Input
              id="sodium"
              type="number"
              value={values.sodium}
              onChange={handleInputChange}
              placeholder="misalnya, 135 (untuk MELD-Na)"
            />
          </div>
        </div>
         <div className="flex items-center space-x-2">
            <Checkbox
              id="dialysisTwiceInWeek"
              checked={values.dialysisTwiceInWeek}
              onCheckedChange={() => handleCheckboxChange('dialysisTwiceInWeek')}
            />
            <Label htmlFor="dialysisTwiceInWeek" className="text-justify">Dialisis dua kali dalam 7 hari terakhir?</Label>
          </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Skor Terhitung</AlertTitle>
          <AlertDescription className="text-justify">
            {interpretation}
          </AlertDescription>
        </Alert>
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Penyangkalan</AlertTitle>
           <AlertDescription className="text-justify">
             Alat ini untuk tujuan pendidikan. Perhitungan skor MELD mengikuti aturan UNOS/OPTN tertentu. Konsultasikan panduan resmi untuk penggunaan klinis, terutama terkait alokasi transplantasi.
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

export default MeldScore;
