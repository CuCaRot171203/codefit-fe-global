import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Modal, message, Table } from 'antd';
import { Trophy, Search, Edit, Trash2, Plus, Loader2, Calendar, Users, Clock, Play, LayoutGrid, List, Eye, X } from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  maxParticipants?: number;
  durationMinutes?: number;
  problems?: any[];
  course?: { id: string; title: string };
  status?: 'upcoming' | 'active' | 'ended';
  _count?: { participants: number; submissions: number };
}

export default function AdminHackathonsPage() {
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [, setEditLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    durationMinutes: 120,
    maxParticipants: 100,
    imageUrl: '',
  });

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.hackathons, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        const hackathonsWithStatus = (data.data || []).map((h: any) => {
          const now = new Date();
          const start = new Date(h.startTime);
          const end = new Date(h.endTime);
          let status: 'upcoming' | 'active' | 'ended' = 'ended';
          if (now < start) status = 'upcoming';
          else if (now >= start && now <= end) status = 'active';
          return { ...h, status };
        });
        setHackathons(hackathonsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEdit = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setEditForm({
      title: hackathon.title,
      description: hackathon.description,
      startTime: hackathon.startTime,
      endTime: hackathon.endTime,
      durationMinutes: hackathon.durationMinutes || 120,
      maxParticipants: hackathon.maxParticipants || 100,
      imageUrl: hackathon.imageUrl || '',
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedHackathon) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.hackathon(selectedHackathon.id), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setHackathons(hackathons.filter(h => h.id !== selectedHackathon.id));
      setDeleteModalOpen(false);
      message.success('Xóa hackathon thành công');
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      message.error('Xóa thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedHackathon) return;
    if (!editForm.title || !editForm.description) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: editForm.title,
        description: editForm.description,
        startTime: new Date(editForm.startTime).toISOString(),
        endTime: new Date(editForm.endTime).toISOString(),
        durationMinutes: editForm.durationMinutes,
        maxParticipants: editForm.maxParticipants,
        imageUrl: editForm.imageUrl || undefined,
      };
      const response = await fetch(API_ENDPOINTS.admin.hackathon(selectedHackathon.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Cập nhật thành công');
        setEditModalOpen(false);
        fetchHackathons();
      }
    } catch (error) {
      console.error('Error updating hackathon:', error);
      message.error('Cập nhật thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedHackathons = filteredHackathons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    const darkClasses = isDark
      ? status === 'active'
        ? 'bg-green-900/50 text-green-400'
        : status === 'upcoming'
        ? 'bg-blue-900/50 text-blue-400'
        : 'bg-slate-700 text-slate-400'
      : status === 'active'
      ? 'bg-green-100 text-green-700'
      : status === 'upcoming'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-slate-100 text-slate-600';

    return (
      <span className={cn(baseClasses, darkClasses)}>
        {status === 'active' && <Play className="w-3 h-3" />}
        {status === 'upcoming' && <Clock className="w-3 h-3" />}
        {status === 'active' ? 'Đang diễn ra' : status === 'upcoming' ? 'Sắp diễn ra' : 'Đã kết thúc'}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Modal styles based on theme
  const modalStyles = {
    mask: { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' },
    content: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    header: { color: isDark ? '#f1f5f9' : '#1e293b' },
    body: { color: isDark ? '#cbd5e1' : '#475569' },
  };

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
          )}>Quản lý Hackathon</h1>
          <p className={cn("mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
            Tổng cộng {filteredHackathons.length} hackathon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={cn(
              viewMode === 'grid' ? 'border-cyan-500 text-cyan-500' : '',
              isDark ? 'border-slate-600' : ''
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              viewMode === 'list' ? 'border-cyan-500 text-cyan-500' : '',
              isDark ? 'border-slate-600' : ''
            )}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate('/admin/hackathons/create')}
            className={cn("bg-primary hover:bg-primary/90 ml-2", isDark ? 'text-white' : '')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Hackathon
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className={cn(
        "border",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
      )}>
        <CardContent className="pt-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                isDark ? 'text-slate-400' : 'text-slate-400'
              )} />
              <Input
                placeholder="Tìm kiếm hackathon..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={cn(
                  "pl-10",
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    : ''
                )}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'active', label: 'Đang diễn ra' },
                { value: 'upcoming', label: 'Sắp diễn ra' },
                { value: 'ended', label: 'Đã kết thúc' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    statusFilter === opt.value
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Clear */}
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCurrentPage(1); }}
                className="text-cyan-500 hover:text-cyan-400 shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hackathons Grid / List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className={cn('w-10 h-10 animate-spin text-primary')} />
        </div>
      ) : filteredHackathons.length === 0 ? (
        <div className={cn("text-center py-16", isDark ? 'text-slate-400' : '')}>
          <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hackathon nào' : 'Chưa có hackathon nào'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedHackathons.map((hackathon) => (
              <Card
                key={hackathon.id}
                className={cn(
                  "overflow-hidden transition-all border",
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}
              >
                <CardHeader className={cn("pb-3", isDark ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        hackathon.status === 'active'
                          ? 'bg-primary/10'
                          : hackathon.status === 'upcoming'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-slate-100 dark:bg-slate-700'
                      )}>
                        <Trophy className={cn(
                          "w-6 h-6",
                          hackathon.status === 'active'
                            ? 'text-primary'
                            : hackathon.status === 'upcoming'
                            ? 'text-blue-500 dark:text-blue-400'
                            : 'text-slate-400'
                        )} />
                      </div>
                      <div>
                        <CardTitle className={cn("text-lg mb-1", isDark ? 'text-white' : '')}>
                          {hackathon.title}
                        </CardTitle>
                        {getStatusBadge(hackathon.status || 'ended')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(hackathon)}
                        className={cn(isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(hackathon)}
                        className={cn(isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <p className={cn("text-sm line-clamp-2", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {hackathon.description}
                  </p>
                  <div className={cn("flex items-center gap-1 text-sm pt-2 border-t", isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200')}>
                    <Calendar className="w-4 h-4" />
                    <span>Bắt đầu: {formatDate(hackathon.startTime)}</span>
                  </div>
                  <div className={cn("flex items-center gap-1 text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    <Clock className="w-4 h-4" />
                    <span>Kết thúc: {formatDate(hackathon.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className={cn("w-4 h-4", isDark ? 'text-purple-400' : 'text-purple-500')} />
                      <span className={isDark ? 'text-slate-300' : ''}>
                        {hackathon._count?.participants || 0} thí sinh
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Trophy className={cn("w-4 h-4", isDark ? 'text-amber-400' : 'text-amber-500')} />
                      <span className={isDark ? 'text-slate-300' : ''}>
                        {hackathon._count?.submissions || 0} bài nộp
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/hackathons/${hackathon.id}`)}
                    className={cn("w-full mt-2", isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : '')}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grid Pagination */}
          {filteredHackathons.length > PAGE_SIZE && (
            <div className="flex justify-center mt-6">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
              )}>
                <Button variant="ghost" size="sm" disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className={isDark ? 'text-slate-300' : ''}>
                  ← Trước
                </Button>
                <span className={cn("text-sm px-2", isDark ? 'text-slate-300' : 'text-slate-600')}>
                  Trang {currentPage} / {Math.ceil(filteredHackathons.length / PAGE_SIZE)}
                </span>
                <Button variant="ghost" size="sm"
                  disabled={currentPage === Math.ceil(filteredHackathons.length / PAGE_SIZE)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className={isDark ? 'text-slate-300' : ''}>
                  Sau →
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Card className={cn(
            "overflow-hidden",
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}>
            <Table
              loading={loading}
              dataSource={filteredHackathons.map((h) => ({ key: h.id, ...h }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} trong ${total} hackathon`,
              }}
              sortDirections={['descend', 'ascend']}
              columns={[
                {
                  title: 'Tên Hackathon',
                  key: 'title',
                  sorter: (a: any, b: any) => a.title.localeCompare(b.title),
                  render: (_: any, record: Hackathon) => (
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        record.status === 'active'
                          ? 'bg-primary/10'
                          : record.status === 'upcoming'
                          ? 'bg-blue-500/10'
                          : 'bg-slate-700'
                      )}>
                        <Trophy className={cn(
                          "w-5 h-5",
                          record.status === 'active'
                            ? 'text-primary'
                            : record.status === 'upcoming'
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        )} />
                      </div>
                      <div>
                        <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                          {record.title}
                        </p>
                        <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {record._count?.submissions || 0} bài nộp
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Trạng thái',
                  key: 'status',
                  sorter: (a: any, b: any) => (a.status || '').localeCompare(b.status || ''),
                  render: (_: any, record: Hackathon) => getStatusBadge(record.status || 'ended'),
                },
                {
                  title: 'Bắt đầu',
                  key: 'startTime',
                  sorter: (a: any, b: any) =>
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
                  render: (_: any, record: Hackathon) => (
                    <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      {formatDate(record.startTime)}
                    </span>
                  ),
                },
                {
                  title: 'Kết thúc',
                  key: 'endTime',
                  sorter: (a: any, b: any) =>
                    new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
                  render: (_: any, record: Hackathon) => (
                    <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      {formatDate(record.endTime)}
                    </span>
                  ),
                },
                {
                  title: 'Thí sinh',
                  key: 'participants',
                  sorter: (a: any, b: any) =>
                    (a._count?.participants || 0) - (b._count?.participants || 0),
                  render: (_: any, record: Hackathon) => (
                    <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                      {record._count?.participants || 0}
                    </span>
                  ),
                },
                {
                  title: 'Thao tác',
                  key: 'actions',
                  align: 'right' as const,
                  render: (_: any, record: Hackathon) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/hackathons/${record.id}`)}
                        className={cn(isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-500')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        className={cn(isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(record)}
                        className={cn(isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}

      {filteredHackathons.length === 0 && !loading && (
        <div className={cn("text-center py-12", isDark ? 'text-slate-400' : '')}>
          <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy hackathon nào' : 'Chưa có hackathon nào'}
          </p>
        </div>
      )}

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
          <Button key="edit" onClick={() => { setViewModalOpen(false); handleEdit(selectedHackathon!); }}>
            <Edit className="w-4 h-4 mr-1" /> Sửa
          </Button>
        ]}
        title={<span style={modalStyles.header}>Chi tiết Hackathon</span>}
        styles={modalStyles}
        width={700}
      >
        {selectedHackathon && (
          <div className="space-y-4">
            {selectedHackathon.imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img src={selectedHackathon.imageUrl} alt={selectedHackathon.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg" style={modalStyles.header}>{selectedHackathon.title}</h3>
              <p className="mt-2" style={modalStyles.body}>{selectedHackathon.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Thời gian bắt đầu</p>
                <p className="font-medium">{formatDate(selectedHackathon.startTime)}</p>
              </div>
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Thời gian kết thúc</p>
                <p className="font-medium">{formatDate(selectedHackathon.endTime)}</p>
              </div>
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Thời gian làm bài</p>
                <p className="font-medium">{selectedHackathon.durationMinutes || 120} phút</p>
              </div>
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Số người tối đa</p>
                <p className="font-medium">{selectedHackathon.maxParticipants || 'Không giới hạn'}</p>
              </div>
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Số thí sinh</p>
                <p className="font-medium">{selectedHackathon._count?.participants || 0}</p>
              </div>
              <div className={cn("p-3 rounded-lg", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                <p className="text-xs opacity-60">Số bài nộp</p>
                <p className="font-medium">{selectedHackathon._count?.submissions || 0}</p>
              </div>
            </div>
            {selectedHackathon.problems && selectedHackathon.problems.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Bài tập ({selectedHackathon.problems.length})</p>
                <div className="space-y-2">
                  {selectedHackathon.problems.map((p: any) => (
                    <div key={p.id} className={cn("p-2 rounded", isDark ? 'bg-slate-700' : 'bg-slate-50')}>
                      <p className="font-medium">{p.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        title={<span style={modalStyles.header}>Sửa Hackathon</span>}
        styles={modalStyles}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" onClick={handleUpdate}>
            Lưu
          </Button>
        ]}
      >
        {selectedHackathon && (
          <div className="space-y-4 py-4">
            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Tiêu đề</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
              />
            </div>
            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Mô tả</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg",
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : ''
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Thời gian bắt đầu</label>
                <Input
                  type="datetime-local"
                  value={editForm.startTime?.slice(0, 16)}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Thời gian kết thúc</label>
                <Input
                  type="datetime-local"
                  value={editForm.endTime?.slice(0, 16)}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Thời gian làm bài (phút)</label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.durationMinutes}
                  onChange={(e) => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) || 120 })}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>Số người tối đa</label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm({ ...editForm, maxParticipants: parseInt(e.target.value) || 100 })}
                  className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        title={<span style={{ ...modalStyles.header, color: '#ef4444' }}>Xác nhận xóa</span>}
        styles={modalStyles}
        okText="Xóa"
        okButtonProps={{ danger: true, loading: deleteLoading }}
        cancelText="Hủy"
      >
        <p style={modalStyles.body}>
          Bạn có chắc chắn muốn xóa hackathon <strong>{selectedHackathon?.title}</strong> không?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}
