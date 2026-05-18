import { createContext, useContext, useMemo } from 'react';
import { useAppSelector } from '@/store';

interface LectureContextType {
  isDark: boolean;
  sidebarCollapsed: boolean;
  user: any;
}

const LectureContext = createContext<LectureContextType>({
  isDark: false,
  sidebarCollapsed: false,
  user: null,
});

export function LectureProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppSelector((state) => state.theme);
  const { sidebarCollapsed, user } = useAppSelector((state) => state.admin);

  const value = useMemo(() => ({
    isDark: theme === 'dark',
    sidebarCollapsed,
    user,
  }), [theme, sidebarCollapsed, user]);

  return (
    <LectureContext.Provider value={value}>
      {children}
    </LectureContext.Provider>
  );
}

export function useLecture() {
  return useContext(LectureContext);
}
