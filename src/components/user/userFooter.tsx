import { Link } from 'react-router-dom';

const UserFooter = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 py-8 px-8 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <span className="text-lg font-headline font-bold text-[#0B3C5D] dark:text-white">CodeFit</span>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          © 2026 CodeFit. Làm chủ kỹ năng lập trình.
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/chinh-sach" className="text-slate-500 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white transition-colors">
            Chính sách
          </Link>
          <Link to="/dieu-khoan" className="text-slate-500 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white transition-colors">
            Điều khoản
          </Link>
          <Link to="/lien-he" className="text-slate-500 dark:text-slate-400 hover:text-[#0B3C5D] dark:hover:text-white transition-colors">
            Liên hệ
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
