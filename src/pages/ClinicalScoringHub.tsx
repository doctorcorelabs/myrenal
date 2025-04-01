import React, { useState } from 'react'; // Added useState
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import ChadsvascScore from '@/components/scores/ChadsvascScore';
import WellsScoreDvt from '@/components/scores/WellsScoreDvt';
import WellsScorePe from '@/components/scores/WellsScorePe';
import GcsScore from '@/components/scores/GcsScore';
import Curb65Score from '@/components/scores/Curb65Score';
import MeldScore from '@/components/scores/MeldScore';
import { Link } from 'react-router-dom'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon
// Potentially import other calculators later

const ClinicalScoringHub: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PageHeader subtitle likely already handles alignment, but we'll check if needed */}
      <PageHeader
        title="Clinical Scoring Hub"
        subtitle="A collection of validated clinical scoring calculators for risk stratification, diagnosis, severity assessment, and prognosis."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Placeholder for Score Categories/Calculators */}
        <Card>
          <CardHeader>
            <CardTitle>Cardiology Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators related to cardiovascular risk and conditions.</p>
            {/* Links or embedded calculators will go here */}
            <p className="mt-4 text-sm text-muted-foreground text-justify">(CHADS2-VASc, HEART Score, etc.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulmonology/Critical Care Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators for respiratory conditions and critical illness.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' PE, CURB-65, GCS, etc.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastroenterology Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Calculators relevant to liver and digestive diseases.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(MELD Score, etc.)</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Other Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Various other useful clinical scores.</p>
            {/* Links or embedded calculators will go here */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' DVT, etc.)</p>
          </CardContent>
        </Card>
        {/* Add more category cards as needed */}
      </div>

      {/* Display Calculators Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Calculators</h2>
        {/* We can add logic here later to select which calculator to show */}
        {/* For now, just display the CHADS2-VASc */}
        <ChadsvascScore />
        <WellsScoreDvt />
        <WellsScorePe />
        <GcsScore />
        <Curb65Score />
        <MeldScore />

        {/* Placeholder for other calculators */}
      </div>

      {/* Back to Tools Button */}
      <div className="mt-12 mb-8 flex justify-center">
        <Link to="/tools">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>

    </div>
  );
};

export default ClinicalScoringHub;
