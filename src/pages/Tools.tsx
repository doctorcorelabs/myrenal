
import { useEffect } from 'react';
// Removed Layout import as it's applied in App.tsx
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Book, Brain, FlaskConical, FileSearch, Calculator, Pill, HeartPulse, Apple } from 'lucide-react'; // Added Apple
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const toolsData = [
  {
    id: 1,
    title: 'Medical Calculator',
    description: 'Calculate BMI, BSA, GFR, and other important clinical values',
    icon: Calculator,
    comingSoon: false
  },
  {
    id: 2,
    title: 'Drug Reference',
    description: 'Access comprehensive drug information database',
    icon: Pill,
    comingSoon: false // Changed to false
  },
  {
    id: 3, // Re-sequenced ID
    title: 'Nutrition Database', 
    description: 'Explore nutritional information for various food items', 
    icon: Apple, 
    comingSoon: false // Changed to false
  },
  {
    id: 4,
    title: 'Disease Library',
    description: 'Comprehensive information on various conditions',
    icon: Book,
    comingSoon: false // Changed to false
  },
  {
    id: 5,
    title: 'Clinical Guidelines',
    description: 'Access the latest medical practice guidelines',
    icon: FileSearch,
    comingSoon: false // Changed to false
  },
  {
    id: 6,
    title: 'AI Chatbot', // Changed title
    description: 'Engage with an AI assistant for medical information and queries', // Changed description
    icon: Brain, // Changed icon
    comingSoon: false // Changed comingSoon
  },
  {
    id: 7, // Re-sequenced ID
    title: 'Diagnosis Assistant', 
    description: 'Differential diagnosis tool based on symptoms', 
    icon: Stethoscope, 
    comingSoon: true
  },
  {
    id: 8,
    title: 'Vital Signs Tracker',
    description: 'Record and monitor patient vital signs',
    icon: HeartPulse,
    comingSoon: true
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
                 <CardDescription>{tool.description}</CardDescription>
               </CardHeader>
               <CardContent className="flex-grow">
                {/* Tool content will go here */}
              </CardContent>
              <CardFooter>
                {tool.id === 1 ? ( // Medical Calculator Link
                  <Link to="/tools/medical-calculator" className="w-full">
                    <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                  </Link>
                ) : tool.id === 2 ? ( // Drug Reference Link
                  <Link to="/tools/drug-reference" className="w-full">
                    <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                  </Link>
                ) : tool.id === 3 ? ( // Nutrition Database Link
                  <Link to="/tools/nutrition-database" className="w-full">
                    <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                  </Link>
                ) : tool.id === 4 ? ( // Disease Library Link
                  <Link to="/tools/disease-library" className="w-full">
                    <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                  </Link>
                ) : tool.id === 5 ? ( // Clinical Guidelines Link (Modified)
                   <Link to="/tools/clinical-guidelines" className="w-full">
                     <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                   </Link>
                 ) : tool.id === 6 ? ( // AI Chatbot Link
                   <Link to="/tools/ai-chatbot" className="w-full">
                     <Button className="w-full bg-medical-teal hover:bg-medical-blue">Launch Tool</Button>
                   </Link>
                 ) : ( // Default Button for other tools
                   <Button 
                     className="w-full bg-medical-teal hover:bg-medical-blue"
                     disabled={tool.comingSoon} // Keep disabled logic for other 'coming soon' tools
                   >
                     {tool.comingSoon ? 'Not Available Yet' : 'Launch Tool'}
                   </Button>
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
