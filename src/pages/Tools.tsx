import { useEffect, useState, useCallback } from 'react'; // Added useState, useCallback
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Book, Brain, FlaskConical, FileSearch, Calculator, Pill, HeartPulse, Apple, FileText, Computer, AlertTriangle, Network, ClipboardList, XCircle, Bot } from 'lucide-react'; // Added XCircle
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Import hook
import { FeatureName } from '../lib/quotas'; // Using relative path
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define a type for the tool data, including the feature name key
interface ToolData {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType; // Use ElementType for component icons
  path: string;
  featureName?: FeatureName; // Make featureName optional
  comingSoon: boolean;
}

export const toolsData: ToolData[] = [
  {
    id: 1,
    featureName: 'medical_calculator', // Added feature name
    title: 'Kalkulator Medis',
    description: 'Hitung BMI, BSA, GFR, dan nilai klinis penting lainnya.',
    icon: Calculator,
    path: '/tools/medical-calculator',
    comingSoon: false
  },
  {
    id: 2,
    featureName: 'drug_reference', // Added feature name
    title: 'Referensi Obat',
    description: 'Akses database informasi obat yang komprehensif.',
    icon: Pill,
    path: '/tools/drug-reference',
    comingSoon: false
  },
  {
    id: 3,
    featureName: 'nutrition_database', // Added feature name
    title: 'Database Nutrisi',
    description: 'Jelajahi informasi nutrisi untuk berbagai item makanan.',
    icon: Apple,
    path: '/tools/nutrition-database',
    comingSoon: false
  },
  {
    id: 4,
    featureName: 'disease_library', // Added feature name
    title: 'Perpustakaan Penyakit',
    description: 'Informasi komprehensif tentang berbagai kondisi.',
    icon: Book,
    path: '/tools/disease-library',
    comingSoon: false
  },
  {
    id: 5,
    featureName: 'clinical_guidelines', // Added feature name
    title: 'Panduan Klinis',
    description: 'Akses panduan praktik medis terbaru.',
    icon: FileSearch,
    path: '/tools/clinical-guidelines',
    comingSoon: false
  },
  {
    id: 6,
    featureName: 'ai_chatbot', // Added feature name
    title: 'Chatbot AI',
    description: 'Berinteraksi dengan asisten AI untuk informasi dan pertanyaan medis.',
    icon: Brain,
    path: '/tools/ai-chatbot',
    comingSoon: false
  },
  {
    id: 8,
    featureName: 'explore_gemini', // Added feature name
    title: 'Jelajahi Gemini',
    description: 'Manfaatkan AI canggih Google untuk eksplorasi penelitian medis.',
    icon: Computer,
    path: '/tools/explore-gemini',
    comingSoon: false
  },
  {
    id: 9,
    featureName: 'explore_deepseek',
    title: 'Jelajahi DeepSeek',
    description: 'Manfaatkan AI DeepSeek untuk wawasan medis lanjutan.',
    icon: Bot, // Using the Bot icon, similar to other AI tools
    path: '/tools/explore-deepseek', // Proposed path
    comingSoon: false
  },
  {
    id: 10,
    featureName: 'interaction_checker', // Added feature name
    title: 'Pemeriksa Interaksi Obat',
    description: 'Periksa potensi interaksi antara beberapa obat.',
    icon: AlertTriangle,
    path: '/tools/interaction-checker',
    comingSoon: false
  },
  {
    id: 11,
    featureName: 'mind_map_maker', // Added feature name
    title: 'Pembuat Mind Map',
    description: 'Hasilkan peta pikiran visual dari topik apa pun menggunakan AI.',
    icon: Network,
    path: '/tools/ai-mindmap-generator',
    comingSoon: false
  },
  {
    id: 12,
    featureName: 'clinical_scoring', // Added feature name
    title: 'Pusat Penilaian Klinis',
    description: 'Akses berbagai kalkulator penilaian klinis yang tervalidasi.',
    icon: ClipboardList,
    path: '/tools/clinical-scoring-hub',
    comingSoon: false
  },
  {
    id: 13, // New ID for Learning Resources
    // featureName is omitted as it doesn't need access control
    title: 'Sumber Daya Pembelajaran',
    description: 'Akses materi dan sumber daya pembelajaran yang dikurasi.',
    icon: Book, // Using Book icon
    path: '/tools/learning-resources', // Path to the learning resources page
    comingSoon: false
  }
];

// --- ToolCard Component ---
interface ToolCardProps {
  tool: ToolData;
  onDisabledClick: (title: string) => void; // Callback when disabled tool is clicked
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onDisabledClick }) => {
  const { checkAccess } = useFeatureAccess();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  useEffect(() => {
    let isMounted = true;
    // Only check access if a featureName is provided
    if (tool.featureName) {
      const verifyAccess = async () => {
        try {
          // Ensure featureName exists before calling checkAccess
          if (tool.featureName) {
            const result = await checkAccess(tool.featureName);
            if (isMounted) {
              setIsDisabled(result.isDisabled ?? false); // Set disabled state based on check
            }
          } else {
             // Should not happen due to outer check, but safe fallback
             if (isMounted) setIsDisabled(false);
          }
        } catch (error) {
          console.error(`Error checking access for ${tool.featureName}:`, error);
          if (isMounted) {
            setIsDisabled(false); // Default to not disabled on error
          }
        } finally {
           if (isMounted) setIsLoading(false); // Finish loading regardless of outcome
        }
      };
      verifyAccess();
    } else {
      // If no featureName, the tool is always enabled and not loading access status
      setIsDisabled(false);
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [checkAccess, tool.featureName]); // Keep dependencies

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault(); // Prevent default if it was somehow wrapped in a link
      onDisabledClick(tool.title); // Trigger the modal
    }
    // If not disabled, the Link component will handle navigation
  };

  const renderButton = () => {
    if (tool.comingSoon) {
      return (
        <Button className="w-full bg-gray-400 cursor-not-allowed" disabled>
          Segera Hadir
        </Button>
      );
    }

    if (isLoading) {
      // Only show skeleton if loading is relevant (i.e., featureName exists)
      return tool.featureName ? <Skeleton className="h-10 w-full" /> : null;
    }

    // Determine if the button should be disabled (only relevant if featureName exists)
    const isEffectivelyDisabled = tool.featureName ? isDisabled : false;

    const buttonContent = (
      <Button
        className={`w-full ${isEffectivelyDisabled ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-medical-teal hover:bg-medical-blue'}`}
        onClick={isEffectivelyDisabled ? handleButtonClick : undefined} // Only attach onClick if disabled
        aria-disabled={isEffectivelyDisabled} // Indicate disabled state for accessibility
      >
        Luncurkan Alat
      </Button>
    );

    // If effectively disabled (and has a featureName), wrap in AlertDialogTrigger
    // Otherwise (enabled or no featureName), wrap in Link
    return isEffectivelyDisabled && tool.featureName ? (
      <AlertDialogTrigger asChild>{buttonContent}</AlertDialogTrigger>
    ) : (
      <Link to={tool.path} className="w-full">
        {buttonContent}
      </Link>
    );
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <tool.icon className="h-8 w-8 text-medical-teal" />
          {tool.comingSoon && (
            <span className="text-xs bg-amber-100 text-amber-800 py-1 px-2 rounded-full font-medium">
              Coming Soon
            </span>
          )}
        </div>
        <CardTitle className="mt-2">{tool.title}</CardTitle>
        <CardDescription className="text-justify">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Optional: Add more content here if needed */}
      </CardContent>
      <CardFooter>
        {renderButton()}
      </CardFooter>
    </Card>
  );
};
// --- End ToolCard Component ---


const Tools = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  const handleDisabledToolClick = useCallback((toolTitle: string) => {
    setModalTitle(toolTitle);
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <PageHeader
        title="Alat"
        subtitle="Akses alat sesuai kebutuhan Anda"
       />

      {/* Adjusted padding for better mobile spacing */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData.map((tool) => (
            // Use AlertDialog for each card to manage its own trigger state
            <AlertDialog key={tool.id} open={isModalOpen && modalTitle === tool.title} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
              <ToolCard tool={tool} onDisabledClick={handleDisabledToolClick} />
              {/* Modal Content - Placed inside the loop but only shown when triggered */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                     <XCircle className="h-5 w-5 text-red-500" /> Akses Ditolak
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Akses ke fitur "{modalTitle}" saat ini dinonaktifkan untuk pemeliharaan. Mohon periksa kembali nanti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Tutup</AlertDialogCancel>
                  {/* No action button needed */}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;
