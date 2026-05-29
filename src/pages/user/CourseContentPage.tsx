import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  PlayCircle,
  Code,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Clock,
  Image as ImageIcon,
  Play,
  Award,
  Trophy,
  FolderOpen,
  GraduationCap,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
  minitests?: Minitest[];
  _count?: { lessons: number; minitests: number };
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  orderIndex: number;
  isPublished: boolean;
  lessonContent?: {
    content: string;
    starterCode: string;
  };
}

interface Minitest {
  id: string;
  title: string;
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
}

interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
}

interface EnrollmentData {
  completedLessons: number;
  currentUnlocks: number;
}

interface CourseConfig {
  unlockLessonsCount: number;
  unlockByPhase: boolean;
}

const getLessonTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="w-5 h-5" />;
    case 'code':
      return <Code className="w-5 h-5" />;
    default:
      return <PlayCircle className="w-5 h-5" />;
  }
};

const getLessonTypeText = (type: string) => {
  switch (type) {
    case 'video':
      return 'Video bài giảng';
    case 'code':
      return 'Bài tập thực hành';
    default:
      return 'Bài học';
  }
};

export default function CourseContentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';
  
  const [course, setCourse] = useState<any>(null);
  const [courseConfig, setCourseConfig] = useState<CourseConfig>({ unlockLessonsCount: 3, unlockByPhase: false });
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token && token !== 'undefined' && token !== 'null' && token.length > 20) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Fetch course details
      const courseRes = await fetch(API_ENDPOINTS.courses.detail(id), { headers });
      const courseData = await courseRes.json();

      if (courseData.success) {
        setCourse(courseData.data);
        
        // Set course unlock config
        setCourseConfig({
          unlockLessonsCount: courseData.data.unlockLessonsCount ?? 3,
          unlockByPhase: courseData.data.unlockByPhase ?? false,
        });

        // Auto-expand first phase
        if (courseData.data.phases?.length > 0) {
          setExpandedPhases(new Set([courseData.data.phases[0].id]));
        }

        // Set hackathons and projects
        setHackathons(courseData.data.hackathons || []);
        setProjects(courseData.data.projects || []);
      }

      // Fetch enrollment with unlock info
      try {
        const enrollRes = await fetch(`${API_ENDPOINTS.enrollments.detail(id)}`, { headers });
        const enrollData = await enrollRes.json();
        
        if (enrollRes.status === 401) {
          // Token lỗi hoặc hết hạn - xóa token và chuyển về login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setEnrollment(null);
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (enrollRes.status === 404 || !enrollData.success) {
          // Không tìm thấy enrollment - user chưa đăng ký khóa học này
          setEnrollment(null);
          setError('Bạn chưa đăng ký khóa học này');
        } else if (enrollData.success) {
          // Fallback: if currentUnlocks is 0 or null, use course's unlockLessonsCount
          const courseUnlockCount = courseData.data.unlockLessonsCount ?? 3;
          const enrollmentUnlocks = enrollData.data.currentUnlocks ?? courseUnlockCount;
          const finalUnlocks = enrollmentUnlocks === 0 ? courseUnlockCount : enrollmentUnlocks;
          
          setEnrollment({
            completedLessons: enrollData.data.completedLessons || 0,
            currentUnlocks: finalUnlocks,
          });
        }
      } catch (e) {
        setEnrollment(null);
        setError('Bạn chưa đăng ký khóa học này');
      }

      // Fetch lesson progress
      try {
        const progressRes = await fetch(API_ENDPOINTS.lessonProgress.courseProgress(id), { headers });
        const progressData = await progressRes.json();
        if (progressData.success && Array.isArray(progressData.data)) {
          setLessonProgress(progressData.data);
        }
      } catch (e) {
        // Progress not available yet
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError('Có lỗi khi tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Calculate which lessons are unlocked
  const getUnlockedLessonIds = (): Set<string> => {
    if (!course?.phases) return new Set();

    const unlockedIds = new Set<string>();
    
    // For free courses, all published lessons are unlocked
    const isFreeCourse = course.subscriptionType === 'FREE' || course.price === 0;
    if (isFreeCourse || courseConfig.unlockLessonsCount === 0) {
      course.phases.forEach((phase: Phase) => {
        phase.lessons?.forEach((lesson: Lesson) => {
          if (lesson.isPublished) {
            unlockedIds.add(lesson.id);
          }
        });
      });
      return unlockedIds;
    }

    // Build flat lesson list with linear index
    const allLessons: { lesson: Lesson; linearIndex: number }[] = [];
    course.phases.forEach((phase: Phase, phaseIndex: number) => {
      phase.lessons?.forEach((lesson: Lesson, lessonIndex: number) => {
        allLessons.push({
          lesson,
          linearIndex: phaseIndex * 1000 + lessonIndex, // phase * 1000 to separate phases
        });
      });
    });

    // Sort by linear index
    allLessons.sort((a, b) => a.linearIndex - b.linearIndex);

    // Unlock lessons based on currentUnlocks count
    const maxUnlocked = enrollment?.currentUnlocks || courseConfig.unlockLessonsCount;
    
    allLessons.forEach((item, index) => {
      if (index < maxUnlocked && item.lesson.isPublished) {
        unlockedIds.add(item.lesson.id);
      }
    });

    return unlockedIds;
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(lp => lp.lessonId === lessonId && lp.isCompleted);
  };

  const isLessonUnlocked = (lessonId: string) => {
    return getUnlockedLessonIds().has(lessonId);
  };

  const getNextLesson = () => {
    if (!course?.phases) return null;

    const unlockedIds = getUnlockedLessonIds();

    for (const phase of course.phases) {
      for (const lesson of phase.lessons) {
        if (unlockedIds.has(lesson.id) && !isLessonCompleted(lesson.id) && lesson.isPublished) {
          return lesson;
        }
      }
    }
    return null;
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const handleContinueLearning = () => {
    const next = getNextLesson();
    if (next) {
      navigate(`/user/lesson/${next.id}`);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.isPublished && isLessonUnlocked(lesson.id)) {
      navigate(`/user/lesson/${lesson.id}`);
    }
  };

  const handleMinitestClick = (minitest: Minitest) => {
    navigate(`/user/minitest/lam-bai?minitestId=${minitest.id}`);
  };

  const handleHackathonClick = (hackathon: Hackathon) => {
    navigate(`/user/hackathon/${hackathon.id}`);
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/user/project/${project.id}`);
  };

  const handleCertificateClick = () => {
    navigate(`/user/certificate/${course?.id}`);
  };

  // Check if all phases are completed
  const isAllPhasesCompleted = () => {
    if (!course?.phases) return false;
    return course.phases.every((phase: Phase) => {
      const phaseLessons = phase.lessons || [];
      return phaseLessons.length > 0 && phaseLessons.every(lesson => isLessonCompleted(lesson.id));
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Đang tải nội dung khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    const isAuthError = error?.includes('phiên đăng nhập') || error?.includes('đăng nhập lại');
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CardContent>
            {isAuthError ? (
              <>
                <Lock className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {error}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Vui lòng đăng nhập lại để tiếp tục học
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/dang-nhap')} className="bg-primary hover:bg-primary/90">
                    Đăng nhập lại
                  </Button>
                  <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Lock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {error || 'Không tìm thấy khóa học'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Bạn cần đăng ký khóa học này để xem nội dung
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={() => navigate(`/user/courses/${id}`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Xem thông tin khóa học
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalLessons = course.phases?.reduce((acc: number, p: Phase) => acc + (p.lessons?.length || 0), 0) || 0;
  const completedCount = lessonProgress.filter(lp => lp.isCompleted).length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextLesson = getNextLesson();
  const unlockedIds = getUnlockedLessonIds();
  const unlockedCount = unlockedIds.size;

  const isPhaseCompleted = (phase: Phase) => {
    const phaseLessons = phase.lessons || [];
    if (phaseLessons.length === 0) return false;
    return phaseLessons.every(lesson => isLessonCompleted(lesson.id));
  };

  const isMinitestAccessible = (phase: Phase) => {
    return isPhaseCompleted(phase);
  };

  // Collect all minitests
  const allMinitests: { id: string; title: string; phaseTitle: string }[] = [];
  course.phases?.forEach((phase: Phase) => {
    phase.minitests?.forEach((mt: Minitest) => {
      allMinitests.push({
        id: mt.id,
        title: mt.title,
        phaseTitle: phase.title,
      });
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Course Header - Image Right, Content Left */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/user/courses/${id}`)}
            className="mb-4 pl-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang khóa học
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left - Course Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <BookOpen className="w-4 h-4" />
                <span>Khóa học</span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {course.title}
              </h1>
              
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  {totalLessons} bài học
                </Badge>
                {course.duration && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                )}
                {course.level && (
                  <Badge variant="secondary">
                    {course.level === 'beginner' ? 'Cơ bản' : 
                     course.level === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                  </Badge>
                )}
              </div>

              {/* Progress & Continue Button */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Tiến độ</span>
                    <span className="font-medium text-slate-900 dark:text-white">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  {courseConfig.unlockLessonsCount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Đã mở khóa {unlockedCount}/{totalLessons} bài học
                      {completedCount >= unlockedCount && completedCount < totalLessons && (
                        <span className="text-orange-500"> - Hoàn thành để mở thêm!</span>
                      )}
                    </p>
                  )}
                </div>
                {nextLesson && (
                  <Button
                    onClick={handleContinueLearning}
                    className="bg-primary hover:bg-primary/90 gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Tiếp tục học
                  </Button>
                )}
              </div>
            </div>

            {/* Right - Course Image */}
            <div className="lg:col-span-1">
              {course.image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Phases & Lessons */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Nội dung khóa học
          </h2>

          {course.phases?.map((phase: Phase, phaseIndex: number) => (
            <Card key={phase.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-bold flex items-center justify-center">
                      {phaseIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">{phase.title}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {phase.lessons?.length || 0} bài học
                        {phase._count?.minitests && phase._count.minitests > 0 && ` • ${phase._count.minitests} bài test`}
                      </p>
                    </div>
                  </div>
                  {expandedPhases.has(phase.id) ? (
                    <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  )}
                </div>
              </CardHeader>

              {expandedPhases.has(phase.id) && (
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {phase.lessons?.map((lesson: Lesson) => {
                      const completed = isLessonCompleted(lesson.id);
                      const unlocked = isLessonUnlocked(lesson.id);
                      const locked = !unlocked || !lesson.isPublished;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'flex items-center gap-4 p-4 transition-all',
                            locked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                            completed && 'bg-green-50/50 dark:bg-green-900/10'
                          )}
                          onClick={() => !locked && handleLessonClick(lesson)}
                        >
                          {/* Status Icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                            completed
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                              : locked
                                ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          )}>
                            {completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : locked ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              getLessonTypeIcon(lesson.type)
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              'font-medium truncate',
                              completed ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'
                            )}>
                              {lesson.orderIndex + 1}. {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getLessonTypeText(lesson.type)}
                              </Badge>
                              {completed && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-xs">
                                  Hoàn thành
                                </Badge>
                              )}
                              {locked && !completed && (
                                <Badge variant="secondary" className="text-xs">
                                  Khóa
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {!locked && (
                            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}

                    {/* Minitests in phase */}
                    {phase.minitests?.map((mt: Minitest) => {
                      const accessible = isMinitestAccessible(phase);
                      return (
                        <div
                          key={mt.id}
                          className={cn(
                            'flex items-center gap-4 p-4 transition-all cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 border-t border-slate-100 dark:border-slate-800',
                            !accessible && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => accessible && handleMinitestClick(mt)}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                            accessible
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                              : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          )}>
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {mt.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 text-xs">
                                Minitest
                              </Badge>
                              {!accessible && (
                                <span className="text-xs text-slate-500">
                                  (Cần hoàn thành chương này)
                                </span>
                              )}
                            </div>
                          </div>
                          {accessible && <ChevronRight className="w-5 h-5 text-slate-400" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {(!course.phases || course.phases.length === 0) && (
            <Card className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardContent>
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  Khóa học này chưa có nội dung
                </p>
              </CardContent>
            </Card>
          )}

          {/* Final Test Section */}
          {hackathons.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className={cn(
                'p-4 border-b border-slate-200 dark:border-slate-800',
                isDark ? 'bg-amber-900/20' : 'bg-amber-50'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                  )}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      Final Test - Test Tổng Hợp
                    </h3>
                    <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Hoàn thành tất cả các chương để mở khóa
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {hackathons.map((hackathon) => {
                    const accessible = isAllPhasesCompleted();
                    return (
                      <div
                        key={hackathon.id}
                        className={cn(
                          'flex items-center gap-4 p-4 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                          !accessible && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => accessible && handleHackathonClick(hackathon)}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          accessible
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                            : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                        )}>
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            'font-medium',
                            accessible ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-500')
                          )}>
                            {hackathon.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn(
                              'text-xs',
                              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                            )}>
                              Final Test
                            </Badge>
                            {!accessible && (
                              <span className="text-xs text-slate-500">
                                (Cần hoàn thành tất cả chương)
                              </span>
                            )}
                          </div>
                        </div>
                        {accessible && <ChevronRight className="w-5 h-5 text-slate-400" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Section */}
          {projects.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className={cn(
                'p-4 border-b border-slate-200 dark:border-slate-800',
                isDark ? 'bg-cyan-900/20' : 'bg-cyan-50'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                  )}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      Final Project - Dự Án Cuối Khóa
                    </h3>
                    <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Upload project của bạn (tối đa 25MB)
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {projects.map((project) => {
                    const accessible = isAllPhasesCompleted();
                    return (
                      <div
                        key={project.id}
                        className={cn(
                          'flex items-center gap-4 p-4 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                          !accessible && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => accessible && handleProjectClick(project)}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          accessible
                            ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400'
                            : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                        )}>
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            'font-medium',
                            accessible ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-500')
                          )}>
                            {project.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn(
                              'text-xs',
                              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                            )}>
                              Final Project
                            </Badge>
                            {!accessible && (
                              <span className="text-xs text-slate-500">
                                (Cần hoàn thành tất cả chương)
                              </span>
                            )}
                          </div>
                        </div>
                        {accessible && <ChevronRight className="w-5 h-5 text-slate-400" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificate Section */}
          {isAllPhasesCompleted() && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center',
                      isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                    )}>
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className={cn('font-semibold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                        Chúc mừng bạn đã hoàn thành khóa học!
                      </h3>
                      <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Nhận chứng chỉ hoàn thành khóa học ngay
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCertificateClick}
                    className={cn(
                      'gap-2',
                      isDark
                        ? 'bg-green-500 hover:bg-green-400 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    )}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Nhận chứng chỉ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
