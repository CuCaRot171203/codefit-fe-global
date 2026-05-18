import { Input, Select, Button } from 'antd';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/shared/ScrollReveal';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const CongDongPage = () => {
  return (
    <main className="pt-0">
      {/* Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[716px] flex items-center px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover grayscale opacity-30 dark:opacity-20"
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80"
            alt="Code workspace"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent dark:from-slate-900 dark:via-slate-900/80"></div>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-5xl"
        >
          <motion.span variants={fadeUp} className="inline-block px-3 sm:px-4 py-1 mb-4 sm:mb-6 rounded-full bg-primary-container/20 dark:bg-cyan-500/20 border border-primary/20 dark:border-cyan-500/30 text-primary dark:text-cyan-400 font-headline text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
            SYSTEM_ACCESS_GRANTED
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-headline font-bold text-on-surface dark:text-white tracking-tighter leading-none mb-6 sm:mb-8">
            Đấu trường<br />
            <span className="text-primary dark:text-cyan-400">Hackathon</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-2xl text-sm sm:text-base md:text-lg text-on-surface-variant dark:text-slate-400 font-body leading-relaxed mb-8 sm:mb-10">
            Nơi hội tụ những kiến trúc sư kỹ thuật số xuất sắc nhất. Biến ý tưởng thành hiện thực trong những cuộc đua mã nguồn cường độ cao.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-headline font-bold uppercase tracking-widest text-xs sm:text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Tham gia ngay
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="border border-outline-variant dark:border-slate-700 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-headline font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors text-on-surface dark:text-slate-300">
              Tìm hiểu thêm
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Search & Filter Bar */}
      <ScrollReveal>
        <section className="px-4 sm:px-6 md:px-8 -mt-12 relative z-20">
          <div className="max-w-7xl mx-auto bg-surface-container-lowest/80 dark:bg-slate-800/80 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 flex flex-col gap-3">
            <div className="flex-1 w-full">
              <Input
                size="large"
                placeholder="Tìm kiếm giải đấu, công nghệ, hoặc chủ đề..."
                prefix={<span className="material-symbols-outlined text-outline dark:text-slate-500">search</span>}
                className="!bg-surface-container-low dark:!bg-slate-700 !border-none !rounded-xl !font-body"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <Select
                defaultValue="all"
                size="large"
                className="flex-1 sm:flex-none sm:w-44"
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang diễn ra' },
                  { value: 'upcoming', label: 'Sắp tới' },
                ]}
              />
              <Select
                defaultValue="all-type"
                size="large"
                className="flex-1 sm:flex-none sm:w-40"
                options={[
                  { value: 'all-type', label: 'Loại hình' },
                  { value: 'blockchain', label: 'Blockchain' },
                  { value: 'ai', label: 'AI / ML' },
                  { value: 'web3', label: 'Web3' },
                ]}
              />
              <Button
                size="large"
                className="!bg-inverse-surface dark:!bg-slate-900 !text-inverse-on-surface dark:!text-white !font-headline !text-xs !uppercase !font-bold !rounded-xl !h-12"
              >
                Lọc kết quả
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Active & Upcoming Hackathons */}
      <section className="px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
            <div>
              <h2 className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary dark:text-cyan-400 mb-2">
                // CURRENT_CHALLENGES
              </h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-on-surface dark:text-white">
                Sự kiện Đang diễn ra & Sắp tới
              </h3>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-outline-variant dark:border-slate-700 flex items-center justify-center hover:bg-surface-container dark:hover:bg-slate-800 transition-colors text-on-surface-variant dark:text-slate-400">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-outline-variant dark:border-slate-700 flex items-center justify-center hover:bg-surface-container dark:hover:bg-slate-800 transition-colors text-on-surface-variant dark:text-slate-400">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Card 1 */}
          <ScrollReveal delay={0.05}>
            <div className="group bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none border border-white/40 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-500">
              <div className="h-40 sm:h-48 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80"
                  alt="Blockchain technology"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  <span className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-headline text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    Đang diễn ra
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-headline font-bold leading-tight text-on-surface dark:text-white">
                    ETH Global Architect 2026
                  </h4>
                  <span className="material-symbols-outlined text-primary dark:text-cyan-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-8">
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Giải thưởng</span>
                    <span className="font-bold text-secondary dark:text-orange-400 text-sm sm:text-base">$50K</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Thí sinh</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">1.2K+</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Thời hạn</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">04d</span>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 sm:py-4 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs transition-colors">
                  Đăng ký tham gia
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2 */}
          <ScrollReveal delay={0.15}>
            <div className="group bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none border border-white/40 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-500">
              <div className="h-40 sm:h-48 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80"
                  alt="AI and Machine Learning"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  <span className="bg-secondary text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-headline text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    Sắp mở
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-headline font-bold leading-tight text-on-surface dark:text-white">
                    Neural Nexus AI Challenge
                  </h4>
                  <span className="material-symbols-outlined text-secondary dark:text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-8">
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Giải thưởng</span>
                    <span className="font-bold text-secondary dark:text-orange-400 text-sm sm:text-base">$75K</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Thí sinh</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">850</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Bắt đầu</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">12d</span>
                  </div>
                </div>
                <button className="w-full border border-primary dark:border-cyan-500 text-primary dark:text-cyan-400 py-3 sm:py-4 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs hover:bg-primary/5 dark:hover:bg-cyan-500/10 transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={0.25}>
            <div className="group bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none border border-white/40 dark:border-slate-700/50 hover:scale-[1.02] transition-transform duration-500">
              <div className="h-40 sm:h-48 relative overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80"
                  alt="Cybersecurity"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                  <span className="bg-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-headline text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    Đang diễn ra
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-headline font-bold leading-tight text-on-surface dark:text-white">
                    Cyber Security Blitz 4.0
                  </h4>
                  <span className="material-symbols-outlined text-primary dark:text-cyan-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    security
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-8">
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Giải thưởng</span>
                    <span className="font-bold text-secondary dark:text-orange-400 text-sm sm:text-base">$30K</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Thí sinh</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">2.4K</span>
                  </div>
                  <div className="bg-surface-container-low dark:bg-slate-700 p-2 sm:p-3 rounded-xl">
                    <span className="block text-[10px] sm:text-[10px] font-headline uppercase text-outline dark:text-slate-500 mb-1">Thời hạn</span>
                    <span className="font-bold text-on-surface dark:text-white text-sm sm:text-base">01d</span>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 sm:py-4 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs transition-colors">
                  Đăng ký tham gia
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Past Events Gallery - Hall of Fame */}
      <section className="bg-surface-container-low dark:bg-slate-800/50 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="mb-10 sm:mb-14 md:mb-16 text-center">
              <h2 className="text-[10px] sm:text-xs font-headline font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary dark:text-cyan-400 mb-2">
                // HALL_OF_FAME
              </h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-on-surface dark:text-white">
                Lịch sử Chiến tích
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
            {/* Main Featured */}
            <ScrollReveal delay={0.05} className="md:col-span-12 lg:col-span-8 bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none group aspect-[16/9] md:aspect-auto">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
                alt="Team celebrating success"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 sm:bottom-10 md:bottom-12 left-4 sm:left-8 md:left-12 right-4 sm:right-8 md:right-12 text-white">
                <span className="inline-block px-3 sm:px-4 py-1 mb-3 sm:mb-4 rounded-full bg-primary text-white font-headline text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  Quán quân 2023
                </span>
                <h4 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black mb-2 sm:mb-4">Project: Sentinel AI</h4>
                <p className="max-w-xl text-sm sm:text-base md:text-lg font-body text-slate-200">
                  Giải pháp bảo mật phi tập trung ứng dụng học máy tự thích ứng, đạt giải nhất tại ETH Global 2023.
                </p>
              </div>
            </ScrollReveal>

            {/* Side Cards */}
            <div className="md:col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
              <ScrollReveal delay={0.15} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group aspect-[4/3] sm:aspect-square">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80"
                  alt="Design workflow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 to-transparent"></div>
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 text-white">
                  <h5 className="font-headline font-bold text-base sm:text-lg md:text-xl">DeFi Dashboard X</h5>
                  <span className="text-primary dark:text-cyan-400 font-headline text-[10px] sm:text-xs uppercase font-bold tracking-widest">
                    Most Innovative UI
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.25} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group aspect-[4/3] sm:aspect-square">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80"
                  alt="Server infrastructure"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 to-transparent"></div>
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 text-white">
                  <h5 className="font-headline font-bold text-base sm:text-lg md:text-xl">Protocol Layer Zero</h5>
                  <span className="text-primary dark:text-cyan-400 font-headline text-[10px] sm:text-xs uppercase font-bold tracking-widest">
                    Efficiency Award
                  </span>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-8 bg-surface dark:bg-slate-900 text-center overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <ScrollReveal>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-headline font-black mb-6 sm:mb-8 leading-tight text-on-surface dark:text-white">
              Bạn đã sẵn sàng để trở thành <span className="text-primary dark:text-cyan-400">CodeFit Architect?</span>
            </h2>
            <p className="text-base sm:text-xl text-on-surface-variant dark:text-slate-400 font-body mb-8 sm:mb-12">
              Gia nhập cộng đồng 50,000+ lập trình viên và bắt đầu xây dựng tương lai ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-headline font-bold uppercase tracking-[0.2em] text-xs sm:text-sm hover:shadow-[0_0_30px_rgba(0,104,117,0.3)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-shadow">
                Đăng ký tài khoản
              </button>
              <button className="bg-white dark:bg-slate-800 border-2 border-primary/20 dark:border-cyan-500/30 text-primary dark:text-cyan-400 px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-headline font-bold uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-primary/5 dark:hover:bg-cyan-500/10 transition-colors">
                Xem tài liệu
              </button>
            </div>
          </div>
        </ScrollReveal>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 dark:bg-cyan-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/5 dark:bg-orange-500/5 rounded-full blur-[120px]"></div>
      </section>
    </main>
  );
};

export default CongDongPage;
