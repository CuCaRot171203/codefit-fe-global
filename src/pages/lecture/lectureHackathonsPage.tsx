import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLecture } from '@/contexts/LectureContext';
import { cn } from '@/lib/utils';
import { Trophy, ChevronRight, Loader2, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_ENDPOINTS } from '@/config/api';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  totalTeams: number;
  avgScore: number;
}

const LectureHackathonsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useLecture();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(API_ENDPOINTS.lecture.hackathons, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hackathons');
      }

      const result = await response.json();
      if (result.success) {
        setHackathons(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch hackathons');
      }
    } catch (err: any) {
      console.error('Error fetching hackathons:', err);
      setError(err.message || 'Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemainingValue = (endTime: string): number | null => {
    try {
      const end = new Date(endTime);
      const now = new Date();
      return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    // Search
    if (searchTerm && !hackathon.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && hackathon.status !== statusFilter) {
      return false;
    }

    // Priority filter (based on endTime proximity)
    if (priorityFilter !== 'all') {
      const days = getDaysRemainingValue(hackathon.endTime);
      if (priorityFilter === 'high' && days !== null && days >= -3) return false;
      if (priorityFilter === 'medium' && (days === null || days < -3 || days > 7)) return false;
      if (priorityFilter === 'low' && (days === null || days <= 7)) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default" className="bg-blue-600">Sắp diễn ra</Badge>;
      case 'ongoing':
        return <Badge variant="default" className="bg-green-600">Đang diễn ra</Badge>;
      case 'ended':
        return <Badge variant="secondary" className="bg-slate-500">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={cn(
          'text-2xl font-bold mb-2',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Hackathon
        </h1>
        <p className={cn(
          'text-sm',
          isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          Quản lý các cuộc thi hackathon trong các khóa học được chỉ định
        </p>
      </div>

      {/* Filter Tabs + Search */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Status + Priority Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Status Filter */}
          <div>
            <p className={cn('text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>Trạng thái</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'upcoming', label: 'Sắp diễn ra' },
                { value: 'ongoing', label: 'Đang diễn ra' },
                { value: 'ended', label: 'Đã kết thúc' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    statusFilter === opt.value
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <p className={cn('text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>Mức ưu tiên</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'high', label: 'Cao' },
                { value: 'medium', label: 'Trung bình' },
                { value: 'low', label: 'Thấp' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriorityFilter(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    priorityFilter === opt.value
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <p className={cn('text-xs font-medium mb-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>Tìm kiếm</p>
          <input
            type="text"
            placeholder="Tìm kiếm hackathon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full px-4 py-2 rounded-lg border transition-colors',
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none'
            )}
          />
        </div>
      </div>

      {/* Hackathon List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
        </div>
      ) : error ? (
        <div className={cn(
          'flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed',
          isDark ? 'border-red-700 bg-red-900/20' : 'border-red-300 bg-red-50'
        )}>
          <p className={cn(
            'text-lg font-medium mb-2 text-red-500',
            isDark ? 'text-red-400' : 'text-red-600'
          )}>
            {error}
          </p>
          <button
            onClick={fetchHackathons}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            )}
          >
            Thử lại
          </button>
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
        )}>
          <Trophy className={cn('w-12 h-12 mb-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <p className={cn(
            'text-lg font-medium mb-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Không tìm thấy hackathon nào
          </p>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Chưa có cuộc thi hackathon nào được tạo trong khóa học của bạn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <Link key={hackathon.id} to={`/lecture/hackathons/${hackathon.id}`}>
              <Card className={cn(
                'h-full transition-all duration-200 hover:shadow-lg cursor-pointer group',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 hover:border-blue-300'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className={cn('w-8 h-8', isDark ? 'text-yellow-400' : 'text-yellow-500')} />
                    {getStatusBadge(hackathon.status)}
                  </div>
                  <CardTitle className={cn(
                    'text-lg group-hover:text-blue-500 transition-colors',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {hackathon.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    'text-sm line-clamp-2 mb-4',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {hackathon.description}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(hackathon.startTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {hackathon.totalTeams} đội
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <ChevronRight className={cn(
                      'w-5 h-5 transition-transform group-hover:translate-x-1',
                      isDark ? 'text-slate-400' : 'text-slate-400'
                    )} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LectureHackathonsPage;
