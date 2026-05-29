import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import {
  ArrowLeft,
  Edit,
  Shield,
  GraduationCap,
  Users,
  Mail,
  School,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  BadgeCheck,
  Star,
  FileText,
  TrendingUp,
  BookMarked,
  Plus,
  Search,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { notification, Modal } from 'antd';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: { id: string; name: string } | string;
  avatar: string;
  school: string;
  phone: string;
  isOnboarded: boolean;
  isActive: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    submissions: number;
  };
  // For lecture role - from lectureCourses relation
  lectureCourses?: Array<{
    id: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      description: string;
      _count?: { enrollments: number };
    };
  }>;
  // For student role
  enrollments?: Array<{
    id: string;
    course: {
      id: string;
      title: string;
      description: string;
    };
    progress: number;
    review?: {
      rating: number;
      comment: string;
    };
    enrolledAt: string;
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  _count?: { enrollments: number };
}

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  admin: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  lecture: {
    label: 'Giảng viên',
    icon: GraduationCap,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  user: {
    label: 'Học sinh',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4',
            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
          )}
        />
      ))}
    </div>
  );
};

export default function UserPreviewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Course modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [assigningCourse, setAssigningCourse] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  const fetchUser = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.users}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for modal
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Open course modal
  const openCourseModal = () => {
    if (courses.length === 0) {
      fetchCourses();
    }
    setCourseModalOpen(true);
  };

  // Select course from modal
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseModalOpen(false);
    setConfirmModalOpen(true);
  };

  // Confirm assign course
  const handleConfirmAssign = async () => {
    if (!selectedCourse || !userId) return;
    
    setConfirmModalOpen(false);
    setAssigningCourse(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(userId, selectedCourse.id), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: 'Thành công',
          description: `Đã chỉ định khóa học "${selectedCourse.title}" cho giảng viên. Giảng viên sẽ nhận được thông báo.`,
        });
        await fetchUser(userId);
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Không thể chỉ định khóa học',
        });
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi chỉ định khóa học',
      });
    } finally {
      setAssigningCourse(false);
      setSelectedCourse(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div
        className={cn(
          'p-6 flex items-center justify-center min-h-screen',
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        )}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          'p-6 flex items-center justify-center min-h-screen',
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        )}
      >
        <div className="text-center">
          <p className={cn('text-lg font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Không tìm thấy người dùng
          </p>
          <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const userRole = typeof user.role === 'string' ? user.role : user.role?.name || 'user';
  const roleInfo = roleConfig[userRole] || roleConfig.user;
  const RoleIcon = roleInfo.icon;
  const isLecture = userRole === 'lecture';
  const isStudent = userRole === 'user';

  // Calculate average rating for student
  const averageRating = user.enrollments?.length 
    ? user.enrollments.reduce((acc, e) => acc + (e.review?.rating || 0), 0) / user.enrollments.length 
    : 0;
  const hasReviews = user.enrollments?.some(e => e.review);

  return (
    <div
      className={cn(
        'min-h-screen p-6 transition-colors duration-300',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/users')}
            className={cn(
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : ''
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Chi tiết người dùng
            </h1>
            <p className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
              Xem thông tin chi tiết của {user.fullName || user.username}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <Card
            className={cn(
              'lg:col-span-1 p-6',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <Avatar className="w-32 h-32 mb-4 ring-4 ring-cyan-500/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback
                  className={cn(
                    'text-3xl font-bold',
                    isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                  )}
                >
                  {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <h2 className={cn('text-2xl font-bold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                {user.fullName || user.username}
              </h2>
              <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                @{user.username}
              </p>

              {/* Role Badge */}
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
                  roleInfo.bgColor
                )}
              >
                <RoleIcon className={cn('w-5 h-5', roleInfo.color)} />
                <span className={cn('font-semibold', roleInfo.color)}>{roleInfo.label}</span>
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center gap-2">
                {user.isActive !== false ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Hoạt động</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-red-400">Dừng hoạt động</span>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                {user.isOnboarded ? (
                  <>
                    <BadgeCheck className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-cyan-400">Đã hoàn tất</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-amber-400">Chưa hoàn tất</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats - Role Specific */}
            <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
              {isLecture ? (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookMarked className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Khóa học</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {user._count?.enrollments || 0}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={cn('w-5 h-5', isDark ? 'text-purple-400' : 'text-purple-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Bài viết</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {user._count?.submissions || 0}
                    </span>
                  </div>
                </>
              ) : isStudent ? (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Khóa học</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {user._count?.enrollments || 0}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Star className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Đánh giá TB</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {hasReviews ? averageRating.toFixed(1) : '-'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Khóa học</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {user._count?.enrollments || 0}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl',
                      isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={cn('w-5 h-5', isDark ? 'text-purple-400' : 'text-purple-500')} />
                      <span className={cn(isDark ? 'text-slate-300' : 'text-slate-600')}>Bài nộp</span>
                    </div>
                    <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                      {user._count?.submissions || 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Right Column - Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card
              className={cn(
                'p-6',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-4 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <Mail className="w-5 h-5 text-cyan-500" />
                Thông tin liên hệ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-xl',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Email
                  </p>
                  <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {user.email}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-xl',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Số điện thoại
                  </p>
                  <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    {user.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Education Info */}
            <Card
              className={cn(
                'p-6',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-4 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <School className="w-5 h-5 text-cyan-500" />
                Thông tin học tập
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-xl',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Trường học
                  </p>
                  <p className={cn('font-medium flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <School className="w-4 h-4 text-cyan-500" />
                    {user.school || 'Chưa cập nhật'}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-4 rounded-xl',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Ngày tham gia
                  </p>
                  <p className={cn('font-medium flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Role-specific: Course Assignments (Lecture) or Course Progress (Student) */}
            {isLecture && (
              <Card
                className={cn(
                  'p-6',
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={cn(
                      'text-lg font-bold flex items-center gap-2',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    <BookMarked className="w-5 h-5 text-cyan-500" />
                    Khóa học đang giảng dạy
                  </h3>
                  <Button
                    onClick={openCourseModal}
                    disabled={!user.isActive}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm khóa học
                  </Button>
                </div>
                {user.lectureCourses && user.lectureCourses.length > 0 ? (
                  <div className="space-y-3">
                    {user.lectureCourses.map((lc) => (
                      <div
                        key={lc.id}
                        className={cn(
                          'p-4 rounded-xl border transition-all',
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 hover:border-cyan-500/50' 
                            : 'bg-slate-50 border-slate-200 hover:border-cyan-300'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className={cn('font-semibold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                              {lc.course.title}
                            </h4>
                            <p className={cn('text-sm line-clamp-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {lc.course.description || 'Không có mô tả'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                            )}>
                              {lc.course._count?.enrollments || 0} học viên
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    'text-center py-8 rounded-xl',
                    isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                  )}>
                    <BookMarked className={cn('w-10 h-10 mx-auto mb-2', isDark ? 'text-slate-500' : 'text-slate-400')} />
                    <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Chưa được assign vào khóa học nào
                    </p>
                  </div>
                )}
              </Card>
            )}

            {isStudent && (
              <Card
                className={cn(
                  'p-6',
                  isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                )}
              >
                <h3
                  className={cn(
                    'text-lg font-bold mb-4 flex items-center gap-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  Tiến độ khóa học
                </h3>
                {user.enrollments && user.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {user.enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className={cn(
                          'p-4 rounded-xl border transition-all',
                          isDark 
                            ? 'bg-slate-700/50 border-slate-600 hover:border-cyan-500/50' 
                            : 'bg-slate-50 border-slate-200 hover:border-cyan-300'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h4 className={cn('font-semibold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                              {enrollment.course?.title || 'Khóa học đã xóa'}
                            </h4>
                            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Tham gia: {formatDate(enrollment.enrolledAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Mức độ hoàn thành
                            </span>
                            <span className={cn('text-xs font-medium', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                              {enrollment.progress}%
                            </span>
                          </div>
                          <div className={cn(
                            'h-2 rounded-full overflow-hidden',
                            isDark ? 'bg-slate-600' : 'bg-slate-200'
                          )}>
                            <div 
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                enrollment.progress >= 100 
                                  ? 'bg-emerald-500' 
                                  : 'bg-cyan-500'
                              )}
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Review from Lecture */}
                        <div className={cn(
                          'p-3 rounded-lg',
                          isDark ? 'bg-slate-800/50' : 'bg-white border border-slate-200'
                        )}>
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                            <span className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              Đánh giá từ giảng viên
                            </span>
                          </div>
                          {enrollment.review ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {renderStars(enrollment.review.rating)}
                                <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                                  ({enrollment.review.rating}/5)
                                </span>
                              </div>
                              {enrollment.review.comment && (
                                <p className={cn('text-sm italic', isDark ? 'text-slate-300' : 'text-slate-600')}>
                                  "{enrollment.review.comment}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className={cn('text-sm italic', isDark ? 'text-slate-500' : 'text-slate-400')}>
                              Chưa có đánh giá
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    'text-center py-8 rounded-xl',
                    isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                  )}>
                    <TrendingUp className={cn('w-10 h-10 mx-auto mb-2', isDark ? 'text-slate-500' : 'text-slate-400')} />
                    <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Chưa tham gia khóa học nào
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Role Timeline */}
            <Card
              className={cn(
                'p-6',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-4 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <Shield className="w-5 h-5 text-cyan-500" />
                Phân quyền
              </h3>
              <div className="space-y-4">
                {Object.entries(roleConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const isActive = userRole === key;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl transition-all',
                        isActive
                          ? isDark
                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                            : 'bg-cyan-50 border border-cyan-200'
                          : isDark
                            ? 'bg-slate-700/30 opacity-50'
                            : 'bg-slate-50 opacity-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          isActive ? config.bgColor : 'bg-slate-200'
                        )}
                      >
                        <Icon
                          className={cn('w-5 h-5', isActive ? config.color : 'text-slate-400')}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'font-medium',
                            isActive ? (isDark ? 'text-white' : 'text-slate-900') : ''
                          )}
                        >
                          {config.label}
                        </p>
                        <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          {key === 'user' && 'Quyền học sinh cơ bản'}
                          {key === 'lecture' && 'Quyền giảng viên - tạo và quản lý nội dung'}
                          {key === 'admin' && 'Quyền quản trị viên - toàn quyền hệ thống'}
                        </p>
                      </div>
                      {isActive && (
                        <div className="px-3 py-1 rounded-full bg-cyan-500/20">
                          <span className="text-xs font-medium text-cyan-400">Hiện tại</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-cyan-500" />
            <span>Chọn khóa học</span>
          </div>
        }
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        footer={null}
        width={600}
        className={isDark ? 'dark-modal' : ''}
      >
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            placeholder="Tìm kiếm khóa học..."
            value={courseSearchTerm}
            onChange={(e) => setCourseSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors',
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 outline-none'
                : 'bg-slate-50 border-slate-200 focus:border-cyan-500 outline-none'
            )}
          />
        </div>

        {/* Course List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loadingCourses ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
              <p className="mt-2 text-slate-500">Đang tải...</p>
            </div>
          ) : courses.filter(
            (c) =>
              !user?.lectureCourses?.some((lc) => lc.courseId === c.id) &&
              (c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(courseSearchTerm.toLowerCase()))
          ).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">
                {user?.lectureCourses?.length === courses.length
                  ? 'Tất cả khóa học đã được chỉ định'
                  : 'Không tìm thấy khóa học phù hợp'}
              </p>
            </div>
          ) : (
            courses
              .filter(
                (c) =>
                  !user?.lectureCourses?.some((lc) => lc.courseId === c.id) &&
                  (c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                    c.description?.toLowerCase().includes(courseSearchTerm.toLowerCase()))
              )
              .map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
                    isDark
                      ? 'bg-slate-700/30 border-slate-600 hover:border-cyan-500/50 hover:bg-slate-700/50'
                      : 'bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                  )}
                  onClick={() => handleSelectCourse(course)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        isDark ? 'bg-slate-600' : 'bg-slate-100'
                      )}
                    >
                      <BookOpen
                        className={cn('w-6 h-6', isDark ? 'text-slate-400' : 'text-slate-500')}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {course.title}
                      </p>
                      <p
                        className={cn(
                          'text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        {course._count?.enrollments || 0} học viên •{' '}
                        {course.level === 'beginner'
                          ? 'Người mới'
                          : course.level === 'intermediate'
                          ? 'Trung cấp'
                          : 'Nâng cao'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-1',
                      isDark
                        ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                        : 'border-cyan-300 text-cyan-600 hover:bg-cyan-50'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Chọn
                  </Button>
                </div>
              ))
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-cyan-500" />
            <span>Xác nhận chỉ định</span>
          </div>
        }
        open={confirmModalOpen}
        onCancel={() => {
          setConfirmModalOpen(false);
          setSelectedCourse(null);
        }}
        onOk={handleConfirmAssign}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          className: 'bg-cyan-500 hover:bg-cyan-600',
        }}
        confirmLoading={assigningCourse}
        className={isDark ? 'dark-modal' : ''}
      >
        {selectedCourse && (
          <div className="py-4">
            <p className="mb-4">Bạn có chắc muốn chỉ định khóa học này cho giảng viên?</p>
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border',
                isDark
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  isDark ? 'bg-cyan-500/20' : 'bg-cyan-50'
                )}
              >
                <BookOpen className={cn('w-6 h-6', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
              </div>
              <div>
                <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {selectedCourse.title}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {selectedCourse._count?.enrollments || 0} học viên
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Giảng viên sẽ nhận được thông báo về việc được chỉ định khóa học này.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
