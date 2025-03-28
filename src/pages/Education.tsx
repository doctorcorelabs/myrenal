
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Education = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pddiktiUrl = "https://pddikti.kemdiktisaintek.go.id/detail-mahasiswa/QYyTKiMeWKPJZpIV56w3sniQ4hab2Uo7LwOySSZd5tf6aRWf2ZTl2rgy15GvdA2Vu7yCRw==";

  return (
    <div>
      <PageHeader 
        title="Education" 
        subtitle="My academic journey and qualifications."
      />
      
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Added transition and hover classes */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <div className="bg-medical-blue text-white p-6">
              <h2 className="text-2xl font-bold">Islamic University of Indonesia</h2>
              <p className="text-lg mt-2">Undergraduate, Faculty of Medicine</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <p 
                        className="text-medical-teal font-medium cursor-pointer hover:underline"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Active Student (Third Year)
                      </p>
                    </DialogTrigger>
                    {/* Adjusted DialogContent styling and replaced iframe */}
                    <DialogContent className="max-w-3xl p-0 border-0 shadow-xl rounded-lg"> 
                      <DialogHeader className="p-4 bg-purple-600 rounded-t-lg"> 
                        <DialogTitle className="text-center text-white text-xl font-bold">Biodata Mahasiswa</DialogTitle>
                      </DialogHeader>
                      <div className="p-6 bg-white rounded-b-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          {/* Left Column */}
                          <div className="space-y-5">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Nama</p>
                              <p className="font-semibold text-gray-900">DAIVAN FEBRI JUAN SETIYA</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Jenis Kelamin</p>
                              <p className="font-semibold text-gray-900">Laki-laki</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">NIM</p>
                              <p className="font-semibold text-gray-900">22711009</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Status Awal Mahasiswa</p>
                              <p className="font-semibold text-gray-900">Peserta didik baru</p>
                            </div>
                          </div>
                          {/* Right Column */}
                          <div className="space-y-5">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Perguruan Tinggi</p>
                              <p className="font-semibold text-purple-700">Universitas Islam Indonesia</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Tanggal Masuk</p>
                              <p className="font-semibold text-gray-900">1 September 2022</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Jenjang - Program Studi</p>
                              <p className="font-semibold text-purple-700">Sarjana - Kedokteran</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Status Terakhir Mahasiswa</p>
                              <p className="font-semibold text-gray-900">Aktif-2024/2025 Ganjil</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Added text-center for mobile */}
                <div className="bg-medical-light rounded-lg px-6 py-3 text-center"> 
                  <h3 className="text-lg font-semibold text-gray-700">Current GPA</h3>
                  <p className="text-3xl font-bold text-medical-blue">3.91 <span className="text-lg font-normal">/4.00</span></p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Program Overview</h3>
                <p className="text-gray-600 mb-4 text-justify"> {/* Added text-justify */}
                  I am currently pursuing my medical degree at the Faculty of Medicine, Islamic University of Indonesia. The program provides comprehensive education in medical sciences, clinical practice, and research methodologies.
                </p>
                <p className="text-gray-600 mb-4 text-justify"> {/* Added text-justify */}
                  Throughout my studies, I have maintained excellent academic standing while actively participating in research projects and extracurricular activities related to medicine and healthcare.
                </p>
                <p className="text-gray-600 text-justify"> {/* Added text-justify */}
                  My education at the Islamic University of Indonesia has equipped me with a strong foundation in medical knowledge and has fostered my interest in contributing to healthcare improvements in Indonesia.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Key Coursework</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Medical Biochemistry
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Human Anatomy
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Physiology
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Pathology
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Pharmacology
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Microbiology
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Clinical Medicine
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-medical-teal rounded-full mr-2"></span>
                    Research Methodology
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Added transition and hover classes */}
          <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
            <h2 className="text-xl font-bold text-medical-blue mb-4">Previous Education</h2>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Senior High School of 1 Blora</h3>
              <p className="text-gray-600 italic mb-2">Graduation Year: 2021</p>
              <p className="text-gray-700 text-justify"> {/* Added text-justify */}
                Graduated as the 3rd Most Outstanding Student based on Final Student Examination.
              </p>
            </div>
            
            <div className="text-gray-700">
              <p className="text-justify"> {/* Added text-justify */}
                My educational journey has been characterized by consistent academic excellence and a growing passion for medicine and healthcare. From my early education to my current studies at the university level, I have maintained a strong commitment to learning and personal development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
