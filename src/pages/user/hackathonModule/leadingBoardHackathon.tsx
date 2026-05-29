'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { RootState } from '@/store';
import { hackathonService } from '@/services/api';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Trophy,
  ArrowLeft,
  Users,
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  username: string;
  avatar?: string;
  totalScore: number;
  submissions: number;
  isCurrentUser?: boolean;
}

interface LeaderboardData {
  hackathon: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  participantCount: number;
  totalSubmissions: number;
  leaderboard: LeaderboardEntry[];
}

const LeaderboardHackathon = () => {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const currentUserId = token ? (() => {
    try { return JSON.parse(atob(token.split('.')[1])).userId; } catch { return null; }
  })() : null;

  const ITEMS_PER_PAGE = 10;

  const fetchLeaderboard = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    try {
      const res = await hackathonService.getLeaderboard(hackathonId);
      if (res.success && res.data) {
        const data = res.data as LeaderboardData;
        // Mark current user
        if (data?.leaderboard && currentUserId) {
          data.leaderboard = data.leaderboard.map((entry: LeaderboardEntry) => ({
            ...entry,
            isCurrentUser: entry.userId === currentUserId,
          }));
        }
        setLeaderboardData(data);
        const total = Math.ceil((data?.leaderboard?.length || 0) / ITEMS_PER_PAGE);
        setTotalPages(total || 1);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, currentUserId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  };

  const getAvatarColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-amber-500 text-white';
      case 2: return 'bg-slate-400 text-white';
      case 3: return 'bg-orange-400 text-white';
      default: return isDark ? 'bg-slate-700 text-slate-300' : 'bg-primary-container text-on-primary-container';
    }
  };

  const podiumUsers = leaderboardData?.leaderboard?.slice(0, 3) || [];
  const paginatedUsers = leaderboardData?.leaderboard?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) || [];

  const renderPodiumCard = (user: LeaderboardEntry, order: number) => {
    const isFirst = user.rank === 1;

    return (
      <div
        key={user.userId}
        className={cn(
          'w-full',
          order === 2 && 'order-1 lg:order-2',
          order === 1 && 'order-2 lg:order-1',
          order === 3 && 'order-3'
        )}
      >
        <div
          className={cn(
            'rounded-2xl p-6 text-center transform transition-transform hover:scale-[1.02] relative',
            isFirst
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg'
              : cn(
                  isDark ? 'bg-slate-800' : 'bg-surface-container-lowest',
                  'shadow-md'
                )
          )}
        >
          {/* Trophy Icon for First */}
          {isFirst && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Crown className="w-10 h-10 text-yellow-300 drop-shadow-md" />
            </div>
          )}

          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div
              className={cn(
                'rounded-full overflow-hidden mx-auto border-4',
                isFirst
                  ? 'w-32 h-32 border-white/50 shadow-xl'
                  : 'w-24 h-24',
                isFirst ? '' : isDark ? 'border-slate-600' : 'border-slate-200'
              )}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    'w-full h-full flex items-center justify-center font-bold',
                    isFirst ? 'bg-white/20 text-white text-2xl' : getAvatarColor(user.rank),
                    'text-xl'
                  )}
                >
                  {getInitials(user.fullName)}
                </div>
              )}
            </div>
            {/* Rank Badge */}
            <div
              className={cn(
                'absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                user.rank === 1
                  ? 'bg-amber-400 text-amber-900'
                  : user.rank === 2
                  ? 'bg-slate-400 text-white'
                  : 'bg-orange-400 text-white'
              )}
            >
              {user.rank}
            </div>
          </div>

          {/* Name */}
          <h3
            className={cn(
              'font-headline font-bold text-lg',
              isFirst ? 'text-white' : isDark ? 'text-white' : 'text-primary'
            )}
          >
            {user.fullName}
            {user.isCurrentUser && (
              <span className="ml-1 text-xs opacity-70">(Bạn)</span>
            )}
          </h3>
          <p className={cn('text-xs', isFirst ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-500')}>
            @{user.username}
          </p>

          {/* Points */}
          <p
            className={cn(
              'font-black text-3xl mt-2 tracking-tight',
              isFirst ? 'text-white' : isDark ? 'text-amber-400' : 'text-tertiary-container'
            )}
          >
            {user.totalScore.toLocaleString()}
          </p>
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-widest mt-1',
              isFirst ? 'text-white/70' : isDark ? 'text-slate-400' : 'text-slate-400'
            )}
          >
            Điểm tích lũy
          </p>

          {/* Submissions */}
          <div className="mt-4 flex justify-center gap-4">
            <div className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold',
              isFirst ? 'bg-white/20 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-container-high text-slate-600'
            )}>
              {user.submissions} bài nộp
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-cyan-400' : 'text-primary')} />
      </div>
    );
  }

  if (!leaderboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className={cn('w-16 h-16 mb-4 opacity-30', isDark ? 'text-slate-400' : 'text-slate-500')} />
        <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-primary')}>
          Không tìm thấy dữ liệu xếp hạng
        </p>
        <Button onClick={() => navigate(`/user/hackathon/${hackathonId}`)} className="mt-4">
          Quay lại chi tiết
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Back Button & Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/user/hackathon/${hackathonId}`)}
          className={cn(isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1
            className={cn(
              'text-2xl md:text-3xl font-headline font-bold',
              isDark ? 'text-white' : 'text-primary'
            )}
          >
            Bảng xếp hạng
          </h1>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-on-surface-variant')}>
            {leaderboardData.hackathon?.title}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={cn(
        'flex flex-wrap gap-4 p-4 rounded-2xl mb-8',
        isDark ? 'bg-slate-800' : 'bg-surface-container-low'
      )}>
        <div className="flex items-center gap-2">
          <Users className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-primary')} />
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-primary')}>
            {leaderboardData.participantCount} người tham gia
          </span>
        </div>
        <div className={cn('h-6 w-px', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        <div className="flex items-center gap-2">
          <CheckCircle className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-primary')}>
            {leaderboardData.totalSubmissions} bài nộp
          </span>
        </div>
        <div className={cn('h-6 w-px', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
        <div className="flex items-center gap-2">
          <Trophy className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
          <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-primary')}>
            Top 50 xếp hạng
          </span>
        </div>
      </div>

      {/* Podium Section */}
      {podiumUsers.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-end justify-center">
          {podiumUsers.map((user, index) => renderPodiumCard(user, index + 1))}
        </div>
      ) : (
        <div className={cn(
          'rounded-3xl p-8 text-center mb-12',
          isDark ? 'bg-slate-800 text-slate-400' : 'bg-surface-container-low text-slate-500'
        )}>
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có dữ liệu xếp hạng</p>
        </div>
      )}

      {/* Leaderboard Table */}
      <div
        className={cn(
          'rounded-[2rem] overflow-hidden shadow-lg',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={cn(
                'border-b',
                isDark ? 'bg-slate-700 border-slate-600' : 'bg-surface-container-low border-outline-variant/10'
              )}
            >
              <th className={cn(
                'px-4 md:px-8 py-5 font-headline font-bold text-sm uppercase tracking-wider',
                isDark ? 'text-slate-300' : 'text-primary'
              )}>
                Hạng
              </th>
              <th className={cn(
                'px-4 md:px-8 py-5 font-headline font-bold text-sm uppercase tracking-wider',
                isDark ? 'text-slate-300' : 'text-primary'
              )}>
                Người dùng
              </th>
              <th className={cn(
                'px-4 md:px-8 py-5 font-headline font-bold text-sm uppercase tracking-wider',
                isDark ? 'text-slate-300' : 'text-primary'
              )}>
                Điểm số
              </th>
              <th className={cn(
                'px-4 md:px-8 py-5 font-headline font-bold text-sm uppercase tracking-wider',
                isDark ? 'text-slate-300' : 'text-primary'
              )}>
                Bài nộp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {paginatedUsers.map((user) => (
              <tr
                key={user.userId}
                className={cn(
                  'hover:opacity-80 transition-colors',
                  user.isCurrentUser && (isDark ? 'bg-primary/10' : 'bg-primary/5')
                )}
              >
                <td className={cn(
                  'px-4 md:px-8 py-5 font-headline font-bold',
                  isDark ? 'text-white' : 'text-primary'
                )}>
                  #{user.rank}
                  {user.isCurrentUser && (
                    <span className="ml-2 text-xs font-normal opacity-60">(Bạn)</span>
                  )}
                </td>
                <td className="px-4 md:px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                        getAvatarColor(user.rank)
                      )}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        'font-bold',
                        isDark ? 'text-white' : 'text-primary'
                      )}>
                        {user.fullName}
                      </p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td
                  className={cn(
                    'px-4 md:px-8 py-5 font-bold',
                    isDark ? 'text-amber-400' : 'text-tertiary-container'
                  )}
                >
                  {user.totalScore.toLocaleString()}
                </td>
                <td className="px-4 md:px-8 py-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className={cn('w-5 h-5', isDark ? 'text-blue-400' : 'text-primary')}
                    />
                    <span className="font-medium">{user.submissions} bài</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className={cn(
              'p-4 md:p-6 flex items-center justify-between flex-wrap gap-4',
              isDark ? 'bg-slate-700' : 'bg-surface-container-low'
            )}
          >
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, leaderboardData.leaderboard?.length || 0)} trong{' '}
              {leaderboardData.leaderboard?.length || 0} người
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white disabled:opacity-50'
                    : 'bg-white border-outline-variant/10 text-slate-500 hover:text-primary disabled:opacity-50'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-colors',
                      currentPage === page
                        ? 'bg-primary text-white shadow-md'
                        : cn(
                            isDark
                              ? 'bg-slate-800 border border-slate-600 text-slate-400 hover:text-white'
                              : 'bg-white border border-outline-variant/10 text-slate-500 hover:text-primary'
                          )
                    )}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white disabled:opacity-50'
                    : 'bg-white border-outline-variant/10 text-slate-500 hover:text-primary disabled:opacity-50'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {leaderboardData.leaderboard?.length === 0 && (
          <div className={cn(
            'p-12 text-center',
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-surface-container-low text-slate-500'
          )}>
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Chưa có dữ liệu xếp hạng</p>
            <p className="text-sm mt-1">Hãy là người đầu tiên tham gia!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardHackathon;
