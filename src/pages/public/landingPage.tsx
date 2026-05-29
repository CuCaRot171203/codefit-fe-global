import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollReveal from '../../components/shared/ScrollReveal';
import { useState, useEffect } from 'react';
import hero1 from '../../assets/images/heros/laptrinhvien1.jpg';
import hero2 from '../../assets/images/heros/laptrinhvien2.jpg';
import hero3 from '../../assets/images/heros/laptrinhvien3.png';

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const HERO_IMAGES = [hero1, hero2, hero3];

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white dark:bg-slate-900">
        {/* Full-bleed background */}
        <div className="absolute inset-0 z-0">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              src={src}
              alt={`Hero ${i + 1}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent" />
        </div>

        {/* Floating decorative blobs */}
        <div className="absolute top-20 left-1/4 w-48 h-48 bg-primary/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-blob-pulse z-10 pointer-events-none" />
        <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-secondary/10 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob-pulse z-10 pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Hero content */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12"
          >
            {/* Text side */}
            <div>
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tighter text-slate-900 dark:text-white font-headline leading-[0.9] mb-6 sm:mb-8"
              >
                Trải nghiệm <br />
                <span className="text-primary dark:text-cyan-400">Khám phá</span> <br />
                Khả năng lập trình
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-10 leading-relaxed"
              >
                Hãy tham gia lộ trình giả lập 21 ngày tại Codefit để trực tiếp viết mã và đo lường tư duy logic. Báo cáo phân tích từ hệ thống sẽ giúp bạn tự tin định hướng nghề nghiệp trước khi đầu tư lâu dài vào ngành IT.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
              >
                <Link to="/dang-nhap">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-headline font-bold text-base sm:text-lg transition-all shadow-lg">
                    Bắt đầu ngay
                  </button>
                </Link>
                <Link to="/lo-trinh">
                  <button className="w-full sm:w-auto border border-outline-variant dark:border-slate-600 text-slate-900 dark:text-slate-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-headline font-bold text-base sm:text-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all">
                    Xem lộ trình
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Image side */}
            <motion.div
              variants={fadeUp}
              className="relative"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 dark:bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 dark:bg-orange-500/10 rounded-full blur-3xl" />
              <img
                className={`relative z-10 w-full aspect-square object-cover rounded-xl shadow-2xl transition-all duration-1000 ${
                  true ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                src={HERO_IMAGES[currentIndex]}
                alt="Software Developer"
              />
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 glass-card dark:glass-card p-4 sm:p-6 rounded-xl border border-white/20 dark:border-slate-700/20 shadow-xl z-20 neon-glow-primary">
                <div className="text-primary dark:text-cyan-400 font-headline font-bold text-3xl">
                  98%
                </div>
                <div className="text-xs font-headline uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Tỉ lệ hoàn thành
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-cyan-500/5 dark:via-transparent dark:to-orange-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              <div className="glass-card dark:glass-card p-4 sm:p-6 md:p-8 rounded-xl border border-white/20 dark:border-slate-700/20 text-center hover:translate-y-[-8px] transition-transform duration-300">
                <div className="text-4xl font-headline font-bold text-primary dark:text-cyan-400 mb-2">
                  10,000+
                </div>
                <div className="text-sm font-headline uppercase tracking-tighter text-slate-600 dark:text-slate-400">
                  Học viên tích cực
                </div>
              </div>
              <ScrollReveal delay={0.1}>
                <div className="glass-card dark:glass-card p-4 sm:p-6 md:p-8 rounded-xl border border-white/20 dark:border-slate-700/20 text-center hover:translate-y-[-8px] transition-transform duration-300">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-primary dark:text-cyan-400 mb-2">
                    500+
                  </div>
                  <div className="text-sm font-headline uppercase tracking-tighter text-slate-600 dark:text-slate-400">
                    Thử thách Code
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="glass-card dark:glass-card p-4 sm:p-6 md:p-8 rounded-xl border border-white/20 dark:border-slate-700/20 text-center hover:translate-y-[-8px] transition-transform duration-300">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-primary dark:text-cyan-400 mb-2">
                    150+
                  </div>
                  <div className="text-sm font-headline uppercase tracking-tighter text-slate-600 dark:text-slate-400">
                    Đối tác doanh nghiệp
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="glass-card dark:glass-card p-4 sm:p-6 md:p-8 rounded-xl border border-white/20 dark:border-slate-700/20 text-center hover:translate-y-[-8px] transition-transform duration-300">
                  <div className="text-3xl sm:text-4xl font-headline font-bold text-primary dark:text-cyan-400 mb-2">
                    24/7
                  </div>
                  <div className="text-sm font-headline uppercase tracking-tighter text-slate-600 dark:text-slate-400">
                    Hỗ trợ AI Mentor
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-12 sm:mb-16 md:mb-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
              Tính năng đột phá
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary dark:bg-cyan-400 mx-auto rounded-full" />
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          <ScrollReveal delay={0.1}>
            <div className="group">
              <div className="relative overflow-hidden rounded-xl mb-6 aspect-video">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  data-alt="dramatic photography of high-tech digital hardware with blue neon lights and laser lines symbolizing practice and precision"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuARalTEwuM_v7VtFhJGp2bhNhdUJPQqpQj-uihiSKgmWLMmw99LWcVR729iT832W_Bonq6HTPIZHVKbrrAsgrP5Ucpdvg1fCrI88EjlSxL24bpdviCCVqyRVbY6ylnnm4HAQXb59V-EgVM2cvRIbPVAwAu8WFxiDdRMyAC8i4Lnsbqfqz_IZGtr9elksX5j-isCFaOq3qRSLD_sxlg4ViYZt6vixmfqFDWVv0xYf8cyaaASWQiwkFenQ26dnh-x6ObcNFyIlC_0sCo"
                  alt="Practice"
                />
                <div className="absolute inset-0 bg-primary/20 dark:bg-cyan-500/20 mix-blend-overlay" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4 text-slate-900 dark:text-white">
                Luyện tập Thực tế
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Giải quyết các vấn đề từ thực tế doanh nghiệp thay vì các bài tập
                lý thuyết suông.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="group">
              <div className="relative overflow-hidden rounded-xl mb-6 aspect-video">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  data-alt="close up of hands typing on a glowing keyboard in a dark room with reflected code on screen"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMi3_4QlsR4uPf2A7Mxg6B0zAfs9hXTLj8N8yithgt-XUx7UwSccj81Cxvi8rhV4ahTrM6X06x7qPU4qTLZPblVAOSQnjksCyUXk1_rMxK6oKLx8l2NHfRXAFDHnV_Ot5ZhtxL7dyVv6B1e3XvQbx8YzXv8Tbcq0BOMHkDnfgKyEAyHzF_5ohAdYBvmpE9WR-_pXczTk6anwo_haffgOFk1oTe8njeQ3Z7bYlt6ws3PJdV3UbBjj5ZvUAlejwptHe_eZXhneFjvyY"
                  alt="Realtime Feedback"
                />
                <div className="absolute inset-0 bg-secondary/20 dark:bg-orange-500/20 mix-blend-overlay" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4 text-slate-900 dark:text-white">
                Phản hồi Thời gian thực
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hệ thống AI phân tích code và đưa ra gợi ý tối ưu hóa ngay lập tức
                khi bạn gõ.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="group">
              <div className="relative overflow-hidden rounded-xl mb-6 aspect-video">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  data-alt="crowded high-tech auditorium with professional developers participating in a hackathon with futuristic displays"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhTDg0zOM5ZEDBe-j-Vp0wJZRKHX4yGv2D3R0bfN4oGLkkJyvhoMIHPj2GhsUQWhiXH5OUHW3WvbyuL4trCR3IOxS-fojT5YaXXmThrA9_HvJbVaTz4-HNLattDJHUhX3IkVP6yeWSdWtvuxF5m78t1XusrL5AtvA-yUoLi9lDEHKQio1CjgeCGN1I9e9g-pMWaqLxLSbJTDbQeAbuYcEKBT_kH38ckLQtOTCQXUXKl0ZUrRt873YloztLKuv8-dZpsL82HctlSrI"
                  alt="Hackathons"
                />
                <div className="absolute inset-0 bg-primary/20 dark:bg-cyan-500/20 mix-blend-overlay" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4 text-slate-900 dark:text-white">
                Global Hackathons
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tham gia các đấu trường lập trình quy mô lớn, kết nối với nhà tuyển
                dụng hàng đầu.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Code Editor Preview */}
      <section className="py-16 sm:py-20 md:py-24 bg-inverse-surface dark:bg-slate-950 relative overflow-hidden">
        {/* Animated gradient glow behind code block */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-blob-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <ScrollReveal direction="left">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="w-full md:w-1/2">
                <h2 className="text-white dark:text-slate-100 text-3xl sm:text-4xl md:text-5xl font-headline font-bold mb-6 sm:mb-8 leading-tight">
                  Môi trường <span className="text-primary-fixed dark:text-cyan-300">Phát triển</span>{' '}
                  Chuyên nghiệp
                </h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary-fixed dark:text-cyan-300 bg-primary-fixed/10 dark:bg-cyan-500/10 p-2 rounded-lg">
                      terminal
                    </span>
                    <div>
                      <h4 className="text-white dark:text-slate-100 font-bold font-headline">
                        Hỗ trợ đa ngôn ngữ
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        Python, JavaScript, Go, Rust, C++ và nhiều hơn thế.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary-fixed dark:text-cyan-300 bg-primary-fixed/10 dark:bg-cyan-500/10 p-2 rounded-lg">
                      bug_report
                    </span>
                    <div>
                      <h4 className="text-white dark:text-slate-100 font-bold font-headline">
                        AI Debugging Pro
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        Tự động phát hiện lỗi logic và lỗ hổng bảo mật.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <ScrollReveal direction="right" delay={0.2}>
                <div className="md:w-full w-full">
                  <div className="rounded-xl overflow-hidden border border-slate-700 dark:border-slate-800 shadow-2xl bg-[#0d1117]">
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] dark:bg-slate-900 border-b border-slate-800 dark:border-slate-800">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="mx-auto text-xs text-slate  -500 font-headline">
                        main.py — CodeFit Editor
                      </div>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div className="flex gap-4">
                        <span className="text-slate-600">1</span>
                        <span className="text-primary-fixed dark:text-cyan-300">import</span>
                        <span className="text-white">codefit_ai</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-600">2</span>
                        <span className="text-white" />
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-600">3</span>
                        <span className="text-primary-fixed dark:text-cyan-300">def</span>
                        <span className="text-amber-300">solve_complex_problem</span>
                        <span className="text-white">(data):</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-600">4</span>
                        <span className="text-white ml-4">mentor = codefit_ai.</span>
                        <span className="text-amber-200">Connect</span>
                        <span className="text-white">()</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-600">5</span>
                        <span className="text-white ml-4">analysis = mentor.</span>
                        <span className="text-amber-200">analyze</span>
                        <span className="text-white">(data)</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-slate-600">6</span>
                        <span className="text-white ml-4" />
                        <span className="text-primary-fixed dark:text-cyan-300">return</span>
                        <span className="text-white">analysis.optimize()</span>
                      </div>
                      <div className="mt-8 p-4 bg-primary/10 dark:bg-cyan-500/10 rounded-lg border border-primary/20 dark:border-cyan-500/20">
                        <div className="text-primary-fixed dark:text-cyan-300 text-xs font-headline font-bold mb-1">
                          AI INSIGHT
                        </div>
                        <div className="text-white/80 dark:text-slate-300 text-xs">
                          Phát hiện vòng lặp không tối ưu tại dòng 6. Gợi ý: Sử dụng
                          list comprehension.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-center mb-12 sm:mb-16 md:mb-20 text-slate-900 dark:text-white">
            Lộ trình Chinh phục
          </h2>
        </ScrollReveal>
        <div className="relative">
          {/* Gradient connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-orange-500 dark:from-cyan-500 dark:via-cyan-400 dark:to-orange-400 hidden md:block" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <ScrollReveal delay={0.1}>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl border border-outline-variant dark:border-slate-700 hover:border-primary dark:hover:border-cyan-400 transition-colors z-10">
                <div className="w-12 h-12 rounded-full bg-primary dark:bg-cyan-500 text-white dark:text-slate-900 flex items-center justify-center font-headline font-bold text-xl mb-6 mx-auto md:mx-0 neon-glow-primary">
                  01
                </div>
                <h4 className="font-bold font-headline text-lg mb-2 text-slate-900 dark:text-white">Nhập môn</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Xây dựng nền tảng tư duy lập trình và cú pháp cơ bản.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl border border-outline-variant dark:border-slate-700 hover:border-primary dark:hover:border-cyan-400 transition-colors z-10">
                <div className="w-12 h-12 rounded-full bg-primary dark:bg-cyan-500 text-white dark:text-slate-900 flex items-center justify-center font-headline font-bold text-xl mb-6 mx-auto md:mx-0 neon-glow-primary">
                  02
                </div>
                <h4 className="font-bold font-headline text-lg mb-2 text-slate-900 dark:text-white">Thực chiến</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Làm quen với cấu trúc dữ liệu và giải thuật nâng cao.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl border border-outline-variant dark:border-slate-700 hover:border-primary dark:hover:border-cyan-400 transition-colors z-10">
                <div className="w-12 h-12 rounded-full bg-primary dark:bg-cyan-500 text-white dark:text-slate-900 flex items-center justify-center font-headline font-bold text-xl mb-6 mx-auto md:mx-0 neon-glow-primary">
                  03
                </div>
                <h4 className="font-bold font-headline text-lg mb-2 text-slate-900 dark:text-white">Dự án</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Xây dựng ứng dụng hoàn chỉnh theo yêu cầu doanh nghiệp.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="relative bg-white dark:bg-slate-800 p-8 rounded-xl border border-outline-variant dark:border-slate-700 hover:border-secondary dark:hover:border-orange-400 transition-colors z-10">
                <div className="w-12 h-12 rounded-full bg-secondary dark:bg-orange-500 text-white flex items-center justify-center font-headline font-bold text-xl mb-6 mx-auto md:mx-0 neon-glow-secondary">
                  04
                </div>
                <h4 className="font-bold font-headline text-lg mb-2 text-slate-900 dark:text-white">Career Ready</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tối ưu CV, luyện phỏng vấn và kết nối việc làm.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 md:py-24 bg-surface-container-low dark:bg-slate-800/50 px-4 sm:px-6 md:px-8 overflow-hidden relative">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-secondary/5 dark:from-cyan-500/5 dark:via-transparent dark:to-orange-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl font-headline font-bold mb-16 text-slate-900 dark:text-white">
              Học viên nói về CodeFit
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <ScrollReveal delay={0.1}>
              <div className="glass-card dark:glass-card p-10 rounded-xl relative">
                <span className="material-symbols-outlined text-6xl text-primary/10 dark:text-cyan-500/10 absolute top-4 right-8">
                  format_quote
                </span>
                <div className="flex items-center gap-6 mb-8">
                  <img
                    className="w-16 h-16 rounded-full object-cover"
                    data-alt="portrait of a confident male software engineer in a modern setting with soft lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaaHuY8WFWZcBIJqSNI1W-1eg3XvrdCl8tEkkfXIKcwG36xOwOqONj8xDoj2hwBdOBWM_lbl2DJeAIKgaET0YcB5yEnHToZodVkdcwC3lC8obND5CvlZS9Hevs26WN6_2dA_S9uGDd47XXIh-fpOV9qPRC4RwcQvHSbpOZYEuI-9u4azB1-eKcqwOt5pr5O0DERTJJVo9HsIHdAnM1kI8xwV17pbApdk2hIw4wf0KA7m3WI7C0Zwg-xtRPPVX52rr7K4HUUiMe2E4"
                    alt="Hoàng Minh"
                  />
                  <div>
                    <h5 className="font-bold font-headline text-lg text-slate-900 dark:text-white">Hoàng Minh</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-headline uppercase tracking-widest">
                      Fullstack Developer @ VinTech
                    </p>
                  </div>
                </div>
                <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "CodeFit đã thay đổi hoàn toàn cách tôi học code. Không còn những
                  giờ lý thuyết nhàm chán, tôi được bắt tay ngay vào làm dự án thật
                  với sự hỗ trợ từ AI."
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="glass-card dark:glass-card p-10 rounded-xl relative">
                <span className="material-symbols-outlined text-6xl text-primary/10 dark:text-cyan-500/10 absolute top-4 right-8">
                  format_quote
                </span>
                <div className="flex items-center gap-6 mb-8">
                  <img
                    className="w-16 h-16 rounded-full object-cover"
                    data-alt="portrait of a young female tech professional with a warm smile in a brightly lit office"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDng9aK89nip1BoT8yABvYjMa07hwuajq7lcnsxuyc53qAXhLYRNMEypbJLEEVSvg5WJMONNxo4nfoirordXyOhfhvYXZrP2N1Dj1QWhihRrDAqSS_aN56s-EFmFRoQkpaiPA-FxOGBzh0smbmr_fFV4AElC5bU8C9bFIH5igWScqNhNDxaOYHtY6ojs1aPK_GFlr5mqnSlNwWgOnbEoe2CjqVignuwbDfAVSGeCI20JCQrafP2hTVueuiu6cMz_e3urDvJDVRkO-I"
                    alt="Linh Chi"
                  />
                  <div>
                    <h5 className="font-bold font-headline text-lg text-slate-900 dark:text-white">Linh Chi</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-headline uppercase tracking-widest">
                      Data Scientist @ FPT Software
                    </p>
                  </div>
                </div>
                <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "Hệ thống lộ trình cực kỳ bài bản. Chỉ sau 3 tháng luyện tập, tôi đã
                  tự tin ứng tuyển vào vị trí mơ ước của mình."
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-8 text-center bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Enhanced radial gradient pulse */}
        <div className="absolute inset-0 bg-primary/5 dark:bg-cyan-500/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-blob-pulse" />
        </div>
        <ScrollReveal>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-6 sm:mb-8 text-slate-900 dark:text-white">
              Sẵn sàng để trở thành <span className="text-primary dark:text-cyan-400">Pro?</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
              Gia nhập cộng đồng 10,000+ lập trình viên và bắt đầu hành trình của
              bạn ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-5 rounded-xl font-headline font-bold text-xl transition-all shadow-lg">
                Bắt đầu miễn phí
              </button>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=codefitedu@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-surface-container-low dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-10 py-5 rounded-xl font-headline font-bold text-xl hover:bg-surface-container dark:hover:bg-slate-700 transition-all"
              >
                Liên hệ tư vấn
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
};

export default LandingPage;
