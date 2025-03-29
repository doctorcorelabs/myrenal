
import { Mail, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-medical-blue text-white py-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Daivan Febri Juan Setiya</h3>
            <p className="text-gray-300 mb-4 italic">Experientia docet.</p> {/* Changed text and added italic class */}
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              {/* Removed Home link */}
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
              <li><Link to="/education" className="text-gray-300 hover:text-white transition-colors">Education</Link></li>
              <li><Link to="/honors" className="text-gray-300 hover:text-white transition-colors">Honors & Awards</Link></li>
              <li><Link to="/research" className="text-gray-300 hover:text-white transition-colors">Research</Link></li>
              <li><Link to="/experience" className="text-gray-300 hover:text-white transition-colors">Experience</Link></li> {/* Added Experience link */}
              <li><Link to="/certifications" className="text-gray-300 hover:text-white transition-colors">Certifications</Link></li> {/* Added Certifications link */}
              <li><Link to="/tools" className="text-gray-300 hover:text-white transition-colors">Tools</Link></li> {/* Added Tools link */}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Contact</h3>
             <div className="space-y-3">
               <p className="flex items-center">
                 <Mail size={16} className="mr-2" />
                 <a href="mailto:research@daivanlabs.com" className="text-gray-300 hover:text-white transition-colors">
                   research@daivanlabs.com
                 </a>
               </p>
              {/* Removed phone number paragraph */}
              <p className="flex items-center">
                <Linkedin size={16} className="mr-2" />
                <a 
                  href="https://www.linkedin.com/in/daivan-febri-juan-setiya-118560236/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  LinkedIn Profile
                </a>
              </p>
              <p className="text-gray-300">
                Ngaglik, Sleman, DIY, Indonesia
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          <p>© {currentYear} Daivan Febri Juan Setiya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
