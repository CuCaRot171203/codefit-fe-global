import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { useAppSelector } from '@/store';
import UserHeader from '@/components/user/userHeader';
import UserSidebar from '@/components/user/userSidebar';
import UserFooter from '@/components/user/userFooter';
import { FloatingChatWidget } from '@/components/user/FloatingChatWidget';
import { cn } from '@/lib/utils';

const UserLayoutContent = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const theme = useAppSelector((state) => state.theme.theme);

  // Sync dark class with Redux theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Routes where chat widget should be hidden
  const hideChatRoutes = [
    '/user/minitest/lam-bai',
    '/user/hackathon',
    '/user/ai-assistant',
  ];

  const shouldShowChat = !hideChatRoutes.some(route => location.pathname.startsWith(route));

  return (
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
        <UserFooter />
      </main>
      {shouldShowChat && <FloatingChatWidget />}
    </div>
  );
};

const UserLayout = () => {
  return (
    <SidebarProvider>
      <UserLayoutContent />
    </SidebarProvider>
  );
};

export default UserLayout;
