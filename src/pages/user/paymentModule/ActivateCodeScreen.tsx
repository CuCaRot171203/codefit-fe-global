import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, KeyRound, CheckCircle, XCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface ActivateCodeScreenProps {
  courseId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ActivateCodeScreen({ courseId, onSuccess, onCancel }: ActivateCodeScreenProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã kích hoạt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.payments.activate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          ...(courseId ? { courseId } : {}),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/user/courses/${data.enrollment?.courseId || courseId}`);
          }
        }, 2000);
      } else {
        setError(data.message || 'Mã kích hoạt không hợp lệ');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Kích hoạt thành công!</h2>
          <p className="text-slate-600">Chúc mừng bạn đã đăng ký khóa học thành công. Đang chuyển hướng...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            {onCancel && (
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Nhập mã kích hoạt</h1>
              <p className="text-sm text-slate-500">Đăng ký khóa học với mã từ quản lý</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Mã kích hoạt từ đâu?</p>
                <p className="text-blue-600">
                  Nhận mã kích hoạt từ quản lý hoặc người quản lý khóa học của bạn.
                  Mã thường có định dạng <span className="font-mono font-semibold">CF-XXXXXXXX</span>
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mã kích hoạt
              </label>
              <Input
                type="text"
                placeholder="VD: CF-ABCD1234"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                className="text-center text-lg font-mono tracking-wider h-14"
                maxLength={12}
                disabled={isLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <XCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleActivate}
              disabled={isLoading || !code.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Kích hoạt khóa học'
              )}
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Bạn cần thanh toán online?{' '}
            <button
              onClick={onCancel}
              className="text-primary hover:underline font-medium"
            >
              Thanh toán QR
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
