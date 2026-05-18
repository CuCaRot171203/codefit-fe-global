import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/store';
import ErrorCharacter from './ErrorCharacter';

const Error404 = () => {
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
        <ErrorCharacter code="404" />
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
                  WebkitTextStroke: '2px rgba(99,102,241,0.4)',
                  color: 'transparent',
                }
              : {
                  WebkitTextStroke: '2px #818cf8',
                  color: 'transparent',
                }
          }
        >
          404
        </span>
        <span
          className={`absolute inset-0 text-[120px] md:text-[140px] font-bold font-headline leading-none animate-pulse ${
            isDark
              ? 'text-indigo-400/20'
              : 'text-indigo-300/40'
          }`}
          aria-hidden="true"
        >
          404
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
          Oops! Trang này đi chơi rồi
        </h1>
        <p
          className={`text-base ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {errorMessage || 'Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm pt-2">
        <Link
          to="/"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 px-6 py-3 ${
            isDark
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-200/60'
          }`}
        >
          <Home size={16} />
          Về trang chủ
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

export default Error404;
