import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import {
  ArrowLeft, BookOpen, User, Clock, Calendar,
  CheckCircle, XCircle, AlertCircle, FileText, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { message } from 'antd';

interface LessonRequestDetail {
  id: string;
  lessonId: string;
  lectureId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'CANCELLED';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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
  lecture: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  };
}

const LessonRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [request, setRequest] = useState<LessonRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id]);

  const fetchDetail = async (requestId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.detail(requestId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setRequest(data.data);
      } else {
        message.error(data.message || 'Không thể tải chi tiết yêu cầu');
      }
    } catch (error) {
      console.error('Error fetching lesson request detail:', error);
      message.error('Không thể tải chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.approve(id), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã duyệt yêu cầu thành công');
        fetchDetail(id);
      } else {
        message.error(data.message || 'Duyệt thất bại');
      }
    } catch (error) {
      message.error('Duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.reject(id), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã từ chối yêu cầu');
        setRejectDialogOpen(false);
        fetchDetail(id);
      } else {
        message.error(data.message || 'Từ chối thất bại');
      }
    } catch (error) {
      message.error('Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Chờ xử lý' },
      IN_PROGRESS: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle, label: 'Đang làm' },
      SUBMITTED: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Đã nộp' },
      CANCELLED: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle, label: 'Đã hủy' },
    };
    const c = config[status] || config.PENDING;
    return (
      <Badge className={cn('flex items-center gap-1 w-fit', c.color)}>
        <c.icon className="w-3 h-3" />
        {c.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={cn('w-12 h-12 animate-spin text-cyan-500')} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FileText className={cn('w-16 h-16 mb-4', isDark ? 'text-slate-600' : 'text-slate-400')} />
        <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
          Không tìm thấy yêu cầu
        </p>
        <Button onClick={() => navigate('/admin/lesson-requests')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/lesson-requests')}
          className={cn(isDark ? 'text-slate-300 hover:bg-slate-800' : '')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Chi tiết yêu cầu bài học
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Mã yêu cầu: <span className="font-mono text-xs">{request.id}</span>
          </p>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lesson Info */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2 text-base', isDark ? 'text-white' : '')}>
              <BookOpen className="w-4 h-4 text-cyan-500" />
              Thông tin bài học
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Tên bài học
              </p>
              <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                {request.lesson.title}
              </p>
            </div>
            <div>
              <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Loại bài học
              </p>
              <p className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>
                {request.lesson.type}
              </p>
            </div>
            <div>
              <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Khóa học
              </p>
              <p className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>
                {request.lesson.phase.course.title}
              </p>
            </div>
            <div>
              <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Phase
              </p>
              <p className={cn(isDark ? 'text-slate-300' : 'text-slate-700')}>
                {request.lesson.phase.title}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lecture Info */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2 text-base', isDark ? 'text-white' : '')}>
              <User className="w-4 h-4 text-cyan-500" />
              Giảng viên được giao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {request.lecture.fullName?.[0] || request.lecture.username[0]}
                </span>
              </div>
              <div>
                <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {request.lecture.fullName || request.lecture.username}
                </p>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {request.lecture.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Dates */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2 text-base', isDark ? 'text-white' : '')}>
              <Calendar className="w-4 h-4 text-cyan-500" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Ngày tạo</p>
              <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                {new Date(request.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Cập nhật lần cuối</p>
              <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                {new Date(request.updatedAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Hạn chót</p>
              <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                {request.dueDate
                  ? new Date(request.dueDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'Không có'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2 text-base', isDark ? 'text-white' : '')}>
              <FileText className="w-4 h-4 text-cyan-500" />
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request.notes ? (
              <p className={cn('text-sm whitespace-pre-wrap', isDark ? 'text-slate-300' : 'text-slate-700')}>
                {request.notes}
              </p>
            ) : (
              <p className={cn('text-sm italic', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Không có ghi chú
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {(request.status === 'PENDING' || request.status === 'IN_PROGRESS') && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setRejectDialogOpen(true)}
            className={cn(
              'border-red-200 text-red-500 hover:bg-red-50',
              isDark ? 'border-red-800 hover:bg-red-900/20 hover:text-red-400' : ''
            )}
            disabled={actionLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Từ chối
          </Button>
          <Button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Duyệt yêu cầu
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
              Bạn có chắc chắn muốn từ chối yêu cầu này không?
            </p>
            <Textarea
              placeholder="Lý do từ chối (tùy chọn)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonRequestDetailPage;
