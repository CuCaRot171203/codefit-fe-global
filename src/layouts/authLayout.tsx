import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/public/ThemeToggle';
import ThemeManager from '@/components/public/ThemeManager';

const AuthLayout = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
      title: 'Lập trình chính xác.',
      subtitle: 'Cùng 50.000+ lập trình viên thành thạo kỹ năng qua tư duy kiến trúc và kỹ thuật chỉnh sửa.',
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
      title: 'Xây dựng dự án thực tế.',
      subtitle: 'Biến ý tưởng thành hiện thực với các thử thách thực hành và học tập cộng tác.',
    },
    {
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
      title: 'Ra mắt tự tin.',
      subtitle: 'Từ review code đến triển khai, học toàn bộ vòng đời phát triển phần mềm.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <ThemeManager />
      <div className="h-screen flex overflow-hidden bg-background dark:bg-slate-900">
        {/* Top Bar - chỉ hiện trên màn nhỏ */}
        <div className="fixed top-4 right-4 z-50 lg:hidden">
          <ThemeToggle />
        </div>

        {/* Left Side: Image - cố định, full height */}
        <div className="hidden lg:flex lg:w-1/2 h-full relative bg-primary overflow-hidden">
          {/* Slides */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                src={slide.image}
                alt={slide.title}
              />
            </div>
          ))}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary-container/50 z-10" />

          {/* Content */}
          <div className="relative z-20 h-full p-12 flex flex-col justify-end text-on-primary">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 p-12 flex flex-col justify-end transition-all duration-700 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <h1 className="font-headline text-5xl font-bold leading-tight tracking-tight">
                  {slide.title}
                </h1>
              </div>
            ))}

            {/* Progress Indicators */}
            <div className="absolute bottom-12 left-12 right-12 z-30">
              <div className="flex items-center gap-3">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === currentSlide
                        ? 'w-12 bg-primary-fixed'
                        : 'w-4 bg-primary-fixed/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none bg-gradient-to-br from-primary/20 via-transparent to-primary-container/40 z-20" />
          </div>
        </div>

        {/* Right Side: Auth Form - có thể cuộn */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto">
          <div className="min-h-full flex flex-col">
            {/* Top Bar - chỉ hiện trên màn lớn */}
            <div className="hidden lg:flex justify-end py-4 px-8">
              <ThemeToggle />
            </div>

            {/* Form Container - căn giữa nội dung */}
            <div className="flex-grow flex items-center justify-center px-6 sm:px-10 md:px-16 py-8">
              <div className="w-full max-w-md">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
