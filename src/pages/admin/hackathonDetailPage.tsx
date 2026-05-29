import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Modal } from 'antd';
import { Trophy, ArrowLeft, Loader2, Calendar, Clock, Users, Image, Play, Edit, Layers, FileText, Eye, TrendingUp, Award, Target, BarChart3, PieChart, Code } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPie, Pie, Cell, LineChart, Line } from 'recharts';

interface Testcase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  codeTemplate?: string;
  inputFormat?: string;
  outputFormat?: string;
  testcases?: Testcase[];
  submissionCount?: number;
  score?: number;
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  phaseTitle?: string;
  courseTitle?: string;
}

interface HackathonStatistics {
  totalSubmissions: number;
  uniqueSubmitters: number;
  avgScore: number;
  submissionsByStatus: { pending: number; graded: number; rejected: number };
  submissionsByDay: Record<string, number>;
  problemStats: { id: string; title: string; difficulty: string; submissionCount: number; avgScore: number }[];
  participantCount: number;
  submissionCount: number;
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants: number;
  imageUrl?: string;
  lessonIds?: string;
  problems?: Problem[];
  course?: { id: string; title: string };
  _count?: { participants: number; submissions: number };
  statistics?: HackathonStatistics;
  participants?: { id: string; user: { id: string; fullName: string; email: string }; joinedAt: string }[];
  submissions?: { id: string; user: { id: string; fullName: string; email: string }; status: string; score?: number; submittedAt: string }[];
}

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HackathonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHackathonDetail(id);
    }
  }, [id]);

  const fetchHackathonDetail = async (hackathonId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.hackathon(hackathonId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setHackathon(data.data);
        
        // Fetch lesson details if there are lessonIds
        const lessonIds = parseLessonIds(data.data.lessonIds || '');
        if (lessonIds.length > 0) {
          fetchLessonDetails(lessonIds, token || '');
        }
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonDetails = async (lessonIds: string[], token: string) => {
    try {
      const lessonPromises = lessonIds.map(lessonId =>
        fetch(API_ENDPOINTS.admin.lesson(lessonId), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).then(res => res.json())
      );
      const results = await Promise.all(lessonPromises);
      
      // Fetch lesson content for each lesson
      const lessonsWithContent = await Promise.all(
        results
          .filter(r => r.success && r.data)
          .map(async (r) => {
            const lesson = r.data;
            // Try to fetch lesson content
            try {
              const contentRes = await fetch(API_ENDPOINTS.lessonContent.get(lesson.id), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              const contentData = await contentRes.json();
              if (contentData.success && contentData.data) {
                lesson.content = contentData.data.content;
              }
            } catch {
              // Content might not exist
            }
            return {
              id: lesson.id,
              title: lesson.title,
              content: lesson.content,
              phaseTitle: lesson.phase?.title,
              courseTitle: lesson.phase?.course?.title,
            };
          })
      );
      setLessons(lessonsWithContent);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const parseLessonIds = (lessonIdsStr?: string): string[] => {
    if (!lessonIdsStr) return [];
    try {
      return JSON.parse(lessonIdsStr);
    } catch {
      return [];
    }
  };

  const getStatus = () => {
    if (!hackathon) return 'ended';
    const now = new Date();
    const start = new Date(hackathon.startTime);
    const end = new Date(hackathon.endTime);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2";
    const darkClasses = isDark
      ? status === 'active'
        ? 'bg-green-900/50 text-green-400'
        : status === 'upcoming'
        ? 'bg-blue-900/50 text-blue-400'
        : 'bg-slate-700 text-slate-400'
      : status === 'active'
      ? 'bg-green-100 text-green-700'
      : status === 'upcoming'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-slate-100 text-slate-600';

    return (
      <span className={cn(baseClasses, darkClasses)}>
        {status === 'active' && <Play className="w-4 h-4" />}
        {status === 'upcoming' && <Clock className="w-4 h-4" />}
        {status === 'active' ? 'Đang diễn ra' : status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toUpperCase();
    if (d === 'EASY') return isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700';
    if (d === 'HARD') return isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700';
    return isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
  };

  const handlePreviewLesson = (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setPreviewModalOpen(true);
  };

  // Prepare chart data
  const getSubmissionsByDayData = () => {
    if (!hackathon?.statistics?.submissionsByDay) return [];
    return Object.entries(hackathon.statistics.submissionsByDay)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        submissions: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getPieChartData = () => {
    if (!hackathon?.statistics?.submissionsByStatus) return [];
    const { pending, graded, rejected } = hackathon.statistics.submissionsByStatus;
    return [
      { name: 'Đã chấm', value: graded },
      { name: 'Đang chờ', value: pending },
      { name: 'Từ chối', value: rejected },
    ].filter(d => d.value > 0);
  };

  const getProblemBarData = () => {
    if (!hackathon?.statistics?.problemStats) return [];
    return hackathon.statistics.problemStats.map(p => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
      submissions: p.submissionCount,
      score: Math.round(p.avgScore),
    }));
  };

  if (loading) {
    return (
      <div className={cn("p-6 flex items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className={cn("p-6 flex flex-col items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Trophy className={cn("w-16 h-16 mb-4", isDark ? 'text-slate-600' : 'text-slate-400')} />
        <p className={cn("text-lg", isDark ? 'text-slate-400' : 'text-slate-600')}>Không tìm thấy hackathon</p>
        <Button onClick={() => navigate('/admin/hackathons')} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const status = getStatus();
  const chartColors = {
    bar: isDark ? '#0d9488' : '#0d9488',
    line: isDark ? '#8b5cf6' : '#8b5cf6',
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b px-6 py-4 backdrop-blur-md",
        isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/hackathons')}
              className={isDark ? 'text-slate-300 hover:bg-slate-800' : ''}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isDark ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className={cn("text-xl font-bold", isDark ? 'text-white' : 'text-primary')}>
                  {hackathon.title}
                </h1>
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chi tiết Hackathon
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(status)}
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/hackathons/${hackathon.id}/edit`)}
              className={isDark ? 'border-slate-600 text-slate-300' : ''}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 7/3 Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - 7/10 - Main Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Overview Card */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Trophy className="w-5 h-5 text-primary" />
                  Thông tin tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className={cn("text-base", isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {hackathon.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Calendar className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-blue-400' : 'text-blue-500')} />
                    <p className={cn("text-lg font-bold", isDark ? 'text-white' : '')}>
                      {formatDate(hackathon.startTime)}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Bắt đầu</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Calendar className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-red-400' : 'text-red-500')} />
                    <p className={cn("text-lg font-bold", isDark ? 'text-white' : '')}>
                      {formatDate(hackathon.endTime)}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Kết thúc</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Clock className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-amber-400' : 'text-amber-500')} />
                    <p className={cn("text-lg font-bold", isDark ? 'text-white' : '')}>
                      {hackathon.durationMinutes}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Phút làm bài</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Users className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-purple-400' : 'text-purple-500')} />
                    <p className={cn("text-lg font-bold", isDark ? 'text-white' : '')}>
                      {hackathon.maxParticipants}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Tối đa</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Section */}
            {hackathon.statistics && (
              <>
                {/* Key Metrics */}
                <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                  <CardHeader>
                    <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Thống kê chi tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className={cn(
                        "p-4 rounded-lg text-center",
                        isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                      )}>
                        <Users className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-purple-400' : 'text-purple-500')} />
                        <p className={cn("text-2xl font-bold", isDark ? 'text-white' : '')}>
                          {hackathon.statistics.participantCount}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Người tham gia</p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-lg text-center",
                        isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                      )}>
                        <FileText className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-amber-400' : 'text-amber-500')} />
                        <p className={cn("text-2xl font-bold", isDark ? 'text-white' : '')}>
                          {hackathon.statistics.totalSubmissions}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Bài nộp</p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-lg text-center",
                        isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                      )}>
                        <Target className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-green-400' : 'text-green-500')} />
                        <p className={cn("text-2xl font-bold", isDark ? 'text-white' : '')}>
                          {hackathon.statistics.avgScore}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Điểm TB</p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-lg text-center",
                        isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                      )}>
                        <TrendingUp className={cn("w-6 h-6 mx-auto mb-2", isDark ? 'text-blue-400' : 'text-blue-500')} />
                        <p className={cn("text-2xl font-bold", isDark ? 'text-white' : '')}>
                          {hackathon.statistics.uniqueSubmitters}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Người nộp</p>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Submissions over time */}
                      {getSubmissionsByDayData().length > 0 && (
                        <div>
                          <h4 className={cn("text-sm font-medium mb-3", isDark ? 'text-slate-300' : 'text-slate-700')}>
                            Bài nộp theo ngày
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={getSubmissionsByDayData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                              <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 12 }} />
                              <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDark ? '#1e293b' : '#fff',
                                  borderColor: isDark ? '#334155' : '#e2e8f0',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                }}
                              />
                              <Line type="monotone" dataKey="submissions" stroke={chartColors.line} strokeWidth={2} dot={{ fill: chartColors.line }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Submissions by status */}
                      {getPieChartData().length > 0 && (
                        <div>
                          <h4 className={cn("text-sm font-medium mb-3", isDark ? 'text-slate-300' : 'text-slate-700')}>
                            Trạng thái bài nộp
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartPie>
                              <Pie
                                data={getPieChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {getPieChartData().map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDark ? '#1e293b' : '#fff',
                                  borderColor: isDark ? '#334155' : '#e2e8f0',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                }}
                              />
                            </RechartPie>
                          </ResponsiveContainer>
                          <div className="flex justify-center gap-4 mt-2">
                            {getPieChartData().map((entry, index) => (
                              <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                                  {entry.name}: {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Problem submission stats */}
                      {getProblemBarData().length > 0 && (
                        <div className={getSubmissionsByDayData().length > 0 ? '' : 'lg:col-span-2'}>
                          <h4 className={cn("text-sm font-medium mb-3", isDark ? 'text-slate-300' : 'text-slate-700')}>
                            Số lượng nộp theo bài tập
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={getProblemBarData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                              <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} />
                              <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDark ? '#1e293b' : '#fff',
                                  borderColor: isDark ? '#334155' : '#e2e8f0',
                                  color: isDark ? '#f1f5f9' : '#1e293b',
                                }}
                              />
                              <Bar dataKey="submissions" fill={chartColors.bar} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Problem Stats Table */}
                {hackathon.statistics.problemStats.length > 0 && (
                  <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                    <CardHeader>
                      <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                        <Award className="w-5 h-5 text-primary" />
                        Chi tiết từng bài tập
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={cn("border-b", isDark ? 'border-slate-600' : 'border-slate-200')}>
                              <th className={cn("text-left py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>Bài tập</th>
                              <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>Độ khó</th>
                              <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>Số lần nộp</th>
                              <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>Điểm TB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hackathon.statistics.problemStats.map((p) => (
                              <tr key={p.id} className={cn("border-b", isDark ? 'border-slate-700' : 'border-slate-100')}>
                                <td className={cn("py-3 px-4 font-medium", isDark ? 'text-white' : '')}>{p.title}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className={cn("px-2 py-1 rounded text-xs font-medium", getDifficultyColor(p.difficulty))}>
                                    {p.difficulty}
                                  </span>
                                </td>
                                <td className={cn("py-3 px-4 text-center", isDark ? 'text-slate-300' : 'text-slate-600')}>{p.submissionCount}</td>
                                <td className={cn("py-3 px-4 text-center font-medium", isDark ? 'text-green-400' : 'text-green-600')}>{p.avgScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Problems Section */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Code className="w-5 h-5 text-primary" />
                  Bài tập ({hackathon.problems?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hackathon.problems || hackathon.problems.length === 0 ? (
                  <div className={cn(
                    "text-center py-8 rounded-lg border-2 border-dashed",
                    isDark ? 'border-slate-600' : 'border-slate-300'
                  )}>
                    <FileText className={cn("w-12 h-12 mx-auto mb-3", isDark ? 'text-slate-500' : 'text-slate-400')} />
                    <p className={cn("mb-1", isDark ? 'text-slate-300' : 'text-slate-600')}>
                      Chưa có bài tập nào
                    </p>
                    <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Thêm bài tập để bắt đầu cuộc thi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hackathon.problems.map((problem, index) => (
                      <div
                        key={problem.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                            )}>
                              {index + 1}
                            </span>
                            <div>
                              <h4 className={cn("font-semibold", isDark ? 'text-white' : '')}>
                                {problem.title}
                              </h4>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                getDifficultyColor(problem.difficulty)
                              )}>
                                {problem.difficulty}
                              </span>
                            </div>
                          </div>
                          {hackathon.statistics?.problemStats.find(p => p.id === problem.id) && (
                            <div className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {hackathon.statistics?.problemStats.find(p => p.id === problem.id)?.submissionCount} lượt nộp
                            </div>
                          )}
                        </div>

                        {problem.description && (
                          <p className={cn("text-sm mb-3", isDark ? 'text-slate-400' : 'text-slate-600')}>
                            {problem.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {problem.inputFormat && (
                            <div className={cn(
                              "p-3 rounded",
                              isDark ? 'bg-slate-600/50' : 'bg-white'
                            )}>
                              <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
                                Input Format
                              </p>
                              <code className={cn("text-sm", isDark ? 'text-green-400' : 'text-green-600')}>
                                {problem.inputFormat}
                              </code>
                            </div>
                          )}
                          {problem.outputFormat && (
                            <div className={cn(
                              "p-3 rounded",
                              isDark ? 'bg-slate-600/50' : 'bg-white'
                            )}>
                              <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
                                Output Format
                              </p>
                              <code className={cn("text-sm", isDark ? 'text-blue-400' : 'text-blue-600')}>
                                {problem.outputFormat}
                              </code>
                            </div>
                          )}
                        </div>

                        {problem.codeTemplate && (
                          <div className={cn(
                            "mt-3 p-3 rounded font-mono text-sm",
                            isDark ? 'bg-slate-800' : 'bg-slate-800 text-slate-300'
                          )}>
                            <p className={cn("text-xs mb-2", isDark ? 'text-slate-500' : 'text-slate-400')}>
                              Code Template:
                            </p>
                            <pre className="whitespace-pre-wrap">{problem.codeTemplate}</pre>
                          </div>
                        )}

                        {problem.testcases && problem.testcases.length > 0 && (
                          <div className="mt-4">
                            <p className={cn("text-sm font-medium mb-2", isDark ? 'text-slate-300' : 'text-slate-700')}>
                              Testcases ({problem.testcases.length})
                            </p>
                            <div className="space-y-2">
                              {problem.testcases.map((tc, tcIndex) => (
                                <div
                                  key={tc.id}
                                  className={cn(
                                    "p-3 rounded border",
                                    tc.isPublic
                                      ? isDark ? 'border-green-600/50 bg-green-900/20' : 'border-green-200 bg-green-50'
                                      : isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={cn("text-xs font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                                      Test {tcIndex + 1}
                                    </span>
                                    {tc.isPublic && (
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-xs",
                                        isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
                                      )}>
                                        Public
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className={cn("text-xs", isDark ? 'text-slate-500' : 'text-slate-400')}>Input: </span>
                                      <code className={isDark ? 'text-slate-300' : 'text-slate-700'}>{tc.input}</code>
                                    </div>
                                    <div>
                                      <span className={cn("text-xs", isDark ? 'text-slate-500' : 'text-slate-400')}>Output: </span>
                                      <code className={isDark ? 'text-green-400' : 'text-green-600'}>{tc.expectedOutput}</code>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lessons Section */}
            {lessons.length > 0 && (
              <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                    <Layers className="w-5 h-5 text-primary" />
                    Bài học liên quan ({lessons.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "p-4 rounded-lg border flex items-center gap-4",
                          isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isDark ? 'bg-primary/20' : 'bg-primary/10'
                        )}>
                          <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-medium truncate", isDark ? 'text-white' : '')}>
                            {lesson.title}
                          </h4>
                          {(lesson.courseTitle || lesson.phaseTitle) && (
                            <p className={cn("text-sm truncate", isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {lesson.courseTitle}
                              {lesson.phaseTitle && ` / ${lesson.phaseTitle}`}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewLesson(lesson)}
                          className={isDark ? 'border-slate-600' : ''}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - 3/10 - Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Preview */}
            {hackathon.imageUrl && (
              <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                    <Image className="w-5 h-5 text-primary" />
                    Hình ảnh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={hackathon.imageUrl}
                      alt={hackathon.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <PieChart className="w-5 h-5 text-primary" />
                  Tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className={cn("w-4 h-4", isDark ? 'text-purple-400' : 'text-purple-500')} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Thí sinh</span>
                  </div>
                  <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                    {hackathon.statistics?.participantCount || hackathon._count?.participants || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className={cn("w-4 h-4", isDark ? 'text-amber-400' : 'text-amber-500')} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Bài nộp</span>
                  </div>
                  <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                    {hackathon.statistics?.totalSubmissions || hackathon._count?.submissions || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className={cn("w-4 h-4", isDark ? 'text-green-400' : 'text-green-500')} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Bài tập</span>
                  </div>
                  <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                    {hackathon.problems?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className={cn("w-4 h-4", isDark ? 'text-blue-400' : 'text-blue-500')} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Bài học</span>
                  </div>
                  <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                    {lessons.length}
                  </span>
                </div>
                {hackathon.statistics && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className={cn("w-4 h-4", isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Điểm TB</span>
                      </div>
                      <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                        {hackathon.statistics.avgScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={cn("w-4 h-4", isDark ? 'text-pink-400' : 'text-pink-500')} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Người nộp</span>
                      </div>
                      <span className={cn("font-semibold", isDark ? 'text-white' : '')}>
                        {hackathon.statistics.uniqueSubmitters}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Course Info */}
            {hackathon.course && (
              <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                <CardHeader>
                  <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                    Khóa học liên kết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "p-3 rounded-lg",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <p className={cn("font-medium", isDark ? 'text-white' : '')}>
                      {hackathon.course.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      status !== 'ended' ? 'bg-blue-500' : 'bg-slate-400'
                    )} />
                    <div>
                      <p className={cn("font-medium text-sm", isDark ? 'text-white' : '')}>
                        Bắt đầu
                      </p>
                      <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(hackathon.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      status === 'ended' ? 'bg-red-500' : 'bg-slate-400'
                    )} />
                    <div>
                      <p className={cn("font-medium text-sm", isDark ? 'text-white' : '')}>
                        Kết thúc
                      </p>
                      <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(hackathon.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/admin/hackathons/${hackathon.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/admin/hackathons')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lesson Preview Modal */}
      <Modal
        title={<span className={isDark ? 'text-white' : ''}>Xem trước bài học</span>}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        styles={{
          mask: { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' },
          body: { backgroundColor: isDark ? '#1e293b' : '#fff' },
        }}
      >
        {previewLesson && (
          <div className="space-y-4">
            <div>
              <h3 className={cn("text-lg font-semibold mb-1", isDark ? 'text-white' : '')}>
                {previewLesson.title}
              </h3>
              {(previewLesson.courseTitle || previewLesson.phaseTitle) && (
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {previewLesson.courseTitle}
                  {previewLesson.phaseTitle && ` / ${previewLesson.phaseTitle}`}
                </p>
              )}
            </div>
            <div className={cn(
              "p-4 rounded-lg max-h-[400px] overflow-y-auto",
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            )}>
              {previewLesson.content ? (
                <div
                  className={cn("prose prose-sm max-w-none", isDark ? 'prose-invert' : '')}
                  dangerouslySetInnerHTML={{ __html: previewLesson.content }}
                />
              ) : (
                <p className={cn("text-center italic", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Không có nội dung để hiển thị
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
