import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Bot, BrainCircuit, Library, Pill, Calculator, Link as LinkIcon, Stethoscope, Microscope, BookOpen, Cpu, Database } from 'lucide-react'; // Added Cpu and Database icons

// Define tool structure for easier mapping
const tools = [
  { name: 'Nutrition Database', path: '/tools/nutrition-database', icon: Database, description: 'Explore detailed nutritional information.' }, // Replaced Explore Gemini
  { name: 'Mind Map Maker', path: '/tools/ai-mindmap-generator', icon: BrainCircuit, description: 'Visualize concepts with AI-powered mind maps.' }, // Corrected path
  { name: 'Disease Library', path: '/tools/disease-library', icon: Stethoscope, description: 'Access comprehensive disease information.' },
  { name: 'Drug Reference', path: '/tools/drug-reference', icon: Pill, description: 'Look up drug details and interactions.' },
  { name: 'Clinical Scoring', path: '/tools/clinical-scoring-hub', icon: Calculator, description: 'Calculate various clinical scores.' },
  { name: 'Interaction Checker', path: '/tools/interaction-checker', icon: LinkIcon, description: 'Check for drug interactions.' },
  { name: 'Learning Resources', path: '/tools/learning-resources', icon: BookOpen, description: 'Access curated medical learning materials.' },
  { name: 'AI Peer Review', path: '/tools/ai-peer-review', icon: Microscope, description: 'Get AI feedback on medical texts.' },
  // Note: Explore DeepSeek is featured, not listed here, but its route is /tools/explore-deepseek
];

const Home = () => {
  const { isAuthenticated, user } = useAuth(); // Assuming user object might have name

  // Determine the welcome message
  const welcomeMessage = isAuthenticated && user?.email
    ? `Welcome back, ${user.email}!` // Placeholder, adjust if user name is available
    : "Welcome to NucleAI!";

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Welcome Message */}
      <h1 className="text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
      <p className="text-muted-foreground text-justify">Your AI-powered medical assistant. Access tools and resources below.</p> {/* Added text-justify */}

      {/* Featured Tools Section */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Featured Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feature 1: Explore Gemini */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                Explore Gemini
              </CardTitle>
              <CardDescription>Chat with our advanced AI assistant for medical queries, summaries, and more.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tools/explore-gemini"> {/* Added /tools/ prefix */}
                <Button>Launch Gemini</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Feature 2: Explore DeepSeek */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-6 w-6" /> {/* Changed icon */}
                Explore DeepSeek
              </CardTitle>
              <CardDescription>Interact with the DeepSeek AI for alternative perspectives.</CardDescription> {/* Changed description */}
            </CardHeader>
            <CardContent>
              <Link to="/tools/explore-deepseek"> {/* Added /tools/ prefix */}
                <Button>Launch DeepSeek</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Access Section */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link to={tool.path} key={tool.path} className="block group">
              <Card className="h-full hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <tool.icon className="h-5 w-5 text-primary" />
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-justify">{tool.description}</CardDescription> {/* Added text-justify */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
