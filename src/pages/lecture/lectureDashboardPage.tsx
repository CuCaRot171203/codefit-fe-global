import { useState, useEffect } from 'react';
import { useLecture } from '@/contexts/LectureContext';
import { cn } from '@/lib/utils';
import { BookOpen, Target, Trophy, Users, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalLessons: number;
  totalMinitests: number;
}

const LectureDashboardPage = () => {
  const { isDark } = useLecture();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.lecture.dashboard, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data || {
          totalCourses: 0,
          totalStudents: 0,
          totalLessons: 0,
          totalMinitests: 0,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
      // Set default stats on error
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        totalLessons: 0,
        totalMinitests: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Bài học',
      value: stats.totalLessons,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Minitest',
      value: stats.totalMinitests,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ] : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={cn(
          'text-2xl font-bold mb-2',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Dashboard Giảng viên
        </h1>
        <p className={cn(
          'text-sm',
          isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          Tổng quan về các khóa học và hoạt động giảng dạy của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={cn(
                'transition-all duration-200',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      'text-sm mb-1',
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    )}>
                      {stat.title}
                    </p>
                    <p className={cn(
                      'text-3xl font-bold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    stat.bgColor
                  )}>
                    <Icon className={cn('w-6 h-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Welcome Section */}
      <Card className={cn(
        'mb-8',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center'
            )}>
              <TrendingUp className="w-6 h-6 text-[#0B3C5D]" />
            </div>
            <div>
              <h2 className={cn(
                'text-lg font-semibold mb-1',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Chào mừng bạn quay trở lại!
              </h2>
              <p className={cn(
                'text-sm',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}>
                Bạn đang giảng dạy {stats?.totalCourses || 0} khóa học với {stats?.totalStudents || 0} học viên
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LectureDashboardPage;
