import { Mail, Linkedin, MapPin } from 'lucide-react'; // Removed unused imports
import PageHeader from '../components/PageHeader';
// Removed unused imports: toast, Button, Input, Textarea, Label, useState, Loader2

const Contact = () => {
  // Removed unused state and handlers: formData, isLoading, handleChange, handleSubmit

  return (
    <div>
      <PageHeader
        title="Contact Me"
        subtitle="Get in touch for collaborations, questions, or just to say hello."
      />

      <div className="container-custom">
        {/* Adjusted max-width and removed grid for single column layout */}
        <div className="max-w-3xl mx-auto">
          {/* Removed outer grid div */}
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
                      href="mailto:research@daivanlabs.com"
                      className="text-medical-blue hover:underline break-all" // Added break-all
                    >
                      research@daivanlabs.com
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
            {/* Removed the entire Contact Form section */}
        </div>
      </div>
    </div>
  );
};

export default Contact;
