import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import {
  BookOpen, Clock, Play, CheckCircle, AlertCircle,
  Calendar, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { message } from 'antd';

interface LessonRequest {
  id: string;
  lessonId: string;
  lectureId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'CANCELLED';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    phase: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
}

const LectureLessonRequestsPage = () => {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.myRequests, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorking = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.start(requestId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã bắt đầu làm việc');
        fetchRequests();
        // Navigate to editor
        const request = requests.find(r => r.id === requestId);
        if (request) {
          navigate(`/lecture/lessons/${request.lessonId}/edit`);
        }
      } else {
        message.error(data.message || 'Bắt đầu thất bại');
      }
    } catch (error) {
      message.error('Bắt đầu thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleContinueWorking = (lessonId: string) => {
    navigate(`/lecture/lessons/${lessonId}/edit`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Chờ bắt đầu' },
      IN_PROGRESS: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Play, label: 'Đang làm' },
      SUBMITTED: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Đã nộp' },
      CANCELLED: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: AlertCircle, label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge className={cn('flex items-center gap-1 w-fit', config.color)}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: 'Quá hạn', className: 'text-red-500' };
    if (diff === 0) return { text: 'Hết hạn hôm nay', className: 'text-orange-500' };
    if (diff <= 3) return { text: `${diff} ngày`, className: 'text-orange-500' };
    return { text: `${diff} ngày`, className: isDark ? 'text-slate-300' : 'text-slate-600' };
  };

  const getDaysRemainingValue = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredRequests = requests.filter(request => {
    // Status filter
    if (statusFilter === 'active') {
      if (!['PENDING', 'IN_PROGRESS'].includes(request.status)) return false;
    } else if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }

    // Priority filter (based on dueDate proximity)
    if (priorityFilter !== 'all') {
      const days = getDaysRemainingValue(request.dueDate);
      if (priorityFilter === 'high' && days !== null && days >= -3) return false;
      if (priorityFilter === 'medium' && (days === null || days < -3 || days > 7)) return false;
      if (priorityFilter === 'low' && (days === null || days <= 7)) return false;
    }

    // Time filter
    if (timeFilter !== 'all' && request.dueDate) {
      const now = new Date();
      const due = new Date(request.dueDate);
      if (timeFilter === 'today') {
        if (due.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === 'week') {
        const weekLater = new Date(now);
        weekLater.setDate(weekLater.getDate() + 7);
        if (due > weekLater) return false;
      } else if (timeFilter === 'month') {
        const monthLater = new Date(now);
        monthLater.setMonth(monthLater.getMonth() + 1);
        if (due > monthLater) return false;
      }
    } else if (timeFilter !== 'all') {
      return false;
    }

    return true;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    submitted: requests.filter(r => r.status === 'SUBMITTED').length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
          Bài học được giao
        </h1>
        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
          Quản lý và triển khai nội dung bài học được giao cho bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Tổng bài</p>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>{stats.total}</p>
              </div>
              <BookOpen className={cn('w-10 h-10 opacity-20', isDark ? 'text-white' : 'text-slate-400')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Chờ bắt đầu</p>
                <p className={cn('text-2xl font-bold text-yellow-500')}>{stats.pending}</p>
              </div>
              <Clock className={cn('w-10 h-10 text-yellow-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đang làm</p>
                <p className={cn('text-2xl font-bold text-blue-500')}>{stats.inProgress}</p>
              </div>
              <Play className={cn('w-10 h-10 text-blue-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đã nộp</p>
                <p className={cn('text-2xl font-bold text-green-500')}>{stats.submitted}</p>
              </div>
              <CheckCircle className={cn('w-10 h-10 text-green-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className={cn(
          'flex flex-col sm:flex-row sm:items-center gap-4',
          isDark ? '' : ''
        )}>
          <TabsList className={cn(
            'w-full sm:w-auto flex-shrink-0',
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          )}>
            <TabsTrigger
              value="status"
              className={cn(
                isDark
                  ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-white data-[state=active]:text-slate-950'
              )}
            >
              Trạng thái
            </TabsTrigger>
            <TabsTrigger
              value="priority"
              className={cn(
                isDark
                  ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-white data-[state=active]:text-slate-950'
              )}
            >
              Mức ưu tiên
            </TabsTrigger>
            <TabsTrigger
              value="time"
              className={cn(
                isDark
                  ? 'data-[state=active]:bg-slate-700 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-white data-[state=active]:text-slate-950'
              )}
            >
              Thời gian
            </TabsTrigger>
          </TabsList>

          {/* Status sub-filters */}
          <TabsContent value="status" className="mt-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'all', label: 'Tất cả' },
                { value: 'PENDING', label: 'Chờ bắt đầu' },
                { value: 'IN_PROGRESS', label: 'Đang làm' },
                { value: 'SUBMITTED', label: 'Đã nộp' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    statusFilter === opt.value
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Priority sub-filters */}
          <TabsContent value="priority" className="mt-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'high', label: 'Cao (gấp/hết hạn)' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'low', label: 'Thấp (còn nhiều thời gian)' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    priorityFilter === opt.value
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Time sub-filters */}
          <TabsContent value="time" className="mt-0 flex-1">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTimeFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    timeFilter === opt.value
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Lesson Requests */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <BookOpen className={cn('w-12 h-12 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
          <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
            Không có bài học nào được giao
          </p>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Bạn sẽ nhận được thông báo khi có bài học mới
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => {
            const daysRemaining = getDaysRemaining(request.dueDate);
            
            return (
              <Card 
                key={request.id} 
                className={cn(
                  'transition-all hover:shadow-lg',
                  isDark ? 'bg-slate-800 border-slate-700 hover:border-cyan-500/50' : 'hover:border-cyan-500/50'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={cn('text-lg', isDark ? 'text-white' : '')}>
                        {request.lesson.title}
                      </CardTitle>
                      <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {request.lesson.phase.course.title}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Course Info */}
                    <div className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      <span className="font-medium">Phase:</span> {request.lesson.phase.title}
                    </div>

                    {/* Due Date */}
                    {daysRemaining && (
                      <div className={cn('flex items-center gap-2 text-sm', daysRemaining.className)}>
                        <Calendar className="w-4 h-4" />
                        {daysRemaining.text}
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div className={cn(
                        'p-2 rounded text-sm',
                        isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'
                      )}>
                        {request.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      {request.status === 'PENDING' && (
                        <Button
                          onClick={() => handleStartWorking(request.id)}
                          disabled={actionLoading === request.id}
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          Bắt đầu làm
                        </Button>
                      )}
                      {request.status === 'IN_PROGRESS' && (
                        <Button
                          onClick={() => handleContinueWorking(request.lessonId)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Tiếp tục làm
                        </Button>
                      )}
                      {request.status === 'SUBMITTED' && (
                        <div className={cn(
                          'flex items-center justify-center gap-2 py-2 text-green-500',
                          isDark ? 'text-green-400' : ''
                        )}>
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Đã nộp - Chờ duyệt</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LectureLessonRequestsPage;
