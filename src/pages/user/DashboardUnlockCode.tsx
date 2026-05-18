import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  KeyRound,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { notification } from 'antd';
import { API_ENDPOINTS } from '@/config/api';
import { useAppSelector } from '@/store';

export default function DashboardUnlockCode() {
  const navigate = useNavigate();
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    courseId?: string;
    courseTitle?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const formatCode = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    if (result) setResult(null);
  };

  const handleActivate = async () => {
    if (!code.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập mã kích hoạt',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.courseAccess.activate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        const courseTitle = data.data.course?.title || 'Khóa học';
        const courseId = data.data.course?.id || data.data.enrollment?.courseId;

        setResult({
          success: true,
          message: `Kích hoạt thành công khóa học "${courseTitle}"!`,
          courseId,
          courseTitle,
        });

        notification.success({
          message: 'Thành công',
          description: `Bạn đã kích hoạt khóa học "${courseTitle}". Có thể bắt đầu học ngay!`,
        });

        // Auto navigate after 2s
        setTimeout(() => {
          if (courseId) {
            navigate(`/user/courses/${courseId}`);
          }
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.message || 'Mã kích hoạt không hợp lệ',
        });
      }
    } catch (error) {
      console.error('Error activating code:', error);
      setResult({
        success: false,
        message: 'Có lỗi xảy ra. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying:', error);
      }
    }
  };

  const isValidFormat = code.length >= 10 && code.startsWith('CFE-');

  return (
    <div className={cn(
      "min-h-screen",
      isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className={cn(
            "mb-6 pl-0 gap-2",
            isDark ? "text-slate-400 hover:text-white" : "text-slate-500"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        {/* Main Card */}
        <Card className={cn(
          "overflow-hidden",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white"
        )}>
          {/* Header Banner */}
          <div className={cn(
            "bg-gradient-to-r from-primary to-orange-400 p-8 text-white"
          )}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nhập mã mở khóa</h1>
                <p className="text-white/80 text-sm mt-1">
                  Kích hoạt khóa học bằng mã CFE
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {result?.success ? (
              // Success State
              <div className="py-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Kích hoạt thành công!</h2>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {result.message}
                </p>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}>
                  Đang chuyển hướng đến khóa học...
                </p>
                {result.courseId && (
                  <Button
                    onClick={() => navigate(`/user/courses/${result.courseId}`)}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    Đi đến khóa học ngay
                  </Button>
                )}
              </div>
            ) : (
              // Input State
              <div className="space-y-6">
                {result && !result.success && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Kích hoạt thất bại</p>
                      <p className="text-sm text-red-500 dark:text-red-400">{result.message}</p>
                    </div>
                  </div>
                )}

                {/* Code Input */}
                <div>
                  <label className={cn(
                    "text-sm font-medium mb-2 block",
                    isDark ? "text-slate-300" : "text-slate-700"
                  )}>
                    Mã kích hoạt
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      placeholder="CFE-XXXXXXXXXXXXXXXXXXXX"
                      className={cn(
                        "text-center text-xl font-mono font-bold tracking-wider h-16 pr-12",
                        isDark ? "bg-slate-800 border-slate-700 text-white" : "",
                        code && !isValidFormat && "border-red-500",
                        code && isValidFormat && "border-green-500"
                      )}
                      maxLength={30}
                      disabled={loading}
                      autoFocus
                    />
                    {code && (
                      <button
                        onClick={copyCode}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors",
                          isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"
                        )}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className={cn(
                      "text-xs",
                      isDark ? "text-slate-400" : "text-slate-500"
                    )}>
                      Format: <code className={cn(
                        "px-1.5 py-0.5 rounded text-xs font-mono",
                        isDark ? "bg-slate-800" : "bg-slate-100"
                      )}>CFE-</code> + 20 ký tự A-Z, 0-9
                    </p>
                    {code && isValidFormat && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đúng định dạng
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className={cn(
                  "p-4 rounded-lg",
                  isDark ? "bg-slate-800" : "bg-slate-50"
                )}>
                  <h3 className={cn(
                    "font-medium mb-3 flex items-center gap-2",
                    isDark ? "text-slate-200" : "text-slate-700"
                  )}>
                    <KeyRound className="w-4 h-4 text-primary" />
                    Hướng dẫn
                  </h3>
                  <ul className={cn(
                    "space-y-2 text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">1.</span>
                      Nhập mã kích hoạt bắt đầu bằng <strong>CFE-</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">2.</span>
                      Kiểm tra kỹ mã trước khi xác nhận
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">3.</span>
                      Mỗi mã chỉ sử dụng được <strong>một lần duy nhất</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">4.</span>
                      Sau khi kích hoạt, bạn có thể học ngay lập tức
                    </li>
                  </ul>
                </div>

                {/* Activate Button */}
                <Button
                  onClick={handleActivate}
                  disabled={loading || !code.trim()}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2" />
                      Kích hoạt khóa học
                    </>
                  )}
                </Button>

                {/* Help Text */}
                <p className={cn(
                  "text-center text-sm",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}>
                  Không có mã? Liên hệ quản trị viên để được cấp mã kích hoạt.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examples */}
        <div className={cn(
          "mt-6 p-4 rounded-lg border text-center",
          isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"
        )}>
          <p className={cn(
            "text-xs font-medium mb-2",
            isDark ? "text-slate-500" : "text-slate-400"
          )}>
            Ví dụ mã hợp lệ:
          </p>
          <code className={cn(
            "text-sm font-mono",
            isDark ? "text-slate-400" : "text-slate-600"
          )}>
            CFE-A1B2C3D4E5F6G7H8I9J0
          </code>
        </div>
      </div>
    </div>
  );
}
