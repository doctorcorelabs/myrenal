
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    // Adjusted vertical padding for responsiveness
    <div className="bg-gradient-to-r from-medical-blue to-medical-teal text-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Adjusted text sizes for responsiveness */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 animate-fade-in">{title}</h1>
        {subtitle && (
          // Adjusted text sizes for responsiveness
          <p className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl animate-slide-up">
            {subtitle}
          </p>
          // Removed duplicate paragraph
        )}
      </div>
    </div>
  );
};

export default PageHeader;
