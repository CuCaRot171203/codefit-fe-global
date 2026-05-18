import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar, clearUser } from '@/store/slices/adminSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { AdminProvider } from '@/contexts/AdminContext';
import { ConfigProvider, theme as antTheme } from 'antd';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Bell,
  Settings,
  User,
  FlaskConical,
  Trophy,
  UserCog,
  Check,
  CheckCheck,
  Loader2,
  FileText,
  CheckCircle,
  RefreshCw,
  BellRing,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { API_ENDPOINTS } from '@/config/api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string; // Link to navigate when clicked
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Quản lý khóa học', href: '/admin/courses', icon: BookOpen },
  { title: 'Yêu cầu bài học', href: '/admin/lesson-requests', icon: FileText },
  { title: 'Duyệt bài học', href: '/admin/lesson-reviews', icon: CheckCircle },
  { title: 'Quản lý thông báo', href: '/admin/notifications/manage', icon: BellRing },
  { title: 'Quản lý giảng viên', href: '/admin/instructors', icon: UserCog },
  { title: 'Quản lý người dùng', href: '/admin/users', icon: Users },
  { title: 'Minitest', href: '/admin/minitests', icon: FlaskConical },
  { title: 'Hackathon', href: '/admin/hackathons', icon: Trophy },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { sidebarCollapsed, user } = useAppSelector((state) => state.admin);
  const { theme } = useAppSelector((state) => state.theme);
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(theme === 'dark');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Sync theme with Redux
  useEffect(() => {
    setIsDark(theme === 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.notifications.list, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        // Transform data: backend uses 'content', frontend expects 'message'
        // Parse metadata if it's a JSON string
        const transformed = (data.data || []).map((n: any) => {
          let metadata = n.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch {
              metadata = {};
            }
          }
          return {
            ...n,
            metadata,
            message: n.content || n.message || '',
            link: n.link || metadata?.link || '',
          };
        });
        setNotifications(transformed);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.notifications.read(notificationId), {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkingRead(null);
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  // Select all notifications
  const selectAllNotifications = () => {
    if (selectedNotifications.size === notifications.filter(n => !n.isRead).length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.filter(n => !n.isRead).map(n => n.id)));
    }
  };

  // Mark selected notifications as read
  const markSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    setMarkingRead('multiple');
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        Array.from(selectedNotifications).map(id =>
          fetch(API_ENDPOINTS.notifications.read(id), {
            method: 'PUT',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
        )
      );
      setNotifications(
        notifications.map((n) =>
          selectedNotifications.has(n.id) ? { ...n, isRead: true } : n
        )
      );
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Error marking selected notifications as read:', error);
    } finally {
      setMarkingRead(null);
    }
  };

  // Handle notification click - navigate to link
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Close dropdown
    setShowNotifications(false);
    
    // Handle notification based on type
    if (notification.type === 'lesson_submitted') {
      // Navigate to lesson reviews page
      navigate('/admin/lesson-reviews');
    } else if (notification.link) {
      // Navigate to provided link
      navigate(notification.link);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.notifications.readAll, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Toggle notification dropdown
  const toggleNotificationDropdown = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(clearUser());
    navigate('/dang-nhap');
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300',
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Mobile Header */}
      <div className={cn(
        'lg:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 transition-colors duration-300',
        isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={isDark ? 'text-white hover:bg-white/20' : 'text-slate-700 hover:bg-slate-100'}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>CodeFit Admin</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            className={isDark ? 'text-white hover:bg-white/20' : 'text-slate-700 hover:bg-slate-100'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className={cn('text-sm', isDark ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>
              {user?.fullName?.[0] || user?.username?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 transform transition-transform duration-300',
          isDark ? 'bg-slate-800' : 'bg-white',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn('h-16 flex items-center justify-start px-6 border-b', isDark ? 'border-white/10' : 'border-slate-200')}>
            <img src={Logo} alt="CodeFit" className="h-8 w-auto object-contain" />
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-8 py-3 transition-colors',
                    isActive(item.href)
                      ? isDark ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-900'
                      : isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className={cn('p-4 border-t', isDark ? 'border-white/10' : 'border-slate-200')}>
            <Button
              variant="ghost"
              className={cn('w-full justify-start', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-300',
            isDark ? 'bg-slate-800' : 'bg-white',
            sidebarCollapsed ? 'w-20' : 'w-64'
          )}
        >
        {/* Logo */}
        <div className={cn('h-16 flex items-center justify-start px-6 border-b', isDark ? 'border-white/10' : 'border-slate-200')}>
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
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 py-3 transition-colors',
                      sidebarCollapsed ? 'justify-center px-2' : 'pl-8 pr-4',
                      isActive(item.href)
                        ? isDark ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-900'
                        : isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" sideOffset={10}>
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Toggle & Logout */}
        <div className={cn('p-4 border-t space-y-2', isDark ? 'border-white/10' : 'border-slate-200')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSidebar}
                className={cn('w-full justify-start', sidebarCollapsed ? 'justify-center px-2' : '', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}
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
                className={cn('w-full justify-start', sidebarCollapsed ? 'justify-center px-2' : '', isDark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}
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

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 pt-16 lg:pt-0',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Desktop Header */}
        <header className={cn(
          'hidden lg:flex h-16 items-center justify-end px-6 border-b transition-colors duration-300',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
              className={isDark ? 'text-white hover:bg-white/20' : 'text-slate-700 hover:bg-slate-100'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotificationDropdown}
                className={cn('relative', isDark ? 'text-white hover:bg-white/20' : 'text-slate-700 hover:bg-slate-100')}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-96 rounded-lg shadow-xl border overflow-hidden z-50',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  {/* Header */}
                  <div
                    className={cn(
                      'px-4 py-3 border-b flex items-center justify-between',
                      isDark ? 'border-slate-700' : 'border-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                        Thông báo
                      </h3>
                      {unreadCount > 0 && (
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                        )}>
                          {unreadCount} chưa đọc
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedNotifications.size > 0 && (
                        <button
                          onClick={markSelectedAsRead}
                          disabled={markingRead === 'multiple'}
                          className={cn(
                            'text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors',
                            isDark
                              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                              : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                          )}
                        >
                          {markingRead === 'multiple' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCheck className="w-3 h-3" />
                          )}
                          Đánh dấu ({selectedNotifications.size})
                        </button>
                      )}
                      <button
                        onClick={() => fetchNotifications(true)}
                        disabled={loadingNotifications}
                        className={cn(
                          'text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors',
                          isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                        title="Làm mới thông báo"
                      >
                        <RefreshCw className={cn('w-3 h-3', loadingNotifications && 'animate-spin')} />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className={cn('w-12 h-12 mx-auto mb-2', isDark ? 'text-slate-500' : 'text-slate-400')} />
                        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Không có thông báo nào
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Select All Row */}
                        <div
                          className={cn(
                            'px-4 py-2 border-b flex items-center gap-3',
                            isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'
                          )}
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.size === notifications.filter(n => !n.isRead).length && notifications.filter(n => !n.isRead).length > 0}
                              onChange={selectAllNotifications}
                              className="w-4 h-4 rounded border-slate-400 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className={cn('text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                              Chọn tất cả chưa đọc
                            </span>
                          </label>
                          <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                            ({notifications.filter(n => !n.isRead).length})
                          </span>
                        </div>
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer',
                              isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50',
                              !notification.isRead && (isDark ? 'bg-cyan-500/5' : 'bg-cyan-50/50'),
                              selectedNotifications.has(notification.id) && (isDark ? 'bg-cyan-500/10' : 'bg-cyan-100/50')
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={selectedNotifications.has(notification.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleNotificationSelection(notification.id);
                                }}
                                className="w-4 h-4 mt-1 rounded border-slate-400 text-cyan-500 focus:ring-cyan-500 shrink-0"
                              />
                              {/* Unread indicator */}
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    !notification.isRead && (isDark ? 'text-cyan-400' : 'text-cyan-700'),
                                    notification.isRead && (isDark ? 'text-white' : 'text-slate-900')
                                  )}
                                >
                                  {notification.title}
                                </p>
                                <p
                                  className={cn(
                                    'text-xs mt-0.5 line-clamp-2',
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  )}
                                >
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p
                                    className={cn(
                                      'text-xs',
                                      isDark ? 'text-slate-500' : 'text-slate-400'
                                    )}
                                  >
                                    {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                  {notification.link && (
                                    <span className={cn(
                                      'text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500',
                                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                                    )}>
                                      Có liên kết
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div
                      className={cn(
                        'px-4 py-3 border-t text-center',
                        isDark ? 'border-slate-700' : 'border-slate-200'
                      )}
                    >
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/notifications');
                        }}
                        className={cn(
                          'text-sm font-medium',
                          isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
                        )}
                      >
                        Xem tất cả thông báo ({notifications.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className={cn('flex items-center gap-2', isDark ? 'hover:bg-white/20' : 'hover:bg-slate-100')}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className={cn(
                    'text-sm',
                    isDark ? 'bg-slate-700 text-white' : 'bg-primary text-white'
                  )}>
                    {user?.fullName?.[0] || user?.username?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {user?.fullName || user?.username || 'Admin'}
                  </p>
                  <p className={cn(
                    'text-xs',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    {user?.role === 'admin' ? 'Quản trị viên' : user?.role}
                  </p>
                </div>
              </Button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className={cn(
                  'absolute right-0 mt-2 w-56 rounded-lg shadow-lg border overflow-hidden z-50',
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}>
                  <div className={cn(
                    'px-4 py-3 border-b',
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  )}>
                    <p className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {user?.fullName || user?.username}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        isDark 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/admin/settings"
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        isDark 
                          ? 'text-slate-300 hover:bg-slate-700' 
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Cài đặt
                    </Link>
                  </div>
                  <div className={cn(
                    'py-1 border-t',
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  )}>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition-colors',
                        isDark 
                          ? 'text-red-400 hover:bg-slate-700' 
                          : 'text-red-600 hover:bg-slate-50'
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <AdminProvider>
          <ConfigProvider
            theme={{
              algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
              token: {
                colorPrimary: '#06b6d4',
              },
            }}
          >
            <Outlet />
          </ConfigProvider>
        </AdminProvider>
      </main>
    </div>
  );
}
