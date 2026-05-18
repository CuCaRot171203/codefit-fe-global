import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import {
  Bell, Check, CheckCheck, Loader2, Mail, AlertCircle, Info,
  CheckCircle, XCircle, BookOpen, ArrowRight, Eye, FileText,
  Code, MessageSquare, Clock, User, Trash2, Filter, Search,
  ChevronDown, Send, RefreshCw, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pagination } from 'antd';
import { message } from 'antd';

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
  recipientName?: string;
}

interface LessonDetails {
  id: string;
  title: string;
  status: string;
  phase?: {
    title: string;
    course?: {
      title: string;
    };
  };
  lessonContent?: {
    content: string;
    testCases: string;
    hints: string;
    starterCode: string;
  };
}

const AdminNotificationManagementPage = () => {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lessonDetails, setLessonDetails] = useState<LessonDetails | null>(null);
  const [sentPage, setSentPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const [sentRes, allRes] = await Promise.all([
        fetch(API_ENDPOINTS.notifications.sent, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(API_ENDPOINTS.notifications.list, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      const sentData = await sentRes.json();
      const allData = await allRes.json();

      if (sentData.success) {
        setSentNotifications(sentData.data || []);
      }
      if (allData.success) {
        const transformed = (allData.data || []).map((n: any) => ({
          ...n,
          message: n.content || n.message || '',
          metadata: n.metadata,
        }));
        setAllNotifications(transformed);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.notifications.delete(notificationId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã xóa thông báo');
        fetchNotifications();
      } else {
        message.error(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

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

  const openDetailModal = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);

    const metadata = typeof notification.metadata === 'string'
      ? JSON.parse(notification.metadata)
      : notification.metadata;

    if (metadata?.lessonId) {
      await fetchLessonDetails(metadata.lessonId);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson_approved': return 'Đã duyệt';
      case 'lesson_rejected': return 'Từ chối';
      case 'lesson_published': return 'Xuất bản';
      case 'course_assignment': return 'Giao khóa học';
      case 'course_unassignment': return 'Hủy khóa học';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'lesson_approved':
      case 'lesson_published':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'lesson_rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'course_assignment':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'course_unassignment':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterNotifications = (notifications: Notification[]) => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || n.type === typeFilter;
      return matchesSearch && matchesType;
    });
  };

  const parseJsonSafe = (jsonStr: string | null | undefined) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const metadata = typeof notification.metadata === 'string'
      ? JSON.parse(notification.metadata)
      : notification.metadata;

    return (
      <Card
        className={cn(
          'transition-all hover:shadow-md cursor-pointer',
          isDark ? 'bg-slate-800 border-slate-700 hover:border-cyan-500/30' : 'hover:border-cyan-500/50'
        )}
        onClick={() => openDetailModal(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-2 rounded-full shrink-0',
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            )}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      'font-semibold text-base',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {notification.title}
                    </h3>
                    <Badge className={cn(getTypeBadgeColor(notification.type))}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                  </div>
                  <p className={cn(
                    'text-sm mt-1 line-clamp-2',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {notification.message}
                  </p>
                  {/* Show feedback if exists */}
                  {metadata?.feedback && (
                    <div className={cn(
                      'mt-2 p-2 rounded-md text-sm',
                      notification.type === 'lesson_rejected'
                        ? isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700'
                        : isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                    )}>
                      <span className="font-medium">Phản hồi: </span>
                      {metadata.feedback}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className={cn(
                      'flex items-center gap-1',
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )}>
                      <Clock className="w-3 h-3" />
                      {formatDate(notification.createdAt)}
                    </span>
                    {metadata?.courseTitle && (
                      <span className={cn(
                        'flex items-center gap-1',
                        isDark ? 'text-cyan-400' : 'text-cyan-600'
                      )}>
                        <BookOpen className="w-3 h-3" />
                        {metadata.courseTitle}
                      </span>
                    )}
                    {notification.recipientName && (
                      <span className={cn(
                        'flex items-center gap-1',
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      )}>
                        <User className="w-3 h-3" />
                        {notification.recipientName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(notification);
                    }}
                    className={cn(
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500'
                    )}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="text-red-500/70 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredSentNotifications = filterNotifications(sentNotifications);
  const filteredAllNotifications = filterNotifications(allNotifications);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const lessonReviewNotifications = sentNotifications.filter((n) =>
    ['lesson_approved', 'lesson_rejected', 'lesson_published'].includes(n.type)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Quản lý Thông báo
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Xem và quản lý các thông báo đã gửi cho giảng viên
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotifications}
          className={cn(isDark ? 'border-slate-700 text-slate-300' : '')}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
                <Send className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {sentNotifications.length}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Đã gửi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', isDark ? 'bg-green-500/10' : 'bg-green-100')}>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {sentNotifications.filter((n) => n.type === 'lesson_approved' || n.type === 'lesson_published').length}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Duyệt/Xuất bản
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', isDark ? 'bg-red-500/10' : 'bg-red-100')}>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {sentNotifications.filter((n) => n.type === 'lesson_rejected').length}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Từ chối
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', isDark ? 'bg-yellow-500/10' : 'bg-yellow-100')}>
                <Bell className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {unreadCount}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chưa đọc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sent">
        <TabsList className={cn('mb-4', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
          <TabsTrigger value="sent" className={cn(
            isDark ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white' : ''
          )}>
            <Send className="w-4 h-4 mr-2" />
            Đã gửi ({sentNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="all" className={cn(
            isDark ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white' : ''
          )}>
            <Bell className="w-4 h-4 mr-2" />
            Tất cả ({allNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className={cn(
            isDark ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white' : ''
          )}>
            <BookOpen className="w-4 h-4 mr-2" />
            Duyệt bài ({lessonReviewNotifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Sent Notifications Tab */}
        <TabsContent value="sent">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )} />
              <Input
                placeholder="Tìm kiếm thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'pl-10',
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : ''
                )}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm',
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
              )}
            >
              <option value="all">Tất cả loại</option>
              <option value="lesson_approved">Đã duyệt</option>
              <option value="lesson_rejected">Từ chối</option>
              <option value="lesson_published">Xuất bản</option>
              <option value="course_assignment">Giao khóa học</option>
            </select>
          </div>

          {/* Notification List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
            </div>
          ) : filteredSentNotifications.length === 0 ? (
            <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <Send className={cn('w-12 h-12 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
              <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Chưa có thông báo nào được gửi
              </p>
              <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Thông báo sẽ xuất hiện khi bạn duyệt hoặc từ chối bài học
              </p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {filteredSentNotifications
                  .slice((sentPage - 1) * PAGE_SIZE, sentPage * PAGE_SIZE)
                  .map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
              </div>
              <div className="flex justify-center mt-4">
                <Pagination
                  current={sentPage}
                  pageSize={PAGE_SIZE}
                  total={filteredSentNotifications.length}
                  onChange={(p) => setSentPage(p)}
                  showSizeChanger={false}
                  showTotal={(total) => `Tổng ${total} thông báo`}
                />
              </div>
            </>
          )}
        </TabsContent>

        {/* All Notifications Tab */}
        <TabsContent value="all">
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
              </div>
            ) : filteredAllNotifications.length === 0 ? (
              <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
                <Bell className={cn('w-12 h-12 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
                <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  Không có thông báo nào
                </p>
              </Card>
            ) : (
              <>
                {filteredAllNotifications
                  .slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
                  .map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        isDark ? 'bg-slate-800 border-slate-700' : '',
                        !notification.isRead && (isDark ? 'border-l-4 border-l-cyan-500' : 'border-l-4 border-l-blue-500')
                      )}
                      onClick={() => openDetailModal(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-2 rounded-full',
                            isDark ? 'bg-slate-700' : 'bg-slate-100'
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                              )}
                            </div>
                            <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
                              {notification.message}
                            </p>
                            <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={allPage}
                    pageSize={PAGE_SIZE}
                    total={filteredAllNotifications.length}
                    onChange={(p) => setAllPage(p)}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} thông báo`}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Lesson Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-3">
            {lessonReviewNotifications.length === 0 ? (
              <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
                <BookOpen className={cn('w-12 h-12 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
                <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  Chưa có thông báo duyệt bài
                </p>
                <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Thông báo sẽ xuất hiện khi bạn duyệt hoặc từ chối bài học
                </p>
              </Card>
            ) : (
              <>
                {lessonReviewNotifications
                  .slice((reviewsPage - 1) * PAGE_SIZE, reviewsPage * PAGE_SIZE)
                  .map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={reviewsPage}
                    pageSize={PAGE_SIZE}
                    total={lessonReviewNotifications.length}
                    onChange={(p) => setReviewsPage(p)}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng ${total} thông báo`}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        {selectedNotification && (
          <DialogContent className={cn(
            "max-w-4xl max-h-[85vh]",
            isDark ? 'bg-slate-900 border-slate-700' : ''
          )}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-3 rounded-xl',
                  selectedNotification.type === 'lesson_approved' || selectedNotification.type === 'lesson_published'
                    ? 'bg-green-500/10'
                    : selectedNotification.type === 'lesson_rejected'
                    ? 'bg-red-500/10'
                    : 'bg-blue-500/10'
                )}>
                  {selectedNotification.type === 'lesson_approved' || selectedNotification.type === 'lesson_published' ? (
                    <CheckCircle className={cn('w-6 h-6',
                      selectedNotification.type === 'lesson_published' ? 'text-emerald-500' : 'text-green-500'
                    )} />
                  ) : selectedNotification.type === 'lesson_rejected' ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <Bell className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div>
                  <DialogTitle className={isDark ? 'text-white' : ''}>
                    {selectedNotification.title}
                  </DialogTitle>
                  <DialogDescription className={cn('flex items-center gap-2 mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    <Clock className="w-3 h-3" />
                    {formatDate(selectedNotification.createdAt)}
                    {selectedNotification.recipientName && (
                      <>
                        <span>•</span>
                        <User className="w-3 h-3" />
                        Gửi đến: {selectedNotification.recipientName}
                      </>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className={cn('mt-4 max-h-[calc(85vh-180px)]', isDark ? 'pr-4' : '')}>
              <div className="space-y-6 pr-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={cn(getTypeBadgeColor(selectedNotification.type), 'px-3 py-1')}>
                    {getTypeLabel(selectedNotification.type)}
                  </Badge>
                </div>

                {/* Message */}
                <div className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-800/50' : 'bg-slate-50'
                )}>
                  <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Feedback */}
                {(() => {
                  const metadata = typeof selectedNotification.metadata === 'string'
                    ? JSON.parse(selectedNotification.metadata)
                    : selectedNotification.metadata;
                  return metadata?.feedback ? (
                    <div className={cn(
                      'p-4 rounded-xl border',
                      selectedNotification.type === 'lesson_rejected'
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-yellow-500/5 border-yellow-500/20'
                    )}>
                      <div className="flex items-start gap-2">
                        <MessageSquare className={cn('w-5 h-5 shrink-0 mt-0.5',
                          selectedNotification.type === 'lesson_rejected'
                            ? isDark ? 'text-red-400' : 'text-red-600'
                            : isDark ? 'text-yellow-400' : 'text-yellow-600'
                        )} />
                        <div>
                          <h4 className={cn('font-medium mb-1',
                            selectedNotification.type === 'lesson_rejected'
                              ? isDark ? 'text-red-400' : 'text-red-700'
                              : isDark ? 'text-yellow-400' : 'text-yellow-700'
                          )}>
                            Phản hồi đã gửi
                          </h4>
                          <p className={cn('text-sm whitespace-pre-wrap',
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          )}>
                            {metadata.feedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Lesson Details */}
                {detailLoading ? (
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
                            {lessonDetails.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Test Cases Summary */}
                    {parseJsonSafe(lessonDetails.lessonContent?.testCases).length > 0 && (
                      <div>
                        <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                          <Code className="w-4 h-4 text-cyan-500" />
                          Test Cases ({parseJsonSafe(lessonDetails.lessonContent?.testCases).length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {parseJsonSafe(lessonDetails.lessonContent?.testCases).map((tc: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={cn(
                                tc.isPublic
                                  ? 'border-green-500/30 text-green-400'
                                  : 'border-purple-500/30 text-purple-400',
                                isDark ? '' : ''
                              )}
                            >
                              #{idx + 1} ({tc.points}đ)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hints Summary */}
                    {parseJsonSafe(lessonDetails.lessonContent?.hints).length > 0 && (
                      <div>
                        <h4 className={cn('font-medium mb-2 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                          <BookOpen className="w-4 h-4 text-cyan-500" />
                          Gợi ý ({parseJsonSafe(lessonDetails.lessonContent?.hints).length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {parseJsonSafe(lessonDetails.lessonContent?.hints).map((hint: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={cn(
                                'border-yellow-500/30 text-yellow-400',
                                isDark ? '' : ''
                              )}
                            >
                              #{idx + 1} (-{hint.penalty}đ)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                    className={cn(isDark ? 'border-slate-600 text-slate-300' : '')}
                  >
                    Đóng
                  </Button>
                  {(() => {
                    const metadata = typeof selectedNotification.metadata === 'string'
                      ? JSON.parse(selectedNotification.metadata)
                      : selectedNotification.metadata;
                    return metadata?.lessonId ? (
                      <Button
                        onClick={() => {
                          navigate(`/admin/lesson-reviews`);
                          setShowDetailModal(false);
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white ml-auto"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Xem trang duyệt bài
                      </Button>
                    ) : null;
                  })()}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AdminNotificationManagementPage;
