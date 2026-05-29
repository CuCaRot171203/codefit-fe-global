import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearUser } from '@/store/slices/adminSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { LectureProvider } from '@/contexts/LectureContext';
import { ConfigProvider, theme as antTheme } from 'antd';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Settings,
  User,
  CheckCheck,
  Loader2,
  FileText,
  RefreshCw,
} from 'lucide-react';
import LectureSidebar from '@/components/lecture/lectureSidebar';
import { API_ENDPOINTS } from '@/config/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string; // Link to navigate when clicked
}

export default function LectureLayout() {
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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.notifications.list, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        // Transform data: backend uses 'content', frontend expects 'message'
        // Parse metadata if it's a JSON string
        const newNotifications = (data.data || []).map((n: any) => {
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
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
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
        'md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 transition-colors duration-300',
        isDark ? 'bg-[#0B3C5D] text-white' : 'bg-[#0B3C5D] text-white'
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-white hover:bg-white/20"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <span className="font-bold text-lg">Giảng viên</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
            className="text-white hover:bg-white/20"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-white/20 text-white text-sm">
              {user?.fullName?.[0] || user?.username?.[0] || 'G'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 bottom-0 w-64 z-50 transform transition-transform duration-300',
          isDark ? 'bg-[#0B3C5D]' : 'bg-[#0B3C5D]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <span className="text-white font-bold text-xl">CodeFit</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <Link
              to="/lecture/my-courses"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isActive('/lecture/my-courses')
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Khóa học của tôi</span>
            </Link>
            <Link
              to="/lecture/lesson-requests"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isActive('/lecture/lesson-requests')
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <FileText className="w-5 h-5" />
              <span>Bài được giao</span>
            </Link>
            <Link
              to="/lecture/minitests"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isActive('/lecture/minitests')
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Bell className="w-5 h-5" />
              <span>Minitest</span>
            </Link>
            <Link
              to="/lecture/hackathons"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isActive('/lecture/hackathons')
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Bell className="w-5 h-5" />
              <span>Hackathon</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <LectureSidebar />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 pt-16 md:pt-0',
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      >
        {/* Desktop Header */}
        <header className={cn(
          'hidden md:flex h-16 items-center justify-end px-6 border-b transition-colors duration-300',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        )}>
          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
              className={cn(isDark ? 'text-yellow-400' : 'text-slate-600')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotificationDropdown}
                className="relative"
              >
                <Bell className={cn('w-5 h-5', isDark ? 'text-slate-300' : 'text-slate-600')} />
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
                        onClick={() => fetchNotifications()}
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
                          navigate('/lecture/notifications');
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
                className="flex items-center gap-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className={cn(
                    'text-sm',
                    isDark ? 'bg-slate-700 text-white' : 'bg-[#0B3C5D] text-white'
                  )}>
                    {user?.fullName?.[0] || user?.username?.[0] || 'G'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {user?.fullName || user?.username || 'Giảng viên'}
                  </p>
                  <p className={cn(
                    'text-xs',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    Giảng viên
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
                      to="/lecture/dashboard"
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                        isDark
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Đến Dashboard
                    </Link>
                    <Link
                      to="/lecture/profile"
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
                      to="/lecture/settings"
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
        <LectureProvider>
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
        </LectureProvider>
      </main>
    </div>
  );
}
