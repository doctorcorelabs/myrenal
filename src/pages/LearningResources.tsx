import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft icon

const resources = [
  {
    id: 'coursera',
    title: 'Coursera',
    description: 'Explore courses and specializations from top universities and companies.',
    path: '/tools/learning-resources/coursera',
  },
  {
    id: 'osmosis',
    title: 'Osmosis',
    description: 'Visual learning platform for medical students and professionals.',
    path: '/tools/learning-resources/osmosis',
  },
  {
    id: 'uptodate',
    title: 'UpToDate',
    description: 'Evidence-based clinical decision support resource.',
    path: '/tools/learning-resources/uptodate',
  },
  {
    id: 'other',
    title: 'Other Resources',
    description: 'A collection of various other learning materials and links.',
    path: '/tools/learning-resources/other',
  },
];

const LearningResources: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Learning Resources"
        subtitle="Curated educational materials and resources based on personal learning experiences"
      />
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Changed lg:grid-cols-3 to lg:grid-cols-2 for better balance with 4 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"> 
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col h-full transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Placeholder for potential future content within the card */}
              </CardContent>
              <CardFooter>
                <Link to={resource.path} className="w-full">
                  <Button className="w-full bg-medical-teal hover:bg-medical-blue">Explore</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Add Back to Tools button */}
        <div className="mt-12 text-center"> 
          <Link to="/tools">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LearningResources;
