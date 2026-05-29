import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import { ArrowLeft, BookOpen, User, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { message } from 'antd';

interface Lecture {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
}

interface Course {
  id: string;
  title: string;
  phases: Phase[];
}

interface Phase {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  status: string;
}

const LessonRequestCreatePage = () => {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedLecture, setSelectedLecture] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch lectures
      const lecturesRes = await fetch(`${API_ENDPOINTS.admin.users}?role=lecture`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const lecturesData = await lecturesRes.json();
      if (lecturesData.success) {
        setLectures(lecturesData.data || []);
      }

      // Fetch courses with phases and lessons
      const coursesRes = await fetch(API_ENDPOINTS.admin.courses, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const selectedPhaseData = selectedCourseData?.phases.find(p => p.id === selectedPhase);

  const handleSubmit = async () => {
    if (!selectedLecture || !selectedLesson) {
      message.error('Vui lòng chọn giảng viên và bài học');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.lessonRequests.create, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId: selectedLecture,
          lessonId: selectedLesson,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        message.success('Đã tạo yêu cầu thành công');
        navigate('/admin/lesson-requests');
      } else {
        message.error(data.message || 'Tạo yêu cầu thất bại');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      message.error('Tạo yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/lesson-requests')}
          className={cn(isDark ? 'text-slate-300 hover:text-white' : '')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className={cn(isDark ? 'bg-slate-800 border-slate-700' : '')}>
          <CardHeader>
            <CardTitle className={cn('text-xl', isDark ? 'text-white' : '')}>
              Tạo yêu cầu bài học mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-white' : 'text-slate-600')} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Select Lecture */}
                <div className="space-y-2">
                  <Label className={cn(isDark ? 'text-slate-300' : '')}>
                    <User className="w-4 h-4 inline mr-1" />
                    Chọn giảng viên
                  </Label>
                  <Select value={selectedLecture} onValueChange={setSelectedLecture}>
                    <SelectTrigger className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}>
                      <SelectValue placeholder="Chọn giảng viên..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lectures.map((lecture) => (
                        <SelectItem key={lecture.id} value={lecture.id}>
                          {lecture.fullName || lecture.username} ({lecture.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Course */}
                <div className="space-y-2">
                  <Label className={cn(isDark ? 'text-slate-300' : '')}>
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Chọn khóa học
                  </Label>
                  <Select value={selectedCourse} onValueChange={(v) => {
                    setSelectedCourse(v);
                    setSelectedPhase('');
                    setSelectedLesson('');
                  }}>
                    <SelectTrigger className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}>
                      <SelectValue placeholder="Chọn khóa học..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Phase */}
                {selectedCourseData && (
                  <div className="space-y-2">
                    <Label className={cn(isDark ? 'text-slate-300' : '')}>
                      Chọn Phase/Chương
                    </Label>
                    <Select value={selectedPhase} onValueChange={(v) => {
                      setSelectedPhase(v);
                      setSelectedLesson('');
                    }}>
                      <SelectTrigger className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}>
                        <SelectValue placeholder="Chọn phase..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCourseData.phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Select Lesson */}
                {selectedPhaseData && (
                  <div className="space-y-2">
                    <Label className={cn(isDark ? 'text-slate-300' : '')}>
                      Chọn bài học
                    </Label>
                    <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                      <SelectTrigger className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}>
                        <SelectValue placeholder="Chọn bài học..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPhaseData.lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.title} ({lesson.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className={cn(isDark ? 'text-slate-300' : '')}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Hạn chót (tùy chọn)
                  </Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className={cn(isDark ? 'text-slate-300' : '')}>
                    <FileText className="w-4 h-4 inline mr-1" />
                    Ghi chú (tùy chọn)
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú cho giảng viên..."
                    rows={4}
                    className={cn(isDark ? 'bg-slate-700 border-slate-600 text-white' : '')}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/lesson-requests')}
                    className={cn(isDark ? 'border-slate-600 text-slate-300' : '')}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedLecture || !selectedLesson || loading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Tạo yêu cầu
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonRequestCreatePage;
