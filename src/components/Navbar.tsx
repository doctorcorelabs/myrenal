import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, User, Wrench, ShieldCheck, Clock, ArrowUpCircle } from 'lucide-react'; // Added Clock, ArrowUpCircle icons
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, // Added AlertDialog
  AlertDialogTrigger, // Added AlertDialogTrigger
} from "@/components/ui/alert-dialog"; // Added AlertDialog imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpgradePlanDialogContent from '@/components/UpgradePlanDialog'; // Import the dialog content
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [quotaResetTime, setQuotaResetTime] = useState<number | null>(null); // State for countdown
  const location = useLocation();
  const { user, level, isAuthenticated, logout } = useAuth();

  // Helper function to calculate time until next midnight UTC
  const getTimeUntilNextMidnightUTC = useCallback(() => {
    const now = new Date();
    const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const diff = midnightUTC.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 1000)); // Time in seconds
  }, []);

  // Effect to calculate and update refresh times for the current user
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAuthenticated && (level === 'Free' || level === 'Researcher')) {
      const updateCountdown = () => {
        setQuotaResetTime(getTimeUntilNextMidnightUTC());
      };
      updateCountdown(); // Initial calculation
      intervalId = setInterval(updateCountdown, 1000); // Update every second
    } else {
      setQuotaResetTime(null); // Clear countdown if not authenticated or not Free/Researcher
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Cleanup on unmount or when auth state changes
      }
    };
  }, [isAuthenticated, level, getTimeUntilNextMidnightUTC]);

  // Helper function to format time in hh:mm:ss format
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };


  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Education', path: '/education' },
    { name: 'Honors & Awards', path: '/honors' },
    { name: 'Research', path: '/research' },
    { name: 'Experience', path: '/experience' },
    { name: 'Certifications', path: '/certifications' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false); // Close mobile menu on location change
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'py-4 bg-transparent'}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-heading font-semibold text-lg text-medical-blue">
            Daivan Febri Juan Setiya
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center">
            {/* Main navLinks group */}
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`transition-colors duration-300 hover:text-medical-teal ${
                    location.pathname === link.path
                      ? 'text-medical-teal font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Auth section group */}
            <div className="ml-8 flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/tools"
                    className={`transition-colors duration-300 hover:text-medical-teal ${
                      location.pathname === '/tools'
                        ? 'text-medical-teal font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    Tools
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span>User</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/tools" className="flex items-center gap-2 cursor-pointer">
                          <Wrench className="h-4 w-4" />
                          <span>Tools</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Conditionally show Upgrade Plan Item */}
                      {level === 'Free' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50">
                              <ArrowUpCircle className="h-4 w-4" />
                              <span>Upgrade Plan</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <UpgradePlanDialogContent />
                        </AlertDialog>
                      )}

                      {/* Conditionally show Quota Reset Countdown */}
                      {quotaResetTime !== null && (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground flex items-center gap-1 cursor-default">
                          <Clock className="h-3 w-3" />
                          <span>Reset in: {formatTime(quotaResetTime)}</span>
                        </DropdownMenuItem>
                      )}
                      {/* Conditionally show Admin Dashboard item */}
                      {level === 'Administrator' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin-dashboard" className="flex items-center gap-2 cursor-pointer text-purple-600 focus:text-purple-700 focus:bg-purple-50">
                              <ShieldCheck className="h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/signin" className="flex items-center gap-2 cursor-pointer">
                        <LogIn className="h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="flex items-center gap-2 cursor-pointer">
                        <UserPlus className="h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <Link to="/tools" className="text-medical-teal">
                <Wrench size={24} />
              </Link>
            )}
            <button
              className="text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="xl:hidden bg-white px-4 py-4 shadow-md animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors duration-300 block py-2 hover:text-medical-teal ${
                  location.pathname === link.path
                    ? 'text-medical-teal font-medium'
                    : 'text-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Links (Mobile) */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 px-2">Signed in as {user?.email || 'User'}</div>
                  <div className="text-xs text-gray-400 px-2 capitalize">Level: {level || 'Unknown'}</div>
                  {/* Conditionally show Quota Reset Countdown for Mobile */}
                  {quotaResetTime !== null && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 border-t border-b border-gray-100">
                      <Clock className="h-3 w-3" />
                      <span>Quota Reset in: {formatTime(quotaResetTime)}</span>
                    </div>
                  )}
                   {/* Conditionally show Admin Dashboard button */}
                   {level === 'Administrator' && (
                     <Button variant="ghost" asChild className="w-full flex items-center justify-start gap-2 text-left py-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                       <Link to="/admin-dashboard">
                         <ShieldCheck className="h-5 w-5" />
                         <span>Admin Dashboard</span>
                       </Link>
                     </Button>
                   )}
                  {/* Conditionally show Upgrade Plan Item in Mobile */}
                  {level === 'Free' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full flex items-center justify-start gap-2 text-left py-2 hover:bg-green-50 hover:text-green-700 text-green-600">
                          <ArrowUpCircle className="h-5 w-5" />
                          <span>Upgrade Plan</span>
                        </Button>
                      </AlertDialogTrigger>
                      <UpgradePlanDialogContent />
                    </AlertDialog>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-medical-teal">
                    <span className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      <span>Login / Register</span>
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-2">
                    <Link
                      to="/signin"
                      className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-medical-teal"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-medical-teal"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
