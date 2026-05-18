import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Code,
  Star,
  ArrowRight,
  Bolt,
  Circle,
  Clock,
  CreditCard,
  ChevronDown,
  Filter,
  Loader2,
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
  levelColor: string;
  rating: number;
  reviews: number;
  duration: string | null;
  progress: number | null;
  lessons: number | null;
  price: string | null;
  isEnrolled: boolean;
  students?: string;
}

/**
 * Level mapping
 */
const getLevelInfo = (level: string) => {
  const levelMap: Record<string, { color: string; label: string }> = {
    beginner: { color: 'bg-blue-400', label: 'Cơ bản' },
    intermediate: { color: 'bg-primary', label: 'Trung cấp' },
    advanced: { color: 'bg-orange-400', label: 'Nâng cao' },
  };
  return levelMap[level.toLowerCase()] || { color: 'bg-primary', label: level };
};

/**
 * Course Card Component
 */
const CourseCard = ({ course }: { course: Course }) => {
  const navigate = useNavigate();
  const levelInfo = getLevelInfo(course.level);

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-surface-container-lowest dark:bg-slate-800 cursor-pointer"
      onClick={() => navigate(`/user/courses/${course.id}`)}
    >
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <Badge
          className={cn(
            'absolute top-4 left-4 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg',
            levelInfo.color
          )}
        >
          {levelInfo.label}
        </Badge>
        {course.duration && (
          <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1 rounded-lg text-primary dark:text-white font-bold text-sm">
            {course.duration}
          </div>
        )}
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        {/* Top section with fixed min-height to normalize card heights */}
        <div className="min-h-[150px] flex flex-col">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-sm font-bold text-primary dark:text-white">{course.rating?.toFixed(1) || '0'}</span>
            <span className="text-sm text-secondary dark:text-slate-400">({course.reviews?.toLocaleString() || 0} đánh giá)</span>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-primary dark:text-white mb-3 leading-tight font-headline">
            {course.title}
          </h3>
          <p className="text-sm text-secondary dark:text-slate-400 mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>
        </div>

        {/* Consistent Info Row - Always show same height area */}
        <div className="flex flex-col mb-4">
          {/* Progress Bar - for enrolled courses */}
          {course.isEnrolled && course.progress !== undefined && course.progress !== null && (
            <div className="min-h-[52px] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
                  Tiến độ
                </span>
                <span className="text-xs font-bold text-primary dark:text-white">
                  {course.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-low dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Students - for non-enrolled courses with students */}
          {!course.isEnrolled && course.students && (
            <div className="min-h-[52px] flex items-center">
              <div className="flex -space-x-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200"
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +{course.students}
                </div>
              </div>
              <span className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-widest ml-4">
                Học viên
              </span>
            </div>
          )}

          {/* Lessons & Price - for non-enrolled courses without students */}
          {!course.isEnrolled && !course.students && (
            <div className="min-h-[52px] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary dark:text-slate-400" />
                <span className="text-sm font-bold text-secondary dark:text-slate-400">
                  {course.lessons || 0} Bài học
                </span>
              </div>
              {course.price && (
                <span className="text-lg font-extrabold text-primary dark:text-white">
                  {course.price}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-[#0B3C5D] hover:bg-orange-400 text-white group/btn transition-all mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/user/courses/${course.id}`);
          }}
        >
          {course.isEnrolled ? (
            <>
              Tiếp tục học
              <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </>
          ) : course.students ? (
            <>
              Đăng ký ngay
              <Bolt className="w-5 h-5 ml-2 group-hover/btn:scale-110 transition-transform" />
            </>
          ) : course.price === 'Miễn phí' || course.price === 'Free' ? (
            <>
              Đăng ký
              <Circle className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Đăng ký
              <CreditCard className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const DanhSachKhoaHocUser = () => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyComparison, setWeeklyComparison] = useState<{
    thisWeekSubmissions: number;
    lastWeekSubmissions: number;
    percentage: number;
    comparison: string;
    message: string;
  } | null>(null);

  const levels = [
    { label: 'Cơ bản', value: 'beginner' },
    { label: 'Trung cấp', value: 'intermediate' },
    { label: 'Nâng cao', value: 'advanced' },
  ];

  /**
   * Fetch courses from API
   */
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token && token !== 'undefined' && token.length > 20) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fetch all 3 sources in parallel
        const [allCoursesRes, myCoursesRes, enrollmentsRes, weeklyComparisonRes] = await Promise.allSettled([
          fetch(API_ENDPOINTS.courses.list, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/courses/my/creator`, { headers }),
          fetch(API_ENDPOINTS.enrollments.my, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/stats/weekly-comparison`, { headers }),
        ]);

        // 1. All courses (public)
        const allResult = allCoursesRes.status === 'fulfilled' ? allCoursesRes.value : null;
        if (allResult?.ok) {
          const allData = await allResult.json();
          if (allData.success && allData.data) {
            const coursesData = Array.isArray(allData.data) ? allData.data : allData.data.courses || [];
            setAllCourses(coursesData);
          }
        }

        // 2. My created courses (lecture)
        const myResult = myCoursesRes.status === 'fulfilled' ? myCoursesRes.value : null;
        if (myResult?.ok) {
          const myData = await myResult.json();
          if (myData.success && myData.data) {
            const myCoursesData = (Array.isArray(myData.data) ? myData.data : myData.data.courses || []).map((c: any) => ({
              ...c,
              isEnrolled: true,
              progress: c.progress ?? 0,
              completedLessons: c.completedLessons ?? 0,
              totalLessons: c.totalLessons ?? 0,
            }));
            setMyCourses(myCoursesData);
          }
        }

        // 3. My enrolled courses
        const enrollResult = enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value : null;
        if (enrollResult?.ok) {
          const enrollData = await enrollResult.json();
          if (enrollData.success && enrollData.data) {
            const enrollmentsData = Array.isArray(enrollData.data) ? enrollData.data : [];
            const enrolledCourseList = enrollmentsData.map((e: any) => {
              const courseData = e.course || e;
              return {
                ...courseData,
                isEnrolled: true,
                progress: e.progress ?? courseData.progress ?? 0,
                completedLessons: e.completedLessons ?? courseData.completedLessons ?? 0,
                totalLessons: e.totalLessons ?? courseData.totalLessons ?? 0,
              };
            });
            setEnrolledCourses(enrolledCourseList);
          }
        }

        // 4. Weekly comparison (only if authenticated)
        const weeklyResult = weeklyComparisonRes.status === 'fulfilled' ? weeklyComparisonRes.value : null;
        if (weeklyResult?.ok) {
          const weeklyData = await weeklyResult.json();
          if (weeklyData.success && weeklyData.data) {
            setWeeklyComparison(weeklyData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /**
   * Toggle level filter
   */
  const toggleLevel = (value: string) => {
    setSelectedLevels((prev) =>
      prev.includes(value)
        ? prev.filter((l) => l !== value)
        : [...prev, value]
    );
  };

  /**
   * Filter and sort courses
   */
  // Courses NOT enrolled by user (for browse/discover)
  const enrolledIds = new Set([
    ...myCourses.map(c => c.id),
    ...enrolledCourses.map(c => c.id),
  ]);
  const browseCourses = allCourses.filter((course) => {
    if (selectedLevels.length === 0) return !enrolledIds.has(course.id);
    const courseLevel = (course.level || '').toLowerCase().trim();
    return selectedLevels.includes(courseLevel) && !enrolledIds.has(course.id);
  });

  // Merge myCourses + enrolledCourses, remove duplicates
  const mergedMyCourses = [...myCourses];
  enrolledCourses.forEach(c => {
    if (!mergedMyCourses.find(m => m.id === c.id)) {
      mergedMyCourses.push(c);
    }
  });

  const hasMyCourses = mergedMyCourses.length > 0;

  const sortedBrowseCourses = [...browseCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.reviews || 0) - (a.reviews || 0);
      default:
        return 0;
    }
  });

  const sortedMyCourses = [...mergedMyCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.reviews || 0) - (a.reviews || 0);
      default:
        return 0;
    }
  });

  /**
   * Sort options
   */
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'price-low', label: 'Giá thấp đến cao' },
  ];

  return (
    <div>
      {/* Hero Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-white mb-4 leading-tight tracking-tight font-headline">
            Khai phá tiềm năng lập trình cùng{' '}
            <span className="text-orange-400 underline decoration-4 underline-offset-8">
              CodeFit
            </span>
          </h1>
          <p className="text-base md:text-lg text-secondary dark:text-slate-400 leading-relaxed">
            Học từ những chuyên gia hàng đầu với lộ trình bài bản, dự án thực tế và cộng đồng hỗ trợ tận tâm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>

          <div className="hidden md:flex items-center gap-4 bg-surface-container-lowest dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-outline-variant/15">
            <div className="w-12 h-12 bg-primary-fixed dark:bg-primary rounded-full flex items-center justify-center text-primary dark:text-white">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary dark:text-white tracking-tighter">{allCourses.length > 0 ? allCourses.length : '-'}</p>
              <p className="text-xs text-secondary dark:text-slate-400 font-bold uppercase tracking-wider">Khóa học</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Comparison Banner */}
      {!isLoading && weeklyComparison && weeklyComparison.percentage !== 0 && (
        <div className={cn(
          "mb-6 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3",
          weeklyComparison.comparison === 'better'
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          <span className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-lg",
            weeklyComparison.comparison === 'better'
              ? "bg-green-200 dark:bg-green-800"
              : "bg-red-200 dark:bg-red-800"
          )}>
            {weeklyComparison.comparison === 'better' ? '+' : ''}{weeklyComparison.percentage}%
          </span>
          <span>{weeklyComparison.message}</span>
        </div>
      )}

      {/* Mobile Filter Panel */}
      {showMobileFilter && (
        <Card className="mb-6 md:hidden">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Mức độ</h3>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <Button
                    key={level.value}
                    variant={selectedLevels.includes(level.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleLevel(level.value)}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90"
              onClick={() => setShowMobileFilter(false)}
            >
              Áp dụng
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Desktop Filter & Sort */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        {/* Desktop Level Filter */}
        <div className="hidden md:flex items-center gap-4">
          {levels.map((level) => (
            <Button
              key={level.value}
              variant={selectedLevels.includes(level.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleLevel(level.value)}
            >
              {level.label}
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            Sắp xếp theo: <span className="font-semibold">{sortOptions.find(o => o.value === sortBy)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {showSortMenu && (
            <Card className="absolute right-0 top-full mt-2 w-48 z-50">
              <CardContent className="p-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors',
                      sortBy === option.value && 'text-orange-500 font-semibold'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Course Count */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Hiển thị <span className="font-bold text-primary dark:text-white">
          {hasMyCourses ? sortedBrowseCourses.length : sortedBrowseCourses.length}
        </span> khóa học{hasMyCourses ? ' có sẵn' : ''}
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="ml-4 text-lg text-slate-500">Đang tải khóa học...</span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      )}

      {/* ========== My Courses Section (only show if user has enrolled courses) ========== */}
      {!isLoading && !error && hasMyCourses && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-orange-400 rounded-full" />
            Khóa học của tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {sortedMyCourses.map((course) => (
              <CourseCard key={`my-${course.id}`} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* ========== Browse / Available Courses Section ========== */}
      {!isLoading && !error && (
        <>
          {hasMyCourses && (
            <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full" />
              Khóa học đăng ký
            </h2>
          )}
          {/* Empty State */}
          {!isLoading && !error && sortedBrowseCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Code className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg text-slate-500">Không có khóa học nào</p>
            </div>
          )}

          {/* Courses Grid */}
          {sortedBrowseCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              {sortedBrowseCourses.map((course) => (
                <CourseCard key={`browse-${course.id}`} course={course} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DanhSachKhoaHocUser;
