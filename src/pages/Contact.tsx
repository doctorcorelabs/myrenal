
import { useState } from 'react';
import { Mail, Phone, Linkedin, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { toast } from '../components/ui/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    // For now, we'll just show a success toast
    toast({
      title: "Message Sent",
      description: "Thank you for your message. I'll get back to you soon!",
      duration: 5000,
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  return (
    <div>
      <PageHeader 
        title="Contact Me" 
        subtitle="Get in touch for collaborations, questions, or just to say hello."
      />
      
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-medical-blue mb-6">Contact Information</h2>
              <p className="text-gray-700 mb-8 text-justify"> {/* Added text-justify */}
                Feel free to reach out to me through any of the following channels. I'm always open to 
                discussing potential collaborations, research opportunities, or answering any questions 
                you might have.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-medical-teal flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Email</h3>
                    <a 
                      href="mailto:daivanfebrijuansetiya@gmail.com" 
                      className="text-medical-blue hover:underline"
                    >
                      daivanfebrijuansetiya@gmail.com
                    </a>
                  </div>
                </div>
                
                {/* Removed Phone section */}
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-medical-teal flex items-center justify-center mr-4 flex-shrink-0">
                    <Linkedin className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">LinkedIn</h3>
                    <a 
                      href="https://www.linkedin.com/in/daivan-febri-juan-setiya-118560236/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-medical-blue hover:underline"
                    >
                      Daivan Febri Juan Setiya
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-medical-teal flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Location</h3>
                    <p className="text-gray-700">Ngaglik, Sleman, DIY, Indonesia</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 bg-medical-light p-6 rounded-lg">
                <h3 className="text-xl font-bold text-medical-blue mb-3">Connect for Collaboration</h3>
                <p className="text-gray-700 text-justify"> {/* Added text-justify */}
                  I'm particularly interested in collaborating on research projects related to drug discovery, 
                  systematic reviews, and public health initiatives aimed at improving healthcare in Indonesia.
                </p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-medical-blue mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-teal"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-teal"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-teal"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={6} 
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-teal"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="px-6 py-3 bg-medical-blue text-white rounded-md hover:bg-opacity-90 transition-all font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
