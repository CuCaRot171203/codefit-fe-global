import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';

const ExamLayout = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      'min-h-screen',
      isDark ? 'bg-slate-900' : 'bg-surface'
    )}>
      <Outlet />
    </div>
  );
};

export default ExamLayout;
