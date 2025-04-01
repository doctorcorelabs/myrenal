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
        <CardTitle>Wells' Score Calculator for DVT</CardTitle>
        <CardDescription className="text-justify">For Deep Vein Thrombosis Probability Assessment</CardDescription>
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
                {key === 'activeCancer' && 'Active cancer (treatment within 6 months, or palliative) (+1 pt)'}
                {key === 'paralysisParesisImmobilization' && 'Paralysis, paresis, or recent plaster immobilization of lower extremity (+1 pt)'}
                {key === 'bedriddenRecently' && 'Recently bedridden >3 days or major surgery within 12 weeks requiring general/regional anesthesia (+1 pt)'}
                {key === 'localizedTenderness' && 'Localized tenderness along the distribution of the deep venous system (+1 pt)'}
                {key === 'entireLegSwollen' && 'Entire leg swollen (+1 pt)'}
                {key === 'calfSwellingDifference' && 'Calf swelling >3 cm compared to asymptomatic leg (measured 10 cm below tibial tuberosity) (+1 pt)'}
                {key === 'pittingEdema' && 'Pitting edema (confined to symptomatic leg) (+1 pt)'}
                {key === 'collateralSuperficialVeins' && 'Collateral superficial veins (non-varicose) (+1 pt)'}
                {key === 'previousDvt' && 'Previously documented DVT (+1 pt)'}
                {key === 'alternativeDiagnosisLikely' && 'Alternative diagnosis at least as likely as DVT (-2 pts)'}
              </Label>
            </div>
          ))}
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Calculated Score: {score}</AlertTitle>
          <AlertDescription className="text-justify">
            {interpretation}
          </AlertDescription>
        </Alert>
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Disclaimer</AlertTitle>
           <AlertDescription className="text-justify">
             This tool is for educational purposes only and does not replace clinical judgment or diagnostic testing (e.g., D-dimer, ultrasound). Consult current guidelines.
           </AlertDescription>
         </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={resetCalculator} variant="outline" className="w-full">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WellsScoreDvt;
