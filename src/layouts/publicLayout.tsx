import { Outlet } from 'react-router-dom';
import PublicHeader from '@/components/public/publicHeader';
import PublicFooter from '@/components/public/publicFooter';
import ThemeManager from '@/components/public/ThemeManager';
import ScrollToTop from '@/components/public/ScrollToTop';

const PublicLayout = () => {
  return (
    <>
      <ThemeManager />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 pt-12">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </>
  );
};

export default PublicLayout;
