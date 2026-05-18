import { useEffect } from 'react';
import { useAppSelector } from '@/store';

const ThemeManager = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return null;
};

export default ThemeManager;
