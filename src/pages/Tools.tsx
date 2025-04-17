import { useEffect, useState, useCallback } from 'react'; // Added useState, useCallback
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Book, Brain, FlaskConical, FileSearch, Calculator, Pill, HeartPulse, Apple, FileText, Computer, AlertTriangle, Network, ClipboardList, XCircle, Bot } from 'lucide-react'; // Added XCircle
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess'; // Import hook
import { FeatureName } from '@/lib/quotas';
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
  featureName: FeatureName; // Add the corresponding feature name
  comingSoon: boolean;
}

const toolsData: ToolData[] = [
  {
    id: 1,
    featureName: 'medical_calculator', // Added feature name
    title: 'Medical Calculator',
    description: 'Calculate BMI, BSA, GFR, and other important clinical values.',
    icon: Calculator,
    path: '/tools/medical-calculator',
    comingSoon: false
  },
  {
    id: 2,
    featureName: 'drug_reference', // Added feature name
    title: 'Drug Reference',
    description: 'Access comprehensive drug information database.',
    icon: Pill,
    path: '/tools/drug-reference',
    comingSoon: false
  },
  {
    id: 3,
    featureName: 'nutrition_database', // Added feature name
    title: 'Nutrition Database',
    description: 'Explore nutritional information for various food items.',
    icon: Apple,
    path: '/tools/nutrition-database',
    comingSoon: false
  },
  {
    id: 4,
    featureName: 'disease_library', // Added feature name
    title: 'Disease Library',
    description: 'Comprehensive information on various conditions.',
    icon: Book,
    path: '/tools/disease-library',
    comingSoon: false
  },
  {
    id: 5,
    featureName: 'clinical_guidelines', // Added feature name
    title: 'Clinical Guidelines',
    description: 'Access the latest medical practice guidelines.',
    icon: FileSearch,
    path: '/tools/clinical-guidelines',
    comingSoon: false
  },
  {
    id: 6,
    featureName: 'ai_chatbot', // Added feature name
    title: 'AI Chatbot',
    description: 'Engage with an AI assistant for medical information and queries.',
    icon: Brain,
    path: '/tools/ai-chatbot',
    comingSoon: false
  },
  {
    id: 7,
    featureName: 'ai_peer_review', // Added feature name
    title: 'AI Peer-Review',
    description: 'Get AI-powered feedback on your clinical notes or case studies.',
    icon: FileText,
    path: '/tools/ai-peer-review',
    comingSoon: false
  },
  {
    id: 8,
    featureName: 'explore_gemini', // Added feature name
    title: 'Explore GEMINI',
    description: 'Utilize Google\'s advanced AI for medical research exploration.',
    icon: Computer,
    path: '/tools/explore-gemini',
    comingSoon: false
  },
  {
    id: 9,
    featureName: 'explore_deepseek',
    title: 'Explore DeepSeek',
    description: 'Leverage DeepSeek AI for advanced medical insights.',
    icon: Bot, // Using the Bot icon, similar to other AI tools
    path: '/tools/explore-deepseek', // Proposed path
    comingSoon: false
  },
  {
    id: 10,
    featureName: 'interaction_checker', // Added feature name
    title: 'Drug Interaction Checker',
    description: 'Check for potential interactions between multiple drugs.',
    icon: AlertTriangle,
    path: '/tools/interaction-checker',
    comingSoon: false
  },
  {
    id: 11,
    featureName: 'mind_map_maker', // Added feature name
    title: 'AI Mind Map Generator',
    description: 'Generate visual mind maps from any topic using AI.',
    icon: Network,
    path: '/tools/ai-mindmap-generator',
    comingSoon: false
  },
  {
    id: 12,
    featureName: 'clinical_scoring', // Added feature name
    title: 'Clinical Scoring Hub',
    description: 'Access various validated clinical scoring calculators.',
    icon: ClipboardList,
    path: '/tools/clinical-scoring-hub',
    comingSoon: false
  }
  // Removed Learning Resources card data
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
    const verifyAccess = async () => {
      try {
        const result = await checkAccess(tool.featureName);
        if (isMounted) {
          setIsDisabled(result.isDisabled ?? false); // Set disabled state based on check
          setIsLoading(false); // Finish loading
        }
      } catch (error) {
        console.error(`Error checking access for ${tool.featureName}:`, error);
        if (isMounted) {
          setIsDisabled(false); // Default to not disabled on error? Or true? Let's default false.
          setIsLoading(false);
        }
      }
    };
    verifyAccess();
    return () => { isMounted = false; };
  }, [checkAccess, tool.featureName]);

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
          Coming Soon
        </Button>
      );
    }

    if (isLoading) {
      return <Skeleton className="h-10 w-full" />; // Show skeleton while loading access status
    }

    const buttonContent = (
      <Button
        className={`w-full ${isDisabled ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : 'bg-medical-teal hover:bg-medical-blue'}`}
        onClick={isDisabled ? handleButtonClick : undefined} // Only attach onClick if disabled
        aria-disabled={isDisabled} // Indicate disabled state for accessibility
      >
        Launch Tool
      </Button>
    );

    // If disabled, wrap the button in AlertDialogTrigger
    // If enabled, wrap the button in Link
    return isDisabled ? (
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
        title="Medical Tools"
        subtitle="Access specialized tools to assist in your medical studies and practice"
      />

      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData.map((tool) => (
            // Use AlertDialog for each card to manage its own trigger state
            <AlertDialog key={tool.id} open={isModalOpen && modalTitle === tool.title} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
              <ToolCard tool={tool} onDisabledClick={handleDisabledToolClick} />
              {/* Modal Content - Placed inside the loop but only shown when triggered */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                     <XCircle className="h-5 w-5 text-red-500" /> Access Denied
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Access to the "{modalTitle}" feature is currently disabled for maintenance. Please check back later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Close</AlertDialogCancel>
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
