
import { useEffect } from 'react';
// Removed Layout import as it's applied in App.tsx
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Book, Brain, FlaskConical, FileSearch, Calculator, Pill, HeartPulse, Apple, FileText, Computer, AlertTriangle, Network, ClipboardList } from 'lucide-react'; // Added ClipboardList icon
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const toolsData = [
  {
    id: 1,
    title: 'Medical Calculator',
    description: 'Calculate BMI, BSA, GFR, and other important clinical values',
    icon: Calculator,
    path: '/tools/medical-calculator',
    comingSoon: false
  },
  {
    id: 2,
    title: 'Drug Reference',
    description: 'Access comprehensive drug information database',
    icon: Pill,
    path: '/tools/drug-reference',
    comingSoon: false
  },
  {
    id: 3,
    title: 'Nutrition Database',
    description: 'Explore nutritional information for various food items',
    icon: Apple,
    path: '/tools/nutrition-database',
    comingSoon: false
  },
  {
    id: 4,
    title: 'Disease Library',
    description: 'Comprehensive information on various conditions',
    icon: Book,
    path: '/tools/disease-library',
    comingSoon: false
  },
  {
    id: 5,
    title: 'Clinical Guidelines',
    description: 'Access the latest medical practice guidelines',
    icon: FileSearch,
    path: '/tools/clinical-guidelines',
    comingSoon: false
  },
  {
    id: 6,
    title: 'AI Chatbot',
    description: 'Engage with an AI assistant for medical information and queries',
    icon: Brain,
    path: '/tools/ai-chatbot',
    comingSoon: false
  },
  {
    id: 7,
    title: 'AI Peer-Review',
    description: 'Get AI-powered feedback on your clinical notes or case studies',
    icon: FileText,
    path: '/tools/ai-peer-review',
    comingSoon: false
  },
  {
    id: 8,
    title: 'Explore GEMINI',
    description: 'Utilize Google\'s advanced AI for medical research exploration.',
    icon: Computer,
    path: '/tools/explore-gemini',
    comingSoon: false
  },
  {
    id: 9,
    title: 'Drug Interaction Checker',
    description: 'Check for potential interactions between multiple drugs',
    icon: AlertTriangle,
    path: '/tools/interaction-checker',
    comingSoon: false
  },
  {
    id: 11, // Keep ID 11 for Mind Map
    title: 'AI Mind Map Generator',
    description: 'Generate visual mind maps from any topic using AI.',
    icon: Network,
    path: '/tools/ai-mindmap-generator',
    comingSoon: false
  },
  {
    id: 12, // New ID for Scoring Hub
    title: 'Clinical Scoring Hub',
    description: 'Access various validated clinical scoring calculators.',
    icon: ClipboardList,
    path: '/tools/clinical-scoring-hub',
    comingSoon: false
  },
  {
    id: 10, // Keep ID 10 for Learning Resources
    title: 'Learning Resources',
    description: 'Access curated educational materials and resources',
    icon: Book,
    path: '/tools/learning-resources',
    comingSoon: false
  }
];

const Tools = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  return (
    // Removed Layout wrapper
    <> 
      <PageHeader 
        title="Medical Tools" 
        subtitle="Access specialized tools to assist in your medical studies and practice" 
      />
      
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolsData.map((tool) => (
            <Card key={tool.id} className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <tool.icon className="h-8 w-8 text-medical-teal" />
                  {tool.comingSoon && (
                    <span className="text-xs bg-amber-100 text-amber-800 py-1 px-2 rounded-full font-medium">
                      Coming Soon
                    </span>
                  )} {/* Added missing closing parenthesis */}
                   {/* Removed Coming Soon badge logic here as it's handled by the flag */}
                 </div>
                 <CardTitle className="mt-2">{tool.title}</CardTitle>
                 <CardDescription className="text-justify">{tool.description}</CardDescription> {/* Added text-justify */}
               </CardHeader>
               <CardContent className="flex-grow">
                {/* Tool content will go here */}
              </CardContent>
              <CardFooter>
                {tool.comingSoon ? (
                  <Button
                    className="w-full bg-gray-400 cursor-not-allowed" // Style disabled button
                    disabled
                  >
                    Coming Soon
                  </Button>
                ) : (
                  <Link to={tool.path || '#'} className="w-full"> {/* Use tool.path, fallback to '#' */}
                    <Button className="w-full bg-medical-teal hover:bg-medical-blue">
                      Launch Tool
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;
