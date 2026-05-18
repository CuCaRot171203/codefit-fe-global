import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input as UIInput } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { Select, InputNumber, DatePicker, Upload, message, Modal, Input } from 'antd';
import type { UploadProps } from 'antd';
import { Trophy, ArrowLeft, Loader2, Clock, Users, Image, ChevronRight, Layers, Calendar, Save, Plus, Trash2, Code, FileText } from 'lucide-react';
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
}

interface ProblemForm {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  codeTemplate: string;
  inputFormat: string;
  outputFormat: string;
  testcases: { input: string; expectedOutput: string; isPublic: boolean }[];
}

const { RangePicker } = DatePicker;

export default function HackathonCreatePage() {
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: dayjs().add(1, 'day'),
    endTime: dayjs().add(8, 'day'),
    durationMinutes: 120,
    maxParticipants: 100,
    imageUrl: '',
  });

  const [problems, setProblems] = useState<ProblemForm[]>([]);
  const [editingProblem, setEditingProblem] = useState<ProblemForm | null>(null);
  const [problemModalOpen, setProblemModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

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

  // Get all lessons from all courses for selection
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

  const selectedLessons = allLessons.filter(l => selectedLessonIds.includes(l.id));

  const toggleLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Problem management
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
      // Update existing
      setProblems(prev => prev.map(p => p.id === editingProblem.id ? editingProblem : p));
    } else {
      // Add new
      setProblems(prev => [...prev, { ...editingProblem, id: `temp_${Date.now()}` }]);
    }
    setProblemModalOpen(false);
  };

  const deleteProblem = (id: string) => {
    setProblems(prev => prev.filter(p => p.id !== id));
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
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          codeTemplate: p.codeTemplate,
          inputFormat: p.inputFormat,
          outputFormat: p.outputFormat,
          testcases: p.testcases.filter(tc => tc.input && tc.expectedOutput),
        })),
      };
      const response = await fetch(API_ENDPOINTS.admin.hackathons, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        message.success('Thêm hackathon thành công');
        navigate('/admin/hackathons');
      } else {
        message.error(data.message || 'Thêm thất bại');
      }
    } catch (error) {
      console.error('Error adding hackathon:', error);
      message.error('Thêm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    backgroundColor: isDark ? '#334155' : '#fff',
    color: isDark ? '#f1f5f9' : '#1e293b',
    borderColor: isDark ? '#475259' : '#e2e8f0',
  };

  if (loadingCourses) {
    return (
      <div className={cn("p-6 flex items-center justify-center min-h-screen", isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
              onClick={() => navigate('/admin/hackathons')}
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
                  Thêm Hackathon mới
                </h1>
                <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Tạo hackathon mới cho cuộc thi lập trình
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/hackathons')}
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
              Lưu hackathon
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 8/4 Layout */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - 8/12 - Form */}
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
                {courses.length === 0 ? (
                  <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Chưa có khóa học nào
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
                      Bấm "Thêm bài tập" để tạo bài tập mới với format code/input/output
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
                            className="text-red-500 hover:text-red-600"
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

            {/* Time Settings */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Clock className="w-5 h-5 text-primary" />
                  Cài đặt thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                    Thời gian bắt đầu - kết thúc
                  </label>
                  <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    value={[form.startTime, form.endTime]}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        setForm({ ...form, startTime: dates[0], endTime: dates[1] });
                      }
                    }}
                    style={{ width: '100%', ...inputStyles }}
                  />
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
                      style={{ width: '100%', ...inputStyles }}
                    />
                    {maxDurationMinutes > 0 && (
                      <p className={cn("text-xs mt-1", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Tối đa: {maxDurationMinutes} phút
                      </p>
                    )}
                    {form.durationMinutes > maxDurationMinutes && (
                      <p className="text-red-500 text-xs mt-1">
                        Thời gian làm bài không được lớn hơn khoảng thời gian từ bắt đầu đến kết thúc
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", isDark ? 'text-slate-300' : '')}>
                      Số người tối đa
                    </label>
                    <InputNumber
                      min={1}
                      value={form.maxParticipants}
                      onChange={(val) => setForm({ ...form, maxParticipants: val || 100 })}
                      style={{ width: '100%', ...inputStyles }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 4/12 - Preview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Image Preview */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? 'text-white' : '')}>
                  <Image className="w-5 h-5 text-primary" />
                  Ảnh Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Upload {...uploadProps} showUploadList={false}>
                  <Button className="w-full" icon={<Image className="w-4 h-4" />}>
                    Tải lên ảnh
                  </Button>
                </Upload>
                
                <div className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 border-dashed",
                  isDark ? 'border-slate-600 bg-slate-700/50' : 'border-slate-300 bg-slate-50',
                  form.imageUrl ? 'border-solid border-primary' : ''
                )}>
                  {form.imageUrl ? (
                    <img 
                      src={form.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Image className={cn("w-12 h-12 mb-2", isDark ? 'text-slate-500' : 'text-slate-400')} />
                      <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Chưa có ảnh preview
                      </p>
                    </div>
                  )}
                </div>
                
                {form.imageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                  >
                    Xóa ảnh
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Hackathon Preview Card */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                  Xem trước Hackathon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.imageUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={cn(
                    "aspect-video rounded-lg flex items-center justify-center",
                    isDark ? 'bg-slate-700' : 'bg-slate-100'
                  )}>
                    <Trophy className={cn("w-16 h-16", isDark ? 'text-slate-600' : 'text-slate-300')} />
                  </div>
                )}

                <div>
                  <h3 className={cn("font-semibold text-lg mb-1", isDark ? 'text-white' : '')}>
                    {form.title || 'Tiêu đề hackathon'}
                  </h3>
                  <p className={cn("text-sm line-clamp-2", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {form.description || 'Mô tả hackathon sẽ hiển thị ở đây...'}
                  </p>
                </div>

                <div className={cn("pt-2 border-t space-y-2", isDark ? 'border-slate-700' : 'border-slate-200')}>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className={cn("w-4 h-4", isDark ? 'text-slate-400' : 'text-slate-500')} />
                    <span className={isDark ? 'text-slate-300' : ''}>
                      {form.startTime ? form.startTime.format('DD/MM/YYYY HH:mm') : '--/--/---- --:--'}
                    </span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>→</span>
                    <span className={isDark ? 'text-slate-300' : ''}>
                      {form.endTime ? form.endTime.format('DD/MM/YYYY HH:mm') : '--/--/---- --:--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className={cn("w-4 h-4", isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={isDark ? 'text-slate-300' : ''}>{form.durationMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className={cn("w-4 h-4", isDark ? 'text-slate-400' : 'text-slate-500')} />
                      <span className={isDark ? 'text-slate-300' : ''}>{form.maxParticipants} người</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Layers className={cn("w-4 h-4", isDark ? 'text-slate-400' : 'text-slate-500')} />
                    <span className={isDark ? 'text-slate-300' : ''}>
                      {selectedLessonIds.length} bài học
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Code className={cn("w-4 h-4", isDark ? 'text-slate-400' : 'text-slate-500')} />
                    <span className={isDark ? 'text-slate-300' : ''}>
                      {problems.length} bài tập
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Lessons */}
            {selectedLessons.length > 0 && (
              <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
                <CardHeader>
                  <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                    Bài học đã chọn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedLessons.map(lesson => (
                      <div key={lesson.id} className={cn(
                        "p-2 rounded text-sm",
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'
                      )}>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs opacity-60">{lesson.courseTitle} • {lesson.phaseTitle}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : 'bg-white')}>
              <CardHeader>
                <CardTitle className={cn("text-sm", isDark ? 'text-white' : '')}>
                  Lưu ý
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className={cn("text-sm space-y-2", isDark ? 'text-slate-400' : 'text-slate-500')}>
                  <li>• Có thể chọn nhiều bài từ nhiều khóa học khác nhau</li>
                  <li>• Thời gian làm bài không được vượt quá khoảng thời gian hackathon</li>
                  <li>• Bài tập có thể thêm sau khi tạo hackathon</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Problem Modal */}
      <Modal
        open={problemModalOpen}
        onCancel={() => setProblemModalOpen(false)}
        title={<span className={isDark ? 'text-white' : ''}>Thêm/Sửa Bài tập</span>}
        styles={{
          mask: { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' },
          content: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        }}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setProblemModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={saveProblem}>
            Lưu bài tập
          </Button>
        ]}
      >
        {editingProblem && (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                Tiêu đề bài tập <span className="text-red-500">*</span>
              </label>
              <UIInput
                placeholder="VD: Tính tổng hai số"
                value={editingProblem.title}
                onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                style={inputStyles}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                Mức độ khó
              </label>
              <Select
                value={editingProblem.difficulty}
                onChange={(val) => setEditingProblem({ ...editingProblem, difficulty: val })}
                options={[
                  { value: 'EASY', label: 'Dễ' },
                  { value: 'MEDIUM', label: 'Trung bình' },
                  { value: 'HARD', label: 'Khó' },
                ]}
                style={{ width: '100%', ...inputStyles }}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                Mô tả bài tập
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả chi tiết yêu cầu bài toán..."
                value={editingProblem.description}
                onChange={(e) => setEditingProblem({ ...editingProblem, description: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg resize-none transition-colors",
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:border-primary'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary'
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                Code template (khởi tạo)
              </label>
              <textarea
                rows={5}
                placeholder="// Starter code&#10;// Write your solution here"
                value={editingProblem.codeTemplate}
                onChange={(e) => setEditingProblem({ ...editingProblem, codeTemplate: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg font-mono text-sm resize-none transition-colors",
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:border-primary'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary'
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                  Format Input
                </label>
                <UIInput
                  placeholder="VD: a b (2 số nguyên)"
                  value={editingProblem.inputFormat}
                  onChange={(e) => setEditingProblem({ ...editingProblem, inputFormat: e.target.value })}
                  style={inputStyles}
                />
              </div>
              <div>
                <label className={cn("block text-sm font-medium mb-1", isDark ? 'text-slate-300' : '')}>
                  Format Output
                </label>
                <UIInput
                  placeholder="VD: sum (tổng 2 số)"
                  value={editingProblem.outputFormat}
                  onChange={(e) => setEditingProblem({ ...editingProblem, outputFormat: e.target.value })}
                  style={inputStyles}
                />
              </div>
            </div>

            {/* Testcases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={cn("text-sm font-medium", isDark ? 'text-slate-300' : '')}>
                  Testcases ({editingProblem.testcases.length})
                </label>
                <Button size="sm" onClick={addTestcase} className="bg-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm
                </Button>
              </div>
              <div className="space-y-3">
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
                        Testcase {index + 1}
                      </span>
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTestcase(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
                        Hiển thị cho user
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
