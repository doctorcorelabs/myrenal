import { ArrowRight, Calculator, Pill, Apple, Library, FileText, Bot, Users, BookOpen } from 'lucide-react'; // Added more icons
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-medical-light to-white pt-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col order-2 md:order-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-medical-blue mb-4 animate-fade-in whitespace-nowrap"> {/* Reduced font size slightly, kept nowrap */}
              Daivan Febri Juan Setiya
            </h1>
            <p className="text-xl text-gray-600 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Medical Student | Researcher | Beasiswa Unggulan Awardee
            </p>
            <div className="h-1 w-32 bg-medical-teal mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}></div>
            <p className="text-gray-700 mb-8 leading-relaxed animate-slide-up text-justify" style={{ animationDelay: '0.4s' }}> {/* Added text-justify */}
              "A third year undergraduate student majoring in Medicine at Islamic University of Indonesia. 
              Deeply passionate about acquiring new knowledge and having diverse experiences. 
              Aiming to enhance the health standards in Indonesia, bring about sustainable change, 
              and create lasting positive impacts."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <Link 
                to="/about" 
                className="px-6 py-3 bg-medical-blue text-white rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                View Full Profile
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link 
                to="/contact" 
                className="px-6 py-3 border border-medical-blue text-medical-blue rounded-md hover:bg-medical-blue hover:text-white transition-all flex items-center justify-center"
              >
                Contact Me
              </Link>
            </div>
          </div>
          <div className="flex justify-center order-1 md:order-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img 
                src="/profile.jpg" 
                alt="Daivan Febri Juan Setiya" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">Key Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">Gold Medal - IIF & ISIF</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Gold Medal as 1st Author at the Invention and Innovation Fair (IIF) 2025 and International Science and Invention Fair (ISIF) 2024.
            </p>
          </div>
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">Beasiswa Unggulan Awardee</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Recipient of the prestigious scholarship "Beasiswa Unggulan" from the Ministry of Education, Culture, Research, and Technology.
            </p>
          </div>
          {/* Added transition and hover effect classes */}
          <div className="achievement-card animate-slide-up transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-xl font-semibold text-medical-blue mb-3 text-center">International Presentations</h3> {/* Added text-center */}
            <p className="text-gray-600 text-justify"> {/* Added text-justify */}
              Presented research at multiple international conferences including ENDO 2024 in Seoul, Korea and ICKSH 2024.
            </p>
          </div>
        </div>
      </div>

      {/* START: Medical Tools Preview Section */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-medical-blue mb-12">Explore Medical Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Tool Card 1: Medical Calculator */}
          <Link to="/tools/medical-calculator" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Calculator size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Medical Calculator</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Calculate BMI, BSA, GFR, and other important clinical values</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 2: Drug Reference */}
          <Link to="/tools/drug-reference" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Pill size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Drug Reference</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Access comprehensive drug information database</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 3: Nutrition Database */}
          <Link to="/tools/nutrition-database" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Apple size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Nutrition Database</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Explore nutritional information for various food items</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 4: Disease Library */}
          <Link to="/tools/disease-library" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Library size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Disease Library</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Comprehensive information on various conditions</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 5: Clinical Guidelines */}
          <Link to="/tools/clinical-guidelines" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <FileText size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Clinical Guidelines</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Access the latest medical practice guidelines</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 6: AI Chatbot */}
          <Link to="/tools/ai-chatbot" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Bot size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">AI Chatbot</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Engage with an AI assistant for medical information and queries</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 7: AI Peer-Review */}
          <Link to="/tools/ai-peer-review" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <Users size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">AI Peer-Review</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Get AI-powered feedback on your clinical notes or case studies</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>

          {/* Tool Card 8: Learning Resources */}
          <Link to="/tools/learning-resources" className="tool-card group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-medical-light text-medical-blue mb-4 group-hover:bg-medical-blue group-hover:text-white transition-colors">
              <BookOpen size={24} /> {/* Using lucide-react icon */}
            </div>
            <h3 className="text-lg font-semibold text-medical-blue mb-2">Learning Resources</h3>
            <p className="text-sm text-gray-600 mb-4 text-justify">Access curated educational materials and resources</p> {/* Added text-justify */}
            <span className="inline-flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-md group-hover:bg-opacity-90 transition-colors">
              Launch Tool
              <ArrowRight size={16} className="ml-2" />
            </span>
          </Link>
        </div>
        {/* Add the login message below the tool cards */}
        <p className="text-center font-bold text-lg text-[#0A2463] mt-4">Ready to explore? Login to access all tools.</p>
        {/* Removed the "View All Tools" button container as all tools are now displayed */}
      </div>
      {/* END: Medical Tools Preview Section */}
    </section>
  );
};

export default HeroSection;
