import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  FileQuestion,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  BookOpen,
} from 'lucide-react';
import { message, notification } from 'antd';

interface Testcase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points?: number;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testcases: Testcase[];
}

interface MinitestQuestion {
  id: string;
  problemId: string;
  problem: Problem;
}

interface Minitest {
  id: string;
  title: string;
  questions: MinitestQuestion[];
}

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons: any[];
  minitests: Minitest[];
}

interface Course {
  id: string;
  title: string;
  phases: Phase[];
}

export default function MinitestSettingsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Dialog states
  const [createMinitestOpen, setCreateMinitestOpen] = useState(false);
  const [editMinitestOpen, setEditMinitestOpen] = useState(false);
  const [createProblemOpen, setCreateProblemOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedMinitest, setSelectedMinitest] = useState<Minitest | null>(null);

  // Form states
  const [minitestTitle, setMinitestTitle] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
  });
  const [problemTestcases, setProblemTestcases] = useState<Testcase[]>([
    { input: '', expectedOutput: '', isPublic: true },
  ]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchProblems();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${API_ENDPOINTS.admin.courses}/${courseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching course:', error);
      if (error.name === 'AbortError') {
        message.error('Request timed out');
      } else {
        message.error('Không thể tải thông tin khóa học');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courseProblems(courseId!), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setProblems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const handleCreateMinitest = async () => {
    if (!selectedPhase || !minitestTitle.trim()) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.minitests, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phaseId: selectedPhase,
          title: minitestTitle,
          questionIds: selectedProblems,
        }),
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: '✅ Tạo Minitest thành công!',
          description: 'Bài minitest đã được tạo.',
          placement: 'topRight',
          duration: 3,
        });
        setCreateMinitestOpen(false);
        setMinitestTitle('');
        setSelectedProblems([]);
        setSelectedPhase('');
        fetchCourse();
      } else {
        message.error(data.message || 'Tạo minitest thất bại');
      }
    } catch (error) {
      console.error('Error creating minitest:', error);
      message.error('Tạo minitest thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMinitest = async (minitestId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài minitest này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.minitest(minitestId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: '✅ Xóa thành công!',
          description: 'Bài minitest đã được xóa.',
          placement: 'topRight',
          duration: 3,
        });
        fetchCourse();
      }
    } catch (error) {
      message.error('Xóa minitest thất bại');
    }
  };

  const handleUpdateMinitest = async () => {
    if (!selectedMinitest || !minitestTitle.trim()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.minitest(selectedMinitest.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: minitestTitle,
          questionIds: selectedProblems,
        }),
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: '✅ Cập nhật thành công!',
          description: 'Bài minitest đã được cập nhật.',
          placement: 'topRight',
          duration: 3,
        });
        setEditMinitestOpen(false);
        fetchCourse();
      }
    } catch (error) {
      message.error('Cập nhật minitest thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProblem = async () => {
    if (!problemForm.title.trim() || !problemForm.description.trim()) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const validTestcases = problemTestcases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());
    if (validTestcases.length === 0) {
      message.warning('Cần ít nhất 1 test case');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.problems, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...problemForm,
          testcases: validTestcases.map((tc, i) => ({
            ...tc,
            isPublic: i < 2,
          })),
        }),
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: '✅ Tạo Problem thành công!',
          description: 'Problem đã được tạo.',
          placement: 'topRight',
          duration: 3,
        });
        setCreateProblemOpen(false);
        setProblemForm({ title: '', description: '', difficulty: 'EASY' });
        setProblemTestcases([{ input: '', expectedOutput: '', isPublic: true }]);
        fetchProblems();
      }
    } catch (error) {
      message.error('Tạo problem thất bại');
    } finally {
      setSaving(false);
    }
  };

  const openEditMinitest = (minitest: Minitest) => {
    setSelectedMinitest(minitest);
    setMinitestTitle(minitest.title);
    setSelectedProblems(minitest.questions?.map(q => q.problemId) || []);
    setEditMinitestOpen(true);
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center min-h-[400px]",
        isDark ? "bg-slate-950" : "bg-slate-50"
      )}>
        <Loader2 className={cn("w-12 h-12 animate-spin text-primary")} />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen p-6 space-y-6",
      isDark ? "bg-slate-950" : "bg-slate-50"
    )}>
      {/* Header */}
      <div className="flex items-center gap-4 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
          Cài đặt Minitest - {course?.title}
        </h1>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Actions */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Settings className="w-5 h-5" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => setCreateProblemOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tạo Problem mới
            </Button>
          </CardContent>
        </Card>

        {/* Available Problems */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <FileQuestion className="w-5 h-5" />
              Danh sách Problems ({problems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {problems.length === 0 ? (
              <p className={cn("text-center py-4", isDark ? "text-slate-400" : "text-slate-500")}>
                Chưa có problem nào. Tạo problem mới để thêm vào minitest.
              </p>
            ) : (
              <div className="space-y-2">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "")}>{problem.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          problem.difficulty === 'EASY' ? "bg-green-100 text-green-700" :
                          problem.difficulty === 'MEDIUM' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {problem.difficulty}
                        </span>
                        <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                          {problem.testcases?.length || 0} test cases
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phases with Minitests */}
        {course?.phases?.map((phase, phaseIndex) => (
          <Card key={phase.id} className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <BookOpen className="w-5 h-5" />
                  Chương {phaseIndex + 1}: {phase.title}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPhase(phase.id);
                    setCreateMinitestOpen(true);
                  }}
                  className="gap-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Minitest
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Minitests */}
              {phase.minitests && phase.minitests.length > 0 ? (
                <div className="space-y-3">
                  {phase.minitests.map((minitest) => (
                    <div
                      key={minitest.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "")}>
                            {minitest.title}
                          </h4>
                          <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                            {(minitest.questions?.length || 0)} câu hỏi
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditMinitest(minitest)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMinitest(minitest.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {(minitest.questions?.length || 0) > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {minitest.questions.map((q) => (
                            <span
                              key={q.id}
                              className={cn(
                                "text-xs px-2 py-1 rounded",
                                isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                              )}
                            >
                              {q.problem?.title || 'Unknown'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn("text-center py-4", isDark ? "text-slate-400" : "text-slate-500")}>
                  Chưa có bài minitest nào cho chương này
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Minitest Dialog */}
      <Dialog open={createMinitestOpen} onOpenChange={setCreateMinitestOpen}>
        <DialogContent className={cn(
          "max-w-lg",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? "text-white" : "")}>
              Tạo Minitest mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Tên bài Minitest</Label>
              <Input
                value={minitestTitle}
                onChange={(e) => setMinitestTitle(e.target.value)}
                placeholder="VD: Mini Test - Chương 1"
                className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Chọn Problems</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {problems.map((problem) => (
                  <label
                    key={problem.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer",
                      isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProblems.includes(problem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProblems([...selectedProblems, problem.id]);
                        } else {
                          setSelectedProblems(selectedProblems.filter(id => id !== problem.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className={isDark ? "text-slate-300" : ""}>{problem.title}</span>
                  </label>
                ))}
              </div>
              {problems.length === 0 && (
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  Chưa có problem nào. Tạo problem trước.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateMinitestOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateMinitest} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Minitest Dialog */}
      <Dialog open={editMinitestOpen} onOpenChange={setEditMinitestOpen}>
        <DialogContent className={cn(
          "max-w-lg",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? "text-white" : "")}>
              Chỉnh sửa Minitest
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Tên bài Minitest</Label>
              <Input
                value={minitestTitle}
                onChange={(e) => setMinitestTitle(e.target.value)}
                className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Chọn Problems</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {problems.map((problem) => (
                  <label
                    key={problem.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded cursor-pointer",
                      isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProblems.includes(problem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProblems([...selectedProblems, problem.id]);
                        } else {
                          setSelectedProblems(selectedProblems.filter(id => id !== problem.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className={isDark ? "text-slate-300" : ""}>{problem.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMinitestOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateMinitest} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Problem Dialog */}
      <Dialog open={createProblemOpen} onOpenChange={setCreateProblemOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? "text-white" : "")}>
              Tạo Problem mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Tên Problem</Label>
              <Input
                value={problemForm.title}
                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                placeholder="VD: Tính tổng 2 số"
                className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
              <Textarea
                value={problemForm.description}
                onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                placeholder="Mô tả bài toán..."
                className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Độ khó</Label>
              <Select
                value={problemForm.difficulty}
                onValueChange={(v) => setProblemForm({ ...problemForm, difficulty: v })}
              >
                <SelectTrigger className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Cases */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={isDark ? "text-slate-300" : ""}>Test Cases</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProblemTestcases([...problemTestcases, { input: '', expectedOutput: '', isPublic: true }])}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {problemTestcases.map((tc, index) => (
                  <div key={index} className={cn(
                    "flex items-center gap-2 p-2 rounded",
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  )}>
                    <Input
                      value={tc.input}
                      onChange={(e) => {
                        const newCases = [...problemTestcases];
                        newCases[index].input = e.target.value;
                        setProblemTestcases(newCases);
                      }}
                      placeholder="Input"
                      className={cn(
                        "flex-1 text-xs",
                        isDark && "bg-slate-900 border-slate-700 text-white"
                      )}
                    />
                    <Input
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const newCases = [...problemTestcases];
                        newCases[index].expectedOutput = e.target.value;
                        setProblemTestcases(newCases);
                      }}
                      placeholder="Expected Output"
                      className={cn(
                        "flex-1 text-xs",
                        isDark && "bg-slate-900 border-slate-700 text-white"
                      )}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setProblemTestcases(problemTestcases.filter((_, i) => i !== index))}
                      className="text-red-500"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                2 test case đầu tiên sẽ là public (hiển thị cho user)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProblemOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateProblem} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Tạo Problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
