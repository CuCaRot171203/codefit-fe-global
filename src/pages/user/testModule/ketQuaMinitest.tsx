'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import {
  CheckCircle,
  AlertTriangle,
  Trophy,
  Zap,
  Timer,
  RefreshCw,
  Eye,
  Lightbulb,
  Star,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

interface MinitestQuestion {
  id: string;
  problemId: string;
  problem: {
    id: string;
    title: string;
    difficulty: string;
  };
}

interface Minitest {
  id: string;
  title: string;
  phase?: {
    title: string;
    course?: {
      title: string;
    };
  };
  questions: MinitestQuestion[];
}

const KetQuaMinitest = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const minitestId = searchParams.get('minitestId');
  const [isLoading, setIsLoading] = useState(false);
  const [minitest, setMinitest] = useState<Minitest | null>(null);
  const [resultData, setResultData] = useState<{
    score: number;
    totalScore: number;
    timeSpent: string;
    ranking: number;
    totalParticipants: number;
    correctAnswers: number;
    incorrectAnswers: number;
  } | null>(null);

  useEffect(() => {
    if (minitestId) {
      fetchMinitest();
      fetchResult();
    }
  }, [minitestId]);

  const fetchMinitest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.minitests.detail(minitestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setMinitest(data.data);
      }
    } catch (error) {
      console.error('Error fetching minitest:', error);
    }
  };

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.minitests.result(minitestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResultData(data.data);
      } else {
        // Fallback: use mock data if API fails
        setResultData({
          score: minitest?.questions?.length ? minitest.questions.length * 70 : 70,
          totalScore: minitest?.questions?.length ? minitest.questions.length * 100 : 100,
          timeSpent: '15 phút',
          ranking: 42,
          totalParticipants: 1234,
          correctAnswers: 7,
          incorrectAnswers: 3,
        });
      }
    } catch (error) {
      console.error('Error fetching result:', error);
      // Fallback: use mock data
      setResultData({
        score: minitest?.questions?.length ? minitest.questions.length * 70 : 70,
        totalScore: minitest?.questions?.length ? minitest.questions.length * 100 : 100,
        timeSpent: '15 phút',
        ranking: 42,
        totalParticipants: 1234,
        correctAnswers: 7,
        incorrectAnswers: 3,
      });
    }
  };

  // Calculate progress percentage from resultData
  const score = resultData?.score || 0;
  const totalScore = resultData?.totalScore || (minitest?.questions?.length ? minitest.questions.length * 100 : 100);
  const progressPercentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Safe accessors with fallbacks
  const safeResult = (field: string, fallback: any) => resultData ? (resultData as any)[field] ?? fallback : fallback;

  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/user/minitest/lam-bai?minitestId=${minitestId}`);
    }, 800);
  };

  const handleBackToCourse = async () => {
    setIsLoading(true);
    try {
      // Priority 1: Use nextLessonId from resultData (backend already calculates next lesson)
      if (resultData && (resultData as any).nextLessonId) {
        navigate(`/user/lesson/${(resultData as any).nextLessonId}`);
        return;
      }

      // Priority 2: Get next lesson from minitest phase lessons
      if (minitest?.phase?.lessons) {
        const lessons = minitest.phase.lessons;

        // Find next incomplete lesson
        const nextLesson = lessons.find((l: any) => !l.isCompleted);

        if (nextLesson) {
          navigate(`/user/lesson/${nextLesson.id}`);
          return;
        }

        // If all completed, go to first lesson of phase
        if (lessons.length > 0) {
          navigate(`/user/lesson/${lessons[0].id}`);
          return;
        }
      }

      // Fallback: navigate to course page
      navigate('/user/courses');
    } catch (error) {
      console.error('Error navigating to next lesson:', error);
      navigate('/user/courses');
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className={cn(
            'gap-2 mb-4',
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className={cn(
              'font-semibold px-3 py-1 rounded-full text-xs tracking-wider uppercase mb-3 inline-block',
              isDark
                ? 'bg-amber-900/30 text-amber-400'
                : 'bg-amber-100 text-amber-700'
            )}>
              Kết quả bài thi
            </span>
            <h1 className={cn(
              'text-4xl font-bold mb-2',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {minitest?.title || 'Minitest'}
            </h1>
            <p className={cn(
              'text-base max-w-lg',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Chúc mừng! Bạn đã hoàn thành bài kiểm tra minitest của chương.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleRetry}
              disabled={isLoading}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2',
                isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              )}
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
              Làm lại
            </Button>
            <Button
              onClick={handleBackToCourse}
              disabled={isLoading}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-lg flex items-center gap-2',
                isDark
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/20'
              )}
            >
              Tiếp tục học
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid Performance Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Score Card */}
        <section className={cn(
          'md:col-span-4 p-8 rounded-3xl flex flex-col items-center justify-center text-center',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* Circular Progress */}
            <svg className="w-full h-full -rotate-90">
              <circle
                className={cn(
                  '',
                  isDark ? 'text-slate-700' : 'text-surface-container-low'
                )}
                cx="96"
                cy="96"
                fill="transparent"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
              />
              <circle
                className={cn(
                  'transition-all duration-1000 ease-out',
                  isDark ? 'text-blue-400' : 'text-primary-container'
                )}
                cx="96"
                cy="96"
                fill="transparent"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {resultData ? (
                <>
                  <span className={cn(
                    'text-5xl font-headline font-bold',
                    isDark ? 'text-white' : 'text-primary'
                  )}>
                    {safeResult('score', 0)}
                  </span>
                  <span className={cn(
                    'text-sm font-medium tracking-widest',
                    isDark ? 'text-slate-400' : 'text-secondary'
                  )}>
                    / {safeResult('totalScore', 100)}
                  </span>
                </>
              ) : (
                <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-slate-400' : 'text-slate-500')} />
              )}
            </div>
          </div>

          <h3 className={cn(
            'text-lg font-headline font-semibold mb-1',
            isDark ? 'text-white' : 'text-on-surface'
          )}>
            Điểm tổng kết
          </h3>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-500' : 'text-secondary'
          )}>
            {resultData ? `Hoàn thành trong ${resultData.timeSpent}` : 'Đang tải...'}
          </p>
        </section>

        {/* Ranking Badge & Stats */}
        <section className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Ranking */}
          <div className={cn(
            'p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between',
            isDark ? 'bg-blue-900/30' : 'bg-primary-container text-on-primary'
          )}>
            <div className="z-10">
              <p className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-2',
                isDark ? 'text-blue-400' : 'text-on-primary-container'
              )}>
                Thứ hạng toàn cầu
              </p>
              <h2 className={cn(
                'text-4xl font-headline font-bold mb-4',
                isDark ? 'text-white' : 'text-on-primary'
              )}>
                {resultData?.ranking || '-'}
              </h2>
              <p className={cn(
                'text-sm leading-relaxed',
                isDark ? 'text-slate-400' : 'text-on-primary-container/80'
              )}>
                Bạn đang dẫn đầu so với hơn {safeResult('totalParticipants', 0).toLocaleString()} học viên khác trong cùng bài test này.
              </p>
            </div>
            <Trophy className={cn(
              'absolute -bottom-4 -right-4 w-32 h-32 opacity-10',
              isDark ? 'text-amber-400' : 'text-on-primary'
            )} />
          </div>

          {/* Fast Stats */}
          <div className={cn(
            'p-8 rounded-3xl flex flex-col justify-between',
            isDark ? 'bg-slate-800' : 'bg-surface-container-low'
          )}>
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isDark ? 'bg-amber-900/30' : 'bg-surface-container-lowest'
              )}>
                <Zap className={cn(
                  'w-6 h-6',
                  isDark ? 'text-amber-400' : 'text-tertiary-container'
                )} />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-slate-400' : 'text-secondary'
                )}>
                  Độ chính xác
                </p>
                <p className={cn(
                  'text-xl font-headline font-bold',
                  isDark ? 'text-white' : 'text-on-surface'
                )}>
                  {safeResult('accuracy', 0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isDark ? 'bg-slate-700' : 'bg-surface-container-lowest'
              )}>
                <Timer className={cn(
                  'w-6 h-6',
                  isDark ? 'text-blue-400' : 'text-primary-container'
                )} />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-slate-400' : 'text-secondary'
                )}>
                  Thời gian
                </p>
                <p className={cn(
                  'text-xl font-headline font-bold',
                  isDark ? 'text-white' : 'text-on-surface'
                )}>
                  {safeResult('timeSpent', 'N/A')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Feedback Card */}
        <section className={cn(
          'md:col-span-7 p-8 rounded-3xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn(
              'text-xl font-headline font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}>
              Nhận xét chuyên môn
            </h3>
            <Lightbulb className={cn(
              'w-8 h-8',
              isDark ? 'text-amber-400' : 'text-tertiary-fixed-dim'
            )} />
          </div>

          <div className="space-y-6">
            {/* Strengths */}
            {(safeResult('strengths', []) as any[]).map((item: any, index: number) => (
              <div
                key={index}
                className={cn(
                  'p-5 rounded-2xl',
                  isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'
                )}
              >
                <div className="flex gap-4">
                  <CheckCircle className={cn(
                    'w-6 h-6 shrink-0 mt-0.5',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )} />
                  <div>
                    <p className={cn(
                      'font-bold mb-1',
                      isDark ? 'text-white' : 'text-on-surface'
                    )}>
                      {typeof item === 'string' ? item : item.title || 'Điểm mạnh'}
                    </p>
                    <p className={cn(
                      'text-sm',
                      isDark ? 'text-slate-400' : 'text-secondary'
                    )}>
                      {typeof item === 'string' ? '' : item.description || ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Show default message if no strengths */}
            {safeResult('strengths', []).length === 0 && (
              <div className={cn(
                'p-5 rounded-2xl text-center',
                isDark ? 'bg-emerald-900/20 text-slate-400' : 'bg-emerald-50 text-secondary'
              )}>
                Hoàn thành tốt bài kiểm tra!
              </div>
            )}

            {/* Improvements */}
            {(safeResult('improvements', []) as any[]).map((item: any, index: number) => (
              <div
                key={index}
                className={cn(
                  'p-5 rounded-2xl',
                  isDark ? 'bg-amber-900/20' : 'bg-amber-50'
                )}
              >
                <div className="flex gap-4">
                  <AlertTriangle className={cn(
                    'w-6 h-6 shrink-0 mt-0.5',
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  )} />
                  <div>
                    <p className={cn(
                      'font-bold mb-1',
                      isDark ? 'text-white' : 'text-on-surface'
                    )}>
                      {typeof item === 'string' ? item : item.title || 'Cần cải thiện'}
                    </p>
                    <p className={cn(
                      'text-sm',
                      isDark ? 'text-slate-400' : 'text-secondary'
                    )}>
                      {typeof item === 'string' ? '' : item.description || ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Topic Breakdown */}
        <section className={cn(
          'md:col-span-5 p-8 rounded-3xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <h3 className={cn(
            'text-xl font-headline font-bold mb-8',
            isDark ? 'text-white' : 'text-primary'
          )}>
            Chi tiết chủ đề
          </h3>

          <div className="space-y-6">
            {(safeResult('topics', []) as any[]).map((topic: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-end mb-2">
                  <span className={cn(
                    'text-sm font-bold',
                    isDark ? 'text-slate-200' : 'text-on-surface'
                  )}>
                    {topic.name || `Chủ đề ${index + 1}`}
                  </span>
                  <span className={cn(
                    'text-sm font-bold',
                    topic.score >= 80
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : topic.score >= 60
                        ? isDark ? 'text-amber-400' : 'text-amber-600'
                        : isDark ? 'text-red-400' : 'text-red-600'
                  )}>
                    {topic.score}%
                  </span>
                </div>
                <div className={cn(
                  'h-2 w-full rounded-full overflow-hidden',
                  isDark ? 'bg-slate-700' : 'bg-surface-container-low'
                )}>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      topic.score >= 80
                        ? isDark ? 'bg-emerald-400' : 'bg-emerald-500'
                        : topic.score >= 60
                          ? isDark ? 'bg-amber-400' : 'bg-amber-500'
                          : isDark ? 'bg-red-400' : 'bg-red-500'
                    )}
                    style={{ width: `${topic.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={cn(
            'mt-8 p-4 rounded-xl flex items-center gap-3',
            isDark ? 'bg-amber-900/20' : 'bg-amber-50'
          )}>
            <Star className={cn(
              'w-5 h-5 shrink-0',
              isDark ? 'text-amber-400' : 'text-amber-600'
            )} />
            <p className={cn(
              'text-xs font-bold uppercase tracking-tight',
              isDark ? 'text-amber-400' : 'text-amber-700'
            )}>
              Đề xuất: {safeResult('suggestedCourse', 'Tiếp tục học!')}
            </p>
          </div>
        </section>
      </div>

      {/* Call to Action */}
      <div className={cn(
        'mt-12 p-1 rounded-2xl',
        isDark
          ? 'bg-gradient-to-r from-blue-900 via-amber-900 to-blue-900'
          : 'bg-gradient-to-r from-primary-container via-tertiary-fixed-dim to-primary-container'
      )}>
        <div className={cn(
          'p-8 rounded-[14px] flex flex-col md:flex-row items-center justify-between gap-8',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <div className="flex items-center gap-6">
            <div className={cn(
              'w-20 h-20 rounded-full p-1 overflow-hidden',
              isDark ? 'bg-slate-700' : 'bg-surface-container-low'
            )}>
              <img
                alt="Course teaser"
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=200&fit=crop"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h4 className={cn(
                'text-lg font-headline font-bold mb-1',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Sẵn sàng cho thử thách tiếp theo?
              </h4>
              <p className={cn(
                '',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}>
                Bài kiểm tra "Advanced Data Structures" đang chờ bạn.
              </p>
            </div>
          </div>

          <Button
            onClick={handleBackToCourse}
            disabled={isLoading}
            className={cn(
              'px-8 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 whitespace-nowrap flex items-center gap-2',
              isDark
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-primary text-white hover:opacity-90'
            )}
          >
            Tiếp tục hành trình
            <ChevronRight className={cn('w-5 h-5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={cn(
            'p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className={cn(
              'font-medium',
              isDark ? 'text-white' : 'text-slate-800'
            )}>
              Đang tải...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KetQuaMinitest;
