import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Star,
  BookOpen,
  Users,
  Mail,
  Globe,
  Loader2,
  GraduationCap,
} from 'lucide-react';

const InstructorProfilePage = () => {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const fetchInstructor = async () => {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }

      if (!lectureId) return;

      try {
        const res = await fetch(API_ENDPOINTS.users.detail(lectureId), { headers });
        const data = await res.json();
        if (data.success && data.data) {
          setInstructor(data.data);
        }

        const coursesRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/courses/my/creator`,
          { headers }
        );
        const coursesData = await coursesRes.json();
        if (coursesData.success && coursesData.data) {
          const allCourses = Array.isArray(coursesData.data) ? coursesData.data : coursesData.data.courses || [];
          const myCourses = allCourses.filter(
            (c: any) => c.creatorId === lectureId || c.instructorId === lectureId
          );
          setCourses(myCourses);
        }
      } catch (err) {
        console.error('Error fetching instructor:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (lectureId) fetchInstructor();
  }, [lectureId]);

  if (isLoading) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Đang tải thông tin giảng viên...</p>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className={cn(
        'min-h-screen flex flex-col items-center justify-center gap-4',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Không tìm thấy giảng viên
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const avatarUrl = instructor.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.fullName || instructor.username || 'Coach')}&size=128&background=0B3C5D&color=fff`;

  const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.students || 0), 0);

  return (
    <div className={cn(
      'min-h-screen',
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className={cn(
            'mb-6 pl-0 hover:pl-2 transition-all',
            isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600'
          )}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>

        {/* Profile Header */}
        <Card className={cn(
          'overflow-hidden mb-6',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
        )}>
          <div className="h-32 bg-gradient-to-r from-[#0B3C5D] to-orange-400" />
          <CardContent className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start gap-6 -mt-16">
              <img
                src={avatarUrl}
                alt={instructor.fullName || instructor.username}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-white dark:ring-slate-800"
              />
              <div className="flex-1 pt-4">
                <h1 className={cn(
                  'text-3xl font-bold mb-1',
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  {instructor.fullName || instructor.username}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className={cn('w-4 h-4', isDark ? 'text-orange-400' : 'text-[#0B3C5D]')} />
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Giảng viên CodeFit
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {instructor.email && (
                    <a
                      href={`mailto:${instructor.email}`}
                      className={cn(
                        'flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-colors',
                        isDark
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      {instructor.email}
                    </a>
                  )}
                  {instructor.school && (
                    <span className={cn(
                      'flex items-center gap-1 text-sm px-3 py-1.5 rounded-full',
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    )}>
                      <Globe className="w-4 h-4" />
                      {instructor.school}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {instructor.bio && (
              <p className={cn(
                'mt-6 text-sm leading-relaxed max-w-2xl',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}>
                {instructor.bio}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className={cn('p-6 text-center', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
            <BookOpen className={cn('w-8 h-8 mx-auto mb-2', isDark ? 'text-orange-400' : 'text-[#0B3C5D]')} />
            <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              {courses.length}
            </p>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Khóa học</p>
          </Card>
          <Card className={cn('p-6 text-center', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
            <Users className={cn('w-8 h-8 mx-auto mb-2', isDark ? 'text-orange-400' : 'text-[#0B3C5D]')} />
            <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              {totalStudents}
            </p>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Học viên</p>
          </Card>
          <Card className={cn('p-6 text-center', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
            <Star className={cn('w-8 h-8 mx-auto mb-2', isDark ? 'text-orange-400' : 'text-[#0B3C5D]')} />
            <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              0
            </p>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>Đánh giá</p>
          </Card>
        </div>

        {/* Courses */}
        {courses.length > 0 ? (
          <div>
            <h2 className={cn(
              'text-xl font-bold mb-4',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              Khóa học đang giảng dạy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course: any) => (
                <Card
                  key={course.id}
                  className={cn(
                    'overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
                  )}
                  onClick={() => navigate(`/user/courses/${course.id}`)}
                >
                  <img
                    src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80'}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className={cn(
                      'font-bold mb-2 line-clamp-2',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn(
                        isDark ? 'border-slate-600 text-slate-300' : ''
                      )}>
                        {course.level}
                      </Badge>
                      <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {course.students || 0} học viên
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className={cn('p-8 text-center', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
            <BookOpen className={cn('w-12 h-12 mx-auto mb-3 opacity-40', isDark ? 'text-slate-500' : 'text-slate-300')} />
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Chưa có khóa học nào được giảng dạy
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstructorProfilePage;
