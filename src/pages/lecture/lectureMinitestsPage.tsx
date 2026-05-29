import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLecture } from '@/contexts/LectureContext';
import { cn } from '@/lib/utils';
import { Target, Loader2, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';

interface Minitest {
  id: string;
  title: string;
  courseName: string;
  totalAttempts: number;
  avgScore: number;
  createdAt: string;
}

const LectureMinitestsPage = () => {
  const { isDark } = useLecture();
  const [minitests, setMinitests] = useState<Minitest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMinitests();
  }, []);

  const fetchMinitests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.lecture.minitests, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch minitests');
      }

      const result = await response.json();
      if (result.success) {
        setMinitests(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch minitests');
      }
    } catch (err: any) {
      console.error('Error fetching minitests:', err);
      setError(err.message || 'Failed to load minitests');
    } finally {
      setLoading(false);
    }
  };

  const filteredMinitests = minitests.filter(minitest =>
    minitest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minitest.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={cn(
          'text-2xl font-bold mb-2',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Minitest
        </h1>
        <p className={cn(
          'text-sm',
          isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          Quản lý bài kiểm tra nhỏ trong các khóa học được chỉ định
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm minitest..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            'w-full md:w-96 px-4 py-2 rounded-lg border transition-colors',
            isDark 
              ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500' 
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
          )}
        />
      </div>

      {/* Minitest List */}
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
            onClick={fetchMinitests}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            )}
          >
            Thử lại
          </button>
        </div>
      ) : filteredMinitests.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
        )}>
          <Target className={cn('w-12 h-12 mb-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <p className={cn(
            'text-lg font-medium mb-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Không tìm thấy minitest nào
          </p>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Chưa có bài kiểm tra nào được tạo trong khóa học của bạn
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMinitests.map((minitest) => (
            <Link key={minitest.id} to={`/lecture/minitests/${minitest.id}`}>
              <Card className={cn(
                'h-full transition-all duration-200 hover:shadow-lg cursor-pointer group',
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 hover:border-blue-300'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={cn(
                        'text-lg group-hover:text-blue-500 transition-colors mb-1',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}>
                        {minitest.title}
                      </CardTitle>
                      <p className={cn(
                        'text-sm',
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      )}>
                        {minitest.courseName}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Đã đăng
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Target className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {minitest.totalAttempts} lượt
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        TB: {minitest.avgScore}%
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

export default LectureMinitestsPage;
