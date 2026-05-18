'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import {
  CheckCircle,
  AlertTriangle,
  Trophy,
  ChevronLeft,
  RefreshCw,
  ChevronRight,
  Loader2,
  FileCode,
} from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  problems: any[];
}

interface SubmissionResult {
  problemId: string;
  problemTitle: string;
  score: number;
  totalTests: number;
  passedTests: number;
  status: 'passed' | 'failed' | 'pending';
}

const KetQuaFinalTest = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { finalTestId } = useParams<{ finalTestId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (finalTestId) {
      fetchData();
    }
  }, [finalTestId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch hackathon details
      const hackathonRes = await fetch(`${API_ENDPOINTS.hackathons.detail(finalTestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const hackathonData = await hackathonRes.json();
      if (hackathonData.success) {
        setHackathon(hackathonData.data);
        
        // Initialize submissions from problems
        const problemResults: SubmissionResult[] = (hackathonData.data.problems || []).map((p: any) => ({
          problemId: p.id,
          problemTitle: p.title,
          score: 0,
          totalTests: p.testcases?.length || 0,
          passedTests: 0,
          status: 'pending' as const,
        }));
        setSubmissions(problemResults);
      }
      
      // Fetch submissions
      const submissionsRes = await fetch(`${API_ENDPOINTS.hackathons.submissions(finalTestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const submissionsData = await submissionsRes.json();
      if (submissionsData.success && submissionsData.data) {
        // Update submissions with actual results
        setSubmissions(prev => prev.map(s => {
          const sub = submissionsData.data.find((sub: any) => sub.problemId === s.problemId);
          if (sub) {
            return {
              ...s,
              score: sub.score || 0,
              passedTests: sub.passedTests || 0,
              status: sub.allPassed ? 'passed' : 'failed',
            };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const totalProblems = submissions.length;
  const passedProblems = submissions.filter(s => s.status === 'passed').length;
  const totalTests = submissions.reduce((sum, s) => sum + s.totalTests, 0);
  const passedTests = submissions.reduce((sum, s) => sum + s.passedTests, 0);
  const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  const progressPercentage = score;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/user/final-test/${finalTestId}/lam-bai`);
    }, 800);
  };

  const handleGoToProject = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Fetch course with projects to get the project ID
      const courseRes = await fetch(`${API_ENDPOINTS.courses.detail(hackathon?.courseId)}`, { headers });
      const courseData = await courseRes.json();

      if (courseData.success && courseData.data.projects?.length > 0) {
        navigate(`/user/project/${courseData.data.projects[0].id}`);
      } else {
        // Fallback: no project found
        navigate('/user/courses');
      }
    } catch {
      navigate('/user/courses');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
      </div>
    );
  }

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
              Kết quả Final Test
            </span>
            <h1 className={cn(
              'text-4xl font-bold mb-2',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              {hackathon?.title || 'Final Test'}
            </h1>
            <p className={cn(
              'text-base max-w-lg',
              isDark ? 'text-slate-400' : 'text-slate-600'
            )}>
              Chúc mừng! Bạn đã hoàn thành bài Final Test. Tiếp theo là phần Project thực hành.
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
              onClick={handleGoToProject}
              disabled={isLoading}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-lg flex items-center gap-2',
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              )}
            >
              Làm Project
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
                  isDark ? 'text-amber-400' : 'text-amber-500'
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
              <span className={cn(
                'text-5xl font-headline font-bold',
                isDark ? 'text-white' : 'text-primary'
              )}>
                {score}%
              </span>
              <span className={cn(
                'text-sm font-medium tracking-widest',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}>
                Điểm
              </span>
            </div>
          </div>

          <h3 className={cn(
            'text-lg font-headline font-semibold mb-1',
            isDark ? 'text-white' : 'text-on-surface'
          )}>
            Kết quả Final Test
          </h3>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-500' : 'text-secondary'
          )}>
            {passedProblems}/{totalProblems} bài đạt yêu cầu
          </p>
        </section>

        {/* Stats */}
        <section className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Passed Problems */}
          <div className={cn(
            'p-8 rounded-3xl relative overflow-hidden',
            isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'
          )}>
            <div className="z-10">
              <p className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-2',
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              )}>
                Bài đạt yêu cầu
              </p>
              <h2 className={cn(
                'text-4xl font-headline font-bold mb-2',
                isDark ? 'text-white' : 'text-emerald-700'
              )}>
                {passedProblems}/{totalProblems}
              </h2>
              <p className={cn(
                'text-sm',
                isDark ? 'text-slate-400' : 'text-emerald-600/80'
              )}>
                Bài tập đã pass tất cả test cases
              </p>
            </div>
            <CheckCircle className={cn(
              'absolute -bottom-4 -right-4 w-32 h-32 opacity-10',
              isDark ? 'text-emerald-400' : 'text-emerald-500'
            )} />
          </div>

          {/* Tests Passed */}
          <div className={cn(
            'p-8 rounded-3xl relative overflow-hidden',
            isDark ? 'bg-blue-900/30' : 'bg-blue-50'
          )}>
            <div className="z-10">
              <p className={cn(
                'text-xs font-semibold uppercase tracking-widest mb-2',
                isDark ? 'text-blue-400' : 'text-blue-600'
              )}>
                Test Cases đạt
              </p>
              <h2 className={cn(
                'text-4xl font-headline font-bold mb-2',
                isDark ? 'text-white' : 'text-blue-700'
              )}>
                {passedTests}/{totalTests}
              </h2>
              <p className={cn(
                'text-sm',
                isDark ? 'text-slate-400' : 'text-blue-600/80'
              )}>
                Tổng số test cases đã pass
              </p>
            </div>
            <FileCode className={cn(
              'absolute -bottom-4 -right-4 w-32 h-32 opacity-10',
              isDark ? 'text-blue-400' : 'text-blue-500'
            )} />
          </div>
        </section>

        {/* Problem Results */}
        <section className={cn(
          'md:col-span-12 p-8 rounded-3xl',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}>
          <h3 className={cn(
            'text-xl font-headline font-bold mb-6',
            isDark ? 'text-white' : 'text-primary'
          )}>
            Chi tiết từng bài
          </h3>

          <div className="space-y-4">
            {submissions.map((submission, index) => (
              <div
                key={submission.problemId}
                className={cn(
                  'p-5 rounded-2xl border flex items-center justify-between',
                  submission.status === 'passed'
                    ? isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                    : submission.status === 'failed'
                      ? isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                      : isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold',
                    submission.status === 'passed'
                      ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      : submission.status === 'failed'
                        ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                        : isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-200 text-slate-500'
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={cn(
                      'font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {submission.problemTitle}
                    </p>
                    <p className={cn(
                      'text-sm',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      {submission.passedTests}/{submission.totalTests} test cases passed
                    </p>
                  </div>
                </div>
                {submission.status === 'passed' ? (
                  <CheckCircle className={cn('w-6 h-6', isDark ? 'text-emerald-400' : 'text-emerald-500')} />
                ) : submission.status === 'failed' ? (
                  <AlertTriangle className={cn('w-6 h-6', isDark ? 'text-red-400' : 'text-red-500')} />
                ) : (
                  <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-400' : 'text-slate-500')} />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className={cn(
        'mt-12 p-1 rounded-2xl',
        isDark
          ? 'bg-gradient-to-r from-amber-900 via-slate-900 to-amber-900'
          : 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100'
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
              <Trophy className={cn('w-full h-full p-4', isDark ? 'text-amber-400' : 'text-amber-500')} />
            </div>
            <div>
              <h4 className={cn(
                'text-lg font-headline font-bold mb-1',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Sẵn sàng cho Project cuối khóa?
              </h4>
              <p className={cn(
                '',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}>
                Hoàn thành Project để nhận chứng chỉ hoàn thành khóa học.
              </p>
            </div>
          </div>

          <Button
            onClick={handleGoToProject}
            disabled={isLoading}
            className={cn(
              'px-8 py-4 rounded-xl font-bold transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 whitespace-nowrap flex items-center gap-2',
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            )}
          >
            Làm Project cuối khóa
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
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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

export default KetQuaFinalTest;
