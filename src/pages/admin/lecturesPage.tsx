import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ENDPOINTS } from '@/config/api';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  Code,
  Loader2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Course {
  id: string;
  title: string;
  _count?: { phases: number };
}

interface Phase {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  course?: { id: string; title: string };
  lessons?: Lesson[];
  _count?: { lessons: number; minitests: number };
}

interface Lesson {
  id: string;
  phaseId: string;
  title: string;
  content: string;
  type: string;
  orderIndex: number;
  phase?: Phase & { course?: { id: string; title: string } };
}

export default function AdminLecturesPage() {
  const { isDark } = useAdmin();
  const [courses, setCourses] = useState<Course[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: 0, level: 'beginner' });
  const [phaseForm, setPhaseForm] = useState({ title: '', courseId: '' });
  const [lessonForm, setLessonForm] = useState({ phaseId: '', title: '', content: '', type: 'video' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchPhasesByCourse(selectedCourseId);
    } else {
      fetchPhases();
    }
  }, [selectedCourseId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch courses
      const coursesRes = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data);
      }

      // Fetch all phases
      await fetchPhases();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhases = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.admin.phases, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPhases(data.data);
      }
    } catch (error) {
      console.error('Error fetching phases:', error);
    }
  };

  const fetchPhasesByCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_ENDPOINTS.admin.phase(courseId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPhases(data.data);
      }
    } catch (error) {
      console.error('Error fetching phases:', error);
    }
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  // Course CRUD
  const handleCreateCourse = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.admin.courses, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (data.success) {
        setCourses([data.data, ...courses]);
        setShowCourseDialog(false);
        setCourseForm({ title: '', description: '', price: 0, level: 'beginner' });
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setSaving(false);
    }
  };

  // Phase CRUD
  const handleCreatePhase = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const phaseData = {
        courseId: phaseForm.courseId || selectedCourseId,
        title: phaseForm.title,
      };
      const res = await fetch(API_ENDPOINTS.admin.phases, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(phaseData),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPhases();
        setShowPhaseDialog(false);
        setPhaseForm({ title: '', courseId: '' });
      }
    } catch (error) {
      console.error('Error creating phase:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Xóa chương này sẽ xóa tất cả bài học bên trong. Tiếp tục?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.admin.phase(phaseId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setPhases(phases.filter((p) => p.id !== phaseId));
      }
    } catch (error) {
      console.error('Error deleting phase:', error);
    }
  };

  // Lesson CRUD
  const handleCreateLesson = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.admin.lessons, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonForm),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPhases();
        setShowLessonDialog(false);
        setLessonForm({ phaseId: '', title: '', content: '', type: 'video' });
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.admin.lesson(lessonId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        await fetchPhases();
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'code':
        return <Code className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredPhases = phases.filter((phase) => {
    const matchesSearch =
      phase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phase.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý nội dung bài học</h1>
          <p className="text-slate-500">
            Quản lý chương học và bài học
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCourseDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm khóa học
          </Button>
          <Button onClick={() => setShowPhaseDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm chương
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Tìm kiếm chương học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">Tất cả khóa học</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {filteredPhases.map((phase) => (
          <Card key={phase.id} className="overflow-hidden">
            {/* Phase Header */}
            <div
              className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="flex items-center gap-3">
                {expandedPhases.has(phase.id) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold">{phase.title}</h3>
                  <p className="text-sm text-slate-500">
                    {phase.course?.title || 'Không xác định'} • {phase._count?.lessons || 0} bài học
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLessonForm({ ...lessonForm, phaseId: phase.id });
                    setShowLessonDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Bài học
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePhase(phase.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lessons List */}
            {expandedPhases.has(phase.id) && (
              <CardContent className="p-0">
                {phase.lessons && phase.lessons.length > 0 ? (
                  <div className="divide-y">
                    {phase.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          {getLessonIcon(lesson.type)}
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            <p className="text-xs text-slate-400">
                              #{lesson.orderIndex + 1} • {lesson.type === 'video' ? 'Video' : 'Code'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có bài học nào</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setLessonForm({ ...lessonForm, phaseId: phase.id });
                        setShowLessonDialog(true);
                      }}
                    >
                      Thêm bài học đầu tiên
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {filteredPhases.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Chưa có chương học nào</p>
            <Button
              variant="link"
              onClick={() => setShowPhaseDialog(true)}
              className="mt-2"
            >
              Tạo chương học đầu tiên
            </Button>
          </Card>
        )}
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm khóa học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên khóa học</Label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="VD: Python cơ bản"
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Input
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Mô tả ngắn về khóa học"
              />
            </div>
            <div className="space-y-2">
              <Label>Giá (VND)</Label>
              <Input
                type="number"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Trình độ</Label>
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="beginner">Người mới</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateCourse} disabled={saving || !courseForm.title}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo khóa học'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Phase Dialog */}
      <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chương mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Khóa học</Label>
              <select
                value={phaseForm.courseId || selectedCourseId}
                onChange={(e) => setPhaseForm({ ...phaseForm, courseId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Chọn khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tên chương</Label>
              <Input
                value={phaseForm.title}
                onChange={(e) => setPhaseForm({ ...phaseForm, title: e.target.value })}
                placeholder="VD: Chương 1 - Giới thiệu"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPhaseDialog(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCreatePhase}
                disabled={saving || !phaseForm.title || !(phaseForm.courseId || selectedCourseId)}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo chương'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bài học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chương</Label>
              <select
                value={lessonForm.phaseId}
                onChange={(e) => setLessonForm({ ...lessonForm, phaseId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Chọn chương</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.title} - {phase.course?.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tên bài học</Label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="VD: Bài 1 - Biến và kiểu dữ liệu"
              />
            </div>
            <div className="space-y-2">
              <Label>Loại bài học</Label>
              <select
                value={lessonForm.type}
                onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="video">Video</option>
                <option value="code">Code</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Nội dung bài học (markdown hoặc text)..."
                className="w-full px-3 py-2 border rounded-lg min-h-[200px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCreateLesson}
                disabled={saving || !lessonForm.phaseId || !lessonForm.title || !lessonForm.content}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo bài học'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
