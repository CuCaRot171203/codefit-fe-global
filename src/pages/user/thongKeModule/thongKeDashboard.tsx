'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
  BarChart3,
  Trophy,
  Star,
  Flame,
  BookOpen,
  Users,
  FileText,
  Target,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatar?: string;
  username: string;
  totalScore: number;
  problemsSolved?: number;
  streak?: number;
  isCurrentUser?: boolean;
}

interface WeeklyActivity {
  day: string;
  submissions: number;
}

interface CourseScore {
  courseTitle: string;
  score: number;
}

interface UserStats {
  totalScore: number;
  globalRank: number;
  totalUsers: number;
  currentStreak: number;
  completedCourses: number;
  totalCourses: number;
  activeDaysThisWeek: number;
}

const ThongKeDashboard = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [userStats, setUserStats] = useState<UserStats>({
    totalScore: 0,
    globalRank: 0,
    totalUsers: 0,
    currentStreak: 0,
    completedCourses: 0,
    totalCourses: 0,
    activeDaysThisWeek: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [courseScores, setCourseScores] = useState<CourseScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // Fetch user stats from existing endpoints
      const [scoreRes, rankRes, loginRes, coursesRes, weeklyRes] = await Promise.all([
        fetch(API_ENDPOINTS.stats.scoreBreakdown, { headers }).catch(() => null),
        fetch(API_ENDPOINTS.stats.globalRank, { headers }).catch(() => null),
        fetch(API_ENDPOINTS.stats.loginDays, { headers }).catch(() => null),
        fetch(API_ENDPOINTS.stats.enrolledCourses, { headers }).catch(() => null),
        fetch(API_ENDPOINTS.stats.weeklyActivity, { headers }).catch(() => null),
      ]);

      // User score breakdown
      if (scoreRes?.ok) {
        const userData = await scoreRes.json();
        if (userData.success) {
          setUserStats(prev => ({
            ...prev,
            totalScore: userData.data?.totalScore || 0,
          }));

          // Course scores
          if (userData.data?.courses) {
            setCourseScores(
              userData.data.courses.map((c: any) => ({
                courseTitle: c.courseTitle,
                score: c.score,
              }))
            );
          }
        }
      }

      // Global rank
      if (rankRes?.ok) {
        const rankData = await rankRes.json();
        if (rankData.success) {
          setUserStats(prev => ({
            ...prev,
            globalRank: rankData.data?.rank || 0,
            totalUsers: rankData.data?.totalUsers || 0,
          }));
        }
      }

      // Login days
      if (loginRes?.ok) {
        const loginData = await loginRes.json();
        if (loginData.success) {
          setUserStats(prev => ({
            ...prev,
            currentStreak: loginData.data?.currentStreak || 0,
            activeDaysThisWeek: loginData.data?.activeDaysThisWeek || 0,
          }));
        }
      }

      // Enrolled courses
      if (coursesRes?.ok) {
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          const courses = coursesData.data || [];
          setUserStats(prev => ({
            ...prev,
            completedCourses: courses.filter((c: any) => c.progress === 100).length,
            totalCourses: courses.length,
          }));
        }
      }

      // Weekly activity
      if (weeklyRes?.ok) {
        const weeklyData = await weeklyRes.json();
        if (weeklyData.success && weeklyData.data?.days) {
          setWeeklyActivity(weeklyData.data.days);
        }
      }

      // Try to fetch global leaderboard (new endpoint - may not exist yet)
      try {
        const leaderboardRes = await fetch(API_ENDPOINTS.stats.globalLeaderboard, { headers });
        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          if (leaderboardData.success) {
            // Add streak and problemsSolved from user stats if available
            const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
            const updatedLeaderboard = (leaderboardData.data || []).map((entry: any) => ({
              ...entry,
              problemsSolved: entry.problemsSolved || 0,
              streak: entry.streak || 0,
              isCurrentUser: entry.userId === currentUserId
            }));
            setLeaderboard(updatedLeaderboard);
          }
        } else {
          setLeaderboard(generateMockLeaderboard());
        }
      } catch (e) {
        // Leaderboard endpoint not available yet, use mock data
        setLeaderboard(generateMockLeaderboard());
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Generate mock leaderboard on error
      setLeaderboard(generateMockLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock leaderboard data when API is not available
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const mockUsers = [
      { userId: '1', fullName: 'Nguyễn Văn A', username: 'nguyenvana', totalScore: 2500, problemsSolved: 156, streak: 45 },
      { userId: '2', fullName: 'Trần Thị B', username: 'tranthib', totalScore: 2350, problemsSolved: 142, streak: 38 },
      { userId: '3', fullName: 'Lê Hoàng C', username: 'lehoangc', totalScore: 2200, problemsSolved: 128, streak: 30 },
      { userId: '4', fullName: 'Phạm Minh D', username: 'phamminhd', totalScore: 2100, problemsSolved: 118, streak: 25 },
      { userId: '5', fullName: 'Hoàng Thu E', username: 'hoangthue', totalScore: 1950, problemsSolved: 105, streak: 22 },
      { userId: '6', fullName: 'Đặng Phong F', username: 'dangphongf', totalScore: 1800, problemsSolved: 98, streak: 18 },
      { userId: '7', fullName: 'Vũ Lan G', username: 'vulang', totalScore: 1650, problemsSolved: 88, streak: 15 },
      { userId: '8', fullName: 'Bùi Đức H', username: 'buiduch', totalScore: 1500, problemsSolved: 78, streak: 12 },
      { userId: '9', fullName: 'Đào Thanh I', username: 'daothanhi', totalScore: 1350, problemsSolved: 68, streak: 10 },
      { userId: '10', fullName: 'Cao Hùng J', username: 'caohungj', totalScore: 1200, problemsSolved: 58, streak: 8 },
    ];

    return mockUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      avatar: undefined,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto space-y-8 p-6', isDark ? 'text-white' : 'text-slate-900')}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isDark ? 'bg-primary/20' : 'bg-primary/10'
        )}>
          <BarChart3 className={cn('w-6 h-6', isDark ? 'text-primary' : 'text-primary')} />
        </div>
        <div>
          <h1 className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Thống kê
          </h1>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Xem chi tiết thống kê và bảng xếp hạng của bạn
          </p>
        </div>
      </div>

      {/* User Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cn(
          'border-border dark:border-border hover:shadow-lg transition-all duration-300',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Điểm tổng
                </p>
                <p className={cn('text-3xl font-bold mt-1', isDark ? 'text-white' : 'text-slate-900')}>
                  {userStats.totalScore}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                  Điểm tích lũy
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-amber-900/30' : 'bg-amber-100'
              )}>
                <Star className={cn('w-7 h-7', isDark ? 'text-amber-400' : 'text-amber-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          'border-border dark:border-border hover:shadow-lg transition-all duration-300',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Thứ hạng
                </p>
                <p className={cn('text-3xl font-bold mt-1', isDark ? 'text-white' : 'text-slate-900')}>
                  {userStats.globalRank > 0 ? `#${userStats.globalRank}` : '-'}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-blue-400' : 'text-blue-600')}>
                  Trên {userStats.totalUsers > 0 ? userStats.totalUsers : '...'} người
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-purple-900/30' : 'bg-purple-100'
              )}>
                <Trophy className={cn('w-7 h-7', isDark ? 'text-purple-400' : 'text-purple-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          'border-border dark:border-border hover:shadow-lg transition-all duration-300',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chuỗi học
                </p>
                <p className={cn('text-3xl font-bold mt-1', isDark ? 'text-white' : 'text-slate-900')}>
                  {userStats.currentStreak} ngày
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-orange-400' : 'text-orange-600')}>
                  {userStats.activeDaysThisWeek}/7 ngày tuần này
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-orange-900/30' : 'bg-orange-100'
              )}>
                <Flame className={cn('w-7 h-7', isDark ? 'text-orange-400' : 'text-orange-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          'border-border dark:border-border hover:shadow-lg transition-all duration-300',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Khóa học
                </p>
                <p className={cn('text-3xl font-bold mt-1', isDark ? 'text-white' : 'text-slate-900')}>
                  {userStats.completedCourses}/{userStats.totalCourses}
                </p>
                <p className={cn('text-xs mt-1', isDark ? 'text-teal-400' : 'text-teal-600')}>
                  Đã hoàn thành
                </p>
              </div>
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                isDark ? 'bg-teal-900/30' : 'bg-teal-100'
              )}>
                <BookOpen className={cn('w-7 h-7', isDark ? 'text-teal-400' : 'text-teal-600')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leaderboard Section */}
        <div className="lg:col-span-7">
          <Card className={cn('border-border dark:border-border', isDark ? 'bg-slate-800' : 'bg-white')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                    Bảng xếp hạng toàn hệ thống
                  </CardTitle>
                </div>
                <Badge variant="secondary" className={cn(isDark ? 'bg-slate-700 text-slate-300' : '')}>
                  Top 10
                </Badge>
              </div>
              <CardDescription>Xếp hạng dựa trên điểm tích lũy</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry) => (
                    <div
                      key={entry.userId}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl transition-all duration-300',
                        entry.isCurrentUser
                          ? isDark ? 'bg-primary/20 border border-primary/50' : 'bg-primary/5 border border-primary/20'
                          : isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-900'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-700'
                          : entry.rank === 3
                          ? 'bg-orange-400 text-orange-900'
                          : isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                      )}>
                        {entry.rank === 1 ? <Crown className="w-5 h-5" /> :
                         entry.rank === 2 ? <Medal className="w-5 h-5" /> :
                         entry.rank === 3 ? <Medal className="w-5 h-5" /> :
                         `#${entry.rank}`}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.avatar} alt={entry.fullName} />
                        <AvatarFallback className={cn(
                          isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-600'
                        )}>
                          {entry.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'font-semibold truncate flex items-center gap-2',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}>
                          <span className="truncate">
                            {entry.fullName || entry.username}
                          </span>
                          {entry.isCurrentUser && (
                            <Badge variant="outline" className={cn(
                              'text-[10px] flex-shrink-0',
                              isDark ? 'border-primary/50 text-primary' : 'border-primary/50 text-primary'
                            )}>
                              Bạn
                            </Badge>
                          )}
                        </div>
                        <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {entry.problemsSolved} bài đã giải | {entry.streak} ngày streak
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className={cn(
                          'text-lg font-bold',
                          isDark ? 'text-primary' : 'text-primary'
                        )}>
                          {entry.totalScore}
                        </p>
                        <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          điểm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  'flex flex-col items-center justify-center py-12 text-center',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}>
                  <Trophy className="w-12 h-12 mb-3 opacity-50" />
                  <p>Chưa có dữ liệu xếp hạng</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Stats Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className={cn('border-border dark:border-border', isDark ? 'bg-slate-800' : 'bg-white')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className={cn('w-5 h-5', isDark ? 'text-primary' : 'text-primary')} />
                <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                  Thống kê hệ thống
                </CardTitle>
              </div>
              <CardDescription>Tổng quan toàn bộ nền tảng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}>
                  <Users className={cn('w-5 h-5 mb-2', isDark ? 'text-blue-400' : 'text-blue-600')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    {userStats.totalUsers > 0 ? userStats.totalUsers : '...'}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Người dùng
                  </p>
                </div>

                <div className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}>
                  <BookOpen className={cn('w-5 h-5 mb-2', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    {userStats.totalCourses}
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Khóa học
                  </p>
                </div>

                <div className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}>
                  <FileText className={cn('w-5 h-5 mb-2', isDark ? 'text-purple-400' : 'text-purple-600')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    ...
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Bài nộp
                  </p>
                </div>

                <div className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}>
                  <Target className={cn('w-5 h-5 mb-2', isDark ? 'text-orange-400' : 'text-orange-600')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    ...
                  </p>
                  <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Minitest
                  </p>
                </div>
              </div>

              <div className={cn(
                'pt-4 border-t',
                isDark ? 'border-slate-700' : 'border-slate-200'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Điểm trung bình hệ thống
                  </span>
                  <span className={cn('font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    ...
                  </span>
                </div>
                <Progress value={0} className="h-2" />

                <div className="flex items-center justify-between mt-4 mb-2">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Người dùng hoạt động tuần này
                  </span>
                  <span className={cn('font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                    {userStats.activeDaysThisWeek > 0 ? `${userStats.activeDaysThisWeek} ngày` : '...'}
                  </span>
                </div>
                <Progress value={userStats.activeDaysThisWeek * 14} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Hackathons Stats */}
          <Card className={cn('border-border dark:border-border', isDark ? 'bg-slate-800' : 'bg-white')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isDark ? 'bg-amber-900/30' : 'bg-amber-100'
                  )}>
                    <Trophy className={cn('w-6 h-6', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Sự kiện Hackathon
                    </p>
                    <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                      ...
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  isDark ? 'bg-teal-900/30' : 'bg-teal-100'
                )}>
                  <Award className={cn('w-6 h-6', isDark ? 'text-teal-400' : 'text-teal-600')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity Chart */}
        <Card className={cn('border-border dark:border-border', isDark ? 'bg-slate-800' : 'bg-white')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className={cn('w-5 h-5', isDark ? 'text-primary' : 'text-primary')} />
              <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                Hoạt động hàng tuần
              </CardTitle>
            </div>
            <CardDescription>Số bài nộp theo từng ngày</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyActivity.length > 0 ? (
              <div style={{ height: 200, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Bar dataKey="submissions" fill={isDark ? '#06b6d4' : '#0891b2'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm">Chưa có dữ liệu hoạt động</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Scores Chart */}
        <Card className={cn('border-border dark:border-border', isDark ? 'bg-slate-800' : 'bg-white')}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart className={cn('w-5 h-5', isDark ? 'text-primary' : 'text-primary')} />
              <CardTitle className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                Điểm theo khóa học
              </CardTitle>
            </div>
            <CardDescription>Điểm tích lũy từng khóa</CardDescription>
          </CardHeader>
          <CardContent>
            {courseScores.length > 0 ? (
              <div style={{ height: 200, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={courseScores} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis
                      dataKey="courseTitle"
                      tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Bar dataKey="score" fill={isDark ? '#8b5cf6' : '#7c3aed'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm">Chưa có dữ liệu khóa học</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThongKeDashboard;
