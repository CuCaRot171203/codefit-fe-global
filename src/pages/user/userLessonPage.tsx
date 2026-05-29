import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import {
  Play, Lightbulb, Send, Loader2, CheckCircle, XCircle,
  Clock, Code, Eye, Terminal, FileText, AlertTriangle,
  Copy, Check, ChevronLeft, ChevronRight, ChevronDown, PlayCircle, BookmarkCheck, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notification } from 'antd';

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
];

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  phaseId: string;
  orderIndex: number;
  lessons?: Array<{
    id: string;
    title: string;
    orderIndex: number;
    phase?: {
      id: string;
      orderIndex?: number;
    };
  }>;
  phase?: {
    id: string;
    title: string;
    orderIndex?: number;
    courseId: string;
    course?: {
      id: string;
      title: string;
      hackathons?: { id: string; title: string }[];
      projects?: { id: string; title: string }[];
    };
    lessons?: {
      id: string;
      title: string;
      orderIndex: number;
    }[];
    minitests?: Minitest[];
  };
  lessonContent?: {
    content: string;
    testCases: string;
    hints: string;
    starterCode: string;
    starterLanguage?: string;
    timeLimit: number | null;
    memoryLimit: number | null;
  };
  scoringConfig?: {
    baseScore: number;
    penaltyPerHint: number;
  };
}

interface Minitest {
  id: string;
  title: string;
  orderIndex: number;
  questions: {
    id: string;
    problemId: string;
    problem: {
      id: string;
      title: string;
      difficulty: string;
    };
  }[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
}

interface Hint {
  content: string;
  penalty: number;
  revealed: boolean;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
  isPublic?: boolean;
}

interface SubmissionResult {
  score: number;
  passedTests: number;
  totalTests: number;
  publicPassedTests?: number;
  publicTotalTests?: number;
  hiddenPassedTests?: number;
  hiddenTotalTests?: number;
  allPassed?: boolean;
  hintsUsed: number;
  isNoTestCase?: boolean;
  result?: {
    details?: {
      testResults: {
        testId: string;
        passed: boolean;
        input: string;
        expectedOutput: string;
        actualOutput?: string;
        points: number;
        earnedPoints: number;
      }[];
    };
  };
}

const UserLessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const isDark = useAppSelector((state) => state.theme.theme === 'dark');
  const editorRef = useRef<any>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [hints, setHints] = useState<Hint[]>([]);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [runningCode, setRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState('content');
  const [copiedCode, setCopiedCode] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Check if lesson has code content (starterCode or testCases)
  const hasCodeContent = true; // Always show code editor for all lessons

  useEffect(() => {
    if (lessonId) {
      // Reset console and testcase when switching lessons - immediate UI reset
      setTestResults([]);
      setResult(null);
      setActiveTab('content');
      setRevealedHints(new Set());
      fetchLesson();
    }
  }, [lessonId]);

  // Update editor theme when Redux theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'codefit-dark' : 'codefit-light');
    }
  }, [isDark]);

  // Keyboard shortcut: F6 to run code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F6' && editorRef.current) {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, runningCode]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 20;
      const response = await fetch(`${API_ENDPOINTS.lessonContent.get(lessonId!)}`, {
        headers: isValidToken ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setLesson(data.data);
        setCode(data.data.lessonContent?.starterCode || '');
        setIsLessonCompleted(data.data.isCompleted || false);
        
        const savedLang = data.data.lessonContent?.starterLanguage;
        if (savedLang) {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === savedLang);
          if (lang) setSelectedLanguage(lang);
        }
        
        try {
          const parsedHints = JSON.parse(data.data.lessonContent?.hints || '[]');
          setHints(parsedHints);
        } catch {
          setHints([]);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải bài học',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson || !lesson.phase?.courseId) return;
    
    try {
      setMarkingComplete(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lessonProgress.complete, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          courseId: lesson.phase.courseId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLessonCompleted(true);
        notification.success({
          message: 'Thành công',
          description: 'Đã đánh dấu hoàn thành!',
        });
        
        // Check if this is the last lesson - navigate to Final Test/Project
        const allLessons = lesson.lessons || [];
        const sortedLessons = [...allLessons].sort((a, b) => {
          if (a.phase?.orderIndex !== b.phase?.orderIndex) {
            return (a.phase?.orderIndex || 0) - (b.phase?.orderIndex || 0);
          }
          return a.orderIndex - b.orderIndex;
        });
        const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
        const isLastLesson = currentIndex === sortedLessons.length - 1;
        
        if (isLastLesson) {
          const courseHackathons = lesson.phase?.course?.hackathons || [];
          const courseProjects = lesson.phase?.course?.projects || [];
          
          if (courseHackathons.length > 0) {
            setTimeout(() => {
              notification.info({
                message: 'Hoàn thành khóa học!',
                description: 'Chuyển sang Final Test...',
              });
              navigate(`/user/final-test/${courseHackathons[0].id}`);
            }, 1500);
          } else if (courseProjects.length > 0) {
            setTimeout(() => {
              notification.info({
                message: 'Hoàn thành khóa học!',
                description: 'Chuyển sang Final Project...',
              });
              navigate(`/user/project/${courseProjects[0].id}`);
            }, 1500);
          }
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Không thể đánh dấu hoàn thành',
        });
      }
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể đánh dấu hoàn thành',
      });
    } finally {
      setMarkingComplete(false);
    }
  };

  const revealHint = (index: number) => {
    setRevealedHints(prev => new Set([...prev, index]));
  };

  const getHintsUsed = () => revealedHints.size;

  const getRemainingScore = () => {
    if (!lesson?.scoringConfig) return 0;
    return Math.max(0, lesson.scoringConfig.baseScore - (revealedHints.size * lesson.scoringConfig.penaltyPerHint));
  };

  const handleLanguageChange = (langId: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (lang) {
      setSelectedLanguage(lang);
      setShowLanguageDropdown(false);
    }
  };

  // Store monaco instance for theme switching
  const monacoRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    monacoInstance.editor.defineTheme('codefit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editorCursor.foreground': '#06b6d4',
        'editor.selectionBackground': '#334155',
      },
    });

    monacoInstance.editor.defineTheme('codefit-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editor.background': '#fafafa',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
      },
    });

    // Apply initial theme based on current Redux state
    monacoInstance.editor.setTheme(isDark ? 'codefit-dark' : 'codefit-light');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    if (lesson?.lessonContent?.starterCode !== undefined) {
      setCode(lesson.lessonContent.starterCode);
      notification.info({
        message: 'Đã reset',
        description: 'Code đã được khôi phục về ban đầu',
      });
    }
    setShowResetConfirm(false);
  };

  const parseTestCases = (): TestCase[] => {
    if (!lesson?.lessonContent?.testCases) return [];
    try {
      return JSON.parse(lesson.lessonContent.testCases);
    } catch {
      return [];
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Vui lòng nhập code trước khi chạy',
      });
      return;
    }

    setRunningCode(true);
    setTestResults([]);
    setActiveTab('console');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.scoring.run, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          code,
          language: selectedLanguage.id,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.results) {
        // Transform API results - show ALL tests but hide input/expected for hidden tests
        const apiResults = data.data.results;
        
        const transformedResults: TestResult[] = apiResults.map((r: any) => ({
          input: r.isPublic !== false ? r.input : '[Hidden]',  // Hide input for hidden tests
          expectedOutput: r.isPublic !== false ? r.expectedOutput : '[Hidden]',  // Hide expected for hidden tests
          actualOutput: r.actualOutput,
          passed: r.passed,
          isPublic: r.isPublic !== false,
        }));
        
        setTestResults(transformedResults);
        
        // Show toast notification based on results
        const passedCount = apiResults.filter((r: any) => r.passed).length;
        const totalCount = apiResults.length;
        const publicCount = apiResults.filter((r: any) => r.isPublic !== false).length;
        const hiddenCount = totalCount - publicCount;
        
        if (passedCount === totalCount && totalCount > 0) {
          notification.success({
            message: 'Chúc mừng!',
            description: `Đã pass hết ${totalCount} test cases (${publicCount} public + ${hiddenCount} hidden)!`,
          });
        } else {
          notification.warning({
            message: 'Kết quả chạy code',
            description: `${passedCount}/${totalCount} test passed (${publicCount} public + ${hiddenCount} hidden)`,
          });
        }
      } else {
        // Fallback: create mock results
        const testCases = parseTestCases();
        const results: TestResult[] = testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput,
          passed: true,
          isPublic: tc.isPublic,
          executionTime: Math.floor(Math.random() * 100) + 10,
          memoryUsed: Math.floor(Math.random() * 50) + 10,
        }));
        setTestResults(results);
        notification.warning({
          message: 'Cảnh báo',
          description: 'API trả về mock data',
        });
      }
    } catch (error) {
      console.error('Run code error:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể chạy code',
      });
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập code',
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.scoring.submit, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          code,
          language: selectedLanguage.id,
          hintsUsed: getHintsUsed(),
          timeUsed: null,
        }),
      });
      const data = await response.json();
      console.log('[DEBUG] submit response:', JSON.stringify(data.data));
      if (data.success) {
        setResult(data.data);

        // Hiển thị popup điểm còn lại sau khi nộp
        const hintsUsedCount = getHintsUsed();
        const remainingScore = (lesson?.scoringConfig?.baseScore || 0) -
          (hintsUsedCount * (lesson?.scoringConfig?.penaltyPerHint || 10));

        notification.info({
          message: 'Điểm nhận được',
          description: `Số điểm còn lại bạn nhận được: ${remainingScore} điểm`,
          duration: 2,
          placement: 'top',
        });
        
        // Check if all tests passed using the new API response
        const hasTests = data.data.totalTests > 0;
        const allTestsPassed = data.data.allPassed === true || (hasTests && data.data.passedTests === data.data.totalTests);
        const noTestsButCompiled = !hasTests && data.data.status === 'COMPILED';
        
        if (allTestsPassed || noTestsButCompiled) {
          // Success - show toast and auto-navigate
          setIsLessonCompleted(true);
          notification.success({
            message: 'Chúc mừng!',
            description: `Bạn đã pass hết ${data.data.totalTests} test cases! Đang chuyển sang bài tiếp theo...`,
          });
          
          // Call API to mark complete
          if (lesson?.phase?.courseId) {
            await fetch(API_ENDPOINTS.lessonProgress.complete, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lessonId,
                courseId: lesson.phase.courseId,
              }),
            });
            
            // Get next lesson
            const allLessons = lesson.lessons || [];
            const sortedLessons = [...allLessons].sort((a, b) => {
              if (a.phase?.orderIndex !== b.phase?.orderIndex) {
                return (a.phase?.orderIndex || 0) - (b.phase?.orderIndex || 0);
              }
              return a.orderIndex - b.orderIndex;
            });
            const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);
            const nextLessonData = currentIndex >= 0 && currentIndex < sortedLessons.length - 1 
              ? sortedLessons[currentIndex + 1] 
              : null;
            
            // Refetch lesson data to update UI
            await fetchLesson();
            
            // Check if current phase (chapter) has minitest
            const currentPhaseMinitests = lesson.phase?.minitests || [];
            const hasCurrentPhaseMinitest = currentPhaseMinitests.length > 0;
            
            // Check if next lesson is in a different phase (chapter)
            const isMovingToNewPhase = nextLessonData && nextLessonData.phase?.id !== lesson.phase?.id;
            
            // Auto navigate logic:
            // 1. If moving to new phase AND current phase has minitest -> go to minitest
            // 2. If there's a next lesson (same phase or no minitest) -> go to next lesson
            // 3. If no more lessons AND course has minitest -> go to course minitest
            if (isMovingToNewPhase && hasCurrentPhaseMinitest) {
              // Finish chapter -> go to chapter minitest
              setTimeout(() => {
                notification.info({
                  message: 'Hoàn thành chương!',
                  description: 'Chuyển sang bài kiểm tra minitest...',
                });
                navigate(`/user/minitest/lam-bai?minitestId=${currentPhaseMinitests[0].id}`);
              }, 2000);
            } else if (nextLessonData) {
              // Next lesson exists (same phase or no minitest)
              setTimeout(() => {
                navigate(`/user/lesson/${nextLessonData.id}`);
              }, 3000);
            } else {
              // No more lessons - check if course has Final Test, Final Project, or Minitest
              const courseMinitests = lesson.phase?.minitests || [];
              const courseHackathons = lesson.phase?.course?.hackathons || [];
              const courseProjects = lesson.phase?.course?.projects || [];
              
              if (courseHackathons.length > 0) {
                // Has Final Test
                setTimeout(() => {
                  notification.info({
                    message: 'Hoàn thành khóa học!',
                    description: 'Chuyển sang Final Test...',
                  });
                  navigate(`/user/final-test/${courseHackathons[0].id}`);
                }, 2000);
              } else if (courseProjects.length > 0) {
                // Has Final Project
                setTimeout(() => {
                  notification.info({
                    message: 'Hoàn thành khóa học!',
                    description: 'Chuyển sang Final Project...',
                  });
                  navigate(`/user/project/${courseProjects[0].id}`);
                }, 2000);
              } else if (courseMinitests.length > 0) {
                setTimeout(() => {
                  notification.info({
                    message: 'Hoàn thành khóa học!',
                    description: 'Chuyển sang bài kiểm tra cuối khóa...',
                  });
                  navigate(`/user/minitest/lam-bai?minitestId=${courseMinitests[0].id}`);
                }, 2000);
              }
            }
          }
          // Failed some tests - show warning toast
          const passedCount = data.data.passedTests || 0;
          const totalCount = data.data.totalTests || 0;
          const publicPassed = data.data.publicPassedTests || 0;
          const publicTotal = data.data.publicTotalTests || 0;
          const hiddenPassed = data.data.hiddenPassedTests || 0;
          const hiddenTotal = data.data.hiddenTotalTests || 0;
          
          notification.error({
            message: 'Chưa pass hết',
            description: `${passedCount}/${totalCount} (Public: ${publicPassed}/${publicTotal}, Hidden: ${hiddenPassed}/${hiddenTotal})`,
          });
        }
      } else {
        notification.error({
          message: 'Lỗi',
          description: data.message || 'Nộp thất bại',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Nộp thất bại',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const testCases = parseTestCases();
  const publicTestCases = testCases.filter(tc => tc.isPublic);
  // All tests passed only when:
  // 1. There ARE test cases (totalTests > 0) AND all are passed
  // 2. NO test cases (totalTests === 0) AND it's a VIDEO/LECTURE lesson (handled separately)
  const allTestsPassed = result && result.totalTests > 0 && result.passedTests === result.totalTests;

  const getNextLesson = () => {
    // Use flat lessons array from API (includes all lessons in course with unlock status)
    if (!lesson?.lessons) return null;
    const sortedLessons = [...lesson.lessons].sort((a, b) => {
      if (a.phase?.orderIndex !== b.phase?.orderIndex) {
        return (a.phase?.orderIndex || 0) - (b.phase?.orderIndex || 0);
      }
      return a.orderIndex - b.orderIndex;
    });
    const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex === -1 || currentIndex >= sortedLessons.length - 1) return null;
    return sortedLessons[currentIndex + 1];
  };

  const nextLesson = getNextLesson();

  if (loading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
          <p className={cn('text-lg', isDark ? 'text-slate-400' : 'text-slate-600')}>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <div className="text-center">
          <FileText className={cn('w-16 h-16 mx-auto mb-4 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <p className={cn('text-xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Không tìm thấy bài học</p>
          <Button onClick={() => navigate(-1)} className="mt-4 bg-cyan-500 hover:bg-cyan-600">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex flex-col', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
      {/* Header */}
      <header className={cn(
        'border-b shrink-0',
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      )}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className={cn(
                'gap-2',
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </Button>
            <div className={cn('h-8 w-px', isDark ? 'bg-slate-800' : 'bg-slate-200')} />
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'
              )}>
                <FileText className={cn('w-5 h-5', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
              </div>
              <div>
                <h1 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {lesson.title}
                </h1>
                <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
                  {lesson.phase?.course?.title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lesson.scoringConfig && (
              <div className="flex items-center gap-2">
                <Badge className={cn('px-3 py-1', isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')}>
                  Tối đa: {lesson.scoringConfig.baseScore} điểm
                </Badge>
                {hints.length > 0 && revealedHints.size > 0 && (
                  <Badge className={cn('px-3 py-1 bg-amber-500/20 text-amber-400 border-amber-500/30')}>
                    Còn lại: {getRemainingScore()} điểm
                  </Badge>
                )}
              </div>
            )}
            
            {/* Completed Badge */}
            {isLessonCompleted && (
              <Badge className="gap-1 bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                <CheckCircle className="w-4 h-4" />
                Đã hoàn thành
              </Badge>
            )}
            
            {/* Mark Complete Button (for lessons without code content) */}
            {!isLessonCompleted && !hasCodeContent && (
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                variant="outline"
                className={cn(
                  'gap-2',
                  isDark ? 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300' : 'border-green-300 text-green-600 hover:bg-green-50'
                )}
              >
                {markingComplete ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkCheck className="w-4 h-4" />}
                Hoàn thành bài này
              </Button>
            )}
            
            {/* For lessons with code content, show complete when all tests passed */}
            {!isLessonCompleted && hasCodeContent && allTestsPassed && (
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                variant="outline"
                className={cn(
                  'gap-2',
                  isDark ? 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300' : 'border-green-300 text-green-600 hover:bg-green-50'
                )}
              >
                {markingComplete ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkCheck className="w-4 h-4" />}
                Hoàn thành bài này
              </Button>
            )}
            
            {/* Only show Run and Submit buttons for CODE lessons */}
            {hasCodeContent && (
              <>
                <Button
                  onClick={handleRunCode}
                  disabled={runningCode || !code.trim()}
                  variant="outline"
                  className={cn(
                    'gap-2',
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-300 text-slate-700'
                  )}
                >
                  {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Chạy code
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Nộp bài
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Height Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Content */}
        <div className={cn(
          'flex flex-col overflow-hidden', 
          hasCodeContent 
            ? 'w-1/2 border-r' 
            : 'w-full'
        , isDark ? 'border-slate-800' : 'border-slate-200')}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Header - Only show tabs for CODE lessons */}
            {hasCodeContent && (
              <div className={cn('px-4 pt-4 pb-0 shrink-0', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
                <TabsList className={cn(
                  'grid w-full grid-cols-3 h-12 p-1 rounded-xl',
                  isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
                )}>
                  <TabsTrigger
                    value="content"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg transition-all',
                      isDark
                        ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 text-slate-400 hover:text-white'
                        : 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-slate-600'
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden md:inline">Nội dung</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="testcases"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg transition-all',
                      isDark
                        ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 text-slate-400 hover:text-white'
                        : 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-slate-600'
                    )}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Test Cases</span>
                    <Badge variant="secondary" className="ml-1 text-xs">{publicTestCases.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="console"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg transition-all',
                      isDark
                        ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 text-slate-400 hover:text-white'
                        : 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-slate-600'
                    )}
                  >
                    <Terminal className="w-4 h-4" />
                    <span className="hidden md:inline">Console</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            )}

            {/* Content Tab */}
            <TabsContent value="content" className="m-0 p-4 overflow-auto">
              <div className="flex flex-col gap-4">
                {/* Main Content */}
                <Card className={cn('flex flex-col', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                  <CardHeader className={cn('border-b shrink-0 py-3', isDark ? 'border-slate-800' : 'border-slate-200')}>
                    <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                      <FileText className="w-5 h-5 text-cyan-500" />
                      Nội dung bài học
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-auto">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: lesson.lessonContent?.content || lesson.content || '<p class="text-slate-400 italic">Nội dung đang được cập nhật...</p>' }}
                    />
                  </CardContent>
                </Card>

                {/* Hints */}
                {hints.length > 0 && (
                  <Card className={cn('shrink-0', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                    <CardHeader className={cn('border-b py-3', isDark ? 'border-slate-800' : 'border-slate-200')}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Hints ({hints.length})
                        </CardTitle>
                        <Badge variant="outline" className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          -{lesson.scoringConfig?.penaltyPerHint || 10} điểm/hint
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3 pb-3 space-y-2 max-h-[180px] overflow-y-auto">
                      {hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-3 rounded-lg border transition-all',
                            isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200',
                            revealedHints.has(idx) ? '' : 'opacity-70'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn('font-medium text-sm', isDark ? 'text-cyan-400' : 'text-cyan-600')}>
                              Hint #{idx + 1}
                            </span>
                            {!revealedHints.has(idx) ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revealHint(idx)}
                                className="text-amber-500 hover:text-amber-600 text-xs h-7"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Xem (-{hint.penalty})
                              </Button>
                            ) : (
                              <span className="text-xs text-green-500">Đã xem</span>
                            )}
                          </div>
                          {revealedHints.has(idx) && (
                            <p className={cn('text-sm mt-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                              {hint.content}
                            </p>
                          )}
                        </div>
                      ))}
                      {getHintsUsed() > 0 && (
                        <div className={cn('text-sm text-center py-2', isDark ? 'text-amber-400' : 'text-amber-600')}>
                          Đã dùng {getHintsUsed()} hint(s)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Test Cases Tab - Only for CODE lessons */}
            {hasCodeContent && (
            <TabsContent value="testcases" className="m-0 p-4 overflow-auto">
              <Card className={cn('flex flex-col', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                <CardHeader className={cn('border-b shrink-0 py-3', isDark ? 'border-slate-800' : 'border-slate-200')}>
                  <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                    <PlayCircle className="w-5 h-5 text-cyan-500" />
                    Test Cases mẫu
                    <Badge variant="secondary">{publicTestCases.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 overflow-auto">
                  {publicTestCases.length > 0 ? (
                    <div className="space-y-4">
                      {publicTestCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-4 rounded-xl border',
                            isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className={cn(
                              'text-xs',
                              isDark ? 'border-green-500/30 text-green-400' : 'border-green-200 text-green-600'
                            )}>
                              Public
                            </Badge>
                            <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                              {tc.points} điểm
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className={cn('font-medium text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Input:</span>
                              <pre className={cn('mt-1 p-2 rounded text-xs font-mono overflow-x-auto',
                                isDark ? 'bg-slate-900 text-slate-300' : 'bg-white border border-slate-200'
                              )}>
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className={cn('font-medium text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Output:</span>
                              <pre className={cn('mt-1 p-2 rounded text-xs font-mono overflow-x-auto',
                                isDark ? 'bg-slate-900 text-slate-300' : 'bg-white border border-slate-200'
                              )}>
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FileText className={cn('w-16 h-16 mb-4 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
                      <p className={cn('text-lg font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>Không có test case mẫu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            )}

            {/* Console Tab - Only for CODE lessons */}
            {hasCodeContent && (
            <TabsContent value="console" className="m-0 p-4 overflow-auto">
              <Card className={cn(
                'flex flex-col',
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              )}>
                <CardHeader className={cn('border-b py-3 shrink-0', isDark ? 'border-slate-800' : 'border-slate-200')}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                      <Terminal className="w-5 h-5 text-cyan-500" />
                      Console
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        testResults.length > 0
                          ? testResults.every(r => r.passed)
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                      )}
                    >
                      {testResults.length > 0
                        ? `${testResults.filter(r => r.passed).length}/${testResults.length} Passed`
                        : 'Chưa chạy'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                  <div className="p-4 space-y-3">
                      {/* Empty State */}
                      {testResults.length === 0 && !runningCode && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Terminal className={cn('w-16 h-16 mb-4 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
                          <p className={cn('text-lg font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>Chưa có kết quả</p>
                          <p className={cn('text-sm mt-1', isDark ? 'text-slate-500' : 'text-slate-500')}>
                            Nhấn "Chạy code" để xem kết quả
                          </p>
                        </div>
                      )}

                      {/* Loading State */}
                      {runningCode && (
                        <div className="flex flex-col items-center justify-center py-16">
                          <Loader2 className={cn('w-10 h-10 animate-spin text-cyan-500 mb-4')} />
                          <p className={cn('text-base font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Đang chạy code...</p>
                        </div>
                      )}

                      {/* Test Results */}
                      {testResults.length > 0 && !runningCode && (
                        <>
                          {testResults.map((result, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'p-4 rounded-xl border',
                                result.passed
                                  ? isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                                  : isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                              )}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {result.passed ? (
                                    <CheckCircle className={cn('w-5 h-5', isDark ? 'text-green-400' : 'text-green-600')} />
                                  ) : (
                                    <XCircle className={cn('w-5 h-5', isDark ? 'text-red-400' : 'text-red-600')} />
                                  )}
                                  <span className={cn('font-semibold',
                                    result.passed
                                      ? isDark ? 'text-green-400' : 'text-green-700'
                                      : isDark ? 'text-red-400' : 'text-red-700'
                                  )}>
                                    Test {idx + 1}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      result.passed
                                        ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                        : 'border-red-500/30 text-red-400 bg-red-500/10'
                                    )}
                                  >
                                    {result.passed ? 'Passed' : 'Failed'}
                                  </Badge>
                                  {result.isPublic === false && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'border-slate-500/30 text-slate-400 bg-slate-500/10'
                                      )}
                                    >
                                      Hidden
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  {result.executionTime && (
                                    <span className={cn('flex items-center gap-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                      <Clock className="w-3 h-3" />
                                      {result.executionTime}ms
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Input</p>
                                  <pre className={cn(
                                    'p-2 rounded text-xs font-mono overflow-x-auto',
                                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                                  )}>
                                    {result.input || '(empty)'}
                                  </pre>
                                </div>
                                <div>
                                  <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Expected</p>
                                  <pre className={cn(
                                    'p-2 rounded text-xs font-mono overflow-x-auto',
                                    isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                                  )}>
                                    {result.expectedOutput || '(empty)'}
                                  </pre>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className={cn('text-xs font-medium mb-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Actual</p>
                                <pre className={cn(
                                  'p-2 rounded text-xs font-mono overflow-x-auto',
                                  result.passed
                                    ? isDark ? 'bg-green-500/10 text-green-300' : 'bg-green-100 text-green-700'
                                    : isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-100 text-red-700'
                                )}>
                                  {result.actualOutput || '(empty)'}
                                </pre>
                              </div>

                              {result.error && (
                                <div className={cn('mt-3 p-2 rounded flex items-start gap-2', isDark ? 'bg-red-500/10' : 'bg-red-100')}>
                                  <AlertTriangle className={cn('w-4 h-4 shrink-0 mt-0.5', isDark ? 'text-red-400' : 'text-red-600')} />
                                  <p className={cn('text-xs', isDark ? 'text-red-400' : 'text-red-700')}>{result.error}</p>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Summary */}
                          <div className={cn(
                            'p-4 rounded-xl border text-center',
                            testResults.every(r => r.passed)
                              ? (isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700')
                              : (isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700')
                          )}>
                            <p className="font-semibold">
                              {testResults.every(r => r.passed)
                                ? 'Tất cả test đã passed!'
                                : `${testResults.filter(r => r.passed).length}/${testResults.length} test passed`}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Panel - Code Editor (only for CODE lessons) */}
        {hasCodeContent && (
        <div className="w-1/2 flex flex-col overflow-hidden" style={isDark ? { backgroundColor: '#020617' } : { backgroundColor: '#f8fafc' }}>
          <Card className={cn('flex-1 flex flex-col overflow-hidden m-4 mb-0 rounded-xl', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
            <CardHeader className={cn('border-b shrink-0 py-3', isDark ? 'border-slate-800' : 'border-slate-200')}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                  <Code className="w-5 h-5 text-cyan-500" />
                  Code của bạn
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Language Selector */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      className={cn(
                        'gap-2 min-w-[130px] justify-start text-sm',
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <Code className="w-4 h-4 text-cyan-500" />
                      {selectedLanguage.name}
                      <ChevronDown className={cn(
                        'w-4 h-4 ml-auto transition-transform',
                        showLanguageDropdown ? 'rotate-180' : ''
                      )} />
                    </Button>

                    {showLanguageDropdown && (
                      <div className={cn(
                        'absolute top-full right-0 mt-1 w-48 max-h-64 overflow-y-auto rounded-lg border shadow-xl z-50',
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      )}>
                        <div className="p-1">
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                              key={lang.id}
                              onClick={() => handleLanguageChange(lang.id)}
                              className={cn(
                                'w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2 transition-colors',
                                selectedLanguage.id === lang.id
                                  ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                                  : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                              )}
                            >
                              <Code className="w-4 h-4" />
                              <span className="flex-1">{lang.name}</span>
                              <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>.{lang.extension}</span>
                              {selectedLanguage.id === lang.id && <Check className="w-4 h-4 text-cyan-500" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetConfirm(true)}
                    className={cn(
                      'gap-2 text-sm',
                      isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600'
                    )}
                    title="Reset code về ban đầu"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className={cn(
                      'gap-2 text-sm',
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                    )}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Đã copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showResetConfirm && (
              <div className={cn('px-4 py-3 border-b flex items-center justify-between', isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200')}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn('w-4 h-4', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  <span className={cn('text-sm', isDark ? 'text-amber-300' : 'text-amber-700')}>
                    Reset code? Hành động này sẽ xóa tất cả thay đổi của bạn.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                    className={isDark ? 'text-slate-400' : 'text-slate-600'}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResetCode}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
            <CardContent className="flex-1 min-h-0 p-0">
              <div className={cn('h-full min-h-[400px]', isDark ? 'bg-[#0f172a]' : 'bg-[#fafafa]')}>
                <Editor
                  height="100%"
                  language={selectedLanguage.id}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  theme={isDark ? 'codefit-dark' : 'codefit-light'}
                  options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    padding: { top: 16, bottom: 16 },
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission Result */}
          {result && (
            <div className="p-4 pt-2">
              <Card className={cn(
                'border-2',
                allTestsPassed
                  ? (isDark ? 'bg-slate-900 border-green-500/50' : 'border-green-500')
                  : (isDark ? 'bg-slate-900 border-red-500/50' : 'border-red-500')
              )}>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2">
                    {allTestsPassed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    Kết quả nộp bài
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-3">
                    <p className={cn(
                      'text-4xl font-bold',
                      allTestsPassed ? 'text-green-500' : 'text-red-500'
                    )}>{result.score}</p>
                    <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {result.passedTests}/{result.totalTests} testcases đúng
                    </p>
                  </div>

                  {result.hintsUsed > 0 && (
                    <div className={cn('p-2 rounded text-sm text-center', isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')}>
                      Đã dùng {result.hintsUsed} hint(s) - Trừ {result.hintsUsed * (lesson.scoringConfig?.penaltyPerHint || 10)} điểm
                    </div>
                  )}

                  {allTestsPassed && nextLesson && (
                    <div className={cn(
                      'p-3 rounded-lg border-2 border-green-500/30 text-center',
                      isDark ? 'bg-green-500/10' : 'bg-green-50'
                    )}>
                      <p className={cn('text-sm mb-2', isDark ? 'text-green-400' : 'text-green-600')}>
                        Chúc mừng! Bạn đã hoàn thành bài học!
                      </p>
                      <Button
                        onClick={() => navigate(`/user/lesson/${nextLesson.id}`)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Bài tiếp theo: {nextLesson.title}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {!allTestsPassed && result && (
                    <div className={cn(
                      'p-3 rounded-lg border text-center',
                      isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                    )}>
                      <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Cần pass tất cả test cases để chuyển bài
                      </p>
                      <p className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
                        {result.passedTests}/{result.totalTests} đã pass - Còn {result.totalTests - result.passedTests} test
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default UserLessonPage;
