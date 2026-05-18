import { motion } from 'framer-motion';
import ScrollReveal from '@/components/shared/ScrollReveal';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const LoTrinhPage = () => {
  return (
    <main className="pt-0">
      {/* Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[716px] flex items-center overflow-hidden bg-surface dark:bg-slate-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed dark:bg-primary/20 text-on-primary-fixed-variant dark:text-cyan-300 rounded-full text-xs font-label uppercase tracking-widest">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Hệ sinh thái đào tạo số
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-headline font-bold leading-none tracking-tighter text-on-surface dark:text-white">
              Lộ trình<br />
              <span className="text-primary">Chuyên nghiệp</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-on-surface-variant dark:text-slate-400 max-w-lg font-body leading-relaxed">
              Chinh phục các kỹ năng công nghệ hàng đầu thông qua phương pháp đào tạo tinh gọn, tập trung vào tư duy kiến trúc và thực chiến dự án thực tế.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button className="bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-headline font-bold uppercase tracking-wide glow-button transition-all text-sm sm:text-base">
                Khám phá ngay
              </button>
              <button className="border border-outline-variant dark:border-slate-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-on-surface dark:text-slate-300 font-headline font-bold uppercase tracking-wide hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all text-sm sm:text-base">
                Tư vấn lộ trình
              </button>
            </motion.div>
          </motion.div>
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkp8t0CkV1AUkBBLY8fTpSYKsXFh06Jp-iFLH2bQcRlKRLnoYoCXRjw-lnUEmFgnq4MC7NFssBlwvReTabjU794GWtEdA3GhNkLA94Tr-103Yya3YGmkVwesh-4-sjuSSs1HnpVtmqXJ0FYeVzDtAYUEdOo_O0qBrd0IrcPvfCsylYHuIKssUaraIsg2_Mu5slRqDFfs5D2af8wGq_JVdDXnigHJL-V-TMOi3jzol03oQQjZI8GLOvxRV6GT9I5qMGaeYjhE9-TjA"
                  alt="High-tech developer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 glass-panel dark:bg-slate-800/80 p-4 sm:p-6 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container dark:bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container dark:text-cyan-400">terminal</span>
                  </div>
                  <div>
                    <div className="text-xs font-label text-outline dark:text-slate-500 uppercase">Active Sessions</div>
                    <div className="text-xl font-headline font-bold text-on-surface dark:text-white">1,284 Trình viên</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-primary-fixed/5 dark:bg-cyan-500/5 blur-3xl rounded-full"></div>
      </section>

      {/* Featured Programs Bento Grid */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <ScrollReveal>
          <div className="flex flex-col mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold tracking-tight uppercase mb-4 text-on-surface dark:text-white">
              Chương trình <span className="text-primary">Tiêu biểu</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary"></div>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          {/* Main Featured Card */}
          <ScrollReveal delay={0.1} className="md:col-span-8 group relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-surface-container-lowest dark:bg-slate-800 shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none">
            <div className="absolute top-0 right-0 p-4 sm:p-6 md:p-8 z-10">
              <span className="bg-secondary-container text-on-secondary-container px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-label uppercase font-bold tracking-widest">Hot Course</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <div className="relative h-48 sm:h-56 md:h-full overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM6y3uKGNIOrN-tlaNlsfWSYO76gRUlQ1d2exFnurH9s41mq_8fNLcpSZSKCAfvFp2S1_axgqEac6gSUl2rkAwiMCFaSuqmYRV7EGb-U--9jFybm46ljFf4Gv-b2pQr6hN3WkYU7WxAfTzR0wKTOJtBBlVoJILj_exerOBWFpUxvH9ka4ZxlSh404oZosy9rPvFU8YUfNu3sOlsl-23vd19wm8L_7Q28wKlLP1aJqRHm5zAzM00FP8-mpVvH02K_snsM-QEQKvF0A"
                  alt="Fullstack Web"
                />
              </div>
              <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-on-surface dark:text-white leading-tight">Fullstack Web Architecture</h3>
                  <p className="text-sm sm:text-base text-on-surface-variant dark:text-slate-400 font-body leading-relaxed">Xây dựng ứng dụng hiện đại với React, Node.js và kiến trúc Cloud. Tập trung vào khả năng mở rộng và hiệu năng cao.</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-label text-outline dark:text-slate-500 uppercase">Thời lượng</span>
                    <span className="text-sm sm:text-base font-headline font-bold text-on-surface dark:text-white">24 Tuần</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-label text-outline dark:text-slate-500 uppercase">Học viên</span>
                    <span className="text-sm sm:text-base font-headline font-bold text-on-surface dark:text-white">2.4k+</span>
                  </div>
                </div>
                <button className="w-full border-2 border-primary text-primary dark:text-cyan-400 py-2.5 sm:py-3 md:py-4 rounded-xl font-headline font-bold uppercase hover:bg-primary hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-900 transition-all text-xs sm:text-sm">
                  Chi tiết lộ trình
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Secondary Featured Card 1 - AI */}
          <ScrollReveal delay={0.15} className="md:col-span-4 group relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-surface-container-lowest dark:bg-slate-800 shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none flex flex-col">
            <div className="h-40 sm:h-48 overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFMQirCXhK5ERb3-5zOJIeeYdCQ_OZVE4C_Svdb0QcK6vSq3a1MazzddIvsnFLXd6jB6B6KCqNFVsxqrgP4sENtjmWMdlggHYXa00Mzzls4UXEiHQHduLgv-d51PjyqoKEfNjCBQt_Bj60regerxwQah1_QlPeJxFfQ_F3og42bXmgPbd4eIjwgRxhBx9tXmkhGuXeUrqIKQpfFze59xQ-YUsWnRdXBXe7Fd89N9fjrdUzwCUw308m-i5WbLH2BIuIc6cGchY9DNo"
                alt="AI & ML"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white">AI & Machine Learning</h3>
                <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Làm chủ các mô hình ngôn ngữ lớn, thị giác máy tính và xử lý dữ liệu quy mô lớn.</p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/15 dark:border-slate-700 flex justify-between items-center">
                <span className="text-primary dark:text-cyan-400 font-headline font-bold">Next-Gen</span>
                <span className="material-symbols-outlined text-primary dark:text-cyan-400">arrow_forward</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Secondary Featured Card 2 - Cybersecurity */}
          <ScrollReveal delay={0.2} className="md:col-span-4 group relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-surface-container-lowest dark:bg-slate-800 shadow-[0_20px_40px_rgba(0,104,117,0.08)] dark:shadow-none flex flex-col">
            <div className="h-40 sm:h-48 overflow-hidden">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9cGEf4VOwe-aTpFU9A3C7t16AV9uoMMf1OQcBltBr9o8nljOVTtTVoRxtpfWc0O6AcSPV2rBS9_krl_W-w-n5RgelaML8vqm34m1Kxx9q8MOsPuUb6BtafmfrHIVEA2orECGji3byfJrkocTRk4BLz8YzSIi-WCNo8DBWFIK1qmPkXVllPtCnLhH3iP7lZ_kUM_M00sK9Bv_2Ce-ne7aPTnbCLXMAMdE8v8Q5xdXD_n-s8HP6rZJjM54d0ovH3FB1Ku1QTyYX1jE"
                alt="Cybersecurity"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white">Cybersecurity Architect</h3>
                <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Thiết kế hệ thống phòng thủ, kiểm thử xâm nhập và bảo mật hạ tầng doanh nghiệp.</p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/15 dark:border-slate-700 flex justify-between items-center">
                <span className="text-primary dark:text-cyan-400 font-headline font-bold">Secure Tech</span>
                <span className="material-symbols-outlined text-primary dark:text-cyan-400">arrow_forward</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Grid Items */}
          <ScrollReveal delay={0.25} className="md:col-span-4 p-6 sm:p-8 rounded-2xl md:rounded-[2rem] bg-primary flex flex-col justify-center text-white">
            <span className="material-symbols-outlined text-3xl sm:text-4xl mb-3 sm:mb-4">verified</span>
            <h3 className="text-2xl font-headline font-bold mb-2">Chứng chỉ Quốc tế</h3>
            <p className="text-primary-fixed/80 text-sm font-body">Hoàn thành khóa học và nhận chứng chỉ được công nhận bởi các đối tác công nghệ toàn cầu.</p>
          </ScrollReveal>

          <ScrollReveal delay={0.3} className="md:col-span-4 p-6 sm:p-8 rounded-2xl md:rounded-[2rem] bg-surface-container-highest dark:bg-slate-700 flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl font-headline font-bold mb-2 text-on-surface dark:text-white">+15 Khóa học mới</h3>
            <p className="text-on-surface-variant dark:text-slate-400 text-sm font-body">Được cập nhật hàng tháng theo xu hướng công nghệ mới nhất của thung lũng Silicon.</p>
            <button className="mt-6 text-primary dark:text-cyan-400 font-headline font-bold text-sm uppercase flex items-center gap-2">
              Xem tất cả <span className="material-symbols-outlined text-sm">east</span>
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Learning Path Visualization */}
      <section className="py-16 sm:py-20 md:py-24 bg-surface-container-lowest dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold uppercase mb-4 text-on-surface dark:text-white">
                Lộ trình <span className="text-primary">Phát triển</span>
              </h2>
              <p className="text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto font-body">
                Hệ thống học tập theo từng giai đoạn, giúp bạn xây dựng nền tảng vững chắc đến khi đạt trình độ chuyên gia.
              </p>
            </div>
          </ScrollReveal>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent -translate-y-1/2 hidden lg:block"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 relative z-10">
              <ScrollReveal delay={0.05}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-primary-container dark:border-cyan-500/50 shadow-xl flex items-center justify-center font-headline font-black text-primary dark:text-cyan-400 text-xl">
                    01
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-lg uppercase text-on-surface dark:text-white">Core Foundation</h4>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Xây dựng tư duy thuật toán, cấu trúc dữ liệu và logic lập trình cơ bản.</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-primary-container dark:border-cyan-500/50 shadow-xl flex items-center justify-center font-headline font-black text-primary dark:text-cyan-400 text-xl">
                    02
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-lg uppercase text-on-surface dark:text-white">Specialization</h4>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Đi sâu vào chuyên môn hẹp: Frontend, Backend, AI hoặc Cloud Computing.</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-4 border-primary-container dark:border-cyan-500/50 shadow-xl flex items-center justify-center font-headline font-black text-primary dark:text-cyan-400 text-xl">
                    03
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-lg uppercase text-on-surface dark:text-white">Project Lab</h4>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Thực thi các dự án thực tế dưới sự hướng dẫn của các Mentor chuyên gia.</p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.35}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary border-4 border-primary-container dark:border-cyan-500/50 shadow-xl flex items-center justify-center font-headline font-black text-white text-xl">
                    04
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-headline font-bold text-lg uppercase text-primary dark:text-cyan-400">Mastery</h4>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400 font-body">Tốt nghiệp, nhận chứng chỉ và tham gia mạng lưới kết nối việc làm toàn cầu.</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-inverse-surface dark:bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1.4s' }}></div>
        </div>
        <ScrollReveal>
          <div className="max-w-5xl mx-auto rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-16 lg:p-20 text-center relative z-10">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white uppercase tracking-tight">
                Sẵn sàng kiến tạo tương lai số?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto font-body text-lg">
                Gia nhập cộng đồng 10,000+ lập trình viên đang thay đổi thế giới mỗi ngày tại CodeFit.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-primary-container dark:bg-cyan-500 text-on-primary-container dark:text-slate-900 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-headline font-black uppercase tracking-widest hover:scale-105 transition-transform text-sm sm:text-base">
                  Bắt đầu miễn phí
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
};

export default LoTrinhPage;
