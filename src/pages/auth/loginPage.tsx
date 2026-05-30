import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/images/LOGO_CODEFIT.png';
import { notification } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole, type AppRole } from '@/utils/roleUtils';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập địa chỉ email!',
      });
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notification.error({
        message: 'Lỗi',
        description: 'Địa chỉ email không hợp lệ!',
      });
      setIsLoading(false);
      return;
    }

    if (!password) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng nhập mật khẩu!',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await authLogin(email.trim(), password);

      if (result.success) {
        notification.success({
          message: 'Thành công',
          description: 'Đăng nhập thành công! Đang chuyển hướng...',
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
        const errorMsg = result.message || '';
        setEmail('');
        setPassword('');

        if (errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('credential')) {
          notification.error({
            message: 'Lỗi đăng nhập',
            description: 'Email hoặc mật khẩu không chính xác!',
          });
        } else {
          notification.error({
            message: 'Lỗi',
            description: errorMsg || 'Đăng nhập thất bại. Vui lòng thử lại!',
          });
        }
        setIsLoading(false);
      }
    } catch {
      setEmail('');
      setPassword('');
      setIsLoading(false);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!',
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-block">
          <div className="font-headline text-2xl font-bold text-primary dark:text-cyan-400 mb-2">
            <img src={Logo} alt="CodeFit Logo" className="h-9 w-auto" />
          </div>
        </Link>
        <h2 className="font-headline text-2xl font-bold text-foreground dark:text-white tracking-tight">
          Chào mừng quay trở lại
        </h2>
        <p className="text-muted-foreground dark:text-slate-400 font-body mt-1 text-sm">
          Tiếp tục hành trình lập trình của bạn.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
            Địa chỉ Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground dark:text-slate-300 uppercase tracking-wider">
              Mật khẩu
            </Label>
            <Link to="/quen-mat-khau" className="text-xs font-semibold text-primary dark:text-cyan-400 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 bg-muted border-transparent focus:border-input dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-border dark:border-slate-600"></div>
        <span className="absolute bg-background dark:bg-slate-800 px-3 text-xs font-medium text-muted-foreground dark:text-slate-500 italic">
          hoặc tiếp tục với
        </span>
      </div>

      {/* Google Login */}
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLoginButton />
        </GoogleOAuthProvider>
      ) : (
        <div className="text-center text-sm text-muted-foreground dark:text-slate-500">
          Đăng nhập Google đang được cấu hình. Vui lòng liên hệ quản trị viên.
        </div>
      )}

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="font-body text-sm text-muted-foreground dark:text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-primary dark:text-cyan-400 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
