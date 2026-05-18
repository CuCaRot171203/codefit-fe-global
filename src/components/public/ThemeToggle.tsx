import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';

const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  /**
   * Hàm xử lý chuyển đổi chế độ theme  
   */
  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-300">
          dark_mode
        </span>
      ) : (
        <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-300">
          light_mode
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
