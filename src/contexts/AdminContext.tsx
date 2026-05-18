import { createContext, useContext, useMemo } from 'react';
import { useAppSelector } from '@/store';

interface AdminContextType {
  isDark: boolean;
  sidebarCollapsed: boolean;
  user: any;
}

const AdminContext = createContext<AdminContextType>({
  isDark: false,
  sidebarCollapsed: true,
  user: null,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppSelector((state) => state.theme);
  const { sidebarCollapsed, user } = useAppSelector((state) => state.admin);

  const value = useMemo(() => ({
    isDark: theme === 'dark',
    sidebarCollapsed,
    user,
  }), [theme, sidebarCollapsed, user]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
