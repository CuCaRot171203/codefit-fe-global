import { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ConfirmModal } from '@/components/confirmModal';
import { Table, Tag, Button, Select as AntSelect, Modal } from 'antd';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalMinitests: number;
  totalHackathons: number;
  lectureCount: number;
  totalAmount: number;
  pendingCount: number;
  completedCount: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    user: { fullName: string; email: string };
    course: { title: string };
  }>;
  userStats: Array<{ role: string; count: number }>;
  recentUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    roleName: string;
    createdAt: string;
  }>;
  activeHackathons: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    participantCount: number;
    submissionCount: number;
  }>;
  topSubmissions: Array<{
    id: string;
    score: number;
    submittedAt: string;
    user: { id: string; fullName: string; avatar?: string };
    hackathon: { id: string; title: string };
  }>;
}

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdminDashboard() {
  const { isDark } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [paymentToCancel, setPaymentToCancel] = useState<string | null>(null);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<DashboardStats['recentPayments'][0] | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.dashboard, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cancelPayment = async () => {
    if (!paymentToCancel) return;
    setCancellingId(paymentToCancel);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.payments}/${paymentToCancel}/cancel`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recentPayments: prev.recentPayments.map((p) =>
              p.id === paymentToCancel ? { ...p, paymentStatus: 'failed' } : p
            ),
          };
        });
        setCancelModalOpen(false);
        setPaymentToCancel(null);
      }
    } catch (error) {
      console.error('Error cancelling payment:', error);
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelModal = (paymentId: string) => {
    setPaymentToCancel(paymentId);
    setCancelModalOpen(true);
  };

  const filteredPayments = useMemo(() => {
    let data = stats?.recentPayments || [];
    if (paymentFilter !== 'all') {
      data = data.filter((p) => p.paymentStatus === paymentFilter);
    }
    if (paymentSearch.trim()) {
      const q = paymentSearch.toLowerCase();
      data = data.filter(
        (p) =>
          p.user.fullName?.toLowerCase().includes(q) ||
          p.user.email?.toLowerCase().includes(q) ||
          p.course.title?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [stats?.recentPayments, paymentFilter, paymentSearch]);

  const getStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'ended';
  };

  if (loading) {
    return (
      <div className={cn("p-6 flex items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pieData = stats?.userStats.map((s) => ({
    name: s.role === 'STUDENT' ? 'Học sinh' : s.role === 'LECTURE' ? 'Giảng viên' : s.role,
    value: s.count,
  })) || [];

  const paymentPieData = stats
    ? [
        { name: 'Thành công', value: stats.completedCount },
        { name: 'Đang chờ', value: stats.pendingCount },
      ]
    : [];

  return (
    <div className={cn("p-6 space-y-6 min-h-screen transition-colors", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-3xl font-bold", isDark ? 'text-white' : 'text-primary')}>
            Dashboard
          </h1>
          <p className={cn("mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
            Tổng quan về hệ thống CodeFit
          </p>
        </div>
      </div>

      {/* Stats Cards - Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cn("border-0 shadow-md", isDark ? 'bg-slate-800' : '')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Tổng học sinh
                </p>
                <p className={cn("text-3xl font-bold mt-1", isDark ? 'text-white' : 'text-slate-900')}>
                  {stats?.totalUsers || 0}
                </p>
                <p className={cn("text-xs mt-1", isDark ? 'text-teal-400' : 'text-teal-600')}>
                  Người dùng đã đăng ký
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                isDark ? 'bg-teal-900/30' : 'bg-teal-100'
              )}>
                <Users className={cn("w-7 h-7", isDark ? 'text-teal-400' : 'text-teal-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-0 shadow-md", isDark ? 'bg-slate-800' : '')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Khóa học
                </p>
                <p className={cn("text-3xl font-bold mt-1", isDark ? 'text-white' : 'text-slate-900')}>
                  {stats?.totalCourses || 0}
                </p>
                <p className={cn("text-xs mt-1", isDark ? 'text-blue-400' : 'text-blue-600')}>
                  {stats?.totalLessons || 0} bài học
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
              )}>
                <BookOpen className={cn("w-7 h-7", isDark ? 'text-blue-400' : 'text-blue-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-0 shadow-md", isDark ? 'bg-slate-800' : '')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Lượt đăng ký
                </p>
                <p className={cn("text-3xl font-bold mt-1", isDark ? 'text-white' : 'text-slate-900')}>
                  {stats?.totalEnrollments || 0}
                </p>
                <p className={cn("text-xs mt-1", isDark ? 'text-purple-400' : 'text-purple-600')}>
                  {stats?.totalMinitests || 0} bài kiểm tra
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                isDark ? 'bg-purple-900/30' : 'bg-purple-100'
              )}>
                <GraduationCap className={cn("w-7 h-7", isDark ? 'text-purple-400' : 'text-purple-600')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-0 shadow-md", isDark ? 'bg-slate-800' : '')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Doanh thu
                </p>
                <p className={cn("text-2xl font-bold mt-1", isDark ? 'text-white' : 'text-slate-900')}>
                  {formatPrice(stats?.totalAmount || 0)}
                </p>
                <p className={cn("text-xs mt-1", isDark ? 'text-orange-400' : 'text-orange-600')}>
                  {stats?.totalHackathons || 0} hackathon
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                isDark ? 'bg-orange-900/30' : 'bg-orange-100'
              )}>
                <CreditCard className={cn("w-7 h-7", isDark ? 'text-orange-400' : 'text-orange-600')} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Stats by Role */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
              <Users className="w-5 h-5 text-primary" />
              Người dùng theo vai trò
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
              <CreditCard className="w-5 h-5 text-primary" />
              Trạng thái thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#0d9488" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {paymentPieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: index === 0 ? '#0d9488' : '#f59e0b' }}
                  />
                  <span className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
              <Users className="w-5 h-5 text-primary" />
              Người dùng mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={cn("border-b", isDark ? 'border-slate-700' : 'border-slate-200')}>
                    <th className={cn("text-left py-3 px-2 text-xs font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Người dùng
                    </th>
                    <th className={cn("text-left py-3 px-2 text-xs font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Vai trò
                    </th>
                    <th className={cn("text-left py-3 px-2 text-xs font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentUsers?.slice(0, 5).map((user) => (
                    <tr key={user.id} className={cn("border-b", isDark ? 'border-slate-700' : 'border-slate-100')}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                          )}>
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className={cn("font-medium text-sm", isDark ? 'text-white' : '')}>
                              {user.fullName || 'N/A'}
                            </p>
                            <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          user.roleName === 'LECTURE'
                            ? isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'
                            : isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                        )}>
                          {user.roleName === 'LECTURE' ? 'Giảng viên' : user.roleName === 'STUDENT' ? 'Học sinh' : user.roleName}
                        </span>
                      </td>
                      <td className={cn("py-3 px-2 text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                    <tr>
                      <td colSpan={3} className={cn("py-4 text-center", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Chưa có người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hackathon Leaderboard */}
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
              <Trophy className="w-5 h-5 text-primary" />
              Bảng xếp hạng Hackathon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topSubmissions?.slice(0, 5).map((submission, index) => (
                <div
                  key={submission.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                      ? 'bg-slate-400 text-white'
                      : index === 2
                      ? 'bg-orange-400 text-white'
                      : isDark
                      ? 'bg-slate-600 text-slate-300'
                      : 'bg-slate-200 text-slate-600'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm truncate", isDark ? 'text-white' : '')}>
                      {submission.user.fullName}
                    </p>
                    <p className={cn("text-xs truncate", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {submission.hackathon.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-bold text-lg", isDark ? 'text-primary' : 'text-primary')}>
                      {submission.score}
                    </p>
                    <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      điểm
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.topSubmissions || stats.topSubmissions.length === 0) && (
                <p className={cn("text-center py-4", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Chưa có bài nộp nào
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Hackathons */}
      <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
            <Trophy className="w-5 h-5 text-primary" />
            Hackathon gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn("border-b", isDark ? 'border-slate-700' : 'border-slate-200')}>
                  <th className={cn("text-left py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Tên hackathon
                  </th>
                  <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Trạng thái
                  </th>
                  <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Người tham gia
                  </th>
                  <th className={cn("text-center py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Bài nộp
                  </th>
                  <th className={cn("text-left py-3 px-4 text-sm font-medium", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.activeHackathons?.map((hackathon) => {
                  const status = getStatus(hackathon.startTime, hackathon.endTime);
                  return (
                    <tr key={hackathon.id} className={cn("border-b", isDark ? 'border-slate-700' : 'border-slate-100')}>
                      <td className={cn("py-3 px-4 font-medium", isDark ? 'text-white' : '')}>
                        {hackathon.title}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          status === 'active'
                            ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                            : status === 'upcoming'
                            ? isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                        )}>
                          {status === 'active' && <Play className="w-3 h-3" />}
                          {status === 'active' ? 'Đang diễn ra' : status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                        </span>
                      </td>
                      <td className={cn("py-3 px-4 text-center", isDark ? 'text-slate-300' : 'text-slate-600')}>
                        {hackathon.participantCount}
                      </td>
                      <td className={cn("py-3 px-4 text-center", isDark ? 'text-slate-300' : 'text-slate-600')}>
                        {hackathon.submissionCount}
                      </td>
                      <td className={cn("py-3 px-4 text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        {formatDate(hackathon.startTime)}
                      </td>
                    </tr>
                  );
                })}
                {(!stats?.activeHackathons || stats.activeHackathons.length === 0) && (
                  <tr>
                    <td colSpan={5} className={cn("py-4 text-center", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Chưa có hackathon nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
              <CreditCard className="w-5 h-5 text-primary" />
              Giao dịch gần đây
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Input
                placeholder="Tìm kiếm giao dịch..."
                value={paymentSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSearch(e.target.value)}
                className="w-52"
              />
              <AntSelect
                value={paymentFilter}
                onChange={(val) => setPaymentFilter(val)}
                className="w-36"
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'completed', label: 'Thành công' },
                  { value: 'pending', label: 'Đang chờ' },
                  { value: 'failed', label: 'Thất bại' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            dataSource={filteredPayments}
            rowKey="id"
            loading={loading}
            onRow={(record) => ({
              onClick: () => {
                setSelectedPayment(record);
                setDetailModalOpen(true);
              },
              style: { cursor: 'pointer' },
            })}
            pagination={{
              defaultPageSize: 5,
              pageSizeOptions: ['5', '10', '20', '50'],
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}–${range[1]} của ${total} giao dịch`,
            }}
            columns={[
              {
                title: 'Học sinh',
                key: 'user',
                render: (_, record) => (
                  <div>
                    <p className={cn("font-medium", isDark ? 'text-white' : '')}>
                      {record.user.fullName || 'N/A'}
                    </p>
                    <p className={cn("text-xs opacity-60", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {record.user.email}
                    </p>
                  </div>
                ),
                sorter: (a, b) => (a.user.fullName || '').localeCompare(b.user.fullName || ''),
              },
              {
                title: 'Khóa học',
                dataIndex: ['course', 'title'],
                key: 'course',
                ellipsis: true,
                sorter: (a, b) => (a.course.title || '').localeCompare(b.course.title || ''),
              },
              {
                title: 'Số tiền',
                dataIndex: 'amount',
                key: 'amount',
                render: (val) => (
                  <span className={cn("font-medium text-primary")}>
                    {formatPrice(val)}
                  </span>
                ),
                sorter: (a, b) => a.amount - b.amount,
              },
              {
                title: 'Trạng thái',
                dataIndex: 'paymentStatus',
                key: 'status',
                render: (status: string) => {
                  const map: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
                    completed: { color: 'green', label: 'Thành công', icon: <CheckCircle className="w-3 h-3" /> },
                    pending: { color: 'gold', label: 'Đang chờ', icon: <Clock className="w-3 h-3" /> },
                    failed: { color: 'red', label: 'Thất bại', icon: <XCircle className="w-3 h-3" /> },
                  };
                  const s = map[status] || map.pending;
                  return (
                    <Tag color={s.color} icon={s.icon} className="flex items-center w-fit gap-1">
                      {s.label}
                    </Tag>
                  );
                },
                filters: [
                  { text: 'Thành công', value: 'completed' },
                  { text: 'Đang chờ', value: 'pending' },
                  { text: 'Thất bại', value: 'failed' },
                ],
                onFilter: (value, record) => record.paymentStatus === value,
              },
              {
                title: 'Thời gian',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (val: string) => (
                  <span className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {formatDate(val)}
                  </span>
                ),
                sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                defaultSortOrder: 'descend',
              },
              {
                title: 'Hành động',
                key: 'action',
                align: 'center',
                render: (_, record) =>
                  record.paymentStatus === 'pending' && (
                    <Button
                      size="small"
                      danger
                      loading={cancellingId === record.id}
                      onClick={() => openCancelModal(record.id)}
                    >
                      Hủy
                    </Button>
                  ),
              },
            ]}
            locale={{
              emptyText: (
                <span className={cn("py-8 block", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Không có giao dịch nào
                </span>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Cancel Payment Confirmation Modal */}
      <ConfirmModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        title="Hủy giao dịch"
        description="Bạn có chắc muốn hủy giao dịch này? Hành động này không thể hoàn tác."
        onConfirm={cancelPayment}
        confirmText="Hủy giao dịch"
        cancelText="Không"
        variant="danger"
        loading={cancellingId !== null}
      />

      {/* Payment Detail Modal */}
      <Modal
        title={
          <span className={cn(isDark ? 'text-white' : '')}>
            Chi tiết giao dịch
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={
          selectedPayment?.paymentStatus === 'pending' ? (
            <div className="flex justify-between">
              <Button danger onClick={() => { setDetailModalOpen(false); openCancelModal(selectedPayment.id); }}>
                Hủy giao dịch
              </Button>
              <Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>
            </div>
          ) : (
            <Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>
          )
        }
        width={500}
      >
        {selectedPayment && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>ID giao dịch</p>
                <p className={cn("text-sm font-mono break-all", isDark ? 'text-slate-200' : 'text-slate-800')}>{selectedPayment.id}</p>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Phương thức</p>
                <p className={cn("text-sm", isDark ? 'text-slate-200' : 'text-slate-800')}>{selectedPayment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Học sinh</p>
                <p className={cn("text-sm font-medium", isDark ? 'text-white' : 'text-slate-900')}>{selectedPayment.user.fullName || 'N/A'}</p>
                <p className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>{selectedPayment.user.email}</p>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Khóa học</p>
                <p className={cn("text-sm", isDark ? 'text-slate-200' : 'text-slate-800')}>{selectedPayment.course.title}</p>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Số tiền</p>
                <p className={cn("text-lg font-bold text-primary")}>{formatPrice(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Trạng thái</p>
                <div className="mt-0.5">
                  {selectedPayment.paymentStatus === 'completed' && (
                    <Tag color="green" icon={<CheckCircle className="w-3 h-3" />}>Thành công</Tag>
                  )}
                  {selectedPayment.paymentStatus === 'pending' && (
                    <Tag color="gold" icon={<Clock className="w-3 h-3" />}>Đang chờ</Tag>
                  )}
                  {selectedPayment.paymentStatus === 'failed' && (
                    <Tag color="red" icon={<XCircle className="w-3 h-3" />}>Thất bại</Tag>
                  )}
                </div>
              </div>
              <div>
                <p className={cn("text-xs font-medium mb-1", isDark ? 'text-slate-400' : 'text-slate-500')}>Ngày tạo</p>
                <p className={cn("text-sm", isDark ? 'text-slate-200' : 'text-slate-800')}>{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
