 import PageHeader from '@/components/PageHeader';
 import { Button } from '@/components/ui/button';
 import { Link } from 'react-router-dom';
 import { ArrowLeft } from 'lucide-react';
 
 const AIChatbot = () => {
  return (
    <>
      <PageHeader 
        title="AI Chatbot" 
         subtitle="Engage with an AI assistant for medical information and queries" 
       />
       {/* Make this container grow and use flexbox for the iframe */}
       <div className="container max-w-7xl mx-auto px-4 flex flex-col flex-grow"> 
         {/* Embed the chatbot iframe */}
         <iframe
           className="flex-grow mt-4" // Make iframe grow and add top margin
           src="https://udify.app/chatbot/75qYJluLWB08Iupl"
           style={{ width: '100%', border: 'none', minHeight: '700px' }} // Removed fixed height, keep minHeight
            allow="microphone">
          </iframe>
 
          {/* Back to Tools Button */}
          <div className="flex justify-center mt-8 mb-4"> {/* Added mb-4 for spacing above footer */}
            <Link to="/tools">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Tools
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
};

export default AIChatbot;
