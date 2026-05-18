'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { API_ENDPOINTS } from '@/config/api';
import { 
  Timer, Play, Send, ChevronUp, RotateCcw, AlertTriangle, 
  ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle,
  FileText, Clock, Code, Terminal, Eye
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { notification } from 'antd';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  memoryLimit: number;
  testcases: {
    id: string;
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }[];
}

interface MinitestQuestion {
  id: string;
  problemId: string;
  problem: Problem;
}

interface Minitest {
  id: string;
  title: string;
  phase?: {
    title: string;
    course?: {
      title: string;
    };
  };
  questions: MinitestQuestion[];
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isPublic: boolean;
  error?: string;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
];

const LamBaiMinitest = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const minitestId = searchParams.get('minitestId');
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Data states
  const [minitest, setMinitest] = useState<Minitest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Timer state - 30 minutes for minitest
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [timerStarted, setTimerStarted] = useState(false);

  // UI states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submitResults, setSubmitResults] = useState<any>(null);

  // Fetch minitest data
  useEffect(() => {
    if (minitestId) {
      fetchMinitest();
    } else {
      setLoading(false);
    }
  }, [minitestId]);

  // Countdown timer
  useEffect(() => {
    if (!timerStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted]);

  // Start timer when component mounts
  useEffect(() => {
    if (minitest && !timerStarted) {
      setTimerStarted(true);
    }
  }, [minitest]);

  // Prevent navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const fetchMinitest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.minitests.detail(minitestId!)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (data.success) {
        setMinitest(data.data);
        // Set initial code from first question
        if (data.data.questions?.length > 0) {
          const firstProblem = data.data.questions[0].problem;
          if (!firstProblem.starterCode) {
            setCode(getDefaultCode(firstProblem.language || 'python'));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching minitest:', error);
      notification.error({ message: 'Lỗi', description: 'Không thể tải bài minitest' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCode = (language: string): string => {
    const templates: Record<string, string> = {
      python: `def solution():
    # Write your code here
    pass

# Example usage:
# print(solution())`,
      javascript: `function solution() {
    // Write your code here
    
}

// Example usage:
// console.log(solution());`,
      typescript: `function solution(): any {
    // Write your code here
    
}

// Example usage:
// console.log(solution());`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
    };
    return templates[language] || templates.python;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEditorMount: any = (editor: any, monacoInstance: any) => {
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

    monacoInstance.editor.setTheme(isDark ? 'codefit-dark' : 'codefit-light');
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'codefit-dark' : 'codefit-light');
    }
  }, [isDark]);

  const handleLanguageChange = (langId: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (lang) {
      setSelectedLanguage(lang);
      setShowLanguageDropdown(false);
      if (!code || code === getDefaultCode(selectedLanguage.id)) {
        setCode(getDefaultCode(langId));
      }
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      notification.warning({ message: 'Cảnh báo', description: 'Vui lòng nhập code trước khi chạy' });
      return;
    }

    setRunningCode(true);
    setTestResults([]);
    setShowConsole(true);

    try {
      const token = localStorage.getItem('token');
      const currentQuestion = minitest?.questions[currentQuestionIndex];
      
      // Call scoring API
      const response = await fetch(API_ENDPOINTS.scoring.run, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: currentQuestion?.problem.id,
          code,
          language: selectedLanguage.id,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.results) {
        const results: TestResult[] = data.data.results.map((r: any) => ({
          input: r.isPublic !== false ? r.input : '[Hidden]',
          expectedOutput: r.isPublic !== false ? r.expectedOutput : '[Hidden]',
          actualOutput: r.actualOutput || '',
          passed: r.passed,
          isPublic: r.isPublic !== false,
          error: r.error,
        }));
        setTestResults(results);

        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        
        if (passedCount === totalCount) {
          notification.success({ message: 'Chúc mừng!', description: `Đã pass hết ${totalCount} test cases!` });
        } else {
          notification.warning({ message: 'Kết quả', description: `${passedCount}/${totalCount} test passed` });
        }
      } else {
        notification.error({ message: 'Lỗi', description: 'Không thể chạy code' });
      }
    } catch (error) {
      console.error('Run code error:', error);
      notification.error({ message: 'Lỗi', description: 'Không thể chạy code' });
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!code.trim()) {
      notification.warning({ message: 'Cảnh báo', description: 'Vui lòng nhập code' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const currentQuestion = minitest?.questions[currentQuestionIndex];
      
      const response = await fetch(API_ENDPOINTS.minitests.submit(minitestId!), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minitestId: minitest?.id,
          problemId: currentQuestion?.problem.id,
          code,
          language: selectedLanguage.id,
          hintsUsed: 0,
          timeUsed: null,
        }),
      });

      const data = await response.json();
      console.log('[DEBUG] submit response:', JSON.stringify(data.data));
      
      if (data.success) {
        setSubmitResults(data.data);
        
        const allPassed = data.data.allPassed === true || 
          (data.data.totalTests > 0 && data.data.passedTests === data.data.totalTests);
        
        if (allPassed) {
          notification.success({ message: 'Chúc mừng!', description: `Đã pass hết test cases!` });
        } else {
          notification.error({ 
            message: 'Chưa pass hết', 
            description: `${data.data.passedTests || 0}/${data.data.totalTests || 0} test passed` 
          });
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      notification.error({ message: 'Lỗi', description: 'Nộp bài thất bại' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    notification.warning({ message: 'Hết giờ!', description: 'Đang nộp bài tự động...' });
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      // Submit all questions
      for (const question of minitest?.questions || []) {
        await fetch(API_ENDPOINTS.minitests.submit(minitestId!), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            minitestId: minitest?.id,
            problemId: question.problem.id,
            code: code,
            language: selectedLanguage.id,
          }),
        });
      }
      
      setTimeout(() => {
        navigate(`/user/ket-qua-minitest?minitestId=${minitestId}`);
      }, 1500);
    } catch (error) {
      console.error('Auto submit error:', error);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = useCallback(() => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    // Navigate to results page
    setTimeout(() => {
      navigate(`/user/ket-qua-minitest?minitestId=${minitestId}`);
    }, 800);
  }, [navigate, minitestId]);

  const handleReset = () => {
    setCode(getDefaultCode(selectedLanguage.id));
    setTestResults([]);
    setSubmitResults(null);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (minitest?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTestResults([]);
      setSubmitResults(null);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTestResults([]);
      setSubmitResults(null);
    }
  };

  const currentQuestion = minitest?.questions[currentQuestionIndex];
  const publicTestCases = currentQuestion?.problem.testcases?.filter(tc => tc.isPublic) || [];

  if (loading) {
    return (
      <div className={cn('h-screen flex items-center justify-center', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
          <p className={cn('text-lg', isDark ? 'text-slate-400' : 'text-slate-600')}>Đang tải bài minitest...</p>
        </div>
      </div>
    );
  }

  if (!minitest) {
    return (
      <div className={cn('h-screen flex items-center justify-center', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
        <div className="text-center">
          <AlertTriangle className={cn('w-16 h-16 mx-auto mb-4 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <p className={cn('text-xl font-semibold mb-4', isDark ? 'text-white' : 'text-slate-900')}>Không tìm thấy bài minitest</p>
          <Button onClick={() => navigate(-1)} className="bg-cyan-500 hover:bg-cyan-600">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-screen flex flex-col overflow-hidden', isDark ? 'bg-slate-950' : 'bg-slate-50')}>
      {/* Header */}
      <header className={cn(
        'border-b shrink-0',
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
      )}>
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left */}
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
                isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
              )}>
                <Timer className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
              </div>
              <div>
                <h1 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                  {minitest.title}
                </h1>
                <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-500')}>
                  {minitest.phase?.course?.title || 'Minitest'}
                </p>
              </div>
            </div>
          </div>

          {/* Center - Timer */}
          <div className={cn(
            'flex items-center gap-3 px-5 py-2 rounded-xl font-mono text-xl font-bold tracking-wider',
            timeLeft <= 300
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : isDark
                ? 'bg-slate-800 text-amber-400'
                : 'bg-amber-50 text-amber-600'
          )}>
            <Timer className="w-6 h-6" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Question navigation */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            )}>
              <span>Câu {currentQuestionIndex + 1}/{minitest.questions.length}</span>
            </div>
            
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Nộp bài
            </Button>
          </div>
        </div>

        {/* Question tabs */}
        <div className={cn('px-6 pb-2 flex gap-2 overflow-x-auto', isDark ? 'bg-slate-950' : 'bg-white')}>
          {minitest.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                idx === currentQuestionIndex
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : isDark
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Câu {idx + 1}: {q.problem.title.substring(0, 20)}...
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className={cn(
          'w-[42%] overflow-y-auto border-r',
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        )}>
          <div className="p-6">
            {/* Problem Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide',
                  currentQuestion?.problem.difficulty === 'EASY'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : currentQuestion?.problem.difficulty === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                )}>
                  {currentQuestion?.problem.difficulty || 'EASY'}
                </span>
                <span className={cn('text-xs font-mono', isDark ? 'text-slate-500' : 'text-slate-500')}>
                  {currentQuestion?.problem.id}
                </span>
              </div>

              <h2 className={cn(
                'text-xl font-bold mb-4',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                {currentQuestion?.problem.title}
              </h2>

              {/* Description */}
              <div className={cn(
                'p-4 rounded-xl mb-4',
                isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'
              )}>
                <p className={cn(
                  'text-sm leading-relaxed',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}>
                  {currentQuestion?.problem.description}
                </p>
              </div>

              {/* Public Test Cases */}
              <div className="space-y-3">
                <h3 className={cn(
                  'font-semibold text-sm flex items-center gap-2',
                  isDark ? 'text-slate-200' : 'text-slate-800'
                )}>
                  <FileText className="w-4 h-4" />
                  Test Cases mẫu ({publicTestCases.length})
                </h3>
                
                {publicTestCases.map((tc, idx) => (
                  <div
                    key={tc.id || idx}
                    className={cn(
                      'p-4 rounded-xl border',
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    )}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className={cn(
                          'text-xs font-medium mb-1 block',
                          isDark ? 'text-slate-500' : 'text-slate-500'
                        )}>
                          Input:
                        </span>
                        <pre className={cn(
                          'p-2 rounded text-xs font-mono overflow-x-auto',
                          isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-700 border'
                        )}>
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <span className={cn(
                          'text-xs font-medium mb-1 block',
                          isDark ? 'text-slate-500' : 'text-slate-500'
                        )}>
                          Expected Output:
                        </span>
                        <pre className={cn(
                          'p-2 rounded text-xs font-mono overflow-x-auto',
                          isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        )}>
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0" style={isDark ? { backgroundColor: '#020617' } : { backgroundColor: '#f8fafc' }}>
          {/* Editor Header */}
          <div className={cn(
            'h-12 flex items-center justify-between px-4 shrink-0 border-b',
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          )}>
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
              </Button>

              {showLanguageDropdown && (
                <div className={cn(
                  'absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto rounded-lg border shadow-xl z-50',
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
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1.5 text-xs font-medium',
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                onClick={handleRunCode}
                disabled={runningCode || !code.trim()}
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1.5 text-xs font-medium',
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700'
                )}
              >
                {runningCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Chạy thử
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={selectedLanguage.id === 'cpp' ? 'cpp' : selectedLanguage.id}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorMount}
              theme={isDark ? 'codefit-dark' : 'codefit-light'}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Console / Results Panel */}
          {showConsole && (
            <div className={cn(
              'h-64 border-t shrink-0 flex flex-col',
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            )}>
              <div className={cn(
                'flex items-center justify-between px-4 py-2 border-b shrink-0',
                isDark ? 'border-slate-800' : 'border-slate-200'
              )}>
                <div className="flex items-center gap-2">
                  <Terminal className={cn('w-4 h-4', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                  <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    Console
                  </span>
                  {testResults.length > 0 && (
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      testResults.every(r => r.passed)
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    )}>
                      {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConsole(false)}
                  className={cn('h-6 w-6 p-0', isDark ? 'text-slate-500' : 'text-slate-400')}
                >
                  ✕
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {testResults.length === 0 && !runningCode ? (
                  <p className={cn('text-sm text-center py-8', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Nhấn "Chạy thử" để xem kết quả
                  </p>
                ) : runningCode ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-cyan-400' : 'text-cyan-600')} />
                    <span className={cn('ml-2', isDark ? 'text-slate-400' : 'text-slate-600')}>Đang chạy...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-lg border',
                          result.passed
                            ? isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                            : isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {result.passed ? (
                            <CheckCircle className={cn('w-4 h-4', isDark ? 'text-green-400' : 'text-green-600')} />
                          ) : (
                            <XCircle className={cn('w-4 h-4', isDark ? 'text-red-400' : 'text-red-600')} />
                          )}
                          <span className={cn(
                            'font-medium text-sm',
                            result.passed ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')
                          )}>
                            Test {idx + 1} - {result.passed ? 'Passed' : 'Failed'}
                          </span>
                          {!result.isPublic && (
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded',
                              isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                            )}>
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className={cn('font-medium', isDark ? 'text-slate-500' : 'text-slate-500')}>Expected:</span>
                            <pre className={cn(
                              'mt-1 p-1 rounded font-mono',
                              isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 border'
                            )}>
                              {result.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <span className={cn('font-medium', isDark ? 'text-slate-500' : 'text-slate-500')}>Actual:</span>
                            <pre className={cn(
                              'mt-1 p-1 rounded font-mono',
                              result.passed
                                ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                                : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                            )}>
                              {result.actualOutput || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Editor Footer */}
          <div className={cn(
            'h-14 flex items-center justify-between px-4 border-t shrink-0',
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          )}>
            <div className="flex items-center gap-2">
              <Button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1 text-sm',
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Câu trước
              </Button>
              <Button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === minitest.questions.length - 1}
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-1 text-sm',
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600'
                )}
              >
                Câu tiếp
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleSubmitQuestion}
              disabled={isSubmitting}
              className={cn(
                'gap-2 px-6 py-2 rounded-lg font-medium transition-all active:scale-95',
                isDark
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
              )}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Nộp câu này
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Submission Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={cn(
            'w-full max-w-md rounded-2xl p-6 shadow-2xl',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}>
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
              isDark ? 'bg-amber-500/20' : 'bg-amber-100'
            )}>
              <AlertTriangle className={cn(
                'w-7 h-7',
                isDark ? 'text-amber-400' : 'text-amber-600'
              )} />
            </div>

            <h3 className={cn(
              'text-xl font-bold mb-2',
              isDark ? 'text-white' : 'text-slate-900'
            )}>
              Xác nhận nộp bài?
            </h3>
            <p className={cn(
              'text-sm mb-6',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              Bạn đã hoàn thành <strong>{minitest.questions.length}</strong> câu hỏi. 
              Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong>. 
              Bạn không thể thay đổi kết quả sau khi nộp.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium',
                  isDark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmit}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium transition-all active:scale-95',
                  isDark
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                )}
              >
                Nộp ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={cn(
            'p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}>
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className={cn(
              'font-medium',
              isDark ? 'text-white' : 'text-slate-800'
            )}>
              Đang nộp bài...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LamBaiMinitest;
