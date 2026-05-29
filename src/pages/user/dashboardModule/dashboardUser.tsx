import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TrendingUp, Flame, Trophy, Code2, Zap, Calendar, Star, Brain, Wrench, CheckCircle, Clock } from 'lucide-react';
import OnboardingModal from '@/components/user/OnboardingModal';
import { API_ENDPOINTS } from '@/config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
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

interface ScoreBreakdown {
  totalScore: number;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    score: number;
    phases: Array<{
      phaseId: string;
      phaseTitle: string;
      lessons: Array<{
        lessonId: string;
        lessonTitle: string;
        score: number;
        passedTests: number;
        totalTests: number;
      }>;
    }>;
  }>;
}

interface LoginDays {
  currentStreak: number;
  activeDaysThisWeek: number;
  totalActiveDays: number;
}

interface WeeklyActivity {
  days: Array<{
    day: string;
    label: string;
    submissions: number;
    isToday: boolean;
  }>;
  totalThisWeek: number;
}

interface GlobalRank {
  rank: number | null;
  score: number;
  totalUsers: number;
}

interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseImage?: string;
  level: string;
  duration?: string | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
}

interface Evaluation {
  hasActivity: boolean;
  algorithmSpeed: { score: number; label: string };
  logicThinking: { score: number; label: string };
  bugFixing: { score: number; label: string };
  learningFrequency: { score: number; label: string; level: string };
  taskCompletion: { score: number; label: string };
  finalScore: number;
}

const DashboardUser = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Dashboard data states
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [loginDays, setLoginDays] = useState<LoginDays | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity | null>(null);
  const [globalRank, setGlobalRank] = useState<GlobalRank | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAllDashboardData();
    }
  }, [user?.id]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');

    if (token && token !== 'undefined' && token.length > 20) {
      try {
        const response = await fetch(API_ENDPOINTS.profile.get, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            const serverUser = data.data;
            localStorage.setItem('user', JSON.stringify(serverUser));
            setUser(serverUser);

            if (!hasCheckedOnboarding) {
              setHasCheckedOnboarding(true);
              const isOnboarded = serverUser.isOnboarded ||
                !!(serverUser.fullName && serverUser.school && serverUser.learningLevel);
              if (!isOnboarded) {
                setShowOnboarding(true);
              }
            }
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch from server:', e);
      }
    }

    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);

        if (!hasCheckedOnboarding) {
          setHasCheckedOnboarding(true);
          if (!userData.isOnboarded) {
            setShowOnboarding(true);
          }
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  };

  const fetchAllDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const [scoreRes, loginRes, rankRes, activityRes, coursesRes, evalRes] = await Promise.all([
        fetch(API_ENDPOINTS.stats.scoreBreakdown, { headers }),
        fetch(API_ENDPOINTS.stats.loginDays, { headers }),
        fetch(API_ENDPOINTS.stats.globalRank, { headers }),
        fetch(API_ENDPOINTS.stats.weeklyActivity, { headers }),
        fetch(API_ENDPOINTS.stats.enrolledCourses, { headers }),
        fetch(API_ENDPOINTS.stats.evaluation, { headers }),
      ]);

      if (scoreRes.ok) {
        const data = await scoreRes.json();
        setScoreBreakdown(data.data);
      }
      if (loginRes.ok) {
        const data = await loginRes.json();
        setLoginDays(data.data);
      }
      if (rankRes.ok) {
        const data = await rankRes.json();
        setGlobalRank(data.data);
      }
      if (activityRes.ok) {
        const data = await activityRes.json();
        setWeeklyActivity(data.data);
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setEnrolledCourses(data.data || []);
      }
      if (evalRes.ok) {
        const data = await evalRes.json();
        setEvaluation(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchUserData();
  };

  const displayName = user?.fullName || user?.username || 'Người dùng';
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }

  // Score chart data
  const scoreChartData = scoreBreakdown?.courses.map(c => ({
    name: c.courseTitle.length > 15 ? c.courseTitle.substring(0, 15) + '...' : c.courseTitle,
    fullName: c.courseTitle,
    score: c.score,
  })) || [];

  // Evaluation helper
  const getEvalLabel = (score: number) => {
    if (score >= 70) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  // Custom tooltip for score chart
  const ScoreTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const course = scoreBreakdown?.courses.find(c => c.courseTitle === data.fullName);
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-sm text-slate-800 dark:text-white">{data.fullName}</p>
          <p className="text-xs text-slate-500 mt-1">Tổng điểm: <span className="font-bold text-primary">{data.score}</span></p>
          {course?.phases.map((phase) => (
            <div key={phase.phaseId} className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{phase.phaseTitle}</p>
              <div className="space-y-1 mt-1">
                {phase.lessons.map((lesson) => (
                  <p key={lesson.lessonId} className="text-xs text-slate-500 pl-2">
                    {lesson.lessonTitle}: <span className="font-medium">{lesson.score}đ</span>
                    {lesson.totalTests > 0 && ` (${lesson.passedTests}/${lesson.totalTests} tests)`}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <OnboardingModal
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <section className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl md:text-4xl font-headline text-foreground tracking-tight leading-none">
                    {greeting}, {displayName}!
                  </h1>
                  <p className="text-muted-foreground">
                    Chào mừng bạn quay trở lại CodeFit
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="group border border-primary/20 dark:border-primary/30 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Điểm</p>
                <div className="text-3xl font-headline font-bold text-foreground">
                  {scoreBreakdown?.totalScore ?? 0}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {scoreBreakdown?.courses?.length && scoreBreakdown.courses.length > 0
                    ? `Từ ${scoreBreakdown.courses.length} khóa học`
                    : 'Bắt đầu ngay hôm nay'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="w-7 h-7 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="group border border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Chuỗi</p>
                <div className="text-3xl font-headline font-bold text-foreground">
                  {loginDays?.currentStreak ?? 0} Ngày
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {loginDays?.activeDaysThisWeek ?? 0}/7 ngày tuần này
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          {/* Rank Card */}
          <Card className="group border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Thứ hạng</p>
                <div className="text-3xl font-headline font-bold text-foreground">
                  {globalRank?.rank ? `#${globalRank.rank}` : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {globalRank?.rank
                    ? `Trên ${globalRank.totalUsers} người dùng`
                    : 'Hoàn thành bài tập để xếp hạng'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Score Breakdown Chart */}
        {scoreChartData.length > 0 && (
          <Card className="border-border dark:border-border hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-foreground">Điểm theo khóa học</CardTitle>
              <CardDescription>Hover vào cột để xem chi tiết theo chương và bài</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ScoreTooltip />} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} className="fill-primary" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Weekly Activity Chart */}
          <Card className="lg:col-span-8 border-border dark:border-border hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-headline text-foreground">Hoạt động hàng tuần</CardTitle>
                  <CardDescription>Số hoạt động theo từng ngày</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyActivity?.days || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} hoạt động`, 'Số lượng']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="submissions" radius={[8, 8, 0, 0]}>
                      {(weeklyActivity?.days || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          className={entry.isToday ? 'fill-primary' : 'fill-muted-foreground'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-6 border-t border-border dark:border-border flex justify-around">
                <div className="text-center">
                  <div className="text-xl font-headline font-bold text-foreground">
                    {weeklyActivity?.totalThisWeek ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Hoạt động tuần này</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-headline font-bold text-foreground">
                    {loginDays?.activeDaysThisWeek ?? 0}/7
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Ngày hoạt động</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-headline font-bold text-foreground">
                    {loginDays?.totalActiveDays ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tổng ngày học</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Progress */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-headline font-bold text-foreground">Khóa học của tôi</h2>
              <Link to="/user/danh-sach-khoa-hoc" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                Xem tất cả
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <Card className="group border-border dark:border-border hover:shadow-md transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-headline font-bold text-foreground truncate">Bắt đầu học ngay</h3>
                      <p className="text-xs text-muted-foreground">Chưa có khóa học nào</p>
                    </div>
                  </div>
                  <Link to="/user/danh-sach-khoa-hoc">
                    <Button className="w-full" size="sm">Khám phá khóa học</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              enrolledCourses.slice(0, 3).map((course) => (
                <Card key={course.enrollmentId} className="group border-border dark:border-border hover:shadow-md transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-3">
                      {course.courseImage ? (
                        <img
                          src={course.courseImage}
                          alt={course.courseTitle}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <Link to={`/user/courses/${course.courseId}`}>
                          <h3 className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors">
                            {course.courseTitle}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {course.level === 'beginner' ? 'Người mới' :
                             course.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                          </Badge>
                          {course.duration && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {course.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress value={course.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{course.progress}% hoàn thành</span>
                      <span>{course.completedLessons}/{course.totalLessons} bài</span>
                    </div>
                    {course.enrolledAt && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                        Đã tham gia: {new Date(course.enrolledAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Evaluation Scores */}
        {evaluation && (
          <Card className="border-border dark:border-border hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl font-headline text-foreground">Đánh giá năng lực</CardTitle>
                {evaluation.hasActivity && (
                  <Badge variant="outline" className="ml-2 text-xs border-primary/50 text-primary dark:border-primary dark:text-primary">
                    Điểm tổng: <span className="font-bold">{evaluation.finalScore}</span>/100
                  </Badge>
                )}
              </div>
              <CardDescription>5 tiêu chí đánh giá dựa trên hoạt động của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!evaluation.hasActivity ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <p className="font-headline font-semibold text-foreground text-lg">Chưa có dữ liệu đánh giá</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Hãy bắt đầu tham gia khóa học, làm bài minitest và nộp bài tập để hệ thống đánh giá năng lực của bạn.
                    </p>
                  </div>
                  <Link to="/user/danh-sach-khoa-hoc">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Khám phá khóa học
                    </Button>
                  </Link>
                </div>
              ) : (
              <>
              {/* Algorithm Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-foreground">{evaluation.algorithmSpeed.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{evaluation.algorithmSpeed.score}/100</span>
                    <Badge className={cn(
                      'text-[10px]',
                      evaluation.algorithmSpeed.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      evaluation.algorithmSpeed.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    )}>
                      {getEvalLabel(evaluation.algorithmSpeed.score)}
                    </Badge>
                  </div>
                </div>
                <Progress value={evaluation.algorithmSpeed.score} className="h-2" />
              </div>

              {/* Logic Thinking */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-foreground">{evaluation.logicThinking.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{evaluation.logicThinking.score}/100</span>
                    <Badge className={cn(
                      'text-[10px]',
                      evaluation.logicThinking.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      evaluation.logicThinking.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    )}>
                      {getEvalLabel(evaluation.logicThinking.score)}
                    </Badge>
                  </div>
                </div>
                <Progress value={evaluation.logicThinking.score} className="h-2" />
              </div>

              {/* Bug Fixing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-foreground">{evaluation.bugFixing.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{evaluation.bugFixing.score}/100</span>
                    <Badge className={cn(
                      'text-[10px]',
                      evaluation.bugFixing.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      evaluation.bugFixing.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    )}>
                      {getEvalLabel(evaluation.bugFixing.score)}
                    </Badge>
                  </div>
                </div>
                <Progress value={evaluation.bugFixing.score} className="h-2" />
              </div>

              {/* Learning Frequency */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-foreground">{evaluation.learningFrequency.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{evaluation.learningFrequency.score}/100</span>
                    <Badge className={cn(
                      'text-[10px]',
                      evaluation.learningFrequency.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      evaluation.learningFrequency.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    )}>
                      {evaluation.learningFrequency.level === 'high' ? 'Cao' :
                       evaluation.learningFrequency.level === 'medium' ? 'Trung bình' : 'Thấp'}
                    </Badge>
                  </div>
                </div>
                <Progress value={evaluation.learningFrequency.score} className="h-2" />
              </div>

              {/* Task Completion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium text-foreground">{evaluation.taskCompletion.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{evaluation.taskCompletion.score}/100</span>
                    <Badge className={cn(
                      'text-[10px]',
                      evaluation.taskCompletion.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      evaluation.taskCompletion.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    )}>
                      {getEvalLabel(evaluation.taskCompletion.score)}
                    </Badge>
                  </div>
                </div>
                <Progress value={evaluation.taskCompletion.score} className="h-2" />
              </div>

              {/* Final Score Summary */}
              <div className="mt-4 pt-4 border-t border-border dark:border-border flex items-center justify-between bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-foreground">Điểm tổng hợp</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={evaluation.finalScore} className="w-32 h-3" />
                  <span className="text-xl font-headline font-bold text-foreground">
                    {evaluation.finalScore}/100
                  </span>
                </div>
              </div>
              </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hackathon Section */}
        <section className="space-y-6 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-headline font-bold text-foreground">Sắp diễn ra</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hackathon Card */}
            <Card className="group relative overflow-hidden p-0 border-border dark:border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50">
              <div className="relative aspect-[16/9]">
                <img
                  alt="Tech hackathon visual"
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  <div className="flex gap-2">
                    <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400 border-transparent dark:bg-amber-500 dark:text-amber-950">Hot Event</Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-transparent">Tháng 7, 2026</Badge>
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-white leading-tight">CodeFit Summer Sprint</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" />
                        <AvatarFallback>U1</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" />
                        <AvatarFallback>U2</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" />
                        <AvatarFallback>U3</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-primary bg-slate-800 dark:bg-slate-700">
                        <AvatarFallback className="text-xs text-white">+2.4k</AvatarFallback>
                      </Avatar>
                    </div>
                    <Link to="/user/hackathon">
                      <Button size="sm" className="bg-white text-primary hover:bg-white/90 border-transparent">
                        Khám phá ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mentor Promotion Card */}
            <Card className="bg-primary border-primary text-white overflow-hidden relative">
              <div className="absolute right-[-10%] top-[-10%] opacity-10">
                <Code2 className="w-[300px] h-[300px]" />
              </div>
              <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-white">Trở thành một Mentor</h3>
                  <p className="text-blue-200 max-w-xs text-sm">
                    Chia sẻ kinh nghiệm lập trình của bạn và nhận những phần thưởng độc quyền từ hệ sinh thái CodeFit.
                  </p>
                </div>
                <Link
                  to="/user/tro-thanh-mentor"
                  className="inline-flex items-center gap-2 text-amber-400 font-bold hover:gap-4 transition-all mt-8"
                >
                  Tìm hiểu chương trình <Zap className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

// cn helper
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default DashboardUser;
