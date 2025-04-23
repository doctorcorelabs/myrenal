import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { LogOut, User, Settings, HelpCircle, Zap, FlaskConical, BrainCircuit, Stethoscope, BookOpen, FileText, Microscope, Bot, Users, Database, BarChart, Map, Search, ShieldCheck, Gem, Brain, Home, ChevronsLeft, ChevronsRight, ArrowUpCircle, GraduationCap } from 'lucide-react'; // Added GraduationCap icon

// Define props interface
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { user, logout, openUpgradeDialog } = useAuth(); // Get openUpgradeDialog from context
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout(); // Changed signOut to logout
    navigate('/'); // Navigate to Home page after sign out
  };

  // Define tool links - adjust paths and names as needed
  const toolLinks = [
    { path: "/tools/ai-chatbot", name: "AI Chatbot", icon: Bot },
    { path: "/tools/ai-peer-review", name: "AI Peer-Review", icon: Users },
    { path: "/tools/drug-reference", name: "Drug Reference", icon: FlaskConical },
    { path: "/tools/interaction-checker", name: "Interaction Checker", icon: ShieldCheck },
    { path: "/tools/disease-library", name: "Disease Library", icon: BookOpen },
    { path: "/tools/clinical-guidelines", name: "Clinical Guidelines", icon: FileText },
    { path: "/tools/clinical-scoring-hub", name: "Clinical Scoring Hub", icon: BarChart },
    { path: "/tools/learning-resources", name: "Learning Resources", icon: GraduationCap }, // Added Learning Resources
    { path: "/tools/medical-calculator", name: "Medical Calculator", icon: Stethoscope }, // Changed icon
    { path: "/tools/nutrition-database", name: "Nutrition Database", icon: Database },
    { path: "/tools/ai-mindmap-generator", name: "AI Mind Map Generator", icon: Map },
    { path: "/tools/explore-gemini", name: "Explore Gemini", icon: Gem },
    { path: "/tools/explore-deepseek", name: "Explore DeepSeek", icon: Brain },
    { path: "/nucleus", name: "Nucleus Archive", icon: Microscope }, // Added Nucleus
    { path: "/author", name: "Author", icon: User }, // Added Author link
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Header with Logo and Toggle Button */}
        <div className={`flex items-center border-b border-gray-200 ${isCollapsed ? 'h-16 justify-center' : 'h-16 p-4 justify-between'}`}>
          <Link to="/tools" className={`flex items-center space-x-2 ${isCollapsed ? 'hidden' : 'flex'}`}>
            <BrainCircuit className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-lg text-gray-800">NUCLEAI</span>
          </Link>
          {/* Show only icon when collapsed */}
          <Link to="/tools" className={`flex items-center justify-center ${isCollapsed ? 'flex' : 'hidden'}`}>
             <Tooltip>
               <TooltipTrigger asChild>
                 <BrainCircuit className="h-6 w-6 text-blue-600" />
               </TooltipTrigger>
               <TooltipContent side="right">NUCLEAI</TooltipContent>
             </Tooltip>
          </Link>
          {/* Toggle Button - Placed in header for consistency */}
          {/* <Button variant="ghost" size="icon" onClick={onToggle} className={` ${isCollapsed ? 'hidden' : 'block'}`}>
            <ChevronsLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle} className={` ${isCollapsed ? 'block' : 'hidden'}`}>
            <ChevronsRight className="h-5 w-5" />
          </Button> */}
        </div>

        {/* Navigation Links */}
        <ScrollArea className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <nav className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
            )}
            {toolLinks.map((link) => (
              <Tooltip key={link.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${isCollapsed ? 'justify-center h-10 w-10 p-0' : 'justify-start'}`}
                    asChild
                  >
                    <Link to={link.path}>
                      <link.icon className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                      <span className={isCollapsed ? 'sr-only' : ''}>{link.name}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{link.name}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer Section */}
        <div className={`p-2 border-t border-gray-200 mt-auto ${isCollapsed ? 'space-y-2' : 'p-4 space-y-2'}`}>
          {/* Toggle Button - Moved to bottom */}
           <Tooltip>
             <TooltipTrigger asChild>
               <Button variant="ghost" size="icon" onClick={onToggle} className="w-full h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                 {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
               </Button>
             </TooltipTrigger>
             {isCollapsed && (
               <TooltipContent side="right">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</TooltipContent>
             )}
           </Tooltip>

          {user ? (
            <>
              {/* User Info */}
              <Tooltip>
                <TooltipTrigger asChild>
                   <div className={`flex items-center p-2 rounded-md bg-gray-100 ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                     <User className="h-5 w-5 text-gray-600 flex-shrink-0" />
                     <span className={`text-sm font-medium text-gray-700 truncate ${isCollapsed ? 'sr-only' : ''}`}>{user.email}</span>
                   </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">{user.email}</TooltipContent>
                )}
              </Tooltip>

              {/* Admin Dashboard Link */}
              {user.level === 'Administrator' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className={`w-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${isCollapsed ? 'justify-center h-10 w-10 p-0' : 'justify-start'}`} asChild>
                      <Link to="/admin-dashboard">
                        <Settings className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                        <span className={isCollapsed ? 'sr-only' : ''}>Admin Dashboard</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">Admin Dashboard</TooltipContent>
                  )}
                </Tooltip>
              )}

              {/* Upgrade Plan Button */}
              {user.level !== 'Administrator' && user.level !== 'Researcher' && ( // Only show if not already upgraded or admin
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={openUpgradeDialog} className={`w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 ${isCollapsed ? 'justify-center h-10 w-10 p-0' : 'justify-start'}`}>
                      <ArrowUpCircle className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                      <span className={isCollapsed ? 'sr-only' : ''}>Upgrade Plan</span>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">Upgrade Plan</TooltipContent>
                  )}
                </Tooltip>
              )}

              {/* Sign Out Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={handleSignOut} className={`w-full text-red-600 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? 'justify-center h-10 w-10 p-0' : 'justify-start'}`}>
                    <LogOut className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                    <span className={isCollapsed ? 'sr-only' : ''}>Sign Out</span>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Sign Out</TooltipContent>
                )}
              </Tooltip>
            </>
          ) : (
             <>
               {/* Sign In Button */}
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="default" className={`w-full ${isCollapsed ? 'h-10 w-10 p-0' : ''}`} asChild>
                     <Link to="/signin">
                       <User className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                       <span className={isCollapsed ? 'sr-only' : ''}>Sign In</span>
                     </Link>
                   </Button>
                 </TooltipTrigger>
                 {isCollapsed && (
                   <TooltipContent side="right">Sign In</TooltipContent>
                 )}
               </Tooltip>
               {/* Sign Up Button */}
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="outline" className={`w-full ${isCollapsed ? 'h-10 w-10 p-0' : ''}`} asChild>
                     <Link to="/signup">
                       <Settings className={`flex-shrink-0 h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} /> {/* Using Settings icon as placeholder */}
                       <span className={isCollapsed ? 'sr-only' : ''}>Sign Up</span>
                     </Link>
                   </Button>
                 </TooltipTrigger>
                 {isCollapsed && (
                   <TooltipContent side="right">Sign Up</TooltipContent>
                 )}
               </Tooltip>
             </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
