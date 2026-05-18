import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LayoutDashboard, BookOpen, Terminal, Users, HelpCircle, BarChart3, Trophy, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/contexts/SidebarContext';

const logoUrl = '/src/assets/images/LOGO_CODEFIT.png';

const navItems = [
  { path: '/user/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/user/danh-sach-khoa-hoc', label: 'Danh sách khóa học', icon: BookOpen },
  { path: '/user/thong-ke', label: 'Thống kê', icon: BarChart3 },
  { path: '/user/hackathon', label: 'Hackathon', icon: Trophy },
  { path: '/user/ai-assistant', label: 'Trợ lý AI', icon: Bot },
];

const bottomNavItems = [
  { path: '/user/ho-tro', label: 'Hỗ trợ', icon: HelpCircle },
];

const UserSidebar = () => {
  const { collapsed, toggleCollapsed } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-slate-50 dark:bg-slate-900 font-headline text-sm font-medium py-4 shrink-0 fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-20 px-2' : 'w-64 px-4'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center mb-6 overflow-hidden', collapsed ? 'justify-center' : 'justify-center')}>
          <Link to="/" className="flex items-center overflow-hidden">
            <img
              src={logoUrl}
              alt="CodeFit Logo"
              className="w-20 object-contain shrink-0"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1', collapsed ? 'px-1' : 'px-2')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 py-3 rounded-xl transition-all duration-300 ease-in-out font-semibold',
                  collapsed ? 'justify-center px-0' : 'px-4',
                  active
                    ? 'text-[#0B3C5D] dark:text-white border-r-4 border-[#0B3C5D] bg-slate-200/50 dark:bg-slate-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path}>{linkContent}</div>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className={cn('mt-auto pt-4 border-t border-slate-100 dark:border-slate-800', collapsed ? 'px-1 space-y-1' : 'px-4 space-y-1')}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 transition-all duration-300 ease-in-out hover:text-[#0B3C5D] dark:hover:text-white',
                  collapsed ? 'justify-center px-0' : 'px-4'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path}>{linkContent}</div>
            );
          }          )}

          {/* Toggle Button - Always at bottom */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapsed}
                className={cn(
                  'mt-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center',
                  collapsed ? 'w-full p-2' : 'w-full p-2'
                )}
              >
                {collapsed ? (
                  <>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </>
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                    <span className="ml-2 text-slate-500 text-sm">Thu gọn</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>{collapsed ? 'Mở rộng' : 'Thu gọn'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default UserSidebar;
