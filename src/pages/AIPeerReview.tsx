import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AIPeerReview = () => {
  return (
    <>
      <PageHeader 
        title="AI Peer-Review" 
        subtitle="Get AI-powered feedback on your clinical notes or case studies" 
      />
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <iframe
          src="https://udify.app/chatbot/8SCgHRUgX4NWc7YJ"
          style={{ width: '100%', height: '100%', minHeight: '700px' }}
          frameBorder="0"
          allow="microphone">
        </iframe>
      </div>
      {/* Add Back to Tools button */}
      <div className="container max-w-7xl mx-auto px-4 pb-12 text-center"> {/* Added pb-12 for spacing and text-center */}
        <Link to="/tools">
          <Button variant="outline" className="inline-flex items-center gap-2"> {/* Use inline-flex for button content alignment */}
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </Link>
      </div>
    </>
  );
};

export default AIPeerReview;
