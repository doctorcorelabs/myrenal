import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';
import ChadsvascScore from '@/components/scores/ChadsvascScore';
import WellsScoreDvt from '@/components/scores/WellsScoreDvt';
import WellsScorePe from '@/components/scores/WellsScorePe';
import GcsScore from '@/components/scores/GcsScore';
import Curb65Score from '@/components/scores/Curb65Score';
import MeldScore from '@/components/scores/MeldScore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal } from 'lucide-react'; // Terminal ditambahkan
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Mengimpor hook
import { FeatureName } from '@/lib/quotas'; // Mengimpor FeatureName dari quotas.ts
import { useToast } from '@/components/ui/use-toast'; // Toast ditambahkan
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Alert ditambahkan
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton ditambahkan

const ClinicalScoringHub: React.FC = () => {
  const featureName: FeatureName = 'clinical_scoring';
  const { checkAccess, isLoadingToggles } = useFeatureAccess();
  const { toast } = useToast();

  // State for access check result
  const [initialAccessAllowed, setInitialAccessAllowed] = useState(false);
  const [initialAccessMessage, setInitialAccessMessage] = useState<string | null>(null);

  // Initial access check on mount
  useEffect(() => {
    // Define the async function first
    const verifyInitialAccess = async () => {
      setInitialAccessMessage(null);
      try {
        const result = await checkAccess(featureName);
         // Check the result inside the try block
         if (!result.allowed || result.isDisabled) {
            setInitialAccessAllowed(false);
            setInitialAccessMessage(result.message || 'Akses ditolak.');
         } else {
            setInitialAccessAllowed(true);
         }
       } catch (error) { // Catch block correctly placed for the try
         console.error("Error checking initial feature access:", error);
         setInitialAccessAllowed(false);
         setInitialAccessMessage('Gagal memeriksa akses fitur.');
         toast({
           title: "Kesalahan",
           description: "Tidak dapat memverifikasi akses fitur saat ini.",
           variant: "destructive",
         });
       }
    }; // End of verifyInitialAccess async function

    // Only run verifyAccess if the hook is done loading toggles
    if (!isLoadingToggles) {
      verifyInitialAccess(); // Call the function conditionally
    } // End of if (!isLoadingToggles)
  }, [isLoadingToggles]); // Simplify dependency array

  // TODO: Teruskan incrementUsage ke komponen skor individual atau minta mereka menggunakan hook.
  // Untuk saat ini, penggunaan hanya diperiksa pada pemuatan awal.

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Pusat Penilaian Klinis"
        subtitle="Kumpulan kalkulator penilaian klinis tervalidasi untuk stratifikasi risiko, diagnosis, penilaian keparahan, dan prognosis."
      />

      {/* Show Skeleton only based on the hook's loading state */}
      {isLoadingToggles && (
         <div className="flex flex-col space-y-3 mt-6">
           <Skeleton className="h-[150px] w-full rounded-lg" />
           <Skeleton className="h-[150px] w-full rounded-lg" />
           <Skeleton className="h-[300px] w-full rounded-lg" />
         </div>
       )}

       {/* Access Denied Message (Show only if hook is NOT loading and access is denied) */}
       {!isLoadingToggles && !initialAccessAllowed && (
          <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>
              {initialAccessMessage || 'Anda tidak memiliki izin untuk mengakses fitur ini.'}
            </AlertDescription>
          </Alert>
        )}

      {/* Render content only if NOT loading and access IS allowed */}
      {!isLoadingToggles && initialAccessAllowed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Placeholder untuk Kategori/Kalkulator Skor */}
            <Card>
          <CardHeader>
            <CardTitle>Skor Kardiologi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Kalkulator terkait risiko dan kondisi kardiovaskular.</p>
            {/* Tautan atau kalkulator tersemat akan ditempatkan di sini */}
            <p className="mt-4 text-sm text-muted-foreground text-justify">(CHADS2-VASc, HEART Score, dll.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skor Pulmonologi/Perawatan Kritis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Kalkulator untuk kondisi pernapasan dan penyakit kritis.</p>
            {/* Tautan atau kalkulator tersemat akan ditempatkan di sini */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' PE, CURB-65, GCS, dll.)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skor Gastroenterologi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Kalkulator yang relevan dengan penyakit hati dan pencernaan.</p>
            {/* Tautan atau kalkulator tersemat akan ditempatkan di sini */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(MELD Score, dll.)</p>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Skor Lainnya</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-justify">Berbagai skor klinis berguna lainnya.</p>
            {/* Tautan atau kalkulator tersemat akan ditempatkan di sini */}
             <p className="mt-4 text-sm text-muted-foreground text-justify">(Wells' DVT, dll.)</p>
          </CardContent>
        </Card>
        {/* Tambahkan lebih banyak kartu kategori sesuai kebutuhan */}
      </div>

      {/* Display Calculators Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Kalkulator</h2>
        {/* Kita bisa menambahkan logika di sini nanti untuk memilih kalkulator mana yang akan ditampilkan */}
        {/* Untuk saat ini, cukup tampilkan CHADS2-VASc */}
        <ChadsvascScore />
        <WellsScoreDvt />
        <WellsScorePe />
        <GcsScore />
        <Curb65Score />
        <MeldScore />

        {/* Placeholder untuk kalkulator lainnya */}
      </div>

      {/* Tombol Kembali ke Alat */}
      <div className="mt-12 mb-8 flex justify-center">
        <Link to="/screening">
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
     </>
    )} {/* Akhir dari blok initialAccessAllowed */}
    </div>
  );
};

export default ClinicalScoringHub;
