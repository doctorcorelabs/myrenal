
import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar'; // Import TopNavBar
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import UpgradePlanDialogContent from '@/components/UpgradePlanDialog';

interface LayoutProps {
  children: ReactNode;
}
// Removed duplicate interface definition below

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const { isUpgradeDialogOpen, closeUpgradeDialog } = useAuth();

  const toggleDesktopSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for Desktop (md and up) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleDesktopSidebar} />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 left-0 z-40 flex md:hidden">
            <Sidebar isCollapsed={false} onToggle={closeMobileMenu} /> {/* Always expanded on mobile, toggle closes it */}
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar for Mobile */}
        <TopNavBar onToggleMobileMenu={toggleMobileMenu} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white"> {/* Moved bg-white here */}
          <div className="h-full"> {/* Removed flex-1, overflow-y-auto from here */}
            {children}
          </div>
        </main>
      </div>

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
