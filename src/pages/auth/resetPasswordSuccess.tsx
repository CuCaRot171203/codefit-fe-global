'use client';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { CheckCircle } from 'lucide-react';

const ResetPasswordSuccess = () => {
  const navigate = useNavigate();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      {/* Success Container */}
      <div
        className={cn(
          'w-full rounded-xl p-6 md:p-8 text-center',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}
      >
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              isDark ? 'bg-emerald-900/50' : 'bg-tertiary-fixed'
            )}
          >
            <CheckCircle
              className={cn(
                'w-10 h-10',
                isDark ? 'text-emerald-400' : 'text-on-tertiary-container'
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          <h1
            className={cn(
              'text-2xl font-headline font-bold leading-tight',
              isDark ? 'text-white' : 'text-primary'
            )}
          >
            Đặt lại mật khẩu thành công!
          </h1>
          <p
            className={cn(
              'text-sm leading-relaxed max-w-[280px] mx-auto',
              isDark ? 'text-slate-400' : 'text-on-surface-variant'
            )}
          >
            Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <button
            className={cn(
              'w-full py-3 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98]',
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-primary-container text-white hover:bg-primary'
            )}
            onClick={() => navigate('/dang-nhap')}
          >
            Quay lại đăng nhập
          </button>

          <p
            className={cn(
              'text-xs font-medium pt-2',
              isDark ? 'text-slate-500' : 'text-on-surface-variant'
            )}
          >
            CodeFit © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSuccess;
