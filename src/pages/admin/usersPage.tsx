import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import {
  Users,
  Search,
  Trash2,
  Shield,
  GraduationCap,
  Loader2,
  UserCog,
  Eye,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Table } from 'antd';
import type { TableProps } from 'antd';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: { id: string; name: string } | string;
  avatar: string;
  school: string;
  phone: string;
  isOnboarded: boolean;
  isActive: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    submissions: number;
  };
}

const roleOptions = [
  { value: 'user', label: 'Học sinh', color: 'default' },
  { value: 'lecture', label: 'Giảng viên', color: 'info' },
  { value: 'admin', label: 'Admin', color: 'purple' },
];

export default function AdminUsersPage() {
  const { isDark } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.users, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.users}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle role as both string and object { id, name }
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name || user.role?.id || 'user';
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getRoleBadge = (role: string | { name: string }) => {
    // Normalize role: handle both string and object { id, name }
    const roleName = typeof role === 'string' ? role : role?.name || 'user';
    const roleData = roleOptions.find((r) => r.value === roleName) || roleOptions[0];
    const colorClasses: Record<string, string> = {
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      lecture: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      default: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    const iconClass = roleName === 'admin' ? Shield : roleName === 'lecture' ? GraduationCap : Users;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
          colorClasses[roleName] || colorClasses.default
        )}
      >
        {iconClass && <iconClass className="w-3 h-3" />}
        {roleData.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          isActive
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-red-400')} />
        {isActive ? 'Hoạt động' : 'Dừng'}
      </span>
    );
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

  return (
    <div
      className={cn(
        'p-6 min-h-screen transition-colors duration-300',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'
            )}
          >
            <UserCog className={cn('w-7 h-7', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
          </div>
          <div>
            <h1 className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Quản lý người dùng
            </h1>
            <p className={cn(isDark ? 'text-slate-400' : 'text-slate-500')}>
              Tổng cộng {users.length} người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card
        className={cn(
          'p-4 mb-6',
          isDark
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-slate-200'
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5',
                isDark ? 'text-slate-400' : 'text-slate-400'
              )}
            />
            <Input
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'pl-10 h-11',
                isDark
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500'
                  : 'bg-slate-50 border-slate-200'
              )}
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Vai trò:
            </span>
            {[{ value: 'all', label: 'Tất cả' }, ...roleOptions].map((option) => (
              <button
                key={option.value}
                onClick={() => setRoleFilter(option.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  roleFilter === option.value
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : isDark
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card
        className={cn(
          'overflow-hidden',
          isDark
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-slate-200'
        )}
      >
        <Table
          loading={loading}
          dataSource={filteredUsers.map((user) => ({ key: user.id, ...user }))}
          pagination={{
            pageSize: PAGE_SIZE,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} trong ${total} người dùng`,
          }}
          sortDirections={['descend', 'ascend']}
          columns={[
            {
              title: 'Người dùng',
              key: 'user',
              sorter: (a: any, b: any) =>
                (a.fullName || a.username || '').localeCompare(b.fullName || b.username || ''),
              render: (_: any, record: User) => (
                <div className="flex items-center gap-4">
                  <Avatar
                    className={cn('w-11 h-11 ring-2', isDark ? 'ring-slate-600' : 'ring-slate-200')}
                  >
                    <AvatarImage src={record.avatar} />
                    <AvatarFallback
                      className={cn(
                        'font-semibold text-sm',
                        isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                      )}
                    >
                      {record.fullName?.[0]?.toUpperCase() || record.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                      {record.fullName || record.username}
                    </p>
                    <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {record.email}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: 'Vai trò',
              key: 'role',
              sorter: (a: any, b: any) => {
                const ra = typeof a.role === 'string' ? a.role : a.role?.name || '';
                const rb = typeof b.role === 'string' ? b.role : b.role?.name || '';
                return ra.localeCompare(rb);
              },
              render: (_: any, record: User) => getRoleBadge(record.role),
            },
            {
              title: 'Trường',
              key: 'school',
              sorter: (a: any, b: any) =>
                (a.school || '').localeCompare(b.school || ''),
              render: (_: any, record: User) => (
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
                  {record.school || '-'}
                </span>
              ),
            },
            {
              title: 'Trạng thái',
              key: 'isActive',
              sorter: (a: any, b: any) => (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0),
              render: (_: any, record: User) => getStatusBadge(record.isActive !== false),
            },
            {
              title: 'Khóa học',
              key: 'enrollments',
              sorter: (a: any, b: any) =>
                (a._count?.enrollments || 0) - (b._count?.enrollments || 0),
              render: (_: any, record: User) => (
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {record._count?.enrollments || 0} khóa học
                </span>
              ),
            },
            {
              title: 'Ngày tham gia',
              key: 'createdAt',
              sorter: (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              defaultSortOrder: 'descend' as const,
              render: (_: any, record: User) => (
                <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {formatDate(record.createdAt)}
                </span>
              ),
            },
            {
              title: 'Thao tác',
              key: 'actions',
              align: 'right' as const,
              render: (_: any, record: User) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${record.id}`)}
                    className={cn(
                      'gap-2',
                      isDark
                        ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
                        : 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-500/10'
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className={cn(
                      'gap-2',
                      isDark
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-500/10'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </Button>
                </div>
              ),
            },
          ]}
        />

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4',
                isDark ? 'bg-slate-700/50' : 'bg-slate-100'
              )}
            >
              <Users
                className={cn('w-10 h-10', isDark ? 'text-slate-500' : 'text-slate-400')}
              />
            </div>
            <p className={cn('text-lg font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Không tìm thấy người dùng nào
            </p>
            <p className={cn('text-sm mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
