import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { normalizeRole, type AppRole } from '@/utils/roleUtils';

interface User {
  id: string;
  email: string;
  username: string;
  role: AppRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialToken = (): string | null => {
  const stored = localStorage.getItem('token');
  if (stored && stored !== 'undefined' && stored.length > 20) {
    return stored;
  }
  return null;
};

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading, setIsLoading] = useState(!!getInitialToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !isLoggingIn) {
      authService.getMe()
        .then((res) => {
          if (res.success && res.data) {
            const rawUser = res.data as Record<string, unknown>;
            const normalizedUser: User = {
              ...(rawUser as unknown as User),
              role: normalizeRole((rawUser.roleName || rawUser.role) as string | undefined),
            };
            setUser(normalizedUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            if (res.statusCode === 401) {
              navigate('/error/401');
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          navigate('/error/401');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, navigate]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data && typeof res.data === 'object' && 'token' in res.data) {
        const { token: newToken } = res.data as { token: string; user: Record<string, unknown> };
        localStorage.setItem('token', newToken);
        setToken(newToken);
        if ('user' in res.data) {
          const rawUser = (res.data as { user: Record<string, unknown> }).user;
          const normalizedUser: User = {
            id: rawUser.id as string,
            email: rawUser.email as string,
            username: rawUser.username as string,
            role: normalizeRole((rawUser.roleName || rawUser.role) as string | undefined),
            createdAt: rawUser.createdAt as string,
          };
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch {
      return { success: false, message: 'Login failed' };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const res = await authService.register(email, username, password);
      if (res.success && res.data && typeof res.data === 'object' && 'token' in res.data) {
        const { token: newToken } = res.data as { token: string; user: Record<string, unknown> };
        localStorage.setItem('token', newToken);
        setToken(newToken);
        if ('user' in res.data) {
          const rawUser = (res.data as { user: Record<string, unknown> }).user;
          const normalizedUser: User = {
            id: rawUser.id as string,
            email: rawUser.email as string,
            username: rawUser.username as string,
            role: normalizeRole((rawUser.roleName || rawUser.role) as string | undefined),
            createdAt: rawUser.createdAt as string,
          };
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch {
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggingIn(false);
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken && currentToken !== 'undefined' && currentToken.length > 20) {
      const res = await authService.getMe();
      if (res.success && res.data) {
        const rawUser = res.data as Record<string, unknown>;
        const normalizedUser: User = {
          ...(rawUser as unknown as User),
          role: normalizeRole((rawUser.roleName || rawUser.role) as string | undefined),
        };
        setUser(normalizedUser);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
