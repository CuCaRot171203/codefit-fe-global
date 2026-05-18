'use client';

import { Outlet } from 'react-router-dom';
import UserHeader from '@/components/user/userHeader';
import UserSidebar from '@/components/user/userSidebar';
import ThemeManager from '@/components/public/ThemeManager';

const HackathonLayout = () => {
  return (
    <>
      <ThemeManager />
      <div className="h-screen overflow-hidden flex flex-col">
        <UserHeader />
        <div className="flex flex-1 overflow-hidden">
          <UserSidebar />
          <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default HackathonLayout;
