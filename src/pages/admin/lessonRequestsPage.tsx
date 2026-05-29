import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import {
  BookOpen, Clock, User, Plus, Search,
  Filter, Eye, Trash2, CheckCircle, XCircle, AlertCircle, LayoutGrid, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table } from 'antd';
import { message } from 'antd';
import { KanbanBoard } from '@/components/admin';

interface LessonRequest {
  id: string;
  lessonId: string;
  lectureId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'CANCELLED';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    phase: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  lecture: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  };
}

interface Lecture {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
}

const LessonRequestsPage = () => {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lectureFilter, setLectureFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LessonRequest | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchLectures();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonRequests.list, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lesson requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.users, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Filter only lectures from the response
        const allUsers = data.data || [];
        const lectureUsers = allUsers.filter((user: any) => 
          user.role?.name?.toLowerCase() === 'lecture'
        );
        setLectures(lectureUsers);
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.lessonRequests.list}/${selectedRequest.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        message.success('Đã xóa yêu cầu');
        setRequests(requests.filter(r => r.id !== selectedRequest.id));
      } else {
        message.error(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      message.error('Xóa thất bại');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: newStatus as LessonRequest['status'] } : r
    ));
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lecture.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lecture.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesLecture = lectureFilter === 'all' || request.lectureId === lectureFilter;
    return matchesSearch && matchesStatus && matchesLecture;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      PENDING: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock, label: 'Chờ xử lý' },
      IN_PROGRESS: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle, label: 'Đang làm' },
      SUBMITTED: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle, label: 'Đã nộp' },
      CANCELLED: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle, label: 'Đã hủy' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge className={cn('flex items-center gap-1 w-fit', config.color)}>
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Quản lý yêu cầu bài học
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Tạo và quản lý yêu cầu tạo bài học cho giảng viên
          </p>
        </div>
        <Link to="/admin/lesson-requests/create">
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className={cn('mb-6', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-400')} />
              <Input
                placeholder="Tìm kiếm theo tên bài học, giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn('pl-10', isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={cn('w-full md:w-48', isDark ? 'bg-slate-700 border-slate-600' : '')}>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                <SelectItem value="SUBMITTED">Đã nộp</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lectureFilter} onValueChange={setLectureFilter}>
              <SelectTrigger className={cn('w-full md:w-48', isDark ? 'bg-slate-700 border-slate-600' : '')}>
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Giảng viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giảng viên</SelectItem>
                {lectures.map((lecture) => (
                  <SelectItem key={lecture.id} value={lecture.id}>
                    {lecture.fullName || lecture.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Tổng yêu cầu</p>
                <p className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>{requests.length}</p>
              </div>
              <BookOpen className={cn('w-10 h-10 opacity-20', isDark ? 'text-white' : 'text-slate-400')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Chờ xử lý</p>
                <p className={cn('text-2xl font-bold text-yellow-500')}>
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <Clock className={cn('w-10 h-10 text-yellow-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đang làm</p>
                <p className={cn('text-2xl font-bold text-blue-500')}>
                  {requests.filter(r => r.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <AlertCircle className={cn('w-10 h-10 text-blue-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đã nộp</p>
                <p className={cn('text-2xl font-bold text-green-500')}>
                  {requests.filter(r => r.status === 'SUBMITTED').length}
                </p>
              </div>
              <CheckCircle className={cn('w-10 h-10 text-green-500 opacity-20')} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Table and Kanban */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className={cn('mb-4', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
          <TabsTrigger value="list" className={cn(
            'flex items-center gap-2',
            isDark ? 'data-[state=active]:bg-slate-700' : ''
          )}>
            <List className="w-4 h-4" />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value="kanban" className={cn(
            'flex items-center gap-2',
            isDark ? 'data-[state=active]:bg-slate-700' : ''
          )}>
            <LayoutGrid className="w-4 h-4" />
            Kanban - Kéo thả
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : ''}>Danh sách yêu cầu</CardTitle>
            </CardHeader>
            <CardContent>
              <Table
                loading={loading}
                dataSource={filteredRequests.map((request) => ({
                  key: request.id,
                  ...request,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}–${range[1]} trong ${total} yêu cầu`,
                }}
                sortDirections={['descend', 'ascend']}
                columns={[
                  {
                    title: 'Bài học',
                    dataIndex: 'lesson',
                    key: 'lesson',
                    sorter: (a: any, b: any) =>
                      (a.lesson?.title || '').localeCompare(b.lesson?.title || ''),
                    render: (_: any, record: LessonRequest) => (
                      <div>
                        <p className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                          {record.lesson.title}
                        </p>
                        <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {record.lesson.phase.course.title} / {record.lesson.phase.title}
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: 'Giảng viên',
                    dataIndex: 'lecture',
                    key: 'lecture',
                    sorter: (a: any, b: any) =>
                      (a.lecture?.fullName || a.lecture?.username || '').localeCompare(
                        b.lecture?.fullName || b.lecture?.username || ''
                      ),
                    render: (_: any, record: LessonRequest) => (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {record.lecture.fullName?.[0] || record.lecture.username[0]}
                          </span>
                        </div>
                        <div>
                          <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                            {record.lecture.fullName || record.lecture.username}
                          </p>
                          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            {record.lecture.email}
                          </p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Hạn chót',
                    dataIndex: 'dueDate',
                    key: 'dueDate',
                    sorter: (a: any, b: any) =>
                      new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime(),
                    render: (_: any, record: LessonRequest) =>
                      record.dueDate ? (
                        <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                          {new Date(record.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className={cn('text-sm italic', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          Không có
                        </span>
                      ),
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    key: 'status',
                    sorter: (a: any, b: any) => (a.status || '').localeCompare(b.status || ''),
                    render: (_: any, record: LessonRequest) => getStatusBadge(record.status),
                  },
                  {
                    title: 'Ngày tạo',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    sorter: (a: any, b: any) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    defaultSortOrder: 'descend' as const,
                    render: (_: any, record: LessonRequest) => (
                      <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    ),
                  },
                  {
                    title: 'Thao tác',
                    key: 'actions',
                    align: 'right' as const,
                    render: (_: any, record: LessonRequest) => (
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/lesson-requests/${record.id}`}>
                          <Button variant="ghost" size="icon" className={cn(isDark ? 'text-slate-300 hover:text-white' : '')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(record);
                            setDeleteDialogOpen(true);
                          }}
                          className={cn('text-red-500 hover:text-red-600', isDark ? 'hover:bg-red-500/10' : '')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="mt-0">
          {/* Kanban Board */}
          <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : ''}>
                Bảng Kanban - Kéo thả để thay đổi trạng thái
              </CardTitle>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Kéo các thẻ yêu cầu giữa các cột để cập nhật trạng thái
              </p>
            </CardHeader>
            <CardContent>
              <KanbanBoard
                requests={filteredRequests}
                onStatusChange={handleStatusChange}
                onRefresh={fetchRequests}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa yêu cầu này không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonRequestsPage;
