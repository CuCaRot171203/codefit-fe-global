import { createSlice } from '@reduxjs/toolkit';

/**
 * User interface
 */
export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: string;
  avatar?: string;
}

/**
 * Interface for admin state
 */
interface AdminState {
  sidebarCollapsed: boolean;
  user: AdminUser | null;
  adminTheme: 'light' | 'dark' | 'system';
}

const getInitialSidebarState = (): boolean => {
  // Mặc định sidebar sẽ đóng (collapsed = true)
  const stored = localStorage.getItem('adminSidebarCollapsed');
  if (stored !== null) {
    return stored === 'true';
  }
  return true; // Đóng sidebar khi khởi động
};

const getInitialUser = (): AdminUser | null => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AdminState = {
  sidebarCollapsed: getInitialSidebarState(),
  user: getInitialUser(),
  adminTheme: 'light',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload as boolean;
      localStorage.setItem('adminSidebarCollapsed', String(action.payload));
    },
    setUser: (state, action) => {
      state.user = action.payload as AdminUser | null;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...(action.payload as Partial<AdminUser>) };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
    setAdminTheme: (state, action) => {
      state.adminTheme = action.payload as 'light' | 'dark' | 'system';
      localStorage.setItem('adminTheme', action.payload as string);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setUser,
  updateUser,
  clearUser,
  setAdminTheme,
} = adminSlice.actions;

export default adminSlice.reducer;
