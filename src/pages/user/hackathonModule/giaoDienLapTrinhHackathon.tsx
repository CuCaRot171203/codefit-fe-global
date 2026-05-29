'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import {
  FileText,
  Code2,
  Terminal,
  BarChart3,
  Settings,
  Maximize2,
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { hackathonService } from '@/services/api';

type EditorTab = 'console' | 'testcases';

interface TestResult {
  testId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  isPublic: boolean;
}

const languages = [
  { id: 'javascript', name: 'JavaScript', color: '#f7df1e' },
  { id: 'python', name: 'Python 3', color: '#ffddb8' },
  { id: 'cpp', name: 'C++', color: '#00599C' },
  { id: 'java', name: 'Java', color: '#ed8b00' },
];

const defaultCode: Record<string, string> = {
  javascript: `// Viết code giải bài tại đây
function solution(input) {
  // TODO: implement
  return input;
}`,
  python: `# Viết code giải bài tại đây
def solution(input):
    # TODO: implement
    return input`,
  cpp: `// Viết code giải bài tại đây
#include <bits/stdc++.h>
using namespace std;

int main() {
    // TODO: implement
    return 0;
}`,
  java: `// Viết code giải bài tại đây
public class Solution {
    public static void main(String[] args) {
        // TODO: implement
    }
}`,
};

const GiaoDienLapTrinhHackathon = () => {
  const { hackathonId, problemId } = useParams<{ hackathonId: string; problemId: string }>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Data states
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemDifficulty, setProblemDifficulty] = useState('medium');
  const [problemPoints, setProblemPoints] = useState(100);
  const [problemExamples] = useState<{ input: string; output: string }[]>([]);
  const [problemConstraints] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [editorTab, setEditorTab] = useState<EditorTab>('console');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [code, setCode] = useState(defaultCode.javascript);
  const [sidebarItem, setSidebarItem] = useState<'problem' | 'editor' | 'tests' | 'output'>('problem');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Running/submission states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<any>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);

  // Fetch problem data
  useEffect(() => {
    if (!hackathonId || !problemId || !token) return;

    const fetchData = async () => {
      setLoadingProblem(true);
      setError(null);
      try {
        const [hackathonRes, problemsRes] = await Promise.all([
          hackathonService.getById(hackathonId),
          hackathonService.getProblems(hackathonId),
        ]);

        if (!hackathonRes.success) {
          setError('Không thể tải thông tin hackathon');
          setLoadingProblem(false);
          return;
        }

        const hackathonData = hackathonRes.data as any;
        setHackathonTitle(hackathonData?.title || 'Hackathon');

        const endDate = hackathonData?.endTime || hackathonData?.endDate;
        if (endDate) {
          setEndTime(new Date(endDate));
        }

        if (!problemsRes.success) {
          setError('Không thể tải danh sách bài');
          setLoadingProblem(false);
          return;
        }

        const problemsData = problemsRes.data as any;
        const problems = problemsData?.problems || [];
        const selectedProblem = (problems as any[]).find((p: any) => p.id === problemId);

        if (!selectedProblem) {
          setError('Không tìm thấy bài này');
          setLoadingProblem(false);
          return;
        }

        setProblemTitle(selectedProblem.title || 'Bài tập');
        setProblemDescription(selectedProblem.description || '');
        setProblemDifficulty(selectedProblem.difficulty || 'medium');
        setProblemPoints(selectedProblem.points || selectedProblem.timeLimit || 100);
      } catch (e: any) {
        setError(e?.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchData();
  }, [hackathonId, problemId, token]);

  // Timer countdown
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining(0);
        setTimeExpired(true);
        return;
      }
      setTimeRemaining(Math.floor(diff / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // Update code when language changes
  useEffect(() => {
    if (!code || Object.values(defaultCode).includes(code)) {
      setCode(defaultCode[selectedLanguage.id] || defaultCode.javascript);
    }
  }, [selectedLanguage.id]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  }, []);

  const { hours, minutes, seconds } = formatTime(timeRemaining);

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-green-100 text-green-700';
      case 'medium': return isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'hard': return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700';
      default: return isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty || 'Không xác định';
    }
  };

  const getMonacoLanguage = (langId: string) => {
    switch (langId) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      default: return 'javascript';
    }
  };

  const handleRun = async () => {
    if (!hackathonId || !problemId || !token) return;
    setRunning(true);
    setEditorTab('console');
    setConsoleOutput(['Đang chạy code...']);

    try {
      const res = await hackathonService.runProblem(hackathonId, problemId, code, selectedLanguage.id);
      if (res.success) {
        const data = res.data as any;
        const results = data?.results || [];
        setTestResults(results);
        setConsoleOutput([
          `Kết quả: ${data?.passedTests || 0}/${data?.totalTests || 0} test cases passed`,
          ...results.filter((r: TestResult) => r.isPublic !== false).map((r: TestResult, i: number) =>
            `${r.passed ? '✓' : '✗'} Test ${i + 1}: ${r.passed ? 'PASSED' : 'FAILED'}\n   Input: ${r.input}\n   Expected: ${r.expectedOutput}\n   Actual: ${r.actualOutput}`
          ),
        ]);
      } else {
        setConsoleOutput(['Lỗi: ' + (res.message || 'Không thể chạy code')]);
      }
    } catch (e: any) {
      setConsoleOutput(['Lỗi: ' + (e?.message || 'Đã xảy ra lỗi')]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!hackathonId || !problemId || !token || timeExpired) return;
    setSubmitting(true);
    setEditorTab('console');
    setConsoleOutput(['Đang nộp bài...']);

    try {
      const res = await hackathonService.submitProblem(hackathonId, problemId, code, selectedLanguage.id);
      if (res.success) {
        const data = res.data as any;
        const { passedTests = 0, totalTests = 0, score = 0, allPassed = false } = data || {};
        setLastSubmissionResult(data);
        setConsoleOutput([
          allPassed ? '✓ Tất cả test cases đã PASSED!' : `Kết quả: ${passedTests}/${totalTests} test cases passed`,
          `Điểm: ${score}/100`,
        ]);
      } else {
        setConsoleOutput(['Lỗi: ' + (res.message || 'Không thể nộp bài')]);
      }
    } catch (e: any) {
      setConsoleOutput(['Lỗi: ' + (e?.message || 'Đã xảy ra lỗi')]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface dark:bg-[#191c1e]">
        <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-cyan-400' : 'text-primary')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-surface dark:bg-[#191c1e] gap-4">
        <AlertCircle className={cn('w-16 h-16', isDark ? 'text-red-400' : 'text-red-500')} />
        <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-primary')}>{error}</p>
        <Button onClick={() => navigate(`/user/hackathon/${hackathonId}`)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface dark:bg-[#191c1e]">
      {/* Top Header */}
      <header className={cn(
        'h-12 flex items-center justify-between px-4 border-b',
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-surface-container-low border-outline-variant/10'
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/user/hackathon/${hackathonId}`)}
            className={cn('gap-1', isDark ? 'text-slate-400 hover:text-white' : '')}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className={cn('h-4 w-px', isDark ? 'bg-slate-700' : 'bg-slate-300')} />
          <div>
            <span className={cn('text-xs font-semibold', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {hackathonTitle}
            </span>
            <span className={cn('mx-1', isDark ? 'text-slate-600' : 'text-slate-300')}>/</span>
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-primary')}>
              {problemTitle}
            </span>
          </div>
        </div>

        {/* Timer */}
        {!timeExpired && (
          <div className="flex items-center gap-1.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-widest', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Thời gian còn lại
            </span>
            <div className="flex items-center gap-0.5 font-mono font-bold text-sm">
              <span className={cn('px-1.5 py-0.5 rounded text-white bg-red-900/60')}>{hours}</span>
              <span className="text-red-400">:</span>
              <span className={cn('px-1.5 py-0.5 rounded text-white bg-red-900/60')}>{minutes}</span>
              <span className="text-red-400">:</span>
              <span className={cn('px-1.5 py-0.5 rounded text-white bg-red-900/60')}>{seconds}</span>
            </div>
          </div>
        )}
        {timeExpired && (
          <span className={cn('text-xs font-bold px-2 py-1 rounded', isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600')}>
            Hết giờ
          </span>
        )}
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          'h-full flex flex-col justify-between py-4 px-1.5 transition-all duration-300 z-50',
          'bg-surface-container-low dark:bg-[#191c1e]',
          sidebarCollapsed ? 'w-14' : 'w-52'
        )}>
          <div className="flex flex-col items-center gap-1">
            {/* Navigation */}
            <nav className="flex flex-col gap-1 w-full">
              {[
                { key: 'problem', icon: FileText, label: 'Đề bài' },
                { key: 'editor', icon: Code2, label: 'Code' },
                { key: 'tests', icon: Terminal, label: 'Test Cases' },
                { key: 'output', icon: BarChart3, label: 'Output' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => { setSidebarItem(key as any); setSidebarCollapsed(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all duration-200',
                    sidebarItem === key
                      ? isDark ? 'bg-blue-600 text-white' : 'bg-primary text-white'
                      : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="text-xs font-medium truncate">{label}</span>}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'flex items-center justify-center py-2 rounded-lg transition-colors',
              isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Problem Panel */}
          <section className={cn(
            'w-[42%] flex flex-col border-r transition-all duration-300',
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-surface-container-low border-outline-variant/10'
          )}>
            {/* Problem Header */}
            <div className={cn(
              'p-5 border-b',
              isDark ? 'border-slate-700' : 'border-outline-variant/10'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full',
                  getDifficultyStyles(problemDifficulty)
                )}>
                  {getDifficultyLabel(problemDifficulty)}
                </span>
                <span className={cn('text-xs font-bold', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  • {problemPoints} điểm
                </span>
              </div>
              <h1 className={cn(
                'text-xl font-bold leading-tight',
                isDark ? 'text-white' : 'text-primary'
              )}>
                {problemTitle}
              </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
              {problemDescription && (
                <div>
                  <h3 className={cn('text-sm font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Mô tả
                  </h3>
                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-300' : '')}>
                    {problemDescription}
                  </p>
                </div>
              )}

              {problemExamples.length > 0 && problemExamples.map((ex, i) => (
                <div key={i}>
                  <h3 className={cn('text-sm font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Ví dụ {i + 1}
                  </h3>
                  <div className={cn(
                    'rounded-xl border p-4 font-mono text-sm space-y-2',
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}>
                    <p><span className={cn(isDark ? 'text-slate-500' : 'text-slate-400')}>Input: </span>{ex.input}</p>
                    <p><span className={cn(isDark ? 'text-slate-500' : 'text-slate-400')}>Output: </span>{ex.output}</p>
                  </div>
                </div>
              ))}

              {problemConstraints.length > 0 && (
                <div>
                  <h3 className={cn('text-sm font-bold uppercase tracking-widest mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Ràng buộc
                  </h3>
                  <ul className={cn('space-y-1.5 text-sm', isDark ? 'text-slate-300' : '')}>
                    {problemConstraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={cn('text-primary mt-0.5')}>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {lastSubmissionResult && (
                <div className={cn(
                  'rounded-xl p-4 border',
                  lastSubmissionResult.allPassed
                    ? isDark ? 'bg-emerald-900/20 border-emerald-700' : 'bg-green-50 border-green-200'
                    : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {lastSubmissionResult.allPassed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn('text-sm font-bold', isDark ? 'text-white' : '')}>
                      Lần nộp gần nhất
                    </span>
                  </div>
                  <p className={cn('text-2xl font-headline font-bold', isDark ? 'text-white' : 'text-primary')}>
                    {lastSubmissionResult.score}/100
                  </p>
                  <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {lastSubmissionResult.passedTests}/{lastSubmissionResult.totalTests} test cases passed
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Code Editor Panel */}
          <section className="flex-1 flex flex-col bg-[#001d32] text-white">
            {/* Editor Toolbar */}
            <div className="h-11 flex items-center justify-between px-4 bg-[#0b3c5d] border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedLanguage.color }} />
                    {selectedLanguage.name}
                    <ChevronRight className={cn('w-3 h-3 transition-transform', showLanguageDropdown && 'rotate-90')} />
                  </button>

                  {showLanguageDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-[#0b3c5d] border border-white/10 rounded-lg shadow-lg z-50 min-w-[140px]">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => { setSelectedLanguage(lang); setShowLanguageDropdown(false); }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/10 transition-colors',
                            selectedLanguage.id === lang.id && 'bg-white/10'
                          )}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Settings">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Fullscreen">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative overflow-hidden">
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedLanguage.id)}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  padding: { top: 16 },
                }}
              />
              <div className="absolute bottom-4 right-6 opacity-5 font-bold text-4xl pointer-events-none uppercase tracking-tighter text-white">
                CodeFit Editor
              </div>
            </div>

            {/* Console Panel */}
            <div className="h-[30%] flex flex-col border-t border-white/10 bg-[#0b3c5d]/50">
              {/* Tabs */}
              <div className="h-10 px-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-white/50">
                  <button
                    onClick={() => setEditorTab('console')}
                    className={cn(
                      'transition-colors',
                      editorTab === 'console' ? 'text-[#ffddb8] border-b border-[#ffddb8]' : 'hover:text-white'
                    )}
                  >
                    Console
                  </button>
                  <button
                    onClick={() => setEditorTab('testcases')}
                    className={cn(
                      'transition-colors',
                      editorTab === 'testcases' ? 'text-[#ffddb8] border-b border-[#ffddb8]' : 'hover:text-white'
                    )}
                  >
                    Test Cases
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRun}
                    disabled={running || submitting || timeExpired}
                    className="h-7 text-xs border-white/10 text-white hover:bg-white/10 bg-transparent disabled:opacity-40"
                  >
                    {running ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                    Chạy thử
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={running || submitting || timeExpired}
                    className="h-7 text-xs bg-[#ffddb8] hover:brightness-110 text-[#2a1700] border-0 disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                    Nộp bài
                  </Button>
                </div>
              </div>

              {/* Console Content */}
              <div className="flex-1 p-5 font-mono text-sm overflow-y-auto">
                {editorTab === 'console' && (
                  <div className="space-y-1">
                    {consoleOutput.map((line, i) => (
                      <p key={i} className={cn(
                        'text-xs leading-relaxed whitespace-pre-wrap',
                        line.startsWith('✓') ? 'text-emerald-400' :
                          line.startsWith('✗') ? 'text-red-400' :
                            line.startsWith('Kết quả') ? 'text-yellow-400' :
                              line.startsWith('Lỗi') ? 'text-red-400' :
                                line.startsWith('Đang') ? 'text-blue-400' :
                                  'text-white/60'
                      )}>
                        {line}
                      </p>
                    ))}
                    {consoleOutput.length === 0 && (
                      <p className="text-white/30 text-xs">Nhấn "Chạy thử" hoặc "Nộp bài" để bắt đầu</p>
                    )}
                  </div>
                )}

                {editorTab === 'testcases' && (
                  <div className="space-y-2">
                    {testResults.filter(r => r.isPublic !== false).map((result, i) => (
                      <div
                        key={result.testId || i}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border-l-4',
                          result.passed
                            ? 'bg-emerald-900/20 border-emerald-500'
                            : 'bg-red-900/20 border-red-500'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span className="text-xs text-white/80">Test {i + 1}</span>
                        </div>
                        <span className={cn(
                          'text-[10px] font-bold uppercase',
                          result.passed ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                    {testResults.length === 0 && (
                      <p className="text-white/30 text-xs text-center py-8">
                        Chưa có kết quả test. Nhấn "Chạy thử" để xem.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default GiaoDienLapTrinhHackathon;
