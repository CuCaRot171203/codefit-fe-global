import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type AllowedRole = 'admin' | 'lecture' | 'user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
}

const roleRouteMap: Record<AllowedRole, string> = {
  admin: '/admin',
  lecture: '/lecture',
  user: '/user/dashboard',
};

/**
 * ProtectedRoute - Guard component that:
 * 1. Redirects to /error/401 if user is not logged in
 * 2. Redirects to /error/403 if user role is not in allowedRoles
 * 3. Redirects to role dashboard if user is already authenticated but on wrong role route
 *    (e.g., a "user" trying to access /lecture/* should go to /user/dashboard)
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] dark:bg-[#0d0f18]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/error/401"
        state={{ fromError: true, errorMessage: 'Vui lòng đăng nhập để truy cập trang này.' }}
        replace
      />
    );
  }

  const userRole = user.role || 'user';
  const normalizedRole = userRole === 'admin' || userRole === 'lecture' ? userRole : 'user';

  if (!allowedRoles.includes(normalizedRole as AllowedRole)) {
    const redirectPath = roleRouteMap[normalizedRole as AllowedRole] || '/';
    return (
      <Navigate
        to="/error/403"
        state={{
          fromError: true,
          errorMessage: `Bạn không có quyền truy cập trang này. Trang này dành cho vai trò: ${allowedRoles.join(', ')}.`,
          originalPath: location.pathname,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
