import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDark, setIsDark] = useState(false);

  const courseId = searchParams.get('courseId') || '';

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
            isDark ? 'bg-red-900/30' : 'bg-red-100'
          )}>
            <XCircle className={cn('w-12 h-12', isDark ? 'text-red-400' : 'text-red-600')} />
          </div>
        </div>
        <h2 className={cn(
          'text-2xl font-bold mb-2',
          isDark ? 'text-red-400' : 'text-red-600'
        )}>Thanh toán đã bị hủy</h2>
        <p className={cn('mb-8', isDark ? 'text-slate-400' : 'text-slate-600')}>
          Thanh toán của bạn đã bị hủy. Bạn có thể thử lại hoặc quay lại trang khóa học.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/user/payment/qr/${courseId}`)}
            className="w-full bg-orange-400 hover:bg-orange-500"
          >
            Thử lại thanh toán
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/user/courses/${courseId}`)}
            className="w-full dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại khóa học
          </Button>
        </div>
      </Card>
    </div>
  );
}
