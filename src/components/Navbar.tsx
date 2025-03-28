import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, User, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'py-4 bg-transparent'}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-heading font-semibold text-lg text-medical-blue">
            Daivan Febri Juan Setiya
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center"> {/* Removed justify-between and w-full */}
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
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
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
          <div className="md:hidden flex items-center space-x-4">
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
        <nav className="md:hidden bg-white px-4 py-4 shadow-md animate-fade-in">
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
                  <div className="text-sm text-gray-500">Signed in as {user?.email || 'User'}</div> {/* Changed user.name to user.email */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left py-2 text-red-600"
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
  );
};

export default Navbar;
