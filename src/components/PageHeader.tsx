
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    // Removed mt-16 class from here
    <div className="bg-gradient-to-r from-medical-blue to-medical-teal text-white py-24 md:py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">{title}</h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl animate-slide-up">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
