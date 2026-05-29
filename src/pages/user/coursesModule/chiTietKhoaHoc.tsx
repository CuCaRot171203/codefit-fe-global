import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UnlockCodeModal } from '@/components/user/UnlockCodeModal';
import {
  Play,
  CheckCircle,
  Lock,
  Clock,
  Signal,
  Video,
  FileText,
  ListChecks,
  Award,
  ArrowLeft,
  Loader2,
  KeyRound,
  User,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

/**
 * Types
 */
interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  levelLabel: string;
  duration: string | null;
  totalLessons: number;
  totalPhases: number;
  rating: number;
  reviews: number;
  students: number;
  price: number | null;
  originalPrice: number | null;
  subscriptionType?: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  coach: {
    id: string;
    fullName: string;
    avatar: string;
    role: string;
  } | null;
  includes: Array<{ icon: typeof Video; text: string }>;
  features: Array<{
    title: string;
    description: string;
    bgColor: string;
    textColor?: string;
  }>;
  learningPhases: Array<{
    id: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'locked';
  }>;
  progress: number;
  remainingLessons: number;
}

/**
 * Level mapping
 */
const getLevelInfo = (level: string) => {
  const levelMap: Record<string, { label: string }> = {
    beginner: { label: 'Cơ bản' },
    intermediate: { label: 'Trung cấp' },
    advanced: { label: 'Nâng cao' },
  };
  return levelMap[level?.toLowerCase()] || { label: level || 'Cơ bản' };
};

const formatPrice = (price: number | null) => {
  if (!price) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const ChiTietKhoaHoc = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showUnlockCodeModal, setShowUnlockCodeModal] = useState(false);

  /**
   * Fetch course details and enrollment status
   */
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token && token !== 'undefined' && token !== 'null' && token.length > 20) {
          headers.Authorization = `Bearer ${token}`;
        }

        const courseResponse = await fetch(API_ENDPOINTS.courses.detail(id), { headers });
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course details');
        }
        const courseData = await courseResponse.json();

        let enrolled = false;
        let progress = 0;
        let coach: Course['coach'] = null;

        try {
          const enrollmentResponse = await fetch(API_ENDPOINTS.enrollments.my, { headers });
          
          if (enrollmentResponse.status === 401) {
            // Token lỗi - clear localStorage và redirect login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            if (enrollmentData.success && Array.isArray(enrollmentData.data)) {
              const enrollment = enrollmentData.data.find(
                (e: any) => e.courseId === id || e.course?.id === id
              );
              if (enrollment) {
                enrolled = true;
                progress = enrollment.progress || 0;
                // Use coach data from enrollment response (already included by backend)
                if (enrollment.coach) {
                  coach = {
                    id: enrollment.coach.id,
                    fullName: enrollment.coach.fullName || enrollment.coach.username || 'Giảng viên',
                    avatar: enrollment.coach.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.coach.fullName || 'Coach')}&size=128`,
                    role: enrollment.coach.role?.name || 'Giảng viên CodeFit',
                  };
                } else if (enrollment.coachId) {
                  // Fallback: fetch coach separately if not embedded
                  try {
                    const coachRes = await fetch(
                      API_ENDPOINTS.users.detail(enrollment.coachId),
                      { headers }
                    );
                    if (coachRes.ok) {
                      const coachData = await coachRes.json();
                      if (coachData.success && coachData.data) {
                        coach = {
                          id: coachData.data.id,
                          fullName: coachData.data.fullName || coachData.data.username || 'Giảng viên',
                          avatar: coachData.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(coachData.data.fullName || 'Coach')}&size=128`,
                          role: coachData.data.role?.name || 'Giảng viên CodeFit',
                        };
                      }
                    }
                  } catch {
                    // silently ignore
                  }
                }
              }
            }
          }
        } catch {
          // Silently handle enrollment check errors
        }

        if (courseData.success && courseData.data) {
          const data = courseData.data;
          const levelInfo = getLevelInfo(data.level);

          // Parse features from JSON string (DB stores as JSON string)
          let parsedFeatures: Course['features'] = [
            { title: 'Nội dung chất lượng', description: 'Học với những kiến thức thực tế và cập nhật', bgColor: 'bg-slate-100 dark:bg-slate-700' },
            { title: 'Bài tập thực hành', description: 'Áp dụng ngay những gì đã học', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
            { title: 'Hỗ trợ 24/7', description: 'Đội ngũ hỗ trợ luôn sẵn sàng', bgColor: 'bg-slate-100 dark:bg-slate-700' },
          ];
          if (data.features) {
            try {
              const parsed = typeof data.features === 'string' ? JSON.parse(data.features) : data.features;
              if (Array.isArray(parsed) && parsed.length > 0) {
                parsedFeatures = parsed.map((f: any) => ({
                  title: f.title || '',
                  description: f.description || '',
                  bgColor: f.bgColor || 'bg-slate-100 dark:bg-slate-700',
                  textColor: f.textColor || '',
                }));
              }
            } catch {}
          }

          // Parse includes from JSON string (DB stores as JSON string)
          let parsedIncludes: Course['includes'] = [
            { icon: Video, text: 'Video bài giảng chất lượng cao' },
            { icon: FileText, text: 'Tài liệu PDF & Code mẫu' },
            { icon: ListChecks, text: 'Bài kiểm tra kiến thức' },
            { icon: Award, text: 'Chứng chỉ CodeFit chuyên nghiệp' },
          ];
          if (data.includes) {
            try {
              const parsed = typeof data.includes === 'string' ? JSON.parse(data.includes) : data.includes;
              if (Array.isArray(parsed) && parsed.length > 0) {
                parsedIncludes = parsed.map((inc: any) => ({
                  icon: Video,
                  text: inc.text || inc.title || '',
                }));
              }
            } catch {}
          }

          setCourse({
            id: data.id,
            title: data.title || 'Khóa học',
            description: data.description || '',
            image: data.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            level: data.level || 'beginner',
            levelLabel: levelInfo.label,
            duration: data.duration || null,
            totalLessons: data.totalLessons || data.lessons || 0,
            totalPhases: data.totalPhases || data.phases?.length || 0,
            rating: data.rating || 0,
            reviews: data.reviews || 0,
            students: data.students || 0,
            price: data.price,
            originalPrice: data.originalPrice,
            subscriptionType: data.subscriptionType || 'PREMIUM',
            instructor: {
              name: data.instructor?.name || data.instructorName || 'Giảng viên',
              role: data.instructor?.role || data.instructorRole || 'Giảng viên CodeFit',
              avatar: data.instructor?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            },
            coach,
            includes: parsedIncludes,
            features: parsedFeatures,
            learningPhases: data.learningPhases || data.phases || data.chapters || [],
            progress,
            remainingLessons: (data.totalLessons || 0) - Math.floor((progress / 100) * (data.totalLessons || 0)),
          });

          setIsEnrolled(enrolled);
        } else {
          throw new Error('Invalid course data');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        navigate('/error/404');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const getPhaseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <span className="text-sm font-medium text-primary dark:text-orange-400">Đang học</span>;
      case 'locked':
        return <Lock className="w-5 h-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const handleCheckout = () => {
    if (isEnrolled) {
      navigate(`/user/courses/${id}/content`);
    } else {
      navigate(`/user/payment/qr/${id}`);
    }
  };

  const isFreeCourse = course?.subscriptionType === 'FREE' || course?.price === 0;

  const handleFreeEnroll = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'undefined' && token !== 'null' && token.length > 20) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers,
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEnrolled(true);
        navigate(`/user/courses/${id}/content`);
      }
    } catch (err) {
      console.error('Free enroll error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-slate-500 dark:text-slate-400">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Không tìm thấy khóa học'}</p>
          <Link to="/user/danh-sach-khoa-hoc">
            <Button variant="outline">Quay lại danh sách khóa học</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 min-h-screen">
      {/* Back Button */}
      <Link to="/user/danh-sach-khoa-hoc">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all text-slate-600 dark:text-slate-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại danh sách khóa học
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Hero Section */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold">
                {course.levelLabel}
              </Badge>
              {course.duration && (
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Signal className="w-4 h-4" />
                {course.totalLessons} Bài học
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight font-headline text-slate-900 dark:text-white">
              {course.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {course.description}
            </p>
          </section>

          {/* Course Overview Bento */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline text-slate-900 dark:text-white">
              Tổng quan khóa học
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.features.map((feature, index) => (
                <Card
                  key={index}
                  className={cn(
                    'p-6 transition-all hover:translate-x-1',
                    feature.bgColor,
                    feature.textColor,
                    'dark:bg-slate-800 dark:border dark:border-slate-700'
                  )}
                >
                  <Signal className="w-10 h-10 mb-4 text-current opacity-80" />
                  <h3 className="text-lg font-bold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-sm opacity-80 dark:opacity-60">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Visual Learning Path */}
          {course.learningPhases.length > 0 && (
            <section className="space-y-8">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold font-headline text-slate-900 dark:text-white">
                  Lộ trình học tập
                </h2>
                <span className="text-primary dark:text-orange-400 font-semibold text-sm">
                  {course.totalPhases} Giai đoạn - {course.totalLessons} Bài học
                </span>
              </div>

              <div className="relative space-y-4">
                {/* Progress Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div
                    className="w-full bg-gradient-to-b from-primary to-orange-400 rounded-full transition-all"
                    style={{
                      height: isEnrolled
                        ? `${Math.min(course.progress, 100)}%`
                        : '0%'
                    }}
                  />
                </div>

                {/* Phases */}
                {course.learningPhases.map((phase, index) => {
                  const isCompleted = phase.status === 'completed';
                  const isCurrent = phase.status === 'current';
                  const isLocked = phase.status === 'locked';

                  return (
                    <div key={phase.id || index} className="relative pl-16 group">
                      {/* Timeline Dot */}
                      <div
                        className={cn(
                          'absolute left-4 top-2 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-900 z-10',
                          isCompleted && 'bg-green-500',
                          isCurrent && 'bg-primary dark:bg-orange-400',
                          isLocked && 'bg-slate-300 dark:bg-slate-600'
                        )}
                      />

                      {/* Phase Card */}
                      <Card
                        className={cn(
                          'p-6 transition-all hover:translate-x-1 dark:bg-slate-800 dark:border dark:border-slate-700',
                          !isLocked && 'border-l-4 border-primary dark:border-orange-400'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-primary dark:text-orange-400 uppercase mb-1 block">
                              Phase {phase.id || index + 1}
                            </span>
                            <h3
                              className={cn(
                                'text-xl font-bold mb-2 dark:text-white',
                                isLocked && 'text-slate-400 dark:text-slate-500'
                              )}
                            >
                              {phase.title}
                            </h3>
                            <p
                              className={cn(
                                'text-sm',
                                isLocked
                                  ? 'text-slate-400 dark:text-slate-600'
                                  : 'text-slate-600 dark:text-slate-400'
                              )}
                            >
                              {phase.description}
                            </p>
                          </div>
                          {getPhaseStatusIcon(phase.status)}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar - Sticky Actions & Meta */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Enrollment Card */}
            <Card className="overflow-hidden shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700">
              <div className="relative h-56">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <Button
                  size="icon"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:scale-110 hover:bg-white/30 transition-all"
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </Button>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(course.price)}
                  </span>
                  {course.originalPrice && course.originalPrice > (course.price || 0) && (
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                      {formatPrice(course.originalPrice)}
                    </span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  {isFreeCourse ? (
                    <Button
                      onClick={isEnrolled
                        ? () => navigate(`/user/courses/${id}/content`)
                        : handleFreeEnroll
                      }
                      disabled={isLoading}
                      className="w-full bg-orange-400 hover:bg-orange-500 text-white py-6 text-lg font-bold shadow-lg shadow-orange-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isEnrolled ? (
                        'Tiếp tục học'
                      ) : (
                        'Đăng ký khóa học'
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-orange-400 hover:bg-orange-500 text-white py-6 text-lg font-bold shadow-lg shadow-orange-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {isEnrolled ? 'Tiếp tục học' : 'Đăng ký thanh toán'}
                      </Button>
                      {!isEnrolled && (
                        <Button
                          variant="outline"
                          onClick={() => setShowUnlockCodeModal(true)}
                          className="w-full gap-2 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                          <KeyRound className="w-4 h-4" />
                          Nhập mã mở khóa
                        </Button>
                      )}
                      {!isEnrolled && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                          Hoàn tiền trong 7 ngày nếu không hài lòng
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Includes */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase">
                    Khóa học bao gồm:
                  </h4>
                  <ul className="space-y-3">
                    {course.includes.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                        >
                          <Icon className="w-5 h-5 text-primary dark:text-orange-400 shrink-0" />
                          {item.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Coach Card */}
            <Card className="p-6 dark:bg-slate-800 dark:border dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {course.coach ? (
                    <>
                      <img
                        src={course.coach.avatar}
                        alt={course.coach.fullName}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-400"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Giảng viên hỗ trợ
                        </span>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                          {course.coach.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {course.coach.role}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Giảng viên hỗ trợ
                        </span>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Chưa có giảng viên hỗ trợ
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {course.coach && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/user/lecture/${course.coach!.id}`)}
                    className="shrink-0 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    Liên hệ
                  </Button>
                )}
              </div>
            </Card>

            {/* Progress Card (for enrolled users) */}
            {isEnrolled && (
              <Card className="bg-gradient-to-r from-[#0B3C5D] to-[#0B3C5D]/80 text-white p-6 relative overflow-hidden border-0 shadow-xl">
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">Tiến độ của bạn</h4>
                    <span className="text-orange-300 font-bold">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs opacity-70">
                    Còn {course.remainingLessons} bài giảng để hoàn thành khóa học
                  </p>
                </div>
                {/* Abstract Background Shape */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl" />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Code Modal */}
      <UnlockCodeModal
        isOpen={showUnlockCodeModal}
        onClose={() => setShowUnlockCodeModal(false)}
        onSuccess={(courseId) => {
          const targetCourseId = courseId || id;
          if (targetCourseId) {
            window.location.href = `/user/courses/${targetCourseId}/content`;
          }
        }}
      />
    </div>
  );
};

export default ChiTietKhoaHoc;
