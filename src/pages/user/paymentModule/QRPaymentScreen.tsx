import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

interface PaymentData {
  payment?: {
    id: string;
    amount: number;
    paymentStatus: string;
  };
  checkoutUrl: string | null;
  checkoutFormFields: Record<string, string>;
  qrCodeUrl?: string;
  qrCode?: string;
  orderCode: string;
  isMock?: boolean;
  payosOrderId?: string;
}

export default function QRPaymentScreen() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [timeLeft, setTimeLeft] = useState(900);
  const [isDark, setIsDark] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const createPayment = async () => {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 20;
      
      if (!isValidToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/dang-nhap');
        return;
      }

      if (!courseId) {
        setError('Không tìm thấy thông tin khóa học');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINTS.payments.payosCreate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const raw = data.data;
          if (raw?.payment) {
            setPaymentData({
              ...raw,
              qrCodeUrl: raw.qrCodeUrl || raw.qrCode,
              checkoutUrl: raw.checkoutUrl,
            });
            // Generate QR image from qrCode string
            if (raw.qrCode) {
              QRCode.toDataURL(raw.qrCode, { width: 256, margin: 2 })
                .then((url) => setQrDataUrl(url))
                .catch((err) => console.error('QR generation error:', err));
            }
          } else {
            setError(raw?.message || 'Dữ liệu thanh toán không hợp lệ');
          }
        } else {
          setError(data.message || 'Không thể tạo thanh toán');
        }
      } catch {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    createPayment();
  }, [courseId]);

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentData?.payment?.id) return;

    try {
      const token = localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 20;
      const response = await fetch(API_ENDPOINTS.payments.status(paymentData.payment.id), {
        headers: {
          ...(isValidToken ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (data.data.status === 'completed') {
          setStatus('success');
        } else if (data.data.status === 'failed' || data.data.status === 'cancelled') {
          setStatus('failed');
          setError('Thanh toán không thành công');
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  }, [paymentData]);

  useEffect(() => {
    if (status !== 'pending' || !paymentData) return;
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [status, paymentData, checkPaymentStatus]);

  useEffect(() => {
    if (status === 'success') {
      const timeout = setTimeout(() => {
        navigate(`/user/courses/${courseId}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate, courseId]);

  useEffect(() => {
    if (status !== 'pending' || !paymentData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('failed');
          setError('Mã thanh toán đã hết hạn. Vui lòng tạo mới.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, paymentData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (isLoading) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Đang tạo mã thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentData) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center p-4',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <Card className={cn(
          'max-w-md w-full p-8 text-center',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
        )}>
          <div className="flex justify-center mb-6">
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              isDark ? 'bg-red-900/30' : 'bg-red-100'
            )}>
              <XCircle className={cn('w-10 h-10', isDark ? 'text-red-400' : 'text-red-600')} />
            </div>
          </div>
          <h2 className={cn(
            'text-2xl font-bold mb-2',
            isDark ? 'text-red-400' : 'text-red-600'
          )}>Có lỗi xảy ra</h2>
          <p className={cn('mb-6', isDark ? 'text-slate-400' : 'text-slate-600')}>{error}</p>
          <Button
            onClick={() => navigate(`/user/courses/${courseId}`)}
            className="bg-orange-400 hover:bg-orange-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center p-4',
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      )}>
        <Card className={cn(
          'max-w-md w-full p-8 text-center',
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
        )}>
          <div className="flex justify-center mb-6">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center',
              isDark ? 'bg-green-900/30' : 'bg-green-100'
            )}>
              <CheckCircle className={cn('w-12 h-12', isDark ? 'text-green-400' : 'text-green-600')} />
            </div>
          </div>
          <h2 className={cn(
            'text-2xl font-bold mb-2',
            isDark ? 'text-green-400' : 'text-green-600'
          )}>Thanh toán thành công!</h2>
          <p className={cn('mb-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
            Chúc mừng bạn đã đăng ký khóa học thành công
          </p>
          <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Đang chuyển hướng đến khóa học...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4',
      isDark ? 'bg-slate-900' : 'bg-slate-50'
    )}>
      <Card className={cn(
        'w-full max-w-4xl overflow-hidden shadow-2xl',
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'
      )}>
        {/* Header */}
        <div className={cn(
          'p-4 flex items-center justify-between',
          isDark
            ? 'bg-slate-900 border-b border-slate-700'
            : 'bg-gradient-to-r from-[#0B3C5D] to-[#0B3C5D]/80'
        )}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/user/courses/${courseId}`)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white">Thanh toán khóa học</h1>
              <p className="text-sm text-white/70">Quét mã QR để thanh toán</p>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5',
            isDark ? 'bg-slate-800 text-white' : 'bg-white/20 text-white'
          )}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Body - 8-col grid: QR 4/8, Info 4/8 */}
        <div className="grid grid-cols-8 gap-0">
          {/* LEFT: QR Code (4/8) */}
          <div className={cn(
            'col-span-4 p-8 flex flex-col items-center justify-center',
            isDark ? 'bg-slate-900/50' : 'bg-slate-50'
          )}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code thanh toán"
                className="w-64 h-64 object-contain rounded-2xl shadow-lg bg-white"
              />
            ) : paymentData?.qrCodeUrl ? (
              <img
                src={paymentData.qrCodeUrl}
                alt="QR Code thanh toán"
                className="w-64 h-64 object-contain rounded-2xl shadow-lg bg-white"
              />
            ) : (
              <div className={cn(
                'w-64 h-64 flex items-center justify-center rounded-2xl',
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              )}>
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}
            <p className={cn(
              'mt-4 text-sm font-medium text-center',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}>
              Quét mã QR bằng ứng dụng ngân hàng
            </p>
            <p className={cn(
              'text-3xl font-bold mt-2',
              isDark ? 'text-white' : 'text-[#0B3C5D]'
            )}>
              {paymentData ? formatPrice(paymentData.payment?.amount ?? 0) : '0đ'}
            </p>

            {/* Mock warning */}
            {paymentData?.isMock && paymentData?.qrCodeUrl && !paymentData?.checkoutUrl && (
              <div className="mt-4 flex flex-col gap-2 w-full">
                <div className={cn(
                  'p-3 rounded-lg text-sm text-center',
                  isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 border border-amber-200 text-amber-800'
                )}>
                  Chế độ phát triển (Mock) - Quét QR bên dưới
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Payment Info (4/8) */}
          <div className={cn(
            'col-span-4 p-8 space-y-6',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}>
            {/* Order info */}
            <div className={cn(
              'p-4 rounded-xl',
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            )}>
              <h3 className={cn(
                'font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Thông tin đơn hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mã đơn</span>
                  <span className={cn(
                    'font-mono font-medium',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}>
                    {paymentData?.orderCode || '---'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Trạng thái</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                    Chờ thanh toán
                  </Badge>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className={cn(
                'font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Hướng dẫn thanh toán
              </h3>
              <ol className={cn(
                'space-y-2 text-sm',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}>
                <li>1. Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                <li>2. Chọn tính năng <strong>Quét mã QR</strong></li>
                <li>3. Quét mã QR ở bên trái</li>
                <li>4. Kiểm tra thông tin và xác nhận thanh toán</li>
              </ol>
            </div>

            {/* Status indicator */}
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
            )}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Đang chờ thanh toán...
            </div>

            <Button
              variant="outline"
              onClick={checkPaymentStatus}
              className="w-full dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Kiểm tra trạng thái
            </Button>

            {/* Back to course */}
            <Link
              to={`/user/courses/${courseId}`}
              className={cn(
                'block text-center text-sm transition-colors',
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              Quay lại khóa học
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
