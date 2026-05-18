import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';

const learningPathDetail = {
  id: 'react-advanced',
  track: 'Advanced Track',
  title: 'Lập trình React Nâng cao',
  description:
    'Nâng tầm kỹ năng lập trình Frontend của bạn với các kiến thức chuyên sâu về kiến trúc, state và tối ưu hiệu suất.',
  phases: [
    {
      id: 1,
      title: 'Kiến trúc Component',
      progress: 100,
      status: 'completed',
      currentLesson: null,
    },
    {
      id: 2,
      title: 'State Management nâng cao',
      progress: 45,
      status: 'current',
      currentLesson: 'Redux Toolkit Saga',
    },
    {
      id: 3,
      title: 'Performance & Optimization',
      progress: 0,
      status: 'locked',
      currentLesson: null,
    },
    {
      id: 4,
      title: 'Dự án thực tế',
      progress: 0,
      status: 'locked',
      currentLesson: null,
    },
  ],
  weeklyChallenge: {
    title: 'Thử thách hàng tuần: Clean Architecture',
    description:
      'Áp dụng kiến thức Component Architecture vào dự án E-commerce mini và nhận review từ chuyên gia.',
  },
};

const getPhaseStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
          <Check className="text-white w-6 h-6" />
        </div>
      );
    case 'current':
      return (
        <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center">
          <RefreshCw className="text-orange-700 w-6 h-6" />
        </div>
      );
    case 'locked':
      return (
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
          <Lock className="text-slate-400 w-5 h-5" />
        </div>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
          Hoàn thành
        </Badge>
      );
    case 'current':
      return (
        <Badge className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
          Đang học
        </Badge>
      );
    case 'locked':
      return (
        <Badge className="bg-surface-container-high text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
          Đang khóa
        </Badge>
      );
    default:
      return null;
  }
};

const LoTrinhHocUser = () => {
  const { routeLoTrinh } = useParams<{ routeLoTrinh: string }>();

  // Route param: /user/lot-trinh/:routeLoTrinh
  console.log('Current learning path:', routeLoTrinh);
  // TODO: Fetch learning path data based on routeLoTrinh param

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <Badge className="bg-secondary-container text-primary text-xs font-bold mb-4 uppercase tracking-widest">
          {learningPathDetail.track}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-white mb-4 leading-tight font-headline">
          Lộ trình học tập:
          <br />
          {learningPathDetail.title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg">
          {learningPathDetail.description}
        </p>
      </header>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-surface-container-highest" />

        {learningPathDetail.phases.map((phase) => {
          const isCurrent = phase.status === 'current';
          const isLocked = phase.status === 'locked';

          return (
            <div
              key={phase.id}
              className={cn(
                'relative flex items-start gap-8 mb-16 group',
                isLocked && 'opacity-75 grayscale-[0.5]'
              )}
            >
              {/* Timeline Node */}
              {getPhaseStatusIcon(phase.status)}

              {/* Phase Card */}
              <div
                className={cn(
                  'flex-1 p-6 rounded-2xl border border-transparent bg-surface-container-lowest dark:bg-slate-900/50 transition-transform hover:scale-[1.01]',
                  isCurrent && 'ring-2 ring-orange-300'
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                      Giai đoạn {phase.id}
                    </span>
                    <h3
                      className={cn(
                        'text-xl font-bold text-primary dark:text-white',
                        isLocked && 'text-slate-500'
                      )}
                    >
                      {phase.title}
                    </h3>
                  </div>
                  {getStatusBadge(phase.status)}
                </div>

                {isLocked ? (
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-0" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Tiến độ học tập</span>
                      <span className="font-bold text-primary dark:text-white">
                        {phase.progress}%
                      </span>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                    {isCurrent && phase.currentLesson && (
                      <div className="pt-2">
                        <Button className="bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                          Tiếp tục bài học: {phase.currentLesson}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isLocked && (
                  <p className="mt-4 text-xs text-muted-foreground italic">
                    Hoàn thành giai đoạn trước để mở khóa nội dung này.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Challenge Section */}
      <section className="mt-20">
        <div className="bg-primary-container rounded-[2rem] p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-300/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl" />

          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              {learningPathDetail.weeklyChallenge.title}
            </h2>
            <p className="text-white/80 mb-6 max-w-md">
              {learningPathDetail.weeklyChallenge.description}
            </p>
            <Button className="bg-orange-300 hover:bg-orange-400 text-orange-800 font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform">
              Tham gia ngay
            </Button>
          </div>

          <div className="relative z-10 w-full md:w-1/3 aspect-video bg-blue-200/10 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
              alt="Code Editor"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoTrinhHocUser;
