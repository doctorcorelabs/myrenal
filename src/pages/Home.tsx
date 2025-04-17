import React from 'react';
import ExploreGemini from './ExploreGemini'; // Import the component we want to display
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    // Removed relative positioning and flex-col as ExploreGemini likely handles its own layout
    <div className="h-full">
      {/* Render ExploreGemini and pass the authentication status */}
      {/* Removed the wrapper div with conditional styling */}
      <ExploreGemini isAuthenticated={isAuthenticated} />
      {/* Removed the overlay div */}
    </div>
  );
};

export default Home;
