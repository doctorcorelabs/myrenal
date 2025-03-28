import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// --- Helper Functions ---

// BMI Calculation
const calculateBMI = (weightKg: number, heightM: number): number | null => {
  if (heightM <= 0 || weightKg <= 0) return null;
  return weightKg / (heightM * heightM);
};

// BMI Interpretation
const interpretBMI = (bmi: number | null): { text: string; color: string } => {
  if (bmi === null) return { text: '', color: 'text-gray-500' };
  if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { text: 'Normal range', color: 'text-green-600' };
  if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-600' };
  return { text: 'Obese', color: 'text-red-600' };
};

// BSA Calculation (Mosteller)
const calculateBSA = (weightKg: number, heightCm: number): number | null => {
  if (weightKg <= 0 || heightCm <= 0) return null;
  return Math.sqrt((weightKg * heightCm) / 3600);
};

// BSA Interpretation
const interpretBSA = (bsa: number | null): { text: string; color: string } => {
  if (bsa === null) return { text: '', color: 'text-gray-500' };
  return { 
    text: `BSA is often used by clinicians for drug dosing or physiological assessments. Typical adult values range from 1.5 to 2.2 m².`, 
    color: 'text-gray-600' 
  };
};

// eGFR Calculation (CKD-EPI 2021 without race)
const calculateGFR_CKDEPI = (creatinineMgDl: number, age: number, sex: 'male' | 'female'): number | null => {
  if (creatinineMgDl <= 0 || age <= 0) return null;
  const kappa = sex === 'female' ? 0.7 : 0.9;
  const alpha = sex === 'female' ? -0.241 : -0.302;
  const sexFactor = sex === 'female' ? 1.012 : 1.0;
  const scrOverKappa = creatinineMgDl / kappa;
  const term1 = Math.min(scrOverKappa, 1) ** alpha;
  const term2 = Math.max(scrOverKappa, 1) ** -1.200;
  const ageFactor = 0.9938 ** age;
  const egfr = 142 * term1 * term2 * ageFactor * sexFactor;
  return egfr;
};

// eGFR Interpretation (KDIGO Stages)
const interpretGFR = (gfr: number | null): { text: string; stage: string; color: string } => {
  if (gfr === null) return { text: '', stage: '', color: 'text-gray-500' };
  if (gfr >= 90) return { text: 'Normal or high kidney function (check for kidney damage if other signs present).', stage: 'Stage 1', color: 'text-green-600' };
  if (gfr >= 60) return { text: 'Mildly decreased kidney function.', stage: 'Stage 2', color: 'text-lime-600' };
  if (gfr >= 45) return { text: 'Mild to moderately decreased kidney function.', stage: 'Stage 3a', color: 'text-yellow-600' };
  if (gfr >= 30) return { text: 'Moderate to severely decreased kidney function.', stage: 'Stage 3b', color: 'text-orange-600' };
  if (gfr >= 15) return { text: 'Severely decreased kidney function.', stage: 'Stage 4', color: 'text-red-600' };
  return { text: 'Kidney failure.', stage: 'Stage 5', color: 'text-red-800' };
};

// IBW Calculation (Devine)
const calculateIBW_Devine = (heightCm: number, sex: 'male' | 'female'): number | null => {
  if (heightCm <= 0) return null;
  const heightInches = heightCm / 2.54;
  const inchesOver5Feet = Math.max(0, heightInches - 60);
  if (sex === 'male') {
    return 50 + (2.3 * inchesOver5Feet);
  } else { // female
    return 45.5 + (2.3 * inchesOver5Feet);
  }
};

// IBW Interpretation
const interpretIBW = (ibw: number | null): { text: string; color: string } => {
  if (ibw === null) return { text: '', color: 'text-gray-500' };
  return { 
    text: `This is an estimation using the Devine formula. IBW is often used for ventilator settings or certain drug dosages.`, 
    color: 'text-gray-600' 
  };
};

// AdjBW Calculation
const calculateAdjBW = (actualWeightKg: number, idealWeightKg: number): number | null => {
  if (actualWeightKg <= 0 || idealWeightKg <= 0) return null;
  // Only calculate if ABW > 120% of IBW (common threshold)
  if (actualWeightKg > idealWeightKg * 1.2) {
    return idealWeightKg + 0.4 * (actualWeightKg - idealWeightKg);
  }
  return null; // Return null if not significantly overweight, as AdjBW is less relevant
};

// AdjBW Interpretation
const interpretAdjBW = (adjbw: number | null, abw: number, ibw: number): { text: string; color: string } => {
  if (adjbw === null) {
    if (abw > 0 && ibw > 0 && abw <= ibw * 1.2) {
      return { text: 'Adjusted Body Weight is typically calculated when Actual Body Weight significantly exceeds Ideal Body Weight (e.g., >120%).', color: 'text-gray-500' };
    }
    return { text: '', color: 'text-gray-500' };
  }
  return { 
    text: `AdjBW estimates a relevant body mass for dosing certain drugs in obese patients. It's used when Actual Weight significantly exceeds Ideal Weight.`, 
    color: 'text-gray-600' 
  };
};

// BMR Calculation (Mifflin-St Jeor)
const calculateBMR_MifflinStJeor = (weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number | null => {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return null;
  const sexConstant = sex === 'male' ? 5 : -161;
  const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + sexConstant;
  return bmr;
};

// BMR Interpretation
const interpretBMR = (bmr: number | null): { text: string; color: string } => {
  if (bmr === null) return { text: '', color: 'text-gray-500' };
  return { 
    text: `This is the estimated minimum calories your body needs at rest. Total daily energy needs depend on activity levels.`, 
    color: 'text-gray-600' 
  };
};

// Corrected Calcium Calculation
const calculateCorrectedCalcium = (totalCalciumMgDl: number, albuminGdl: number): number | null => {
  if (totalCalciumMgDl <= 0 || albuminGdl <= 0) return null;
  // Using standard formula: Corrected Ca = Total Ca + 0.8 * (4.0 - Albumin)
  return totalCalciumMgDl + 0.8 * (4.0 - albuminGdl);
};

// Corrected Calcium Interpretation
const interpretCorrectedCalcium = (correctedCa: number | null, totalCa: number, albumin: number): { text: string; color: string } => {
  if (correctedCa === null) return { text: '', color: 'text-gray-500' };
  let interpretation = `Corrected for Albumin (${albumin.toFixed(1)} g/dL). This estimates calcium if albumin were normal (4.0 g/dL). `;
  let color = 'text-gray-600';
  // Typical normal range check (can vary slightly)
  if (correctedCa < 8.5) {
    interpretation += 'Result is below the typical normal range (approx. 8.5-10.5 mg/dL).';
    color = 'text-blue-600';
  } else if (correctedCa > 10.5) {
    interpretation += 'Result is above the typical normal range (approx. 8.5-10.5 mg/dL).';
    color = 'text-red-600';
  } else {
    interpretation += 'Result is within the typical normal range (approx. 8.5-10.5 mg/dL).';
    color = 'text-green-600';
  }
  return { text: interpretation, color: color };
};


// --- Component ---

const MedicalCalculator = () => {
  // BMI State
  const [bmiWeight, setBmiWeight] = useState<string>('');
  const [bmiHeight, setBmiHeight] = useState<string>('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiInterpretation, setBmiInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });

  // BSA State
  const [bsaWeight, setBsaWeight] = useState<string>('');
  const [bsaHeight, setBsaHeight] = useState<string>('');
  const [bsaResult, setBsaResult] = useState<number | null>(null);
  const [bsaInterpretation, setBsaInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });

  // eGFR State
  const [gfrCreatinine, setGfrCreatinine] = useState<string>('');
  const [gfrAge, setGfrAge] = useState<string>('');
  const [gfrSex, setGfrSex] = useState<'male' | 'female' | ''>('');
  const [gfrResult, setGfrResult] = useState<number | null>(null);
  const [gfrInterpretation, setGfrInterpretation] = useState<{ text: string; stage: string; color: string }>({ text: '', stage: '', color: '' });

  // IBW State
  const [ibwHeight, setIbwHeight] = useState<string>('');
  const [ibwSex, setIbwSex] = useState<'male' | 'female' | ''>('');
  const [ibwResult, setIbwResult] = useState<number | null>(null);
  const [ibwInterpretation, setIbwInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });

  // AdjBW State (Needs Actual Weight, can reuse BMI or BSA weight)
  const [adjBwActualWeight, setAdjBwActualWeight] = useState<string>(''); // Or use bmiWeight/bsaWeight
  const [adjBwResult, setAdjBwResult] = useState<number | null>(null);
  const [adjBwInterpretation, setAdjBwInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });

  // BMR State
  const [bmrWeight, setBmrWeight] = useState<string>('');
  const [bmrHeight, setBmrHeight] = useState<string>('');
  const [bmrAge, setBmrAge] = useState<string>('');
  const [bmrSex, setBmrSex] = useState<'male' | 'female' | ''>('');
  const [bmrResult, setBmrResult] = useState<number | null>(null);
  const [bmrInterpretation, setBmrInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });

  // Corrected Calcium State
  const [ccTotalCalcium, setCcTotalCalcium] = useState<string>('');
  const [ccAlbumin, setCcAlbumin] = useState<string>('');
  const [ccResult, setCcResult] = useState<number | null>(null);
  const [ccInterpretation, setCcInterpretation] = useState<{ text: string; color: string }>({ text: '', color: '' });
  
  // Error State
  const [error, setError] = useState<string>('');

  // --- Calculation Handlers ---
  const handleBmiCalculate = () => {
    setError('');
    const weightNum = parseFloat(bmiWeight);
    const heightNum = parseFloat(bmiHeight);
    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      setError('BMI: Please enter valid positive numbers for weight (kg) and height (cm).');
      setBmiResult(null); setBmiInterpretation({ text: '', color: '' }); return;
    }
    const heightM = heightNum / 100;
    const result = calculateBMI(weightNum, heightM);
    setBmiResult(result); setBmiInterpretation(interpretBMI(result));
  };

  const handleBsaCalculate = () => {
    setError('');
    const weightNum = parseFloat(bsaWeight);
    const heightNum = parseFloat(bsaHeight);
    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      setError('BSA: Please enter valid positive numbers for weight (kg) and height (cm).');
      setBsaResult(null); setBsaInterpretation({ text: '', color: '' }); return;
    }
    const result = calculateBSA(weightNum, heightNum);
    setBsaResult(result); setBsaInterpretation(interpretBSA(result));
  };

  const handleGfrCalculate = () => {
    setError('');
    const creatinineNum = parseFloat(gfrCreatinine);
    const ageNum = parseInt(gfrAge, 10);
    if (isNaN(creatinineNum) || isNaN(ageNum) || creatinineNum <= 0 || ageNum <= 0 || !gfrSex) {
      setError('eGFR: Please enter valid positive numbers for creatinine (mg/dL), age, and select sex.');
      setGfrResult(null); setGfrInterpretation({ text: '', stage: '', color: '' }); return;
    }
    const result = calculateGFR_CKDEPI(creatinineNum, ageNum, gfrSex);
    setGfrResult(result); setGfrInterpretation(interpretGFR(result));
  };

  const handleIbwCalculate = () => {
    setError('');
    const heightNum = parseFloat(ibwHeight);
    if (isNaN(heightNum) || heightNum <= 0 || !ibwSex) {
      setError('IBW: Please enter a valid positive height (cm) and select sex.');
      setIbwResult(null); setIbwInterpretation({ text: '', color: '' }); return;
    }
    const result = calculateIBW_Devine(heightNum, ibwSex);
    setIbwResult(result); setIbwInterpretation(interpretIBW(result));
  };

  const handleAdjBwCalculate = () => {
    setError('');
    const actualWeightNum = parseFloat(adjBwActualWeight); // Using dedicated state for clarity
    const ibwNum = ibwResult; // Use the calculated IBW
    if (isNaN(actualWeightNum) || actualWeightNum <= 0) {
       setError('AdjBW: Please enter a valid positive Actual Body Weight (kg).');
       setAdjBwResult(null); setAdjBwInterpretation({ text: '', color: '' }); return;
    }
    if (ibwNum === null || ibwNum <= 0) {
       setError('AdjBW: Please calculate Ideal Body Weight (IBW) first.');
       setAdjBwResult(null); setAdjBwInterpretation({ text: '', color: '' }); return;
    }
    const result = calculateAdjBW(actualWeightNum, ibwNum);
    setAdjBwResult(result); setAdjBwInterpretation(interpretAdjBW(result, actualWeightNum, ibwNum));
  };

  const handleBmrCalculate = () => {
     setError('');
     const weightNum = parseFloat(bmrWeight);
     const heightNum = parseFloat(bmrHeight);
     const ageNum = parseInt(bmrAge, 10);
     if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum) || weightNum <= 0 || heightNum <= 0 || ageNum <= 0 || !bmrSex) {
       setError('BMR: Please enter valid positive numbers for weight (kg), height (cm), age, and select sex.');
       setBmrResult(null); setBmrInterpretation({ text: '', color: '' }); return;
     }
     const result = calculateBMR_MifflinStJeor(weightNum, heightNum, ageNum, bmrSex);
     setBmrResult(result); setBmrInterpretation(interpretBMR(result));
  };

  const handleCorrectedCalciumCalculate = () => {
     setError('');
     const totalCaNum = parseFloat(ccTotalCalcium);
     const albuminNum = parseFloat(ccAlbumin);
     if (isNaN(totalCaNum) || isNaN(albuminNum) || totalCaNum <= 0 || albuminNum <= 0) {
       setError('Corrected Ca: Please enter valid positive numbers for Total Calcium (mg/dL) and Albumin (g/dL).');
       setCcResult(null); setCcInterpretation({ text: '', color: '' }); return;
     }
     const result = calculateCorrectedCalcium(totalCaNum, albuminNum);
     setCcResult(result); setCcInterpretation(interpretCorrectedCalcium(result, totalCaNum, albuminNum));
  };

  return (
    <div>
      <PageHeader 
        title="Medical Calculator" 
        subtitle="Calculate common clinical values. For informational purposes only." 
      />
      
      <div className="container-custom">
        {/* Disclaimer */}
        <Alert variant="destructive" className="mb-8 bg-red-50 border-red-500 text-red-800">
          <AlertTriangle className="h-4 w-4 !text-red-800" />
          <AlertTitle className="font-bold">Disclaimer</AlertTitle>
          <AlertDescription>
            This calculator is intended for informational and educational purposes only and does not substitute for professional medical diagnosis, advice, or treatment. Normal values can vary. Always consult with a qualified healthcare professional for accurate interpretation and recommendations.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Changed grid layout for more calculators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
          {/* BMI Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>BMI Calculator</CardTitle>
              <CardDescription>Body Mass Index</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="bmi-weight">Weight (kg)</Label>
                <Input id="bmi-weight" type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} placeholder="e.g., 70" />
              </div>
              <div>
                <Label htmlFor="bmi-height">Height (cm)</Label>
                <Input id="bmi-height" type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} placeholder="e.g., 175" />
              </div>
              <Button onClick={handleBmiCalculate} className="w-full">Calculate BMI</Button>
              {bmiResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{bmiResult.toFixed(1)} kg/m²</p>
                  <p className={`mt-1 font-semibold ${bmiInterpretation.color}`}>{bmiInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* BSA Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>BSA Calculator</CardTitle>
              <CardDescription>Body Surface Area (Mosteller)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="bsa-weight">Weight (kg)</Label>
                <Input id="bsa-weight" type="number" value={bsaWeight} onChange={(e) => setBsaWeight(e.target.value)} placeholder="e.g., 70" />
              </div>
              <div>
                <Label htmlFor="bsa-height">Height (cm)</Label>
                <Input id="bsa-height" type="number" value={bsaHeight} onChange={(e) => setBsaHeight(e.target.value)} placeholder="e.g., 175" />
              </div>
              <Button onClick={handleBsaCalculate} className="w-full">Calculate BSA</Button>
              {bsaResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{bsaResult.toFixed(2)} m²</p>
                  <p className={`mt-1 text-sm ${bsaInterpretation.color}`}>{bsaInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* eGFR Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>eGFR Calculator</CardTitle>
              <CardDescription>CKD-EPI 2021 (No Race)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="gfr-creatinine">Serum Creatinine (mg/dL)</Label>
                <Input id="gfr-creatinine" type="number" value={gfrCreatinine} onChange={(e) => setGfrCreatinine(e.target.value)} placeholder="e.g., 1.1" />
              </div>
              <div>
                <Label htmlFor="gfr-age">Age (years)</Label>
                <Input id="gfr-age" type="number" value={gfrAge} onChange={(e) => setGfrAge(e.target.value)} placeholder="e.g., 50" />
              </div>
              <div>
                 <Label>Sex</Label>
                 <Select onValueChange={(value: 'male' | 'female') => setGfrSex(value)} value={gfrSex}>
                   <SelectTrigger> <SelectValue placeholder="Select sex" /> </SelectTrigger>
                   <SelectContent> <SelectItem value="male">Male</SelectItem> <SelectItem value="female">Female</SelectItem> </SelectContent>
                 </Select>
              </div>
              <Button onClick={handleGfrCalculate} className="w-full">Calculate eGFR</Button>
              {gfrResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{gfrResult.toFixed(0)} mL/min/1.73 m²</p>
                  <p className={`mt-1 font-semibold ${gfrInterpretation.color}`}>{gfrInterpretation.stage}</p>
                  <p className={`mt-1 text-sm ${gfrInterpretation.color}`}>{gfrInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* IBW Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>IBW Calculator</CardTitle>
              <CardDescription>Ideal Body Weight (Devine)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="ibw-height">Height (cm)</Label>
                <Input id="ibw-height" type="number" value={ibwHeight} onChange={(e) => setIbwHeight(e.target.value)} placeholder="e.g., 175" />
              </div>
              <div>
                 <Label>Sex</Label>
                 <Select onValueChange={(value: 'male' | 'female') => setIbwSex(value)} value={ibwSex}>
                   <SelectTrigger> <SelectValue placeholder="Select sex" /> </SelectTrigger>
                   <SelectContent> <SelectItem value="male">Male</SelectItem> <SelectItem value="female">Female</SelectItem> </SelectContent>
                 </Select>
              </div>
              <Button onClick={handleIbwCalculate} className="w-full">Calculate IBW</Button>
              {ibwResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{ibwResult.toFixed(1)} kg</p>
                  <p className={`mt-1 text-sm ${ibwInterpretation.color}`}>{ibwInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AdjBW Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>AdjBW Calculator</CardTitle>
              <CardDescription>Adjusted Body Weight</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="adjbw-actual-weight">Actual Body Weight (kg)</Label>
                <Input id="adjbw-actual-weight" type="number" value={adjBwActualWeight} onChange={(e) => setAdjBwActualWeight(e.target.value)} placeholder="e.g., 90" />
              </div>
               <div>
                 <Label>Ideal Body Weight (kg)</Label>
                 <Input type="number" value={ibwResult !== null ? ibwResult.toFixed(1) : ''} readOnly disabled placeholder="Calculate IBW first" />
               </div>
              <Button onClick={handleAdjBwCalculate} className="w-full" disabled={ibwResult === null}>Calculate AdjBW</Button>
              {adjBwResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{adjBwResult.toFixed(1)} kg</p>
                  <p className={`mt-1 text-sm ${adjBwInterpretation.color}`}>{adjBwInterpretation.text}</p>
                </div>
              )}
               {/* Show interpretation even if AdjBW is null but calculation was attempted */}
               {adjBwResult === null && adjBwInterpretation.text && ibwResult !== null && (
                 <div className="mt-4 p-4 bg-gray-50 rounded">
                   <p className={`mt-1 text-sm ${adjBwInterpretation.color}`}>{adjBwInterpretation.text}</p>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* BMR Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>BMR Calculator</CardTitle>
              <CardDescription>Basal Metabolic Rate (Mifflin-St Jeor)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="bmr-weight">Weight (kg)</Label>
                <Input id="bmr-weight" type="number" value={bmrWeight} onChange={(e) => setBmrWeight(e.target.value)} placeholder="e.g., 70" />
              </div>
              <div>
                <Label htmlFor="bmr-height">Height (cm)</Label>
                <Input id="bmr-height" type="number" value={bmrHeight} onChange={(e) => setBmrHeight(e.target.value)} placeholder="e.g., 175" />
              </div>
              <div>
                <Label htmlFor="bmr-age">Age (years)</Label>
                <Input id="bmr-age" type="number" value={bmrAge} onChange={(e) => setBmrAge(e.target.value)} placeholder="e.g., 30" />
              </div>
              <div>
                 <Label>Sex</Label>
                 <Select onValueChange={(value: 'male' | 'female') => setBmrSex(value)} value={bmrSex}>
                   <SelectTrigger> <SelectValue placeholder="Select sex" /> </SelectTrigger>
                   <SelectContent> <SelectItem value="male">Male</SelectItem> <SelectItem value="female">Female</SelectItem> </SelectContent>
                 </Select>
              </div>
              <Button onClick={handleBmrCalculate} className="w-full">Calculate BMR</Button>
              {bmrResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{bmrResult.toFixed(0)} kcal/day</p>
                  <p className={`mt-1 text-sm ${bmrInterpretation.color}`}>{bmrInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Corrected Calcium Calculator */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Corrected Calcium</CardTitle>
              <CardDescription>Adjusts for Albumin Level</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <Label htmlFor="cc-calcium">Total Calcium (mg/dL)</Label>
                <Input id="cc-calcium" type="number" value={ccTotalCalcium} onChange={(e) => setCcTotalCalcium(e.target.value)} placeholder="e.g., 9.5" />
              </div>
              <div>
                <Label htmlFor="cc-albumin">Serum Albumin (g/dL)</Label>
                <Input id="cc-albumin" type="number" value={ccAlbumin} onChange={(e) => setCcAlbumin(e.target.value)} placeholder="e.g., 3.5" />
              </div>
              <Button onClick={handleCorrectedCalciumCalculate} className="w-full">Calculate Corrected Ca</Button>
              {ccResult !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Result:</p>
                  <p className="text-2xl font-bold text-medical-blue">{ccResult.toFixed(1)} mg/dL</p>
                  <p className={`mt-1 text-sm ${ccInterpretation.color}`}>{ccInterpretation.text}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center"> 
          <Link to="/tools">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicalCalculator;
