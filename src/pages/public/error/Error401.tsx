import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/store';
import ErrorCharacter from './ErrorCharacter';

const Error401 = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';
  const location = useLocation();
  const errorMessage =
    (location.state as { errorMessage?: string })?.errorMessage ||
    undefined;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {/* Animated character */}
      <div className="animate-bounce-in">
        <ErrorCharacter code="401" />
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
                  WebkitTextStroke: '2px rgba(251,191,36,0.4)',
                  color: 'transparent',
                }
              : {
                  WebkitTextStroke: '2px #f59e0b',
                  color: 'transparent',
                }
          }
        >
          401
        </span>
        <span
          className={`absolute inset-0 text-[120px] md:text-[140px] font-bold font-headline leading-none animate-pulse ${
            isDark
              ? 'text-amber-400/20'
              : 'text-amber-300/40'
          }`}
          aria-hidden="true"
        >
          401
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
          Bạn chưa đăng nhập!
        </h1>
        <p
          className={`text-base ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {errorMessage || 'Trang này yêu cầu bạn đăng nhập để truy cập. Vui lòng đăng nhập để tiếp tục.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm pt-2">
        <Link
          to="/dang-nhap"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 px-6 py-3 ${
            isDark
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200/60'
          }`}
        >
          <Home size={16} />
          Đăng nhập ngay
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

export default Error401;
