import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { API_ENDPOINTS } from '@/config/api';
import {
  ArrowLeft,
  Save,
  Shield,
  GraduationCap,
  Users,
  Loader2,
  UserCog,
  UserX,
  AlertTriangle,
  BookOpen,
  Plus,
  X,
  CheckCircle,
  Search,
  BookMarked,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { notification, Modal } from 'antd';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string | { id: string; name: string };
  avatar: string;
  school: string;
  phone: string;
  isOnboarded: boolean;
  isActive: boolean;
  createdAt: string;
  lectureCourses?: Array<{
    id: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      description: string;
      _count?: { enrollments: number };
    };
  }>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  _count?: { enrollments: number };
}

const roleOptions = [
  { value: 'user', label: 'Học sinh', icon: Users, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { value: 'lecture', label: 'Giảng viên', icon: GraduationCap, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { value: 'admin', label: 'Quản trị viên', icon: Shield, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
];

export default function UserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState<string | null>(null);

  // Course selection modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    school: '',
    role: 'user',
    isActive: true,
  });

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  useEffect(() => {
    // Fetch courses list when user is a lecture
    const userRole = getUserRole(user?.role);
    if (userRole === 'lecture' && user) {
      fetchCourses();
    }
  }, [user]);

  const getUserRole = (roleData: unknown): string => {
    if (!roleData) return 'user';
    if (typeof roleData === 'string') return roleData;
    if (typeof roleData === 'object' && roleData !== null) {
      const roleObj = roleData as { id?: string; name?: string };
      return roleObj.name || roleObj.id || 'user';
    }
    return 'user';
  };

  const fetchUser = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.users}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      console.log('Fetch user response:', data);
      if (data.success) {
        const userData = data.data;
        console.log('User data:', userData);
        setUser(userData);
        const normalizedRole = getUserRole(userData.role);
        setFormData({
          fullName: userData.fullName || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          school: userData.school || '',
          role: normalizedRole,
          isActive: userData.isActive !== false,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
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
      setLoadingCourses(false);
    }
  };

  const handleUnassignCourse = async (courseId: string) => {
    if (!userId) return;
    if (!confirm('Bạn có chắc muốn gỡ giảng viên khỏi khóa học này?')) {
      return;
    }
    setAssigningCourse(courseId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(userId, courseId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: 'Thành công',
          description: 'Đã gỡ giảng viên khỏi khóa học. Giảng viên sẽ nhận được thông báo.',
        });
        await fetchUser(userId);
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Không thể gỡ khóa học',
        });
      }
    } catch (error) {
      console.error('Error unassigning course:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi gỡ khóa học',
      });
    } finally {
      setAssigningCourse(null);
    }
  };

  // Open course selection modal
  const openCourseModal = () => {
    if (!loadingCourses && courses.length === 0) {
      fetchCourses();
    }
    setCourseModalOpen(true);
  };

  // Handle course selection from modal
  const handleSelectCourseFromModal = (course: Course) => {
    setSelectedCourseForAssign(course);
    setCourseModalOpen(false);
    setConfirmModalOpen(true);
  };

  // Confirm and assign course
  const handleConfirmAssign = async () => {
    if (!selectedCourseForAssign || !userId) return;
    
    setConfirmModalOpen(false);
    setAssigningCourse(selectedCourseForAssign.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(userId, selectedCourseForAssign.id), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: 'Thành công',
          description: `Đã chỉ định khóa học "${selectedCourseForAssign.title}" cho giảng viên. Giảng viên sẽ nhận được thông báo.`,
        });
        await fetchUser(userId);
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Không thể chỉ định khóa học',
        });
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi chỉ định khóa học',
      });
    } finally {
      setAssigningCourse(null);
      setSelectedCourseForAssign(null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật thông tin người dùng thành công!',
        });
        await fetchUser(userId);
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Không thể cập nhật thông tin',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi cập nhật thông tin',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (isActive: boolean) => {
    if (!userId) return;

    const action = isActive ? 'kích hoạt' : 'vô hiệu hóa';
    if (!confirm(`Bạn có chắc muốn ${action} người dùng này?`)) {
      return;
    }

    setDeactivating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, isActive }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, isActive });
        notification.success({
          message: 'Thành công',
          description: isActive ? 'Người dùng đã được kích hoạt!' : 'Người dùng đã bị vô hiệu hóa!',
        });
        await fetchUser(userId);
      }
    } catch (error) {
      console.error('Error toggling user active status:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Đã xảy ra lỗi khi cập nhật trạng thái',
      });
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          'p-6 flex items-center justify-center min-h-screen',
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        )}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={cn(
          'p-6 flex items-center justify-center min-h-screen',
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        )}
      >
        <div className="text-center">
          <p className={cn('text-lg font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Không tìm thấy người dùng
          </p>
          <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const currentRole = roleOptions.find((r) => r.value === formData.role) || roleOptions[0];
  const CurrentRoleIcon = currentRole.icon;
  const userRole = getUserRole(user.role);
  const isLecture = userRole === 'lecture';
  const assignedCourseIds = user.lectureCourses?.map((lc) => lc.courseId) || [];
  const assignedCourses = user.lectureCourses?.map((lc) => lc.course) || [];

  return (
    <div
      className={cn(
        'min-h-screen p-6 transition-colors duration-300',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className={cn(
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : ''
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Chỉnh sửa người dùng
            </h1>
            <p className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
              Cập nhật thông tin của {user.fullName || user.username}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className={cn(
              isDark
                ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300'
            )}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Preview */}
          <Card
            className={cn(
              'lg:col-span-1 p-6',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className={cn(
                  'w-28 h-28 ring-4',
                  formData.isActive ? 'ring-cyan-500/20' : 'ring-red-500/20'
                )}>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback
                    className={cn(
                      'text-2xl font-bold',
                      isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                    )}
                  >
                    {formData.fullName?.[0]?.toUpperCase() || formData.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!formData.isActive && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center border-2 border-slate-800">
                    <UserX className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <h2 className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                {formData.fullName || formData.username}
              </h2>
              <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                @{formData.username}
              </p>

              <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl', currentRole.bgColor)}>
                <CurrentRoleIcon className={cn('w-5 h-5', currentRole.color)} />
                <span className={cn('font-semibold', currentRole.color)}>{currentRole.label}</span>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div
                className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                    Trạng thái tài khoản
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      formData.isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    )}
                  >
                    {formData.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {formData.isActive ? 'Tài khoản đang hoạt động' : 'Tài khoản đã bị vô hiệu hóa'}
                  </span>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={handleToggleActive}
                    disabled={deactivating}
                  />
                </div>
                {!formData.isActive && (
                  <div className="mt-3 flex items-start gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                      Người dùng bị vô hiệu hóa sẽ không thể đăng nhập vào hệ thống
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats for Lecture */}
            {isLecture && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="text-center">
                  <div className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
                    isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'
                  )}>
                    <BookOpen className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
                    <span className={cn('font-semibold', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                      {assignedCourses.length} khóa học
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card
              className={cn(
                'p-6',
                !formData.isActive && (isDark ? 'opacity-60' : 'opacity-75')
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-6 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <UserCog className="w-5 h-5 text-cyan-500" />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Họ tên</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ tên"
                    disabled={!formData.isActive}
                    className={cn(
                      'h-12',
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500'
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Username</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Nhập username"
                    disabled={!formData.isActive}
                    className={cn(
                      'h-12',
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500'
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                    type="email"
                    disabled
                    className={cn(
                      'h-12',
                      isDark
                        ? 'bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  />
                  <p className="text-xs text-slate-400">Email không thể thay đổi</p>
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Số điện thoại</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    disabled={!formData.isActive}
                    className={cn(
                      'h-12',
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
                        : 'bg-slate-50 border-slate-200 focus:border-cyan-500'
                    )}
                  />
                </div>
              </div>
            </Card>

            {/* School Info */}
            <Card
              className={cn(
                'p-6',
                !formData.isActive && (isDark ? 'opacity-60' : 'opacity-75')
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-6 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <GraduationCap className="w-5 h-5 text-cyan-500" />
                Thông tin học tập
              </h3>

              <div className="space-y-2">
                <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Trường học</Label>
                <Input
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="Nhập tên trường học"
                  disabled={!formData.isActive}
                  className={cn(
                    'h-12',
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500'
                      : 'bg-slate-50 border-slate-200 focus:border-cyan-500'
                  )}
                />
              </div>
            </Card>

            {/* Role Selection */}
            <Card
              className={cn(
                'p-6',
                !formData.isActive && (isDark ? 'opacity-60' : 'opacity-75')
              )}
            >
              <h3
                className={cn(
                  'text-lg font-bold mb-6 flex items-center gap-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                <Shield className="w-5 h-5 text-cyan-500" />
                Phân quyền
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.role === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => formData.isActive && setFormData({ ...formData, role: option.value })}
                      disabled={!formData.isActive}
                      className={cn(
                        'relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200',
                        isSelected
                          ? 'border-cyan-500 ' + option.bgColor
                          : isDark
                            ? 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300',
                        !formData.isActive && 'cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          isSelected ? option.bgColor : 'bg-slate-200'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6',
                            isSelected ? option.color : isDark ? 'text-slate-500' : 'text-slate-400'
                          )}
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className={cn(
                            'font-semibold',
                            isSelected
                              ? option.color
                              : isDark
                                ? 'text-slate-300'
                                : 'text-slate-700'
                          )}
                        >
                          {option.label}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Course Assignment for Lectures */}
            {isLecture && (
              <Card
                className={cn(
                  'p-6',
                  !formData.isActive && (isDark ? 'opacity-60' : 'opacity-75')
                )}
              >
                <h3
                  className={cn(
                    'text-lg font-bold mb-4 flex items-center gap-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  <BookOpen className="w-5 h-5 text-cyan-500" />
                  Khóa học giảng dạy
                </h3>
                <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chỉ định khóa học cho giảng viên. Giảng viên sẽ nhận được thông báo khi được chỉ định hoặc gỡ khỏi khóa học.
                </p>

                {/* Assigned Courses */}
                {assignedCourses.length > 0 && (
                  <div className="mb-6">
                    <h4 className={cn('text-sm font-medium mb-3', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      Đang giảng dạy ({assignedCourses.length})
                    </h4>
                    <div className="space-y-3">
                      {assignedCourses.map((course) => (
                        <div
                          key={course.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-xl border',
                            isDark
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-emerald-50 border-emerald-200'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                            )}>
                              <BookOpen className={cn('w-5 h-5', isDark ? 'text-emerald-400' : 'text-emerald-600')} />
                            </div>
                            <div>
                              <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                                {course.title}
                              </p>
                              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                                {course._count?.enrollments || 0} học viên
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassignCourse(course.id)}
                            disabled={assigningCourse === course.id || !formData.isActive}
                            className={cn(
                              'gap-1',
                              isDark
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            )}
                          >
                            {assigningCourse === course.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Gỡ
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Course Button */}
                <div>
                  <Button
                    onClick={openCourseModal}
                    disabled={!formData.isActive || loadingCourses}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                  >
                    {loadingCourses ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Thêm khóa học
                  </Button>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/users/${userId}`)}
                className={cn(
                  'px-8',
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white'
                    : ''
                )}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.isActive}
                className="px-8 bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-cyan-500" />
            <span>Chọn khóa học</span>
          </div>
        }
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        footer={null}
        width={600}
        className={isDark ? 'dark-modal' : ''}
      >
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={courseSearchTerm}
            onChange={(e) => setCourseSearchTerm(e.target.value)}
            className={cn(
              'pl-10 h-11',
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                : 'bg-slate-50 border-slate-200'
            )}
          />
        </div>

        {/* Course List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loadingCourses ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
              <p className="mt-2 text-slate-500">Đang tải...</p>
            </div>
          ) : courses.filter(
            (c) =>
              !assignedCourseIds.includes(c.id) &&
              (c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(courseSearchTerm.toLowerCase()))
          ).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">
                {assignedCourseIds.length === courses.length
                  ? 'Tất cả khóa học đã được chỉ định'
                  : 'Không tìm thấy khóa học phù hợp'}
              </p>
            </div>
          ) : (
            courses
              .filter(
                (c) =>
                  !assignedCourseIds.includes(c.id) &&
                  (c.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                    c.description?.toLowerCase().includes(courseSearchTerm.toLowerCase()))
              )
              .map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
                    isDark
                      ? 'bg-slate-700/30 border-slate-600 hover:border-cyan-500/50 hover:bg-slate-700/50'
                      : 'bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                  )}
                  onClick={() => handleSelectCourseFromModal(course)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        isDark ? 'bg-slate-600' : 'bg-slate-100'
                      )}
                    >
                      <BookOpen
                        className={cn('w-6 h-6', isDark ? 'text-slate-400' : 'text-slate-500')}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {course.title}
                      </p>
                      <p
                        className={cn(
                          'text-xs line-clamp-1',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        {course._count?.enrollments || 0} học viên •{' '}
                        {course.level === 'beginner'
                          ? 'Người mới'
                          : course.level === 'intermediate'
                          ? 'Trung cấp'
                          : 'Nâng cao'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'gap-1',
                      isDark
                        ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                        : 'border-cyan-300 text-cyan-600 hover:bg-cyan-50'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Chọn
                  </Button>
                </div>
              ))
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-500" />
            <span>Xác nhận chỉ định</span>
          </div>
        }
        open={confirmModalOpen}
        onCancel={() => {
          setConfirmModalOpen(false);
          setSelectedCourseForAssign(null);
        }}
        onOk={handleConfirmAssign}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          className: 'bg-cyan-500 hover:bg-cyan-600',
        }}
        className={isDark ? 'dark-modal' : ''}
      >
        {selectedCourseForAssign && (
          <div className="py-4">
            <p className="mb-4">Bạn có chắc muốn chỉ định khóa học này cho giảng viên?</p>
            <div
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border',
                isDark
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-slate-50 border-slate-200'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  isDark ? 'bg-cyan-500/20' : 'bg-cyan-50'
                )}
              >
                <BookOpen className={cn('w-6 h-6', isDark ? 'text-cyan-400' : 'text-cyan-500')} />
              </div>
              <div>
                <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                  {selectedCourseForAssign.title}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {selectedCourseForAssign._count?.enrollments || 0} học viên
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Giảng viên sẽ nhận được thông báo về việc được chỉ định khóa học này.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
