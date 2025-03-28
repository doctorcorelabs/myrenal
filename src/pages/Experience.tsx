import PageHeader from '../components/PageHeader';

const Experience = () => {
  // New data structure with nested subItems and descriptions
  const experiences = [
    {
      organization: "Ministry of Education, Culture, Research, and Technology",
      role: "Awardee Beasiswa Unggulan",
      dateRange: "Oct 2023 - Present",
      description: "Recipient of the prestigious scholarship \"Beasiswa Unggulan\" awarded by the Indonesian Ministry of Education, Culture, Research, and Technology for outstanding academic potential and achievement.",
      startYear: 2023,
    },
    {
      organization: "KampusInovatif.id",
      role: "Speaker & Mentor Beasiswa Unggulan",
      dateRange: "Sep 2024 - Feb 2025",
      description: "Served as a speaker and mentor through the KampusInovatif.id platform, sharing insights and guidance on successfully applying for the Beasiswa Unggulan scholarship.",
      startYear: 2024,
    },
    {
      organization: "Scientific Medical Activities of Research and Technology (SMART FK UII)",
      role: "Active Member & Contributor", // Main role/summary
      dateRange: "July 2023 - Jun 2024",
      description: "Actively involved in SMART FK UII, the student organization within the Faculty of Medicine focused on promoting research, scientific activities, and technology among medical students.",
      startYear: 2023,
      subItems: [
        { title: "Scientific Division", date: "July 2023 - Jun 2024", description: "Contributed to the Scientific Division, focusing on developing and executing research-oriented programs and academic events." },
        { title: "SMART Of The Year - Best Staff (Scientific Category)", date: "Dec 2023", description: "Recognized with the \"SMART Of The Year\" award for outstanding dedication and contribution to the organization's scientific activities." },
        { title: "Committee (Event Coordinator) - Scientific Fair 1 & 2", date: "Aug 2023 - Dec 2023", description: "Acted as an event coordinator, managing logistical and organizational aspects of these academic events." },
        { title: "Moderator Lab Class 2023", date: "Nov 2023", description: "Facilitated learning sessions, guiding discussions and ensuring productive interactions among participants." },
        { title: "Liaison Officer - Temilnas X Intermedisco 2023", date: "Aug 2023", description: "Served as a Liaison Officer, responsible for communication and coordination with assigned delegations." }
      ]
    },
    {
      organization: "BAPIN-ISMKI",
      role: "Coordinator & Administrator", // Main role/summary
      dateRange: "Feb 2023 - May 2024",
      description: "Engaged with BAPIN-ISMKI, the Assisting Body for the National Presidium of the Indonesian Medical Students' Executive Boards' Association (ISMKI).",
      startYear: 2023,
      subItems: [
        { title: "Coordinator \"Jas Merah\"", date: "Feb 2023 - May 2024", description: "Led the \"Jas Merah\" initiative, coordinating activities related to organizational identity or specific campaigns." },
        { title: "National Daily Administrator - Internal Division", date: "Feb 2023 - Jul 2023", description: "Managed daily administrative tasks and internal communications for the Internal Division." },
        { title: "Moderator - \"Upgrading BAPIN-ISMKI: Systematic Review...\"", date: "N/A", description: "Moderated an internal training session focused on systematic review methodologies." },
        { title: "Staff Internal Division - IMSS 2023", date: "N/A", description: "Supported the operations of the BAPIN-ISMKI Internal Division during the Indonesian Medical Student Summit (IMSS) 2023." }
      ]
    },
    {
      organization: "Seni.Bicara",
      role: "Speaker/Presenter - Public Speaking Education",
      dateRange: "Feb 2023 - Jun 2023",
      description: "Delivered educational content and presentations on public speaking techniques as part of the program offered by Seni.Bicara.",
      startYear: 2023,
    },
    {
      organization: "Universitas Islam Indonesia",
      role: "Master of Ceremony",
      dateRange: "2023",
      description: "Served as the Master of Ceremony for the 16th General Assembly (\"Sidang Umum XVI\") of the Student Family of the Faculty of Medicine UII, guiding the formal proceedings of the event.",
      startYear: 2023,
    },
    {
      organization: "Blora Regency Government Event",
      role: "Guest Speaker",
      dateRange: "2021",
      description: "Invited as a guest speaker for \"Ngobrol Bareng Bupati,\" a dialogue event featuring the Regent of Blora Regency and local social media influencers/activists.",
      startYear: 2021,
    }
  ];

  // Group experiences by start year (most recent first)
  const years = Array.from(new Set(experiences.map(exp => exp.startYear))).sort((a, b) => b - a);

  return (
    <div>
      <PageHeader 
        title="Experience" 
        subtitle="My professional and extracurricular involvement."
      />
      
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <p className="text-lg text-gray-700 mb-12 text-justify"> {/* Added text-justify */}
            Throughout my academic journey, I have actively participated in various activities and organizations 
            that have enriched my experience and allowed me to develop valuable skills beyond the classroom. 
            These experiences have been instrumental in shaping my professional identity and expanding my network 
            in the medical field.
          </p>
          
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-medical-teal transform md:translate-x-px hidden md:block" style={{ height: 'calc(100% - 4rem)' }}></div>
            
            <div className="space-y-12">
              {years.map((year) => (
                <div key={year} className="mb-12">
                  {/* Year Marker */}
                  <div className="flex justify-center mb-8 relative">
                     {/* Dot for year marker */}
                    <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 rounded-full bg-medical-blue border-4 border-white shadow-md"></div>
                    </div>
                    <div className="bg-medical-blue text-white px-6 py-1 rounded-full font-bold text-md z-10">
                      {year}
                    </div>
                  </div>
                  
                  <div className="space-y-12">
                    {experiences
                      .filter(exp => exp.startYear === year)
                      .map((exp, index) => (
                        <div key={index} className="relative">
                          {/* Timeline dot for item - visible on md screens and above */}
                          <div className="hidden md:block absolute left-1/2 top-4 transform -translate-x-1/2">
                            <div className="w-4 h-4 rounded-full bg-medical-teal border-2 border-white shadow"></div>
                          </div>
                          
                          {/* Card Content */}
                          <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:mr-auto' : 'md:pl-8 md:ml-auto'}`}>
                            {/* Added hover animation classes */}
                            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border border-gray-200">
                              <p className="text-sm text-gray-500 mb-2">{exp.dateRange}</p>
                              <h3 className="text-xl font-semibold text-medical-blue mb-1">{exp.role}</h3>
                              <p className="text-medical-teal font-medium mb-3">{exp.organization}</p>
                              <p className="text-gray-700 text-justify">{exp.description}</p> {/* Justified description */}
                              
                              {/* Render sub-items if they exist */}
                              {exp.subItems && exp.subItems.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h4 className="text-md font-semibold text-gray-800 mb-3">Key Roles/Activities:</h4>
                                  <ul className="space-y-3 pl-4 list-disc list-outside">
                                    {exp.subItems.map((subItem, subIndex) => (
                                      <li key={subIndex} className="text-sm">
                                        <span className="font-semibold">{subItem.title}</span> 
                                        {subItem.date !== 'N/A' && <span className="text-gray-500 text-xs ml-1">({subItem.date})</span>}
                                        <p className="text-gray-600 text-justify mt-1">{subItem.description}</p> {/* Justified sub-item description */}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills Developed Section (Kept as is) */}
          <div className="bg-medical-light rounded-lg p-8 mt-20">
            <h2 className="text-2xl font-bold text-medical-blue mb-4 text-center">Skills Developed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {["Public Speaking", "Leadership", "Research Methodology", "Event Management", "Scientific Writing", "Team Collaboration", "Moderating", "Administration"].map(skill => (
                 // Added transition and hover classes
                 <div key={skill} className="bg-white rounded-lg p-3 text-center shadow transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                   <h3 className="font-medium text-medical-blue text-sm">{skill}</h3>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
