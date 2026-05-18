import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLecture } from '@/contexts/LectureContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { message } from 'antd';
import {
  Trophy, ArrowLeft, Loader2, Calendar, Clock, Users,
  Target, BarChart3, CheckCircle, XCircle
} from 'lucide-react';

interface HackathonProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit?: number;
  submissionCount?: number;
  avgScore?: number;
}

interface HackathonSubmission {
  id: string;
  hackathonId: string;
  userId: string;
  score?: number;
  submittedAt: string;
  user?: { fullName: string; username: string; avatar?: string };
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  maxParticipants?: number;
  imageUrl?: string;
  lessonIds?: string;
  problems?: HackathonProblem[];
  course?: { id: string; title: string };
  _count?: { participants: number; submissions: number };
  statistics?: {
    totalSubmissions: number;
    avgScore: number;
    submissionsByStatus: { pending: number; graded: number; rejected: number };
    submissionsByDay: Record<string, number>;
  };
  participants?: { id: string; hackathonId: string; userId: string; joinedAt: string }[];
  submissions?: HackathonSubmission[];
}

export default function LectureHackathonDetailPage() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  const { isDark } = useLecture();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (hackathonId) {
      fetchHackathonDetail(hackathonId);
    }
  }, [hackathonId]);

  const fetchHackathonDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch hackathon detail
      const res = await fetch(API_ENDPOINTS.hackathons.detail(id), { headers });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load hackathon');

      // Fetch participants, submissions, and problems in parallel
      const [participantsRes, submissionsRes, problemsRes] = await Promise.all([
        fetch(API_ENDPOINTS.hackathons.participants(id), { headers }),
        fetch(API_ENDPOINTS.hackathons.submissions(id), { headers }),
        fetch(API_ENDPOINTS.hackathons.problems(id), { headers }),
      ]);

      const [participantsData, submissionsData, problemsData] = await Promise.all([
        participantsRes.json(),
        submissionsRes.json(),
        problemsRes.json(),
      ]);

      const base = data.data;
      setHackathon({
        ...base,
        participants: participantsData.success ? (participantsData.data || []) : [],
        submissions: submissionsData.success ? (submissionsData.data || []) : [],
        problems: problemsData.success ? (problemsData.data?.problems || problemsData.data || []) : [],
      });
    } catch (error: any) {
      console.error('Error fetching hackathon:', error);
      message.error(error.message || 'Không thể tải chi tiết hackathon');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = () => {
    if (!hackathon) return 'ended';
    const now = new Date();
    const start = new Date(hackathon.startTime);
    const end = new Date(hackathon.endTime);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'ended';
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      upcoming: { bg: isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700', text: 'Sắp diễn ra', icon: Clock },
      ongoing: { bg: isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700', text: 'Đang diễn ra', icon: CheckCircle },
      ended: { bg: isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600', text: 'Đã kết thúc', icon: XCircle },
    };
    const c = config[status] || config.ended;
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', c.bg)}>
        <c.icon className="w-4 h-4" />
        {c.text}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const d = difficulty?.toUpperCase();
    if (d === 'EASY') return <span className={cn('px-2 py-0.5 rounded text-xs font-medium', isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700')}>Dễ</span>;
    if (d === 'HARD') return <span className={cn('px-2 py-0.5 rounded text-xs font-medium', isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700')}>Khó</span>;
    return <span className={cn('px-2 py-0.5 rounded text-xs font-medium', isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700')}>Trung bình</span>;
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


  if (loading) {
    return (
      <div className={cn("flex items-center justify-center min-h-[60vh]", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Loader2 className={cn("w-12 h-12 animate-spin text-cyan-500")} />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[60vh]", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Trophy className={cn("w-16 h-16 mb-4", isDark ? 'text-slate-600' : 'text-slate-400')} />
        <p className={cn("text-lg font-medium", isDark ? 'text-white' : 'text-slate-900')}>Không tìm thấy hackathon</p>
        <Button onClick={() => navigate('/lecture/hackathons')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const status = getStatus();

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? 'bg-slate-900' : 'bg-slate-50')}>

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
              onClick={() => navigate('/lecture/hackathons')}
              className={isDark ? 'text-slate-300 hover:bg-slate-800' : ''}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isDark ? 'bg-cyan-500/20' : 'bg-cyan-50'
              )}>
                <Trophy className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h1 className={cn("text-xl font-bold", isDark ? 'text-white' : 'text-slate-900')}>
                  {hackathon.title}
                </h1>
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chi tiết Hackathon
                </p>
              </div>
            </div>
          </div>
          <div>
            {getStatusBadge(status)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Trophy className="w-5 h-5 text-cyan-500" />
                  Thông tin tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className={cn("text-base", isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {hackathon.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className={cn(
                    "p-3 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Calendar className={cn("w-5 h-5 mx-auto mb-1", isDark ? 'text-blue-400' : 'text-blue-500')} />
                    <p className={cn("text-sm font-medium", isDark ? 'text-white' : '')}>
                      {new Date(hackathon.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>Bắt đầu</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Calendar className={cn("w-5 h-5 mx-auto mb-1", isDark ? 'text-red-400' : 'text-red-500')} />
                    <p className={cn("text-sm font-medium", isDark ? 'text-white' : '')}>
                      {new Date(hackathon.endTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>Kết thúc</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <Users className={cn("w-5 h-5 mx-auto mb-1", isDark ? 'text-purple-400' : 'text-purple-500')} />
                    <p className={cn("text-sm font-medium", isDark ? 'text-white' : '')}>
                      {hackathon._count?.participants ?? 0}
                    </p>
                    <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>Đội tham gia</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg text-center",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}>
                    <BarChart3 className={cn("w-5 h-5 mx-auto mb-1", isDark ? 'text-green-400' : 'text-green-500')} />
                    <p className={cn("text-sm font-medium", isDark ? 'text-white' : '')}>
                      {hackathon.statistics?.totalSubmissions ?? 0}
                    </p>
                    <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>Bài nộp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Target className="w-5 h-5 text-cyan-500" />
                  Bài tập ({hackathon.problems?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hackathon.problems && hackathon.problems.length > 0 ? (
                  <div className="space-y-3">
                    {hackathon.problems.map((problem, index) => (
                      <div
                        key={problem.id}
                        className={cn(
                          "p-4 rounded-lg border transition-colors",
                          isDark ? 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                            )}>
                              {index + 1}
                            </span>
                            <h4 className={cn("font-medium", isDark ? 'text-white' : 'text-slate-900')}>
                              {problem.title}
                            </h4>
                          </div>
                          {getDifficultyBadge(problem.difficulty)}
                        </div>
                        <p className={cn("text-sm line-clamp-2 mt-1 ml-9", isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {problem.description}
                        </p>
                        {problem.submissionCount !== undefined && (
                          <div className={cn("flex items-center gap-4 mt-2 ml-9 text-xs", isDark ? 'text-slate-500' : 'text-slate-400')}>
                            <span>{problem.submissionCount} lượt nộp</span>
                            {problem.avgScore !== undefined && (
                              <span>Điểm TB: {Math.round(problem.avgScore)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-center py-8", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có bài tập nào trong hackathon này
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Computed Stats from submissions */}
            {hackathon.submissions && hackathon.submissions.length > 0 && (
              <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                <CardHeader>
                  <CardTitle className={cn("text-base", isDark ? 'text-white' : '')}>
                    Thống kê bài nộp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full bg-green-500")} />
                      <span className={cn("text-sm", isDark ? 'text-slate-300' : 'text-slate-600')}>Đã nộp</span>
                    </div>
                    <span className={cn("font-medium", isDark ? 'text-white' : '')}>
                      {hackathon.submissions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full bg-cyan-500")} />
                      <span className={cn("text-sm", isDark ? 'text-slate-300' : 'text-slate-600')}>Đã chấm</span>
                    </div>
                    <span className={cn("font-medium", isDark ? 'text-white' : '')}>
                      {hackathon.submissions.filter((s: any) => s.score !== null && s.score !== undefined).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full bg-yellow-500")} />
                      <span className={cn("text-sm", isDark ? 'text-slate-300' : 'text-slate-600')}>Chưa chấm</span>
                    </div>
                    <span className={cn("font-medium", isDark ? 'text-white' : '')}>
                      {hackathon.submissions.filter((s: any) => s.score === null || s.score === undefined).length}
                    </span>
                  </div>
                  <div className={cn("border-t pt-3 flex items-center justify-between")}>
                    <span className={cn("text-sm font-medium", isDark ? 'text-slate-300' : 'text-slate-600')}>
                      Điểm cao nhất
                    </span>
                    <span className={cn("font-bold text-cyan-500")}>
                      {hackathon.submissions.reduce((max: number, s: any) => Math.max(max, s.score ?? 0), 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("text-base", isDark ? 'text-white' : '')}>
                  Đội tham gia ({(hackathon.participants?.length ?? 0) || (hackathon._count?.participants ?? 0)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hackathon.participants && hackathon.participants.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {hackathon.participants.slice(0, 10).map((p: any) => (
                      <div
                        key={p.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md text-sm",
                          isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                        )}
                      >
                        <span className={cn("font-medium truncate", isDark ? 'text-slate-200' : 'text-slate-700')}>
                          {p.user?.fullName || p.userId || 'Người dùng'}
                        </span>
                        <span className={cn("text-xs flex-shrink-0 ml-2", isDark ? 'text-slate-500' : 'text-slate-400')}>
                          {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                    {hackathon.participants.length > 10 && (
                      <p className={cn("text-xs text-center pt-1", isDark ? 'text-slate-500' : 'text-slate-400')}>
                        +{hackathon.participants.length - 10} đội khác
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={cn("text-center text-sm py-4", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có đội tham gia
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
