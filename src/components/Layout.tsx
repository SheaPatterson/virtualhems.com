import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import GlobalSearch from './GlobalSearch'; // Import GlobalSearch

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center lg:hidden">
            <MobileNav />
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Global Search Component */}
            <GlobalSearch />
            {/* User profile or other header items could go here */}
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;