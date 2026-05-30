import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole, type AppRole } from '@/utils/roleUtils';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const result = await loginWithGoogle(tokenResponse.access_token);

        if (result.success) {
          notification.success({
            message: 'Thành công',
            description: 'Đăng nhập Google thành công! Đang chuyển hướng...',
          });

          const storedUser = localStorage.getItem('user');
          const userRole: AppRole = storedUser
            ? normalizeRole((JSON.parse(storedUser) as { role?: string }).role || 'user')
            : 'user';

          setTimeout(() => {
            if (userRole === 'admin') {
              navigate('/admin/dashboard');
            } else if (userRole === 'lecture') {
              navigate('/lecture');
            } else {
              navigate('/user/dashboard');
            }
          }, 1500);
        } else {
          notification.error({
            message: 'Lỗi đăng nhập',
            description: result.message || 'Đăng nhập Google thất bại!',
          });
        }
      } catch {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại!',
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      notification.error({
        message: 'Lỗi đăng nhập',
        description: 'Đăng nhập Google thất bại. Vui lòng thử lại!',
      });
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => login()}
      disabled={isLoading}
      className="w-full h-11 text-sm font-semibold border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Đăng nhập với Google
    </Button>
  );
};

export default GoogleLoginButton;
