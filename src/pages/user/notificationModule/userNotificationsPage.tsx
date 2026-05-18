import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { Bell, Check, CheckCheck, Trash2, Loader2, Mail, AlertCircle, Info } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function UserNotificationsPage() {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.notifications.readAll, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_assignment':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'course_unassignment':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'submission':
        return <Check className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : !n.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}>
            Thông báo
          </h1>
          <p className={cn(
            "text-sm mt-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Tất cả thông báo đã được đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={markingAll}
            className={cn(
              isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-300"
            )}
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="w-4 h-4 mr-2" />
            )}
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className={cn(
        "flex gap-2 mb-6 p-1 rounded-lg w-fit",
        isDark ? "bg-slate-800" : "bg-slate-100"
      )}>
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            filter === 'all'
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
            filter === 'unread'
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Chưa đọc ({unreadCount})
          {unreadCount > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-slate-400" : "text-slate-600")} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className={cn(
          isDark ? "bg-slate-900 border-slate-800" : ""
        )}>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bell className={cn("w-16 h-16 mb-4", isDark ? "text-slate-600" : "text-slate-400")} />
            <p className={cn(
              "text-lg font-medium mb-2",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-500" : "text-slate-400"
            )}>
              {filter === 'unread'
                ? 'Tất cả thông báo của bạn đã được đọc'
                : 'Khi có thông báo mới, bạn sẽ thấy ở đây'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "transition-all duration-200",
                isDark
                  ? "bg-slate-900 border-slate-800"
                  : "",
                !notification.isRead && (
                  isDark ? "border-l-4 border-l-cyan-500" : "border-l-4 border-l-blue-500"
                )
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-semibold text-base",
                          isDark ? "text-white" : "text-slate-900",
                          !notification.isRead && "text-blue-600 dark:text-blue-400"
                        )}>
                          {notification.title}
                        </h3>
                        <p className={cn(
                          "text-sm mt-1",
                          isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                          {notification.message}
                        </p>
                        <p className={cn(
                          "text-xs mt-2",
                          isDark ? "text-slate-500" : "text-slate-400"
                        )}>
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          disabled={markingRead === notification.id}
                          className={cn(
                            "shrink-0",
                            isDark
                              ? "text-slate-400 hover:text-white hover:bg-slate-800"
                              : "text-slate-500 hover:text-slate-900"
                          )}
                        >
                          {markingRead === notification.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
