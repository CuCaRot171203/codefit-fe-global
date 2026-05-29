import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { message } from 'antd';
import {
  FlaskConical,
  Search,
  Trash2,
  Plus,
  Loader2,
  FileQuestion,
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Eye,
  Award,
  Target,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MinitestSubmission {
  id: string;
  score: number | null;
  status: string;
  submittedAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
    avatar: string | null;
  };
}

interface MinitestStats {
  id: string;
  title: string;
  phase?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    };
  };
  questionCount: number;
  totalSubmissions: number;
  uniqueUsers: number;
  passedSubmissions: number;
  completionRate: number;
  avgScore: number;
  recentSubmissions: MinitestSubmission[];
}

interface Phase {
  id: string;
  title: string;
  course?: {
    id: string;
    title: string;
  };
}

interface Minitest {
  id: string;
  title: string;
  phase?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
    };
  };
  questions?: any[];
  submissions?: MinitestSubmission[];
  _count?: {
    questions: number;
  };
}

export default function AdminMinitestsPage() {
  const { isDark } = useAdmin();
  const [minitests, setMinitests] = useState<Minitest[]>([]);
  const [minitestStats, setMinitestStats] = useState<MinitestStats[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMinitest, setNewMinitest] = useState({ title: '', phaseId: '' });
  const [_expandedItems, _setExpandedItems] = useState<Set<string>>(new Set());
  
  // Modal states
  const [selectedMinitest, setSelectedMinitest] = useState<MinitestStats | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submissions, setSubmissions] = useState<MinitestSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let isMounted = true;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const [minitestsRes, statsRes, phasesRes] = await Promise.all([
        fetch(API_ENDPOINTS.admin.minitests, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        }),
        fetch(API_ENDPOINTS.admin.minitestsStats, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        }),
        fetch(API_ENDPOINTS.admin.phases, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        }),
      ]);

      clearTimeout(timeoutId);

      if (!isMounted) return;

      const minitestsData = await minitestsRes.json();
      const statsData = await statsRes.json();
      const phasesData = await phasesRes.json();

      if (minitestsData.success) {
        setMinitests(minitestsData.data || []);
      }
      if (statsData.success) {
        setMinitestStats(statsData.data || []);
      }
      if (phasesData.success) {
        setPhases(phasesData.data || []);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  };

  const handleAddMinitest = async () => {
    if (!newMinitest.title || !newMinitest.phaseId) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.minitests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMinitest),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Thêm minitest thành công');
        setMinitests([...minitests, { ...data.data, _count: { questions: 0 } }]);
        setNewMinitest({ title: '', phaseId: '' });
        setShowAddForm(false);
        fetchData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error adding minitest:', error);
      message.error('Thêm minitest thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa minitest này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.minitest(id), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      message.success('Xóa minitest thành công');
      setMinitests(minitests.filter((m) => m.id !== id));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting minitest:', error);
      message.error('Xóa minitest thất bại');
    }
  };

  const handleViewDetail = async (stats: MinitestStats) => {
    setSelectedMinitest(stats);
    setShowDetailModal(true);
    setLoadingSubmissions(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.minitestSubmissions(stats.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Calculate overall stats
  const totalMinitests = minitestStats.length;
  const totalSubmissions = minitestStats.reduce((sum, m) => sum + m.totalSubmissions, 0);
  const totalPassed = minitestStats.reduce((sum, m) => sum + m.passedSubmissions, 0);
  const avgCompletionRate = totalMinitests > 0
    ? Math.round(minitestStats.reduce((sum, m) => sum + m.completionRate, 0) / totalMinitests)
    : 0;

  // Build unique course list from phases
  const courses = Array.from(
    phases.reduce((acc, phase) => {
      if (phase.course?.id && phase.course?.title) {
        acc.set(phase.course.id, phase.course.title);
      }
      return acc;
    }, new Map<string, string>())
  ).map(([id, title]) => ({ id, title }));

  // Phases filtered by selected course
  const filteredPhases = phases.filter(
    (p) => courseFilter === 'all' || p.course?.id === courseFilter
  );

  const filteredStats = minitestStats.filter((minitest) => {
    const matchesSearch =
      minitest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minitest.phase?.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minitest.phase?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === 'all' || minitest.phase?.course?.id === courseFilter;
    const matchesPhase = phaseFilter === 'all' || minitest.phase?.id === phaseFilter;
    return matchesSearch && matchesCourse && matchesPhase;
  });

  // Group by course
  const groupedStats = filteredStats.reduce((acc, minitest) => {
    const courseTitle = minitest.phase?.course?.title || 'Chưa phân loại';
    if (!acc[courseTitle]) {
      acc[courseTitle] = [];
    }
    acc[courseTitle].push(minitest);
    return acc;
  }, {} as Record<string, MinitestStats[]>);

  if (loading) {
    return (
      <div className={cn(
        "p-6 flex items-center justify-center min-h-screen",
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 lg:p-6 space-y-6 min-h-screen transition-colors duration-300",
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? 'text-white' : 'text-primary'
          )}>Quản lý Minitest</h1>
          <p className={cn(
            "mt-1",
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>Tổng cộng {minitests.length} minitest</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "bg-primary hover:bg-primary/90",
            isDark ? 'text-white' : ''
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Minitest
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Tổng Minitest</p>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>{totalMinitests}</p>
              </div>
              <FlaskConical className={cn('w-10 h-10 opacity-20', isDark ? 'text-primary' : 'text-slate-400')} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Tổng lượt nộp</p>
                <p className={cn('text-2xl font-bold text-blue-500')}>{totalSubmissions}</p>
              </div>
              <TrendingUp className={cn('w-10 h-10 text-blue-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Lượt đạt điểm</p>
                <p className={cn('text-2xl font-bold text-green-500')}>{totalPassed}</p>
              </div>
              <CheckCircle className={cn('w-10 h-10 text-green-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>TB Hoàn thành</p>
                <p className={cn('text-2xl font-bold text-amber-500')}>{avgCompletionRate}%</p>
              </div>
              <Target className={cn('w-10 h-10 text-amber-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className={cn(
          "border",
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
        )}>
          <CardHeader>
            <CardTitle className={cn(isDark ? 'text-white' : '')}>
              Thêm Minitest mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium",
                  isDark ? 'text-slate-300' : ''
                )}>Tên Minitest</label>
                <Input
                  placeholder="VD: Bài kiểm tra chương 1"
                  value={newMinitest.title}
                  onChange={(e) => setNewMinitest({ ...newMinitest, title: e.target.value })}
                  className={cn(
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                      : ''
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className={cn(
                  "text-sm font-medium",
                  isDark ? 'text-slate-300' : ''
                )}>Chương học</label>
                <select
                  value={newMinitest.phaseId}
                  onChange={(e) => setNewMinitest({ ...newMinitest, phaseId: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg",
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : ''
                  )}
                >
                  <option value="">Chọn chương học</option>
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.course?.title} - {phase.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddMinitest}
                className="bg-primary"
                disabled={!newMinitest.title || !newMinitest.phaseId}
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className={cn(
        "border",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
      )}>
        <CardContent className="pt-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                isDark ? 'text-slate-400' : 'text-slate-400'
              )} />
              <Input
                placeholder="Tìm kiếm minitest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-10",
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    : ''
                )}
              />
            </div>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setPhaseFilter('all');
              }}
              className={cn(
                "px-3 py-2.5 border rounded-lg text-sm min-w-[160px]",
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-200'
              )}
            >
              <option value="all">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            {/* Phase Filter */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className={cn(
                "px-3 py-2.5 border rounded-lg text-sm min-w-[180px]",
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-200'
              )}
              disabled={phases.length === 0}
            >
              <option value="all">Tất cả chương học</option>
              {filteredPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.course?.title ? `${phase.course.title} - ` : ''}{phase.title}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(courseFilter !== 'all' || phaseFilter !== 'all' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCourseFilter('all');
                  setPhaseFilter('all');
                }}
                className={cn(
                  "text-cyan-500 hover:text-cyan-400",
                  isDark ? '' : ''
                )}
              >
                <X className="w-4 h-4 mr-1" />
                Xóa lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Minitests by Course with Stats */}
      <div className="space-y-6">
        {Object.entries(groupedStats).map(([courseTitle, courseStats]) => (
          <Card
            key={courseTitle}
            className={cn(
              "border",
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
            )}
          >
            <CardHeader className={cn(
              "pb-3",
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className={cn(
                    "w-5 h-5",
                    isDark ? 'text-primary' : 'text-primary'
                  )} />
                  <CardTitle className={cn(isDark ? 'text-white' : '')}>
                    {courseTitle}
                  </CardTitle>
                  <span className={cn(
                    "text-sm px-2 py-0.5 rounded-full",
                    isDark
                      ? 'bg-slate-600 text-slate-300'
                      : 'bg-slate-200 text-slate-600'
                  )}>
                    {courseStats.length} minitest
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {courseStats.map((minitest) => (
                <div
                  key={minitest.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    isDark
                      ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <FileQuestion className={cn(
                        "w-5 h-5",
                        isDark ? 'text-amber-400' : 'text-amber-500'
                      )} />
                      <div>
                        <h4 className={cn(
                          "font-medium",
                          isDark ? 'text-white' : ''
                        )}>
                          {minitest.title}
                        </h4>
                        <p className={cn(
                          "text-sm",
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          {minitest.phase?.title} • {minitest.questionCount} câu
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats badges */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {minitest.uniqueUsers} HV
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                          {minitest.avgScore}đ TB
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-16 h-2 rounded-full overflow-hidden",
                          isDark ? 'bg-slate-600' : 'bg-slate-200'
                        )}>
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              minitest.completionRate >= 70 ? 'bg-green-500' :
                              minitest.completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${minitest.completionRate}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          minitest.completionRate >= 70 ? 'text-green-500' :
                          minitest.completionRate >= 40 ? 'text-amber-500' : 'text-red-500'
                        )}>
                          {minitest.completionRate}%
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(minitest)}
                        className={cn(
                          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500'
                        )}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500'
                        )}
                        onClick={() => handleDelete(minitest.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStats.length === 0 && (
        <div className={cn(
          "text-center py-12",
          isDark ? 'text-slate-400' : ''
        )}>
          <FlaskConical className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {searchTerm ? 'Không tìm thấy minitest nào' : 'Chưa có minitest nào'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className={cn(
          "max-w-4xl max-h-[80vh] overflow-auto",
          isDark ? 'bg-slate-800 border-slate-700' : ''
        )}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? 'text-white' : '')}>
              Chi tiết Minitest: {selectedMinitest?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMinitest && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <FileQuestion className={cn('w-6 h-6 mx-auto mb-2', isDark ? 'text-amber-400' : 'text-amber-500')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>
                    {selectedMinitest.questionCount}
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Câu hỏi</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <Users className={cn('w-6 h-6 mx-auto mb-2 text-blue-500')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>
                    {selectedMinitest.uniqueUsers}
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Học viên</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <TrendingUp className={cn('w-6 h-6 mx-auto mb-2 text-green-500')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>
                    {selectedMinitest.avgScore}
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Điểm TB</p>
                </div>
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <Award className={cn('w-6 h-6 mx-auto mb-2 text-amber-500')} />
                  <p className={cn('text-2xl font-bold', isDark ? 'text-white' : '')}>
                    {selectedMinitest.passedSubmissions}
                  </p>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Lượt đạt</p>
                </div>
              </div>

              {/* Completion Progress */}
              <div>
                <h3 className={cn('font-medium mb-2', isDark ? 'text-white' : '')}>
                  Tỷ lệ hoàn thành: {selectedMinitest.completionRate}%
                </h3>
                <div className={cn(
                  "w-full h-4 rounded-full overflow-hidden",
                  isDark ? 'bg-slate-700' : 'bg-slate-200'
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selectedMinitest.completionRate >= 70 ? 'bg-green-500' :
                      selectedMinitest.completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${selectedMinitest.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Submissions Table */}
              <div>
                <h3 className={cn('font-medium mb-3', isDark ? 'text-white' : '')}>
                  Lịch sử nộp bài ({submissions.length} lượt)
                </h3>
                {loadingSubmissions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : submissions.length > 0 ? (
                  <div className={cn(
                    "rounded-lg border overflow-hidden",
                    isDark ? 'border-slate-600' : ''
                  )}>
                    <table className="w-full">
                      <thead className={cn(
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}>
                        <tr>
                          <th className={cn('px-4 py-3 text-left text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>Học viên</th>
                          <th className={cn('px-4 py-3 text-left text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>Email</th>
                          <th className={cn('px-4 py-3 text-center text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>Điểm</th>
                          <th className={cn('px-4 py-3 text-center text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>Trạng thái</th>
                          <th className={cn('px-4 py-3 text-left text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className={cn(isDark ? 'bg-slate-800' : 'bg-white')}>
                        {submissions.map((submission) => (
                          <tr key={submission.id} className={cn(
                            "border-t",
                            isDark ? 'border-slate-600' : 'border-slate-200'
                          )}>
                            <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                              {submission.user?.fullName || submission.user?.username || 'N/A'}
                            </td>
                            <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {submission.user?.email || 'N/A'}
                            </td>
                            <td className={cn('px-4 py-3 text-center text-sm font-medium', isDark ? 'text-white' : '')}>
                              {submission.score !== null ? `${submission.score}` : '-'}
                            </td>
                            <td className={cn('px-4 py-3 text-center')}>
                              {submission.status === 'PASSED' ? (
                                <Badge variant="default" className="bg-green-500">Đạt</Badge>
                              ) : submission.status === 'FAILED' ? (
                                <Badge variant="destructive" className="bg-red-500">Không đạt</Badge>
                              ) : (
                                <Badge variant="secondary">{submission.status}</Badge>
                              )}
                            </td>
                            <td className={cn('px-4 py-3 text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={cn(
                    "text-center py-8 rounded-lg border-2 border-dashed",
                    isDark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'
                  )}>
                    Chưa có lượt nộp nào
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
