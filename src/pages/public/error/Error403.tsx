import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAppSelector } from '@/store';
import { useEffect, useState } from 'react';
import ErrorCharacter from './ErrorCharacter';

const roleDashboardMap: Record<string, string> = {
  admin: '/admin/dashboard',
  lecture: '/lecture',
  user: '/user/dashboard',
};

const Error403 = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';
  const location = useLocation();
  const [dashboardPath, setDashboardPath] = useState('/');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        const path = roleDashboardMap[user.role] || '/';
        setDashboardPath(path);
      }
    } catch {
      setDashboardPath('/');
    }
  }, []);

  const errorMessage =
    (location.state as { errorMessage?: string })?.errorMessage ||
    undefined;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {/* Animated character */}
      <div className="animate-bounce-in">
        <ErrorCharacter code="403" />
      </div>

      {/* Error code */}
      <div className="relative">
        <span
          className={`text-[120px] md:text-[140px] font-bold font-headline leading-none select-none animate-pulse-glow ${
            isDark ? 'text-transparent' : ''
          }`}
          style={
            isDark
              ? {
                  WebkitTextStroke: '2px rgba(239,68,68,0.4)',
                  color: 'transparent',
                }
              : {
                  WebkitTextStroke: '2px #ef4444',
                  color: 'transparent',
                }
          }
        >
          403
        </span>
        <span
          className={`absolute inset-0 text-[120px] md:text-[140px] font-bold font-headline leading-none animate-pulse ${
            isDark
              ? 'text-red-400/20'
              : 'text-red-300/40'
          }`}
          aria-hidden="true"
        >
          403
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h1
          className={`text-2xl md:text-3xl font-semibold ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}
        >
          Từ chối quyền truy cập!
        </h1>
        <p
          className={`text-base ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {errorMessage || 'Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm pt-2">
        <Link
          to={dashboardPath}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 px-6 py-3 ${
            isDark
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/60'
          }`}
        >
          <LayoutDashboard size={16} />
          Về dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 px-6 py-3 ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
          }`}
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default Error403;
