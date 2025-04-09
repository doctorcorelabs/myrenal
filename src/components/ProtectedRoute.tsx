
import { Navigate } from 'react-router-dom';
import { useAuth, UserLevel } from '../contexts/AuthContext'; // Import UserLevel
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredLevel?: UserLevel; // Add optional requiredLevel prop
}

const ProtectedRoute = ({ children, requiredLevel }: ProtectedRouteProps) => {
  const { isAuthenticated, level, loading } = useAuth(); // Get level and loading state

  // Show loading indicator while auth state is being determined
  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />; // Added replace prop
  }

  // If a requiredLevel is specified, check if the user has that level
  if (requiredLevel && level !== requiredLevel) {
    console.warn(`Access denied: User level '${level}' does not match required level '${requiredLevel}'. Redirecting.`);
    // Redirect non-matching users (e.g., to home page or a dedicated 'unauthorized' page)
    return <Navigate to="/" replace />; // Redirect to home page
  }

  // If authenticated and level matches (or no level required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;
