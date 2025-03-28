
import { Mail, Phone, Linkedin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const About = () => {
  return (
    <div>
      <PageHeader 
        title="About Me" 
        subtitle="Learn more about my background, interests, and aspirations."
      />
      
      <div className="container-custom">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-medical-blue mb-6">Background</h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
              I am a third-year undergraduate student majoring in Medicine at the Islamic University of Indonesia, currently maintaining a GPA of 3.91/4.00. My academic journey reflects my commitment to excellence and my passion for the medical field.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
              Throughout my studies, I have developed a deep interest in medical research, particularly in drug discovery and systematic reviews. My research endeavors have allowed me to contribute to scientific knowledge while honing my analytical and critical thinking skills.
            </p>
            
            <h2 className="text-2xl font-bold text-medical-blue mb-6 mt-12">Vision</h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
              I am deeply committed to improving healthcare standards in Indonesia. My vision encompasses implementing sustainable changes in the healthcare system that address critical needs and enhance accessibility to quality medical care for all Indonesians.
            </p>
            
            <p className="text-gray-700 mb-6 leading-relaxed text-justify"> {/* Added text-justify */}
              I believe that through diligent research, innovative approaches, and collaborative efforts, we can make significant strides in addressing the healthcare challenges facing our nation. My goal is to contribute meaningfully to this progress through my work as a medical professional and researcher.
            </p>
            
            <h2 className="text-2xl font-bold text-medical-blue mb-6 mt-12">Personal Philosophy</h2>
            {/* Added transition and hover classes */}
            <div className="bg-medical-light rounded-lg p-6 mb-12 border-l-4 border-medical-teal transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <p className="text-gray-700 italic text-justify"> {/* Added text-justify */}
                "I am deeply passionate about acquiring new knowledge and having diverse experiences. I aim to enhance health standards in Indonesia, bring about sustainable change, and create lasting positive impacts."
              </p>
            </div>
          </div>
          
          <div className="md:col-span-1">
            {/* Added transition and hover classes */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-medical-teal">
                  <img 
                    src="/profile.jpg" 
                    alt="Daivan Febri Juan Setiya" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-medical-blue mb-4 text-center">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail size={18} className="text-medical-teal mr-3" />
                  <a 
                    href="mailto:daivanfebrijuansetiya@gmail.com" 
                    className="text-gray-700 hover:text-medical-blue transition-colors"
                  >
                    daivanfebrijuansetiya@gmail.com
                  </a>
                </div>
                
                {/* Removed phone number div */}
                
                <div className="flex items-center">
                  <Linkedin size={18} className="text-medical-teal mr-3" />
                  <a 
                    href="https://www.linkedin.com/in/daivan-febri-juan-setiya-118560236/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-medical-blue transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                </div>
                
                <div className="pt-2 text-gray-700">
                  <p className="font-medium">Location:</p>
                  <p>Ngaglik, Sleman, DIY, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
