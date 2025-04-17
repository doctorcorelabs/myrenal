
import { ReactNode, useState } from 'react'; // Import useState
import Sidebar from './Sidebar'; // Import Sidebar
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"; // Import AlertDialog components
import UpgradePlanDialogContent from '@/components/UpgradePlanDialog'; // Import the content component

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Add state for sidebar collapse
  // Get global dialog state and control functions from context
  const { isUpgradeDialogOpen, closeUpgradeDialog } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100"> {/* Main container: flex row, full screen height */}
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} /> {/* Pass state and toggle function */}
      {/* Removed conditional margin, flex-1 should handle spacing */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white"> {/* Moved bg-white here */}
        {/* Removed p-6 class, Added h-full */}
        <div className="flex-1 overflow-y-auto h-full"> 
           {children}
        </div>
      </main>

      {/* Global Upgrade Dialog remains */}
      <AlertDialog open={isUpgradeDialogOpen} onOpenChange={closeUpgradeDialog}>
        {/* Apply layout styles directly to the global dialog content container */}
        <AlertDialogContent className="max-h-[90vh] flex flex-col"> 
          <UpgradePlanDialogContent />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Layout;
