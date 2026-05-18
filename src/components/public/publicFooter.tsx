const PublicFooter = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200/15 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 max-w-7xl mx-auto gap-6">
        <div className="text-center md:text-left">
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-headline mb-2">
            CodeFit
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-body text-xs sm:text-sm">
            © 2026 CodeFit. Làm chủ kỹ năng lập trình.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 font-body text-sm"
            href="#"
          >
            Chính sách bảo mật
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 font-body text-sm"
            href="#"
          >
            Trạng thái hệ thống
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 font-body text-sm"
            href="#"
          >
            Liên kết
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 font-body text-sm"
            href="#"
          >
            Hỗ trợ
          </a>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary dark:hover:text-cyan-400 transition-colors">
            language
          </span>
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary dark:hover:text-cyan-400 transition-colors">
            share
          </span>
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer hover:text-primary dark:hover:text-cyan-400 transition-colors">
            terminal
          </span>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
