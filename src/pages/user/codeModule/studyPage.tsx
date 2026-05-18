import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Editor from '@monaco-editor/react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import SubmissionResultDialog from '@/components/user/SubmissionResultDialog';
import {
  Terminal,
  Code,
  Lightbulb,
  MessageSquare,
  Play,
  ChevronDown,
  Fullscreen,
  RotateCcw,
  CheckCircle,
  Info,
  Keyboard,
  Send,
  Check,
  X,
  Loader2,
} from 'lucide-react';

// Programming languages supported
const languages = [
  { id: 'python', name: 'Python 3', extension: 'py' },
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
];

// Starter code templates by language
const starterCodeTemplates: Record<string, string> = {
  python: `# Definition for singly-linked list.
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        pass`,
  javascript: `// Definition for singly-linked list.
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
  // Write your code here
};`,
  typescript: `// Definition for singly-linked list.
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  // Write your code here
};`,
  java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
        return null;
    }
}`,
  cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
        return nullptr;
    }
};`,
  go: `/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func reverseList(head *ListNode) *ListNode {
    // Write your code here
    return nil
}`,
  rust: `// Definition for singly-linked list.
// #[derive(PartialEq, Eq, Clone, Debug)]
// pub struct ListNode {
//   pub val: i32,
//   pub next: Option<Box<ListNode>>
// }
// 
// impl ListNode {
//   fn new(val: i32) -> Self {
//     ListNode { val, next: None }
//   }
// }

impl Solution {
    pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        // Write your code here
        unimplemented!()
    }
}`,
};

// Mock problem data
const problemData = {
  id: 'reverse-linked-list',
  title: 'Đảo ngược danh sách liên kết',
  difficulty: 'hard',
  category: 'Cấu trúc dữ liệu',
  chapter: 'Chương 4: Cây nhị phân',
  courseName: 'Cấu trúc dữ liệu',
  description: `Cho đầu của một danh sách liên kết đơn (singly linked list), hãy đảo ngược danh sách này và trả về đầu của danh sách đã được đảo ngược.`,
  examples: [
    {
      input: 'head = [1,2,3,4,5]',
      output: '[5,4,3,2,1]',
    },
    {
      input: 'head = [1,2]',
      output: '[2,1]',
    },
  ],
  constraints: [
    'Số lượng nút trong danh sách nằm trong khoảng [0, 5000].',
    '-5000 <= Node.val <= 5000.',
  ],
  testCases: [
    { id: 1, input: 'head = [1,2,3,4,5]', expected: '[5,4,3,2,1]', status: 'passed' },
    { id: 2, input: 'head = [1,2]', expected: '[2,1]', status: 'passed' },
    { id: 3, input: 'head = []', expected: 'null', status: 'pending' },
  ],
};

type TabType = 'problem' | 'solution' | 'discussion';

const StudyPage = () => {
  const { problemId: _problemId } = useParams<{ problemId: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('problem');
  const [activeBottomTab, setActiveBottomTab] = useState<'test' | 'result'>('test');
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [code, setCode] = useState(starterCodeTemplates.python);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [submissionResult] = useState({
    passed: 15,
    total: 15,
    time: 45,
    memory: 12.4,
    rank: '12%',
    isSuccess: true,
  });
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      automaticLayout: true,
    });

    monaco.editor.defineTheme('codefit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#AEAFAD',
      },
    });
  };

  const handleEditorChange: OnChange = (value) => {
    setCode(value || '');
  };

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    setCode(starterCodeTemplates[lang.id] || '');
    setShowLanguageDropdown(false);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveBottomTab('result');
    setTimeout(() => setIsRunning(false), 1500);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowResultDialog(true);
    }, 2000);
  };

  const handleResetCode = () => {
    if (editorRef.current) {
      editorRef.current.setValue(starterCodeTemplates[selectedLanguage.id] || '');
    }
    setCode(starterCodeTemplates[selectedLanguage.id] || '');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page Header - Compact version inside UserLayout */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-surface-container-high dark:border-slate-800 bg-surface dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container dark:bg-primary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-on-primary-container dark:text-white" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-sm text-foreground dark:text-white">
                {problemData.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {problemData.courseName} • {problemData.chapter}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-error-container text-on-error-container text-[10px] font-bold rounded-full">
            {problemData.difficulty === 'hard' ? 'Khó' : problemData.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
          </Badge>
          <Button className="bg-green-600 hover:bg-green-700 text-white text-xs h-8">
            Nộp bài
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problem Statement - Collapsible */}
        <div className="w-[400px] flex-shrink-0 flex flex-col bg-surface-container-lowest dark:bg-slate-900 border-r border-surface-container-high dark:border-slate-800">
          {/* Problem Tabs */}
          <div className="flex border-b border-surface-container dark:border-slate-700">
            <button
              onClick={() => setActiveTab('problem')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-semibold transition-colors',
                activeTab === 'problem'
                  ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                  : 'text-muted-foreground hover:bg-surface-container-low'
              )}
            >
              Đề bài
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'solution'
                  ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                  : 'text-muted-foreground hover:bg-surface-container-low'
              )}
            >
              Lời giải
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === 'discussion'
                  ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                  : 'text-muted-foreground hover:bg-surface-container-low'
              )}
            >
              Thảo luận
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'problem' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-error-container text-on-error-container text-xs font-bold rounded-full">
                    Khó
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    {problemData.category}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {problemData.description}
                </p>

                {problemData.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-surface-container-low dark:bg-slate-800 p-5 rounded-xl border-l-4 border-primary dark:border-blue-400"
                  >
                    <h4 className="font-bold text-xs text-primary dark:text-blue-300 mb-3 uppercase tracking-wide">
                      Ví dụ {index + 1}:
                    </h4>
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Đầu vào:</strong>{' '}
                        <code className="bg-surface-container-high dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                          {example.input}
                        </code>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Đầu ra:</strong>{' '}
                        <code className="bg-surface-container-high dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                          {example.output}
                        </code>
                      </p>
                    </div>
                  </div>
                ))}

                <div>
                  <p className="font-bold text-sm text-foreground mb-3">Ràng buộc:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                    {problemData.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-primary dark:bg-slate-800 text-white dark:text-blue-200 rounded-xl">
                  <h4 className="font-headline font-bold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Thách thức mở rộng
                  </h4>
                  <p className="text-xs opacity-80">
                    Bạn có thể giải quyết bài toán này bằng cả phương pháp lặp (iterative) và đệ quy (recursive) không?
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'solution' && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Nội dung lời giải sẽ hiển thị sau khi bạn nộp bài</p>
                </div>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Thảo luận về bài tập</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Editor Toolbar */}
          <div className="h-12 flex items-center justify-between px-4 border-b border-surface-container-high dark:border-slate-700 bg-surface dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 text-sm font-medium bg-surface-container-low dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-surface-container-high dark:border-slate-700 hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors"
                >
                  <Code className="w-4 h-4 text-primary dark:text-blue-400" />
                  <span className="text-foreground dark:text-slate-200">
                    {selectedLanguage.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface-container-lowest dark:bg-slate-800 rounded-xl border border-surface-container-high dark:border-slate-700 shadow-xl z-50 py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-slate-700 transition-colors',
                          selectedLanguage.id === lang.id && 'bg-primary/10 text-primary dark:text-blue-400'
                        )}
                      >
                        <span>{lang.name}</span>
                        {selectedLanguage.id === lang.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground">
                {code.split('\n').length} dòng
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleResetCode}
                className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-slate-200 transition-colors"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-slate-200 transition-colors">
                <Fullscreen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={selectedLanguage.id === 'cpp' ? 'cpp' : selectedLanguage.id}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-[#858585]">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading editor...
                </div>
              }
            />
          </div>

          {/* Bottom Panel - Test Cases */}
          <div className="h-[200px] min-h-[150px] border-t border-surface-container-high dark:border-slate-700 flex flex-col shrink-0 bg-surface dark:bg-slate-900">
            <div className="flex px-2 border-b border-surface-container-high dark:border-slate-700">
              <button
                onClick={() => setActiveBottomTab('test')}
                className={cn(
                  'px-5 py-2.5 text-xs font-bold transition-colors',
                  activeBottomTab === 'test'
                    ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Kiểm thử
              </button>
              <button
                onClick={() => setActiveBottomTab('result')}
                className={cn(
                  'px-5 py-2.5 text-xs font-medium transition-colors',
                  activeBottomTab === 'result'
                    ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Kết quả
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {problemData.testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className={cn(
                      'p-3 rounded-lg border flex flex-col gap-2',
                      testCase.status === 'passed'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : testCase.status === 'failed'
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          : 'bg-surface-container-low dark:bg-slate-800 border-surface-container-high dark:border-slate-700'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Test {testCase.id}
                      </span>
                      {testCase.status === 'passed' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Passed
                        </span>
                      ) : testCase.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                          <X className="w-3 h-3" />
                          Failed
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div>
                        <span className="text-muted-foreground">Input: </span>
                        <code className="bg-surface-container-high dark:bg-slate-700 px-1.5 py-0.5 rounded text-foreground font-mono">
                          {testCase.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected: </span>
                        <code className="bg-surface-container-high dark:bg-slate-700 px-1.5 py-0.5 rounded text-foreground font-mono">
                          {testCase.expected}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-14 flex items-center justify-between px-6 border-t border-surface-container-high dark:border-slate-700 bg-surface dark:bg-slate-900 shrink-0">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary dark:hover:text-blue-400 transition-colors">
                <Info className="w-3.5 h-3.5" />
                Cần trợ giúp?
              </button>
              <div className="w-[1px] bg-surface-container-highest dark:bg-slate-700" />
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary dark:hover:text-blue-400 transition-colors">
                <Keyboard className="w-3.5 h-3.5" />
                Phím tắt
              </button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-surface-container-low dark:border-blue-400 dark:text-blue-400 dark:hover:bg-slate-800"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Chạy thử
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Submission Result Dialog */}
      <SubmissionResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        result={submissionResult}
        onNextChallenge={() => {
          setShowResultDialog(false);
          // Navigate to next challenge
        }}
        onViewCode={() => {
          setShowResultDialog(false);
        }}
      />
    </div>
  );
};

export default StudyPage;
