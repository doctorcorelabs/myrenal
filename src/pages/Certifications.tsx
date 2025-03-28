
import PageHeader from '../components/PageHeader';

const Certifications = () => {
  const certifications = {
    "World Health Organization (WHO)": [
      "Antimicrobial Resistance and Infection Prevention and Control",
      "Inequality Monitoring in Sexual Reproductive, Maternal, Newborn, Child, and Adolescent Health"
    ],
    "United Nations Institute for Training and Research (UNITAR)": [
      "Gender Equality and Human Rights in Climate Action and Renewable Energy"
    ],
    "Coursera": [
      {
        course: "Chemicals and Health",
        institution: "The Johns Hopkins University"
      },
      {
        course: "Stanford Introduction to Food and Health",
        institution: "Stanford University"
      },
      {
        course: "Science of Exercise",
        institution: "University of Colorado Boulder"
      },
      {
        course: "Introduction to Psychology",
        institution: "Yale University"
      },
      {
        course: "Psychological First Aid",
        institution: "The Johns Hopkins University"
      },
      {
        course: "Leading Healthcare Quality and Safety",
        institution: "The George Washington University"
      },
      {
        course: "Case Studies in Personalized Medicine",
        institution: "Vanderbilt University"
      },
      {
        course: "Understanding the Brain: The Neurobiology of Everyday Life",
        institution: "The University Of Chicago (Northshore)"
      },
      {
        course: "COVID-19 Contact Tracing",
        institution: "The Johns Hopkins University"
      },
      {
        course: "Medical Technology and Evaluation",
        institution: "University of Minnesota"
      },
      {
        course: "Drug Discovery",
        institution: "University of California, San Diego - School of Medicine"
      },
      {
        course: "Drug Development",
        institution: "University of California, San Diego - School of Medicine"
      },
      {
        course: "Drug Commercialization",
        institution: "University of California, San Diego - School of Medicine"
      },
      {
        course: "Healthcare Marketplace",
        institution: "University of Minnesota"
      },
      {
        course: "A Guide to Healthcare Innovation: Principles and Practice",
        institution: "Imperial College London"
      },
      {
        course: "Speaking to Persuade: Motivating Audiences with Solid Arguments and Moving Language",
        institution: "University of Washington"
      },
      {
        course: "Drug Development Product Management Specialization",
        institution: "University of California, San Diego - School of Medicine"
      }
    ]
  };

  return (
    <div>
      <PageHeader 
        title="Certifications" 
        subtitle="Professional development and continuous learning."
      />
      
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <p className="text-lg text-gray-700 mb-12 text-justify"> {/* Added text-justify */}
            I am committed to continuous learning and professional development. The certifications listed below 
            represent my efforts to expand my knowledge in various areas related to medicine, healthcare, 
            research, and personal development.
          </p>
          
          {/* WHO Certifications */}
          <section className="mb-16">
            <h2 className="section-title flex items-center">
              <img src="/who.png" alt="WHO Logo" className="w-8 h-8 mr-3" /> {/* Updated image src */}
              World Health Organization (WHO)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications["World Health Organization (WHO)"].map((cert, index) => (
                <div 
                  key={index} 
                  // Added transition and hover classes
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-l-4 border-blue-600" 
                >
                  <h3 className="text-lg font-semibold text-gray-800 text-justify">{cert}</h3> {/* Added text-justify */}
                  <p className="text-blue-600 mt-2 font-medium text-justify">World Health Organization</p> {/* Added text-justify */}
                </div>
              ))}
            </div>
          </section>
          
          {/* UNITAR Certifications */}
          <section className="mb-16">
            <h2 className="section-title flex items-center">
              <img src="/unitar.jpg" alt="UNITAR Logo" className="w-8 h-8 mr-3" /> {/* Corrected image extension to .jpg */}
              United Nations Institute for Training and Research (UNITAR)
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {certifications["United Nations Institute for Training and Research (UNITAR)"].map((cert, index) => (
                <div 
                  key={index} 
                  // Added transition and hover classes
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-l-4 border-blue-800" 
                >
                  <h3 className="text-lg font-semibold text-gray-800 text-justify">{cert}</h3> {/* Added text-justify */}
                  <p className="text-blue-800 mt-2 font-medium text-justify">United Nations Institute for Training and Research</p> {/* Added text-justify */}
                </div>
              ))}
            </div>
          </section>
          
          {/* Coursera Certifications */}
          <section className="mb-16">
            <h2 className="section-title flex items-center">
              <img src="/coursera.png" alt="Coursera Logo" className="w-8 h-8 mr-3" /> {/* Updated image src */}
              Coursera
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Group Coursera certifications by institution */}
              {Object.entries(
                certifications["Coursera"].reduce((acc, cert) => {
                  if (!acc[cert.institution]) {
                    acc[cert.institution] = [];
                  }
                  acc[cert.institution].push(cert.course);
                  return acc;
                }, {} as Record<string, string[]>)
              ).map(([institution, courses], index) => (
                // Added transition and hover classes
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"> 
                  <div className="bg-medical-blue text-white p-4">
                    <h3 className="text-lg font-semibold">{institution}</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {courses.map((course, courseIndex) => (
                        <li key={courseIndex} className="flex items-start">
                          <span className="text-medical-teal mr-2">✓</span>
                          <span className="text-gray-700 text-justify">{course}</span> {/* Added text-justify */}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Added transition and hover classes */}
          <div className="bg-medical-light rounded-lg p-8 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"> 
            <h2 className="text-2xl font-bold text-medical-blue mb-4">Continuous Learning Journey</h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              These certifications represent my commitment to lifelong learning and professional development. 
              I continuously seek opportunities to expand my knowledge and skills to become a better healthcare 
              professional and researcher.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certifications;
