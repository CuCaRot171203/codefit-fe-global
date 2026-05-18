import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Video,
  Code,
  FileText,
  TestTube,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  X,
  GripVertical,
} from 'lucide-react';

interface Testcase {
  id?: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  points?: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'code';
  orderIndex: number;
  testcases?: Testcase[];
  _count?: { testcases: number };
}

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  phases: Phase[];
}

export default function ContentEditorPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [showAddPhase, setShowAddPhase] = useState(false);

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    type: 'video' as 'video' | 'code',
  });

  const [testcases, setTestcases] = useState<Testcase[]>([]);
  const [newTestcase, setNewTestcase] = useState<Testcase>({
    input: '',
    expectedOutput: '',
    isHidden: false,
    points: 10,
  });
  const [showAddTestcase, setShowAddTestcase] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId]);

  const fetchCourse = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.courses}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
        setPhases(data.data.phases || []);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
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

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handleAddPhase = async () => {
    if (!courseId || !newPhaseTitle.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.phases, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, title: newPhaseTitle }),
      });
      const data = await response.json();
      if (data.success) {
        setPhases([...phases, { ...data.data, lessons: [] }]);
        setNewPhaseTitle('');
        setShowAddPhase(false);
      }
    } catch (error) {
      console.error('Error adding phase:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Xóa chương này? Tất cả bài học trong chương sẽ bị xóa.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.phase(phaseId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPhases(phases.filter((p) => p.id !== phaseId));
    } catch (error) {
      console.error('Error deleting phase:', error);
    }
  };

  const handleAddLesson = async (phaseId: string) => {
    if (!lessonForm.title.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.lessons, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...lessonForm, phaseId }),
      });
      const data = await response.json();
      if (data.success) {
        setPhases(phases.map((p) => {
          if (p.id === phaseId) {
            return { ...p, lessons: [...(p.lessons || []), data.data] };
          }
          return p;
        }));
        setLessonForm({ title: '', content: '', type: 'video' });
        setEditingLesson(null);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson || !lessonForm.title.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.lesson(editingLesson.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonForm),
      });
      const data = await response.json();
      if (data.success) {
        setPhases(phases.map((p) => ({
          ...p,
          lessons: p.lessons.map((l) =>
            l.id === editingLesson.id ? { ...l, ...lessonForm } : l
          ),
        })));
        setEditingLesson(null);
        setLessonForm({ title: '', content: '', type: 'video' });
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (phaseId: string, lessonId: string) => {
    if (!confirm('Xóa bài học này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.lesson(lessonId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPhases(phases.map((p) => {
        if (p.id === phaseId) {
          return { ...p, lessons: p.lessons.filter((l) => l.id !== lessonId) };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      type: lesson.type,
    });
  };

  const cancelEdit = () => {
    setEditingLesson(null);
    setLessonForm({ title: '', content: '', type: 'video' });
  };

  // Testcase functions
  const fetchTestcases = async (lessonId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.lessons}/${lessonId}/testcases`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setTestcases(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching testcases:', error);
    }
  };

  const handleAddTestcase = async (lessonId: string) => {
    if (!newTestcase.input || !newTestcase.expectedOutput) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.lessons}/${lessonId}/testcases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTestcase),
      });
      const data = await response.json();
      if (data.success) {
        setTestcases([...testcases, data.data]);
        setNewTestcase({ input: '', expectedOutput: '', isHidden: false, points: 10 });
        setShowAddTestcase(false);
      }
    } catch (error) {
      console.error('Error adding testcase:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestcase = async (lessonId: string, testcaseId: string) => {
    if (!confirm('Xóa testcase này?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.lessons}/${lessonId}/testcases/${testcaseId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTestcases(testcases.filter((tc) => tc.id !== testcaseId));
    } catch (error) {
      console.error('Error deleting testcase:', error);
    }
  };

  const getLessonIcon = (type: string) => {
    return type === 'video'
      ? <Video className="w-4 h-4 text-blue-500" />
      : <Code className="w-4 h-4 text-green-500" />;
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
      "min-h-screen transition-colors duration-300",
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      {/* Header */}
      <div className={cn(
        "sticky top-0 z-10 border-b px-4 lg:px-6 py-4",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/courses')}
              className={cn(
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : ''
              )}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className={cn(
                "text-xl lg:text-2xl font-bold",
                isDark ? 'text-white' : ''
              )}>
                Quản lý nội dung
              </h1>
              <p className={cn(
                "text-sm",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                {course?.title || 'Khóa học'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
        {/* Phases List */}
        <Card className={cn(
          "border",
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
        )}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className={cn(isDark ? 'text-white' : '')}>
                Danh sách chương ({phases.length})
              </CardTitle>
              {!showAddPhase ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPhase(true)}
                  className={cn(
                    isDark
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : ''
                  )}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm chương
                </Button>
              ) : (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Tên chương mới..."
                    value={newPhaseTitle}
                    onChange={(e) => setNewPhaseTitle(e.target.value)}
                    className={cn(
                      "flex-1 md:w-64",
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                        : ''
                    )}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddPhase}
                    disabled={saving || !newPhaseTitle.trim()}
                    className="bg-primary"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddPhase(false);
                      setNewPhaseTitle('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {phases.length === 0 ? (
              <div className={cn(
                "text-center py-8",
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}>
                Chưa có chương nào. Thêm chương đầu tiên để bắt đầu!
              </div>
            ) : (
              phases.map((phase, pIndex) => (
                <div
                  key={phase.id}
                  className={cn(
                    "rounded-lg border overflow-hidden",
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  )}
                >
                  {/* Phase Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 cursor-pointer transition-colors",
                      isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                    )}
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className={cn(
                        "w-5 h-5 cursor-move",
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      )} />
                      {expandedPhases.has(phase.id) ? (
                        <ChevronDown className={cn(
                          "w-5 h-5",
                          isDark ? 'text-slate-400' : 'text-slate-400'
                        )} />
                      ) : (
                        <ChevronRight className={cn(
                          "w-5 h-5",
                          isDark ? 'text-slate-400' : 'text-slate-400'
                        )} />
                      )}
                      <span className={cn(
                        "font-medium",
                        isDark ? 'text-white' : ''
                      )}>
                        Chương {pIndex + 1}: {phase.title}
                      </span>
                      <span className={cn(
                        "text-sm",
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}>
                        ({phase.lessons?.length || 0} bài)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhase(phase.id);
                      }}
                      className={cn(
                        isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-500 hover:text-red-600'
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Phase Content */}
                  {expandedPhases.has(phase.id) && (
                    <div className={cn(
                      "p-4 border-t",
                      isDark ? 'border-slate-700' : 'border-slate-200'
                    )}>
                      {/* Lessons */}
                      {phase.lessons && phase.lessons.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {phase.lessons.map((lesson, lIndex) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "rounded-lg border p-3",
                                isDark
                                  ? 'bg-slate-700 border-slate-600'
                                  : 'bg-white border-slate-200'
                              )}
                            >
                              {/* Lesson Header */}
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleLesson(lesson.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {getLessonIcon(lesson.type)}
                                  <span className={cn(
                                    "font-medium",
                                    isDark ? 'text-white' : ''
                                  )}>
                                    Bài {lIndex + 1}: {lesson.title}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded",
                                    lesson.type === 'video'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700',
                                    isDark && lesson.type === 'video'
                                      ? 'bg-blue-900/50 text-blue-400'
                                      : '',
                                    isDark && lesson.type === 'code'
                                      ? 'bg-green-900/50 text-green-400'
                                      : ''
                                  )}>
                                    {lesson.type === 'video' ? 'Video' : 'Code'}
                                  </span>
                                  {lesson.type === 'code' && (
                                    <span className={cn(
                                      "text-xs flex items-center gap-1",
                                      isDark ? 'text-purple-400' : 'text-purple-600'
                                    )}>
                                      <TestTube className="w-3 h-3" />
                                      {lesson._count?.testcases || 0} testcases
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditLesson(lesson)}
                                    className={cn(
                                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500'
                                    )}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(phase.id, lesson.id)}
                                    className={cn(
                                      isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500'
                                    )}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {expandedLessons.has(lesson.id) ? (
                                    <ChevronDown className={cn(
                                      "w-4 h-4",
                                      isDark ? 'text-slate-400' : 'text-slate-400'
                                    )} />
                                  ) : (
                                    <ChevronRight className={cn(
                                      "w-4 h-4",
                                      isDark ? 'text-slate-400' : 'text-slate-400'
                                    )} />
                                  )}
                                </div>
                              </div>

                              {/* Lesson Content */}
                              {expandedLessons.has(lesson.id) && (
                                <div className={cn(
                                  "mt-4 pt-4 border-t space-y-4",
                                  isDark ? 'border-slate-600' : 'border-slate-200'
                                )}>
                                  {/* Content Preview */}
                                  <div>
                                    <h5 className={cn(
                                      "text-sm font-medium mb-2",
                                      isDark ? 'text-slate-400' : 'text-slate-500'
                                    )}>Nội dung:</h5>
                                    <div className={cn(
                                      "p-3 rounded-lg text-sm max-h-40 overflow-auto",
                                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50'
                                    )}>
                                      {lesson.content || 'Chưa có nội dung'}
                                    </div>
                                  </div>

                                  {/* Testcases Section - Only for code lessons */}
                                  {lesson.type === 'code' && (
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className={cn(
                                          "text-sm font-medium flex items-center gap-2",
                                          isDark ? 'text-slate-400' : 'text-slate-500'
                                        )}>
                                          <TestTube className="w-4 h-4" />
                                          Testcases ({testcases.length})
                                        </h5>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEditingLesson(lesson);
                                            fetchTestcases(lesson.id);
                                            setShowAddTestcase(true);
                                          }}
                                          className={cn(
                                            isDark
                                              ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                                              : ''
                                          )}
                                        >
                                          <Plus className="w-4 h-4 mr-1" />
                                          Thêm testcase
                                        </Button>
                                      </div>

                                      {/* Testcases List */}
                                      {testcases.length > 0 ? (
                                        <div className="space-y-2">
                                          {testcases.map((tc, tcIndex) => (
                                            <div
                                              key={tc.id || tcIndex}
                                              className={cn(
                                                "p-3 rounded-lg text-sm",
                                                isDark ? 'bg-slate-800' : 'bg-slate-50'
                                              )}
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <span className={cn(
                                                  "font-medium",
                                                  isDark ? 'text-slate-300' : ''
                                                )}>
                                                  Testcase {tcIndex + 1}
                                                  {tc.isHidden && (
                                                    <span className={cn(
                                                      "ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700",
                                                      isDark ? 'bg-amber-900/50 text-amber-400' : ''
                                                    )}>
                                                      Hidden
                                                    </span>
                                                  )}
                                                </span>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteTestcase(lesson.id, tc.id!)}
                                                  className={cn(
                                                    "h-6 w-6 p-0",
                                                    isDark ? 'text-red-400' : 'text-red-500'
                                                  )}
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                  <span className={cn(
                                                    "text-xs",
                                                    isDark ? 'text-slate-500' : 'text-slate-400'
                                                  )}>Input:</span>
                                                  <pre className={cn(
                                                    "mt-1 p-2 rounded text-xs overflow-x-auto",
                                                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-white'
                                                  )}>
                                                    {tc.input}
                                                  </pre>
                                                </div>
                                                <div>
                                                  <span className={cn(
                                                    "text-xs",
                                                    isDark ? 'text-slate-500' : 'text-slate-400'
                                                  )}>Expected Output:</span>
                                                  <pre className={cn(
                                                    "mt-1 p-2 rounded text-xs overflow-x-auto",
                                                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-white'
                                                  )}>
                                                    {tc.expectedOutput}
                                                  </pre>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className={cn(
                                          "text-sm text-center py-4",
                                          isDark ? 'text-slate-500' : 'text-slate-400'
                                        )}>
                                          Chưa có testcase nào
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Lesson Form */}
                      {editingLesson?.id && showAddTestcase ? (
                        <div className={cn(
                          "p-4 rounded-lg border space-y-3",
                          isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                        )}>
                          <h5 className={cn(
                            "font-medium flex items-center gap-2",
                            isDark ? 'text-white' : ''
                          )}>
                            <TestTube className="w-4 h-4" />
                            Thêm Testcase mới
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className={cn(isDark ? 'text-slate-300' : '')}>Input</Label>
                              <textarea
                                value={newTestcase.input}
                                onChange={(e) => setNewTestcase({ ...newTestcase, input: e.target.value })}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg min-h-[80px] text-sm",
                                  isDark
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : ''
                                )}
                                placeholder="Nhập input..."
                              />
                            </div>
                            <div>
                              <Label className={cn(isDark ? 'text-slate-300' : '')}>Expected Output</Label>
                              <textarea
                                value={newTestcase.expectedOutput}
                                onChange={(e) => setNewTestcase({ ...newTestcase, expectedOutput: e.target.value })}
                                className={cn(
                                  "w-full px-3 py-2 border rounded-lg min-h-[80px] text-sm",
                                  isDark
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : ''
                                )}
                                placeholder="Nhập expected output..."
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="isHidden"
                                checked={newTestcase.isHidden}
                                onChange={(e) => setNewTestcase({ ...newTestcase, isHidden: e.target.checked })}
                                className="rounded"
                              />
                              <Label
                                htmlFor="isHidden"
                                className={cn(isDark ? 'text-slate-300' : '')}
                              >
                                Hidden testcase
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className={cn(isDark ? 'text-slate-300' : '')}>Points:</Label>
                              <Input
                                type="number"
                                value={newTestcase.points}
                                onChange={(e) => setNewTestcase({ ...newTestcase, points: Number(e.target.value) })}
                                className={cn(
                                  "w-20",
                                  isDark
                                    ? 'bg-slate-800 border-slate-600 text-white'
                                    : ''
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddTestcase(editingLesson.id)}
                              disabled={saving || !newTestcase.input || !newTestcase.expectedOutput}
                              size="sm"
                              className="bg-primary"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              <span className="ml-1">Thêm</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowAddTestcase(false);
                                setNewTestcase({ input: '', expectedOutput: '', isHidden: false, points: 10 });
                              }}
                            >
                              <X className="w-4 h-4" />
                              <span className="ml-1">Hủy</span>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "p-4 rounded-lg border border-dashed space-y-3",
                          isDark
                            ? 'bg-slate-700/30 border-slate-600 border-slate-600'
                            : 'bg-slate-50 border-slate-300'
                        )}>
                          <h5 className={cn(
                            "font-medium",
                            isDark ? 'text-white' : ''
                          )}>Thêm bài học mới</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Tên bài học"
                              value={lessonForm.title}
                              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                              className={cn(
                                isDark
                                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                                  : ''
                              )}
                            />
                            <select
                              value={lessonForm.type}
                              onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as 'video' | 'code' })}
                              className={cn(
                                "px-3 py-2 border rounded-lg",
                                isDark
                                  ? 'bg-slate-700 border-slate-600 text-white'
                                  : ''
                              )}
                            >
                              <option value="video">Video</option>
                              <option value="code">Code (Coding Challenge)</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Nội dung bài học (Markdown được hỗ trợ)..."
                            value={lessonForm.content}
                            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg min-h-[100px]",
                              isDark
                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                                : ''
                            )}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddLesson(phase.id)}
                              disabled={saving || !lessonForm.title.trim()}
                              size="sm"
                              className="bg-primary"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                              <span className="ml-1">Thêm bài học</span>
                            </Button>
                            {editingLesson && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEdit}
                              >
                                Hủy sửa
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
