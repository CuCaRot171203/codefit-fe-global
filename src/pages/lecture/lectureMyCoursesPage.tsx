import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLecture } from '@/contexts/LectureContext';
import { cn } from '@/lib/utils';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string | null;
  level: string;
  totalStudents: number;
  totalLessons: number;
  phases: {
    id: string;
    title: string;
    orderIndex: number;
  }[];
}

const LectureMyCoursesPage = () => {
  const { isDark } = useLecture();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.lecture.courses, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch courses');
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={cn(
          'text-2xl font-bold mb-2',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Khóa học của tôi
        </h1>
        <p className={cn(
          'text-sm',
          isDark ? 'text-slate-400' : 'text-slate-600'
        )}>
          Quản lý và theo dõi các khóa học được chỉ định cho bạn
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
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

      {/* Course List */}
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
            onClick={fetchCourses}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors',
              isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            )}
          >
            Thử lại
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className={cn(
          'flex flex-col items-center justify-center min-h-[300px] rounded-lg border-2 border-dashed',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-50'
        )}>
          <BookOpen className={cn('w-12 h-12 mb-4', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <p className={cn(
            'text-lg font-medium mb-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Không tìm thấy khóa học nào
          </p>
          <p className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}>
            Bạn chưa được chỉ định vào khóa học nào hoặc từ khóa tìm kiếm không phù hợp
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} to={`/lecture/my-courses/${course.id}`}>
              <Card className={cn(
                'h-full transition-all duration-200 hover:shadow-lg cursor-pointer group',
                isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:border-blue-300'
              )}>
                <div className="aspect-video bg-gradient-to-br from-[#0B3C5D] to-[#1a5c8a] rounded-t-lg flex items-center justify-center overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white/50" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className={cn(
                    'text-lg group-hover:text-blue-500 transition-colors line-clamp-1',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    'text-sm line-clamp-2 mb-4',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className={cn(
                        '',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}>
                        {course.totalStudents} học viên
                      </span>
                      <span className={cn(
                        '',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}>
                        {course.totalLessons} bài học
                      </span>
                    </div>
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

export default LectureMyCoursesPage;
