import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Code,
  Loader2,
  X,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { message, notification, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { Checkbox } from 'antd';

interface Testcase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  hackathonId?: string | null;
  testcases: Testcase[];
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: Problem[];
}

export default function FinalTestSettingsPage() {
  const { id: courseId, hackathonId } = useParams<{ id: string; hackathonId: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);

  // Course problems dialog
  const [addFromCourseOpen, setAddFromCourseOpen] = useState(false);
  const [courseProblems, setCourseProblems] = useState<Problem[]>([]);
  const [selectedCourseProblems, setSelectedCourseProblems] = useState<string[]>([]);
  const [loadingCourseProblems, setLoadingCourseProblems] = useState(false);
  const [addingProblems, setAddingProblems] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);

  // Problem dialog
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
  });
  const [problemTestcases, setProblemTestcases] = useState<Testcase[]>([
    { input: '', expectedOutput: '', isPublic: true },
  ]);

  useEffect(() => {
    if (hackathonId) {
      fetchHackathon();
    }
  }, [hackathonId]);

  const fetchHackathon = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.hackathon(hackathonId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        const h = data.data;
        setHackathon(h);
        setTitle(h.title);
        setDescription(h.description || '');
        setStartTime(new Date(h.startTime).toISOString().slice(0, 16));
        setEndTime(new Date(h.endTime).toISOString().slice(0, 16));
        setProblems(h.problems || []);
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      message.error('Không thể tải thông tin Final Test');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!hackathonId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.hackathon(hackathonId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: 'Thành công',
          description: 'Đã lưu thông tin Final Test',
          placement: 'topRight',
          duration: 3,
        });
        setTimeout(() => navigate(`/admin/courses/${courseId}/edit`), 500);
      } else {
        message.error(data.message || 'Lưu thất bại');
      }
    } catch (error) {
      console.error('Error saving:', error);
      message.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const openAddFromCourseDialog = () => {
    setSelectedCourseProblems([]);
    setCourseProblems([]);
    setAddFromCourseOpen(true);
    fetchCourseProblems();
  };

  const fetchCourseProblems = async () => {
    if (!courseId) return;
    setLoadingCourseProblems(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courseProblems(courseId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        const existingProblemIds = new Set(hackathon?.problems.map(p => p.id) || []);
        const available = (data.data || []).filter(
          (p: Problem) => !existingProblemIds.has(p.id) && !p.hackathonId
        );
        setCourseProblems(available);
      }
    } catch (error) {
      console.error('Error fetching course problems:', error);
      message.error('Không thể tải danh sách bài tập');
    } finally {
      setLoadingCourseProblems(false);
    }
  };

  const handleAddSelectedProblems = async () => {
    if (!hackathonId || selectedCourseProblems.length === 0) return;
    setAddingProblems(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedCourseProblems.map(problemId =>
          fetch(API_ENDPOINTS.admin.addProblemToHackathon(hackathonId), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          })
        )
      );
      setAddFromCourseOpen(false);
      setSelectedCourseProblems([]);
      fetchHackathon();
      message.success(`Đã thêm ${selectedCourseProblems.length} bài tập vào Final Test`);
    } catch (error) {
      console.error('Error adding problems:', error);
      message.error('Thêm bài tập thất bại');
    } finally {
      setAddingProblems(false);
    }
  };

  const handleOpenProblemDialog = (problem?: Problem) => {
    if (problem) {
      setEditingProblem(problem);
      setProblemForm({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
      });
      setProblemTestcases(
        problem.testcases?.length
          ? problem.testcases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput, isPublic: tc.isPublic }))
          : [{ input: '', expectedOutput: '', isPublic: true }]
      );
    } else {
      setEditingProblem(null);
      setProblemForm({ title: '', description: '', difficulty: 'EASY' });
      setProblemTestcases([{ input: '', expectedOutput: '', isPublic: true }]);
    }
    setProblemDialogOpen(true);
  };

  const handleAddTestcase = () => {
    setProblemTestcases([...problemTestcases, { input: '', expectedOutput: '', isPublic: true }]);
  };

  const handleRemoveTestcase = (index: number) => {
    setProblemTestcases(problemTestcases.filter((_, i) => i !== index));
  };

  const handleUpdateTestcase = (index: number, field: keyof Testcase, value: string | boolean) => {
    const newTestcases = [...problemTestcases];
    newTestcases[index] = { ...newTestcases[index], [field]: value };
    setProblemTestcases(newTestcases);
  };

  const handleSaveProblem = async () => {
    if (!hackathonId) return;
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
          title: problemForm.title,
          description: problemForm.description,
          difficulty: problemForm.difficulty,
          testcases: problemTestcases,
          hackathonId: hackathonId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setProblemDialogOpen(false);
        fetchHackathon();
        message.success(editingProblem ? 'Đã cập nhật bài tập' : 'Đã thêm bài tập');
      } else {
        message.error(data.message || 'Lưu thất bại');
      }
    } catch (error) {
      console.error('Error saving problem:', error);
      message.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này khỏi Final Test?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.removeProblemFromHackathon(hackathonId!, problemId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProblems(problems.filter(p => p.id !== problemId));
      message.success('Đã xóa bài tập khỏi Final Test');
      fetchHackathon();
    } catch (error) {
      console.error('Error deleting problem:', error);
      message.error('Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", isDark ? "bg-slate-950" : "bg-slate-50")}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/courses/${courseId}/edit`)}
                className={isDark ? "text-slate-300 hover:text-white" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay về
              </Button>
              <div>
                <h1 className={cn("text-xl font-bold flex items-center gap-2", isDark ? "text-white" : "")}>
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Chỉnh sửa Final Test
                </h1>
                <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                  {title || 'Đang tải...'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSaveBasicInfo}
              disabled={saving || !title.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu thông tin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Edit className="w-4 h-4" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Tiêu đề Final Test</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn("mt-1", isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="VD: Final Test - Web Development"
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn("mt-1 min-h-[120px]", isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder={`Viết mô tả bài test tổng hợp cuối khóa ở đây...

Ví dụ:
Đây là bài kiểm tra tổng hợp cuối khóa Web Development. Bài test gồm 5 bài tập lập trình với độ khó từ dễ đến khó.

Thời gian làm bài: 180 phút
Ngôn ngữ lập trình: JavaScript, Python, Java

Lưu ý:
- Đọc kỹ đề bài trước khi làm
- Chạy thử code với test case trước khi submit`}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Ngày bắt đầu</Label>
                <DatePicker
                  showTime
                  className={cn("w-full mt-1", isDark ? "ant-darker" : "")}
                  value={startTime ? dayjs(startTime) : null}
                  onChange={(date) => setStartTime(date ? dayjs(date as any).format('YYYY-MM-DDTHH:mm') : '')}
                  placeholder="Chọn ngày bắt đầu"
                  format="YYYY-MM-DD HH:mm"
                />
              </div>
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Ngày kết thúc</Label>
                <DatePicker
                  showTime
                  className={cn("w-full mt-1", isDark ? "ant-darker" : "")}
                  value={endTime ? dayjs(endTime) : null}
                  onChange={(date) => setEndTime(date ? dayjs(date as any).format('YYYY-MM-DDTHH:mm') : '')}
                  placeholder="Chọn ngày kết thúc"
                  format="YYYY-MM-DD HH:mm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems */}
        <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Code className="w-4 h-4 text-green-500" />
              Bài tập ({problems.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={openAddFromCourseDialog}
                className={isDark ? "border-slate-700 text-slate-300 hover:text-white" : ""}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Thêm từ khóa học
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenProblemDialog()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tạo bài tập mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {problems.length > 0 ? (
              <div className="space-y-3">
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className={cn("font-medium", isDark ? "text-white" : "")}>
                            {problem.title}
                          </h4>
                          <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                            {problem.description.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              problem.difficulty === 'EASY' ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400" :
                              problem.difficulty === 'MEDIUM' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                            )}>
                              {problem.difficulty === 'EASY' ? 'Dễ' : problem.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                            </span>
                            <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                              {problem.testcases?.length || 0} testcases
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenProblemDialog(problem)}
                          className={isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProblem(problem.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "text-center py-12 rounded-lg",
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
              )}>
                <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có bài tập nào</p>
                <p className="text-sm mt-1">Thêm bài tập để hoàn thiện Final Test</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Problem Dialog */}
      <Dialog open={problemDialogOpen} onOpenChange={setProblemDialogOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Code className="w-5 h-5 text-green-500" />
              {editingProblem ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Tên bài tập</Label>
              <Input
                value={problemForm.title}
                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                className={cn("mt-1", isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="VD: Tính tổng 2 số"
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
              <Textarea
                value={problemForm.description}
                onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                className={cn("mt-1", isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="Mô tả bài toán..."
                rows={3}
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Độ khó</Label>
              <Select
                value={problemForm.difficulty}
                onValueChange={(v) => setProblemForm({ ...problemForm, difficulty: v })}
              >
                <SelectTrigger className={cn("mt-1", isDark && "bg-slate-800 border-slate-700 text-white")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <SelectItem value="EASY">Dễ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HARD">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Testcases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className={isDark ? "text-slate-300" : ""}>Test Cases</Label>
                <Button size="sm" variant="outline" onClick={handleAddTestcase} className="h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  Thêm
                </Button>
              </div>
              <div className="space-y-3">
                {problemTestcases.map((tc, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                        Testcase #{idx + 1}
                      </span>
                      {problemTestcases.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveTestcase(idx)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                          Input (đầu vào)
                        </Label>
                        <Textarea
                          value={tc.input}
                          onChange={(e) => handleUpdateTestcase(idx, 'input', e.target.value)}
                          className={cn("min-h-[80px] text-sm mt-1", isDark && "bg-slate-900 border-slate-700 text-white")}
                          placeholder={`Ví dụ:
1 2
3 4`}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                          Expected Output (đầu ra mong đợi)
                        </Label>
                        <Textarea
                          value={tc.expectedOutput}
                          onChange={(e) => handleUpdateTestcase(idx, 'expectedOutput', e.target.value)}
                          className={cn("min-h-[80px] text-sm mt-1", isDark && "bg-slate-900 border-slate-700 text-white")}
                          placeholder={`Ví dụ:
3
7`}
                          rows={4}
                        />
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700 flex items-center gap-2">
                      <Checkbox
                        checked={tc.isPublic}
                        onChange={(e) => handleUpdateTestcase(idx, 'isPublic', e.target.checked)}
                        className={isDark ? "ant-checkbox-dark" : ""}
                      />
                      <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        Public testcase (hiển thị cho người dùng)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProblemDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveProblem}
              className="bg-green-600 hover:bg-green-700"
              disabled={saving || !problemForm.title.trim() || problemTestcases.length === 0}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingProblem ? 'Lưu thay đổi' : 'Thêm bài tập'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Problems from Course Dialog */}
      <Dialog open={addFromCourseOpen} onOpenChange={setAddFromCourseOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[80vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? "text-white" : "")}>
              <BookOpen className="w-5 h-5 inline mr-2 text-primary" />
              Thêm bài tập từ khóa học
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              Chọn các bài tập từ khóa học này để thêm vào Final Test. Chỉ hiển thị bài tập chưa thuộc Final Test nào.
            </p>
            {loadingCourseProblems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : courseProblems.length === 0 ? (
              <div className={cn(
                "text-center py-12 rounded-lg",
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
              )}>
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Không có bài tập nào trong khóa học</p>
                <p className="text-sm mt-1">Tạo bài tập trong Minitest trước</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courseProblems.map((problem) => (
                  <label
                    key={problem.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      isDark ? "hover:bg-slate-800 border-slate-700" : "hover:bg-slate-50 border-slate-200",
                      selectedCourseProblems.includes(problem.id) && (isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-300")
                    )}
                  >
                    <Checkbox
                      checked={selectedCourseProblems.includes(problem.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCourseProblems([...selectedCourseProblems, problem.id]);
                        } else {
                          setSelectedCourseProblems(selectedCourseProblems.filter(id => id !== problem.id));
                        }
                      }}
                      className={isDark ? "ant-checkbox-dark" : ""}
                    />
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", isDark ? "text-white" : "")}>
                        {problem.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          problem.difficulty === 'EASY' ? "bg-green-100 text-green-700" :
                          problem.difficulty === 'MEDIUM' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {problem.difficulty === 'EASY' ? 'Dễ' : problem.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                        </span>
                        <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                          {problem.testcases?.length || 0} testcases
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedCourseProblems.length > 0 && (
              <p className={cn("text-sm text-center", isDark ? "text-green-400" : "text-green-600")}>
                Đã chọn {selectedCourseProblems.length} bài tập
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFromCourseOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddSelectedProblems}
              disabled={addingProblems || selectedCourseProblems.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {addingProblems ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Thêm {selectedCourseProblems.length > 0 ? `${selectedCourseProblems.length} ` : ''}bài tập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
