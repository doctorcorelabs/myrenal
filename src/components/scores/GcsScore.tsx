import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface GcsState {
  eyeOpening: number; // 1-4
  verbalResponse: number; // 1-5
  motorResponse: number; // 1-6
}

const GcsScore: React.FC = () => {
  const [criteria, setCriteria] = useState<GcsState>({
    eyeOpening: 0, // Use 0 to indicate not selected
    verbalResponse: 0,
    motorResponse: 0,
  });

  const handleRadioChange = (category: keyof GcsState, value: string) => {
    setCriteria((prev) => ({ ...prev, [category]: parseInt(value, 10) }));
  };

  const score = useMemo(() => {
    // GCS score is valid only if all components are selected
    if (criteria.eyeOpening > 0 && criteria.verbalResponse > 0 && criteria.motorResponse > 0) {
      return criteria.eyeOpening + criteria.verbalResponse + criteria.motorResponse;
    }
    return null; // Return null if not all parts are scored
  }, [criteria]);

  const interpretation = useMemo(() => {
    if (score === null) return "Select one option from each category (Eyes, Verbal, Motor) to calculate the score.";

    let severity = '';
    if (score >= 13) severity = 'Mild Brain Injury';
    else if (score >= 9) severity = 'Moderate Brain Injury';
    else severity = 'Severe Brain Injury'; // Score 3-8

    return `Total Score ${score}: ${severity}. (Components: E${criteria.eyeOpening} V${criteria.verbalResponse} M${criteria.motorResponse})`;
  }, [score, criteria]);

  const resetCalculator = () => {
    setCriteria({
      eyeOpening: 0,
      verbalResponse: 0,
      motorResponse: 0,
    });
  };

  const eyeOptions = [
    { value: 4, label: 'Spontaneous' },
    { value: 3, label: 'To sound' },
    { value: 2, label: 'To pressure' },
    { value: 1, label: 'None' },
  ];

  const verbalOptions = [
    { value: 5, label: 'Oriented' },
    { value: 4, label: 'Confused' },
    { value: 3, label: 'Words (inappropriate)' },
    { value: 2, label: 'Sounds (incomprehensible)' },
    { value: 1, label: 'None' },
  ];

  const motorOptions = [
    { value: 6, label: 'Obeys commands' },
    { value: 5, label: 'Localizes pain' },
    { value: 4, label: 'Withdraws to pain (normal flexion)' },
    { value: 3, label: 'Abnormal flexion to pain (decorticate)' },
    { value: 2, label: 'Extension to pain (decerebrate)' },
    { value: 1, label: 'None' },
  ];

  return (
    <Card className="w-full max-w-lg mx-auto mt-6">
      <CardHeader>
        <CardTitle>Glasgow Coma Scale (GCS) Calculator</CardTitle>
        <CardDescription className="text-justify">Assesses level of consciousness after head injury.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eye Opening Response */}
        <div>
          <Label className="font-semibold mb-2 block">Eye Opening Response (E)</Label>
          <RadioGroup
            value={criteria.eyeOpening.toString()}
            onValueChange={(value) => handleRadioChange('eyeOpening', value)}
            className="space-y-1"
          >
            {eyeOptions.map((opt) => (
              <div key={`eye-${opt.value}`} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value.toString()} id={`eye-${opt.value}`} />
                <Label htmlFor={`eye-${opt.value}`}>{opt.label} ({opt.value} pts)</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Verbal Response */}
        <div>
          <Label className="font-semibold mb-2 block">Verbal Response (V)</Label>
          <RadioGroup
            value={criteria.verbalResponse.toString()}
            onValueChange={(value) => handleRadioChange('verbalResponse', value)}
            className="space-y-1"
          >
            {verbalOptions.map((opt) => (
              <div key={`verbal-${opt.value}`} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value.toString()} id={`verbal-${opt.value}`} />
                <Label htmlFor={`verbal-${opt.value}`}>{opt.label} ({opt.value} pts)</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Motor Response */}
        <div>
          <Label className="font-semibold mb-2 block">Motor Response (M)</Label>
          <RadioGroup
            value={criteria.motorResponse.toString()}
            onValueChange={(value) => handleRadioChange('motorResponse', value)}
            className="space-y-1"
          >
            {motorOptions.map((opt) => (
              <div key={`motor-${opt.value}`} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value.toString()} id={`motor-${opt.value}`} />
                <Label htmlFor={`motor-${opt.value}`}>{opt.label} ({opt.value} pts)</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Calculated Score: {score ?? 'N/A'}</AlertTitle>
          <AlertDescription className="text-justify">
            {interpretation}
          </AlertDescription>
        </Alert>
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>Disclaimer</AlertTitle>
           <AlertDescription className="text-justify">
             This tool is for educational purposes. GCS assessment requires clinical training. Consider factors like intubation (V score = VT) or sedation.
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

export default GcsScore;
