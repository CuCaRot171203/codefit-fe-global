import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  UserCog,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Users,
  Loader2,
  Plus,
} from 'lucide-react';

interface Instructor {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  role?: {
    id: string;
    name: string;
  };
  _count?: {
    enrollments: number;
    submissions: number;
    courses: number;
  };
}

export default function AdminInstructorsPage() {
  const { isDark } = useAdmin();
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.users, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        // Filter only users with role 'lecture' or 'admin'
        const filteredInstructors = data.data.filter(
          (user: any) => user.role?.name === 'lecture' || user.role?.name === 'admin'
        );
        setInstructors(filteredInstructors);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa giảng viên này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.users}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setInstructors(instructors.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting instructor:', error);
    }
  };

  const filteredInstructors = instructors.filter(
    (instructor) =>
      instructor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? 'text-white' : 'text-primary'
          )}>Quản lý giảng viên</h1>
          <p className={cn(
            "mt-1",
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>Tổng cộng {instructors.length} giảng viên</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className={cn(
            "bg-primary hover:bg-primary/90",
            isDark ? 'text-white' : ''
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm giảng viên
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
          isDark ? 'text-slate-400' : 'text-slate-400'
        )} />
        <Input
          placeholder="Tìm kiếm giảng viên..."
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

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstructors.map((instructor) => (
          <Card
            key={instructor.id}
            className={cn(
              "overflow-hidden transition-all border",
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white'
            )}
          >
            <CardHeader className={cn(
              "pb-2",
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {instructor.fullName?.[0] || instructor.username?.[0] || 'I'}
                  </div>
                  <div>
                    <CardTitle className={cn(
                      "text-lg",
                      isDark ? 'text-white' : ''
                    )}>
                      {instructor.fullName || instructor.username}
                    </CardTitle>
                    <p className={cn(
                      "text-sm",
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      @{instructor.username}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  instructor.role?.name === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700',
                  isDark && instructor.role?.name === 'admin'
                    ? 'bg-purple-900/50 text-purple-400'
                    : '',
                  isDark && instructor.role?.name === 'lecture'
                    ? 'bg-blue-900/50 text-blue-400'
                    : ''
                )}>
                  {instructor.role?.name === 'admin' ? 'Admin' : 'Giảng viên'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className={cn(
                "flex items-center gap-2 text-sm",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                <Mail className="w-4 h-4" />
                <span className="truncate">{instructor.email}</span>
              </div>
              {instructor.phone && (
                <div className={cn(
                  "flex items-center gap-2 text-sm",
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}>
                  <Phone className="w-4 h-4" />
                  <span>{instructor.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 text-sm">
                  <BookOpen className={cn(
                    "w-4 h-4",
                    isDark ? 'text-green-400' : 'text-green-500'
                  )} />
                  <span className={isDark ? 'text-slate-300' : ''}>
                    {instructor._count?.courses || 0} khóa học
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Users className={cn(
                    "w-4 h-4",
                    isDark ? 'text-blue-400' : 'text-blue-500'
                  )} />
                  <span className={isDark ? 'text-slate-300' : ''}>
                    {instructor._count?.enrollments || 0} học sinh
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/instructors/${instructor.id}`)}
                  className={cn(
                    "flex-1",
                    isDark
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : ''
                  )}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(instructor.id)}
                  className={cn(
                    isDark
                      ? 'border-slate-600 text-red-400 hover:bg-red-900/20'
                      : 'text-red-500 hover:text-red-600'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className={cn(
          "text-center py-12",
          isDark ? 'text-slate-400' : ''
        )}>
          <UserCog className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {searchTerm ? 'Không tìm thấy giảng viên nào' : 'Chưa có giảng viên nào'}
          </p>
        </div>
      )}
    </div>
  );
}
