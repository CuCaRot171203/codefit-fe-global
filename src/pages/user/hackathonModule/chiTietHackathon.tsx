'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { RootState } from '@/store';
import { hackathonService } from '@/services/api';
import {
  Users,
  Terminal,
  Shield,
  Timer,
  Trophy,
  Calendar,
  Bolt,
  Gavel,
  HelpCircle,
  Plus,
  Clock,
  CheckCircle,
  BarChart3,
  Medal,
  Crown,
  AlertCircle,
} from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  maxParticipants: number;
  durationMinutes: number;
  problems?: any[];
  _count?: {
    participants: number;
    submissions: number;
  };
}

interface Participant {
  id: string;
  userId: string;
  joinedAt: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
}

const getStatusFromDates = (startTime: string, endTime: string): 'active' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

const getDifficultyStyles = (difficulty: string, isDark: boolean) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-green-100 text-green-700';
    case 'medium':
      return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
    case 'hard':
      return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
    default:
      return isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'Dễ';
    case 'medium': return 'Trung bình';
    case 'hard': return 'Khó';
    default: return difficulty || 'Không xác định';
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChiTietHackathon = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [problems, setProblems] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    setError(null);
    try {
      const [detailRes, participantsRes] = await Promise.all([
        hackathonService.getById(hackathonId),
        hackathonService.getParticipants(hackathonId),
      ]);

      if (!detailRes.success) {
        setError(detailRes.message || 'Không thể tải thông tin hackathon');
        setLoading(false);
        return;
      }

      const data = detailRes.data;
      setHackathon(data);

      if (data.problems && Array.isArray(data.problems)) {
        setProblems(data.problems);
      }

      const status = getStatusFromDates(data.startTime, data.endTime);

      if (token && participantsRes.success) {
        const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
        const isUserRegistered = (participantsRes.data || []).some(
          (p: any) => p.userId === currentUserId
        );
        setIsRegistered(isUserRegistered);
      }

      setParticipants(participantsRes.data || []);

      if (status === 'upcoming') {
        updateCountdown(data.startTime);
      } else if (status === 'active') {
        updateCountdown(data.endTime);
      }
    } catch (e: any) {
      setError(e?.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [hackathonId, token]);

  const updateCountdown = (targetTime: string) => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        fetchData(); // Refresh to update status
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return interval;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!hackathon) return;
    const status = getStatusFromDates(hackathon.startTime, hackathon.endTime);
    const targetTime = status === 'upcoming' ? hackathon.startTime : hackathon.endTime;
    const interval = updateCountdown(targetTime);
    return () => {
      if (interval) clearInterval(interval as unknown as number);
    };
  }, [hackathon]);

  const handleJoin = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để đăng ký!');
      return;
    }
    if (!hackathonId || isRegistered) return;

    setJoining(true);
    try {
      const res = await hackathonService.join(hackathonId);
      if (res.success) {
        setIsRegistered(true);
        await fetchData();
      } else {
        alert(res.message || 'Đăng ký thất bại!');
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setJoining(false);
    }
  };

  const handleEnter = () => {
    if (hackathonId) {
      navigate(`/user/hackathon/${hackathonId}/leaderboard`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-cyan-400' : 'text-primary')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className={cn('w-16 h-16 mb-4 opacity-50', isDark ? 'text-red-400' : 'text-red-500')} />
        <p className={cn('text-lg font-semibold mb-2', isDark ? 'text-white' : 'text-primary')}>
          Đã xảy ra lỗi
        </p>
        <p className={cn('text-sm mb-4 max-w-md', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {error}
        </p>
        <div className="flex gap-3">
          <Button onClick={fetchData} variant="outline">
            Thử lại
          </Button>
          <Button onClick={() => navigate('/user/hackathon')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className={cn('w-16 h-16 mb-4 opacity-30', isDark ? 'text-slate-400' : 'text-slate-500')} />
        <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-primary')}>
          Không tìm thấy hackathon
        </p>
        <Button onClick={() => navigate('/user/hackathon')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const status = getStatusFromDates(hackathon.startTime, hackathon.endTime);
  const participantCount = participants.length || hackathon._count?.participants || 0;
  const isUpcoming = status === 'upcoming';
  const isActive = status === 'active';
  const isEnded = status === 'ended';

  return (
    <div>
      {/* Hero Header */}
      <header className={cn(
        'relative overflow-hidden rounded-xl p-6 mb-6',
        isActive
          ? isDark ? 'bg-blue-900/50 text-white' : 'bg-primary text-white'
          : isUpcoming
            ? isDark ? 'bg-yellow-900/50 text-white' : 'bg-yellow-500 text-white'
            : isDark ? 'bg-slate-800 text-white' : 'bg-slate-500 text-white'
      )}>
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <div className={cn(
            'absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[80px]',
            isActive
              ? isDark ? 'bg-amber-500' : 'bg-tertiary-fixed-dim'
              : isUpcoming ? 'bg-yellow-400' : 'bg-slate-500'
          )} />
          <div className={cn(
            'absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-[80px]',
            isDark ? 'bg-blue-600' : 'bg-primary-container'
          )} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div className="space-y-3 max-w-2xl">
            {/* Status Badge */}
            <div className={cn(
              'inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs',
              isActive
                ? isDark ? 'bg-amber-900/30 border-amber-500/30' : 'bg-tertiary-container/30 border-tertiary-fixed-dim/30'
                : isUpcoming
                  ? isDark ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-yellow-200/30 border-yellow-400/30'
                  : isDark ? 'bg-slate-700/30 border-slate-500/30' : 'bg-slate-300/30 border-slate-400/30'
            )}>
              {isActive && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', isDark ? 'bg-amber-400' : 'bg-amber-200')} />}
              {isUpcoming && <Clock className={cn('w-3 h-3', isDark ? 'text-yellow-400' : 'text-yellow-200')} />}
              {isEnded && <Trophy className={cn('w-3 h-3', isDark ? 'text-slate-400' : 'text-slate-300')} />}
              <span className={cn(
                'font-bold uppercase tracking-wider',
                isActive
                  ? isDark ? 'text-amber-400' : 'text-tertiary-fixed-dim'
                  : isUpcoming
                    ? isDark ? 'text-yellow-400' : 'text-yellow-200'
                    : isDark ? 'text-slate-400' : 'text-slate-300'
              )}>
                {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-headline font-bold leading-tight">
              {hackathon.title}
            </h1>
            <p className={cn(
              'text-sm max-w-lg line-clamp-2',
              isDark ? 'text-blue-200' : 'text-primary-fixed/80'
            )}>
              {hackathon.description?.replace(/<[^>]*>/g, '').substring(0, 150)}
            </p>
          </div>

          {/* Countdown */}
          {!isEnded && (
            <div className={cn(
              'grid grid-cols-4 gap-3 p-4 rounded-xl min-w-[240px]',
              isDark
                ? 'bg-slate-800/80 text-primary'
                : 'bg-white/80 text-primary'
            )}>
              {[
                { value: countdown.days, label: 'Ngày' },
                { value: countdown.hours, label: 'Giờ' },
                { value: countdown.minutes, label: 'Phút' },
                { value: countdown.seconds, label: 'Giây', highlight: true },
              ].map(({ value, label, highlight }) => (
                <div key={label} className="text-center">
                  <span className={cn(
                    'block text-2xl font-headline font-bold',
                    highlight && (isActive ? 'text-amber-400' : isDark ? 'text-yellow-400' : 'text-yellow-600')
                  )}>
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className={cn(
                    'text-[9px] uppercase font-bold',
                    isDark ? 'text-slate-400' : 'text-on-secondary-container'
                  )}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Content: Rules & Problems */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rules Section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn(
                'text-lg font-headline font-semibold',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Thể lệ cuộc thi
              </h2>
              <div className={cn(
                'h-px flex-grow mx-4',
                isDark ? 'bg-slate-700' : 'bg-surface-container-highest'
              )} />
            </div>
            <div className={cn(
              'p-5 rounded-xl space-y-4',
              isDark ? 'bg-slate-800' : 'bg-surface-container-low'
            )}>
              {/* Rule 1 */}
              <div className="flex gap-3">
                <div className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  isDark ? 'bg-slate-700' : 'bg-surface-container-lowest shadow-md'
                )}>
                  <Users className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-primary')} />
                </div>
                <div>
                  <h4 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-primary')}>
                    Số lượng tham gia
                  </h4>
                  <p className={cn(
                    'text-xs mt-0.5',
                    isDark ? 'text-slate-400' : 'text-on-surface-variant'
                  )}>
                    Tối đa {hackathon.maxParticipants || 100} thành viên
                  </p>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="flex gap-3">
                <div className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  isDark ? 'bg-slate-700' : 'bg-surface-container-lowest shadow-md'
                )}>
                  <Timer className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-primary')} />
                </div>
                <div>
                  <h4 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-primary')}>
                    Thời gian thi
                  </h4>
                  <p className={cn(
                    'text-xs mt-0.5',
                    isDark ? 'text-slate-400' : 'text-on-surface-variant'
                  )}>
                    {hackathon.durationMinutes || 120} phút
                  </p>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="flex gap-3">
                <div className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  isDark ? 'bg-slate-700' : 'bg-surface-container-lowest shadow-md'
                )}>
                  <Shield className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-primary')} />
                </div>
                <div>
                  <h4 className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-primary')}>
                    Tính chính trực
                  </h4>
                  <p className={cn(
                    'text-xs mt-0.5',
                    isDark ? 'text-slate-400' : 'text-on-surface-variant'
                  )}>
                    Làm việc độc lập, không gian lận
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Problem List Section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn(
                'text-lg font-headline font-semibold',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Danh sách thử thách
              </h2>
              <div className={cn(
                'h-px flex-grow mx-4',
                isDark ? 'bg-slate-700' : 'bg-surface-container-highest'
              )} />
            </div>
            {problems.length > 0 ? (
              <div className="space-y-3">
                {problems.map((problem, index) => (
                  <div
                    key={problem.id || index}
                    className={cn(
                      'group p-4 rounded-xl flex items-center justify-between transition-all duration-300',
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-surface-container-lowest shadow-sm hover:bg-primary hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-sm',
                        isDark
                          ? 'bg-slate-700 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                          : 'bg-surface-container-low text-primary group-hover:bg-primary-container group-hover:text-white'
                      )}>
                        <span className="font-headline font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h3 className={cn(
                          'text-sm font-semibold',
                          isDark ? 'text-white' : ''
                        )}>
                          {problem.title || problem.name || 'Problem ' + (index + 1)}
                        </h3>
                        {problem.difficulty && (
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                            getDifficultyStyles(problem.difficulty, isDark)
                          )}>
                            {getDifficultyLabel(problem.difficulty)}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && isRegistered && (
                      <Button
                        onClick={() => navigate(`/user/hackathon/${hackathonId}/problem/${problem.id}`)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold',
                          isDark
                            ? 'bg-slate-700 text-white group-hover:bg-amber-500 group-hover:text-slate-900'
                            : 'bg-primary text-white group-hover:bg-tertiary-fixed-dim group-hover:text-on-tertiary-fixed'
                        )}
                      >
                        Làm bài
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                'p-6 rounded-xl text-center',
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-surface-container-low text-slate-500'
              )}>
                <p className="text-sm">Chưa có thử thách nào được cập nhật.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar: Stats & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className={cn(
            'p-5 rounded-xl space-y-4 sticky top-20',
            isDark ? 'bg-slate-800' : 'bg-surface-container-low'
          )}>
            {/* General Info */}
            <div>
              <h2 className={cn(
                'text-base font-headline font-bold mb-4',
                isDark ? 'text-white' : 'text-primary'
              )}>
                Thông tin chung
              </h2>
              <div className="space-y-3">
                {/* Participants */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-primary-fixed text-on-primary-fixed'
                  )}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wide',
                      isDark ? 'text-slate-400' : 'text-on-surface-variant'
                    )}>
                      Thành viên
                    </p>
                    <p className={cn(
                      'text-lg font-headline font-bold',
                      isDark ? 'text-white' : 'text-primary'
                    )}>
                      {participantCount} / {hackathon.maxParticipants || '∞'}
                    </p>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-green-100 text-green-600'
                  )}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wide',
                      isDark ? 'text-slate-400' : 'text-on-surface-variant'
                    )}>
                      Bắt đầu
                    </p>
                    <p className={cn(
                      'text-sm font-headline font-semibold',
                      isDark ? 'text-white' : 'text-primary'
                    )}>
                      {formatDate(hackathon.startTime)}
                    </p>
                  </div>
                </div>

                {/* Submissions */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center',
                    isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
                  )}>
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn(
                      'text-[10px] font-bold uppercase tracking-wide',
                      isDark ? 'text-slate-400' : 'text-on-surface-variant'
                    )}>
                      Bài đã nộp
                    </p>
                    <p className={cn(
                      'text-lg font-headline font-bold',
                      isDark ? 'text-white' : 'text-primary'
                    )}>
                      {hackathon._count?.submissions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={cn(
              'p-4 rounded-xl',
              isDark ? 'bg-slate-700' : 'bg-surface-container-lowest'
            )}>
              {!isEnded && (
                <>
                  {isRegistered ? (
                    <>
                      <div className={cn(
                        'flex items-center gap-2 mb-3 text-xs font-semibold',
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      )}>
                        <CheckCircle className="w-4 h-4" />
                        Đã đăng ký tham gia
                      </div>
                      {isActive && (
                        <>
                          {problems.length > 0 ? (
                            <Button
                              onClick={() => navigate(`/user/hackathon/${hackathonId}/problem/${problems[0].id}`)}
                              className={cn(
                                'w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2',
                                isDark
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                                  : 'bg-tertiary-container text-tertiary-fixed-dim hover:scale-105'
                              )}
                            >
                              <Medal className="w-4 h-4" />
                              Vào thi
                            </Button>
                          ) : (
                            <Button
                              onClick={handleEnter}
                              className={cn(
                                'w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2',
                                isDark
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                                  : 'bg-tertiary-container text-tertiary-fixed-dim hover:scale-105'
                              )}
                            >
                              <Medal className="w-4 h-4" />
                              Xem Bảng Xếp Hạng
                            </Button>
                          )}
                        </>
                      )}
                      {!isActive && (
                        <div className={cn(
                          'text-center py-2 rounded-lg text-xs font-medium',
                          isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-500'
                        )}>
                          {isUpcoming ? 'Chờ đến ngày thi!' : 'Cuộc thi đã kết thúc'}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className={cn(
                        'text-xs mb-3',
                        isDark ? 'text-slate-300' : ''
                      )}>
                        {isUpcoming
                          ? 'Đăng ký ngay để tham gia khi cuộc thi bắt đầu!'
                          : 'Bạn đã sẵn sàng để thử thách bản thân?'}
                      </p>
                      <Button
                        onClick={handleJoin}
                        disabled={joining || isRegistered || participantCount >= (hackathon.maxParticipants || 100)}
                        className={cn(
                          'w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2',
                          isDark
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:bg-slate-600 disabled:text-slate-400'
                            : 'bg-tertiary-container text-tertiary-fixed-dim hover:scale-105'
                        )}
                      >
                        {joining ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Bolt className="w-4 h-4" />
                            Đăng ký tham gia
                          </>
                        )}
                      </Button>
                      {!token && (
                        <p className={cn('text-[10px] text-center mt-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Vui lòng đăng nhập để đăng ký
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
              {isEnded && (
                <div className={cn('text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  <Trophy className={cn('w-8 h-8 mx-auto mb-1.5 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
                  <p className="text-xs font-semibold">Cuộc thi đã kết thúc</p>
                  <Button
                    onClick={handleEnter}
                    className={cn('mt-3 w-full text-xs', isDark ? 'bg-slate-600' : 'bg-slate-200')}
                  >
                    <BarChart3 className="w-3 h-3 mr-1.5" />
                    Xem kết quả
                  </Button>
                </div>
              )}
            </div>

            {/* Leaderboard Link - Only show when ended */}
            {isEnded && (
              <Button
                onClick={() => navigate(`/user/hackathon/${hackathonId}/leaderboard`)}
                className={cn(
                  'w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2',
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-primary-container text-on-primary-container hover:opacity-90'
                )}
              >
                <Trophy className="w-4 h-4" />
                Bảng xếp hạng
              </Button>
            )}

            {/* Footer Links */}
            <div className={cn(
              'pt-3 border-t space-y-1',
              isDark ? 'border-slate-700' : 'border-outline-variant/20'
            )}>
              <button className={cn(
                'flex items-center gap-2 py-1.5 px-3 w-full text-xs rounded-lg transition-colors',
                isDark
                  ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              )}>
                <Gavel className="w-3.5 h-3.5" />
                Thể lệ cuộc thi
              </button>
              <button className={cn(
                'flex items-center gap-2 py-1.5 px-3 w-full text-xs rounded-lg transition-colors',
                isDark
                  ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              )}>
                <HelpCircle className="w-3.5 h-3.5" />
                Hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietHackathon;
