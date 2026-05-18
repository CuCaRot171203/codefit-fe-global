import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  PlayCircle,
  Code,
  Clock,
  Zap,
  CheckCircle,
  Lock,
  LockOpen,
} from 'lucide-react';

const courseData = {
  title: 'Lập trình React Nâng cao',
  description:
    'Nâng cao kỹ năng React của bạn với các khái niệm chuyên sâu: Hooks tùy chỉnh, Render Props, Compound Components và tối ưu hóa hiệu năng ứng dụng thực tế.',
  progress: 60,
  stats: {
    hours: 24,
    projects: 12,
    students: '8.5k',
  },
  lessons: [
    {
      id: 1,
      number: '01',
      title: 'Higher-Order Components (HOC) cơ bản',
      status: 'completed',
      difficulty: 'easy',
      type: 'video',
      duration: '15 phút',
    },
    {
      id: 2,
      number: '02',
      title: 'Xây dựng Custom Hooks cho Fetch API',
      status: 'completed',
      difficulty: 'medium',
      type: 'exercise',
      duration: '45 phút',
    },
    {
      id: 3,
      number: '03',
      title: 'Tối ưu hóa với useMemo và useCallback',
      status: 'current',
      difficulty: 'hard',
      type: 'video-exercise',
      duration: '60 phút',
    },
    {
      id: 4,
      number: '04',
      title: 'Advanced Patterns: Compound Components',
      status: 'locked',
      difficulty: 'hard',
      type: 'exercise',
      duration: '90 phút',
    },
    {
      id: 5,
      number: '05',
      title: 'Server Side Rendering với Next.js',
      status: 'locked',
      difficulty: 'medium',
      type: 'video',
      duration: '40 phút',
    },
  ],
};

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return (
        <Badge className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
          Dễ
        </Badge>
      );
    case 'medium':
      return (
        <Badge className="bg-secondary-container text-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
          Trung bình
        </Badge>
      );
    case 'hard':
      return (
        <Badge className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
          Khó
        </Badge>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Đã hoàn thành
        </Badge>
      );
    case 'current':
      return (
        <Badge className="bg-blue-100 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Đang học
        </Badge>
      );
    case 'locked':
      return (
        <Badge className="bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Chưa mở
        </Badge>
      );
    default:
      return null;
  }
};

const getLessonTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="w-4 h-4" />;
    case 'exercise':
      return <Code className="w-4 h-4" />;
    case 'video-exercise':
      return (
        <span className="flex items-center gap-1">
          <PlayCircle className="w-4 h-4" />
          <Code className="w-4 h-4" />
        </span>
      );
    default:
      return <PlayCircle className="w-4 h-4" />;
  }
};

const getLessonTypeText = (type: string) => {
  switch (type) {
    case 'video':
      return 'Video bài giảng';
    case 'exercise':
      return 'Bài tập thực hành';
    case 'video-exercise':
      return 'Video & Thực hành';
    default:
      return 'Bài học';
  }
};

const ChuongTrinhHocUser = () => {
  const { chuongTrinhId } = useParams<{ chuongTrinhId: string }>();

  // Route param: /user/chuong-trinh/:chuongTrinhId
  console.log('Current course:', chuongTrinhId);
  // TODO: Fetch course data based on chuongTrinhId param

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex items-center gap-2 text-primary-container font-semibold mb-2">
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-bold">
            Chương trình học
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary dark:text-white tracking-tight mb-4">
          {courseData.title}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          {courseData.description}
        </p>

        {/* Progress */}
        <div className="mt-8 max-w-md">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-primary dark:text-white">
              Tiến độ khóa học
            </span>
            <span className="text-sm font-headline font-bold text-primary dark:text-white">
              {courseData.progress}%
            </span>
          </div>
          <Progress value={courseData.progress} className="h-3" />
        </div>
      </header>

      {/* Lesson List */}
      <section className="grid grid-cols-1 gap-6">
        {courseData.lessons.map((lesson) => {
          const isCompleted = lesson.status === 'completed';
          const isCurrent = lesson.status === 'current';
          const isLocked = lesson.status === 'locked';

          return (
            <div
              key={lesson.id}
              className={cn(
                'group relative p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all',
                isCurrent
                  ? 'bg-surface dark:bg-slate-900 border-l-4 border-primary shadow-lg'
                  : isLocked
                    ? 'bg-surface-container-low/50 opacity-70 grayscale'
                    : 'bg-surface-container-lowest dark:bg-slate-900/50 hover:shadow-md hover:border hover:border-outline',
                !isLocked && 'hover:translate-x-1'
              )}
            >
              <div className="flex items-center gap-6 flex-1">
                {/* Lesson Number */}
                <div
                  className={cn(
                    'flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl font-headline font-bold text-xl transition-colors',
                    isCurrent
                      ? 'bg-primary text-white'
                      : isLocked
                        ? 'bg-surface-container-high text-slate-400'
                        : 'bg-surface-container-low text-primary dark:text-white group-hover:bg-primary/10'
                  )}
                >
                  {lesson.number}
                </div>

                <div>
                  {/* Badges */}
                  <div className="flex items-center gap-3 mb-1">
                    {getStatusBadge(lesson.status)}
                    {getDifficultyBadge(lesson.difficulty)}
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      'text-xl font-bold transition-colors',
                      isCurrent
                        ? 'text-primary dark:text-white'
                        : isLocked
                          ? 'text-slate-400'
                          : 'text-primary dark:text-white group-hover:text-primary'
                    )}
                  >
                    {lesson.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      {getLessonTypeIcon(lesson.type)}
                      {getLessonTypeText(lesson.type)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {lesson.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isLocked ? (
                <Button
                  className={cn(
                    'w-full md:w-auto px-6 py-3 rounded-xl font-bold transition-all text-sm',
                    isCurrent
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-md'
                      : 'bg-surface-container-high text-primary hover:bg-surface-container-low'
                  )}
                >
                  {isCompleted ? 'Xem lại' : isCurrent ? 'Tiếp tục học' : 'Bắt đầu'}
                </Button>
              ) : (
                <LockOpen className="w-8 h-8 text-slate-300" />
              )}
            </div>
          );
        })}
      </section>

      {/* Footer Stats */}
      <footer className="mt-20 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-muted-foreground italic text-sm leading-relaxed max-w-md">
          "Code is like humor. When you have to explain it, it's bad." – Cory House.
          Chúng tôi tập trung vào việc giúp bạn viết mã nguồn tự giải thích và hiệu quả.
        </p>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold font-headline text-primary dark:text-white">
              {courseData.stats.hours}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Giờ học
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-headline text-primary dark:text-white">
              {courseData.stats.projects}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Dự án
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-headline text-primary dark:text-white">
              {courseData.stats.students}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Học viên
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChuongTrinhHocUser;
