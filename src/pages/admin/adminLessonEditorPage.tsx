import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import {
  Save, ArrowLeft, Plus, Trash2,
  Lightbulb, Code, FileText, Settings as SettingsIcon,
  Loader2, Play, Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Quote, Copy, Check, ChevronDown,
  Languages, ArrowRightLeft, Eye, CheckCircle, XCircle,
  AlertTriangle, Terminal, Sparkles, Send, Clock
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { message } from 'antd';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'c', name: 'C', extension: 'c' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
  { id: 'php', name: 'PHP', extension: 'php' },
  { id: 'sql', name: 'SQL', extension: 'sql' },
  { id: 'shell', name: 'Shell/Bash', extension: 'sh' },
];

interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
  description?: string;
}

interface Hint {
  id?: string;
  content: string;
  order: number;
  penalty: number;
}

interface LessonData {
  id: string;
  title: string;
  type: string;
  status: string;
  feedback?: string;
  phase: {
    id: string;
    title: string;
    course: { id: string; title: string };
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
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
}

type FormatType = 'bold' | 'italic' | 'underline' | 'heading1' | 'heading2' | 'bulletList' | 'numberedList' | 'quote' | 'code' | 'link';

export default function AdminLessonEditorPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdmin();
  const editorRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const [generatingHints, setGeneratingHints] = useState(false);
  const [aiHintsDialogOpen, setAiHintsDialogOpen] = useState(false);
  const [generatedHints, setGeneratedHints] = useState<Hint[]>([]);
  const [selectedGeneratedHints, setSelectedGeneratedHints] = useState<Set<number>>(new Set());
  const [numHintsToGenerate, setNumHintsToGenerate] = useState(3);

  const [starterCode, setStarterCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [content, setContent] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | null>(5000);
  const [memoryLimit, setMemoryLimit] = useState<number | null>(256);
  const [baseScore, setBaseScore] = useState(100);
  const [penaltyPerHint, setPenaltyPerHint] = useState(10);

  const fetchLessonData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lecture.lessonContent(lessonId!), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        setLessonData(data);
        setContent(data.lessonContent?.content || '');
        setStarterCode(data.lessonContent?.starterCode || '');
        const savedLang = data.lessonContent?.starterLanguage;
        if (savedLang) {
          const lang = SUPPORTED_LANGUAGES.find(l => l.id === savedLang);
          if (lang) setSelectedLanguage(lang);
        }
        setTimeLimit(data.lessonContent?.timeLimit || 5000);
        setMemoryLimit(data.lessonContent?.memoryLimit || 256);
        try { setTestCases(JSON.parse(data.lessonContent?.testCases || '[]')); } catch { setTestCases([]); }
        try { setHints(JSON.parse(data.lessonContent?.hints || '[]')); } catch { setHints([]); }
      } else {
        message.error(result.message || 'Không thể tải bài học');
      }
    } catch {
      message.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) fetchLessonData();
  }, [lessonId, fetchLessonData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.lecture.lessonContentUpdate(lessonId!), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          testCases,
          hints,
          starterCode,
          starterLanguage: selectedLanguage.id,
          timeLimit,
          memoryLimit,
        }),
      });
      const data = await response.json();
      if (data.success) message.success('Đã lưu!');
      else message.error(data.message || 'Lưu thất bại');
    } catch {
      message.error('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const token = localStorage.getItem('token');
      // Save content first
      const saveRes = await fetch(API_ENDPOINTS.lecture.lessonContentUpdate(lessonId!), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          testCases,
          hints,
          starterCode,
          starterLanguage: selectedLanguage.id,
          timeLimit,
          memoryLimit,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) {
        message.error(saveData.message || 'Lưu nội dung thất bại');
        setPublishing(false);
        return;
      }

      // If not approved/published yet, approve first
      if (lessonData?.status !== 'APPROVED' && lessonData?.status !== 'PUBLISHED') {
        const approveRes = await fetch(API_ENDPOINTS.admin.approveLesson(lessonId!), {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const approveData = await approveRes.json();
        if (!approveData.success) {
          message.warning('Lưu thành công nhưng duyệt bài thất bại: ' + (approveData.message || ''));
        }
      }

      // Then publish
      const pubRes = await fetch(API_ENDPOINTS.admin.publishLesson(lessonId!), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const pubData = await pubRes.json();
      if (pubData.success) {
        message.success('Đã xuất bản bài học!');
        setPublishDialogOpen(false);
        if (lessonData?.phase?.course?.id) navigate(`/admin/courses/${lessonData.phase.course.id}/edit`);
      } else {
        message.error(pubData.message || 'Xuất bản thất bại');
      }
    } catch {
      message.error('Lỗi kết nối');
    } finally {
      setPublishing(false);
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('codefit-dark', {
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
    monaco.editor.defineTheme('codefit-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'string', foreground: '#A31515' },
        { token: 'number', foreground: '098658' },
      ],
      colors: {
        'editor.background': '#fafafa',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
      },
    });
  };

  const handleLanguageChange = (langId: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (lang) { setSelectedLanguage(lang); setShowLanguageDropdown(false); message.info(`Đã chuyển sang ${lang.name}`); }
  };

  const handleConvertCode = (targetLangId: string) => {
    handleLanguageChange(targetLangId);
    message.info('Đã chuyển ngôn ngữ. Vui lòng cập nhật code cho phù hợp.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(starterCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const insertFormat = (format: FormatType) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let before = '', after = '';
    switch (format) {
      case 'bold': before = '**'; after = '**'; break;
      case 'italic': before = '*'; after = '*'; break;
      case 'underline': before = '__'; after = '__'; break;
      case 'heading1': before = '# '; after = ''; break;
      case 'heading2': before = '## '; after = ''; break;
      case 'bulletList': before = '\n- '; after = ''; break;
      case 'numberedList': before = '\n1. '; after = ''; break;
      case 'quote': before = '\n> '; after = ''; break;
      case 'code': before = '```\n'; after = '\n```'; break;
      case 'link': before = '['; after = '](url)'; break;
    }
    setContent(content.substring(0, start) + before + selectedText + after + content.substring(end));
  };

  const addTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: true, points: 10, description: '' }]);
  const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));
  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const addHint = () => setHints([...hints, { content: '', order: hints.length + 1, penalty: 10 }]);
  const removeHint = (index: number) => setHints(hints.filter((_, i) => i !== index).map((h, i) => ({ ...h, order: i + 1 })));
  const updateHint = (index: number, field: keyof Hint, value: any) => {
    const updated = [...hints];
    updated[index] = { ...updated[index], [field]: value };
    setHints(updated);
  };

  const handleGenerateHints = async () => {
    if (!lessonId || !content.trim()) { message.warning('Nội dung bài học trống.'); return; }
    setGeneratingHints(true);
    setGeneratedHints([]);
    setSelectedGeneratedHints(new Set());
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ai.generateHints, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, numHints: numHintsToGenerate }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setGeneratedHints(result.data);
        setSelectedGeneratedHints(new Set(result.data.map((_: any, i: number) => i)));
      } else {
        message.error(result.message || 'Không thể tạo gợi ý');
      }
    } catch { message.error('Lỗi kết nối khi tạo gợi ý'); }
    finally { setGeneratingHints(false); }
  };

  const toggleGeneratedHint = (index: number) => {
    const newSelected = new Set(selectedGeneratedHints);
    newSelected.has(index) ? newSelected.delete(index) : newSelected.add(index);
    setSelectedGeneratedHints(newSelected);
  };

  const toggleSelectAllGeneratedHints = () => {
    if (selectedGeneratedHints.size === generatedHints.length) setSelectedGeneratedHints(new Set());
    else setSelectedGeneratedHints(new Set(generatedHints.map((_, i) => i)));
  };

  const handleApplyGeneratedHints = () => {
    if (selectedGeneratedHints.size === 0) { message.warning('Vui lòng chọn ít nhất một gợi ý'); return; }
    const selected = generatedHints.filter((_, i) => selectedGeneratedHints.has(i)).map((h, i) => ({ ...h, id: undefined, order: hints.length + i + 1 }));
    setHints([...hints, ...selected]);
    setAiHintsDialogOpen(false);
    message.success(`Đã thêm ${selected.length} gợi ý!`);
  };

  const handleRunCode = async (testIndex?: number) => {
    if (!starterCode.trim()) { message.warning('Vui lòng nhập code trước khi chạy'); return; }
    setRunningCode(true);
    setTestResults([]);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.submissions.run, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: starterCode, language: selectedLanguage.id, lessonId }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setTestResults(result.data.results || []);
      } else {
        const results: TestResult[] = testCases.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          passed: false,
          error: 'Không thể chạy code (mock mode)',
        }));
        if (testIndex !== undefined && testCases[testIndex]) {
          results[testIndex].actualOutput = testCases[testIndex].expectedOutput;
          results[testIndex].passed = true;
        }
        setTestResults(results);
      }
    } catch {
      const results: TestResult[] = testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: '',
        passed: false,
        error: 'Lỗi kết nối (mock mode)',
      }));
      setTestResults(results);
    } finally { setRunningCode(false); }
  };

  const handleRunAllTests = () => handleRunCode();

  const getStatusBadge = () => {
    const status = lessonData?.status || 'DRAFT';
    const config: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      DRAFT: { bg: 'bg-gray-500/20 text-gray-400 border-gray-500', text: 'text-gray-400', label: 'Bản nháp', icon: FileText },
      IN_PROGRESS: { bg: 'bg-blue-500/20 text-blue-400 border-blue-500', text: 'text-blue-400', label: 'Đang làm', icon: Loader2 },
      PENDING_REVIEW: { bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500', text: 'text-yellow-400', label: 'Chờ duyệt', icon: Terminal },
      APPROVED: { bg: 'bg-green-500/20 text-green-400 border-green-500', text: 'text-green-400', label: 'Đã duyệt', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-500/20 text-red-400 border-red-500', text: 'text-red-400', label: 'Bị từ chối', icon: XCircle },
      PUBLISHED: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500', text: 'text-emerald-400', label: 'Đã xuất bản', icon: CheckCircle },
    };
    const c = config[status] || config.DRAFT;
    const Icon = c.icon;
    return (
      <Badge variant="outline" className={cn(c.bg, c.text, 'gap-1')}>
        <Icon className="w-3 h-3" />
        {c.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center min-h-screen', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen p-6', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
      {/* Header */}
      <div className="flex items-center gap-4 max-w-7xl mx-auto mb-6">
        <Button variant="ghost" onClick={() => navigate(lessonData?.phase?.course?.id ? `/admin/courses/${lessonData.phase.course.id}/edit` : '/admin/courses')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <span className={cn('text-xs px-2 py-1 rounded-full font-medium', isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}>
            ADMIN
          </span>
          <h1 className={cn('text-xl font-bold truncate', isDark ? 'text-white' : 'text-slate-900')}>
            {lessonData?.title || 'Sửa bài học'}
          </h1>
          {lessonData && (
            <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              — {lessonData.phase?.course?.title}
            </span>
          )}
        </div>
        {getStatusBadge()}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving} className={cn(isDark ? 'border-slate-700' : '')}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu
          </Button>
          <Button onClick={() => setPublishDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Send className="w-4 h-4" />
            Xuất bản
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className={cn('flex flex-wrap items-center gap-3 p-3 rounded-xl border',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        )}>
          <div className="flex items-center gap-2 flex-1">
            <Button variant="outline" size="sm" onClick={() => setShowSplitView(!showSplitView)} className={cn('gap-2', isDark ? 'border-slate-700' : '')}>
              <Terminal className="w-4 h-4" />
              {showSplitView ? 'Tắt preview' : 'Bật preview code'}
            </Button>
            {showSplitView && (
              <Button variant="outline" size="sm" onClick={handleRunAllTests} disabled={runningCode || testCases.length === 0} className={cn('gap-2', isDark ? 'border-slate-700' : '')}>
                {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Chạy tất cả test
              </Button>
            )}
          </div>
        </div>

        {/* Split View Layout */}
        <div className={cn('grid gap-6', showSplitView ? 'lg:grid-cols-2' : 'grid-cols-1')}>
          <div className={cn('space-y-6', showSplitView && 'order-1')}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className={cn('grid w-full max-w-2xl grid-cols-4 h-12 p-1 rounded-xl',
                isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
              )}>
                {[
                  { value: 'content', icon: FileText, label: 'Nội dung' },
                  { value: 'code', icon: Code, label: 'Code' },
                  { value: 'testcases', icon: Play, label: 'Test Cases' },
                  { value: 'settings', icon: SettingsIcon, label: 'Cài đặt' },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value} className={cn('flex items-center justify-center gap-2 rounded-lg transition-all',
                    isDark
                      ? 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 text-slate-400'
                      : 'data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-slate-600'
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card className={cn('overflow-hidden', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                  <CardHeader className={cn('border-b', isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex items-center justify-between py-3">
                      <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Soạn nội dung bài học</CardTitle>
                      <div className={cn('flex items-center gap-1 p-1 rounded-lg', isDark ? 'bg-slate-800/50' : 'bg-white border border-slate-200')}>
                        {[
                          { icon: Bold, format: 'bold', title: 'Bold' },
                          { icon: Italic, format: 'italic', title: 'Italic' },
                          { icon: Underline, format: 'underline', title: 'Underline' },
                          { type: 'sep' },
                          { icon: Heading1, format: 'heading1', title: 'H1' },
                          { icon: Heading2, format: 'heading2', title: 'H2' },
                          { type: 'sep' },
                          { icon: List, format: 'bulletList', title: 'List' },
                          { icon: ListOrdered, format: 'numberedList', title: 'Numbered' },
                          { icon: Quote, format: 'quote', title: 'Quote' },
                          { type: 'sep' },
                          { icon: Code, format: 'code', title: 'Code' },
                        ].map((item, idx) => {
                          if ('type' in item) return <div key={idx} className={cn('w-px h-5 mx-1', isDark ? 'bg-slate-700' : 'bg-slate-300')} />;
                          const Icon = item.icon!;
                          return (
                            <Button key={item.format} variant="ghost" size="sm" onClick={() => insertFormat(item.format as FormatType)}
                              className={cn('h-7 w-7 p-0', isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')} title={item.title}>
                              <Icon className="w-4 h-4" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Textarea id="content-editor" value={content} onChange={(e) => setContent(e.target.value)}
                      placeholder={'Viết nội dung bài học...\n\n# Tiêu đề\n\nNội dung...'}
                      className={cn('min-h-[450px] border-0 rounded-none focus-visible:ring-0 resize-none p-6 font-mono text-sm leading-relaxed',
                        isDark ? 'bg-slate-950 text-slate-300 placeholder:text-slate-600' : 'bg-white text-slate-800 placeholder:text-slate-400'
                      )} />
                  </CardContent>
                </Card>

                {/* Hints */}
                <Card className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                  <CardHeader className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-200')}>
                    <div className="flex items-center justify-between py-2">
                      <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Gợi ý
                        <Badge variant="secondary" className="ml-1">{hints.length}</Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => { if (!content.trim()) { message.warning('Nhập nội dung trước'); return; } setAiHintsDialogOpen(true); handleGenerateHints(); }}
                          className={cn('gap-2', isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-cyan-200 text-cyan-600 hover:bg-cyan-50')}>
                          {generatingHints ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          Tạo từ AI
                        </Button>
                        <Button size="sm" variant="outline" onClick={addHint} className={cn('gap-2', isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : '')}>
                          <Plus className="w-4 h-4" />Thêm gợi ý
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {hints.map((hint, index) => (
                      <div key={index} className={cn('p-4 rounded-xl border', isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200')}>
                        <div className="flex items-start gap-4">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                            isDark ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-100 text-yellow-600')}>
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            <Textarea value={hint.content} onChange={(e) => updateHint(index, 'content', e.target.value)} placeholder="Nội dung gợi ý..." rows={2}
                              className={cn('resize-none', isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500' : 'border-slate-200 focus:border-cyan-500')} />
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-600')}>Điểm trừ:</Label>
                                <Input type="number" value={hint.penalty} onChange={(e) => updateHint(index, 'penalty', parseInt(e.target.value) || 0)}
                                  className={cn('w-20 h-8 text-center', isDark ? 'bg-slate-900 border-slate-700 text-white' : '')} />
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeHint(index)} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {hints.length === 0 && (
                      <div className={cn('text-center py-12 rounded-xl border-2 border-dashed',
                        isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200')}>
                        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-base font-medium">Chưa có gợi ý nào</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="space-y-4">
                <Card className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                  <CardHeader className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-200')}>
                    <div className="flex items-center justify-between py-2">
                      <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Code mẫu (Starter Code)</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className={cn('gap-2', isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600')}>
                          <Eye className="w-4 h-4" />{showPreview ? 'Ẩn preview' : 'Hiện preview'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCopyCode} className={cn('gap-2', isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600')}>
                          {copiedCode ? <><Check className="w-4 h-4 text-green-500" /><span className="text-green-500">Đã copy!</span></> : <><Copy className="w-4 h-4" />Copy</>}
                        </Button>
                      </div>
                    </div>
                    <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>Code khởi đầu mà học viên sẽ thấy khi bắt đầu làm bài</p>
                  </CardHeader>
                  <div className={cn('px-4 py-3 border-b flex items-center justify-between',
                    isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                          className={cn('gap-2 min-w-[140px] justify-start', isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100')}>
                          <Code className="w-4 h-4 text-cyan-500" />
                          {selectedLanguage.name}
                          <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform', showLanguageDropdown ? 'rotate-180' : '')} />
                        </Button>
                        {showLanguageDropdown && (
                          <div className={cn('absolute top-full left-0 mt-1 w-56 max-h-80 overflow-y-auto rounded-lg border shadow-xl z-50',
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
                            <div className="p-2"><p className={cn('text-xs font-medium px-2 py-1', isDark ? 'text-slate-500' : 'text-slate-500')}>Chọn ngôn ngữ</p></div>
                            <div className={cn('h-px', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                            <div className="p-1">
                              {SUPPORTED_LANGUAGES.map((lang) => (
                                <button key={lang.id} onClick={() => handleLanguageChange(lang.id)}
                                  className={cn('w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2 transition-colors',
                                    selectedLanguage.id === lang.id
                                      ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100')}>
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
                      <div className="relative group">
                        <Button variant="outline" size="sm" className={cn('gap-2', isDark ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100')}>
                          <ArrowRightLeft className="w-4 h-4 text-purple-500" />Chuyển đổi
                        </Button>
                        <div className={cn('absolute top-full left-0 mt-1 w-48 rounded-lg border shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all',
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
                          <div className="p-1">
                            {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
                              <button key={lang.id} onClick={() => handleConvertCode(lang.id)}
                                className={cn('w-full px-3 py-2 text-left text-sm rounded-md flex items-center gap-2 transition-colors',
                                  isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100')}>
                                <Languages className="w-4 h-4" />{lang.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('gap-1',
                      isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border-cyan-200')}>
                      <Code className="w-3 h-3" />{selectedLanguage.name}
                    </Badge>
                  </div>
                  <CardContent className="p-0">
                    <div className={cn('h-[450px]', isDark ? 'bg-[#0f172a]' : 'bg-[#fafafa]')}>
                      <Editor height="100%" language={selectedLanguage.id} value={starterCode}
                        onChange={(value) => setStarterCode(value || '')} onMount={handleEditorMount}
                        theme={isDark ? 'codefit-dark' : 'codefit-light'}
                        options={{ fontSize: 14, fontFamily: "'Fira Code', Consolas, monospace", fontLigatures: true, minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbers: 'on', renderLineHighlight: 'all', cursorBlinking: 'smooth', padding: { top: 16, bottom: 16 }, automaticLayout: true, tabSize: 2, wordWrap: 'on' }} />
                    </div>
                  </CardContent>
                  {showPreview && (
                    <div className={cn('border-t p-4', isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200')}>
                      <h4 className={cn('text-sm font-medium mb-2 flex items-center gap-2', isDark ? 'text-slate-300' : 'text-slate-700')}><Eye className="w-4 h-4" />Preview Code</h4>
                      <pre className={cn('p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-48',
                        isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-800 border border-slate-200')}>
                        {starterCode || '// No code yet'}
                      </pre>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Test Cases Tab */}
              <TabsContent value="testcases" className="space-y-4">
                <Card className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                  <CardHeader className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-200')}>
                    <div className="flex items-center justify-between py-2">
                      <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                        Test Cases <Badge variant="secondary" className="ml-2">{testCases.length}</Badge>
                      </CardTitle>
                      <Button size="sm" onClick={addTestCase} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                        <Plus className="w-4 h-4" />Thêm Test Case
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {testCases.map((tc, index) => (
                      <div key={index} className={cn('p-5 rounded-xl border', isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200')}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                              tc.isPublic ? isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-100 text-green-600' : isDark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-600')}>
                              {index + 1}
                            </div>
                            <span className={cn('font-medium', isDark ? 'text-white' : 'text-slate-900')}>Test Case {index + 1}</span>
                            <Badge variant="outline" className={tc.isPublic
                              ? cn('border-green-500/30 text-green-400', isDark ? 'bg-green-500/10' : 'bg-green-50')
                              : cn('border-purple-500/30 text-purple-400', isDark ? 'bg-purple-500/10' : 'bg-purple-50')}>
                              {tc.isPublic ? 'Public' : 'Hidden'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Label className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-600')}>Points:</Label>
                              <Input type="number" value={tc.points} onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 0)}
                                className={cn('w-16 h-8 text-center', isDark ? 'bg-slate-900 border-slate-700 text-white' : '')} />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeTestCase(index)} className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 ml-2">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className={cn('text-sm mb-2 block font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>Input</Label>
                            <Textarea value={tc.input} onChange={(e) => updateTestCase(index, 'input', e.target.value)} placeholder="Input data..." rows={3}
                              className={cn('font-mono text-sm resize-none', isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500' : 'border-slate-200 focus:border-cyan-500')} />
                          </div>
                          <div>
                            <Label className={cn('text-sm mb-2 block font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>Expected Output</Label>
                            <Textarea value={tc.expectedOutput} onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)} placeholder="Expected output..." rows={3}
                              className={cn('font-mono text-sm resize-none', isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-cyan-500' : 'border-slate-200 focus:border-cyan-500')} />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dashed">
                          <div className="flex items-center gap-2">
                            <Switch checked={tc.isPublic} onCheckedChange={(checked) => updateTestCase(index, 'isPublic', checked)} id={`public-${index}`} />
                            <Label htmlFor={`public-${index}`} className={cn('text-sm cursor-pointer', isDark ? 'text-slate-400' : 'text-slate-600')}>
                              Public test case (hiển thị cho học viên)
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                    {testCases.length === 0 && (
                      <div className={cn('text-center py-16 rounded-xl border-2 border-dashed',
                        isDark ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-200')}>
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Chưa có test case nào</p>
                        <Button onClick={addTestCase} size="sm" className="bg-cyan-500 hover:bg-cyan-600"><Plus className="w-4 h-4 mr-2" />Thêm Test Case đầu tiên</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                    <CardHeader className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-200')}>
                      <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Cấu hình chấm điểm</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div>
                        <Label className={cn('mb-2 block font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Điểm tối đa</Label>
                        <Input type="number" value={baseScore} onChange={(e) => setBaseScore(parseInt(e.target.value) || 0)}
                          className={cn(isDark ? 'bg-slate-800 border-slate-700 text-white' : '')} />
                      </div>
                      <div>
                        <Label className={cn('mb-2 block font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Điểm trừ mỗi gợi ý</Label>
                        <Input type="number" value={penaltyPerHint} onChange={(e) => setPenaltyPerHint(parseInt(e.target.value) || 0)}
                          className={cn(isDark ? 'bg-slate-800 border-slate-700 text-white' : '')} />
                      </div>
                      <Button onClick={handleSave} disabled={saving} className="w-full bg-cyan-500 hover:bg-cyan-600">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Lưu cấu hình
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                    <CardHeader className={cn('border-b', isDark ? 'border-slate-800' : 'border-slate-200')}>
                      <CardTitle className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Giới hạn Runtime</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div>
                        <Label className={cn('mb-2 block font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Time Limit (ms)</Label>
                        <Input type="number" value={timeLimit || ''} onChange={(e) => setTimeLimit(parseInt(e.target.value) || null)} placeholder="5000"
                          className={cn(isDark ? 'bg-slate-800 border-slate-700 text-white' : '')} />
                      </div>
                      <div>
                        <Label className={cn('mb-2 block font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>Memory Limit (MB)</Label>
                        <Input type="number" value={memoryLimit || ''} onChange={(e) => setMemoryLimit(parseInt(e.target.value) || null)} placeholder="256"
                          className={cn(isDark ? 'bg-slate-800 border-slate-700 text-white' : '')} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Code Preview/Output */}
          {showSplitView && (
            <div className="space-y-4 order-2">
              <Card className={cn('overflow-hidden sticky top-6',
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm')}>
                <CardHeader className={cn('border-b py-3',
                  isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200')}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn('text-base font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                      <Terminal className="w-4 h-4 text-cyan-500" />
                      Kết quả chạy code
                    </CardTitle>
                    <Badge variant="outline" className={cn(
                      testResults.length > 0 ? testResults.every(r => r.passed)
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30')}>
                      {testResults.length > 0 ? `${testResults.filter(r => r.passed).length}/${testResults.length} Passed` : 'Chưa chạy'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="p-4 space-y-4">
                      {testResults.length === 0 && !runningCode && (
                        <div className={cn('flex flex-col items-center justify-center py-16 text-center rounded-lg border-2 border-dashed',
                          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400')}>
                          <Terminal className="w-16 h-16 mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Chưa có kết quả</p>
                          <p className="text-sm">Nhấn "Chạy tất cả test" để kiểm tra code</p>
                        </div>
                      )}
                      {runningCode && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                          <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đang chạy...</p>
                        </div>
                      )}
                      {testResults.map((result, index) => (
                        <div key={index} className={cn('p-4 rounded-xl border',
                          result.passed ? isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                            : isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200')}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={cn('font-semibold', result.passed ? isDark ? 'text-green-400' : 'text-green-700' : isDark ? 'text-red-400' : 'text-red-700')}>
                              Test {index + 1}: {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            {result.executionTime && (
                              <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                <Clock className="w-3 h-3 inline mr-1" />{result.executionTime}ms
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div>
                              <p className={cn('font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>Input:</p>
                              <pre className={cn('p-2 rounded text-xs overflow-x-auto', isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700')}>{result.input || '(empty)'}</pre>
                            </div>
                            <div>
                              <p className={cn('font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>Expected:</p>
                              <pre className={cn('p-2 rounded text-xs overflow-x-auto', isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700')}>{result.expectedOutput || '(empty)'}</pre>
                            </div>
                            <div className="col-span-2">
                              <p className={cn('font-medium mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>Actual:</p>
                              <pre className={cn('p-2 rounded text-xs overflow-x-auto',
                                result.passed ? isDark ? 'bg-green-500/10 text-green-300' : 'bg-green-100 text-green-800'
                                  : isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-100 text-red-800')}>{result.actualOutput || '(no output)'}</pre>
                            </div>
                          </div>
                          {result.error && (
                            <p className={cn('text-xs mt-2', isDark ? 'text-red-400' : 'text-red-700')}>{result.error}</p>
                          )}
                        </div>
                      ))}
                      {testResults.length > 0 && (
                        <div className={cn('p-4 rounded-xl border text-center',
                          testResults.every(r => r.passed)
                            ? isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                            : isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700')}>
                          <p className="font-semibold">
                            {testResults.every(r => r.passed) ? 'Tất cả test đã passed!' : `${testResults.filter(r => r.passed).length}/${testResults.length} test passed`}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* AI Hints Dialog */}
      <Dialog open={aiHintsDialogOpen} onOpenChange={setAiHintsDialogOpen}>
        <DialogContent className={cn(isDark ? 'bg-slate-900 border-slate-800' : 'max-w-lg')}>
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', isDark ? 'text-white' : '')}>
              <Sparkles className="w-5 h-5 text-yellow-500" />Tạo gợi ý từ AI
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Label className={cn('text-sm font-medium shrink-0', isDark ? 'text-slate-300' : 'text-slate-700')}>Số lượng gợi ý:</Label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <Button key={n} size="sm" variant={numHintsToGenerate === n ? 'default' : 'outline'} onClick={() => { setNumHintsToGenerate(n); if (generatedHints.length > 0) handleGenerateHints(); }}
                    className={cn('w-10 h-8 text-sm', numHintsToGenerate === n ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : isDark ? 'border-slate-700 text-slate-300' : '')}>
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className={cn('flex items-start gap-2 p-3 rounded-lg text-sm',
              isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200')}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Sau khi thêm, bạn cần <strong>tự nhập điểm trừ</strong> cho từng gợi ý.</p>
            </div>
            {generatingHints && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Đang tạo gợi ý...</p>
              </div>
            )}
            {!generatingHints && generatedHints.length > 0 && (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={toggleSelectAllGeneratedHints} className={cn('text-xs h-7', isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500')}>
                    {selectedGeneratedHints.size === generatedHints.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{selectedGeneratedHints.size}/{generatedHints.length} đã chọn</span>
                </div>
                {generatedHints.map((hint, index) => (
                  <div key={index} onClick={() => toggleGeneratedHint(index)}
                    className={cn('p-3 rounded-xl border cursor-pointer transition-all',
                      selectedGeneratedHints.has(index)
                        ? isDark ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                        : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5',
                        selectedGeneratedHints.has(index) ? 'bg-cyan-500 border-cyan-500' : isDark ? 'border-slate-600' : 'border-slate-300')}>
                        {selectedGeneratedHints.has(index) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600')}>#{index + 1}</span>
                        <p className={cn('text-sm leading-relaxed mt-1', isDark ? 'text-slate-300' : 'text-slate-700')}>{hint.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAiHintsDialogOpen(false)} className={cn(isDark ? 'border-slate-700 text-slate-300' : '')}>Hủy</Button>
            <Button onClick={handleApplyGeneratedHints} disabled={generatingHints || selectedGeneratedHints.size === 0} className="bg-cyan-500 hover:bg-cyan-600">
              <Check className="w-4 h-4 mr-2" />
              Thêm {selectedGeneratedHints.size > 0 ? `${selectedGeneratedHints.size} gợi ý` : 'gợi ý'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className={cn(isDark ? 'bg-slate-900 border-slate-800' : '')}>
          <DialogHeader>
            <DialogTitle className={cn(isDark ? 'text-white' : '')}>Xuất bản bài học?</DialogTitle>
          </DialogHeader>
          <div className={cn('py-4 space-y-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
            <p>Bài học sẽ được lưu và <strong>xuất bản ngay</strong>, học viên có thể xem nội dung.</p>
            <p className="text-sm opacity-70">Bạn có thể chỉnh sửa lại sau nếu cần.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)} className={cn(isDark ? 'border-slate-700 text-slate-300' : '')}>Hủy</Button>
            <Button onClick={handlePublish} disabled={publishing} className="bg-green-500 hover:bg-green-600 text-white gap-2">
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Lưu & Xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
