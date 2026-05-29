import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Users,
  BarChart3,
  Calendar,
  Star,
  Code,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InstructorDetail {
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    avatar: string | null;
    role: { id: string; name: string };
    createdAt: string;
  };
  courses: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    courseLevel: string;
    enrolledStudents: number;
    phasesCount: number;
    assignedAt: string;
  }>;
  lessonRequests: Array<{
    id: string;
    status: string;
    dueDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    lesson: {
      id: string;
      title: string;
      type: string;
      status: string;
      courseId: string | null;
      courseTitle: string | null;
    };
  }>;
  minitests: Array<{
    id: string;
    score: number;
    submittedAt: string;
    minitest: {
      id: string;
      title: string;
      courseId: string | null;
      courseTitle: string | null;
    };
  }>;
  hackathons: Array<{
    id: string;
    joinedAt: string;
    hackathon: {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
    };
  }>;
  hackathonSubmissions: Array<{
    id: string;
    score: number;
    submittedAt: string;
    hackathon: { id: string; title: string };
    problem: { id: string; title: string };
  }>;
  stats: {
    totalCourses: number;
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    pendingLessons: number;
    lessonCompletionRate: number;
    totalMinitests: number;
    avgMinitestScore: number;
    totalHackathons: number;
    totalHackathonSubmissions: number;
  };
  courseProgress: Array<{
    courseId: string;
    courseTitle: string;
    assignedAt: string;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  }>;
}

export default function InstructorDetailPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const { isDark } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<InstructorDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'lessons' | 'minitests' | 'hackathons'>('overview');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [, setAssigningCourse] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructorDetail();
  }, [lectureId]);

  const fetchInstructorDetail = async () => {
    if (!lectureId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.instructorDetail(lectureId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setDetail(data.data);
      }
    } catch (error) {
      console.error('Error fetching instructor detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setAvailableCourses(data.data);
        setShowCourseModal(true);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAssignCourse = async (courseId: string) => {
    if (!lectureId) return;
    console.log('[INSTRUCTOR PAGE] handleAssignCourse called:', { lectureId, courseId });
    console.log('[INSTRUCTOR PAGE] API URL:', API_ENDPOINTS.admin.assignCourse(lectureId, courseId));
    setAssigningCourse(courseId);
    try {
      const token = localStorage.getItem('token');
      console.log('[INSTRUCTOR PAGE] Making fetch request...');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(lectureId, courseId), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log('[INSTRUCTOR PAGE] Response:', response.status);
      const data = await response.json();
      console.log('[INSTRUCTOR PAGE] Response data:', data);
      await fetchInstructorDetail();
      setShowCourseModal(false);
    } catch (error) {
      console.error('Error assigning course:', error);
    } finally {
      setAssigningCourse(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Play },
      SUBMITTED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      PUBLISHED: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Star },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.text)}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors[level] || colors.beginner)}>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={cn('p-6 flex items-center justify-center min-h-screen', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={cn('p-6 flex items-center justify-center min-h-screen', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className={cn('text-lg', isDark ? 'text-white' : 'text-slate-700')}>Không tìm thấy giảng viên</p>
          <Button onClick={() => navigate('/admin/instructors')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 lg:p-6 space-y-6 min-h-screen transition-colors duration-300', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/instructors')}
            className={cn(isDark ? 'text-slate-300 hover:text-white' : '')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
              {detail.user.fullName?.[0] || detail.user.username?.[0] || 'L'}
            </div>
            <div>
              <h1 className={cn('text-2xl lg:text-3xl font-bold', isDark ? 'text-white' : 'text-primary')}>
                {detail.user.fullName || detail.user.username}
              </h1>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                @{detail.user.username} • {detail.user.email}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={fetchAvailableCourses} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm khóa học
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
                <BookOpen className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.totalCourses}</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Khóa học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-green-500/20' : 'bg-green-100')}>
                <FileText className={cn('w-5 h-5', isDark ? 'text-green-400' : 'text-green-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.totalLessons}</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Bài học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')}>
                <CheckCircle className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.completedLessons}</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                <BarChart3 className={cn('w-5 h-5', isDark ? 'text-purple-400' : 'text-purple-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.lessonCompletionRate}%</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Tiến độ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-cyan-500/20' : 'bg-cyan-100')}>
                <Code className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.totalMinitests}</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Minitest</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isDark ? 'bg-amber-500/20' : 'bg-amber-100')}>
                <Trophy className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>{detail.stats.totalHackathons}</p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Hackathon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
          { id: 'courses', label: 'Khóa học', icon: BookOpen },
          { id: 'lessons', label: 'Bài học', icon: FileText },
          { id: 'minitests', label: 'Minitest', icon: Code },
          { id: 'hackathons', label: 'Hackathon', icon: Trophy },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : cn('border-transparent', isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Progress */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Tiến độ theo khóa học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {detail.courseProgress.length === 0 ? (
                  <p className={cn('text-sm text-center py-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có khóa học nào được assign
                  </p>
                ) : (
                  detail.courseProgress.map(course => (
                    <div key={course.courseId} className={cn('p-3 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                      <div className="flex justify-between items-start mb-2">
                        <p className={cn('font-medium', isDark ? 'text-white' : '')}>{course.courseTitle}</p>
                        <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {course.completedLessons}/{course.totalLessons} bài
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className={cn('h-2 rounded-full transition-all', course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500')}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {course.progress}% hoàn thành
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                  <Clock className="w-5 h-5 text-amber-500" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detail.lessonRequests.slice(0, 5).map(lr => (
                  <div key={lr.id} className={cn('flex items-center justify-between p-3 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                    <div>
                      <p className={cn('font-medium text-sm', isDark ? 'text-white' : '')}>{lr.lesson.title}</p>
                      <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {lr.lesson.courseTitle || 'Không có khóa học'}
                      </p>
                    </div>
                    {getStatusBadge(lr.status)}
                  </div>
                ))}
                {detail.lessonRequests.length === 0 && (
                  <p className={cn('text-sm text-center py-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có hoạt động nào
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.courses.map(course => (
              <Card key={course.id} className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
                <CardHeader className={cn('pb-2', isDark ? 'bg-slate-700/50' : 'bg-slate-50')}>
                  <div className="flex items-start justify-between">
                    <CardTitle className={cn('text-lg', isDark ? 'text-white' : '')}>
                      {course.courseTitle}
                    </CardTitle>
                    {getLevelBadge(course.courseLevel)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className={cn('flex items-center gap-4 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents} học viên</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{course.phasesCount} chương</span>
                    </div>
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    <Calendar className="w-3 h-3" />
                    <span>Assign: {formatDate(course.assignedAt)}</span>
                  </div>
                  {/* Progress for this course */}
                  {detail.courseProgress.find(cp => cp.courseId === course.courseId) && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Tiến độ</span>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {detail.courseProgress.find(cp => cp.courseId === course.courseId)?.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${detail.courseProgress.find(cp => cp.courseId === course.courseId)?.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {detail.courses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className={cn('w-16 h-16 mx-auto mb-4', isDark ? 'text-slate-600' : 'text-slate-300')} />
                <p className={cn('text-lg', isDark ? 'text-slate-400' : 'text-slate-500')}>Chưa có khóa học nào được assign</p>
                <Button onClick={fetchAvailableCourses} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm khóa học
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lessons' && (
          <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                <FileText className="w-5 h-5 text-green-500" />
                Danh sách bài học ({detail.lessonRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detail.lessonRequests.map(lr => (
                  <div key={lr.id} className={cn('flex items-center justify-between p-4 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex-1">
                      <p className={cn('font-medium', isDark ? 'text-white' : '')}>{lr.lesson.title}</p>
                      <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {lr.lesson.courseTitle || 'Không có khóa học'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className={cn('text-xs', isDark ? 'border-slate-600 text-slate-400' : '')}>
                          {lr.lesson.type}
                        </Badge>
                        {lr.dueDate && (
                          <span className={cn('text-xs flex items-center gap-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            <Calendar className="w-3 h-3" />
                            Due: {formatDate(lr.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(lr.status)}
                  </div>
                ))}
                {detail.lessonRequests.length === 0 && (
                  <p className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có bài học nào được assign
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'minitests' && (
          <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                <Code className="w-5 h-5 text-cyan-500" />
                Kết quả Minitest ({detail.stats.totalMinitests})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detail.minitests.map(ms => (
                  <div key={ms.id} className={cn('flex items-center justify-between p-4 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex-1">
                      <p className={cn('font-medium', isDark ? 'text-white' : '')}>{ms.minitest.title}</p>
                      <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {ms.minitest.courseTitle || 'Không có khóa học'}
                      </p>
                      <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                        Nộp: {formatDate(ms.submittedAt)}
                      </p>
                    </div>
                    <div className={cn('text-2xl font-bold', ms.score >= 80 ? 'text-emerald-500' : ms.score >= 50 ? 'text-yellow-500' : 'text-red-500')}>
                      {ms.score}%
                    </div>
                  </div>
                ))}
                {detail.minitests.length === 0 && (
                  <p className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có bài minitest nào
                  </p>
                )}
              </div>
              {detail.stats.avgMinitestScore > 0 && (
                <div className={cn('mt-4 p-4 rounded-lg border', isDark ? 'bg-slate-600/50 border-slate-500' : 'bg-blue-50 border-blue-200')}>
                  <p className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Điểm trung bình: <span className="font-bold">{detail.stats.avgMinitestScore}%</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'hackathons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Hackathon đã tham gia ({detail.stats.totalHackathons})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.hackathons.map(hp => (
                    <div key={hp.id} className={cn('p-4 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                      <p className={cn('font-medium', isDark ? 'text-white' : '')}>{hp.hackathon.title}</p>
                      <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(hp.hackathon.startTime)} - {formatDate(hp.hackathon.endTime)}
                      </p>
                    </div>
                  ))}
                  {detail.hackathons.length === 0 && (
                    <p className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Chưa tham gia hackathon nào
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
                  <Star className="w-5 h-5 text-purple-500" />
                  Bài nộp Hackathon ({detail.stats.totalHackathonSubmissions})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.hackathonSubmissions.map(hs => (
                    <div key={hs.id} className={cn('flex items-center justify-between p-4 rounded-lg border', isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200')}>
                      <div>
                        <p className={cn('font-medium', isDark ? 'text-white' : '')}>{hs.hackathon.title}</p>
                        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {hs.problem.title}
                        </p>
                      </div>
                      <div className={cn('text-xl font-bold', hs.score >= 80 ? 'text-emerald-500' : hs.score >= 50 ? 'text-yellow-500' : 'text-red-500')}>
                        {hs.score}
                      </div>
                    </div>
                  ))}
                  {detail.hackathonSubmissions.length === 0 && (
                    <p className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Chưa có bài nộp hackathon nào
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Course Assignment Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn('rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto', isDark ? 'bg-slate-800' : 'bg-white')}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : '')}>Thêm khóa học</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCourseModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Chọn khóa học để assign cho giảng viên này.
            </p>
            <div className="space-y-2">
              {availableCourses.map(course => {
                const isAssigned = detail.courses.some(c => c.courseId === course.id);
                console.log('[DEBUG] Course:', course.title, 'id:', course.id, 'isAssigned:', isAssigned, 'assigned courses:', detail.courses.map(c => c.courseId));
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      console.log('[DEBUG] Button clicked for course:', course.id, 'isAssigned:', isAssigned);
                      if (!isAssigned) handleAssignCourse(course.id);
                    }}
                    disabled={isAssigned}
                    className={cn(
                      'w-full p-4 rounded-lg border text-left transition-all',
                      isAssigned
                        ? cn('opacity-50 cursor-not-allowed', isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200')
                        : cn('hover:border-primary', isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100')
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn('font-medium', isDark ? 'text-white' : '')}>{course.title}</p>
                        <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {course._count?.enrollments || 0} học viên • {course._count?.phases || 0} chương
                        </p>
                      </div>
                      {isAssigned ? (
                        <Badge variant="secondary">Đã assign</Badge>
                      ) : (
                        <Plus className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-400')} />
                      )}
                    </div>
                  </button>
                );
              })}
              {availableCourses.length === 0 && (
                <p className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Không có khóa học nào
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
