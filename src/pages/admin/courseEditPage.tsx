import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Video,
  Code,
  ChevronDown,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
  Users,
  UserPlus,
  UserMinus,
  Eye,
  KeyRound,
  Settings,
  Trophy,
  FolderOpen,
  Edit,
} from 'lucide-react';
import { UnlockCodePanel } from '@/components/admin/UnlockCodePanel';
import { message, notification, Modal, DatePicker, ConfigProvider, theme as antTheme } from 'antd';
import dayjs from 'dayjs';

// Convert image file to WebP format
const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

interface Phase {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
  minitests?: {
    id: string;
    title: string;
    questions: { id: string; problemId: string; problem: Problem }[];
  }[];
  _count?: { lessons: number; minitests: number };
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems?: Problem[];
  _count?: { participants: number; submissions: number };
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testcases?: Testcase[];
}

interface Testcase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  submissions?: ProjectSubmission[];
  _count?: { submissions: number };
}

interface ProjectSubmission {
  id: string;
  userId: string;
  user?: { fullName: string; email: string };
  fileUrl: string;
  status: string;
  submittedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  orderIndex: number;
  lessonContent?: {
    id: string;
    content: string;
    testCases: string;
    hints: string;
    starterCode: string;
    timeLimit: number | null;
    memoryLimit: number | null;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  duration: string;
  level: string;
  subscriptionType?: string;
  subscriptionPrice?: number;
  autoEnrollOnApproval?: boolean;
  // Progressive unlock config
  unlockLessonsCount?: number;
  unlockByPhase?: boolean;
  features?: string;
  includes?: string;
  creator?: { id: string; fullName: string; email: string };
  phases: Phase[];
  hackathons?: Hackathon[];
  projects?: Project[];
  _count?: { enrollments: number };
}

// Auto-expanding textarea hook
function useAutoResize(textareaRef: React.RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [textareaRef.current?.value]);
}

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lecture assignment states
  const [lectures, setLectures] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [assignedLectures, setAssignedLectures] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [showLectureSelect, setShowLectureSelect] = useState(false);
  const [assigningLecture, setAssigningLecture] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    image: '',
    duration: '',
    level: 'beginner',
    subscriptionType: 'PREMIUM',
    subscriptionPrice: 0,
    autoEnrollOnApproval: true,
    unlockLessonsCount: 3,
    unlockByPhase: false,
    features: '',
    includes: '',
    isFreeCourse: false,
  });

  const [featuresList, setFeaturesList] = useState([
    { title: 'Nội dung chất lượng', description: 'Học với những kiến thức thực tế và cập nhật', bgColor: 'bg-slate-100 dark:bg-slate-700', textColor: '' },
    { title: 'Bài tập thực hành', description: 'Áp dụng ngay những gì đã học', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
    { title: 'Hỗ trợ 24/7', description: 'Đội ngũ hỗ trợ luôn sẵn sàng', bgColor: 'bg-slate-100 dark:bg-slate-700', textColor: '' },
  ]);

  const [includesList, setIncludesList] = useState([
    { icon: 'Video', text: 'Video bài giảng chất lượng cao' },
    { icon: 'FileText', text: 'Tài liệu PDF & Code mẫu' },
    { icon: 'ListChecks', text: 'Bài kiểm tra kiến thức' },
    { icon: 'Award', text: 'Chứng chỉ CodeFit chuyên nghiệp' },
  ]);

  const [phases, setPhases] = useState<Phase[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newLessonData, setNewLessonData] = useState({ phaseId: '', title: '', content: '', type: 'video' });
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);

  // Lesson detail dialog
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonLoading, _setLessonLoading] = useState(false);

  // Lesson edit request dialog
  const [lessonEditRequestOpen, setLessonEditRequestOpen] = useState(false);
  const [editRequestLessonId, setEditRequestLessonId] = useState('');
  const [editRequestLessonTitle, setEditRequestLessonTitle] = useState('');
  const [editRequestLectureId, setEditRequestLectureId] = useState('');
  const [editRequestNotes, setEditRequestNotes] = useState('');
  const [editRequestDueDate, setEditRequestDueDate] = useState<dayjs.Dayjs | null>(null);
  const [savingEditRequest, setSavingEditRequest] = useState(false);

  // Unlock code dialog
  const [unlockCodeOpen, setUnlockCodeOpen] = useState(false);

  // Final Test dialog
  const [finalTestOpen, setFinalTestOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [finalTestData, setFinalTestData] = useState({
    title: 'Final Test - Web Development Bootcamp',
    description: 'Bài kiểm tra tổng hợp cuối khóa',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  // Auto-determine subscriptionType based on isFreeCourse or price
  useEffect(() => {
    if (formData.isFreeCourse || formData.price === 0) {
      setFormData(prev => ({ ...prev, subscriptionType: 'FREE' }));
    } else {
      setFormData(prev => ({ ...prev, subscriptionType: 'PREMIUM' }));
    }
  }, [formData.isFreeCourse, formData.price]);

  // Problem dialog for Final Test
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [editingProblem] = useState<Problem | null>(null);
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    testcases: [{ input: '', expectedOutput: '', isPublic: true }],
  });

  // Final Project dialog
  const [finalProjectOpen, setFinalProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [finalProjectData, setFinalProjectData] = useState({
    title: 'Final Project - Dự án cuối khóa',
    description: '',
  });

  // Project detail dialog (view submissions)
  const [projectDetailOpen, setProjectDetailOpen] = useState(false);
  const [projectSubmissions] = useState<ProjectSubmission[]>([]);
  const [loadingSubmissions] = useState(false);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const lessonContentRef = useRef<HTMLTextAreaElement>(null);

  useAutoResize(descriptionRef);
  useAutoResize(lessonContentRef);

  useEffect(() => {
    if (id) {
      fetchCourse(id);
    } else {
      setLoading(false);
      setIsNewCourse(true);
    }
  }, [id]);

  const handleImageUpload = useCallback(async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      message.error('Chỉ hỗ trợ file ảnh: JPG, PNG, WEBP');
      return;
    }

    // Preview local file
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const fetchCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.courses}/${courseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
        setFormData({
          title: data.data.title || '',
          description: data.data.description || '',
          price: data.data.price || 0,
          originalPrice: data.data.originalPrice || 0,
          image: data.data.image || '',
          duration: data.data.duration || '',
          level: data.data.level || 'beginner',
          subscriptionType: data.data.subscriptionType || 'FREE',
          subscriptionPrice: data.data.subscriptionPrice || 0,
          autoEnrollOnApproval: data.data.autoEnrollOnApproval !== false,
          unlockLessonsCount: data.data.unlockLessonsCount ?? 3,
          unlockByPhase: data.data.unlockByPhase ?? false,
          features: data.data.features || '',
          includes: data.data.includes || '',
          isFreeCourse: data.data.subscriptionType === 'FREE',
        });

        // Load features and includes
        if (data.data.features) {
          try {
            const parsed = JSON.parse(data.data.features);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFeaturesList(parsed);
            }
          } catch {}
        }
        if (data.data.includes) {
          try {
            const parsed = JSON.parse(data.data.includes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setIncludesList(parsed);
            }
          } catch {}
        }
        setPhases(data.data.phases || []);
        setHackathons(data.data.hackathons || []);
        setProjects(data.data.projects || []);
        if (data.data.image) {
          setImagePreview(data.data.image);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      message.error('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = useCallback(async () => {
    setLoadingLectures(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.lectures, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setLectures(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoadingLectures(false);
    }
  }, []);

  const fetchAssignedLectures = useCallback(async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.courseLectures(courseId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setAssignedLectures(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assigned lectures:', error);
    }
  }, []);

  const handleAssignLecture = async (lectureId: string) => {
    if (!id) return;
    
    setAssigningLecture(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(lectureId, id), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      
      if (data.success) {
        notification.success({
          message: '✅ Giao khóa học thành công!',
          description: 'Giảng viên đã được gán và sẽ nhận được thông báo.',
          placement: 'topRight',
          duration: 3,
        });
        await fetchAssignedLectures(id);
        setShowLectureSelect(false);
      } else {
        notification.error({
          message: '❌ Lỗi',
          description: data.message || 'Giao khóa học thất bại',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error assigning lecture:', error);
      notification.error({
        message: '❌ Lỗi',
        description: 'Không thể giao khóa học',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setAssigningLecture(false);
    }
  };

  const handleUnassignLecture = async (lectureId: string) => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.assignCourse(lectureId, id), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      
      if (data.success) {
        notification.success({
          message: '✅ Đã gỡ giảng viên',
          description: 'Giảng viên đã được gỡ khỏi khóa học.',
          placement: 'topRight',
          duration: 3,
        });
        await fetchAssignedLectures(id);
      } else {
        notification.error({
          message: '❌ Lỗi',
          description: data.message || 'Gỡ giảng viên thất bại',
          placement: 'topRight',
          duration: 3,
        });
      }
    } catch (error) {
      console.error('Error unassigning lecture:', error);
      notification.error({
        message: '❌ Lỗi',
        description: 'Không thể gỡ giảng viên',
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  // Fetch lectures when editing existing course
  useEffect(() => {
    if (id && !isNewCourse) {
      fetchAssignedLectures(id);
    }
  }, [id, isNewCourse, fetchAssignedLectures]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên khóa học không được trống';
    }

    if (formData.price < 0) {
      newErrors.price = 'Giá không được âm';
    }

    if (formData.originalPrice < 0) {
      newErrors.originalPrice = 'Giá gốc không được âm';
    }

    // subscriptionType is auto-determined, no manual validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCourse = async () => {
    if (!validateForm()) {
      message.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      // Upload image if there's a new file selected
      let finalImage = formData.image;
      if (imageFile) {
        setUploadingImage(true);
        try {
          // Convert to WebP
          const webpBlob = await convertToWebP(imageFile);
          const webpFile = new File([webpBlob], `${imageFile.name.split('.')[0]}.webp`, { type: 'image/webp' });

          const uploadFormData = new FormData();
          uploadFormData.append('image', webpFile);

          const uploadResponse = await fetch(API_ENDPOINTS.upload.image, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalImage = uploadData.data?.url || uploadData.url;
          } else {
            message.error('Upload ảnh thất bại, vui lòng thử lại');
            setSaving(false);
            setUploadingImage(false);
            return;
          }
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          message.error('Upload ảnh thất bại');
          setSaving(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const courseData = {
        ...formData,
        image: finalImage,
        features: JSON.stringify(featuresList),
        includes: JSON.stringify(includesList),
      };

      if (isNewCourse) {
        const response = await fetch(API_ENDPOINTS.admin.courses, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        });
        const data = await response.json();
        if (data.success) {
          notification.success({
            message: '🎉 Tạo khóa học thành công!',
            description: 'Khóa học đã được tạo và sẽ chuyển về trang danh sách...',
            placement: 'topRight',
            duration: 3,
            style: {
              fontSize: '16px',
              marginTop: '70px',
            },
          });
          setTimeout(() => {
            navigate('/admin/courses');
          }, 1500);
        } else {
          message.error(data.message || 'Tạo khóa học thất bại');
        }
      } else {
        const response = await fetch(`${API_ENDPOINTS.admin.courses}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        });
        const data = await response.json();
        if (data.success) {
          notification.success({
            message: '💾 Lưu thành công!',
            description: 'Thay đổi đã được lưu.',
            placement: 'topRight',
            duration: 3,
            style: {
              fontSize: '16px',
              marginTop: '70px',
            },
          });
          setTimeout(() => {
            navigate('/admin/courses');
          }, 1500);
        } else {
          message.error(data.message || 'Lưu thất bại');
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhase = async () => {
    if (!id || !newPhaseTitle.trim()) {
      message.warning('Vui lòng lưu khóa học trước khi thêm chương');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.phases, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id, title: newPhaseTitle }),
      });
      const data = await response.json();
      if (data.success) {
        setPhases([...phases, { ...data.data, lessons: [] }]);
        setNewPhaseTitle('');
        message.success('Đã thêm chương mới');
      }
    } catch (error) {
      console.error('Error adding phase:', error);
      message.error('Thêm chương thất bại');
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(API_ENDPOINTS.admin.phase(phaseId), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPhases(phases.filter((p) => p.id !== phaseId));
      message.success('Đã xóa chương');
    } catch (error) {
      console.error('Error deleting phase:', error);
      message.error('Xóa chương thất bại');
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonData.phaseId || !newLessonData.title || !newLessonData.content) {
      message.warning('Vui lòng điền đầy đủ thông tin bài học');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.lessons, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLessonData),
      });
      const data = await response.json();
      if (data.success) {
        setPhases(phases.map((p) => {
          if (p.id === newLessonData.phaseId) {
            return { ...p, lessons: [...(p.lessons || []), data.data] };
          }
          return p;
        }));
        setNewLessonData({ phaseId: '', title: '', content: '', type: 'video' });
        setShowAddLesson(null);
        message.success('Đã thêm bài học');
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      message.error('Thêm bài học thất bại');
    }
  };

  const handleDeleteLesson = async (phaseId: string, lessonId: string) => {
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
      message.success('Đã xóa bài học');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      message.error('Xóa bài học thất bại');
    }
  };

  // Handle create Final Test (Hackathon)
  const handleCreateFinalTest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.hackathons, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: id,
          title: finalTestData.title,
          description: finalTestData.description,
          startTime: new Date(finalTestData.startTime).toISOString(),
          endTime: new Date(finalTestData.endTime).toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setHackathons([...hackathons, data.data]);
        setFinalTestOpen(false);
        message.success('Đã tạo Final Test');
      } else {
        message.error(data.message || 'Tạo Final Test thất bại');
      }
    } catch (error) {
      console.error('Error creating final test:', error);
      message.error('Tạo Final Test thất bại');
    }
  };

  // Handle delete Final Test
  const handleDeleteFinalTest = async (hackathonId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.hackathon(hackathonId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setHackathons(hackathons.filter((h) => h.id !== hackathonId));
      message.success('Đã xóa Final Test');
    } catch (error) {
      console.error('Error deleting final test:', error);
      message.error('Xóa Final Test thất bại');
    }
  };

  // Handle create Final Project
  const handleCreateFinalProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.projects, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: id,
          title: finalProjectData.title,
          description: finalProjectData.description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setProjects([...projects, data.data]);
        setFinalProjectOpen(false);
        message.success('Đã tạo Final Project');
      } else {
        message.error(data.message || 'Tạo Final Project thất bại');
      }
    } catch (error) {
      console.error('Error creating final project:', error);
      message.error('Tạo Final Project thất bại');
    }
  };

  // Handle delete Final Project
  const handleDeleteFinalProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_ENDPOINTS.admin.project(projectId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProjects(projects.filter((p) => p.id !== projectId));
      message.success('Đã xóa Final Project');
    } catch (error) {
      console.error('Error deleting final project:', error);
      message.error('Xóa Final Project thất bại');
    }
  };

  // Handle open edit Final Test
  const handleEditFinalTest = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon);
    setFinalTestData({
      title: hackathon.title,
      description: hackathon.description || '',
      startTime: new Date(hackathon.startTime).toISOString().slice(0, 16),
      endTime: new Date(hackathon.endTime).toISOString().slice(0, 16),
    });
    setFinalTestOpen(true);
  };

  // Handle update Final Test
  const handleUpdateFinalTest = async () => {
    if (!editingHackathon) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.hackathon(editingHackathon.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTestData.title,
          description: finalTestData.description,
          startTime: new Date(finalTestData.startTime).toISOString(),
          endTime: new Date(finalTestData.endTime).toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setHackathons(hackathons.map(h =>
          h.id === editingHackathon.id ? { ...h, ...data.data } : h
        ));
        setFinalTestOpen(false);
        setEditingHackathon(null);
        message.success('Đã cập nhật Final Test');
      }
    } catch (error) {
      console.error('Error updating final test:', error);
      message.error('Cập nhật thất bại');
    }
  };

  // Handle add testcase
  const handleAddTestcase = () => {
    setProblemData({
      ...problemData,
      testcases: [...problemData.testcases, { input: '', expectedOutput: '', isPublic: true }],
    });
  };

  // Handle remove testcase
  const handleRemoveTestcase = (index: number) => {
    setProblemData({
      ...problemData,
      testcases: problemData.testcases.filter((_, i) => i !== index),
    });
  };

  // Handle update testcase
  const handleUpdateTestcase = (index: number, field: 'input' | 'expectedOutput' | 'isPublic', value: string | boolean) => {
    const newTestcases = [...problemData.testcases];
    newTestcases[index] = { ...newTestcases[index], [field]: value };
    setProblemData({ ...problemData, testcases: newTestcases });
  };

  // Handle save problem
  const handleSaveProblem = async () => {
    if (!editingHackathon) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.admin.problems, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: problemData.title,
          description: problemData.description,
          difficulty: problemData.difficulty,
          testcases: problemData.testcases,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh hackathon data
        const hackathonRes = await fetch(`${API_ENDPOINTS.admin.hackathon(editingHackathon.id)}`);
        const hackathonData = await hackathonRes.json();
        if (hackathonData.success) {
          setHackathons(hackathons.map(h =>
            h.id === editingHackathon!.id ? hackathonData.data : h
          ));
        }
        setProblemDialogOpen(false);
        message.success(editingProblem ? 'Đã cập nhật bài tập' : 'Đã thêm bài tập');
      }
    } catch (error) {
      console.error('Error saving problem:', error);
      message.error('Lưu bài tập thất bại');
    }
  };

  // Handle update project
  const handleUpdateProject = async () => {
    if (!editingProject) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.admin.project(editingProject.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalProjectData.title,
          description: finalProjectData.description,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setProjects(projects.map(p =>
          p.id === editingProject!.id ? { ...p, ...data.data } : p
        ));
        setFinalProjectOpen(false);
        setEditingProject(null);
        message.success('Đã cập nhật Final Project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      message.error('Cập nhật thất bại');
    }
  };

  // Handle open edit project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFinalProjectData({
      title: project.title,
      description: project.description || '',
    });
    setFinalProjectOpen(true);
  };

  // Handle view lesson detail
  const handleViewLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonDetailOpen(true);
  };

  // Open lesson edit request dialog
  const handleOpenLessonEditRequest = async (lesson: Lesson) => {
    setEditRequestLessonId(lesson.id);
    setEditRequestLessonTitle(lesson.title);
    setEditRequestLectureId('');
    setEditRequestNotes('');
    setEditRequestDueDate(null);
    setLessonEditRequestOpen(true);
    // Fetch lectures list if not already loaded
    if (lectures.length === 0) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_ENDPOINTS.admin.users}?role=lecture`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLectures(data.data);
        }
      } catch {
        // ignore
      }
    }
  };

  // Submit lesson edit request
  const handleSubmitLessonEditRequest = async () => {
    if (!editRequestLectureId) {
      message.warning('Vui lòng chọn giảng viên');
      return;
    }
    if (!editRequestLessonId) {
      message.warning('Không tìm thấy bài học');
      return;
    }
    setSavingEditRequest(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.lessonRequests.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId: editRequestLectureId,
          lessonId: editRequestLessonId,
          dueDate: editRequestDueDate ? editRequestDueDate.toISOString() : undefined,
          notes: editRequestNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success('Đã tạo yêu cầu sửa bài học');
        setLessonEditRequestOpen(false);
      } else {
        message.error(data.message || 'Tạo yêu cầu thất bại');
      }
    } catch {
      message.error('Tạo yêu cầu thất bại');
    } finally {
      setSavingEditRequest(false);
    }
  };

  // Navigate to lesson editor (admin direct edit)
  const handleEditLesson = (lessonId: string) => {
    navigate(`/admin/courses/${id}/lessons/${lessonId}/edit`);
  };

  // Wrap delete handlers with Modal.confirm
  const confirmDeletePhase = (phaseId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa chương',
      content: 'Bạn có chắc chắn muốn xóa chương này? Toàn bộ bài học trong chương sẽ bị xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDeletePhase(phaseId),
    });
  };

  const confirmDeleteLesson = (phaseId: string, lessonId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa bài học',
      content: 'Bạn có chắc chắn muốn xóa bài học này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDeleteLesson(phaseId, lessonId),
    });
  };

  const confirmDeleteFinalTest = (hackathonId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa Final Test',
      content: 'Bạn có chắc chắn muốn xóa Final Test này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDeleteFinalTest(hackathonId),
    });
  };

  const confirmDeleteFinalProject = (projectId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa Final Project',
      content: 'Bạn có chắc chắn muốn xóa Final Project này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDeleteFinalProject(projectId),
    });
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

  const getLessonIcon = (type: string) => {
    return type === 'video'
      ? <Video className="w-4 h-4 text-blue-500" />
      : <Code className="w-4 h-4 text-green-500" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
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
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin/courses')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
          {isNewCourse ? 'Tạo khóa học mới' : 'Sửa khóa học'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left: Course Info & Phases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={isDark ? "text-slate-300" : ""}>Tên khóa học *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="VD: Lập trình JavaScript cơ bản"
                  className={cn(
                    isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
                <Textarea
                  id="description"
                  ref={descriptionRef}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về khóa học..."
                  className={cn(
                    "min-h-[80px] resize-none transition-none",
                    isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className={isDark ? "text-slate-300" : ""}>Hình ảnh khóa học</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <div
                  className={cn(
                    "relative aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                    isDark
                      ? "border-slate-600 hover:border-cyan-500 bg-slate-800/50"
                      : "border-slate-300 hover:border-cyan-500 bg-slate-50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                      <Upload className="w-10 h-10" />
                      <p className="text-sm">Kéo thả hoặc click để chọn ảnh</p>
                      <p className="text-xs">(JPG, PNG, WEBP - sẽ convert sang WebP)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className={isDark ? "text-slate-300" : ""}>Giá gốc (VNĐ)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    disabled={formData.isFreeCourse}
                    value={formData.originalPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0) {
                        setFormData({ ...formData, originalPrice: val });
                        if (errors.originalPrice) setErrors({ ...errors, originalPrice: '' });
                      }
                    }}
                    className={cn(
                      isDark && "bg-slate-800 border-slate-700 text-white"
                    )}
                  />
                  {errors.originalPrice && (
                    <p className="text-sm text-red-500">{errors.originalPrice}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className={isDark ? "text-slate-300" : ""}>Giá bán (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    disabled={formData.isFreeCourse}
                    value={formData.price}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0) {
                        setFormData({ ...formData, price: val });
                        if (errors.price) setErrors({ ...errors, price: '' });
                      }
                    }}
                    className={cn(
                      isDark && "bg-slate-800 border-slate-700 text-white"
                    )}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className={isDark ? "text-slate-300" : ""}>Thời lượng</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="VD: 40 Giờ học"
                    className={cn(
                      isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={isDark ? "text-slate-300" : ""}>Trình độ</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger className={cn(
                      isDark && "bg-slate-800 border-slate-700 text-white"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                      <SelectItem value="beginner">Người mới</SelectItem>
                      <SelectItem value="intermediate">Trung cấp</SelectItem>
                      <SelectItem value="advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Course Toggle */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>Loại khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                <div>
                  <Label
                    htmlFor="isFreeCourse"
                    className={cn(
                      "cursor-pointer font-bold text-base",
                      isDark ? "text-orange-300" : "text-orange-700"
                    )}
                  >
                    KHÓA HỌC MIỄN PHÍ
                  </Label>
                  <p className={cn(
                    "text-xs mt-1",
                    isDark ? "text-orange-400/70" : "text-orange-600"
                  )}>
                    Tích chọn để khóa học miễn phí. Giá gốc và giá bán sẽ là 0, subscription sẽ bị vô hiệu hóa.
                  </p>
                </div>
                <Switch
                  id="isFreeCourse"
                  checked={formData.isFreeCourse}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      isFreeCourse: checked,
                      price: checked ? 0 : (prev.price || 0),
                      originalPrice: checked ? 0 : (prev.originalPrice || 0),
                      subscriptionPrice: checked ? 0 : (prev.subscriptionPrice || 0),
                    }));
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Settings */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>Cài đặt khóa học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <Label htmlFor="autoEnroll" className={cn(
                  "cursor-pointer",
                  isDark ? "text-slate-300" : ""
                )}>
                  Tự động thêm học viên khi bài học được duyệt
                </Label>
                <Switch
                  id="autoEnroll"
                  checked={formData.autoEnrollOnApproval}
                  disabled={formData.isFreeCourse}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoEnrollOnApproval: checked })}
                />
              </div>

              {/* Progressive Unlock Settings */}
              <div className="space-y-3">
                <Label className={cn(
                  "font-medium",
                  isDark ? "text-slate-300" : ""
                )}>
                  Cài đặt mở khóa bài học
                </Label>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <Label htmlFor="unlockByPhase" className={cn(
                      "cursor-pointer font-medium",
                      isDark ? "text-slate-300" : ""
                    )}>
                      Mở khóa theo chương
                    </Label>
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {formData.unlockByPhase
                        ? "Mở toàn bộ chương khi hoàn thành chương trước"
                        : "Mỗi lượt sẽ mở một số bài nhất định"}
                    </p>
                  </div>
                  <Switch
                    id="unlockByPhase"
                    checked={formData.unlockByPhase || false}
                    disabled={formData.isFreeCourse}
                    onCheckedChange={(checked) => setFormData({ ...formData, unlockByPhase: checked })}
                  />
                </div>

                {/* Số bài mở khóa - chỉ hiện khi KHÔNG mở khóa theo chương */}
                {!formData.unlockByPhase && (
                  <div className="flex items-center gap-4">
                    <Label htmlFor="unlockCount" className={cn(
                      "text-sm whitespace-nowrap",
                      isDark ? "text-slate-400" : "text-slate-600"
                    )}>
                      Số bài mở khóa mỗi lượt:
                    </Label>
                    <Input
                      id="unlockCount"
                      type="number"
                      min={0}
                      max={100}
                      value={formData.unlockLessonsCount || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        unlockLessonsCount: parseInt(e.target.value) || 0
                      })}
                      className={cn(
                        "w-24",
                        isDark && "bg-slate-800 border-slate-700 text-white"
                      )}
                    />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      (0 = không giới hạn)
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features & Includes */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>Tổng quan & Bao gồm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                Cấu hình nội dung hiển thị trên trang chi tiết khóa học cho người dùng.
              </p>

              {/* Features */}
              <div>
                <Label className={cn(isDark ? "text-slate-300" : "")}>
                  Tổng quan khóa học (3 ô)
                </Label>
                <p className={cn("text-xs mb-2", isDark ? "text-slate-500" : "text-slate-400")}>
                  Hiển thị 3 ô thông tin nổi bật trên trang chi tiết.
                </p>
                {featuresList.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      placeholder={`Tiêu đề ${i + 1}`}
                      value={f.title}
                      onChange={(e) => {
                        const updated = [...featuresList];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setFeaturesList(updated);
                      }}
                      className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                    />
                    <Input
                      placeholder={`Mô tả ${i + 1}`}
                      value={f.description}
                      onChange={(e) => {
                        const updated = [...featuresList];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setFeaturesList(updated);
                      }}
                      className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                    />
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div>
                <Label className={cn(isDark ? "text-slate-300" : "")}>
                  Khóa học bao gồm (4 mục)
                </Label>
                <p className={cn("text-xs mb-2", isDark ? "text-slate-500" : "text-slate-400")}>
                  Các quyền lợi khi đăng ký khóa học (Video, Tài liệu, Kiểm tra, Chứng chỉ).
                </p>
                {includesList.map((inc, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      placeholder={`Tên quyền lợi ${i + 1}`}
                      value={inc.text}
                      onChange={(e) => {
                        const updated = [...includesList];
                        updated[i] = { ...updated[i], text: e.target.value };
                        setIncludesList(updated);
                      }}
                      className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveCourse}
            disabled={saving || uploadingImage}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {saving || uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {uploadingImage ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : isNewCourse ? 'Tạo khóa học' : 'Lưu thay đổi'}
          </Button>

          {/* Phases & Lessons */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className={isDark ? "text-white" : ""}>Nội dung khóa học</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tên chương mới..."
                    value={newPhaseTitle}
                    onChange={(e) => setNewPhaseTitle(e.target.value)}
                    className={cn(
                      "w-48",
                      isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    )}
                  />
                  <Button
                    onClick={handleAddPhase}
                    disabled={!newPhaseTitle.trim() || isNewCourse}
                    size="sm"
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm
                  </Button>
                </div>
              </div>
              {isNewCourse && (
                <p className="text-sm text-amber-500 mt-2">
                  Lưu khóa học trước để thêm chương
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={cn(
                    "border rounded-lg overflow-hidden",
                    isDark ? "border-slate-700" : "border-slate-200"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between p-4 cursor-pointer transition-colors",
                      isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
                    )}
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedPhases.has(phase.id) ? (
                        <ChevronDown className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-slate-500")} />
                      ) : (
                        <ChevronRight className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-slate-500")} />
                      )}
                      <span className={cn("font-medium", isDark ? "text-white" : "")}>
                        Chương {index + 1}: {phase.title}
                      </span>
                      <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        ({phase.lessons?.length || 0} bài)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeletePhase(phase.id);
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {expandedPhases.has(phase.id) && (
                    <div className={cn(
                      "p-4 border-t",
                      isDark ? "border-slate-700 bg-slate-900" : "border-slate-200"
                    )}>
                      {/* Lessons list */}
                      {phase.lessons && phase.lessons.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {phase.lessons.map((lesson, lIndex) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                isDark
                                  ? "bg-slate-800 border-slate-700"
                                  : "bg-white border-slate-200"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {getLessonIcon(lesson.type)}
                                <span className={cn("font-medium", isDark ? "text-white" : "")}>
                                  Bài {lIndex + 1}: {lesson.title}
                                </span>
                                <span className={cn(
                                  "text-xs capitalize px-2 py-1 rounded",
                                  isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                                )}>
                                  {lesson.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewLesson(lesson)}
                                  className={cn(
                                    "hover:bg-primary/10",
                                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-500 hover:text-blue-600"
                                  )}
                                  title="Xem chi tiết bài học"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLesson(lesson.id)}
                                  className={cn(
                                    "hover:bg-primary/10",
                                    isDark ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"
                                  )}
                                  title="Sửa bài học (trực tiếp)"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenLessonEditRequest(lesson)}
                                  className={cn(
                                    "hover:bg-primary/10",
                                    isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
                                  )}
                                  title="Yêu cầu giảng viên sửa bài học"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDeleteLesson(phase.id, lesson.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={cn(
                          "text-sm mb-4",
                          isDark ? "text-slate-400" : "text-slate-400"
                        )}>
                          Chưa có bài học nào
                        </p>
                      )}

                      {/* Minitests section */}
                      {phase.minitests && phase.minitests.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn("text-sm font-medium", isDark ? "text-purple-400" : "text-purple-600")}>
                              Minitests ({phase.minitests.length})
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/admin/courses/${course?.id}/minitests`)}
                              className={cn(
                                "text-xs gap-1",
                                isDark ? "text-purple-400 hover:text-purple-300 hover:bg-purple-900/30" : "text-purple-600 hover:text-purple-700"
                              )}
                            >
                              <Settings className="w-3 h-3" />
                              Quản lý
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {phase.minitests.map((mt) => (
                              <div
                                key={mt.id}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded border",
                                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Settings className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-500")} />
                                  <span className={cn("text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
                                    {mt.title}
                                  </span>
                                  <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                                  )}>
                                    {mt.questions?.length || 0} câu
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-xs",
                                  isDark ? "text-slate-500" : "text-slate-400"
                                )}>
                                  {mt.questions?.map(q => q.problem?.title).filter(Boolean).join(', ') || 'Không có câu hỏi'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add lesson form */}
                      {showAddLesson === phase.id ? (
                        <div className={cn(
                          "space-y-3 p-4 rounded-lg",
                          isDark ? "bg-slate-800" : "bg-slate-50"
                        )}>
                          <Input
                            placeholder="Tên bài học"
                            value={newLessonData.title}
                            onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                            className={cn(
                              isDark && "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            )}
                          />
                          <Select
                            value={newLessonData.type}
                            onValueChange={(v) => setNewLessonData({ ...newLessonData, type: v })}
                          >
                            <SelectTrigger className={cn(
                              isDark && "bg-slate-900 border-slate-700 text-white"
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="code">Code</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            ref={lessonContentRef}
                            placeholder="Nội dung bài học..."
                            value={newLessonData.content}
                            onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                            className={cn(
                              "min-h-[80px] resize-none",
                              isDark && "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                            )}
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleAddLesson} size="sm" className="bg-green-600 hover:bg-green-700">
                              Thêm bài học
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowAddLesson(null);
                                setNewLessonData({ phaseId: '', title: '', content: '', type: 'video' });
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddLesson(phase.id);
                            setNewLessonData({ ...newLessonData, phaseId: phase.id });
                          }}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm bài học
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {phases.length === 0 && (
                <div className={cn(
                  "text-center py-8",
                  isDark ? "text-slate-400" : "text-slate-400"
                )}>
                  Chưa có chương nào
                </div>
              )}
            </CardContent>
          </Card>

          {/* Final Test Section */}
          <Card className={cn(
            "border",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between",
              isDark ? "bg-slate-800" : "bg-slate-50"
            )}>
              <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                <Trophy className="w-5 h-5 text-amber-500" />
                Final Test (Test Tổng)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hackathons.length > 0 ? (
                hackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleEditFinalTest(hackathon)}>
                        <h4 className={cn("font-medium", isDark ? "text-white" : "")}>
                          {hackathon.title}
                        </h4>
                        <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                          {new Date(hackathon.startTime).toLocaleDateString('vi-VN')} - {new Date(hackathon.endTime).toLocaleDateString('vi-VN')}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                          {hackathon.problems?.length || 0} bài tập • {hackathon._count?.submissions || 0} lượt nộp
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                        )}>
                          {hackathon._count?.participants || 0} tham gia
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${id}/final-test/${hackathon.id}`)}
                          className={cn(
                            "gap-1",
                            isDark ? "border-slate-600 hover:bg-slate-700" : ""
                          )}
                        >
                          <Edit className="w-3 h-3" />
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteFinalTest(hackathon.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={cn(
                  "text-center py-6 rounded-lg",
                  isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
                )}>
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có Final Test</p>
                  <p className="text-xs mt-1">Tạo Final Test cho khóa học</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-amber-600 hover:bg-amber-700"
                    onClick={() => {
                      setEditingHackathon(null);
                      setFinalTestData({
                        title: 'Final Test - ' + (course?.title || ''),
                        description: 'Bài kiểm tra tổng hợp cuối khóa',
                        startTime: new Date().toISOString().slice(0, 16),
                        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                      });
                      setFinalTestOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tạo Final Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Section */}
          <Card className={cn(
            "border",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between",
              isDark ? "bg-slate-800" : "bg-slate-50"
            )}>
              <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                <FolderOpen className="w-5 h-5 text-cyan-500" />
                Final Project (Dự án cuối khóa)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={cn("font-medium cursor-pointer", isDark ? "text-white" : "")}
                          onClick={() => handleEditProject(project)}>
                          {project.title}
                        </h4>
                        <p className={cn("text-sm mt-1 line-clamp-2", isDark ? "text-slate-400" : "text-slate-500")}>
                          {project.description?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                          {project._count?.submissions || 0} bài nộp
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"
                        )}>
                          Project
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${id}/final-project/${project.id}`)}
                          className={cn(
                            "gap-1",
                            isDark ? "border-slate-600 hover:bg-slate-700" : ""
                          )}
                        >
                          <Edit className="w-3 h-3" />
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteFinalProject(project.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={cn(
                  "text-center py-6 rounded-lg",
                  isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
                )}>
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có Final Project</p>
                  <p className="text-xs mt-1">Tạo Final Project cho khóa học</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-cyan-600 hover:bg-cyan-700"
                    onClick={() => setFinalProjectOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tạo Final Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          {/* Image Preview - Large */}
          <Card className={cn("overflow-hidden", isDark ? "bg-slate-900 border-slate-800" : "")}>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                <ImageIcon className="w-5 h-5" />
                Hình ảnh khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "relative aspect-video rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                  isDark ? "border-slate-600" : "border-slate-300"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageUpload(file);
                }}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt={formData.title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Upload className="w-10 h-10" />
                    <p className="text-sm">Chọn ảnh để xem trước</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Preview Card */}
          <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
            <CardHeader>
              <CardTitle className={isDark ? "text-white" : ""}>Xem trước</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={imagePreview || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'}
                  alt={formData.title || 'Course'}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "")}>
                {formData.title || 'Tên khóa học'}
              </h3>
              <p className={cn(
                "text-sm line-clamp-3",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                {formData.description || 'Mô tả khóa học...'}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className={cn(
                    "text-2xl font-bold text-green-600",
                    isDark && "text-green-400"
                  )}>
                    {formatPrice(formData.price)}
                  </span>
                  {formData.originalPrice > formData.price && (
                    <span className={cn(
                      "text-sm line-through ml-2",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {formatPrice(formData.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn("text-sm space-y-1", isDark ? "text-slate-400" : "text-slate-500")}>
                <p>Thời lượng: {formData.duration || 'Chưa cập nhật'}</p>
                <p>Trình độ: {
                  formData.level === 'beginner' ? 'Người mới' :
                  formData.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'
                }</p>
                <p>{phases.length} chương</p>
                <p className="mt-2">
                  Subscription: {
                    formData.subscriptionType === 'FREE' ? 'Miễn phí' :
                    `Premium (${formatPrice(formData.subscriptionPrice)})`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {assignedLectures.length > 0 && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <Users className="w-5 h-5" />
                  Giảng viên được gán ({assignedLectures.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      isDark ? "bg-slate-800" : "bg-slate-100"
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "")}>
                        {lecture.fullName || 'Không tên'}
                      </p>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        {lecture.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleUnassignLecture(lecture.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {!isNewCourse && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      fetchLectures();
                      setShowLectureSelect(!showLectureSelect);
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Thêm giảng viên
                  </Button>
                )}
                {showLectureSelect && (
                  <div className={cn(
                    "mt-2 p-3 rounded-lg border",
                    isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
                  )}>
                    <p className={cn("text-sm mb-2", isDark ? "text-slate-300" : "text-slate-600")}>
                      Chọn giảng viên để gán:
                    </p>
                    {loadingLectures ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải...
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {lectures
                          .filter((l) => !assignedLectures.some((a) => a.id === l.id))
                          .map((lecture) => (
                            <button
                              key={lecture.id}
                              onClick={() => handleAssignLecture(lecture.id)}
                              disabled={assigningLecture}
                              className={cn(
                                "w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2",
                                isDark
                                  ? "hover:bg-slate-700 text-slate-300"
                                  : "hover:bg-slate-100 text-slate-700",
                                assigningLecture && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <UserPlus className="w-4 h-4" />
                              <div>
                                <p className="font-medium">{lecture.fullName || 'Không tên'}</p>
                                <p className="text-xs opacity-70">{lecture.email}</p>
                              </div>
                            </button>
                          ))}
                        {lectures.filter((l) => !assignedLectures.some((a) => a.id === l.id)).length === 0 && (
                          <p className={cn("text-sm text-center", isDark ? "text-slate-400" : "text-slate-500")}>
                            Tất cả giảng viên đã được gán
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Show add lecture button if no lectures assigned yet */}
          {assignedLectures.length === 0 && !isNewCourse && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <Users className="w-5 h-5" />
                  Giảng viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-sm mb-3", isDark ? "text-slate-400" : "text-slate-500")}>
                  Chưa có giảng viên nào được gán cho khóa học này.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    fetchLectures();
                    setShowLectureSelect(!showLectureSelect);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Gán giảng viên
                </Button>
                {showLectureSelect && (
                  <div className={cn(
                    "mt-3 p-3 rounded-lg border",
                    isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
                  )}>
                    <p className={cn("text-sm mb-2", isDark ? "text-slate-300" : "text-slate-600")}>
                      Chọn giảng viên để gán:
                    </p>
                    {loadingLectures ? (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải...
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {lectures.map((lecture) => (
                          <button
                            key={lecture.id}
                            onClick={() => handleAssignLecture(lecture.id)}
                            disabled={assigningLecture}
                            className={cn(
                              "w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2",
                              isDark
                                ? "hover:bg-slate-700 text-slate-300"
                                : "hover:bg-slate-100 text-slate-700",
                              assigningLecture && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <UserPlus className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{lecture.fullName || 'Không tên'}</p>
                              <p className="text-xs opacity-70">{lecture.email}</p>
                            </div>
                          </button>
                        ))}
                        {lectures.length === 0 && (
                          <p className={cn("text-sm text-center", isDark ? "text-slate-400" : "text-slate-500")}>
                            Không có giảng viên nào
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {course?.creator && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={isDark ? "text-white" : ""}>Người tạo khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("font-medium", isDark ? "text-white" : "")}>
                  {course.creator.fullName}
                </p>
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  {course.creator.email}
                </p>
              </CardContent>
            </Card>
          )}

          {course?._count?.enrollments !== undefined && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={isDark ? "text-white" : ""}>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-green-400" : "text-green-600"
                )}>
                  {course._count.enrollments}
                </p>
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  Học sinh đã đăng ký
                </p>
              </CardContent>
            </Card>
          )}

          {/* Minitest Settings Card */}
          {!isNewCourse && course && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <Settings className="w-5 h-5 text-primary" />
                  Cài đặt Minitest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-slate-500")}>
                  Tạo và quản lý bài kiểm tra nhỏ sau mỗi chương học
                </p>
                <Button
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate(`/admin/courses/${course.id}/minitests`)}
                >
                  <Settings className="w-4 h-4" />
                  Quản lý Minitest
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unlock Code Management Card */}
          {!isNewCourse && course && (
            <Card className={isDark ? "bg-slate-900 border-slate-800" : ""}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
                  <KeyRound className="w-5 h-5 text-primary" />
                  Quản lý mã mở khóa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-slate-500")}>
                  Tạo mã kích hoạt hoặc cấp quyền truy cập trực tiếp cho người dùng
                </p>
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => setUnlockCodeOpen(true)}
                >
                  <KeyRound className="w-4 h-4" />
                  Mở quản lý mã mở khóa
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unlock Code Management Dialog */}
          {!isNewCourse && course && (
            <UnlockCodePanel
              courseId={course.id}
              courseTitle={course.title}
              isOpen={unlockCodeOpen}
              onClose={() => setUnlockCodeOpen(false)}
              theme={theme}
            />
          )}
        </div>
      </div>

      {/* Lesson Detail Dialog */}
      <Dialog open={lessonDetailOpen} onOpenChange={setLessonDetailOpen}>
        <DialogContent className={cn(
          "max-w-4xl max-h-[90vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("text-xl", isDark ? "text-white" : "")}>
              {selectedLesson?.title}
            </DialogTitle>
          </DialogHeader>
          {lessonLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedLesson ? (
            <div className="space-y-6">
              {/* Lesson Info */}
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-sm px-3 py-1 rounded-full",
                  selectedLesson.type === 'video'
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                )}>
                  {selectedLesson.type === 'video' ? 'Video' : 'Code'}
                </span>
              </div>

              {/* Basic Content */}
              {selectedLesson.content && (
                <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader>
                    <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                      Nội dung cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Lesson Content (detailed) */}
              {selectedLesson.lessonContent?.content && (
                <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader>
                    <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                      Nội dung chi tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.lessonContent.content }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Starter Code */}
              {selectedLesson.lessonContent?.starterCode && (
                <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader>
                    <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                      Starter Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className={cn(
                      "p-4 rounded-lg text-sm font-mono overflow-x-auto",
                      isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-800"
                    )}>
                      {selectedLesson.lessonContent.starterCode}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Test Cases */}
              {selectedLesson.lessonContent?.testCases && (() => {
                let testCases: any[] = [];
                try {
                  testCases = JSON.parse(selectedLesson.lessonContent.testCases);
                } catch (e) {
                  console.error('Failed to parse test cases:', e);
                }
                if (testCases.length === 0) return null;
                return (
                  <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                    <CardHeader>
                      <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                        Test Cases ({testCases.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {testCases.map((tc: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-4 rounded-lg border",
                            isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                                Input:
                              </span>
                              <pre className={cn(
                                "mt-1 p-2 rounded text-xs font-mono overflow-x-auto",
                                isDark ? "bg-slate-800 text-slate-300" : "bg-white"
                              )}>
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                                Expected Output:
                              </span>
                              <pre className={cn(
                                "mt-1 p-2 rounded text-xs font-mono overflow-x-auto",
                                isDark ? "bg-slate-800 text-slate-300" : "bg-white"
                              )}>
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <span className={cn(
                              "px-2 py-0.5 rounded",
                              tc.isPublic
                                ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              {tc.isPublic ? 'Public' : 'Hidden'}
                            </span>
                            <span>{tc.points || 10} điểm</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Hints */}
              {selectedLesson.lessonContent?.hints && (() => {
                let hints: any[] = [];
                try {
                  hints = JSON.parse(selectedLesson.lessonContent.hints);
                } catch (e) {
                  console.error('Failed to parse hints:', e);
                }
                if (hints.length === 0) return null;
                return (
                  <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                    <CardHeader>
                      <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                        Hints ({hints.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hints.map((hint: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg border",
                            isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "font-medium",
                              isDark ? "text-cyan-400" : "text-cyan-600"
                            )}>
                              Hint #{idx + 1}
                            </span>
                            <span className={cn(
                              "text-xs",
                              isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                              -{hint.penalty || 10} điểm
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-2",
                            isDark ? "text-slate-300" : "text-slate-600"
                          )}>
                            {hint.content}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Time & Memory Limits */}
              {(selectedLesson.lessonContent?.timeLimit || selectedLesson.lessonContent?.memoryLimit) && (
                <Card className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader>
                    <CardTitle className={cn("text-base", isDark ? "text-white" : "")}>
                      Giới hạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-6">
                    {selectedLesson.lessonContent?.timeLimit && (
                      <div>
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                          Thời gian:
                        </span>
                        <span className={cn(
                          "ml-2 font-medium",
                          isDark ? "text-white" : ""
                        )}>
                          {selectedLesson.lessonContent.timeLimit} ms
                        </span>
                      </div>
                    )}
                    {selectedLesson.lessonContent?.memoryLimit && (
                      <div>
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                          Bộ nhớ:
                        </span>
                        <span className={cn(
                          "ml-2 font-medium",
                          isDark ? "text-white" : ""
                        )}>
                          {selectedLesson.lessonContent.memoryLimit} MB
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* No Content Message */}
              {!selectedLesson.content && !selectedLesson.lessonContent?.content && !selectedLesson.lessonContent?.starterCode && (
                <div className={cn(
                  "text-center py-8",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  <p>Chưa có nội dung bài học</p>
                  <p className="text-sm mt-1">Vui lòng tạo nội dung bài học từ trang quản lý nội dung</p>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              "text-center py-8",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>
              Không tìm thấy bài học
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Edit Request Dialog */}
      <Dialog open={lessonEditRequestOpen} onOpenChange={setLessonEditRequestOpen}>
        <DialogContent className={cn(
          "max-w-lg",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              Yêu cầu sửa bài học
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editRequestLessonTitle && (
              <div className={cn(
                "p-3 rounded-lg",
                isDark ? "bg-slate-800" : "bg-slate-50"
              )}>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bài học:</p>
                <p className={cn("font-medium", isDark ? "text-white" : "")}>
                  {editRequestLessonTitle}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Giảng viên phụ trách *</Label>
              <Select
                value={editRequestLectureId}
                onValueChange={setEditRequestLectureId}
              >
                <SelectTrigger className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}>
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-slate-800 border-slate-700" : ""}>
                  {lectures.map((lecture) => (
                    <SelectItem key={lecture.id} value={lecture.id}>
                      {lecture.fullName || lecture.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Ghi chú (tùy chọn)</Label>
              <Textarea
                value={editRequestNotes}
                onChange={(e) => setEditRequestNotes(e.target.value)}
                placeholder="Mô tả những gì cần sửa..."
                rows={3}
                className={cn(
                  isDark && "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? "text-slate-300" : ""}>Hạn chót (tùy chọn)</Label>
              <ConfigProvider
                theme={{
                  algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                  token: { colorPrimary: '#06b6d4' },
                }}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  value={editRequestDueDate}
                  onChange={(date) => setEditRequestDueDate(date)}
                  className="w-full"
                  placeholder="Chọn ngày giờ"
                />
              </ConfigProvider>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setLessonEditRequestOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitLessonEditRequest}
                disabled={savingEditRequest}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {savingEditRequest ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Test Dialog */}
      <Dialog open={finalTestOpen} onOpenChange={(open) => {
        setFinalTestOpen(open);
        if (!open) {
          setEditingHackathon(null);
          setFinalTestData({
            title: 'Final Test',
            description: 'Bài kiểm tra tổng hợp cuối khóa',
            startTime: new Date().toISOString().slice(0, 16),
            endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          });
        }
      }}>
        <DialogContent className={cn(
          "max-w-lg",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Trophy className="w-5 h-5 text-amber-500" />
              {editingHackathon ? 'Chỉnh sửa Final Test' : 'Tạo Final Test'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Tiêu đề</Label>
              <Input
                value={finalTestData.title}
                onChange={(e) => setFinalTestData({ ...finalTestData, title: e.target.value })}
                className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="Final Test - Tên khóa học"
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
              <Textarea
                value={finalTestData.description}
                onChange={(e) => setFinalTestData({ ...finalTestData, description: e.target.value })}
                className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="Mô tả bài test tổng hợp..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Ngày bắt đầu</Label>
                <Input
                  type="datetime-local"
                  value={finalTestData.startTime}
                  onChange={(e) => setFinalTestData({ ...finalTestData, startTime: e.target.value })}
                  className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                />
              </div>
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Ngày kết thúc</Label>
                <Input
                  type="datetime-local"
                  value={finalTestData.endTime}
                  onChange={(e) => setFinalTestData({ ...finalTestData, endTime: e.target.value })}
                  className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFinalTestOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={editingHackathon ? handleUpdateFinalTest : handleCreateFinalTest}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!finalTestData.title.trim()}
            >
              {editingHackathon ? 'Lưu thay đổi' : 'Tạo Final Test'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Problem Dialog for Final Test */}
      <Dialog open={problemDialogOpen} onOpenChange={setProblemDialogOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <Code className="w-5 h-5 text-green-500" />
              {editingProblem ? 'Chỉnh sửa bài tập' : 'Thêm bài tập cho Final Test'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Tên bài tập</Label>
              <Input
                value={problemData.title}
                onChange={(e) => setProblemData({ ...problemData, title: e.target.value })}
                className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="VD: Tính tổng 2 số"
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả</Label>
              <Textarea
                value={problemData.description}
                onChange={(e) => setProblemData({ ...problemData, description: e.target.value })}
                className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="Mô tả bài toán..."
                rows={3}
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Độ khó</Label>
              <Select
                value={problemData.difficulty}
                onValueChange={(v) => setProblemData({ ...problemData, difficulty: v })}
              >
                <SelectTrigger className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}>
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
                  Thêm testcase
                </Button>
              </div>
              <div className="space-y-3">
                {problemData.testcases.map((tc, idx) => (
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
                      {problemData.testcases.length > 1 && (
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
                        <Label className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Input</Label>
                        <Input
                          value={tc.input}
                          onChange={(e) => handleUpdateTestcase(idx, 'input', e.target.value)}
                          className={cn("h-8 text-sm", isDark && "bg-slate-900 border-slate-700 text-white")}
                          placeholder="VD: 3 5"
                        />
                      </div>
                      <div>
                        <Label className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Expected Output</Label>
                        <Input
                          value={tc.expectedOutput}
                          onChange={(e) => handleUpdateTestcase(idx, 'expectedOutput', e.target.value)}
                          className={cn("h-8 text-sm", isDark && "bg-slate-900 border-slate-700 text-white")}
                          placeholder="VD: 8"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tc.isPublic}
                        onChange={(e) => handleUpdateTestcase(idx, 'isPublic', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                        Public testcase (hiển thị cho người dùng)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setProblemDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveProblem}
              className="bg-green-600 hover:bg-green-700"
              disabled={!problemData.title.trim() || problemData.testcases.length === 0}
            >
              {editingProblem ? 'Lưu thay đổi' : 'Thêm bài tập'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Project Dialog */}
      <Dialog open={finalProjectOpen} onOpenChange={(open) => {
        setFinalProjectOpen(open);
        if (!open) {
          setEditingProject(null);
          setFinalProjectData({
            title: 'Final Project',
            description: '',
          });
        }
      }}>
        <DialogContent className={cn(
          "max-w-2xl",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <FolderOpen className="w-5 h-5 text-cyan-500" />
              {editingProject ? 'Chỉnh sửa Final Project' : 'Tạo Final Project'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Tiêu đề</Label>
              <Input
                value={finalProjectData.title}
                onChange={(e) => setFinalProjectData({ ...finalProjectData, title: e.target.value })}
                className={cn(isDark && "bg-slate-800 border-slate-700 text-white")}
                placeholder="Final Project - Tên dự án"
              />
            </div>
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Mô tả / Yêu cầu</Label>
              <RichTextEditor
                value={finalProjectData.description}
                onChange={(value) => setFinalProjectData({ ...finalProjectData, description: value })}
                placeholder={`Viết nội dung yêu cầu project ở đây...

Ví dụ:
1. Tạo website portfolio cá nhân với React
2. Website cần responsive trên mọi thiết bị
3. Có animation mượt mà khi scroll trang

Tiêu chí chấm điểm:
- Code sạch, có comment (20%)
- Giao diện đẹp, UX tốt (30%)
- Tính năng hoạt động đầy đủ (50%)`}
                className={cn("mt-1", isDark ? "border-slate-700" : "border-slate-200")}
              />
              <p className={cn("text-xs mt-2", isDark ? "text-slate-400" : "text-slate-500")}>
                Viết nội dung như viết bài báo. Dung lượng upload tối đa: 25MB
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFinalProjectOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={editingProject ? handleUpdateProject : handleCreateFinalProject}
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={!finalProjectData.title.trim()}
            >
              {editingProject ? 'Lưu thay đổi' : 'Tạo Final Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Submissions Dialog */}
      <Dialog open={projectDetailOpen} onOpenChange={setProjectDetailOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark ? "bg-slate-900 border-slate-700" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isDark ? "text-white" : "")}>
              <FolderOpen className="w-5 h-5 text-cyan-500" />
              Bài nộp - {editingProject?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : projectSubmissions.length > 0 ? (
              <div className="space-y-3">
                {projectSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={cn("font-medium", isDark ? "text-white" : "")}>
                          {submission.user?.fullName || 'Người dùng'}
                        </h4>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                          {submission.user?.email}
                        </p>
                        <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                          Nộp lúc: {new Date(submission.submittedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-sm px-3 py-1 rounded",
                            isDark ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                          )}
                        >
                          Download
                        </a>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          submission.status === 'approved' ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700") :
                          submission.status === 'rejected' ? (isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700") :
                          (isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700")
                        )}>
                          {submission.status === 'approved' ? 'Đạt' : submission.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn("text-center py-8", isDark ? "text-slate-400" : "text-slate-500")}>
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có bài nộp nào</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
