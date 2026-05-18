import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import { 
  CheckCircle, XCircle, Eye, AlertCircle, 
  BookOpen, User, FileText, Code, Lightbulb, Loader2,
  ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { message } from 'antd';

interface LessonReview {
  id: string;
  lessonId: string;
  status: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    status: string;
    phase: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  lessonContent?: {
    content: string | null;
    testCases: string | null;
    hints: string | null;
    starterCode: string | null;
  };
  lessonRequest?: {
    lecture: {
      id: string;
      username: string;
      fullName: string | null;
      email: string;
    };
  };
}

const LessonReviewPage = () => {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [pendingReviews, setPendingReviews] = useState<LessonReview[]>([]);
  const [allReviews, setAllReviews] = useState<LessonReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonReview | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [pendingRes, allRes] = await Promise.all([
        fetch(API_ENDPOINTS.lessonReviews.pending, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch(API_ENDPOINTS.lessonReviews.list, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      const pendingData = await pendingRes.json();
      const allData = await allRes.json();

      if (pendingData.success) {
        setPendingReviews(pendingData.data || []);
      }
      if (allData.success) {
        setAllReviews(allData.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (lessonId: string, sendToPublish: boolean = false) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');

      // First approve
      const approveRes = await fetch(API_ENDPOINTS.lessonReviews.approve(lessonId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });
      const approveData = await approveRes.json();

      if (!approveData.success) {
        message.error(approveData.message || 'Duyệt thất bại');
        return;
      }

      // Send notification to lecture
      const lesson = pendingReviews.find(r => r.lessonId === lessonId)?.lesson;
      const lectureId = approveData.data?.lectureId || approveData.data?.lessonRequest?.lecture?.id;

      if (lectureId) {
        const notificationRes = await fetch(API_ENDPOINTS.notifications.create, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: lectureId,
            type: sendToPublish ? 'lesson_published' : 'lesson_approved',
            title: sendToPublish ? 'Bài học đã được xuất bản!' : 'Bài học đã được duyệt!',
            message: feedback || (sendToPublish
              ? `Bài học "${lesson?.title}" đã được xuất bản thành công.`
              : `Bài học "${lesson?.title}" đã được duyệt. Bạn có thể xem chi tiết và chỉnh sửa.`),
            metadata: JSON.stringify({
              lessonId: lessonId,
              lessonTitle: lesson?.title,
              status: sendToPublish ? 'PUBLISHED' : 'APPROVED',
              feedback: feedback,
              actionUrl: `/lecture/lessons/${lessonId}/edit`,
              courseId: lesson?.phase?.course?.id,
              courseTitle: lesson?.phase?.course?.title,
            }),
          }),
        });
        const notifData = await notificationRes.json();
        if (!notifData.success) {
          console.warn('Failed to send notification:', notifData.message);
        }
      }

      // If requested, also publish
      if (sendToPublish) {
        const publishRes = await fetch(API_ENDPOINTS.lessonReviews.publish(lessonId), {
          method: 'PUT',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const publishData = await publishRes.json();

        if (publishData.success) {
          message.success('Đã duyệt và xuất bản bài học');
        } else {
          message.warning('Đã duyệt nhưng xuất bản thất bại: ' + publishData.message);
        }
      } else {
        message.success('Đã duyệt bài học');
      }

      setDetailDialogOpen(false);
      setSelectedLesson(null);
      setFeedback('');
      fetchReviews();
    } catch (error) {
      console.error('Error approving:', error);
      message.error('Duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (lessonId: string) => {
    if (!feedback.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonReviews.reject(lessonId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });
      const data = await response.json();

      if (data.success) {
        // Send notification to lecture
        const lesson = pendingReviews.find(r => r.lessonId === lessonId)?.lesson;
        const lectureId = data.data?.lectureId || data.data?.lessonRequest?.lecture?.id;

        if (lectureId) {
          const notificationRes = await fetch(API_ENDPOINTS.notifications.create, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: lectureId,
              type: 'lesson_rejected',
              title: 'Bài học cần chỉnh sửa',
              message: `Bài học "${lesson?.title}" cần được chỉnh sửa theo phản hồi từ Admin.`,
              metadata: JSON.stringify({
                lessonId: lessonId,
                lessonTitle: lesson?.title,
                status: 'REJECTED',
                feedback: feedback,
                actionUrl: `/lecture/lessons/${lessonId}/edit`,
                courseId: lesson?.phase?.course?.id,
                courseTitle: lesson?.phase?.course?.title,
              }),
            }),
          });
          const notifData = await notificationRes.json();
          if (!notifData.success) {
            console.warn('Failed to send notification:', notifData.message);
          }
        }

        message.success('Đã từ chối bài học');
        setDetailDialogOpen(false);
        setSelectedLesson(null);
        setFeedback('');
        fetchReviews();
      } else {
        message.error(data.message || 'Từ chối thất bại');
      }
    } catch (error) {
      message.error('Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) {
      message.error('Vui lòng chọn bài học để xuất bản');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonReviews.batchPublish, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonIds: selectedIds }),
      });
      const data = await response.json();

      if (data.success) {
        const successCount = data.data.filter((r: any) => r.success).length;
        message.success(`Đã xuất bản ${successCount}/${selectedIds.length} bài học`);
        setSelectedIds([]);
        fetchReviews();
      }
    } catch (error) {
      message.error('Xuất bản thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const parseJsonSafe = (jsonStr: string | null) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const LessonCard = ({ review }: { review: LessonReview }) => {
    const testCases = parseJsonSafe(review.lessonContent?.testCases);
    const hints = parseJsonSafe(review.lessonContent?.hints);

    return (
      <Card className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isDark ? 'bg-slate-800 border-slate-700 hover:border-cyan-500/50' : 'hover:border-cyan-500/50'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn('text-lg', isDark ? 'text-white' : '')}>
                {review.lesson.title}
              </CardTitle>
              <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {review.lesson.phase.course.title} / {review.lesson.phase.title}
              </p>
            </div>
            <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              Chờ duyệt
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Lecture Info */}
            {review.lessonRequest?.lecture && (
              <div className="flex items-center gap-2">
                <User className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {review.lessonRequest.lecture.fullName || review.lessonRequest.lecture.username}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <Code className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {testCases.length} testcases
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Lightbulb className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {hints.length} hints
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLesson(review);
                  setDetailDialogOpen(true);
                }}
                className={cn('flex-1', isDark ? 'border-slate-600 text-slate-300' : '')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Duyệt bài học
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Duyệt và xuất bản bài học từ giảng viên
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button
            onClick={handleBatchPublish}
            disabled={actionLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Xuất bản ({selectedIds.length}) bài
          </Button>
        )}
      </div>

      <Tabs defaultValue="pending">
        <TabsList className={cn('mb-6', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
          <TabsTrigger value="pending" className={cn(
            isDark ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white' : ''
          )}>
            Chờ duyệt ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="all" className={cn(
            isDark ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white' : ''
          )}>
            Tất cả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
            </div>
          ) : pendingReviews.length === 0 ? (
            <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <CheckCircle className={cn('w-12 h-12 mx-auto mb-4 text-green-500', isDark ? 'text-green-400' : '')} />
              <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Không có bài nào chờ duyệt
              </p>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Tất cả bài học đã được duyệt
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="relative">
                  <Checkbox
                    checked={selectedIds.includes(review.lessonId)}
                    onCheckedChange={() => toggleSelect(review.lessonId)}
                    className="absolute top-4 right-4 z-10"
                  />
                  <LessonCard review={review} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
            </div>
          ) : allReviews.length === 0 ? (
            <Card className={cn('text-center py-12', isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <FileText className={cn('w-12 h-12 mx-auto mb-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
              <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Chưa có bài học nào được duyệt
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {allReviews.map((review) => (
                <Card key={review.id} className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {review.lesson.title}
                          </p>
                          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            {review.lesson.phase.course.title}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        review.lesson.status === 'PUBLISHED' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : review.lesson.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                        'flex items-center gap-1'
                      )}>
                        {review.lesson.status === 'PUBLISHED' ? <CheckCircle className="w-3 h-3" /> : 
                         review.lesson.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                        {review.lesson.status === 'PUBLISHED' ? 'Đã xuất bản' :
                         review.lesson.status === 'REJECTED' ? 'Từ chối' :
                         review.lesson.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn(isDark ? 'text-white' : '')}>
              Chi tiết bài học
            </DialogTitle>
          </DialogHeader>
          
          {selectedLesson && (
            <div className="space-y-6">
              {/* Lesson Info */}
              <div>
                <h3 className={cn('font-medium mb-2', isDark ? 'text-white' : 'text-slate-900')}>
                  {selectedLesson.lesson.title}
                </h3>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {selectedLesson.lesson.phase.course.title} / {selectedLesson.lesson.phase.title}
                </p>
              </div>

              {/* Content Preview */}
              <div>
                <Label className={cn('flex items-center gap-2 mb-2', isDark ? 'text-slate-300' : '')}>
                  <FileText className="w-4 h-4" />
                  Nội dung bài học
                </Label>
                <div className={cn(
                  'p-4 rounded-lg border',
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200'
                )}>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.lessonContent?.content || '<p class="text-slate-400 italic">Chưa có nội dung</p>' }}
                  />
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <Label className={cn('flex items-center gap-2 mb-2', isDark ? 'text-slate-300' : '')}>
                  <Code className="w-4 h-4" />
                  Test Cases ({parseJsonSafe(selectedLesson.lessonContent?.testCases).length})
                </Label>
                <div className="space-y-2">
                  {parseJsonSafe(selectedLesson.lessonContent?.testCases).map((tc: any, idx: number) => (
                    <div key={idx} className={cn(
                      'p-3 rounded-lg border',
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    )}>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={cn('font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>Input:</span>
                          <pre className={cn('mt-1 p-2 rounded', isDark ? 'bg-slate-800' : 'bg-white')}>
                            {tc.input}
                          </pre>
                        </div>
                        <div>
                          <span className={cn('font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>Expected Output:</span>
                          <pre className={cn('mt-1 p-2 rounded', isDark ? 'bg-slate-800' : 'bg-white')}>
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Điểm: {tc.points}
                        </span>
                        <span className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Public: {tc.isPublic ? 'Có' : 'Không'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div>
                <Label className={cn('flex items-center gap-2 mb-2', isDark ? 'text-slate-300' : '')}>
                  <Lightbulb className="w-4 h-4" />
                  Hints ({parseJsonSafe(selectedLesson.lessonContent?.hints).length})
                </Label>
                <div className="space-y-2">
                  {parseJsonSafe(selectedLesson.lessonContent?.hints).map((hint: any, idx: number) => (
                    <div key={idx} className={cn(
                      'p-3 rounded-lg border',
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                    )}>
                      <div className="flex items-center justify-between">
                        <span className={cn('text-sm font-medium', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                          Hint #{idx + 1}
                        </span>
                        <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          -{hint.penalty} điểm
                        </span>
                      </div>
                      <p className={cn('text-sm mt-1', isDark ? 'text-slate-300' : 'text-slate-600')}>
                        {hint.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label className={isDark ? 'text-slate-300' : ''}>Phản hồi (tùy chọn)</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập phản hồi cho giảng viên..."
                  rows={3}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setFeedback('');
                  }}
                  className={cn(isDark ? 'border-slate-600 text-slate-300' : '')}
                >
                  Đóng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedLesson.lessonId)}
                  disabled={actionLoading}
                  className="text-red-500 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleApprove(selectedLesson.lessonId, false)}
                  disabled={actionLoading}
                  className="text-green-500 hover:text-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt
                </Button>
                <Button
                  onClick={() => handleApprove(selectedLesson.lessonId, true)}
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600 text-white ml-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Duyệt & Xuất bản
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonReviewPage;
