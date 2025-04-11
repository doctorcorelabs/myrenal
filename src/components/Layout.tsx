
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"; // Import AlertDialog components
import UpgradePlanDialogContent from '@/components/UpgradePlanDialog'; // Import the content component

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Get global dialog state and control functions from context
  const { isUpgradeDialogOpen, closeUpgradeDialog } = useAuth();

  return (
    <div className="flex flex-col flex-grow bg-white"> {/* Changed h-full to flex-grow */}
      <Navbar />
      <main className="flex-grow bg-white pt-6"> {/* Added top padding */}
        {children}
      </main>
      <Footer />

      {/* Global Upgrade Dialog */}
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
