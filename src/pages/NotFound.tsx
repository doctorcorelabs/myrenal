
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../components/Layout";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4">
        <h1 className="text-7xl font-bold text-medical-blue mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="flex items-center px-6 py-3 bg-medical-blue text-white rounded-md hover:bg-opacity-90 transition-all">
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
