import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import {
  Bell, Check, CheckCheck, Loader2, Mail, AlertCircle, Info,
  CheckCircle, XCircle, BookOpen, ArrowRight, Eye, FileText,
  Code, MessageSquare, Clock, User, ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationMetadata {
  lessonId?: string;
  lessonTitle?: string;
  status?: string;
  feedback?: string;
  actionUrl?: string;
  courseId?: string;
  courseTitle?: string;
  lectureId?: string;
  lectureName?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: NotificationMetadata | string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
}

export default function LectureNotificationsPage() {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'lesson'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lessonDetails, setLessonDetails] = useState<any>(null);

  // Fetch lesson details for review notifications
  const fetchLessonDetails = async (lessonId: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lecture.lessonContent(lessonId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setLessonDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching lesson details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Open detail modal
  const openDetailModal = async (notification: Notification) => {
    console.log('[NOTIFICATION] openDetailModal called', notification);
    setSelectedNotification(notification);
    setShowDetailModal(true);

    const metadata = typeof notification.metadata === 'string'
      ? JSON.parse(notification.metadata)
      : notification.metadata;

    console.log('[NOTIFICATION] metadata:', metadata);
    
    if (metadata?.lessonId) {
      console.log('[NOTIFICATION] Fetching lesson details for:', metadata.lessonId);
      await fetchLessonDetails(metadata.lessonId);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.notifications.list, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        const transformed = (data.data || []).map((n: any) => {
          let metadata: NotificationMetadata | undefined;
          try {
            metadata = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
          } catch {
            metadata = undefined;
          }
          return {
            ...n,
            message: n.content || n.message || '',
            metadata,
          };
        });
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
    // Poll for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
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
      case 'lesson_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'lesson_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'lesson_published':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'new_lesson_available':
      case 'lesson_submitted':
        return <BookOpen className="w-5 h-5 text-cyan-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  // Handle notification click - show detail modal
  const handleNotificationClick = async (notification: Notification) => {
    console.log('[NOTIFICATION] Clicked:', notification.type, notification.id);
    
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Check if this is a lesson review notification - show detail modal
    if (isLessonReviewNotification(notification.type)) {
      console.log('[NOTIFICATION] Opening detail modal for lesson review');
      await openDetailModal(notification);
      return;
    }

    // For other notifications, show simple detail modal
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  // Navigate to lesson editor
  const handleGoToLesson = () => {
    if (selectedNotification) {
      const metadata = typeof selectedNotification.metadata === 'string'
        ? JSON.parse(selectedNotification.metadata)
        : selectedNotification.metadata;

      if (metadata?.actionUrl) {
        navigate(metadata.actionUrl);
      } else if (metadata?.lessonId) {
        navigate(`/lecture/lessons/${metadata.lessonId}/edit`);
      }
      setShowDetailModal(false);
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'lesson') return ['lesson_approved', 'lesson_rejected', 'lesson_published', 'new_lesson_available'].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get status badge for lesson notifications
  const getStatusBadge = (notification: Notification) => {
    const metadata = typeof notification.metadata === 'string'
      ? JSON.parse(notification.metadata)
      : notification.metadata;

    if (!metadata?.status) return null;

    switch (metadata.status) {
      case 'APPROVED':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Từ chối</Badge>;
      case 'PUBLISHED':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Đã xuất bản</Badge>;
      default:
        return null;
    }
  };

  // Check if notification has lesson review type
  const isLessonReviewNotification = (type: string) => {
    return ['lesson_approved', 'lesson_rejected', 'lesson_published'].includes(type);
  };

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
              isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300"
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
        <button
          onClick={() => setFilter('lesson')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
            filter === 'lesson'
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Duyệt bài ({notifications.filter(n => isLessonReviewNotification(n.type)).length})
        </button>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-slate-400" : "text-slate-600")} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className={cn(isDark ? "bg-slate-900 border-slate-800" : "")}>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bell className={cn("w-16 h-16 mb-4", isDark ? "text-slate-600" : "text-slate-400")} />
            <p className={cn(
              "text-lg font-medium mb-2",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>
              {filter === 'unread' ? 'Không có thông báo chưa đọc' :
               filter === 'lesson' ? 'Không có thông báo duyệt bài' : 'Không có thông báo nào'}
            </p>
            <p className={cn("text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
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
                "transition-all duration-200 cursor-pointer hover:shadow-md",
                isDark ? "bg-slate-900 border-slate-800 hover:border-cyan-500/30" : "hover:border-cyan-500/50",
                !notification.isRead && (
                  isDark ? "border-l-4 border-l-cyan-500" : "border-l-4 border-l-blue-500"
                ),
                isLessonReviewNotification(notification.type) && (
                  isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                )
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full shrink-0",
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            "font-semibold text-base",
                            isDark ? "text-white" : "text-slate-900",
                            !notification.isRead && "text-blue-600 dark:text-blue-400"
                          )}>
                            {notification.title}
                          </h3>
                          {getStatusBadge(notification)}
                        </div>
                        <p className={cn(
                          "text-sm mt-1",
                          isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                          {notification.message}
                        </p>
                        {/* Show feedback if exists */}
                        {(() => {
                          const metadata = typeof notification.metadata === 'string'
                            ? JSON.parse(notification.metadata)
                            : notification.metadata;
                          return metadata?.feedback ? (
                            <div className={cn(
                              "mt-2 p-2 rounded-md text-sm",
                              isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                            )}>
                              <span className="font-medium">Phản hồi từ Admin: </span>
                              {metadata.feedback}
                            </div>
                          ) : null;
                        })()}
                        <div className="flex items-center gap-3 mt-2">
                          <p className={cn(
                            "text-xs",
                            isDark ? "text-slate-500" : "text-slate-400"
                          )}>
                            {formatDate(notification.createdAt)}
                          </p>
                          {isLessonReviewNotification(notification.type) && (
                            <span className={cn(
                              "text-xs flex items-center gap-1",
                              isDark ? "text-cyan-400" : "text-cyan-600"
                            )}>
                              <ArrowRight className="w-3 h-3" />
                              Bấm để xem chi tiết
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        {selectedNotification && (
          <NotificationDetailModal
            notification={selectedNotification}
            lessonDetails={lessonDetails}
            loading={detailLoading}
            isDark={isDark}
            onClose={() => {
              setShowDetailModal(false);
              setLessonDetails(null);
            }}
            onGoToLesson={() => {
              const metadata = typeof selectedNotification.metadata === 'string'
                ? JSON.parse(selectedNotification.metadata)
                : selectedNotification.metadata;
              if (metadata?.lessonId) {
                navigate(`/lecture/lessons/${metadata.lessonId}/edit`);
              }
              setShowDetailModal(false);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

// Detail Modal Component
const NotificationDetailModal = ({
  notification,
  lessonDetails,
  loading,
  isDark,
  onClose,
  onGoToLesson
}: {
  notification: Notification;
  lessonDetails: any;
  loading: boolean;
  isDark: boolean;
  onClose: () => void;
  onGoToLesson: () => void;
}) => {
  const metadata = typeof notification.metadata === 'string'
    ? JSON.parse(notification.metadata)
    : notification.metadata;

  const parseJsonSafe = (jsonStr: string | null | undefined) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const testCases = parseJsonSafe(lessonDetails?.lessonContent?.testCases);
  const hints = parseJsonSafe(lessonDetails?.lessonContent?.hints);

  return (
    <DialogContent className={cn(
      "max-w-4xl max-h-[85vh]",
      isDark ? 'bg-slate-900 border-slate-700' : ''
    )}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-3 rounded-xl',
            notification.type === 'lesson_approved' || notification.type === 'lesson_published'
              ? 'bg-green-500/10'
              : notification.type === 'lesson_rejected'
              ? 'bg-red-500/10'
              : 'bg-blue-500/10'
          )}>
            {notification.type === 'lesson_approved' || notification.type === 'lesson_published' ? (
              <CheckCircle className={cn('w-6 h-6',
                notification.type === 'lesson_published' ? 'text-emerald-500' : 'text-green-500'
              )} />
            ) : notification.type === 'lesson_rejected' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Bell className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div>
            <DialogTitle className={cn(isDark ? 'text-white' : '')}>
              {notification.title}
            </DialogTitle>
            <DialogDescription className={cn('flex items-center gap-2 mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
              <Clock className="w-3 h-3" />
              {new Date(notification.createdAt).toLocaleString('vi-VN')}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className={cn('mt-4 max-h-[calc(85vh-180px)]', isDark ? 'pr-4' : '')}>
        <div className="space-y-6 pr-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn(
              notification.type === 'lesson_approved'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : notification.type === 'lesson_rejected'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : notification.type === 'lesson_published'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              'px-3 py-1'
            )}>
              {notification.type === 'lesson_approved' ? 'Đã duyệt' :
               notification.type === 'lesson_rejected' ? 'Từ chối' :
               notification.type === 'lesson_published' ? 'Đã xuất bản' : notification.type}
            </Badge>
            {metadata?.courseTitle && (
              <Badge variant="outline" className={cn(isDark ? 'border-slate-600 text-slate-400' : '')}>
                <BookOpen className="w-3 h-3 mr-1" />
                {metadata.courseTitle}
              </Badge>
            )}
          </div>

          {/* Message */}
          <div className={cn(
            'p-4 rounded-xl',
            isDark ? 'bg-slate-800/50' : 'bg-slate-50'
          )}>
            <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
              {notification.message}
            </p>
          </div>

          {/* Admin Feedback */}
          {metadata?.feedback && (
            <div className={cn(
              'p-4 rounded-xl border',
              notification.type === 'lesson_rejected'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-yellow-500/5 border-yellow-500/20'
            )}>
              <div className="flex items-start gap-2">
                <MessageSquare className={cn('w-5 h-5 shrink-0 mt-0.5',
                  notification.type === 'lesson_rejected'
                    ? isDark ? 'text-red-400' : 'text-red-600'
                    : isDark ? 'text-yellow-400' : 'text-yellow-600'
                )} />
                <div>
                  <h4 className={cn('font-medium mb-1',
                    notification.type === 'lesson_rejected'
                      ? isDark ? 'text-red-400' : 'text-red-700'
                      : isDark ? 'text-yellow-400' : 'text-yellow-700'
                  )}>
                    Phản hồi từ Admin
                  </h4>
                  <p className={cn('text-sm whitespace-pre-wrap',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}>
                    {metadata.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Details */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
            </div>
          ) : lessonDetails ? (
            <>
              {/* Lesson Info */}
              <div className={cn(
                'p-4 rounded-xl border',
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              )}>
                <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                  <FileText className="w-4 h-4 text-cyan-500" />
                  Thông tin bài học
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={cn(isDark ? 'text-slate-500' : 'text-slate-500')}>Tiêu đề:</span>
                    <span className={cn('ml-2', isDark ? 'text-slate-300' : 'text-slate-700')}>
                      {lessonDetails.title}
                    </span>
                  </div>
                  <div>
                    <span className={cn(isDark ? 'text-slate-500' : 'text-slate-500')}>Trạng thái:</span>
                    <Badge className={cn('ml-2',
                      lessonDetails.status === 'PUBLISHED'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : lessonDetails.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    )}>
                      {lessonDetails.status === 'PUBLISHED' ? 'Đã xuất bản' :
                       lessonDetails.status === 'REJECTED' ? 'Từ chối' :
                       lessonDetails.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {lessonDetails.lessonContent?.content && (
                <div>
                  <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <FileText className="w-4 h-4 text-cyan-500" />
                    Nội dung bài học
                  </h4>
                  <div className={cn(
                    'p-4 rounded-xl border max-h-48 overflow-y-auto',
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
                  )}>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: lessonDetails.lessonContent.content || '' }}
                    />
                  </div>
                </div>
              )}

              {/* Test Cases Summary */}
              {testCases.length > 0 && (
                <div>
                  <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <Code className="w-4 h-4 text-cyan-500" />
                    Test Cases ({testCases.length})
                  </h4>
                  <div className={cn(
                    'rounded-xl border overflow-hidden',
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  )}>
                    <div className={cn('px-4 py-2 border-b', isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                      <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                        {testCases.filter((tc: any) => tc.isPublic).length} public, {testCases.filter((tc: any) => !tc.isPublic).length} hidden
                      </span>
                    </div>
                    <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                      {testCases.slice(0, 5).map((tc: any, idx: number) => (
                        <div key={idx} className={cn(
                          'p-2 rounded text-xs font-mono',
                          isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-600'
                        )}>
                          <span className="font-bold text-cyan-500">#{idx + 1}</span> {tc.input} → {tc.expectedOutput}
                        </div>
                      ))}
                      {testCases.length > 5 && (
                        <p className={cn('text-xs text-center', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          + {testCases.length - 5} test cases khác
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hints Summary */}
              {hints.length > 0 && (
                <div>
                  <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    Gợi ý ({hints.length})
                  </h4>
                  <div className={cn(
                    'rounded-xl border overflow-hidden',
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  )}>
                    <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                      {hints.map((hint: any, idx: number) => (
                        <div key={idx} className={cn(
                          'p-2 rounded text-sm',
                          isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                        )}>
                          <div className="flex items-center justify-between">
                            <span className={cn('font-medium', isDark ? 'text-yellow-400' : 'text-yellow-600')}>
                              Gợi ý #{idx + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              -{hint.penalty} điểm
                            </Badge>
                          </div>
                          <p className={cn('mt-1 text-xs truncate', isDark ? 'text-slate-400' : 'text-slate-600')}>
                            {hint.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={cn(
              'p-8 text-center rounded-xl border-2 border-dashed',
              isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
            )}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Không có thông tin chi tiết bài học</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className={cn(isDark ? 'border-slate-600 text-slate-300' : '')}
            >
              Đóng
            </Button>
            {metadata?.lessonId && (
              <Button
                onClick={onGoToLesson}
                className="bg-cyan-500 hover:bg-cyan-600 text-white ml-auto"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Chỉnh sửa bài học
              </Button>
            )}
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};
