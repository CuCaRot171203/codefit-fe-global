'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
  Mail,
  GraduationCap,
  Award,
  Edit,
  Star,
  Flame,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnboardingModal from '@/components/user/OnboardingModal';
import { API_ENDPOINTS } from '@/config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

interface UserData {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  isOnboarded?: boolean;
  school?: string;
  learningLevel?: string;
}

interface ProfileStats {
  totalLessons: number;
  totalChallenges: number;
  streak: number;
  totalScore: number;
}

interface Certificate {
  id: string;
  title: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl?: string;
}

interface Enrollment {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface ActivityDay {
  date: string;
  dateLabel: string;
  label: string;
  value: number;
}

const ProfilePageUser = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalLessons: 0,
    totalChallenges: 0,
    streak: 0,
    totalScore: 0,
  });
  const [activity30Days, setActivity30Days] = useState<ActivityDay[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    fetchUserData();
    fetchProfileStats();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token.length > 20) {
        try {
          const response = await fetch(API_ENDPOINTS.profile.get, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              const serverUser = data.data;
              localStorage.setItem('user', JSON.stringify({
                ...serverUser,
                isOnboarded: serverUser.isOnboarded || !!(
                  serverUser.fullName && serverUser.school && serverUser.learningLevel
                ),
              }));
              setUserData(serverUser);
              if (
                !serverUser.isOnboarded &&
                !serverUser.fullName &&
                !serverUser.school &&
                !serverUser.learningLevel
              ) {
                setShowOnboarding(true);
              }
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Failed to fetch from server:', e);
        }
      }
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const localUser = JSON.parse(userStr);
        setUserData(localUser);
        if (
          !localUser.isOnboarded ||
          !localUser.fullName ||
          !localUser.school ||
          !localUser.learningLevel
        ) {
          setShowOnboarding(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileStats = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token.length <= 20) return;

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [scoreRes, loginRes, actRes, enrollRes, certRes] = await Promise.all([
        fetch(API_ENDPOINTS.stats.scoreBreakdown, { headers }),
        fetch(API_ENDPOINTS.stats.loginDays, { headers }),
        fetch(API_ENDPOINTS.stats.activity30Days, { headers }),
        fetch(API_ENDPOINTS.stats.enrolledCourses, { headers }),
        fetch(API_ENDPOINTS.certificates.my, { headers }),
      ]);

      // Score breakdown
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        const totalScore = scoreData?.data?.totalScore || 0;

        // Count total lessons from score breakdown
        let totalLessons = 0;
        let totalChallenges = 0;
        const courses = scoreData?.data?.courses || [];
        for (const course of courses) {
          for (const phase of course.phases || []) {
            for (const lesson of phase.lessons || []) {
              if (lesson.status === 'PASSED' || lesson.passedTests > 0) {
                totalLessons++;
              }
            }
          }
        }

        setProfileStats(prev => ({ ...prev, totalScore, totalLessons, totalChallenges }));
      }

      // Login days / streak
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setProfileStats(prev => ({
          ...prev,
          streak: loginData?.data?.currentStreak || 0,
        }));
      }

      // 30-day activity
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivity30Days(actData?.data || []);
      }

      // Enrolled courses
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setEnrollments(enrollData?.data || []);
      }

      // Certificates
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData?.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch profile stats:', e);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchUserData();
  };

  const displayName = userData?.fullName || userData?.username || 'Người dùng';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const school = userData?.school;
  const learningLevel = userData?.learningLevel;
  const email = userData?.email;

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Mới bắt đầu';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
  };

  // Build achievements from certificates + fallback badges
  const achievementItems = [
    ...certificates.slice(0, 3).map((cert) => ({
      name: cert.title || cert.courseTitle || 'Chứng chỉ',
      icon: Award,
      unlocked: true,
      color: 'bg-tertiary-fixed',
    })),
    ...(certificates.length < 3
      ? [
          { name: 'Day Streak', icon: Flame, unlocked: profileStats.streak > 0, color: 'bg-primary-fixed' },
          { name: 'Active Learner', icon: Zap, unlocked: profileStats.totalLessons > 0, color: 'bg-surface-container-highest' },
        ].slice(0, 3 - certificates.length)
      : []),
  ];

  // Build learning path from enrollments (max 2)
  const learningPath = enrollments.slice(0, 2).map(e => ({
    week: 'TUẦN NÀY',
    title: e.courseTitle,
    completed: e.progress >= 100,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <section
          className={cn(
            'rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center md:items-end justify-between gap-8',
            isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
          )}
        >
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-32 h-32 md:w-40 md:h-40">
                <AvatarImage src={userData?.avatar} alt={displayName} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-2 -right-2 p-2 rounded-xl border-4',
                  isDark ? 'bg-amber-500 border-slate-800' : 'bg-tertiary-fixed-dim border-white'
                )}
              >
                <Star className={cn('w-5 h-5', isDark ? 'text-slate-900' : 'text-on-tertiary-fixed')} />
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className={cn('text-4xl font-headline font-bold mb-2', isDark ? 'text-white' : 'text-primary')}>
                {displayName}
              </h1>
              <p className={cn('text-lg mb-4 italic', isDark ? 'text-slate-400' : 'text-secondary')}>
                {learningLevel ? getLevelLabel(learningLevel) : 'Học viên CodeFit'}
              </p>
              {school && (
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-secondary')}>
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  {school}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => navigate('/user/profile/edit')}
            className={cn(
              'gap-2 self-center md:self-end',
              isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary/90'
            )}
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </section>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact Info */}
            <div className={cn('rounded-2xl p-6 space-y-6', isDark ? 'bg-slate-800' : 'bg-surface-container-low')}>
              <h2
                className={cn(
                  'text-xl font-headline font-semibold border-b pb-3',
                  isDark ? 'text-white border-slate-700' : 'text-primary border-outline-variant/20'
                )}
              >
                Thông tin liên hệ
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700 text-blue-400' : 'bg-surface-container-lowest text-primary'
                    )}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Email</p>
                    <p className="text-sm font-semibold">{email || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700 text-blue-400' : 'bg-surface-container-lowest text-primary'
                    )}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Trường học</p>
                    <p className="text-sm font-semibold">{school || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDark ? 'bg-slate-700 text-blue-400' : 'bg-surface-container-lowest text-primary'
                    )}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Trình độ</p>
                    <p className="text-sm font-semibold">{learningLevel ? getLevelLabel(learningLevel) : 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className={cn('rounded-2xl p-6 shadow-sm', isDark ? 'bg-slate-800' : 'bg-surface-container-lowest')}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={cn('text-xl font-headline font-semibold', isDark ? 'text-white' : 'text-primary')}>
                  Thành tựu
                </h2>
                <button className="text-primary text-sm font-bold underline">Xem tất cả</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {achievementItems.length > 0 ? (
                  achievementItems.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="group flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12',
                            achievement.color,
                            !achievement.unlocked && 'opacity-50 grayscale'
                          )}
                        >
                          <Icon
                            className={cn(
                              'text-3xl',
                              isDark
                                ? 'text-blue-300'
                                : achievement.unlocked
                                ? 'text-on-tertiary-fixed'
                                : 'text-slate-400'
                            )}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight">
                          {achievement.name}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="col-span-3 text-sm text-slate-500 text-center py-4">
                    Chưa có thành tựu nào
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={cn(
                  'p-5 rounded-2xl shadow-sm border-l-4',
                  isDark ? 'bg-slate-800 border-l-blue-500' : 'bg-surface-container-lowest border-l-primary'
                )}
              >
                <p className="text-slate-500 text-xs font-bold mb-1">TỔNG BÀI HỌC</p>
                <p className={cn('text-2xl font-headline font-bold', isDark ? 'text-white' : 'text-primary')}>
                  {profileStats.totalLessons}
                </p>
              </div>

              <div
                className={cn(
                  'p-5 rounded-2xl shadow-sm border-l-4',
                  isDark ? 'bg-slate-800 border-l-blue-500' : 'bg-surface-container-lowest border-l-primary'
                )}
              >
                <p className="text-slate-500 text-xs font-bold mb-1">THÁCH THỨC</p>
                <p className={cn('text-2xl font-headline font-bold', isDark ? 'text-white' : 'text-primary')}>
                  {profileStats.totalChallenges}
                </p>
              </div>

              <div
                className={cn(
                  'p-5 rounded-2xl shadow-sm border-l-4',
                  isDark ? 'bg-slate-800 border-l-amber-500' : 'bg-surface-container-lowest border-l-tertiary-fixed-dim'
                )}
              >
                <p className="text-slate-500 text-xs font-bold mb-1">CHUỖI NGÀY</p>
                <div className="flex items-center gap-1">
                  <p className={cn('text-2xl font-headline font-bold', isDark ? 'text-white' : 'text-primary')}>
                    {profileStats.streak}
                  </p>
                  <Flame className="w-5 h-5 text-tertiary-container" />
                </div>
              </div>

              <div
                className={cn(
                  'p-5 rounded-2xl shadow-sm border-l-4',
                  isDark ? 'bg-slate-800 border-l-amber-500' : 'bg-surface-container-lowest border-l-tertiary-fixed-dim'
                )}
              >
                <p className="text-slate-500 text-xs font-bold mb-1">ĐIỂM TÍCH LŨY</p>
                <p className={cn('text-2xl font-headline font-bold', isDark ? 'text-white' : 'text-primary')}>
                  {profileStats.totalScore}
                </p>
              </div>
            </div>

            {/* Activity Chart */}
            <div className={cn('rounded-2xl p-8 shadow-sm', isDark ? 'bg-slate-800' : 'bg-surface-container-lowest')}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={cn('text-xl font-headline font-semibold', isDark ? 'text-white' : 'text-primary')}>
                    Hoạt động 30 ngày qua
                  </h2>
                  <p className="text-sm text-slate-500">
                    Thống kê thời lượng code và bài tập hoàn thành
                  </p>
                </div>
              </div>

              {activity30Days.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={192}>
                    <BarChart data={activity30Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload && payload.length ? (
                            <div
                              className={cn(
                                'text-xs px-3 py-2 rounded-lg shadow-xl border',
                                isDark
                                  ? 'bg-slate-900 text-white border-slate-700'
                                  : 'bg-white text-slate-900 border-slate-200'
                              )}
                            >
                              <p className="font-bold">{payload[0].payload.dateLabel}</p>
                              <p>
                                {payload[0].value === 0
                                  ? 'Không có hoạt động'
                                  : `${payload[0].value} hoạt động`}
                              </p>
                            </div>
                          ) : null
                        }
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {activity30Days.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              entry.value >= 5
                                ? isDark ? '#f59e0b' : '#a855f7'
                                : entry.value > 0
                                ? isDark ? '#3b82f6' : '#6366f1'
                                : isDark ? '#334155' : '#e2e8f0'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{activity30Days[0]?.dateLabel}</span>
                    <span>{activity30Days[14]?.dateLabel}</span>
                    <span>{activity30Days[29]?.dateLabel}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <BookOpen className="w-8 h-8 mr-2" />
                  <p className="text-sm">Chưa có dữ liệu hoạt động</p>
                </div>
              )}
            </div>

            {/* Learning Path Card */}
            <div
              className={cn('p-8 rounded-2xl relative overflow-hidden', isDark ? 'bg-slate-800' : 'bg-surface-container-low')}
            >
              <div className="relative z-10">
                <h3 className={cn('text-xl font-headline font-bold mb-4', isDark ? 'text-white' : 'text-primary')}>
                  Lộ trình học tập
                </h3>
                <div className="space-y-4">
                  {learningPath.length > 0 ? (
                    <>
                      {learningPath.map((plan, index) => (
                        <div key={index} className="flex gap-4">
                          <div
                            className={cn(
                              'w-1 h-12 rounded-full',
                              plan.completed
                                ? isDark ? 'bg-blue-500' : 'bg-primary'
                                : isDark ? 'bg-slate-600' : 'bg-slate-300',
                              !plan.completed && 'opacity-50'
                            )}
                          />
                          <div>
                            <p className={cn('text-xs font-bold', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {plan.week}
                            </p>
                            <p
                              className={cn(
                                'text-sm font-semibold',
                                isDark ? 'text-white' : '',
                                !plan.completed && (isDark ? 'text-slate-500' : 'text-slate-400')
                              )}
                            >
                              {plan.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 py-4">
                      <Target className={cn('w-5 h-5', isDark ? 'text-slate-500' : 'text-slate-400')} />
                      <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Chưa đăng ký khóa học nào
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <TrendingUp
                className={cn(
                  'absolute -bottom-8 -right-8 text-9xl opacity-10',
                  isDark ? 'text-slate-600' : 'text-slate-200'
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePageUser;
