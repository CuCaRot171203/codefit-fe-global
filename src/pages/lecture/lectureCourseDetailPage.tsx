import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLecture } from '@/contexts/LectureContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, BookOpen, Users, FileText, Video, Code, Loader2, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { message } from 'antd';

interface Student {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  progress: number;
  createdAt: string;
}

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons: {
    id: string;
    title: string;
    type: string;
    orderIndex: number;
  }[];
  minitests: {
    id: string;
    title: string;
  }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string | null;
  level: string;
  totalStudents: number;
  totalLessons: number;
  enrollments: Student[];
  phases: Phase[];
}

const LectureCourseDetailPage = () => {
  const { isDark } = useLecture();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [creatingPhase, setCreatingPhase] = useState(false);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('theory');
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.lecture.course(courseId!), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy khóa học hoặc bạn không có quyền truy cập');
        }
        throw new Error('Failed to fetch course');
      }

      const result = await response.json();
      if (result.success) {
        setCourse(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch course');
      }
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'code':
        return 'Coding';
      default:
        return 'Tài liệu';
    }
  };

  // Create Phase
  const handleCreatePhase = async () => {
    if (!phaseTitle.trim() || !courseId) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.lecture.phases}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          title: phaseTitle,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã tạo chương mới');
        setPhaseTitle('');
        setCreatingPhase(false);
        fetchCourseDetail();
      } else {
        message.error(data.message || 'Tạo thất bại');
      }
    } catch (err) {
      message.error('Tạo chương thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Lesson
  const handleCreateLesson = async () => {
    if (!lessonTitle.trim() || !selectedPhaseId || !courseId) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.lecture.lessons}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phaseId: selectedPhaseId,
          title: lessonTitle,
          type: lessonType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã tạo bài học');
        const lessonId = data.data.id;
        setLessonTitle('');
        setCreatingLesson(false);
        // Navigate to lesson editor in new tab
        window.open(`/lecture/lessons/${lessonId}/edit`, '_blank');
        fetchCourseDetail();
      } else {
        message.error(data.message || 'Tạo thất bại');
      }
    } catch (err) {
      message.error('Tạo bài học thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <Link to="/lecture/my-courses" className="inline-flex items-center mb-6">
          <Button variant="ghost" className={cn('pl-0', isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className={cn('text-lg font-medium mb-4', isDark ? 'text-white' : 'text-slate-900')}>
            {error || 'Không tìm thấy khóa học'}
          </p>
          <Link to="/lecture/my-courses">
            <Button variant="outline">
              Quay lại danh sách khóa học
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Link to="/lecture/my-courses" className="inline-flex items-center mb-6">
        <Button variant="ghost" className={cn('pl-0', isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </Link>

      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          <div className="w-48 h-32 bg-gradient-to-br from-[#0B3C5D] to-[#1a5c8a] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {course.image ? (
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-16 h-16 text-white/50" />
            )}
          </div>
          <div className="flex-1">
            <h1 className={cn(
              'text-2xl font-bold mb-2',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {course.title}
            </h1>
            <p className={cn(
              'text-sm mb-4',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              {course.description}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {course.totalStudents} học viên
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {course.totalLessons} bài học
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn(
            'text-xl font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Nội dung khóa học
          </h2>
          <Button
            onClick={() => setCreatingPhase(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm chương
          </Button>
        </div>

        <div className="space-y-3">
          {course.phases && course.phases.map((phase) => {
            const isExpanded = expandedPhases.has(phase.id);
            return (
              <Card
                key={phase.id}
                className={cn(
                  'transition-all duration-200',
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}
              >
                <CardHeader className="py-3">
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'text-sm font-semibold w-8 h-8 rounded-full flex items-center justify-center',
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      )}>
                        {phase.orderIndex}
                      </span>
                      <CardTitle className="text-base">
                        {phase.title}
                      </CardTitle>
                      <span className={cn(
                        'text-sm',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}>
                        ({phase.lessons?.length || 0} bài)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhaseId(phase.id);
                          setCreatingLesson(true);
                        }}
                        className="text-cyan-500 hover:text-cyan-600"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <svg
                        className={cn(
                          'w-5 h-5 transition-transform',
                          isExpanded ? 'rotate-180' : ''
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2 pl-11">
                      {phase.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg group cursor-pointer',
                            isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                          )}
                          onClick={() => window.open(`/lecture/lessons/${lesson.id}/edit`, '_blank')}
                        >
                          <span className="text-[#0B3C5D]">
                            {getLessonIcon(lesson.type)}
                          </span>
                          <span className="flex-1">{lesson.title}</span>
                          <Edit className={cn('w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity', isDark ? 'text-slate-400' : 'text-slate-500')} />
                          <span className={cn(
                            'text-xs px-2 py-1 rounded',
                            isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                          )}>
                            {getLessonTypeLabel(lesson.type)}
                          </span>
                        </div>
                      ))}
                      {(!phase.lessons || phase.lessons.length === 0) && (
                        <p className={cn('text-sm italic', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          Chưa có bài học nào. Nhấn + để thêm bài học.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {(!course.phases || course.phases.length === 0) && (
            <div className={cn(
              'flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed',
              isDark ? 'border-slate-700' : 'border-slate-300'
            )}>
              <BookOpen className={cn('w-12 h-12 mb-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <p className={cn('text-lg font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                Khóa học này chưa có nội dung
              </p>
              <p className={cn('text-sm mt-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Nhấn "Thêm chương" để bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Phase Dialog */}
      <Dialog open={creatingPhase} onOpenChange={setCreatingPhase}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo chương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên chương</Label>
              <Input
                value={phaseTitle}
                onChange={(e) => setPhaseTitle(e.target.value)}
                placeholder="Ví dụ: Chương 1 - Giới thiệu"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingPhase(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreatePhase} disabled={submitting || !phaseTitle.trim()} className="bg-cyan-500 hover:bg-cyan-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={creatingLesson} onOpenChange={setCreatingLesson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo bài học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên bài học</Label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ví dụ: Bài 1 - Cú pháp cơ bản"
              />
            </div>
            <div className="space-y-2">
              <Label>Loại bài học</Label>
              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại bài học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Lý thuyết</SelectItem>
                  <SelectItem value="code">Coding</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingLesson(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateLesson} disabled={submitting || !lessonTitle.trim()} className="bg-cyan-500 hover:bg-cyan-600">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LectureCourseDetailPage;
