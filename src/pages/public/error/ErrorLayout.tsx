import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store';

const ErrorLayout = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#0d0f18]'
          : 'bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#fff0f8]'
      }`}
    >
      {/* Background floating shapes */}
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${
          theme === 'dark' ? 'opacity-30' : 'opacity-40'
        }`}
      >
        <div
          className={`absolute w-72 h-72 rounded-full blur-3xl animate-drift ${
            theme === 'dark'
              ? 'bg-purple-900/40'
              : 'bg-purple-200/60'
          }`}
          style={{ top: '10%', left: '5%', animationDelay: '0s' }}
        />
        <div
          className={`absolute w-96 h-96 rounded-full blur-3xl animate-drift ${
            theme === 'dark'
              ? 'bg-cyan-900/30'
              : 'bg-cyan-200/50'
          }`}
          style={{ bottom: '5%', right: '5%', animationDelay: '2s' }}
        />
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl animate-drift ${
            theme === 'dark'
              ? 'bg-pink-900/30'
              : 'bg-pink-200/50'
          }`}
          style={{ top: '50%', left: '60%', animationDelay: '4s' }}
        />
        <div
          className={`absolute w-48 h-48 rounded-full blur-2xl animate-drift ${
            theme === 'dark'
              ? 'bg-blue-900/20'
              : 'bg-blue-200/40'
          }`}
          style={{ top: '20%', right: '20%', animationDelay: '1s' }}
        />
      </div>

      {/* Floating particles for dark mode */}
      {theme === 'dark' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-float-soft"
              style={{
                backgroundColor: ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'][
                  i % 5
                ],
                top: `${10 + (i * 73) % 80}%`,
                left: `${5 + (i * 89) % 90}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div
          className={`rounded-3xl p-8 md:p-12 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-[#1a1d2e]/90 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/30'
              : 'bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-purple-100/50'
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ErrorLayout;
