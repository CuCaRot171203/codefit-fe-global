import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  ChevronRight,
  Video,
  Code,
  GraduationCap,
  Loader2,
  FileText,
  ListChecks,
  ExternalLink,
} from 'lucide-react';

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons?: Lesson[];
  _count?: { lessons: number; minitests: number };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  orderIndex: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  level: string;
  image: string;
  duration: string;
  creator?: { fullName: string; email: string };
  phases?: Phase[];
  _count: { enrollments: number; phases: number };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = async (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      // Fetch full course details
      if (!courses.find(c => c.id === courseId)?.phases) {
        setLoadingDetails(prev => new Set(prev).add(courseId));
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_ENDPOINTS.admin.courses}/${courseId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await response.json();
          if (data.success) {
            setCourses(prev => prev.map(c => 
              c.id === courseId ? { ...c, phases: data.data.phases } : c
            ));
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        } finally {
          setLoadingDetails(prev => {
            const next = new Set(prev);
            next.delete(courseId);
            return next;
          });
        }
      }
      newExpanded.add(courseId);
    }
    
    setExpandedCourses(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.courses}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Nâng cao';
      default:
        return level;
    }
  };

  const getLessonIcon = (type: string) => {
    return type === 'video' 
      ? <Video className="w-4 h-4 text-blue-500" />
      : <Code className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className={cn(
        "p-6 flex items-center justify-center min-h-screen",
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <span className={cn(
            "text-sm",
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 lg:p-6 space-y-6 min-h-screen transition-colors duration-300",
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? 'text-white' : 'text-primary'
          )}>Quản lý khóa học</h1>
          <p className={cn(
            "mt-1",
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>Tổng cộng {courses.length} khóa học</p>
        </div>
        <Button
          onClick={() => navigate('/admin/courses/new')}
          className={cn(
            "bg-primary hover:bg-primary/90",
            isDark ? 'text-white' : ''
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm khóa học
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
          isDark ? 'text-slate-400' : 'text-slate-400'
        )} />
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "pl-10",
            isDark
              ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400'
              : ''
          )}
        />
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className={cn(
              "overflow-hidden transition-all border",
              expandedCourses.has(course.id)
                ? 'ring-2 ring-primary'
                : '',
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white'
            )}
          >
            {/* Course Row */}
            <div
              className={cn(
                "flex items-center gap-3 lg:gap-4 p-3 lg:p-4 cursor-pointer transition-colors",
                isDark
                  ? 'hover:bg-slate-700'
                  : 'hover:bg-slate-50'
              )}
              onClick={() => toggleCourse(course.id)}
            >
              {/* Expand Icon */}
              <div className="flex-shrink-0">
                {loadingDetails.has(course.id) ? (
                  <Loader2 className={cn(
                    "w-5 h-5 animate-spin",
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  )} />
                ) : expandedCourses.has(course.id) ? (
                  <ChevronDown className={cn(
                    "w-5 h-5",
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  )} />
                ) : (
                  <ChevronRight className={cn(
                    "w-5 h-5",
                    isDark ? 'text-slate-400' : 'text-slate-400'
                  )} />
                )}
              </div>

              {/* Image */}
              <div className="flex-shrink-0 w-16 h-12 lg:w-24 lg:h-16 rounded-lg overflow-hidden">
                <img
                  src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={cn(
                    "font-bold text-base lg:text-lg truncate",
                    isDark ? 'text-white' : ''
                  )}>{course.title}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    getLevelColor(course.level),
                    isDark && course.level === 'beginner' ? 'bg-green-900/50 text-green-400' : '',
                    isDark && course.level === 'intermediate' ? 'bg-amber-900/50 text-amber-400' : '',
                    isDark && course.level === 'advanced' ? 'bg-red-900/50 text-red-400' : ''
                  )}>
                    {getLevelText(course.level)}
                  </span>
                </div>
                <p className={cn(
                  "text-sm line-clamp-1 hidden sm:block",
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}>{course.description}</p>
                <div className={cn(
                  "flex items-center gap-3 lg:gap-4 mt-2 text-xs",
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course._count.enrollments} học sinh
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course._count.phases} chương
                  </span>
                  {course.creator && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {course.creator.fullName}
                    </span>
                  )}
                  {course.duration && (
                    <span className="hidden md:inline">{course.duration}</span>
                  )}
                </div>
              </div>

              {/* Price - Hidden on mobile */}
              <div className="flex-shrink-0 text-right hidden md:block">
                <span className={cn(
                  "text-lg lg:text-xl font-bold",
                  isDark ? 'text-white' : 'text-primary'
                )}>
                  {formatPrice(course.price)}
                </span>
                {course.originalPrice > course.price && (
                  <span className={cn(
                    "block text-xs line-through",
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}>
                    {formatPrice(course.originalPrice)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex-shrink-0 flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                  className={cn(
                    "hover:bg-primary/10",
                    isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
                  )}
                  title="Sửa thông tin khóa học"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                {/* Add Content Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const url = `/admin/courses/${course.id}/content`;
                    window.open(url, '_blank');
                  }}
                  className={cn(
                    "hover:bg-primary/10",
                    isDark ? 'text-green-400 hover:text-green-300' : 'text-green-500 hover:text-green-600'
                  )}
                  title="Thêm nội dung bài học"
                >
                  <FileText className="w-4 h-4" />
                </Button>

                {/* Content/Code/Testcases Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const url = `/admin/courses/${course.id}/editor`;
                    window.open(url, '_blank');
                  }}
                  className={cn(
                    "hover:bg-primary/10",
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-500 hover:text-purple-600'
                  )}
                  title="Quản lý nội dung/code/testcases"
                >
                  <ListChecks className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(course.id)}
                  className={cn(
                    "hover:bg-red-50",
                    isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-500 hover:text-red-600'
                  )}
                  title="Xóa khóa học"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedCourses.has(course.id) && (
              <div className={cn(
                "border-t p-4",
                isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50'
              )}>
                {/* Course Description */}
                <div className="mb-4">
                  <h4 className={cn(
                    "font-medium text-sm mb-1",
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}>Nội dung tổng quát:</h4>
                  <p className={cn(
                    "text-sm",
                    isDark ? 'text-slate-300' : ''
                  )}>{course.description}</p>
                </div>

                {/* Phases & Lessons */}
                {course.phases && course.phases.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className={cn(
                      "font-medium text-sm",
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      Nội dung khóa học ({course.phases.length} chương):
                    </h4>
                    {course.phases.map((phase, pIndex) => (
                      <div
                        key={phase.id}
                        className={cn(
                          "rounded-lg p-3",
                          isDark ? 'bg-slate-700' : 'bg-white'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "font-medium",
                            isDark ? 'text-white' : ''
                          )}>Chương {pIndex + 1}:</span>
                          <span className={isDark ? 'text-slate-300' : ''}>{phase.title}</span>
                          <span className={cn(
                            "text-xs",
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          )}>
                            ({phase._count?.lessons || phase.lessons?.length || 0} bài học)
                          </span>
                        </div>

                        {phase.lessons && phase.lessons.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {phase.lessons.map((lesson, lIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                {getLessonIcon(lesson.type)}
                                <span className={isDark ? 'text-slate-300' : ''}>Bài {lIndex + 1}:</span>
                                <span className={isDark ? 'text-slate-300' : ''}>{lesson.title}</span>
                                <span className={cn(
                                  "text-xs capitalize",
                                  isDark ? 'text-slate-500' : 'text-slate-400'
                                )}>
                                  ({lesson.type === 'video' ? 'Video' : 'Code'})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn(
                    "text-sm",
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}>Chưa có nội dung bài học nào</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className={cn(
          "text-center py-12",
          isDark ? 'text-slate-400' : ''
        )}>
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Không tìm thấy khóa học nào</p>
        </div>
      )}
    </div>
  );
}
