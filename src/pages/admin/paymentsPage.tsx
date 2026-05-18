import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  KeyRound,
  Download,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  completedAt: string | null;
  user: { id: string; email: string; fullName: string };
  course: { id: string; title: string };
}

interface PaymentStats {
  totalAmount: number;
  pendingCount: number;
  completedCount: number;
  byMethod: Array<{
    paymentMethod: string;
    paymentStatus: string;
    _count: number;
    _sum: { amount: number | null };
  }>;
}

interface ActivateCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  usedAt: string | null;
  course: { id: string; title: string };
}

interface Course {
  id: string;
  title: string;
}

export default function AdminPaymentsPage() {
  const { isDark } = useAdmin();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [activateCodes, setActivateCodes] = useState<ActivateCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newCode, setNewCode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'codes'>('payments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [paymentsRes, statsRes, codesRes, coursesRes] = await Promise.all([
        fetch(API_ENDPOINTS.admin.payments, { headers }),
        fetch(API_ENDPOINTS.admin.paymentStats, { headers }),
        fetch(API_ENDPOINTS.admin.activateCodes, { headers }),
        fetch(API_ENDPOINTS.admin.courses, { headers }),
      ]);

      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();
      const codesData = await codesRes.json();
      const coursesData = await coursesRes.json();

      if (paymentsData.success) setPayments(paymentsData.data);
      if (statsData.success) setStats(statsData.data);
      if (codesData.success) setActivateCodes(codesData.data);
      if (coursesData.success) setCourses(coursesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!selectedCourseId) {
      alert('Vui lòng chọn khóa học');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.createCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: selectedCourseId }),
      });
      const data = await response.json();
      if (data.success) {
        setNewCode(data.data);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating code:', error);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.activateCodes}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setActivateCodes(activateCodes.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting code:', error);
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

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || payment.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Thành công
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Đang chờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Thất bại
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý dòng tiền</h1>
          <p className="text-slate-500">Quản lý thanh toán và mã kích hoạt</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Tổng doanh thu</p>
                <p className="text-2xl font-bold mt-2">
                  {formatPrice(stats?.totalAmount || 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Đã hoàn thành</p>
                <p className="text-4xl font-bold mt-2">{stats?.completedCount || 0}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Đang chờ</p>
                <p className="text-4xl font-bold mt-2">{stats?.pendingCount || 0}</p>
              </div>
              <Clock className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'payments'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Lịch sử thanh toán
        </button>
        <button
          onClick={() => setActiveTab('codes')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'codes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4 inline mr-2" />
          Mã kích hoạt
        </button>
      </div>

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã thanh toán</option>
              <option value="pending">Đang chờ</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Học sinh
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Khóa học
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Số tiền
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Phương thức
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Trạng thái
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">
                            {payment.user.fullName || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {payment.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{payment.course.title}</td>
                      <td className="py-4 px-4 font-medium text-primary">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-sm">
                          {payment.paymentMethod === 'qr' ? (
                            <>
                              <QrCode className="w-4 h-4 text-blue-500" />
                              QR Code
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-4 h-4 text-amber-500" />
                              Mã kích hoạt
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(payment.paymentStatus)}</td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có giao dịch nào</p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Activate Codes Tab */}
      {activeTab === 'codes' && (
        <>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setIsCodeModalOpen(true);
                setNewCode(null);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo mã mới
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Mã kích hoạt
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Khóa học
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Trạng thái
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Ngày tạo
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">
                      Ngày sử dụng
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-slate-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activateCodes.map((code) => (
                    <tr key={code.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm">
                          {code.code}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-sm">{code.course.title}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            code.isUsed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {code.isUsed ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Đã sử dụng
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Chưa sử dụng
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {formatDate(code.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {code.usedAt ? formatDate(code.usedAt) : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activateCodes.length === 0 && (
              <div className="text-center py-12">
                <KeyRound className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có mã kích hoạt nào</p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Create Code Modal */}
      <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo mã kích hoạt mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Khóa học</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Chọn khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {newCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-2">Mã kích hoạt đã được tạo:</p>
                <code className="text-2xl font-bold text-green-800">
                  {newCode.code}
                </code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCodeModalOpen(false)}>
              Đóng
            </Button>
            {!newCode && (
              <Button onClick={handleCreateCode} className="bg-primary hover:bg-primary/90">
                Tạo mã
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
