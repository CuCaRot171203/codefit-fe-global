import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import UserHeader from '@/components/user/userHeader';
import UserSidebar from '@/components/user/userSidebar';
import ThemeManager from '@/components/public/ThemeManager';
import { cn } from '@/lib/utils';

const UserLayoutNoFooterContent = () => {
  const { collapsed } = useSidebar();

  return (
    <>
      <ThemeManager />
      <div className="flex min-h-screen bg-surface dark:bg-slate-950">
        <UserSidebar />
        <main
          className={cn(
            'flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out',
            collapsed ? 'md:ml-20' : 'md:ml-64'
          )}
        >
          <UserHeader />
          <div className="flex-1 p-8 overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

const UserLayoutNoFooter = () => {
  return (
    <SidebarProvider>
      <UserLayoutNoFooterContent />
    </SidebarProvider>
  );
};

export default UserLayoutNoFooter;
