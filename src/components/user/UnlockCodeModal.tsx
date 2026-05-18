import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  KeyRound,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { notification } from 'antd';
import { API_ENDPOINTS } from '@/config/api';

interface UnlockCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (courseId: string) => void;
  theme?: 'light' | 'dark';
}

export function UnlockCodeModal({
  isOpen,
  onClose,
  onSuccess,
  theme = 'light',
}: UnlockCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    courseId?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const formatCode = (value: string) => {
    // Auto uppercase and remove invalid characters
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
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
        const activatedCourseId = data.data.course?.id || data.data.enrollment?.courseId;
        setResult({
          success: true,
          message: 'Kích hoạt khóa học thành công!',
          courseId: activatedCourseId,
        });

        notification.success({
          message: 'Thành công',
          description: 'Kích hoạt khóa học thành công! Bạn có thể bắt đầu học ngay.',
        });

        // Auto close after 2s
        setTimeout(() => {
          onSuccess?.(activatedCourseId);
          handleClose();
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

  const handleClose = () => {
    setCode('');
    setResult(null);
    onClose();
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        'max-w-md',
        theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white'
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            'flex items-center gap-2 text-xl',
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          )}>
            <KeyRound className="w-6 h-6 text-primary" />
            Nhập mã kích hoạt
          </DialogTitle>
        </DialogHeader>

        {result?.success ? (
          // Success State
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className={cn(
              'text-lg font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}>
              Kích hoạt thành công!
            </h3>
            <p className={cn(
              'text-sm',
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            )}>
              Bạn đã kích hoạt khóa học thành công. Đang chuyển hướng...
            </p>
          </div>
        ) : (
          // Input State
          <div className="space-y-4 py-4">
            {result && !result.success && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {result.message}
                </p>
              </div>
            )}

            <div>
              <label className={cn(
                'text-sm font-medium mb-2 block',
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
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
                    'text-center text-lg font-mono font-bold tracking-wider h-14 pr-12',
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : '',
                    code && !isValidFormat && 'border-red-500',
                    code && isValidFormat && 'border-green-500'
                  )}
                  maxLength={30}
                  disabled={loading}
                  autoFocus
                />
                {code && (
                  <button
                    onClick={copyCode}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
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
              <p className={cn(
                'text-xs mt-2',
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              )}>
                Format: <code className={cn(
                  'px-1 rounded text-xs',
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                )}>CFE-</code> + 20 ký tự A-Z, 0-9
              </p>
            </div>

            <div className={cn(
              'p-3 rounded-lg text-sm',
              theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'
            )}>
              <p className="font-medium mb-1">Hướng dẫn:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nhập mã kích hoạt bắt đầu bằng <strong>CFE-</strong></li>
                <li>Kiểm tra kỹ mã trước khi xác nhận</li>
                <li>Mỗi mã chỉ sử dụng được một lần</li>
              </ul>
            </div>

            <Button
              onClick={handleActivate}
              disabled={loading || !code.trim()}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Kích hoạt
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
