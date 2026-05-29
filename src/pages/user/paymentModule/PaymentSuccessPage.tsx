import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';

type PaymentStatus = 'checking' | 'completed' | 'pending' | 'failed';

interface PaymentInfo {
  id: string;
  courseId: string;
  amount: number;
  paymentStatus: string;
  payosOrderId?: string | number;
  orderCode?: string | number;
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<PaymentStatus>('checking');
  const [amount, setAmount] = useState(0);
  const [courseId, setCourseId] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(dark);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Always read URL directly from window — works even on external redirect
      const params = new URLSearchParams(window.location.search);
      const payosCode = params.get('code');
      const payosStatus = params.get('status');
      const payosOrderCode = params.get('orderCode');
      const urlPaymentId = params.get('paymentId');
      const urlCourseId = params.get('courseId');

      const token = localStorage.getItem('token');
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const payosSuccess =
        payosStatus === 'PAID' || payosCode === '00' || payosCode === '0';
      const payosCancelled =
        payosStatus === 'CANCELLED' || payosCode === 'CANCEL';

      // Step 1: Cancelled
      if (payosCancelled) {
        if (urlPaymentId && urlCourseId) {
          navigate(`/user/payment/cancel?paymentId=${urlPaymentId}&courseId=${urlCourseId}`);
        } else {
          navigate('/user/courses');
        }
        if (cancelled) return;
        setIsLoading(false);
        return;
      }

      // Step 2: Have paymentId + courseId in URL + PayOS success code
      if (payosSuccess && urlPaymentId && urlCourseId) {
        try {
          await fetch(API_ENDPOINTS.payments.payosConfirm, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify({ paymentId: urlPaymentId }),
          });
        } catch { /* ignore network error */ }

        if (cancelled) return;
        setCourseId(urlCourseId);
        setStatus('completed');
        setIsLoading(false);
        return;
      }

      // Step 3: Have paymentId in URL — check status directly
      if (urlPaymentId) {
        try {
          const res = await fetch(API_ENDPOINTS.payments.status(urlPaymentId), {
            headers: authHeader,
          });
          const data = await res.json();

          if (data.success && data.data) {
            if (data.data.paymentStatus === 'completed' || data.data.status === 'completed') {
              if (cancelled) return;
              setCourseId(data.data.courseId || urlCourseId || '');
              setAmount(data.data.amount || 0);
              setStatus('completed');
              setIsLoading(false);
              return;
            }

            if (cancelled) return;
            setCourseId(data.data.courseId || urlCourseId || '');
            setAmount(data.data.amount || 0);
            setStatus(data.data.paymentStatus || 'pending');
            setIsLoading(false);
            return;
          }
        } catch { /* fall through to step 4 */ }

        if (cancelled) return;
        setStatus('pending');
        setCourseId(urlCourseId || '');
        setIsLoading(false);
        return;
      }

      // Step 4: No paymentId — need to find payment by orderCode from user's payments
      if (payosOrderCode) {
        try {
          const res = await fetch(API_ENDPOINTS.payments.my, {
            headers: authHeader,
          });
          const data = await res.json();

          if (data.success && Array.isArray(data.data)) {
            const matched = data.data.find(
              (p: PaymentInfo) =>
                String(p.payosOrderId) === String(payosOrderCode) ||
                String(p.orderCode) === String(payosOrderCode)
            );

            if (matched) {
              if (cancelled) return;
              setCourseId(matched.courseId);
              setAmount(matched.amount || 0);

              if (matched.paymentStatus === 'completed') {
                setStatus('completed');
                setIsLoading(false);
                return;
              }

              if (payosSuccess) {
                try {
                  await fetch(API_ENDPOINTS.payments.payosConfirm, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeader },
                    body: JSON.stringify({ paymentId: matched.id }),
                  });
                } catch { /* ignore */ }
                if (cancelled) return;
                setStatus('completed');
                setIsLoading(false);
                return;
              }

              setStatus('pending');
              setIsLoading(false);
              return;
            }
          }
        } catch { /* fall through */ }

        if (cancelled) return;
        setStatus(payosSuccess ? 'failed' : 'pending');
        setIsLoading(false);
        return;
      }

      // Nothing to work with
      if (cancelled) return;
      setStatus('failed');
      setIsLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  // Poll when pending — keep checking until completed
  useEffect(() => {
    if (status !== 'pending' || !courseId) return;

    let cancelled = false;
    const poll = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(API_ENDPOINTS.payments.my, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.data)) {
          const completed = data.data.find(
            (p: PaymentInfo) =>
              p.courseId === courseId && p.paymentStatus === 'completed'
          );
          if (completed) {
            setStatus('completed');
            setAmount(completed.amount || 0);
          }
        }
      } catch { /* ignore */ }
    };

    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [status, courseId]);

  // Auto redirect when completed
  useEffect(() => {
    if (status === 'completed' && courseId) {
      const timer = setTimeout(() => navigate(`/user/courses/${courseId}`), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, courseId, navigate]);

  const fmt = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + 'đ';

  if (isLoading || status === 'checking') {
    return (
      <div className={cn(
        'min-h-screen flex flex-col items-center justify-center gap-4',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <Loader2 className="w-14 h-14 animate-spin text-primary" />
        <p className="text-slate-500 dark:text-slate-400">Đang kiểm tra thanh toán...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4',
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      <Card className={cn(
        'max-w-md w-full p-8 text-center',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
      )}>
        {status === 'completed' ? (
          <>
            <div className="flex justify-center mb-6">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                isDark ? 'bg-green-900/30' : 'bg-green-100'
              )}>
                <CheckCircle className={cn('w-12 h-12', isDark ? 'text-green-400' : 'text-green-600')} />
              </div>
            </div>
            <h2 className={cn('text-2xl font-bold mb-2', isDark ? 'text-green-400' : 'text-green-600')}>
              Thanh toán thành công!
            </h2>
            <p className={cn('mb-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Chúc mừng bạn đã đăng ký khóa học thành công
            </p>
            {amount > 0 && (
              <p className={cn('text-lg font-semibold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
                Số tiền: {fmt(amount)}
              </p>
            )}
            <p className={cn('text-sm mb-6 animate-pulse', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Đang chuyển hướng đến khóa học...
            </p>
            <Button
              onClick={() => navigate(`/user/courses/${courseId}`)}
              className="w-full bg-orange-400 hover:bg-orange-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vào học ngay
            </Button>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="flex justify-center mb-6">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                isDark ? 'bg-amber-900/30' : 'bg-amber-100'
              )}>
                <Clock className={cn('w-12 h-12', isDark ? 'text-amber-400' : 'text-amber-600')} />
              </div>
            </div>
            <h2 className={cn('text-2xl font-bold mb-2', isDark ? 'text-amber-400' : 'text-amber-600')}>
              Đang chờ xác nhận
            </h2>
            <p className={cn('mb-6', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Thanh toán của bạn đang được xử lý. Trang sẽ tự cập nhật khi nhận được xác nhận.
            </p>
            <Button
              onClick={() => navigate(courseId ? `/user/payment/qr/${courseId}` : '/user/courses')}
              className="w-full bg-orange-400 hover:bg-orange-500 mb-3"
            >
              Quay lại trang thanh toán
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(courseId ? `/user/courses/${courseId}` : '/user/courses')}
              className="w-full dark:border-slate-600"
            >
              Về trang khóa học
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                isDark ? 'bg-red-900/30' : 'bg-red-100'
              )}>
                <Clock className={cn('w-12 h-12', isDark ? 'text-red-400' : 'text-red-600')} />
              </div>
            </div>
            <h2 className={cn('text-2xl font-bold mb-2', isDark ? 'text-red-400' : 'text-red-600')}>
              Thanh toán không thành công
            </h2>
            <p className={cn('mb-6', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Không tìm thấy thông tin thanh toán. Vui lòng thử lại.
            </p>
            <Button
              onClick={() => navigate(courseId ? `/user/payment/qr/${courseId}` : '/user/courses')}
              className="w-full bg-orange-400 hover:bg-orange-500 mb-3"
            >
              Thử lại thanh toán
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/user/courses')}
              className="w-full dark:border-slate-600"
            >
              Quay lại trang chủ
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
