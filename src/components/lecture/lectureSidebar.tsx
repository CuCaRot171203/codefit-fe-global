import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, BookOpen, Target, Trophy, LogOut, FileText, CheckSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar, clearUser } from '@/store/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/images/LOGO_CODEFIT.png';

const navItems = [
  { path: '/lecture/my-courses', label: 'Khóa học của tôi', icon: BookOpen },
  { path: '/lecture/lesson-requests', label: 'Bài được giao', icon: FileText },
  { path: '/lecture/submissions', label: 'Bài nộp', icon: CheckSquare },
  { path: '/lecture/minitests', label: 'Minitest', icon: Target },
  { path: '/lecture/hackathons', label: 'Hackathon', icon: Trophy },
];

const LectureSidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy trực tiếp từ Redux thay vì context
  const sidebarCollapsed = useAppSelector((state) => state.admin.sidebarCollapsed);
  const isDark = useAppSelector((state) => state.theme.theme) === 'dark';

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(clearUser());
    navigate('/dang-nhap');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64',
          isDark ? 'bg-slate-800' : 'bg-slate-800'
        )}
      >
        {/* Logo */}
        <div className={cn('h-16 flex items-center justify-center border-b border-white/10')}>
          {sidebarCollapsed ? (
            <img src={Logo} alt="CodeFit" className="w-8 h-8 object-contain" />
          ) : (
            <img src={Logo} alt="CodeFit" className="h-8 w-auto object-contain" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const linkContent = (
              <Link
                to={item.path}
                className={cn(
                  'flex items-center gap-3 py-3 text-sm transition-colors',
                  sidebarCollapsed ? 'justify-center px-2' : 'px-4',
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );

            return sidebarCollapsed ? (
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

        {/* Toggle & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSidebar}
                className={cn('w-full justify-start', sidebarCollapsed ? 'justify-center px-2' : '', 'text-white/70 hover:bg-white/10 hover:text-white')}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5" />
                    <span className="ml-2">Thu gọn</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                Thu gọn
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={cn('w-full justify-start', sidebarCollapsed ? 'justify-center px-2' : '', 'text-white/70 hover:bg-white/10 hover:text-white')}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="ml-2">Đăng xuất</span>}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right" sideOffset={10}>
                Đăng xuất
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default LectureSidebar;
