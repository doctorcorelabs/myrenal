
import PageHeader from '../components/PageHeader';

const Research = () => {
  const researchProjects = [
    {
      title: "Drug Discovery In Silico Study Kapulaga on Breast Cancer",
      role: "Research Team Member / Research Collaborator",
      description: "An in silico study examining the potential of Kapulaga (cardamom) compounds as anticancer agents for breast cancer treatment."
    },
    {
      title: "Drug Discovery In Silico Study Tuberculosis",
      role: "Research Team Member / Research Collaborator",
      description: "Computational drug discovery research focusing on identifying potential compounds for tuberculosis treatment."
    },
    {
      title: "Dietary Impacts in Women with PCOS",
      role: "Head of Research",
      description: "A review research project examining the effects of different dietary patterns on women with Polycystic Ovary Syndrome (PCOS)."
    },
    {
      title: "Bisphenol A in canned and plastic food/beverage",
      role: "Research Team Member",
      description: "A systematic review funded by the Faculty of Medicine, Universitas Islam Indonesia, led by dr. Eko Andriyanto M.Sc."
    },
    {
      title: "Bisphenol A on cancers",
      role: "Research Team Member",
      description: "A systematic review on the relationship between Bisphenol A exposure and cancer development, led by dr. Kuswati and funded by the Faculty of Medicine, Universitas Islam Indonesia."
    }
  ];

  const publications = [
    {
      title: "Peran Microbiome Gut Axis Dalam Perkembangan Dan Kekambuhan Chronic Myeloid Leukemia: Systematic Review",
      type: "Systematic Review",
      venue: "Indonesian Publication (Full text)"
    },
    {
      title: "A Comparative Analysis Of Colonoscopy With Computer-Aided Detection And Standard Colonoscopy In The Detection Of Colorectal Adenomas And Polyps: A Systematic Review",
      type: "Systematic Review",
      venue: "International Publication (Abstract)"
    },
    {
      title: "The role of the microbiome gut axis in the development and relapse of chronic myeloid leukemia: Systematic review",
      type: "Systematic Review",
      venue: "International Publication (Abstract)"
    },
    {
      title: "The Significant Roles of The Renin-Angiotensin-Aldosterone System Metabolism on the Development of Hypertension",
      type: "Narrative Review",
      venue: "International Publication (Abstract)"
    }
  ];

  const presentations = [
    {
      title: "ePoster Presentation - 4th World Congress of GI Endoscopy-Korean Society of Gastrointestinal Endoscopy (ENDO 2024)",
      role: "1st Author",
      venue: "COEX Convention & Exhibition Center",
      date: "July 4-6, 2024"
    },
    {
      title: "Poster Presenter - 2024 Korean Society of Hematology International Conference and 65th Annual Meeting (ICKSH 2024)",
      role: "1st Author",
      venue: "The Grand Walkerhill Seoul",
      date: "March 28-30, 2024"
    },
    {
      title: "Oral Presentation - The 1st International Conference Muhammadiyah Yogyakarta-Hospital & Healthcare Management 2024",
      role: "1st Author",
      venue: "Universitas Muhammadiyah Yogyakarta",
      date: "May 11, 2024"
    },
    {
      title: "Poster Presenter - 31st International Student Congress Of (bio)Medical Sciences (ISCOMS 2024)",
      role: "Co-Author",
      venue: " the University Medical Centre Groningen",
      date: "2024"
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Research & Publications" 
        subtitle="My contributions to scientific knowledge and research."
      />
      
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <p className="text-lg text-gray-700 mb-12 text-justify"> {/* Added text-justify */}
            My research interests include drug discovery, systematic reviews of medical treatments and substances,
            and exploring the connections between dietary factors and health conditions. Below is a summary of my
            research involvements, publications, and scientific presentations.
          </p>
          
          {/* Research Projects Section */}
          <section className="mb-16">
            <h2 className="section-title">Research Projects & Collaborations</h2>
            <div className="space-y-6">
              {researchProjects.map((project, index) => (
                <div 
                  key={index} 
                  // Added transition and hover classes
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl" 
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-medical-blue">{project.title}</h3>
                    <span className="bg-medical-light text-medical-blue px-4 py-1 rounded-full text-sm font-medium mt-2 md:mt-0">
                      {project.role}
                    </span>
                  </div>
                  <p className="text-gray-700 text-justify">{project.description}</p> {/* Added text-justify */}
                </div>
              ))}
            </div>
          </section>
          
          {/* Publications Section */}
          <section className="mb-16">
            <h2 className="section-title">Publications</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                <thead className="bg-medical-blue text-white">
                  <tr><th className="py-3 px-4 text-center">Title</th><th className="py-3 px-4 text-center">Type</th><th className="py-3 px-4 text-center">Publication Venue</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {publications.map((pub, index) => (
                    <tr key={index} className="hover:bg-gray-50"><td className="py-4 px-4 text-medical-blue font-medium text-justify">{pub.title}</td><td className="py-4 px-4 text-gray-700 text-justify">{pub.type}</td><td className="py-4 px-4 text-gray-700 text-justify">{pub.venue}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          {/* Presentations Section */}
          <section className="mb-16">
            <h2 className="section-title">Scientific Presentations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {presentations.map((presentation, index) => (
                <div 
                  key={index} 
                  // Added transition and hover classes
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-t-4 border-medical-teal" 
                >
                  <h3 className="text-xl font-semibold text-medical-blue mb-2 text-justify">{presentation.title}</h3> {/* Added text-justify */}
                  <p className="text-gray-700 mb-3 text-justify"> {/* Added text-justify */}
                    <span className="font-medium">Role:</span> {presentation.role}
                  </p>
                  <p className="text-gray-700 mb-3 text-justify"> {/* Added text-justify */}
                    <span className="font-medium">Venue:</span> {presentation.venue}
                  </p>
                  <p className="text-gray-700 text-justify"> {/* Added text-justify */}
                    <span className="font-medium">Date:</span> {presentation.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Research Interests Section */}
          <section>
            <h2 className="section-title">Research Interests</h2>
            {/* Added transition and hover classes */}
            <div className="bg-medical-light rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
              <div className="text-center p-4">
                <div className="h-20 w-20 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-medical-blue">In Silico - Drug Discovery</h3>
                <p className="text-gray-700 mt-2">Computational approaches to identify potential therapeutic compounds.</p>
              </div>
              
              <div className="text-center p-4">
                <div className="h-20 w-20 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-medical-blue">Systematic Reviews</h3>
                <p className="text-gray-700 mt-2">Comprehensive analysis of existing research on medical topics.</p>
              </div>
              
              <div className="text-center p-4">
                <div className="h-20 w-20 bg-medical-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-medical-blue">Nutrition & Health</h3>
                <p className="text-gray-700 mt-2">Exploring the relationship between dietary factors and health conditions.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Research;
