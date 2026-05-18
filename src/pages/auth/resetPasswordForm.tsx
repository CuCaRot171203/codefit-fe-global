'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dat-lai-mat-khau/thanh-cong');
  };

  return (
    <div className="w-full">
      {/* Reset Card */}
      <div
        className={cn(
          'w-full rounded-xl p-6 shadow-lg',
          isDark ? 'bg-slate-800' : 'bg-surface-container-lowest'
        )}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center',
              isDark ? 'bg-blue-900/50' : 'bg-primary-fixed'
            )}
          >
            <LockKeyhole
              className={cn(
                'w-7 h-7',
                isDark ? 'text-blue-400' : 'text-primary'
              )}
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1
            className={cn(
              'text-2xl font-headline font-bold mb-2',
              isDark ? 'text-white' : 'text-primary'
            )}
          >
            Đặt lại mật khẩu
          </h1>
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-slate-400' : 'text-on-surface-variant'
            )}
          >
            Vui lòng nhập mật khẩu mới của bạn bên dưới.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <label
              className={cn(
                'block text-xs font-semibold uppercase tracking-wider',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}
              htmlFor="new_password"
            >
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                className={cn(
                  'w-full rounded-lg px-4 py-3 pr-10 transition-all outline-none',
                  isDark
                    ? 'bg-slate-700 text-white placeholder-slate-500 focus:ring-blue-500'
                    : 'bg-surface-container-highest text-on-surface focus:ring-primary'
                )}
                id="new_password"
                name="new_password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors',
                  isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-outline hover:text-primary'
                )}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              className={cn(
                'block text-xs font-semibold uppercase tracking-wider',
                isDark ? 'text-slate-400' : 'text-secondary'
              )}
              htmlFor="confirm_password"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                className={cn(
                  'w-full rounded-lg px-4 py-3 pr-10 transition-all outline-none',
                  isDark
                    ? 'bg-slate-700 text-white placeholder-slate-500 focus:ring-blue-500'
                    : 'bg-surface-container-highest text-on-surface focus:ring-primary'
                )}
                id="confirm_password"
                name="confirm_password"
                placeholder="••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors',
                  isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-outline hover:text-primary'
                )}
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={cn(
              'w-full py-3 rounded-xl font-headline font-bold shadow-lg transition-all active:scale-[0.98]',
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/50'
                : 'bg-primary-container text-white hover:bg-primary shadow-primary/20'
            )}
            type="submit"
          >
            Đặt lại mật khẩu
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <button
            className={cn(
              'text-sm font-medium transition-all hover:underline decoration-2 underline-offset-4',
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-primary-container hover:underline'
            )}
            onClick={() => navigate('/dang-nhap')}
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
