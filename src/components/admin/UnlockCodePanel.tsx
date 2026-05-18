import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  KeyRound,
  Copy,
  Check,
  Users,
  Plus,
  Search,
  Loader2,
  Mail,
  UserCheck,
  X,
  ChevronDown,
  ChevronUp,
  LockOpen,
  Unlock,
  Eye,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface UnlockCodePanelProps {
  courseId: string;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  school: string | null;
}

interface ActivateCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  expiresAt: string | null;
  usedBy: string | null;
  user?: {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
  };
}

interface EnrollmentInfo {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: number;
  currentUnlocks: number;
  totalLessons: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
  };
}

type TabType = 'create' | 'assign' | 'unlocks';

export function UnlockCodePanel({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  theme = 'light',
}: UnlockCodePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [codes, setCodes] = useState<ActivateCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Users not enrolled
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Enrollments (users with progress)
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [expandedEnrollment, setExpandedEnrollment] = useState<string | null>(null);
  const [updatingUnlocks, setUpdatingUnlocks] = useState<string | null>(null);
  const [unlockDialog, setUnlockDialog] = useState<{ open: boolean; enrollment: EnrollmentInfo | null }>({ open: false, enrollment: null });
  const [newUnlockCount, setNewUnlockCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen && activeTab === 'create') {
      fetchCodes();
    }
  }, [isOpen, activeTab, courseId]);

  useEffect(() => {
    if (isOpen && activeTab === 'assign') {
      fetchUsers();
    }
  }, [isOpen, activeTab, courseId, searchQuery]);

  useEffect(() => {
    if (isOpen && activeTab === 'unlocks') {
      fetchEnrollments();
    }
  }, [isOpen, activeTab, courseId]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.list(courseId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setCodes(data.data);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.enrollments(courseId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleUpdateUnlocks = async (userId: string) => {
    setUpdatingUnlocks(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.updateUnlocks(courseId, userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentUnlocks: newUnlockCount }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEnrollments();
        setUnlockDialog({ open: false, enrollment: null });
        alert(`Đã cập nhật số bài mở khóa thành ${newUnlockCount}`);
      } else {
        alert(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating unlocks:', error);
      alert('Đã xảy ra lỗi');
    } finally {
      setUpdatingUnlocks(null);
    }
  };

  const handleUnlockAll = async (userId: string) => {
    if (!confirm('Mở khóa toàn bộ bài học cho người dùng này?')) return;

    setUpdatingUnlocks(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.unlockAll(courseId, userId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchEnrollments();
        alert('Đã mở khóa toàn bộ bài học cho người dùng!');
      } else {
        alert(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error unlocking all:', error);
      alert('Đã xảy ra lỗi');
    } finally {
      setUpdatingUnlocks(null);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const url = searchQuery
        ? `${API_ENDPOINTS.courseAccess.usersNotEnrolled(courseId)}?search=${encodeURIComponent(searchQuery)}`
        : API_ENDPOINTS.courseAccess.usersNotEnrolled(courseId);
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateCodes = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.bulkCreate(courseId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: quantity }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCodes();
        setQuantity(1);
      }
    } catch (error) {
      console.error('Error creating codes:', error);
    } finally {
      setCreating(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.delete(codeId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        fetchCodes();
      }
    } catch (error) {
      console.error('Error deleting code:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) return;

    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.assignUsers(courseId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmDialog(false);
        setSelectedUsers([]);
        fetchUsers(); // Refresh to remove assigned users
        alert(`Đã gửi thông báo và email cho ${data.data.assignedCount} người dùng!`);
      }
    } catch (error) {
      console.error('Error assigning users:', error);
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Không có';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'max-w-3xl max-h-[85vh] overflow-hidden flex flex-col',
        theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white'
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            'flex items-center gap-2 text-xl',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            <KeyRound className="w-6 h-6 text-primary" />
            Quản lý mã mở khóa khóa học
          </DialogTitle>
          <p className={cn(
            'text-sm',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          )}>
            {courseTitle}
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'create'
                ? 'border-primary text-primary'
                : theme === 'dark'
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <Plus className="w-4 h-4" />
            Tạo mã
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'assign'
                ? 'border-primary text-primary'
                : theme === 'dark'
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <Users className="w-4 h-4" />
            Cấp quyền ({selectedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('unlocks')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors',
              activeTab === 'unlocks'
                ? 'border-primary text-primary'
                : theme === 'dark'
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <LockOpen className="w-4 h-4" />
            Quản lý mở khóa
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* CREATE TAB */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              {/* Create Form */}
              <Card className={theme === 'dark' ? 'bg-slate-800 border-slate-700' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className={cn(
                        'text-sm font-medium mb-1 block',
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      )}>
                        Số lượng mã
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className={cn(
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : ''
                        )}
                      />
                    </div>
                    <Button
                      onClick={handleCreateCodes}
                      disabled={creating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Tạo mã
                        </>
                      )}
                    </Button>
                  </div>
                  <p className={cn(
                    'text-xs mt-2',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    Mã sẽ có format: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">CFE-XXXXXXXXXXXXXXXXXXXX</code>
                  </p>
                </CardContent>
              </Card>

              {/* Codes List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : codes.length === 0 ? (
                <div className={cn(
                  'text-center py-8 rounded-lg border-2 border-dashed',
                  theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                )}>
                  <KeyRound className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có mã nào được tạo</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {codes.map((code) => (
                    <div
                      key={code.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-white border-slate-200',
                        code.isUsed && 'opacity-60'
                      )}
                    >
                      <div className="flex-1">
                        <code className={cn(
                          'text-lg font-mono font-bold',
                          theme === 'dark' ? 'text-orange-400' : 'text-primary'
                        )}>
                          {code.code}
                        </code>
                        <div className={cn(
                          'text-xs mt-1',
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          Tạo: {formatDate(code.createdAt)} •{' '}
                          {code.isUsed ? (
                            <span className="text-green-500">
                              Đã dùng bởi {code.user?.email || 'user'}
                            </span>
                          ) : (
                            <span className="text-amber-500">Chưa sử dụng</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(code.code)}
                          className={cn(
                            theme === 'dark' ? 'text-slate-300 hover:text-white' : ''
                          )}
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {!code.isUsed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGN TAB */}
          {activeTab === 'assign' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                )} />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'pl-10',
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : ''
                  )}
                />
              </div>

              {/* Users List */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className={cn(
                  'text-center py-8 rounded-lg border-2 border-dashed',
                  theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                )}>
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Không có người dùng nào phù hợp</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id}>
                      <div
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                          selectedUsers.includes(user.id)
                            ? theme === 'dark'
                              ? 'bg-primary/20 border-primary'
                              : 'bg-primary/10 border-primary'
                            : theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                              : 'bg-white border-slate-200 hover:border-slate-300',
                        )}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div className="relative">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-white',
                              theme === 'dark' ? 'bg-slate-600' : 'bg-primary'
                            )}>
                              {user.fullName?.[0] || user.username[0].toUpperCase()}
                            </div>
                          )}
                          {selectedUsers.includes(user.id) && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium truncate',
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          )}>
                            {user.fullName || user.username}
                          </p>
                          <p className={cn(
                            'text-sm truncate',
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          )}>
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedUser(expandedUser === user.id ? null : user.id);
                          }}
                          className={cn(
                            'p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700',
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
                          )}
                        >
                          {expandedUser === user.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Profile */}
                      {expandedUser === user.id && (
                        <div className={cn(
                          'mt-1 p-3 rounded-lg border-l-4 border-primary text-sm',
                          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50'
                        )}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className={cn(
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              )}>Username:</span>
                              <span className={cn(
                                'ml-2 font-medium',
                                theme === 'dark' ? 'text-white' : ''
                              )}>{user.username}</span>
                            </div>
                            {user.school && (
                              <div>
                                <span className={cn(
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                )}>Trường:</span>
                                <span className={cn(
                                  'ml-2',
                                  theme === 'dark' ? 'text-white' : ''
                                )}>{user.school}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UNLOCKS TAB */}
          {activeTab === 'unlocks' && (
            <div className="space-y-4">
              {/* Info */}
              <div className={cn(
                'p-4 rounded-lg border',
                theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              )}>
                <p className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                )}>
                  Quản lý số bài học đã mở khóa cho từng học viên. Bạn có thể cập nhật số bài hoặc mở khóa toàn bộ.
                </p>
              </div>

              {/* Enrollments List */}
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className={cn(
                  'text-center py-8 rounded-lg border-2 border-dashed',
                  theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                )}>
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có học viên nào đăng ký khóa học này</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {enrollments.map((enrollment) => {
                    const progressPercent = enrollment.totalLessons > 0
                      ? Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100)
                      : 0;
                    const isFullyUnlocked = enrollment.currentUnlocks >= enrollment.totalLessons;

                    return (
                      <div
                        key={enrollment.id}
                        className={cn(
                          'p-4 rounded-lg border',
                          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        )}
                      >
                        {/* User Info & Progress */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {enrollment.user.avatar ? (
                              <img
                                src={enrollment.user.avatar}
                                alt={enrollment.user.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center text-white',
                                theme === 'dark' ? 'bg-slate-600' : 'bg-primary'
                              )}>
                                {enrollment.user.fullName?.[0] || enrollment.user.username[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className={cn(
                                'font-medium',
                                theme === 'dark' ? 'text-white' : 'text-slate-900'
                              )}>
                                {enrollment.user.fullName || enrollment.user.username}
                              </p>
                              <p className={cn(
                                'text-sm',
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              )}>
                                {enrollment.user.email}
                              </p>
                            </div>
                          </div>

                          {/* Progress Badge */}
                          <Badge className={cn(
                            progressPercent === 100
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          )}>
                            {progressPercent}% hoàn thành
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={cn(
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            )}>
                              {enrollment.completedLessons}/{enrollment.totalLessons} bài hoàn thành
                            </span>
                            <span className={cn(
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            )}>
                              Đã mở: {enrollment.currentUnlocks}/{enrollment.totalLessons}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUnlockDialog({
                                open: true,
                                enrollment
                              });
                              setNewUnlockCount(enrollment.currentUnlocks);
                            }}
                            disabled={updatingUnlocks === enrollment.userId || isFullyUnlocked}
                            className={cn(
                              'flex-1 gap-1',
                              theme === 'dark'
                                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                                : ''
                            )}
                          >
                            <Unlock className="w-4 h-4" />
                            Cập nhật số bài
                          </Button>

                          {!isFullyUnlocked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnlockAll(enrollment.userId)}
                              disabled={updatingUnlocks === enrollment.userId}
                              className={cn(
                                'flex-1 gap-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
                                theme === 'dark'
                                  ? 'border-green-700 text-green-400'
                                  : ''
                              )}
                            >
                              {updatingUnlocks === enrollment.userId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <LockOpen className="w-4 h-4" />
                                  Mở tất cả
                                </>
                              )}
                            </Button>
                          )}

                          {isFullyUnlocked && (
                            <Badge className="flex-1 justify-center bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                              Đã mở toàn bộ
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'assign' && selectedUsers.length > 0 && (
          <div className={cn(
            'p-4 border-t flex items-center justify-between',
            theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
          )}>
            <p className={cn(
              'text-sm',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}>
              Đã chọn <strong>{selectedUsers.length}</strong> người dùng
            </p>
            <Button
              onClick={() => setConfirmDialog(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Mail className="w-4 h-4 mr-2" />
              Xác nhận gửi thông báo
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className={cn(
          theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white'
        )}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
              Xác nhận cấp quyền
            </DialogTitle>
          </DialogHeader>
          <div className={cn(
            'py-4',
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          )}>
            <p>Bạn có chắc muốn cấp quyền truy cập khóa học <strong>"{courseTitle}"</strong> cho <strong>{selectedUsers.length}</strong> người dùng?</p>
            <p className="mt-2 text-sm">Hệ thống sẽ gửi thông báo trong app và email kèm link khóa học cho từng người dùng.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAssignUsers}
              disabled={assigning}
              className="bg-primary hover:bg-primary/90"
            >
              {assigning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Xác nhận ({selectedUsers.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={unlockDialog.open} onOpenChange={(open) => setUnlockDialog({ open, enrollment: null })}>
        <DialogContent className={cn(
          theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white'
        )}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
              Cập nhật số bài mở khóa
            </DialogTitle>
          </DialogHeader>
          {unlockDialog.enrollment && (
            <div className={cn(
              'py-4 space-y-4',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            )}>
              <div>
                <p>Học viên: <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                  {unlockDialog.enrollment.user.fullName || unlockDialog.enrollment.user.username}
                </strong></p>
                <p className="text-sm mt-1">
                  Tổng số bài: <strong>{unlockDialog.enrollment.totalLessons}</strong> | 
                  Hiện đã mở: <strong>{unlockDialog.enrollment.currentUnlocks}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className={cn(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  Số bài mở khóa mới:
                </label>
                <Input
                  type="number"
                  min={0}
                  max={unlockDialog.enrollment.totalLessons}
                  value={newUnlockCount}
                  onChange={(e) => setNewUnlockCount(Math.max(0, Math.min(unlockDialog.enrollment!.totalLessons, parseInt(e.target.value) || 0)))}
                  className={cn(
                    theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : ''
                  )}
                />
                <p className="text-xs text-slate-500">
                  Nhập số từ 0 đến {unlockDialog.enrollment.totalLessons}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockDialog({ open: false, enrollment: null })}>
              Hủy
            </Button>
            <Button
              onClick={() => unlockDialog.enrollment && handleUpdateUnlocks(unlockDialog.enrollment.userId)}
              disabled={updatingUnlocks !== null}
              className="bg-primary hover:bg-primary/90"
            >
              {updatingUnlocks ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
