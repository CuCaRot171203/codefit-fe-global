import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useAppSelector } from '@/store';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary - catches React render errors
 * Must be a class component (cannot use hooks in class components)
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorBoundaryFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI for Error Boundary - uses hooks via wrapper
 */
function ErrorBoundaryFallback({ error }: { error: Error | null }) {
  const theme = useAppSelector((state) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-[#0d0f18]' : 'bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#fff0f8]'
      }`}
    >
      <div
        className={`rounded-3xl p-10 max-w-md mx-4 text-center transition-all duration-300 ${
          isDark
            ? 'bg-[#1a1d2e]/90 backdrop-blur-xl border border-white/5'
            : 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl'
        }`}
      >
        <div className="text-6xl mb-4">
          <span
            className="text-7xl"
            role="img"
            aria-label="crashed"
          >
            💥
          </span>
        </div>
        <h1
          className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Oops! Có gì đó bị lỗi
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {error?.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử tải lại trang.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            Tải lại trang
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
            }`}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component that allows ErrorBoundary to use hooks
 * (class components can't use hooks directly)
 */
function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryProps): ReactNode {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}

export { ErrorBoundaryClass, ErrorBoundaryFallback };
export default ErrorBoundaryWrapper;
