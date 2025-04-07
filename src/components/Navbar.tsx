import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Menu, X, LogIn, UserPlus, LogOut, User, Wrench, ArrowUpCircle } from 'lucide-react'; // Added ArrowUpCircle
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // Added useToast
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, // Added Separator
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UpgradePlanDialog } from './UpgradePlanDialog'; // Import the dialog

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false); // State for dialog
  const location = useLocation();
  const { user, level, isAuthenticated, logout } = useAuth(); // Added level
  const navigate = useNavigate(); // Added navigate
  const { toast } = useToast(); // Added toast

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
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  // Placeholder function for initiating upgrade (calls placeholder in AuthContext or similar)
  const handleUpgradeClick = useCallback(async () => {
    if (!user) return; // Should not happen if button is shown, but good practice

    // TODO: Replace this with the actual call to initiateStripeCheckout
    // This might involve moving initiateStripeCheckout from SignUp to AuthContext
    // or creating a dedicated function/hook for it.
    console.log(`Upgrade clicked for user: ${user.id}, email: ${user.email}`);
    // This function now primarily opens the dialog.
    // The placeholder toast is removed from here as the dialog handles the next step.
    // toast({
    //   title: "Upgrade Feature Placeholder",
    //   description: "Implement payment gateway checkout initiation here.", // Generic text
    // });
    // Example of calling a placeholder function (assuming it exists)
    // try {
    //   await initiateStripeCheckout(user.id, user.email || '', 'Premium'); // Or prompt user for Premium/Researcher
    // } catch (error: any) {
    //   toast({ title: "Error", description: error.message, variant: "destructive" });
    // }
    // For now, just open the dialog
    setIsUpgradeDialogOpen(true);
  }, [user, toast]); // Dependencies


  return (
    <> {/* Wrap with Fragment to include Dialog */}
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'py-4 bg-transparent'}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-heading font-semibold text-lg text-medical-blue">
            Daivan Febri Juan Setiya
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center"> {/* Removed justify-between and w-full */}
            {/* Main navLinks group */}
            <div className="flex items-center space-x-6"> {/* Spacing for main links */}
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
            <div className="ml-8 flex items-center space-x-4"> {/* Reduced margin to ml-8 */}
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
                  {/* Removed Stream Interaction link */}
                  {/* Conditionally show Upgrade Plan item - Temporarily Disabled */}
                  {/* {level === 'Free' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleUpgradeClick} className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50">
                        <ArrowUpCircle className="h-4 w-4" />
                        <span>Upgrade Plan</span>
                      </DropdownMenuItem>
                    </>
                  )} */}
                  {/* <DropdownMenuSeparator /> */} {/* Also hide separator if upgrade is the only item between separators */}
                  <DropdownMenuSeparator /> {/* Keep this separator before Sign Out */}
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
            </div> {/* End of auth group */}
          </nav> {/* End of nav */}

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
                  {/* <div className="text-xs text-gray-400 px-2 capitalize">Level: {level || 'Unknown'}</div> */} {/* Temporarily hide level */}
                   {/* Conditionally show Upgrade Plan button for Free users - Temporarily Disabled */}
                   {/* {level === 'Free' && (
                     <Button
                       variant="ghost"
                       onClick={handleUpgradeClick}
                       className="w-full flex items-center justify-start gap-2 text-left py-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                     >
                       <ArrowUpCircle className="h-5 w-5" />
                       <span>Upgrade Plan</span>
                     </Button>
                   )} */}
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
                    {/* Add an icon indicator for collapsible state if desired */}
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
    {/* Render the Dialog component */}
    <UpgradePlanDialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen} />
    </>
  );
};

export default Navbar;
