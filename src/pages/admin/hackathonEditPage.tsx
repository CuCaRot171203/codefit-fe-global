import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input as UIInput } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Select, InputNumber, DatePicker, Upload, message, Modal } from 'antd';
import type { UploadProps } from 'antd';
import { Trophy, ArrowLeft, Loader2, ChevronRight, Layers, Save, Plus, Trash2, Code, FileText, Eye } from 'lucide-react';
import dayjs from 'dayjs';

interface Course {
  id: string;
  title: string;
  phases?: Phase[];
}

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons?: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
  courseId?: string;
  courseTitle?: string;
  phaseTitle?: string;
}

interface Testcase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface ProblemForm {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  codeTemplate: string;
  inputFormat: string;
  outputFormat: string;
  testcases: Testcase[];
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxParticipants: number;
  imageUrl?: string;
  lessonIds?: string;
  problems?: ProblemForm[];
}

export default function HackathonEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [loadingHackathon, setLoadingHackathon] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [selectedLessonDetails, setSelectedLessonDetails] = useState<Lesson[]>([]);
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: dayjs(),
    endTime: dayjs().add(7, 'day'),
    durationMinutes: 120,
    maxParticipants: 100,
    imageUrl: '',
  });

  const [problems, setProblems] = useState<ProblemForm[]>([]);
  const [editingProblem, setEditingProblem] = useState<ProblemForm | null>(null);
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewLessonContent, setPreviewLessonContent] = useState<string>('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHackathon(id);
    }
    fetchCourses();
  }, [id]);

  const fetchHackathon = async (hackathonId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.hackathon(hackathonId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success && data.data) {
        const h = data.data;
        setHackathon(h);
        setForm({
          title: h.title || '',
          description: h.description || '',
          startTime: dayjs(h.startTime),
          endTime: dayjs(h.endTime),
          durationMinutes: h.durationMinutes || 120,
          maxParticipants: h.maxParticipants || 100,
          imageUrl: h.imageUrl || '',
        });
        
        // Parse lessonIds
        if (h.lessonIds) {
          try {
            const parsed = JSON.parse(h.lessonIds);
            const ids = Array.isArray(parsed) ? parsed : [];
            setSelectedLessonIds(ids);
            
            // Also fetch lesson details for display
            const token = localStorage.getItem('token');
            const lessonDetailPromises = ids.map((lessonId: string) =>
              fetch(API_ENDPOINTS.admin.lesson(lessonId), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }).then(res => res.json())
            );
            Promise.all(lessonDetailPromises).then(results => {
              const details = results
                .filter(r => r.success && r.data)
                .map(r => ({
                  id: r.data.id,
                  title: r.data.title,
                  orderIndex: r.data.orderIndex,
                  courseId: r.data.phase?.courseId,
                  courseTitle: r.data.phase?.course?.title,
                  phaseTitle: r.data.phase?.title,
                }));
              setSelectedLessonDetails(details);
            });
          } catch {
            setSelectedLessonIds([]);
            setSelectedLessonDetails([]);
          }
        }
        
        // Parse problems
        if (h.problems && h.problems.length > 0) {
          setProblems(h.problems.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            difficulty: p.difficulty || 'MEDIUM',
            codeTemplate: p.codeTemplate || '// Write your code here\n',
            inputFormat: p.inputFormat || '',
            outputFormat: p.outputFormat || '',
            testcases: (p.testcases || []).map((tc: any) => ({
              id: tc.id,
              input: tc.input || '',
              expectedOutput: tc.expectedOutput || '',
              isPublic: tc.isPublic ?? true,
            })),
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      message.error('Không thể tải thông tin hackathon');
    } finally {
      setLoadingHackathon(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const maxDurationMinutes = form.startTime && form.endTime
    ? Math.floor(dayjs(form.endTime).diff(dayjs(form.startTime), 'minute'))
    : 0;

  const uploadProps: UploadProps = {
    name: 'image',
    action: API_ENDPOINTS.upload.image,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    onChange: (info) => {
      if (info.file.status === 'done') {
        const url = info.file.response?.url || info.file.response?.data?.url;
        if (url) {
          setForm(prev => ({ ...prev, imageUrl: url }));
          message.success('Upload ảnh thành công');
        }
      } else if (info.file.status === 'error') {
        message.error('Upload ảnh thất bại');
      }
    },
  };

  const allLessons = courses.flatMap(course => 
    (course.phases || []).flatMap(phase => 
      (phase.lessons || []).map(lesson => ({
        ...lesson,
        courseId: course.id,
        courseTitle: course.title,
        phaseTitle: phase.title,
      }))
    )
  );

  const toggleLesson = (lessonId: string) => {
    const isSelected = selectedLessonIds.includes(lessonId);
    setSelectedLessonIds(prev => 
      isSelected 
        ? prev.filter(lid => lid !== lessonId)
        : [...prev, lessonId]
    );
    
    // Update selectedLessonDetails
    if (isSelected) {
      setSelectedLessonDetails(prev => prev.filter(l => l.id !== lessonId));
    } else {
      const lesson = allLessons.find(l => l.id === lessonId);
      if (lesson) {
        setSelectedLessonDetails(prev => [...prev, lesson]);
      }
    }
  };

  const handlePreviewLesson = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setPreviewLessonContent('');
    setPreviewModalOpen(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.lessonContent.get(lesson.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.data?.content) {
        setPreviewLessonContent(data.data.content);
      }
    } catch (error) {
      console.error('Error fetching lesson content:', error);
    }
  };

  const openAddProblem = () => {
    setEditingProblem({
      id: '',
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      codeTemplate: '// Write your code here\n',
      inputFormat: '',
      outputFormat: '',
      testcases: [{ input: '', expectedOutput: '', isPublic: true }],
    });
    setProblemModalOpen(true);
  };

  const openEditProblem = (problem: ProblemForm) => {
    setEditingProblem({ ...problem });
    setProblemModalOpen(true);
  };

  const saveProblem = () => {
    if (!editingProblem) return;
    if (!editingProblem.title.trim()) {
      message.warning('Vui lòng nhập tiêu đề bài tập');
      return;
    }

    if (editingProblem.id) {
      setProblems(prev => prev.map(p => p.id === editingProblem.id ? editingProblem : p));
    } else {
      setProblems(prev => [...prev, { ...editingProblem, id: `temp_${Date.now()}` }]);
    }
    setProblemModalOpen(false);
  };

  const deleteProblem = (problemId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài tập này?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: () => {
        setProblems(prev => prev.filter(p => p.id !== problemId));
      },
    });
  };

  const addTestcase = () => {
    if (!editingProblem) return;
    setEditingProblem({
      ...editingProblem,
      testcases: [...editingProblem.testcases, { input: '', expectedOutput: '', isPublic: false }],
    });
  };

  const removeTestcase = (index: number) => {
    if (!editingProblem) return;
    setEditingProblem({
      ...editingProblem,
      testcases: editingProblem.testcases.filter((_, i) => i !== index),
    });
  };

  const updateTestcase = (index: number, field: string, value: string | boolean) => {
    if (!editingProblem) return;
    const newTestcases = [...editingProblem.testcases];
    newTestcases[index] = { ...newTestcases[index], [field]: value };
    setEditingProblem({ ...editingProblem, testcases: newTestcases });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      message.warning('Vui lòng nhập tiêu đề và mô tả');
      return;
    }
    if (form.durationMinutes > maxDurationMinutes) {
      message.warning('Thời gian làm bài không được lớn hơn khoảng thời gian từ bắt đầu đến kết thúc');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: form.title,
        description: form.description,
        startTime: form.startTime.toISOString(),
        endTime: form.endTime.toISOString(),
        durationMinutes: form.durationMinutes,
        maxParticipants: form.maxParticipants,
        imageUrl: form.imageUrl || undefined,
        lessonIds: selectedLessonIds,
        problems: problems.map(p => ({
          id: p.id.startsWith('temp_') ? undefined : p.id,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          codeTemplate: p.codeTemplate,
          inputFormat: p.inputFormat,
          outputFormat: p.outputFormat,
          testcases: p.testcases.filter(tc => tc.input && tc.expectedOutput),
        })),
      };
      
      const response = await fetch(API_ENDPOINTS.admin.hackathon(id!), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Cập nhật hackathon thành công');
        navigate(`/admin/hackathons/${id}`);
      } else {
        message.error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating hackathon:', error);
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    backgroundColor: isDark ? '#334155' : '#fff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    borderColor: isDark ? '#475259' : '#e2e8f0',
  };

  if (loadingHackathon || loadingCourses) {
    return (
      <div className={cn("p-6 flex items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className={cn("p-6 flex flex-col items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Trophy className={cn("w-16 h-16 mb-4", isDark ? 'text-slate-600' : 'text-slate-400')} />
        <p className={cn("text-lg", isDark ? 'text-slate-400' : 'text-slate-600')}>Không tìm thấy hackathon</p>
        <Button onClick={() => navigate('/admin/hackathons')} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b px-6 py-4 backdrop-blur-md",
        isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/hackathons/${id}`)}
              className={isDark ? 'text-slate-300 hover:bg-slate-800' : ''}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isDark ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className={cn("text-xl font-bold", isDark ? 'text-white' : 'text-primary')}>
                  Chỉnh sửa Hackathon
                </h1>
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {hackathon.title}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/hackathons/${id}`)}
              className={isDark ? 'border-slate-600 text-slate-300' : ''}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Info */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Trophy className="w-5 h-5 text-primary" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                    Tiêu đề Hackathon <span className="text-red-500">*</span>
                  </label>
                  <UIInput
                    placeholder="VD: CodeFit Hackathon 2024"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={cn(
                      isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : ''
                    )}
                  />
                </div>

                <div>
                  <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả chi tiết về hackathon..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors",
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-primary'
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                      Thời gian bắt đầu
                    </label>
                    <DatePicker
                      showTime
                      value={form.startTime}
                      onChange={(date) => setForm({ ...form, startTime: date || dayjs() })}
                      className={cn("w-full", isDark ? 'ant-picker-dark' : '')}
                      style={{ ...inputStyles, width: '100%' }}
                    />
                  </div>
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                      Thời gian kết thúc
                    </label>
                    <DatePicker
                      showTime
                      value={form.endTime}
                      onChange={(date) => setForm({ ...form, endTime: date || dayjs() })}
                      className={cn("w-full", isDark ? 'ant-picker-dark' : '')}
                      style={{ ...inputStyles, width: '100%' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                      Thời gian làm bài (phút)
                    </label>
                    <InputNumber
                      min={1}
                      max={maxDurationMinutes || 999}
                      value={form.durationMinutes}
                      onChange={(val) => setForm({ ...form, durationMinutes: val || 120 })}
                      style={inputStyles}
                      className={cn("w-full", isDark ? 'ant-input-number-dark' : '')}
                    />
                    <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Tối đa: {maxDurationMinutes} phút
                    </p>
                  </div>
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                      Số người tối đa
                    </label>
                    <InputNumber
                      min={1}
                      value={form.maxParticipants}
                      onChange={(val) => setForm({ ...form, maxParticipants: val || 100 })}
                      style={inputStyles}
                      className={cn("w-full", isDark ? 'ant-input-number-dark' : '')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons Selection */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Layers className="w-5 h-5 text-primary" />
                  Chọn bài học liên quan ({selectedLessonIds.length} bài)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Selected Lessons Summary */}
                {selectedLessonIds.length > 0 && (
                  <div className="mb-4">
                    <p className={cn("text-sm font-medium mb-2", isDark ? 'text-slate-300' : 'text-slate-700')}>
                      Bài học đã chọn:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLessonIds.map(lessonId => {
                        const lesson = allLessons.find(l => l.id === lessonId) || selectedLessonDetails.find(l => l.id === lessonId);
                        return lesson ? (
                          <div
                            key={lessonId}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm flex items-center gap-2",
                              isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                            )}
                          >
                            <span>{lesson.title}</span>
                            <button
                              onClick={() => handlePreviewLesson(lesson)}
                              className="hover:opacity-70 p-0.5"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleLesson(lessonId)}
                              className="hover:opacity-70"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div
                            key={lessonId}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm flex items-center gap-2",
                              isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                            )}
                          >
                            <span className="truncate max-w-[150px]">{lessonId.slice(0, 8)}...</span>
                            <button
                              onClick={() => toggleLesson(lessonId)}
                              className="hover:opacity-70"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {courses.length === 0 ? (
                  <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Đang tải danh sách khóa học...
                  </p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {courses.map(course => (
                      <div key={course.id} className={cn(
                        "rounded-lg border p-4",
                        isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                      )}>
                        <h4 className={cn("font-medium mb-3", isDark ? 'text-white' : '')}>
                          {course.title}
                        </h4>
                        {course.phases?.map(phase => (
                          <div key={phase.id} className="mb-3 last:mb-0">
                            <h5 className={cn("text-sm font-medium mb-2", isDark ? 'text-slate-300' : 'text-slate-600')}>
                              <ChevronRight className="w-4 h-4 inline mr-1" />
                              {phase.title}
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {phase.lessons?.map(lesson => {
                                const isSelected = selectedLessonIds.includes(lesson.id);
                                return (
                                  <button
                                    key={lesson.id}
                                    onClick={() => toggleLesson(lesson.id)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-sm transition-all",
                                      isSelected
                                        ? 'bg-primary text-white'
                                        : isDark
                                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                                    )}
                                  >
                                    {lesson.title}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problems Section */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                    <Code className="w-5 h-5 text-primary" />
                    Bài tập ({problems.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={openAddProblem}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm bài tập
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {problems.length === 0 ? (
                  <div className={cn(
                    "text-center py-8 rounded-lg border-2 border-dashed",
                    isDark ? 'border-slate-600' : 'border-slate-300'
                  )}>
                    <FileText className={cn("w-12 h-12 mx-auto mb-3", isDark ? 'text-slate-500' : 'text-slate-400')} />
                    <p className={cn("mb-2", isDark ? 'text-slate-300' : 'text-slate-600')}>
                      Chưa có bài tập nào
                    </p>
                    <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Bấm "Thêm bài tập" để tạo bài tập mới
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {problems.map((problem, index) => (
                      <div
                        key={problem.id}
                        className={cn(
                          "p-4 rounded-lg border flex items-center justify-between",
                          isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                          )}>
                            {index + 1}
                          </span>
                          <div>
                            <p className={cn("font-medium", isDark ? 'text-white' : '')}>
                              {problem.title}
                            </p>
                            <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {problem.difficulty} • {problem.testcases.length} testcases
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProblem(problem)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProblem(problem.id)}
                            className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Image Upload */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  Hình ảnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                {form.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={form.imageUrl}
                      alt="Hackathon"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <Upload {...uploadProps} showUploadList={false}>
                  <Button variant="outline" className="w-full">
                    {form.imageUrl ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                  </Button>
                </Upload>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Bài tập</span>
                  <span className={cn("font-medium", isDark ? 'text-white' : '')}>{problems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Testcases</span>
                  <span className={cn("font-medium", isDark ? 'text-white' : '')}>
                    {problems.reduce((sum, p) => sum + p.testcases.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Bài học</span>
                  <span className={cn("font-medium", isDark ? 'text-white' : '')}>{selectedLessonIds.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Problem Modal */}
      <Modal
        title={<span className={isDark ? 'text-white' : ''}>Bài tập</span>}
        open={problemModalOpen}
        onCancel={() => setProblemModalOpen(false)}
        onOk={saveProblem}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
        styles={{
          mask: { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' },
          content: { backgroundColor: isDark ? '#1e293b' : '#fff' },
        }}
      >
        {editingProblem && (
          <div className="space-y-4 py-4">
            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                Tiêu đề bài tập <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="VD: Tính tổng 2 số"
                value={editingProblem.title}
                onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                style={inputStyles}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                Mô tả
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả bài toán..."
                value={editingProblem.description}
                onChange={(e) => setEditingProblem({ ...editingProblem, description: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors",
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-primary'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                Độ khó
              </label>
              <Select
                value={editingProblem.difficulty}
                onChange={(val) => setEditingProblem({ ...editingProblem, difficulty: val })}
                options={[
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                ]}
                style={{ width: '100%', ...inputStyles }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                  Input Format
                </label>
                <Input
                  placeholder="VD: a, b (cách nhau bởi dấu cách)"
                  value={editingProblem.inputFormat}
                  onChange={(e) => setEditingProblem({ ...editingProblem, inputFormat: e.target.value })}
                  style={inputStyles}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                  Output Format
                </label>
                <Input
                  placeholder="VD: Sum of a and b"
                  value={editingProblem.outputFormat}
                  onChange={(e) => setEditingProblem({ ...editingProblem, outputFormat: e.target.value })}
                  style={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                Code Template
              </label>
              <Input.TextArea
                rows={4}
                placeholder="// Write your code here"
                value={editingProblem.codeTemplate}
                onChange={(e) => setEditingProblem({ ...editingProblem, codeTemplate: e.target.value })}
                style={inputStyles}
              />
            </div>

            {/* Testcases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={cn("text-sm font-medium", isDark ? 'text-slate-300' : '')}>
                  Testcases ({editingProblem.testcases.length})
                </label>
                <Button size="sm" onClick={addTestcase}>
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm testcase
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {editingProblem.testcases.map((tc, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border",
                      isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-sm font-medium", isDark ? 'text-slate-300' : '')}>
                        Test {index + 1}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTestcase(index)}
                        className="h-6 w-6"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={cn("text-xs mb-1 block", isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Input
                        </label>
                        <Input.TextArea
                          rows={2}
                          placeholder="Input"
                          value={tc.input}
                          onChange={(e) => updateTestcase(index, 'input', e.target.value)}
                          style={inputStyles}
                        />
                      </div>
                      <div>
                        <label className={cn("text-xs mb-1 block", isDark ? 'text-slate-400' : 'text-slate-500')}>
                          Expected Output
                        </label>
                        <Input.TextArea
                          rows={2}
                          placeholder="Output mong đợi"
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestcase(index, 'expectedOutput', e.target.value)}
                          style={inputStyles}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={tc.isPublic}
                        onChange={(e) => updateTestcase(index, 'isPublic', e.target.checked)}
                        className="rounded"
                      />
                      <span className={cn("text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Public (hiển thị cho thí sinh)
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Lesson Preview Modal */}
      <Modal
        title={<span className={isDark ? 'text-white' : ''}>Xem trước bài học</span>}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        styles={{
          mask: { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' },
          content: { backgroundColor: isDark ? '#1e293b' : '#fff' },
        }}
      >
        {previewLesson && (
          <div className="space-y-4">
            <div>
              <h3 className={cn("text-lg font-semibold mb-1", isDark ? 'text-white' : '')}>
                {previewLesson.title}
              </h3>
              {(previewLesson.courseTitle || previewLesson.phaseTitle) && (
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {previewLesson.courseTitle}
                  {previewLesson.phaseTitle && ` / ${previewLesson.phaseTitle}`}
                </p>
              )}
            </div>
            <div className={cn(
              "p-4 rounded-lg max-h-[400px] overflow-y-auto",
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            )}>
              {previewLessonContent ? (
                <div
                  className={cn("prose prose-sm max-w-none", isDark ? 'prose-invert' : '')}
                  dangerouslySetInnerHTML={{ __html: previewLessonContent }}
                />
              ) : (
                <p className={cn("text-center italic", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Không có nội dung để hiển thị
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
