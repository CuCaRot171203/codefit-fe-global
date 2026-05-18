import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const PublicHeader = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-headline tracking-tight transition-all duration-300 ${
      isActive
        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 pb-1 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400'
    }`;

  const navLinkMobileClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl font-headline text-base font-medium transition-all duration-300 ${
      isActive
        ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  const displayName = user?.username || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,104,117,0.08)]">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
        <NavLink to="/">
          <img src={Logo} alt="CodeFit Logo" className="h-9 w-auto" />
        </NavLink>
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/lo-trinh" className={navLinkClass}>
            Lộ trình
          </NavLink>
          <NavLink to="/cong-dong" className={navLinkClass}>
            Cộng đồng
          </NavLink>
          <NavLink to="/bang-gia" className={navLinkClass}>
            Bảng giá
          </NavLink>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <NavLink to="/user/profile" className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-cyan-500/50 transition-all">
                <AvatarFallback className="bg-cyan-500 text-white text-sm font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 font-headline">
                {displayName}
              </span>
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/dang-nhap"
                className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 font-headline font-semibold transition-all"
              >
                Đăng nhập
              </NavLink>
              <NavLink
                to="/dang-ky"
                className="bg-secondary-container text-white px-4 md:px-6 py-2 rounded-xl font-headline font-bold tracking-tight hover:opacity-90 active:scale-95 transition-all neon-glow-secondary text-sm md:text-base"
              >
                Đăng Ký
              </NavLink>
            </>
          )}
          {/* Hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={navLinkMobileClass}
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/lo-trinh"
            onClick={() => setMobileOpen(false)}
            className={navLinkMobileClass}
          >
            Lộ trình
          </NavLink>
          <NavLink
            to="/cong-dong"
            onClick={() => setMobileOpen(false)}
            className={navLinkMobileClass}
          >
            Cộng đồng
          </NavLink>
          <NavLink
            to="/bang-gia"
            onClick={() => setMobileOpen(false)}
            className={navLinkMobileClass}
          >
            Bảng giá
          </NavLink>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 mt-2 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <NavLink
                to="/user/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-cyan-500 text-white text-sm font-semibold">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 font-headline">
                  {displayName}
                </span>
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/dang-nhap"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-headline font-semibold transition-all"
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/dang-ky"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-center bg-secondary-container text-white font-headline font-bold transition-all"
                >
                  Đăng Ký
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
