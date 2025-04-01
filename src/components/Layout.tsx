
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col flex-grow bg-white"> {/* Changed h-full to flex-grow */}
      <Navbar />
      <main className="flex-grow bg-white"> {/* Removed pb-20 */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
