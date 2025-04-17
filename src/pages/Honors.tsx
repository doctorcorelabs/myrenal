import PageHeader from '../components/PageHeader';

const Honors = () => {
  const awards = [
    {
      title: "Silver Medal - 1st Author - Jakarta International Science Fair 2025",
      category: "Competition",
      description: "Awarded silver medal for research presented at the Jakarta International Science Fair 2025, issued by Indonesian Young Scientist Association (IYSA)."
    },
    {
      title: "Gold Medal & Special Award - 1st Author - Invention and Innovation Fair (IIF) 2025",
      category: "Competition",
      description: "Received gold medal and special award recognition for research presented at the Invention and Innovation Fair (IIF) 2025."
    },
    {
      title: "Gold Medal - 1st Author - International Science and Invention Fair (ISIF) 2024",
      category: "Competition",
      description: "Awarded gold medal for innovative research at the International Science and Invention Fair (ISIF) 2024."
    },
    {
      title: "Awardee Beasiswa Unggulan 2023",
      category: "Scholarship",
      description: "Recipient of the prestigious scholarship \"Beasiswa Unggulan\" from the Ministry of Education, Culture, Research, and Technology." // Updated text
    },
    {
      title: "Co-Author - 31st International Student Congress Of (bio)Medical Sciences (ISCOMS 2024)",
      category: "Research",
      description: "Contributed as co-author to research presented at the 31st International Student Congress Of (bio)Medical Sciences."
    },
    {
      title: "1st Author - ePoster Presentation - ENDO 2024",
      category: "Research",
      description: "Presented research as first author at ENDO 2024 - 4th World Congress of GI Endoscopy in Seoul, Korea."
    },
    {
      title: "1st Author - Poster Presenter - 2024 Korean Society of Hematology International Conference",
      category: "Research",
      description: "Presented research as first author at the 2024 Korean Society of Hematology International Conference and 65th Annual Meeting (ICKSH 2024)."
    },
    {
      title: "1st Author - Oral Presentation - The 1st International Conference MYHAM 2024",
      category: "Research",
      description: "Delivered an oral presentation as first author at The 1st International Conference MYHAM 2024 (Muhammadiyah Yogyakarta - Hospital & Healthcare Management)."
    },
    {
      title: "Representative - Faculty of Medicine",
      category: "Recognition",
      description: "Selected as the representative of the Faculty of Medicine in the university-level selection event for outstanding students at the Islamic University of Indonesia 2024."
    },
    {
      title: "1st Place Scientific Essay - Scientific Fair SMART FK UII 2023",
      category: "Competition",
      description: "Awarded first place for scientific essay at the Scientific Fair SMART FK UII 2023."
    },
    {
      title: "Bronze Medal - Innovation And Research Poster Competition (IRPOCO) 2023",
      category: "Competition",
      description: "Received bronze medal recognition at the Innovation And Research Poster Competition (IRPOCO) 2023 – International Scale."
    },
    {
      title: "2nd Winner National Essay - RJJ Undiksha 2023",
      category: "Competition",
      description: "Achieved second place in the National Essay competition - RJJ Undiksha 2023."
    },
    {
      title: "Best Paper National Essay - \"Pekan Esai Nasional Akademik 2 (PENA)\"",
      category: "Competition",
      description: "Recognized for the best paper in the National Essay competition \"Pekan Esai Nasional Akademik 2 (PENA)\"."
    },
    {
      title: "3rd Most Outstanding Student - Senior Highschool of 1 Blora",
      category: "Recognition",
      description: "Ranked as the 3rd Most Outstanding Student based on Final Student Examination at Senior Highschool of 1 Blora."
    }
  ];

  // Group awards by category
  const groupedAwards = awards.reduce((acc, award) => {
    if (!acc[award.category]) {
      acc[award.category] = [];
    }
    acc[award.category].push(award);
    return acc;
  }, {} as Record<string, typeof awards>);

  // Order categories
  const categoryOrder = ["Competition", "Scholarship", "Research", "Recognition"];
  const sortedCategories = categoryOrder.filter(cat => groupedAwards[cat]);

  return (
    <div>
      <PageHeader 
        title="Honors & Awards" 
        subtitle="Recognition of academic excellence and achievement."
      />
      
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-700 mb-12 text-lg text-justify"> {/* Added text-justify */}
            Throughout my academic journey, I have been fortunate to receive recognition for my work in various areas, 
            including research, competitions, and scholarships. These honors reflect my commitment to excellence and 
            continuous learning in the field of medicine and healthcare.
          </p>
          
          {sortedCategories.map((category) => (
            <div key={category} className="mb-16">
              <h2 className="text-2xl font-bold text-medical-blue mb-8 flex items-center">
                <div className="w-8 h-1 bg-medical-teal mr-3"></div>
                {category}
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {groupedAwards[category].map((award, index) => (
                  <div 
                    key={index} 
                    // Added transition-all, duration, ease, hover:scale, and updated hover:shadow
                    className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border-l-4 border-medical-teal" 
                  >
                    <h3 className="text-xl font-semibold text-medical-blue mb-2">{award.title}</h3>
                    <p className="text-gray-600 text-justify">{award.description}</p> {/* Added text-justify */}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Added transition and hover classes */}
          <div className="bg-medical-light rounded-lg p-8 mt-12 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <h2 className="text-2xl font-bold text-medical-blue mb-4">Continuous Achievement</h2>
            <p className="text-gray-700 text-justify"> {/* Added text-justify */}
              These honors and awards represent milestones in my ongoing journey of growth and learning. I am committed 
              to continuing this path of excellence and making meaningful contributions to the field of medicine and 
              healthcare in Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Honors;
