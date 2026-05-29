import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Sun, Moon, User, Key, LogOut, Edit, Loader2, Check } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import ChangePasswordModal from '@/components/user/ChangePasswordModal';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Transform notification data from backend (content -> message)
export const transformNotification = (notification: any): Notification => ({
  ...notification,
  message: notification.content || notification.message || '',
  title: notification.title || '',
  isRead: notification.isRead || false,
  createdAt: notification.createdAt || new Date().toISOString(),
});

const UserHeader = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        setUserData(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        loadUserData();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        const transformed = (data.data || []).map((n: any) => ({
          ...n,
          message: n.content || n.message || '',
        }));
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

  const handleNotificationClick = () => {
    if (!showNotifications) {
      setLoadingNotifications(true);
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate('/user/notifications');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/dang-nhap');
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    navigate('/user/profile');
  };

  const handleEditProfile = () => {
    setShowDropdown(false);
    navigate('/user/profile/edit');
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    setShowChangePassword(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}p trước`;
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const displayName = userData?.fullName || userData?.username || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      
      <header className="sticky top-0 z-40 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-8 text-[#0B3C5D] dark:text-[#f2f4f6] font-body text-sm transition-all duration-300">
        <div className="flex items-center gap-6 flex-1">
          <nav className="hidden lg:flex items-center gap-6">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white transition-colors" to="/user/lo-trinh">
              Lộ trình
            </Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white transition-colors" to="/user/tai-lieu">
              Tài liệu
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className={cn(
                "absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-hidden rounded-xl shadow-2xl border z-50",
                theme === 'dark' ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
              )}>
                {/* Header */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-3 border-b",
                  theme === 'dark' ? "border-slate-700" : "border-slate-200"
                )}>
                  <h3 className={cn(
                    "font-semibold",
                    theme === 'dark' ? "text-white" : "text-slate-900"
                  )}>
                    Thông báo
                  </h3>
                  {unreadCount > 0 && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      theme === 'dark' ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-100 text-blue-600"
                    )}>
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Bell className={cn('w-12 h-12 mb-2', theme === 'dark' ? "text-slate-500" : "text-slate-400")} />
                      <p className={cn(
                        "text-sm",
                        theme === 'dark' ? "text-slate-400" : "text-slate-500"
                      )}>
                        Không có thông báo nào
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer",
                          theme === 'dark' ? "border-slate-800 hover:bg-slate-800" : "border-slate-100 hover:bg-slate-50",
                          !notification.isRead && (theme === 'dark' ? "bg-cyan-500/5" : "bg-blue-50/50")
                        )}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              theme === 'dark' ? "text-white" : "text-slate-900",
                              !notification.isRead && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className={cn(
                              "text-xs mt-0.5 line-clamp-2",
                              theme === 'dark' ? "text-slate-400" : "text-slate-500"
                            )}>
                              {notification.message}
                            </p>
                            <p className={cn(
                              "text-xs mt-1",
                              theme === 'dark' ? "text-slate-500" : "text-slate-400"
                            )}>
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              disabled={markingRead === notification.id}
                              className={cn(
                                "shrink-0 p-1 rounded-full transition-colors",
                                theme === 'dark'
                                  ? "hover:bg-slate-700 text-slate-400"
                                  : "hover:bg-slate-200 text-slate-400"
                              )}
                            >
                              {markingRead === notification.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className={cn(
                    "px-4 py-3 border-t",
                    theme === 'dark' ? "border-slate-700" : "border-slate-200"
                  )}>
                    <button
                      onClick={handleViewAllNotifications}
                      className={cn(
                        "w-full text-center text-sm font-medium transition-colors",
                        theme === 'dark'
                          ? "text-cyan-400 hover:text-cyan-300"
                          : "text-blue-600 hover:text-blue-700"
                      )}
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </Button>
          
          {/* Avatar with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full"
            >
              <Avatar className="w-10 h-10 border-2 border-primary-container/10 hover:border-primary-container/30 transition-colors cursor-pointer">
                <AvatarImage src={userData?.avatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userData?.email || 'No email'}
                  </p>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/user/dashboard');
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Đến Dashboard</span>
                  </button>
                  <button
                    onClick={handleViewProfile}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Xem hồ sơ</span>
                  </button>
                  <button
                    onClick={handleEditProfile}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>
                
                {/* Logout */}
                <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default UserHeader;
